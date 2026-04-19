import os
import uuid
import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from sqlalchemy import create_engine
from typing import List, Optional, Dict

load_dotenv()

app = FastAPI(title="SmartStore AI Hub", description="LangGraph powered Text2SQL service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

DB_URL = (
    f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASSWORD', 'root')}@"
    f"{os.getenv('DB_HOST', 'localhost')}:3306/"
    f"{os.getenv('DB_NAME', 'smartstore_db')}"
)
engine = create_engine(DB_URL)

SESSION_TTL = 3600
sessions: Dict[str, dict] = {}


def get_or_create_session(session_id: Optional[str], user_id: int, role: str) -> dict:
    now = time.time()
    if session_id and session_id in sessions:
        s = sessions[session_id]
        s["last_active"] = now
        return s
    sid = session_id or str(uuid.uuid4())
    sessions[sid] = {
        "id": sid,
        "user_id": user_id,
        "role": role,
        "history": [],
        "created_at": now,
        "last_active": now,
    }
    return sessions[sid]


def cleanup_sessions():
    now = time.time()
    expired = [k for k, v in sessions.items() if now - v["last_active"] > SESSION_TTL]
    for k in expired:
        del sessions[k]


class ChatRequest(BaseModel):
    query: str
    user_id: int = 0
    role: str = "CONSUMER"
    history: List[str] = []
    session_id: Optional[str] = None


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SmartStore AI Service"}


from agents import ai_graph


@app.post("/api/v1/chatbot/query")
async def process_query(request: ChatRequest):
    cleanup_sessions()
    session = get_or_create_session(request.session_id, request.user_id, request.role)

    merged_history = session["history"] + request.history
    last_n = merged_history[-20:]

    try:
        initial_state = {
            "query": request.query,
            "history": last_n,
            "session_id": session["id"],
            "user_id": request.user_id,
            "user_role": request.role,
            "sql_query": "",
            "results": [],
            "response": "",
            "next_step": "",
            "is_in_scope": True,
            "iteration_count": 0,
            "visualization_code": "",
            "error": "",
        }

        final_state = ai_graph.invoke(initial_state)

        session["history"].append("User: " + request.query)
        session["history"].append("AI: " + final_state.get("response", ""))

        return {
            "success": True,
            "session_id": session["id"],
            "query": request.query,
            "response": final_state.get("response", ""),
            "sql": final_state.get("sql_query", ""),
            "data": final_state.get("results", []),
            "visualization": final_state.get("visualization_code", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/chatbot/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    s = sessions[session_id]
    return {
        "session_id": s["id"],
        "user_id": s["user_id"],
        "role": s["role"],
        "message_count": len(s["history"]) // 2,
        "created_at": s["created_at"],
        "last_active": s["last_active"],
    }


@app.delete("/api/v1/chatbot/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
