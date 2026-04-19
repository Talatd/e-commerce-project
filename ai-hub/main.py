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
from fastapi.responses import StreamingResponse
import json as json_module
import asyncio


def _build_initial_state(query, history, session_id, user_id, role):
    return {
        "query": query,
        "history": history,
        "session_id": session_id,
        "user_id": user_id,
        "user_role": role,
        "sql_query": "",
        "results": [],
        "response": "",
        "next_step": "",
        "is_in_scope": True,
        "iteration_count": 0,
        "visualization_code": "",
        "error": "",
    }


@app.post("/api/v1/chatbot/query")
async def process_query(request: ChatRequest):
    cleanup_sessions()
    session = get_or_create_session(request.session_id, request.user_id, request.role)

    merged_history = session["history"] + request.history
    last_n = merged_history[-20:]

    try:
        initial_state = _build_initial_state(
            request.query, last_n, session["id"], request.user_id, request.role
        )

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


@app.post("/api/v1/chatbot/query/stream")
async def process_query_stream(request: ChatRequest):
    """SSE streaming endpoint — sends agent progress events for transparency."""
    cleanup_sessions()
    session = get_or_create_session(request.session_id, request.user_id, request.role)
    merged_history = session["history"] + request.history
    last_n = merged_history[-20:]

    async def event_generator():
        try:
            initial_state = _build_initial_state(
                request.query, last_n, session["id"], request.user_id, request.role
            )

            step_names = {
                "guardrails": "Checking query scope...",
                "sql_writer": "Generating SQL query...",
                "sql_executor": "Executing database query...",
                "error_handler": "Fixing SQL error, retrying...",
                "responder": "Analyzing results...",
                "visualizer": "Generating visualization...",
            }

            yield f"data: {json_module.dumps({'type': 'step', 'step': 'start', 'message': 'Processing your question...'})}\n\n"
            await asyncio.sleep(0.05)

            current_state = initial_state
            for step_output in ai_graph.stream(initial_state):
                for node_name, node_state in step_output.items():
                    current_state.update(node_state)
                    msg = step_names.get(node_name, f"Running {node_name}...")
                    yield f"data: {json_module.dumps({'type': 'step', 'step': node_name, 'message': msg})}\n\n"
                    await asyncio.sleep(0.05)

            session["history"].append("User: " + request.query)
            session["history"].append("AI: " + current_state.get("response", ""))

            results_data = current_state.get("results", [])
            try:
                json_module.dumps(results_data)
            except (TypeError, ValueError):
                results_data = []

            final_payload = {
                "type": "final",
                "success": True,
                "session_id": session["id"],
                "query": request.query,
                "response": current_state.get("response", ""),
                "sql": current_state.get("sql_query", ""),
                "data": results_data,
                "visualization": current_state.get("visualization_code", ""),
            }
            yield f"data: {json_module.dumps(final_payload)}\n\n"

        except Exception as e:
            yield f"data: {json_module.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


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
