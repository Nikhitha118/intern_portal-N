from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
mentor_db = client["mentor_db"]

evaluations = mentor_db["mentor_evaluations"]
rubrics     = mentor_db["mentor_rubrics"]
submissions = mentor_db["mentor_submissions"]
feedback    = mentor_db["mentor_feedback"]
settings    = mentor_db["mentor_settings"]
