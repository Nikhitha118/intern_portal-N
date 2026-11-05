from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]
attendance = intern_db["intern_attendance"]

def create_attendance(intern_name, date, check_in, check_out, status, location, user_id=None):
    return {"internName":intern_name,"date":date,"checkIn":check_in,"checkOut":check_out,"status":status,"location":location,"userId":user_id}

def serialize_attendance(a):
    a["_id"]=str(a["_id"]); return a
