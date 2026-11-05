from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"), serverSelectionTimeoutMS=1000, connectTimeoutMS=1000)
shared_db = client["shared_db"]
mentors = shared_db["mentors"]

DEFAULT_MENTORS = [
    {"name":"Rahul Sharma","email":"rahul@codecraft.io","role":"mentor","company":"CodeCraft Solutions","expertise":["Node.js","Express","MongoDB"],"availability":"Mon-Fri 10AM-5PM","experience":"8+ Years","sessionsCompleted":8,"sessionsUpcoming":2,"available":True},
    {"name":"Priya Verma","email":"priya@codecraft.io","role":"mentor","company":"CodeCraft Solutions","expertise":["React","Next.js","Tailwind"],"availability":"Mon-Sat 9AM-6PM","experience":"6+ Years","sessionsCompleted":6,"sessionsUpcoming":1,"available":True},
    {"name":"Amit Patel","email":"amit@techsolutions.io","role":"mentor","company":"Tech Solutions","expertise":["JavaScript","Node.js","React"],"availability":"Mon-Fri 11AM-7PM","experience":"7+ Years","sessionsCompleted":5,"sessionsUpcoming":1,"available":False},
    {"name":"Sneha Iyer","email":"sneha@cloudtech.io","role":"mentor","company":"CloudTech","expertise":["AWS","Docker","CI/CD"],"availability":"Mon-Fri 10AM-4PM","experience":"5+ Years","sessionsCompleted":4,"sessionsUpcoming":0,"available":True},
    {"name":"Vikram Singh","email":"vikram@datalabs.io","role":"mentor","company":"DataLabs Inc","expertise":["Python","ML","TensorFlow"],"availability":"Mon-Thu 9AM-5PM","experience":"4+ Years","sessionsCompleted":3,"sessionsUpcoming":1,"available":True},
]

def seed_mentors():
    if mentors.count_documents({}) == 0:
        mentors.insert_many(DEFAULT_MENTORS)

try: seed_mentors()
except: pass

def create_mentor(name, email, role, company, expertise, availability, experience):
    return {"name":name,"email":email,"role":role,"company":company,"expertise":expertise,"availability":availability,"experience":experience,"sessionsCompleted":0,"sessionsUpcoming":0,"available":True}

def serialize_mentor(m):
    m["_id"]=str(m["_id"]); return m
