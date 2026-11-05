from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
intern_db = client["intern_db"]

# Intern collections — all prefixed with intern_
tasks      = intern_db["intern_tasks"]
journals   = intern_db["intern_journals"]
attendance = intern_db["intern_attendance"]
calendar   = intern_db["intern_calendar"]
settings   = intern_db["intern_settings"]
