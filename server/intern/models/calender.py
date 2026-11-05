from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]
events = intern_db["intern_calendar"]

def create_event(title, date, time, event_type, color, user_id=None):
    return {"title":title,"date":date,"time":time,"type":event_type,"color":color,"userId":user_id}

def serialize_event(e):
    e["_id"]=str(e["_id"]); return e
