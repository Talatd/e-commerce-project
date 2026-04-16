import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from sqlalchemy import create_all, create_engine, text
from typing import List, Dict, Any

load_dotenv()

app = FastAPI(title="SmartStore AI Hub", description="LangGraph powered Text2SQL service")

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Database connection
DB_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', 'root')}@{os.getenv('DB_HOST', 'localhost')}:3306/{os.getenv('DB_NAME', 'smartstore_db')}"
engine = create_engine(DB_URL)

class ChatRequest(BaseModel):
    query: str
    user_id: int
    role: str
    history: List[str] = []

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SmartStore AI Service"}

from agents import ai_graph

@app.post("/api/v1/chatbot/query")
async def process_query(request: ChatRequest):
    try:
        initial_state = {
            "query": request.query,
            "history": request.history,
            "user_id": request.user_id,
            "user_role": request.role,
            "sql_query": "",
            "results": [],
            "response": "",
            "next_step": ""
        }
        
        final_state = ai_graph.invoke(initial_state)
        
        return {
            "success": True,
            "query": request.query,
            "response": final_state["response"],
            "sql": final_state["sql_query"],
            "data": final_state["results"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
