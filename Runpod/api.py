import os
import json
import glob
import sqlite3
import torch
import pypdf
import re
import shutil
import string
import threading
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from langchain_ollama import OllamaLLM
from langchain_community.document_loaders import PyPDFLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# --- Configuration ---
MODEL_NAME = "qwen3.6:35b-a3b-q8_0"  
DATA_DIRECTORY = '/workspace/data/'
DB_PATH = '/workspace/db/university.db'

# Ensure directories exist
os.makedirs(DATA_DIRECTORY, exist_ok=True)
os.makedirs('/workspace/db', exist_ok=True)

app = FastAPI(title="Murshid Academic Advisor API - V6", version="6.0")

# Allow Frontend to communicate with this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models (Pydantic) ---
class Message(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    query: str
    chat_history: List[Message] = []
    student_context: dict = {}
    db_faqs: List[dict] = []
    db_documents: List[dict] = []
    uploaded_file_name: Optional[str] = "None"
    uploaded_file_context: Optional[str] = None

class FAQRequest(BaseModel):
    question: str
    answer: str

# --- Database Initialization ---
def init_databases():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_databases()

# --- Initialize Knowledge Base ---
device = "cuda" if torch.cuda.is_available() else "cpu"
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2", model_kwargs={'device': device})

def load_documents(folder_path):
    documents = []
    for file_path in glob.glob(os.path.join(folder_path, "*.pdf")):
        try:
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        except Exception: pass
    for file_path in glob.glob(os.path.join(folder_path, "*.csv")):
        try:
            loader = CSVLoader(file_path, encoding='utf-8')
            documents.extend(loader.load())
        except Exception: pass
    return documents

def get_vectorstores():
    documents = load_documents(DATA_DIRECTORY)
    pdf_vectorstore = None
    if documents:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        pdf_vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory='/workspace/db/chroma_pdf')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT question, answer FROM faqs")
    faq_rows = cursor.fetchall()
    conn.close()
    
    faq_texts = [row[0] for row in faq_rows] if faq_rows else ["Dummy FAQ"]
    faq_metadatas = [{"answer": row[1]} for row in faq_rows] if faq_rows else [{"answer": "Dummy"}]
    faq_vectorstore = Chroma.from_texts(texts=faq_texts, embedding=embeddings, metadatas=faq_metadatas, persist_directory='/workspace/db/chroma_faq')
    
    return pdf_vectorstore, faq_vectorstore

pdf_store, faq_store = get_vectorstores()

# --- LLM and Prompts ---
llm_lock = threading.Lock()
llm = OllamaLLM(model=MODEL_NAME, base_url="http://localhost:11434", num_ctx=16384)

# 1. THE SUPERVISOR PROMPT
supervisor_prompt = ChatPromptTemplate.from_messages([
    ("system", """أنت المشرف الذكي (Supervisor) لـ "مرشد"، المستشار الأكاديمي لجامعة الزيتونة الأردنية.
مهمتك هي تحليل سؤال الطالب وتحديد الـ Use Case (حالة الاستخدام) بدقة تامة.

عليك تصنيف السؤال إلى واحدة من الفئات التالية:
1. [REGISTRATION]: إذا كان يسأل عن تسجيل المواد، الخطة الدراسية، جدول الفصل، أو تنزيل مواد.
2. [FINANCE]: إذا كان يسأل عن حساب الرسوم، سعر الساعة، أو تكلفة الفصل الدراسي.
3. [QA]: إذا كان يسأل عن قوانين الجامعة، التخصصات، الموقع، أو أسئلة عامة أخرى.

*** قاعدة التخصص التلقائي ***
قم باستخراج التخصص من (بيانات الطالب) المرفقة أدناه.
إذا كان التخصص موجوداً، يُمنع أن تسأله عنه. يجب أن ترد بالصيغة التالية تماماً:
[PROCEED: CATEGORY_NAME] [MAJOR: التخصص المستخرج]
(مثال: [PROCEED: REGISTRATION] [MAJOR: علم حاسوب])

أما إذا كان التخصص في البيانات هو "غير محدد"، ابحث عنه أولاً في (التاريخ السابق للمحادثة) أو في (سؤال الطالب). إذا سبق للطالب ذكره، فاستخدمه فوراً! وإذا لم تجده أبداً في أي مكان، فيجب عليك التوقف فوراً والرد حصراً بكلمة [CLARIFICATION_NEEDED] متبوعة بسؤال مهذب قصير تطلب فيه تحديد تخصصه.
إذا كانت الفئة [QA]، يمكنك الرد بـ: [PROCEED: QA] [MAJOR: NONE]"""),
    ("human", "بيانات الطالب:\n{student_context}\n\nالتاريخ السابق للمحادثة:\n{chat_history}\n\nسؤال الطالب الحالي:\n{question}")
])

MURSHID_SYSTEM_PROMPT = """أنت "مرشد"، المساعد الذكي الرسمي للإرشاد الأكاديمي بـ جامعة الزيتونة الأردنية.
مهمتك تمكين الطلاب من فهم السياسات الأكاديمية واتخاذ قرارات مدروسة.
تتحدث باللغة العربية الفصحى الواضحة والمهنية والداعمة.
لا تحل محل السجلات الرسمية، ولا تخمن معلومات غير موجودة في السياق.
إذا كانت المعلومة غير متوفرة، صرح بذلك بوضوح ووجه الطالب للقنوات الرسمية.
اختم إجابتك بخلاصة سريعة أو خطوات متابعة.

قاعدة ذهبية للخصوصية والإيجاز:
السياق (Context) المرفق لك يحتوي على بيانات الطالب الخاصة وجداول الجامعة. **يُمنع منعاً باتاً** تكرار هذه البيانات أو سرد وضع الطالب الأكاديمي (مثل المعدل، الساعات، أو الحضور) للمستخدم إلا إذا سأل الطالب عنها بصراحة. إذا كان السؤال مجرد تحية (مثل: كيف الحال)، فرد التحية بلطف واعرض المساعدة فوراً دون سرد أي بيانات أو سياق داخلي!"""

# 2. REGISTRATION EXPERT PROMPT
registration_prompt = ChatPromptTemplate.from_messages([
    ("system", MURSHID_SYSTEM_PROMPT + """

أنت الآن في مسار (التسجيل والخطط الدراسية). بناءً على السياق المرفق فقط، أجب عن استفسار التسجيل.
قواعد التنسيق (WOW Factor):
1. استخدم صيغة Markdown لإنشاء جداول احترافية للمواد المقترحة.
2. استخدم الإيموجي المناسبة الأكاديمية (📚، 🎯، 💡).
3. إذا لم تجد المادة في السياق، قل بوضوح "لا أملك بيانات عن هذه المادة".
4. قاعدة حاسمة جداً لأرقام المواد: يجب أن تتكون أرقام المواد دائماً من 7 أرقام (خانات). قم بتعديل الأرقام بصمت ولا تذكر هذه القاعدة للطالب أبداً.
5. قاعدة حاسمة للعبء الدراسي: الحد الأقصى للتسجيل هو (18 ساعة) في الفصل العادي، و(21 ساعة) للخريج. احسب المجموع سراً، واحذف المواد الزائدة لتطبيق الحد.
6. قاعدة العلوم العسكرية: تُسجل حصراً في "الفصل الدراسي الأخير".
7. الإيجاز المطلق: يُمنع منعاً باتاً شرح هذه القواعد (مثل قواعد الساعات، العلوم العسكرية، أو شروط المتطلبات) للطالب في إجابتك. قم بتطبيقها في صمت واعطِ الطالب الجدول النهائي المعتمد فقط لتجنب الإطالة المزعجة!"""),
    ("human", "السياق (Context):\n{context}\n\nالتاريخ السابق للمحادثة:\n{chat_history}\n\nسؤال الطالب:\n{question}")
])

# 3. FINANCE EXPERT PROMPT
finance_prompt = ChatPromptTemplate.from_messages([
    ("system", MURSHID_SYSTEM_PROMPT + """

أنت الآن في مسار (الشؤون المالية). قم بحساب التكاليف والرسوم بدقة متناهية بناءً على السياق المرفق فقط.
قواعد التنسيق (WOW Factor):
1. الإيجاز المطلق والصمت: أعطِ الطالب السعر النهائي فقط. يُمنع منعاً باتاً عرض أي خطوات حساب أو تفاصيل (مثل الخصم، أو سعر الساعة، أو الرسوم الفصلية) للمستخدم. الطالب يريد الرقم النهائي فقط!
2. استخدم الإيموجي المالي والأكاديمي.
3. لا تخمن أي أسعار غير موجودة في السياق.
4. قاعدة حاسمة للخصومات: الخصومات تُطبق فقط على "رسوم الساعات".
5. قاعدة التفكير المخفي: قم بجميع العمليات الحسابية داخل قسم <think> حتى لا يراها الطالب. بمجرد انتهائك من الحساب المخفي، اكتب سطر واحد فقط يحتوي على التكلفة النهائية.
6. العملة الرسمية والوحيدة هي (د.أ) أو الدينار الأردني. يمنع استخدام أي عملة أخرى."""),
    ("human", "السياق (Context):\n{context}\n\nالتاريخ السابق للمحادثة:\n{chat_history}\n\nسؤال الطالب:\n{question}")
])

# 4. QA EXPERT PROMPT
qa_prompt = ChatPromptTemplate.from_messages([
    ("system", MURSHID_SYSTEM_PROMPT + """

أنت الآن في مسار (الدليل الشامل والقوانين). أجب عن سؤال الطالب بناءً على السياق المرفق فقط.
قواعد التنسيق (WOW Factor):
1. استخدم النقاط المرتبة (Bullet points) لتسهيل القراءة.
2. أبرز الكلمات المفتاحية بالخط العريض (**Bold**).
3. إذا كانت الإجابة غير موجودة في السياق، قل نصاً: "عذراً، لم أجد إجابة دقيقة في دليل الطالب. يرجى مراجعة القبول والتسجيل." """),
    ("human", "السياق (Context):\n{context}\n\nالتاريخ السابق للمحادثة:\n{chat_history}\n\nسؤال الطالب:\n{question}")
])

def format_chat_history(messages: List[Message]):
    # Keep the last 20 messages instead of 6 to prevent the AI from forgetting the major in longer conversations
    recent_messages = messages[-20:] if len(messages) > 20 else messages
    history = ""
    for msg in recent_messages:
        role = "Student" if msg.role == "user" else "Advisor"
        history += f"{role}: {msg.content}\n"
    return history

def parse_thinking_blocks(text):
    if "### END THINKING" in text:
        parts = text.split("### END THINKING", 1)
        thinking_part = parts[0].replace("### THINKING", "").strip()
        answer_part = parts[1].strip()
        if not answer_part: return thinking_part, text
        return thinking_part, answer_part
    arabic_start = text.find("أهلاً")
    if arabic_start == -1: arabic_start = text.find("مرحباً")
    if arabic_start == -1: arabic_start = text.find("عذراً")
    if arabic_start != -1 and arabic_start > 10:  
        thinking_part = text[:arabic_start].strip()
        thinking_part = re.sub(r'^### THINKING|^<(?:think|thinking)>|^thinking\s*', '', thinking_part, flags=re.IGNORECASE).strip()
        return thinking_part, text[arabic_start:].strip()
    return None, text

def clean_arabic_query(query: str) -> str:
    stopwords = set([
        "أنا", "انا", "انت", "أنت", "هو", "هي", "نحن", "هم", "هن",
        "طالب", "طالبة", "طالبي", "طلاب",
        "في", "من", "على", "إلى", "الى", "عن", "ب", "ل", "ك", "مع",
        "ما", "ماذا", "متى", "أين", "كيف", "هل", "لماذا", "أي", "ايش", "شو", "مين", "ليش",
        "عندي", "لدي", "عندنا", "اريد", "أريد", "ابغى", "ودي", "بدي",
        "تخصص", "جامعة", "الزيتونة", "كلية", "قسم", "مادة", "مواد", "دكتور", "دكاترة",
        "سنة", "فصل", "دراسة", "دراسات", "هذا", "هذه", "هؤلاء", "ذلك", "تلك", "هيك",
        "ال", "يا", "بس", "ممكن", "لو", "سمحت", "اعمل", "أسوي", "عشان", "عشانها",
        "علم", "طالبة", "علمت", "عشان", "أنزل", "انزل"
    ])
    
    # Remove punctuation
    translator = str.maketrans('', '', string.punctuation + '؟،؛.')
    cleaned = query.translate(translator)
    
    words = cleaned.split()
    filtered_words = [w for w in words if w not in stopwords]
    
    # Fallback to original if stripping removes everything
    if not filtered_words:
        return query
        
    return " ".join(filtered_words)

# --- Routing Engine ---
def route_and_execute(query, chat_history_str, uploaded_file_name, student_context=None, threshold=0.25, uploaded_context=None, db_faqs=None, db_documents=None):
    cleaned_query = clean_arabic_query(query)
    
    # 0. REAL-TIME DB FAQ PRE-CHECK (Ultra-Fast Math Check)
    if db_faqs:
        q_words = set(cleaned_query.split())
        if q_words:
            best_match = None
            best_score = 0
            for faq in db_faqs:
                faq_q = clean_arabic_query(faq.get("q", ""))
                faq_q_words = set(faq_q.split())
                if not faq_q_words: continue
                intersection = q_words.intersection(faq_q_words)
                score = len(intersection) / max(len(q_words), len(faq_q_words))
                if score > best_score:
                    best_score = score
                    best_match = faq.get("a", "")
            if best_score > 0.4:  # High confidence threshold
                return best_match, "Real-Time FAQ Pipeline", "MySQL DB", None

    # 1. STATIC FAQ PRE-CHECK (Instant Response)
    faq_results = faq_store.similarity_search_with_score(cleaned_query, k=1)
    if faq_results and faq_results[0][1] < threshold:  
        return faq_results[0][0].metadata["answer"], "FAQ Pipeline", "FAQ DB", None

    # 2. RUN SUPERVISOR
    try:
        supervisor_chain = supervisor_prompt | llm | StrOutputParser()
        supervisor_output = supervisor_chain.invoke({
            "student_context": json.dumps(student_context, ensure_ascii=False) if student_context else "غير متوفر",
            "chat_history": chat_history_str, 
            "question": query
        }).strip()
    except Exception as e:
        return f"🚨 GPU Error during Supervisor Phase: {str(e)}", "Error", "None", None

    # 3. HANDLE CLARIFICATION (Zero Hallucination)
    if "[CLARIFICATION_NEEDED]" in supervisor_output:
        clarification_msg = supervisor_output.replace("[CLARIFICATION_NEEDED]", "").replace("### THINKING", "").strip()
        # Clean up any leftover thinking tags if the model outputs them
        _, final_msg = parse_thinking_blocks(clarification_msg)
        if not final_msg or final_msg == clarification_msg:
             # Just a fallback cleanup
             final_msg = re.sub(r'<think>.*?</think>', '', clarification_msg, flags=re.DOTALL).strip()
             if not final_msg: final_msg = clarification_msg
             
        return final_msg, "Clarification Pipeline", "None", None

    # 3.5 EXTRACT MAJOR AND INJECT
    major_match = re.search(r'\[MAJOR:\s*(.*?)\]', supervisor_output)
    if major_match:
        extracted_major = major_match.group(1).strip()
        if extracted_major.upper() != "NONE" and extracted_major:
            # Append major to ChromaDB semantic search
            cleaned_query += " " + extracted_major
            
            # Also manually inject the major into the student's live context (which is a dict)
            # so the Registration/Finance expert models don't hallucinate a different major!
            if student_context is None:
                student_context = {}
            elif isinstance(student_context, str):
                student_context = {"Context": student_context}
                
            student_context["التخصص_المستخرج_من_السياق"] = extracted_major

    # 4. FETCH CONTEXT BASED ON CATEGORY
    combined_context = ""
    target_prompt = qa_prompt # Default
    route_name = "QA Pipeline"
    
    if "[PROCEED: REGISTRATION]" in supervisor_output:
        target_prompt = registration_prompt
        route_name = "Registration Pipeline"
        # We fetch all CSV files roughly related to plans
        for f in glob.glob(os.path.join(DATA_DIRECTORY, "*Plan*.csv")) + glob.glob(os.path.join(DATA_DIRECTORY, "*Guide*.csv")):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    combined_context += f"\n--- {os.path.basename(f)} ---\n" + file.read()[:15000] # Increased back up to ensure full years are visible
            except: pass
            
    elif "[PROCEED: FINANCE]" in supervisor_output:
        target_prompt = finance_prompt
        route_name = "Finance Pipeline"
        for f in glob.glob(os.path.join(DATA_DIRECTORY, "*Fees*.csv")):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    combined_context += f"\n--- {os.path.basename(f)} ---\n" + file.read()[:6000]
            except: pass
            
    else: # QA or Default
        if pdf_store is not None:
            pdf_retriever = pdf_store.as_retriever(search_kwargs={"k": 8})
            docs = pdf_retriever.invoke(cleaned_query)
            if docs:
                combined_context = "\n\n---\n\n".join([doc.page_content for doc in docs])

    if uploaded_context:
         combined_context += f"\n\n--- بيانات الملف المرفق ---\n{uploaded_context}"

    # 5. INJECT DYNAMIC DOCUMENTS AND FAQS
    if db_documents:
        combined_context += "\n\n*** مستندات متاحة من المرشد ***\n"
        for doc in db_documents:
            combined_context += f"- عنوان المستند: {doc.get('title', 'بدون عنوان')} (القسم: {doc.get('category', 'عام')})\n"
        combined_context += "إذا سأل الطالب عن مستندات، أخبره أن المرشد رفع هذه المستندات أعلاه ويمكنه تصفحها.\n"
        
    if db_faqs:
        combined_context += "\n\n*** الأسئلة الشائعة والإجابات المعتمدة من المرشد ***\n"
        for faq in db_faqs:
            combined_context += f"سؤال: {faq.get('q', '')}\nإجابة: {faq.get('a', '')}\n\n"
        combined_context += "إذا كان سؤال الطالب يتعلق بأحد هذه الأسئلة الشائعة، التزم بالإجابة المعتمدة أعلاه نصاً دون تأليف.\n"

    if student_context:
         combined_context += f"\n\n--- بيانات الطالب الحالية ---\n{student_context}"

    # 5. EXECUTE EXPERT PROMPT
    expert_chain = target_prompt | llm | StrOutputParser()
    try:
        full_text = expert_chain.invoke({
            "context": combined_context,
            "chat_history": chat_history_str,
            "question": query 
        })
    except Exception as e:
        return f"🚨 GPU Error during Expert Phase: {str(e)}", "Error", "None", None
    
    thinking_process, final_ans = parse_thinking_blocks(full_text)
    
    # Clean up standard response if parse failed
    if not thinking_process and "<think>" in final_ans:
        final_ans = re.sub(r'<think>.*?</think>', '', final_ans, flags=re.DOTALL).strip()

    return final_ans, route_name, "Processed", thinking_process

# --- API ENDPOINTS ---

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    print("🔥 RECEIVED CHAT REQUEST from frontend!")
    chat_history_str = format_chat_history(request.chat_history)
    with llm_lock:
        answer, route, src, thinking = route_and_execute(
            query=request.query, 
            chat_history_str=chat_history_str, 
            uploaded_file_name=request.uploaded_file_name,
            uploaded_context=request.uploaded_file_context,
            student_context=request.student_context,
            db_faqs=request.db_faqs,
            db_documents=request.db_documents
        )
    return {
        "answer": answer,
        "thinking_process": thinking,
        "debug_route": route
    }

@app.post("/upload_document")
def upload_document(file: UploadFile = File(...)):
    """Uploads a PDF or CSV to /workspace/data/ and updates ChromaDB"""
    if not file.filename.endswith(('.pdf', '.csv')):
        raise HTTPException(status_code=400, detail="Only PDF and CSV files are allowed.")
    
    file_location = os.path.join(DATA_DIRECTORY, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update Vector Store dynamically
    global pdf_store
    if file.filename.endswith('.pdf'):
        loader = PyPDFLoader(file_location)
    else:
        loader = CSVLoader(file_location, encoding='utf-8')
        
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    if pdf_store is None:
        pdf_store = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory='/workspace/db/chroma_pdf')
    else:
        pdf_store.add_documents(splits)

    return {"message": f"Successfully uploaded {file.filename} and added to Knowledge Base."}

@app.post("/add_faq")
def add_faq(faq: FAQRequest):
    """Adds an FAQ to SQLite and updates the ChromaDB FAQ Store dynamically"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO faqs (question, answer) VALUES (?, ?)", (faq.question, faq.answer))
    conn.commit()
    conn.close()

    # Add to live vector store
    global faq_store
    faq_store.add_texts(texts=[faq.question], metadatas=[{"answer": faq.answer}])

    return {"message": "FAQ successfully added and synced with Semantic Search."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)