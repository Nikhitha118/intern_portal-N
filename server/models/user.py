from config.database import shared_db
from bson import ObjectId

# Users stored in shared_db — accessible by all roles
users = shared_db["users"]

def create_user(full_name, email, password_hash, role="intern"):
    clean_name = (full_name or "").strip()
    return {
        "fullName": clean_name,
        "name": clean_name,
        "email": email.strip().lower(),
        "password": password_hash,
        "role": role,
        "bio": "",
        "skills": [],
        "phone": "",
        "createdAt": None
    }

def serialize_user(user):
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return user
