from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"), serverSelectionTimeoutMS=1000, connectTimeoutMS=1000)
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
