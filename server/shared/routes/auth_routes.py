from flask import Blueprint, request, jsonify
from shared.models.user import users, create_user, serialize_user
from bson import ObjectId
import bcrypt, jwt, datetime, os, json, re

auth_bp = Blueprint("shared_auth", __name__)
SECRET = os.getenv("SECRET_KEY", "internportal_secret_key_2025_secure_32bytes")

@auth_bp.route("/register", methods=["POST"])
def register():
    d = request.json or {}
    name = d.get("fullName","").strip()
    email = d.get("email","").strip().lower()
    pw = d.get("password","")
    role = d.get("role","intern").lower()
    if not name or not email or not pw:
        return jsonify({"error":"fullName, email and password required"}), 400
    if role not in ["intern","mentor","admin","institution","evaluator"]:
        return jsonify({"error":"Invalid role. Choose: intern, mentor, admin, institution, evaluator"}), 400
    if users.find_one({"email":{"$regex":f"^{re.escape(email)}$","$options":"i"}}):
        return jsonify({"error":"Email already registered. Please login."}), 409
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    new = create_user(name, email, hashed, role)
    new["createdAt"] = datetime.datetime.utcnow().isoformat()
    result = users.insert_one(new)
    uid = str(result.inserted_id)
    return jsonify({
        "message": "Registration successful. Please login.",
        "user": {
            "id": uid,
            "fullName": name,
            "name": name,
            "email": email,
            "role": role,
            "photo": "/intern-avatar.jpg"
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    d = request.json or {}
    email = d.get("email","").strip().lower()
    pw = d.get("password","")
    if not email or not pw:
        return jsonify({"error":"Invalid credentials."}), 400

    user = None
    try:
        user = users.find_one({
            "$or": [
                {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}},
                {"fullName": {"$regex": f"^{re.escape(email)}$", "$options": "i"}},
                {"name": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
            ]
        })
    except Exception:
        user = None

    if not user:
        return jsonify({"error": "Invalid credentials."}), 401

    stored_password = user.get("password", "")
    match = False
    try:
        match = bcrypt.checkpw(pw.encode(), stored_password.encode())
    except Exception:
        match = False

    if not match:
        return jsonify({"error": "Invalid credentials."}), 401

    uid = str(user["_id"])
    role = user.get("role", "intern")
    raw_name = (user.get("fullName") or user.get("name") or "").strip()
    user_email = user.get("email", email)

    token = jwt.encode(
        {"user_id": uid, "email": user_email, "role": role, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET,
        algorithm="HS256"
    )
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": uid,
            "fullName": raw_name,
            "name": raw_name,
            "email": user_email,
            "role": role,
            "photo": user.get("photo", "/intern-avatar.jpg")
        }
    })

@auth_bp.route("/demo-login", methods=["GET","POST"])
def demo_login():
    user = users.find_one({"email":"demo@internportal.com"})
    if not user:
        return jsonify({"error":"Demo user not found. Run seed_demo.py first."}), 404
    uid = str(user["_id"])
    token = jwt.encode({"user_id":uid,"email":"demo@internportal.com","role":"intern","exp":datetime.datetime.utcnow()+datetime.timedelta(days=30)}, SECRET, algorithm="HS256")
    return jsonify({"message":"Demo login","token":token,"user":{"id":uid,"fullName":user.get("fullName","Arjun Sharma"),"email":"demo@internportal.com","role":"intern","photo":user.get("photo","/intern-avatar.jpg"),"isDemo":True}})

@auth_bp.route("/profile/<uid>", methods=["GET"])
def get_profile(uid):
    uid = uid.strip()
    u = None
    try:
        oid = ObjectId(uid)
        u = users.find_one({"_id": oid})
    except Exception:
        u = None

    if not u:
        try:
            store_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "users_store.json")
            if os.path.exists(store_file):
                with open(store_file, "r", encoding="utf-8") as f:
                    store = json.load(f)
                    for user_item in store:
                        if str(user_item.get("_id")) == uid or user_item.get("email") == uid:
                            u = dict(user_item)
                            break
        except Exception:
            pass

    if not u:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize_user(u))

@auth_bp.route("/profile/<uid>", methods=["PUT"])
def update_profile(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["fullName","bio","skills","role","phone","internRole","assessment","photo"] if k in d}
    if not fields: return jsonify({"error":"No fields"}), 400
    users.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Profile updated"})

@auth_bp.route("/profile/<uid>", methods=["DELETE"])
def delete_account(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    users.delete_one({"_id":oid})
    return jsonify({"message":"Account deleted"})

@auth_bp.route("/change-password", methods=["POST"])
def change_password():
    d = request.json or {}
    uid = d.get("userId","").strip()
    cur = d.get("currentPassword","")
    new_pw = d.get("newPassword","")
    if not uid or not cur or not new_pw: return jsonify({"error":"Missing fields"}), 400
    try: oid = ObjectId(uid)
    except: return jsonify({"error":"Invalid ID"}), 400
    user = users.find_one({"_id":oid})
    if not user: return jsonify({"error":"Not found"}), 404
    if not bcrypt.checkpw(cur.encode(), user["password"].encode()):
        return jsonify({"error":"Current password incorrect"}), 401
    hashed = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    users.update_one({"_id":oid},{"$set":{"password":hashed}})
    return jsonify({"message":"Password changed"})

