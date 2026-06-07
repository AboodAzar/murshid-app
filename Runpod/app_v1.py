import os
import glob
import sqlite3
import torch
import pypdf
import re
import streamlit as st
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

st.set_page_config(page_title="Murshid AI Advisor", layout="wide")

# --- 1. Intelligent Pre-Routing Catalog ---
DOCUMENT_CATALOG = {
    # AI Major
    "AI_Study_Giude.csv": "AI Semester Guide (الخطة الاسترشادية). USE THIS ONLY WHEN the user asks 'What courses should I register for in Year X, Semester Y?'. It shows the basic semester-by-semester roadmap.",
    "AI_Study_Plan_1.csv": "AI Detailed Master Plan (الخطة الدراسية). USE THIS for all needed information regarding the registering process and course details. It provides: year, semester, the name of the previous course (prerequisites), how many hours, the course name, the type of learning (online, blended, face-to-face), and the specific course category.",
    "AI_Study_Plan_2.csv": "AI Master Plan Part 2. USE THIS for extended information regarding the registering process, prerequisites, hours, learning types, and course categories for AI.",
    "AI_Materials_Descriptions.csv": "AI Course Syllabus Overviews. USE THIS when the user asks 'What is this course about?' or 'What will I learn in X?'.",
    
    # CS Major
    "CS_Study_Giude.csv": "CS Semester Guide (الخطة الاسترشادية). USE THIS ONLY WHEN the user asks 'What courses should I register for in Year X, Semester Y?'. It shows the basic semester-by-semester roadmap.",
    "CS_Study_Plan_1.csv": "CS Detailed Master Plan (الخطة الدراسية). USE THIS for all needed information regarding the registering process and course details. It provides: year, semester, the name of the previous course (prerequisites), how many hours, the course name, the type of learning (online, blended, face-to-face), and the specific course category.",
    "CS_Study_Plan_2.csv": "CS Master Plan Part 2. USE THIS for extended information regarding the registering process, prerequisites, hours, learning types, and course categories for CS.",
    "CS_Materials_Descriptions.csv": "CS Course Syllabus Overviews. USE THIS when the user asks 'What is this course about?' or 'What will I learn in X?'.",
    
    # SE Major (Software Engineering)
    "SE_Study_Giude.csv": "Software Engineering (SE) Semester Guide (الخطة الاسترشادية). USE THIS ONLY WHEN the user asks 'What courses should I register for in Year X, Semester Y?'. It shows the basic semester-by-semester roadmap.",
    "SE_Study_Plan_1.csv": "Software Engineering (SE) Detailed Master Plan (الخطة الدراسية). USE THIS for all needed information regarding the registering process and course details. It provides: year, semester, the name of the previous course (prerequisites), how many hours, the course name, the type of learning (online, blended, face-to-face), and the specific course category.",
    "SE_Study_Plan_2.csv": "Software Engineering (SE) Master Plan Part 2. USE THIS for extended information regarding the registering process, prerequisites, hours, learning types, and course categories for SE.",
    "SE_Materials_Descriptions.csv": "Software Engineering (SE) Course Syllabus Overviews. USE THIS when the user asks 'What is this course about?' or 'What will I learn in X?'.",
    
    # General Rules & FAQs
    "AI_Summary_Facts.csv": "Quick FAQ and procedural rules specifically for the AI major.",
    "Rules_and_Regulations.pdf": "Official 2024-2025 Rules and Regulations for Al-Zaytoonah University. USE THIS ONLY for overarching university policies, academic probation, grading systems, attendance rules, library clearance, and disciplinary regulations. NOT FOR COURSE SCHEDULES.",
    "Student_Guide_2024_2025.pdf": "Official Student Guide (دليل الطالب) 2024/2025. USE THIS for overarching university policies, admission criteria (أسس القبول), bridging (التجسير), medical insurance (التأمين الطبي), student clubs, discipline (تأديب الطلبة), and general academic regulations.",
    "Faculty_Guide_3.pdf": "Faculty of Science & IT Guide (دليل كلية العلوم وتكنولوجيا المعلومات) 2024/2025. USE THIS for information about IT majors (CS, SE, AI, Cybersecurity, Math), career paths, IT specific bridging rules, and IT faculty tuition fees.",
    "Unversity_Fees.csv": "Contains standard semester registration fees (رسوم التسجيل الفصلية) and other fixed university fees.",
    "Facility_Fees.csv": "Contains the exact credit hour price (سعر الساعة المعتمدة) for each specific major in the IT facility."
}

# --- 2. Database Initialization ---
def init_databases():
    if not os.path.exists('/workspace/db'):
        os.makedirs('/workspace/db')
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            ID TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            lastsignedin TEXT,
            role TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS active_learning (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_query TEXT NOT NULL,
            correct_document_source TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("SELECT COUNT(*) FROM faqs")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO faqs (question, answer) VALUES 
            ('Where is the IT department facility?', 'The IT facility is located on the main campus at Al-Zaytoonah University of Jordan, adjacent to the engineering building.'),
            ('How do I register for my graduation project?', 'You must complete 90+ credit hours and fill out form QF01/0407 at the IT registry office.'),
            ('ايش انزل اول فصل بالجامعة تخصص ذكاء اصطناعي؟', 'مواد الفصل الأول لتخصص الذكاء الاصطناعي عادة تشمل: تفاضل وتكامل (1)، إحصاء واحتمالات، مقدمة في تكنولوجيا المعلومات، ورياضيات متقطعة. يرجى الرجوع للخطة الاسترشادية للتأكد من أرقام المواد.')
        """)
        
    conn.commit()
    conn.close()

init_databases()

# --- 3. Load Core Data ---
@st.cache_resource
def initialize_knowledge_base(folder_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={'device': device}
    )
    
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        
    documents = []
    
    for file_path in glob.glob(os.path.join(folder_path, "*.pdf")):
        try:
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        except Exception as e:
            st.warning(f"Error loading {file_path}: {e}")

    for file_path in glob.glob(os.path.join(folder_path, "*.csv")):
        try:
            loader = CSVLoader(file_path, encoding='utf-8')
            documents.extend(loader.load())
        except Exception as e:
            st.warning(f"Error loading {file_path}: {e}")

    if not documents:
        st.warning(f"No PDFs or CSVs found in {folder_path}. Vector store will be empty.")
        pdf_vectorstore = None
    else:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        pdf_vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory='/workspace/db/chroma_pdf')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT question, answer FROM faqs")
    faq_rows = cursor.fetchall()
    conn.close()
    
    faq_texts = [row[0] for row in faq_rows]
    faq_metadatas = [{"answer": row[1]} for row in faq_rows]
    faq_vectorstore = Chroma.from_texts(texts=faq_texts, embedding=embeddings, metadatas=faq_metadatas, persist_directory='/workspace/db/chroma_faq')
    
    return pdf_vectorstore, faq_vectorstore

pdf_store, faq_store = initialize_knowledge_base(DATA_DIRECTORY)

# --- 4. Document Processing & Chat Format Helpers ---
def extract_text_from_upload(file_buffer, file_name):
    try:
        if file_name.lower().endswith('.pdf'):
            reader = pypdf.PdfReader(file_buffer)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        elif file_name.lower().endswith('.csv'):
            return file_buffer.getvalue().decode("utf-8")
        else:
            return "Unsupported file type."
    except Exception as e:
        return f"Error reading file: {str(e)}"

def format_chat_history(messages):
    recent_messages = messages[-4:] if len(messages) > 4 else messages
    history = ""
    for msg in recent_messages:
        role = "Student" if msg["role"] == "user" else "Advisor"
        content = msg["content"]
        history += f"{role}: {content}\n"
    return history

def parse_thinking_blocks(text):
    if "### END THINKING" in text:
        parts = text.split("### END THINKING", 1)
        thinking_part = parts[0].replace("### THINKING", "").strip()
        answer_part = parts[1].strip()
        
        if not answer_part:
            return thinking_part, "عذراً، لم أتمكن من صياغة الإجابة النهائية بشكل صحيح. يرجى إعادة صياغة السؤال."
            
        return thinking_part, answer_part

    arabic_start = text.find("أهلاً")
    if arabic_start == -1:
        arabic_start = text.find("مرحباً")
        
    if arabic_start != -1 and arabic_start > 10:  
        thinking_part = text[:arabic_start].strip()
        thinking_part = re.sub(r'^### THINKING|^<(?:think|thinking)>|^thinking\s*', '', thinking_part, flags=re.IGNORECASE).strip()
        answer_part = text[arabic_start:].strip()
        return thinking_part, answer_part

    return None, text

# --- 5. LLMs and Prompt Templates ---
llm = OllamaLLM(model=MODEL_NAME, base_url="http://localhost:11434", num_ctx=32768)

# AGENT 1: The Context & Intent Analyzer 
analyze_intent_prompt = ChatPromptTemplate.from_template("""
You are a brilliant Academic Intent Analyzer Agent.
Your job is to read the chat history, uploaded file info, and the user's latest ambiguous message, and convert it into a highly explicit, standalone logical command in Arabic.

CHAT HISTORY:
{chat_history}

UPLOADED FILE NAME: {uploaded_file_name}

LATEST USER MESSAGE: {question}

YOUR INSTRUCTIONS:
1. Identify the student's MAJOR, YEAR, and SEMESTER. If the user doesn't explicitly state their major, look at the UPLOADED FILE NAME.
2. MISSING INFO RULE: If the Year or Semester is NOT explicitly stated in the chat and cannot be inferred, append: "[MISSING_INFO: TRUE]"
3. EXPLICIT EXCLUSION RULE: Extract the exact names of any courses the user states they have already completed.
4. GRADUATION RULE: If the user states they are in their final semester or about to graduate, append: "[GRADUATING_SEMESTER: TRUE]"
5. FINANCIAL RULE: If the user asks about fees, prices, or costs, append: "[FINANCIAL_QUERY: TRUE]"
6. DETAIL RULE: If the user explicitly asks for credit hours or course numbers, append: "[DETAILS_REQUESTED: TRUE]"
7. Output ONLY the standalone command using this format:
"تخصص [Major]، السنة [Year]، الفصل [Semester]. **المواد المنجزة والممنوع اقتراحها:** [List completed courses]. يرجى اقتراح خطة. [Append tags if applicable]"

STANDALONE LOGICAL COMMAND:
""")

# AGENT 2: The Router
router_prompt = ChatPromptTemplate.from_template("""
You are a precise Routing Agent. Read the Analyzed Command below and select the single most relevant file from the catalog.

CATALOG OF DOCUMENTS:
{catalog}

ANALYZED COMMAND: {question}

CRITICAL RULES:
- MISSING MAJOR RULE: If the student's MAJOR is NOT explicitly stated in the command AND no uploaded file implies the major, YOU MUST reply strictly with "GREETING".
- If the command asks for a Semester Schedule, Credit Hours, Prerequisites, or Alternatives, YOU MUST ROUTE TO the major's "_Study_Plan_1.csv" (e.g., "SE_Study_Plan_1.csv" for Software Engineering).
- If the command is PURELY about money and fees, route to "Facility_Fees.csv" or "Unversity_Fees.csv".
- Only route to "_Study_Giude.csv" if the user explicitly asks for the "Guidance Plan" (الخطة الاسترشادية) by name.
- NEVER route course selection to Rules_and_Regulations.pdf, Student_Guide_2024_2025.pdf, or Faculty_Guide_3.pdf.
- If it is a greeting, reply "GREETING". If general chat, reply "GENERAL_CHAT".
- Reply strictly with the exact filename or keyword. No extra text.

RESPONSE:
""")

# AGENT 3: The Advanced Reasoning Advisor
qa_prompt = ChatPromptTemplate.from_template("""
أنت "مرشد"، المستشار الأكاديمي الذكي لجامعة الزيتونة الأردنية.

CRITICAL INSTRUCTIONS:
You MUST output your response in exactly two strictly separated sections. Do NOT use XML or HTML tags. 
STRICT EXCLUSION PROTOCOL: NEVER suggest courses the user has already completed.

### THINKING
1. Identify Major, Semester, and FORBIDDEN COMPLETED COURSES.
2. MISSING INFO CHECK (CRITICAL): Does the command contain [MISSING_INFO: TRUE]? If YES, skip steps 3-7. Do not extract courses. Move directly to the output and ask the user for their Year, Semester, and completed courses.
3. Extract the semester courses from the Context or the Upload Section. FILTER out the completed ones.
4. SPECIAL COURSE RULE (CRITICAL): The course "العلوم العسكرية" (Military Sciences) is STRICTLY reserved for the student's final graduating semester. If it appears in your extracted list, you MUST REMOVE IT from the schedule unless the command contains [GRADUATING_SEMESTER: TRUE].
5. LEGAL LIMITS (CRITICAL RULE): 
   - Non-Graduating Students: Maximum 18 credit hours per semester.
   - Graduating Students (has [GRADUATING_SEMESTER: TRUE]): Maximum 21 credit hours.
   - CALCULATE the total hours of your filtered list. If it exceeds the limit, you MUST TRIM the list down by removing university requirements or optional courses.
6. Substitutions: If you removed a completed course (or Military Sciences), find a forward-looking major requirement or a university elective to replace it, keeping the timeline logical.
7. Formatting Check: Does the command contain [DETAILS_REQUESTED: TRUE]? If NO, hide all credit hours and course numbers in the final output.
8. Financial Calculation: Does the command contain [FINANCIAL_QUERY: TRUE]? 
   - Scan the provided Context data for the exact 'Semester Fee' and the 'Credit Hour Rate' for the student's specific major.
   - Formula: Total = (Total_Hours * Hour_Rate * (1 - Discount)) + Semester_Fee
   - Calculate the exact total cost in your head. DO NOT show the formula or mathematical steps in the final output.
### END THINKING

[CONVERSATIONAL OUTPUT RULES - ARABIC]
- If [MISSING_INFO: TRUE]: Start with a friendly greeting and explicitly ask: "لكي أستطيع تجهيز خطتك بأفضل شكل وتجنب المواد التي درستها، هل يمكنك إخباري في أي سنة وأي فصل أنت الآن؟ وما هي المواد الأخرى التي أنهيتها؟". DO NOT output any courses.
- Otherwise, start with a very short, direct, and friendly greeting. DO NOT write long introductory paragraphs.
- DO NOT use large rigid tables or the old Visual Template. Use a simple, clean bulleted list for the schedule.
- Format: "- [اسم المادة] (المتطلب السابق: [اسم المتطلب أو 'لا يوجد'])". DO NOT include hours or numbers unless [DETAILS_REQUESTED: TRUE].
- If there are multiple choices for an elective or replacement, list 2 or 3 valid options and ASK the user: "أي من هذه المواد تفضل أن تسجل؟"
- If [FINANCIAL_QUERY: TRUE]: State ONLY the final calculated total directly. (e.g., "إجمالي تكلفة الفصل لـ 15 ساعة هي 1475 دينار."). Do NOT explain how you calculated it.
- If [FINANCIAL_QUERY: TRUE] and the user DID NOT provide a discount percentage, append this exact question immediately after the total: "هل لديك خصم جامعي؟ يرجى تزويدي بنسبة الخصم لأقوم بتعديل المجموع."
- Keep the tone highly supportive but concise. Ensure they finish on time without exceeding the legal 18-hour limit.

{upload_section}

سجل المحادثة:
{chat_history}

سياق البحث الدقيق المستخرج من قاعدة البيانات:
{context}

سؤال الطالب أو طلبه المحدد: 
{question}

الإجابة الذكية:
""")

def get_analyzed_intent(query, chat_history_str, uploaded_file_name):
    analyzer_chain = analyze_intent_prompt | llm | StrOutputParser()
    return analyzer_chain.invoke({
        "chat_history": chat_history_str, 
        "uploaded_file_name": uploaded_file_name, 
        "question": query
    }).strip()

def get_pre_routing_decision(analyzed_query, chat_history_str):
    catalog_str = "\n".join([f"- {k}: {v}" for k, v in DOCUMENT_CATALOG.items()])
    router_chain = router_prompt | llm | StrOutputParser()
    decision = router_chain.invoke({"catalog": catalog_str, "question": analyzed_query, "chat_history": chat_history_str})
    
    decision = decision.strip().replace('"', '').replace("'", "")
    if decision.endswith("."):
        decision = decision[:-1]
        
    return decision

def route_and_execute(query, chat_history_str, uploaded_file_name, doc_index=0, threshold=0.15, uploaded_context=None) -> tuple[str, str, str, dict, str]:
    debug_info = {"router_decision": "N/A", "standalone_query": "N/A", "is_escape_hatch": False, "chunks_used": 0, "sources": []}
    
    # 1. RUN INTENT ANALYZER FIRST
    analyzed_query = get_analyzed_intent(query, chat_history_str, uploaded_file_name)
    debug_info["standalone_query"] = analyzed_query
    
    # 2. RUN ROUTER
    target_file = get_pre_routing_decision(analyzed_query, chat_history_str)
    debug_info["router_decision"] = target_file

    if "GREETING" in target_file.upper():
        return "مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك (هندسة برمجيات، ذكاء اصطناعي، علم بيانات، أو علم حاسوب) وسنتك الدراسية لنبدأ التخطيط.", "Chitchat Route", "None", debug_info, ""

    if "GENERAL_CHAT" in target_file.upper():
        qa_chain = qa_prompt | llm | StrOutputParser()
        full_text = qa_chain.invoke({
            "upload_section": "",
            "chat_history": chat_history_str,
            "context": "", 
            "question": analyzed_query
        })
        thinking_process, final_ans = parse_thinking_blocks(full_text)
        return final_ans, "General Conversation Route", "None", debug_info, thinking_process

    # --- SEMANTIC REASONING FAQ MATCH ---
    faq_results = faq_store.similarity_search_with_score(analyzed_query, k=1)
    if faq_results:
        faq_doc, score = faq_results[0]
        if score < threshold:  
            return faq_doc.metadata["answer"], "FAQ Database Route (Semantic Match)", "FAQ Database", debug_info, ""
            
    if pdf_store is None:
         return "لم يتم تحميل ملفات PDF أو CSV.", "No Knowledge Data", "None", debug_info, ""

    # --- INTELLIGENT FALLBACK LOGIC ---
    is_direct_csv = False
    combined_context = ""
    src = "None"
    route_name = ""

    if doc_index > 0 and target_file.endswith('.csv'):
        if "Giude" in target_file:
            target_file = target_file.replace("Giude", "Plan_1")
        elif "Plan_1" in target_file:
            target_file = target_file.replace("Plan_1", "Giude")
            
        debug_info["is_escape_hatch"] = True
        route_name = f"Smart CSV Fallback ({target_file})"

    # --- DIRECT TABULAR BYPASS ---
    if target_file.endswith('.csv') and target_file in DOCUMENT_CATALOG:
        csv_path = os.path.join(DATA_DIRECTORY, target_file)
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8') as f:
                combined_context = f.read()
            src = csv_path
            if not route_name: 
                route_name = f"Direct Tabular Bypass ({target_file})"
            debug_info["chunks_used"] = "ALL_ROWS"
            debug_info["sources"] = [src]
            is_direct_csv = True

    # --- FALLBACK TO CHROMADB (For PDFs ONLY) ---
    if not is_direct_csv:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT correct_document_source FROM active_learning WHERE user_query = ?", (query,))
        learned_memory = cursor.fetchone()
        conn.close()

        if learned_memory and doc_index == 0:
            target_source = learned_memory[0]
            route_name = "Persistent Memory Route (Learned)"
            docs = pdf_store.similarity_search(analyzed_query, k=5, filter={"source": target_source})
        else:
            if target_file in DOCUMENT_CATALOG and doc_index == 0:
                exact_source_path = f"{DATA_DIRECTORY}{target_file}"
                pdf_retriever = pdf_store.as_retriever(search_kwargs={"k": 15, "filter": {"source": exact_source_path}})
                route_name = f"Metadata Dictionary Route ({target_file})"
            else:
                pdf_retriever = pdf_store.as_retriever(search_kwargs={"k": 15})
                route_name = "Global Search (Escape Hatch Triggered)" if doc_index > 0 else "Global Search (Fallback)"
                debug_info["is_escape_hatch"] = True if doc_index > 0 else False
                
            docs = pdf_retriever.invoke(analyzed_query)

        if not docs:
            return "لا توجد بيانات مطابقة في المستندات.", "Failed", "None", debug_info, ""

        chunk_batch_size = 6
        start_idx = doc_index * chunk_batch_size
        end_idx = start_idx + chunk_batch_size
        
        if start_idx >= len(docs):
            start_idx = 0
            end_idx = chunk_batch_size
            
        active_docs = docs[start_idx:end_idx]
        combined_context = "\n\n---\n\n".join([doc.page_content for doc in active_docs])
        src = active_docs[0].metadata.get('source', 'Unknown Document')
        
        debug_info["chunks_used"] = len(active_docs)
        debug_info["sources"] = [d.metadata.get('source', 'Unknown') for d in active_docs]

    # --- FINANCIAL CONTEXT INJECTION FAILSFE ---
    if "[FINANCIAL_QUERY: TRUE]" in analyzed_query:
        for fee_file in ["Unversity_Fees.csv", "Facility_Fees.csv"]:
            fee_path = os.path.join(DATA_DIRECTORY, fee_file)
            if os.path.exists(fee_path):
                with open(fee_path, 'r', encoding='utf-8') as fee_f:
                    combined_context += f"\n\n--- Data from {fee_file} ---\n" + fee_f.read()

    upload_section = ""
    if uploaded_context:
        upload_section = f"بيانات المستند المرفق من المستخدم:\n{uploaded_context}\n\n"

    qa_chain = qa_prompt | llm | StrOutputParser()
    full_text = qa_chain.invoke({
        "upload_section": upload_section,
        "chat_history": chat_history_str, 
        "context": combined_context, 
        "question": analyzed_query 
    })
    
    thinking_process, final_ans = parse_thinking_blocks(full_text)
        
    return final_ans, f"{route_name} | Query: {analyzed_query}", src, debug_info, thinking_process

# --- 6. User Interface ---
st.title("Murshid - Academic Advisor Engine v5.0")
st.caption("Al-Zaytoonah University of Jordan - Multi-Agent Architecture")

with st.sidebar:
    st.header("Document Context Panel")
    st.write("Upload any digital university form or document (e.g., QF01/0407) to help Murshid analyze it.")
    uploaded_file = st.file_uploader("Choose a file (PDF/CSV)", type=["pdf", "csv"])
    
    if uploaded_file:
        if "last_uploaded_name" not in st.session_state or st.session_state.last_uploaded_name != uploaded_file.name:
            st.session_state.last_uploaded_name = uploaded_file.name
            with st.spinner("Extracting structural text data..."):
                st.session_state.uploaded_text = extract_text_from_upload(uploaded_file, uploaded_file.name)
        st.success(f"Successfully processed: {uploaded_file.name}")
        with st.expander("View Extracted Text Strings"):
            st.text(st.session_state.uploaded_text[:1000] + "...")
    else:
        st.session_state.uploaded_text = None
        st.session_state.last_uploaded_name = None

if "messages" not in st.session_state:
    st.session_state.messages = []
if "pending_feedback" not in st.session_state:
    st.session_state.pending_feedback = False
if "current_attempt" not in st.session_state:
    st.session_state.current_attempt = 0

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        if msg["role"] == "assistant" and "thinking" in msg and msg["thinking"]:
            with st.expander("💭 Thought Process", expanded=False):
                st.markdown("```text\n" + str(msg["thinking"]) + "\n```")
        st.markdown(msg["content"])
        if "route" in msg and "source" in msg:
            st.caption(f"Execution Track: {msg['route']} | Source: {msg['source']}")

user_query = st.chat_input("اسأل مرشد عن خطتك الدراسية، حساب الساعات، أو أنظمة الجامعة...")

if user_query:
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)
        
    with st.chat_message("assistant"):
        with st.status("Thinking Process Active...", expanded=True) as status:
            st.write("Extracting chat history context...")
            uploaded_file_name = st.session_state.get("last_uploaded_name", "None")
            uploaded_ctx = st.session_state.get("uploaded_text", None)
            chat_history_str = format_chat_history(st.session_state.messages[:-1])
            
            st.write("Routing query to database segments...")
            ans, route, src, debug, thinking = route_and_execute(user_query, chat_history_str, uploaded_file_name, 0, uploaded_context=uploaded_ctx)
            
            status.update(label="Reasoning Complete", state="complete", expanded=False)
            
        if thinking:
            with st.expander("💭 Thought Process", expanded=True):
                st.markdown("```text\n" + str(thinking) + "\n```")
            
        st.markdown(ans)
        st.caption(f"Execution Track: {route} | Source: {src}")
            
    st.session_state.messages.append({
        "role": "assistant", 
        "content": ans, 
        "route": route, 
        "source": src,
        "debug": debug,
        "thinking": thinking
    })
    
    st.session_state.current_query = user_query
    st.session_state.current_attempt = 0
    st.session_state.current_response = ans
    st.session_state.current_route = route
    st.session_state.current_source = src
    st.session_state.current_debug = debug
    st.session_state.current_thinking = thinking
    
    if "Chitchat" not in route and "General Conversation" not in route:
        st.session_state.pending_feedback = True
    else:
        st.session_state.pending_feedback = False
        
    st.rerun()

if st.session_state.pending_feedback:
    st.write("---")
    st.write("**هل كانت هذه الإجابة دقيقة؟**")
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("👍 إجابة صحيحة (حفظ)"):
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("INSERT INTO active_learning (user_query, correct_document_source) VALUES (?, ?)", 
                           (st.session_state.current_query, st.session_state.current_source))
            conn.commit()
            conn.close()
            st.success("تم الحفظ في قاعدة البيانات الدائمة.")
            st.session_state.pending_feedback = False
            st.rerun()
            
    with col2:
        if st.button("👎 إجابة خاطئة (البحث في مستندات أخرى)"):
            st.session_state.current_attempt += 1
            with st.spinner("Activating Escape Hatch and searching globally..."):
                uploaded_file_name = st.session_state.get("last_uploaded_name", "None")
                uploaded_ctx = st.session_state.get("uploaded_text", None)
                chat_history_str = format_chat_history(st.session_state.messages[:-2])
                ans, route, src, debug, thinking = route_and_execute(st.session_state.current_query, chat_history_str, uploaded_file_name, st.session_state.current_attempt, uploaded_context=uploaded_ctx)
                
                st.session_state.messages[-1] = {
                    "role": "assistant", 
                    "content": ans, 
                    "route": route, 
                    "source": src,
                    "debug": debug,
                    "thinking": thinking
                }
                st.session_state.current_response = ans
                st.session_state.current_route = route
                st.session_state.current_source = src
                st.session_state.current_debug = debug
                st.session_state.current_thinking = thinking
            st.rerun()