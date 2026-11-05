from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]
journals = intern_db["intern_journals"]

def create_journal(title, worked_on, learned, challenges, tomorrow_plan, date, user_id=None):
    return {"title":title,"workedOn":worked_on,"learned":learned,"challenges":challenges,"tomorrowPlan":tomorrow_plan,"date":date,"userId":user_id,"mentorComment":None}

def serialize_journal(j):
    j["_id"]=str(j["_id"]); return j
