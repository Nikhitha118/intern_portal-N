import os
from dotenv import load_dotenv
load_dotenv()

try:
    from config.database import shared_db, client
except ImportError:
    import certifi
    from pymongo import MongoClient
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    kwargs = {"serverSelectionTimeoutMS": 5000, "connectTimeoutMS": 5000}
    if uri.startswith("mongodb+srv://") or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
        kwargs["tlsCAFile"] = certifi.where()
    client = MongoClient(uri, **kwargs)
    shared_db = client["shared_db"]

users = shared_db["users"]
messages = shared_db["messages"]

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
    user["_id"]=str(user["_id"]); user.pop("password",None); return user
