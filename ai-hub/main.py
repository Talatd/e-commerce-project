import os
import uuid
import time
import threading
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import json as json_module
import traceback
from typing import List, Optional, Dict

from agents import ai_graph

load_dotenv()

app = FastAPI(title="SmartStore AI Hub", description="LangGraph powered Text2SQL service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_TTL = 3600
sessions: Dict[str, dict] = {}
session_lock = threading.Lock()

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

class ChatRequest(BaseModel):
    query: str
    user_id: int = 0
    role: str = "CONSUMER"
    history: List[str] = []
    session_id: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "healthy"}

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
    with session_lock:
        session = get_or_create_session(request.session_id, request.user_id, request.role)
        sid = session["id"]

    initial_state = _build_initial_state(
        request.query, session["history"], sid, request.user_id, request.role
    )

    try:
        final_state = await asyncio.to_thread(ai_graph.invoke, initial_state)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    with session_lock:
        if sid in sessions:
            sessions[sid]["history"].append(f"User: {request.query}")
            sessions[sid]["history"].append(f"AI: {final_state.get('response', '')}")

    return {
        "success": True,
        "session_id": sid,
        "query": request.query,
        "response": final_state.get("response", ""),
        "sql": final_state.get("sql_query", ""),
        "data": final_state.get("results", []),
        "visualization": final_state.get("visualization_code", ""),
    }

@app.post("/api/v1/chatbot/query/stream")
async def process_query_stream(request: ChatRequest):
    async def event_generator():
        with session_lock:
            session = get_or_create_session(request.session_id, request.user_id, request.role)
            sid = session["id"]

        initial_state = _build_initial_state(
            request.query, session["history"], sid, request.user_id, request.role
        )

        step_names = {
            "guardrails": "Checking scope...",
            "sql": "Generating SQL...",
            "execute": "Executing query...",
            "error": "Fixing error...",
            "analyze": "Analyzing results...",
            "visualize": "Visualizing...",
        }

        yield f"data: {json_module.dumps({'type': 'step', 'step': 'start', 'message': 'Thinking...'})}\n\n"

        try:
            # For simplicity in stream, we run invoke but could use .stream() for more granularity
            # Updating current_state as we go if we used .stream()
            final_state = await asyncio.to_thread(ai_graph.invoke, initial_state)
            
            # Since we modernized agents.py, the stream usage might need adjustment, 
            # for now we send a single completion event or use a simple loop if needed.
            
            payload = {
                "type": "final",
                "success": True,
                "session_id": sid,
                "query": request.query,
                "response": final_state.get("response", ""),
                "sql": final_state.get("sql_query", ""),
                "data": final_state.get("results", []),
                "visualization": final_state.get("visualization_code", ""),
            }
            yield f"data: {json_module.dumps(payload)}\n\n"
        except Exception as e:
            traceback.print_exc()
            yield f"data: {json_module.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
