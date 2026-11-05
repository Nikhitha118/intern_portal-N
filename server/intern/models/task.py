from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]
tasks = intern_db["intern_tasks"]

def create_task(title, category, due_date, priority, status, progress, description="", user_id=None):
    return {"title":title,"category":category,"dueDate":due_date,"priority":priority,"status":status,"progress":progress,"description":description,"userId":user_id,"attachments":[]}

def serialize_task(t):
    t["_id"]=str(t["_id"]); return t
