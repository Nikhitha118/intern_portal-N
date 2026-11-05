import jwt
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "internportal_secret_key_2025"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = data["user_id"]
            request.user_email = data.get("email", "")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated
