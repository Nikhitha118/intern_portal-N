from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
admin_db = client["admin_db"]

admin_logs     = admin_db["admin_logs"]
admin_settings = admin_db["admin_settings"]
system_config  = admin_db["system_config"]
