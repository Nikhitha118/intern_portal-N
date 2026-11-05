from flask import Blueprint, request, jsonify
from intern.models.ai import get_ai_response

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/chat", methods=["POST"])
def chat():
    message = request.json.get("message")
    reply = get_ai_response(message)
    return jsonify({"reply": reply})