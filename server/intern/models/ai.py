print("INTERN MODELS AI LOADED")
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def get_ai_response(message):
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the Internship Assistant for InternPortal. "
                        "Explain things in simple, student-friendly English organized into short numbered steps (1., 2., 3.) or bullet points. "
                        "Never write one long unbroken paragraph. Format code in clean markdown code blocks. "
                        "For tutorials, explain one step at a time (What to do, Where to do it, Expected result)."
                    )
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        )

        return completion.choices[0].message.content

    except Exception as e:
        print("GROQ ERROR:", e)
        return f"AI Error: {str(e)}"
