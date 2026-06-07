import os
import glob
import sqlite3
import torch
import pypdf
import re
import shutil
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

app = FastAPI(title="Murshid Academic Advisor API", version="5.0")

# Allow Frontend to communicate with this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to your frontend URL in production
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
    uploaded_file_name: Optional[str] = "None"
    uploaded_file_context: Optional[str] = None

class FAQRequest(BaseModel):
    question: str
    answer: str

# --- Intelligent Pre-Routing Catalog ---
DOCUMENT_CATALOG = {
    "AI_Study_Giude.csv": "AI Semester Guide...",
    "AI_Study_Plan_1.csv": "AI Detailed Master Plan...",
    "AI_Study_Plan_2.csv": "AI Master Plan Part 2...",
    "AI_Materials_Descriptions.csv": "AI Course Syllabus Overviews...",
    "CS_Study_Giude.csv": "CS Semester Guide...",
    "CS_Study_Plan_1.csv": "CS Detailed Master Plan...",
    "CS_Study_Plan_2.csv": "CS Master Plan Part 2...",
    "CS_Materials_Descriptions.csv": "CS Course Syllabus Overviews...",
    "SE_Study_Giude.csv": "Software Engineering (SE) Semester Guide...",
    "SE_Study_Plan_1.csv": "Software Engineering (SE) Detailed Master Plan...",
    "SE_Study_Plan_2.csv": "Software Engineering (SE) Master Plan Part 2...",
    "SE_Materials_Descriptions.csv": "Software Engineering (SE) Course Syllabus Overviews...",
    "AI_Summary_Facts.csv": "Quick FAQ and procedural rules specifically for the AI major.",
    "Rules_and_Regulations.pdf": "Official 2024-2025 Rules and Regulations...",
    "Student_Guide_2024_2025.pdf": "Official Student Guide...",
    "Faculty_Guide_3.pdf": "Faculty of Science & IT Guide...",
    "Unversity_Fees.csv": "Contains standard semester registration fees...",
    "Facility_Fees.csv": "Contains the exact credit hour price..."
}

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
    cursor.execute("SELECT COUNT(*) FROM faqs")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO faqs (question, answer) VALUES 
            ('Where is the IT department facility?', 'The IT facility is located on the main campus...'),
            ('How do I register for my graduation project?', 'You must complete 90+ credit hours...')
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
llm = OllamaLLM(model=MODEL_NAME, base_url="http://localhost:11434", num_ctx=32768)

analyze_intent_prompt = ChatPromptTemplate.from_template("""
You are a brilliant Academic Intent Analyzer Agent...
[INSERT YOUR FULL ANALYZE INTENT PROMPT HERE]
""")

router_prompt = ChatPromptTemplate.from_template("""
You are a precise Routing Agent...
[INSERT YOUR FULL ROUTER PROMPT HERE]
""")

qa_prompt = ChatPromptTemplate.from_template("""
أنت "مرشد"، المستشار الأكاديمي الذكي لجامعة الزيتونة الأردنية...
[INSERT YOUR FULL QA PROMPT HERE]
""")

def format_chat_history(messages: List[Message]):
    recent_messages = messages[-4:] if len(messages) > 4 else messages
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
        if not answer_part: return thinking_part, "عذراً، لم أتمكن من صياغة الإجابة النهائية بشكل صحيح."
        return thinking_part, answer_part
    arabic_start = text.find("أهلاً")
    if arabic_start == -1: arabic_start = text.find("مرحباً")
    if arabic_start != -1 and arabic_start > 10:  
        thinking_part = text[:arabic_start].strip()
        thinking_part = re.sub(r'^### THINKING|^<(?:think|thinking)>|^thinking\s*', '', thinking_part, flags=re.IGNORECASE).strip()
        return thinking_part, text[arabic_start:].strip()
    return None, text

# --- Routing Engine ---
def route_and_execute(query, chat_history_str, uploaded_file_name, threshold=0.15, uploaded_context=None):
    analyzer_chain = analyze_intent_prompt | llm | StrOutputParser()
    analyzed_query = analyzer_chain.invoke({"chat_history": chat_history_str, "uploaded_file_name": uploaded_file_name, "question": query}).strip()
    
    catalog_str = "\n".join([f"- {k}: {v}" for k, v in DOCUMENT_CATALOG.items()])
    router_chain = router_prompt | llm | StrOutputParser()
    target_file = router_chain.invoke({"catalog": catalog_str, "question": analyzed_query, "chat_history": chat_history_str}).strip().replace('"', '').replace("'", "")
    
    if "GREETING" in target_file.upper():
        return "مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.", "Chitchat Route", "None", ""

    faq_results = faq_store.similarity_search_with_score(analyzed_query, k=1)
    if faq_results and faq_results[0][1] < threshold:  
        return faq_results[0][0].metadata["answer"], "FAQ Match", "FAQ DB", ""

    combined_context = ""
    is_direct_csv = False

    if target_file.endswith('.csv') and target_file in DOCUMENT_CATALOG:
        csv_path = os.path.join(DATA_DIRECTORY, target_file)
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8') as f:
                combined_context = f.read()
            is_direct_csv = True

    if not is_direct_csv and pdf_store is not None:
        if target_file in DOCUMENT_CATALOG:
            exact_source_path = f"{DATA_DIRECTORY}{target_file}"
            pdf_retriever = pdf_store.as_retriever(search_kwargs={"k": 15, "filter": {"source": exact_source_path}})
        else:
            pdf_retriever = pdf_store.as_retriever(search_kwargs={"k": 15})
        docs = pdf_retriever.invoke(analyzed_query)
        if docs:
            combined_context = "\n\n---\n\n".join([doc.page_content for doc in docs[:6]])

    if "[FINANCIAL_QUERY: TRUE]" in analyzed_query:
        for fee_file in ["Unversity_Fees.csv", "Facility_Fees.csv"]:
            fee_path = os.path.join(DATA_DIRECTORY, fee_file)
            if os.path.exists(fee_path):
                with open(fee_path, 'r', encoding='utf-8') as fee_f:
                    combined_context += f"\n\n--- Data from {fee_file} ---\n" + fee_f.read()

    upload_section = f"بيانات المستند المرفق:\n{uploaded_context}\n\n" if uploaded_context else ""

    qa_chain = qa_prompt | llm | StrOutputParser()
    full_text = qa_chain.invoke({
        "upload_section": upload_section,
        "chat_history": chat_history_str, 
        "context": combined_context, 
        "question": analyzed_query 
    })
    
    thinking_process, final_ans = parse_thinking_blocks(full_text)
    return final_ans, target_file, "Processed", thinking_process

# --- API ENDPOINTS ---

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    chat_history_str = format_chat_history(request.chat_history)
    answer, route, src, thinking = route_and_execute(
        query=request.query, 
        chat_history_str=chat_history_str, 
        uploaded_file_name=request.uploaded_file_name,
        uploaded_context=request.uploaded_file_context
    )
    return {
        "answer": answer,
        "thinking_process": thinking,
        "debug_route": route
    }

@app.post("/upload_document")
async def upload_document(file: UploadFile = File(...)):
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
async def add_faq(faq: FAQRequest):
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