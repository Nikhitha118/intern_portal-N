import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000, connectTimeoutMS=1000)

# ── Separate databases per role ───────────────────────────────────────────────
# intern_db    → all intern data (tasks, journals, attendance, calendar, messages, settings)
# mentor_db    → mentor data (evaluations, rubrics, submissions, feedback, mentor_tasks)
# admin_db     → admin data (admin_logs, admin_settings, system_config)
# shared_db    → shared data (users, mentors, conversations)

intern_db = client["intern_db"]       # Intern portal data
mentor_db = client["mentor_db"]       # Mentor portal data
admin_db  = client["admin_db"]        # Admin portal data
shared_db = client["shared_db"]       # Shared: users, mentors, messages

# Legacy alias — keeps existing code working
db = intern_db
