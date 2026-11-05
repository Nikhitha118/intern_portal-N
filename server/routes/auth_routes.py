from flask import Blueprint, request, jsonify
from models.user import users, create_user, serialize_user
from bson import ObjectId
import bcrypt
import jwt
import datetime
import os
import json

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = "internportal_secret_key_2025"

# =========================
# DEMO LOGIN (no password needed)
# =========================
@auth_bp.route("/demo-login", methods=["POST", "GET"])
def demo_login():
    """Auto-login as the demo user — used when accessing /dashboard directly."""
    DEMO_EMAIL = "demo@internportal.com"
    user = users.find_one({"email": DEMO_EMAIL})
    if not user:
        return jsonify({"error": "Demo user not found. Run seed_demo.py first."}), 404
    user_id = str(user["_id"])
    token = jwt.encode(
        {"user_id": user_id, "email": DEMO_EMAIL, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30)},
        SECRET_KEY, algorithm="HS256"
    )
    return jsonify({
        "message": "Demo login successful",
        "token": token,
        "user": {"id": user_id, "fullName": user.get("fullName","Arjun Sharma"), "email": DEMO_EMAIL, "role": user.get("role","intern"), "isDemo": True}
    })


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    full_name = data.get("fullName")
    email = data.get("email", "").strip().lower()
    password = data.get("password")
    role = data.get("role", "intern")

    if not full_name or not email or not password:
        return jsonify({"error": "fullName, email and password are required"}), 400

    existing = users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if existing:
        return jsonify({"error": "Email already registered. Please login."}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    new_user = create_user(full_name, email, hashed.decode("utf-8"), role)
    new_user["createdAt"] = datetime.datetime.utcnow().isoformat()

    result = users.insert_one(new_user)
    user_id = str(result.inserted_id)

    return jsonify({
        "message": "Registration successful. Please login.",
        "user": {
            "id": user_id,
            "fullName": full_name,
            "name": full_name,
            "email": email,
            "role": role,
            "photo": "/intern-avatar.jpg"
        }
    }), 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data: return jsonify({"error": "No data provided"}), 400
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Invalid credentials."}), 400
    # Find user (case-insensitive email)
    user = users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if not user:
        return jsonify({"error": "Invalid credentials."}), 401
    # Check password
    stored_pw = user.get("password", "")
    try:
        pw_match = bcrypt.checkpw(password.encode("utf-8"), stored_pw.encode("utf-8"))
    except Exception:
        pw_match = False
    if not pw_match:
        return jsonify({"error": "Invalid credentials."}), 401
    user_id = str(user["_id"])
    token = jwt.encode(
        {"user_id": user_id, "email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY, algorithm="HS256"
    )
    clean_full_name = (user.get("fullName") or user.get("name") or "").strip()
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user_id, "fullName": clean_full_name, "name": clean_full_name, "email": user.get("email",""), "role": user.get("role","intern"), "photo": user.get("photo", "/intern-avatar.jpg")}
    })


# =========================
# GET PROFILE
# =========================
@auth_bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    user_id = user_id.strip()  # remove \n or spaces
    user = None
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None

    if not user:
        # Fallback to local users_store.json
        try:
            store_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "users_store.json")
            if os.path.exists(store_file):
                with open(store_file, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    for u in store:
                        if str(u.get("_id")) == user_id or u.get("email") == user_id:
                            user = dict(u)
                            break
        except Exception:
            pass

    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user))


# =========================
# UPDATE PROFILE
# =========================
@auth_bp.route("/profile/<user_id>", methods=["PUT"])
def update_profile(user_id):
    user_id = user_id.strip()
    try: oid = ObjectId(user_id)
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    update_fields = {}
    for field in ["fullName","bio","skills","role","phone","internRole","assessment"]:
        if field in data:
            update_fields[field] = data[field]
    if not update_fields:
        return jsonify({"error":"No fields to update"}), 400
    users.update_one({"_id": oid}, {"$set": update_fields})
    return jsonify({"message": "Profile Updated Successfully"})


# =========================
# DELETE ACCOUNT
# =========================
@auth_bp.route("/profile/<user_id>", methods=["DELETE"])
def delete_account(user_id):
    user_id = user_id.strip()
    try: oid = ObjectId(user_id)
    except: return jsonify({"error": "Invalid ID"}), 400
    # Delete user and all their data
    from models.task import tasks
    from models.journal import journals
    from models.attendence import attendance
    from models.calender import events
    from models.setting import settings
    from models.message import messages
    tasks.delete_many({"userId": user_id})
    journals.delete_many({"userId": user_id})
    attendance.delete_many({"userId": user_id})
    events.delete_many({"userId": user_id})
    settings.delete_many({"userId": user_id})
    messages.delete_many({"$or": [{"senderId": user_id}, {"receiverId": user_id}]})
    users.delete_one({"_id": oid})
    return jsonify({"message": "Account and all data deleted successfully"})


# =========================
# CHANGE PASSWORD
# =========================
@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    data = request.json
    if not data: return jsonify({"error": "No data"}), 400
    user_id = data.get("userId", "").strip()
    current_pw = data.get("currentPassword", "")
    new_pw = data.get("newPassword", "")
    if not user_id or not current_pw or not new_pw:
        return jsonify({"error": "userId, currentPassword and newPassword required"}), 400
    try: oid = ObjectId(user_id)
    except: return jsonify({"error": "Invalid user ID"}), 400
    user = users.find_one({"_id": oid})
    if not user: return jsonify({"error": "User not found"}), 404
    if not bcrypt.checkpw(current_pw.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Current password is incorrect"}), 401
    if len(new_pw) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    hashed = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt())
    users.update_one({"_id": oid}, {"$set": {"password": hashed.decode("utf-8")}})
    return jsonify({"message": "Password changed successfully"})
