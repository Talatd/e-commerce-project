"""
SmartStore AI - CrewAI Flask API Server
========================================
This Flask server exposes the CrewAI multi-agent system as REST API
endpoints that the Next.js frontend can consume.
"""

import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env.local from the parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

from crew import kickoff_crew

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


# ──────────────────────────────────────────────
#  Health Check
# ──────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "SmartStore CrewAI Backend",
        "agents": [
            "Product Analyst",
            "Marketing Strategist",
            "Customer Advisor"
        ]
    })


# ──────────────────────────────────────────────
#  CrewAI Kickoff Endpoint
# ──────────────────────────────────────────────
@app.route("/api/crew/kickoff", methods=["POST"])
def crew_kickoff():
    """
    Run a CrewAI task.

    Request body:
      - product_catalog: JSON array of products
      - customer_query:  (optional) customer question
      - task_type:       'all', 'analysis', 'marketing', or 'advice'
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        product_catalog = data.get("product_catalog", "[]")
        customer_query = data.get("customer_query", "")
        task_type = data.get("task_type", "all")

        # Validate task_type
        valid_types = ["all", "analysis", "marketing", "advice"]
        if task_type not in valid_types:
            return jsonify({
                "error": f"Invalid task_type. Must be one of: {valid_types}"
            }), 400

        # Convert product_catalog to string if it's a list/dict
        if isinstance(product_catalog, (list, dict)):
            product_catalog = json.dumps(product_catalog, indent=2)

        # Run the crew
        result = kickoff_crew(product_catalog, customer_query, task_type)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# ──────────────────────────────────────────────
#  Individual Agent Endpoints
# ──────────────────────────────────────────────
@app.route("/api/crew/analyze", methods=["POST"])
def analyze_catalog():
    """Run only the Product Analyst agent."""
    data = request.get_json() or {}
    catalog = data.get("product_catalog", "[]")
    if isinstance(catalog, (list, dict)):
        catalog = json.dumps(catalog, indent=2)

    result = kickoff_crew(catalog, task_type="analysis")
    return jsonify(result)


@app.route("/api/crew/marketing", methods=["POST"])
def generate_marketing():
    """Run only the Marketing Strategist agent."""
    data = request.get_json() or {}
    catalog = data.get("product_catalog", "[]")
    if isinstance(catalog, (list, dict)):
        catalog = json.dumps(catalog, indent=2)

    result = kickoff_crew(catalog, task_type="marketing")
    return jsonify(result)


@app.route("/api/crew/advise", methods=["POST"])
def shopping_advice():
    """Run only the Customer Advisor agent."""
    data = request.get_json() or {}
    catalog = data.get("product_catalog", "[]")
    query = data.get("customer_query", "What are the best products?")
    if isinstance(catalog, (list, dict)):
        catalog = json.dumps(catalog, indent=2)

    result = kickoff_crew(catalog, query, task_type="advice")
    return jsonify(result)


# ──────────────────────────────────────────────
#  Run Server
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("CREW_PORT", 5000))
    print(f"\n{'='*50}")
    print(f"  SmartStore CrewAI Backend")
    print(f"  Running on http://localhost:{port}")
    print(f"  Endpoints:")
    print(f"    GET  /api/health         - Health check")
    print(f"    POST /api/crew/kickoff   - Run all agents")
    print(f"    POST /api/crew/analyze   - Product analysis")
    print(f"    POST /api/crew/marketing - Marketing content")
    print(f"    POST /api/crew/advise    - Shopping advice")
    print(f"{'='*50}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
