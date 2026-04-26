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
from typing import List, Optional, Dict, Any

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
    # Provided by the backend so the AI hub can enforce store-scoped access.
    session_store_id: Optional[int] = None

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

def _guardrail_block(
    *,
    sid: str,
    query: str,
    detection_type: str,
    guardrail: str,
    session_store_id: Optional[int],
    requested_store_id: Optional[int] = None,
    message: str,
):
    return {
        "success": False,
        "blocked": True,
        "session_id": sid,
        "query": query,
        "response": message,
        "detection_type": detection_type,
        "guardrail": guardrail,
        "session_store_id": session_store_id,
        "requested_store_id": requested_store_id,
        "sql": "",
        "data": [],
        "visualization": "",
    }

def _extract_store_id_from_query(q: str) -> Optional[int]:
    # Matches: "store 2055", "store #2055", "Store#2055", "mağaza 2055", "mağaza #2055"
    import re
    m = re.search(r"(?:store|mağaza)\s*#?\s*(\d{1,9})", q, re.IGNORECASE)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None

def _looks_like_prompt_injection(q: str) -> Optional[str]:
    import re
    patterns = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"disregard\s+(all\s+)?previous",
        r"you\s+are\s+now\s+in\s+admin\s+mode",
        r"admin\s+mode",
        r"developer\s+mode",
        r"system\s+prompt",
        r"reveal\s+(your\s+)?instructions",
        r"bypass\s+(security|filters|restrictions)",
        r"jailbreak",
        r"without\s+any\s+where\s+clause",
    ]
    for p in patterns:
        if re.search(p, q, re.IGNORECASE):
            return p
    return None

def _looks_like_filter_bypass(q: str) -> bool:
    import re
    patterns = [
        r"remove\s+store[_-]?id",
        r"drop\s+store[_-]?id",
        r"store[_-]?id\s+filt(resini|resmi)\s+kald[ıi]r",
        r"where\s+clause\s+.*(remove|omit)",
        r"show\s+all\s+stores",
        r"t[üu]m\s+ma[ğg]azalar[ıi]",
    ]
    return any(re.search(p, q, re.IGNORECASE) for p in patterns)

def _demo_response_for(query: str, session_store_id: Optional[int]):
    q = (query or "").strip().lower()
    store_label = f"#{session_store_id}" if session_store_id is not None else "your store"

    if "top" in q and ("sell" in q or "selling" in q) and ("product" in q or "ürün" in q):
        return {
            "response": f"Demo mode: Here are the top 5 selling products for {store_label} (sample data).",
            "sql_query": f"SELECT p.name, SUM(oi.quantity) AS total_qty FROM order_items oi JOIN orders o ON o.order_id=oi.order_id JOIN products p ON p.product_id=oi.product_id WHERE o.store_id={session_store_id or 0} GROUP BY p.name ORDER BY total_qty DESC LIMIT 5;",
            "results": [],
            "visualization_code": "",
        }

    if "stock" in q or "stok" in q:
        return {
            "response": f"Demo mode: Products with low stock in {store_label} (sample).",
            "sql_query": f"SELECT name, stock_quantity FROM products WHERE stock_quantity < 10;",
            "results": [],
            "visualization_code": "",
        }

    return {
        "response": f"Demo mode: I can answer store-scoped analytics questions for {store_label}. Try: “Top 5 selling products this month”.",
        "sql_query": "",
        "results": [],
        "visualization_code": "",
    }

def _looks_like_top_products(q: str) -> bool:
    ql = (q or "").lower()
    return ("top" in ql or "en çok" in ql or "top 5" in ql) and (
        "product" in ql or "ürün" in ql
    ) and (
        "sell" in ql or "selling" in ql or "sat" in ql
    )

def _no_data_summary(query: str, session_store_id: Optional[int]) -> str:
    store_label = f"store #{session_store_id}" if session_store_id is not None else "your store"
    ql = (query or "").lower()
    if "this month" in ql or "bu ay" in ql:
        period = "this month"
    elif "last month" in ql or "geçen ay" in ql:
        period = "last month"
    else:
        period = "the selected period"

    if _looks_like_top_products(query):
        return (
            f"No sales were found for {store_label} in {period}. "
            f"Top 5 selling products: none (0 orders). "
            f"Try widening the range (e.g., “last 90 days”) or create a test order."
        )
    return (
        f"No matching rows were found for {store_label} in {period}. "
        f"Try widening the range (e.g., “last 90 days”) or verify there are orders in the database."
    )

@app.post("/api/v1/chatbot/query")
async def process_query(request: ChatRequest):
    with session_lock:
        session = get_or_create_session(request.session_id, request.user_id, request.role)
        sid = session["id"]

    # --- Lightweight guardrails (no external model call) ---
    q = (request.query or "").strip()
    trigger = _looks_like_prompt_injection(q)
    if trigger:
        return _guardrail_block(
            sid=sid,
            query=request.query,
            detection_type="prompt_injection",
            guardrail="PROMPT_INJECTION",
            session_store_id=request.session_store_id,
            message="This request has been blocked due to a prompt-injection attempt. Please ask a store-scoped analytics question for your own store.",
        )

    if _looks_like_filter_bypass(q):
        return _guardrail_block(
            sid=sid,
            query=request.query,
            detection_type="filter_bypass_attempt",
            guardrail="FILTER_BYPASS",
            session_store_id=request.session_store_id,
            message="This request has been blocked because it attempts to bypass mandatory store scoping. Please query only your own store.",
        )

    requested_store_id = _extract_store_id_from_query(q)
    if (
        request.session_store_id is not None
        and requested_store_id is not None
        and requested_store_id != request.session_store_id
    ):
        return _guardrail_block(
            sid=sid,
            query=request.query,
            detection_type="cross_store_data_access",
            guardrail="CROSS_STORE",
            session_store_id=request.session_store_id,
            requested_store_id=requested_store_id,
            message=f"Cross-store access is not allowed. You can only query your own store (#{request.session_store_id}).",
        )

    initial_state = _build_initial_state(
        request.query, session["history"], sid, request.user_id, request.role
    )

    try:
        final_state = await asyncio.to_thread(ai_graph.invoke, initial_state)
    except Exception as e:
        # Fallback for demos / quota issues: return deterministic demo response.
        traceback.print_exc()
        final_state = _demo_response_for(request.query, request.session_store_id)

    # If SQL executed but returned no rows, answer deterministically instead of vague text.
    try:
        results = final_state.get("results", []) if isinstance(final_state, dict) else []
        sql_q = final_state.get("sql_query", "") if isinstance(final_state, dict) else ""
        if sql_q and isinstance(results, list) and len(results) == 0:
            final_state["response"] = _no_data_summary(request.query, request.session_store_id)
    except Exception:
        pass

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

        step_messages = {
            "guardrails": "Checking scope...",
            "sql": "Generating SQL...",
            "execute": "Executing query...",
            "error": "Fixing error...",
            "analyze": "Analyzing results...",
            "visualize": "Visualizing...",
        }

        def _sse(payload: Dict[str, Any]) -> str:
            return f"data: {json_module.dumps(payload)}\n\n"

        def _merge_state(current: Dict[str, Any], update: Any) -> Dict[str, Any]:
            if isinstance(update, dict):
                merged = dict(current)
                merged.update(update)
                return merged
            return current

        yield _sse({"type": "step", "step": "start", "message": "Thinking...", "ts": int(time.time() * 1000)})

        loop = asyncio.get_running_loop()
        q: asyncio.Queue = asyncio.Queue()
        stop_sentinel = object()

        def _stream_runner():
            current_state: Dict[str, Any] = dict(initial_state)
            last_step: Optional[str] = None
            try:
                if hasattr(ai_graph, "stream"):
                    for event in ai_graph.stream(initial_state):
                        # event shape (langgraph 0.0.x): {"node_name": <partial_state_or_full_state>}
                        if isinstance(event, dict) and len(event) > 0:
                            node = next(iter(event.keys()))
                            payload = event.get(node)
                            if node != last_step:
                                last_step = node
                                asyncio.run_coroutine_threadsafe(
                                    q.put(
                                        {"kind": "step", "step": node, "message": step_messages.get(node, "Working...")}
                                    ),
                                    loop,
                                )
                            if isinstance(payload, dict):
                                current_state = _merge_state(current_state, payload)
                    asyncio.run_coroutine_threadsafe(q.put({"kind": "final", "state": current_state}), loop)
                else:
                    # Fallback: no stream support
                    final_state = ai_graph.invoke(initial_state)
                    if isinstance(final_state, dict):
                        current_state = _merge_state(current_state, final_state)
                    asyncio.run_coroutine_threadsafe(q.put({"kind": "final", "state": current_state}), loop)
            except Exception as e:
                traceback.print_exc()
                asyncio.run_coroutine_threadsafe(q.put({"kind": "error", "message": str(e)}), loop)
            finally:
                asyncio.run_coroutine_threadsafe(q.put(stop_sentinel), loop)

        # Start streaming in background thread (keeps async generator responsive)
        threading.Thread(target=_stream_runner, daemon=True).start()

        while True:
            item = await q.get()
            if item is stop_sentinel:
                break

            if isinstance(item, dict) and item.get("kind") == "step":
                step = item.get("step") or "step"
                yield _sse({"type": "step", "step": step, "message": item.get("message", ""), "ts": int(time.time() * 1000)})
                continue

            if isinstance(item, dict) and item.get("kind") == "error":
                yield _sse({"type": "error", "message": item.get("message", "Unknown error")})
                continue

            if isinstance(item, dict) and item.get("kind") == "final":
                final_state = item.get("state") if isinstance(item.get("state"), dict) else {}
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
                yield _sse(payload)
                continue

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
