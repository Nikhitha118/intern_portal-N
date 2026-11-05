from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
institution_db = client["institution_db"]

reports      = institution_db["institution_reports"]
score_analytics = institution_db["institution_score_analytics"]
inst_settings   = institution_db["institution_settings"]
