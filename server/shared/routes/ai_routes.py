from flask import Blueprint, request, jsonify
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json or {}
        message = data.get("message", "").strip()

        if not message:
            return jsonify({
                "error": "Message is required"
            }), 400

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            return jsonify({
                "reply": None,
                "note": "GROQ_API_KEY not configured in .env"
            }), 200

        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
           model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the Internship Assistant for the InternPortal application. "
                        "Explain things in simple, student-friendly English organized into short numbered steps (1., 2., 3.) or bullet points. "
                        "Never write one long unbroken paragraph. Format all code in proper markdown code blocks with language tags. "
                        "For tutorials or interactive coding questions, give ONLY ONE clear step at a time: "
                        "1) What to do, 2) Where to do it, and 3) Expected result, then ask the student to confirm before moving to the next step. "
                        "Help with performance, tasks, deadlines, attendance, journals, and full-stack engineering."
                    )
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7,
            max_tokens=1024
        )

        return jsonify({
            "reply": completion.choices[0].message.content
        })

    except Exception as e:
        print("GROQ ERROR:", str(e))

        return jsonify({
            "reply": f"GROQ ERROR: {str(e)}"
        }), 500