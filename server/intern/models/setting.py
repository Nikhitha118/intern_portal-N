from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]
settings = intern_db["intern_settings"]

def create_settings(user_id):
    return {"userId":user_id,"emailNotifications":True,"pushNotifications":True,"taskReminders":False,"theme":"dark","language":"en"}

def serialize_settings(s):
    s["_id"]=str(s["_id"]); return s
