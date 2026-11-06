import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

def get_mongo_client(uri=None):
    uri = uri or MONGO_URI
    kwargs = {
        "serverSelectionTimeoutMS": 5000,
        "connectTimeoutMS": 5000,
    }
    if uri.startswith("mongodb+srv://") or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
        kwargs["tlsCAFile"] = certifi.where()
    return MongoClient(uri, **kwargs)

client = get_mongo_client()

# ── Separate databases per role ───────────────────────────────────────────────
# intern_db      → all intern data (tasks, journals, attendance, calendar, messages, settings)
# mentor_db      → mentor data (evaluations, rubrics, submissions, feedback, mentor_tasks)
# admin_db       → admin data (admin_logs, admin_settings, system_config)
# shared_db      → shared data (users, mentors, conversations)
# institution_db → institution data (reports, analytics, settings)

intern_db      = client["intern_db"]
mentor_db      = client["mentor_db"]
admin_db       = client["admin_db"]
shared_db      = client["shared_db"]
institution_db = client["institution_db"]

# Legacy alias
db = intern_db
