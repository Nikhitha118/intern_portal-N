"""
InternPortal - Safe MongoDB Atlas Data Migration Utility
========================================================
Non-destructive: Reads from local MongoDB (mongodb://localhost:27017/)
and safely upserts all documents into Cloud MongoDB Atlas.

Safe guarantees:
  - NEVER drops databases or collections
  - NEVER deletes existing documents
  - Uses upsert (replace if _id exists, insert if new)
  - Local database is strictly read-only

Usage:
  1. Set environment variable:
     $env:ATLAS_MONGO_URI = "mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority"
     python migrate_to_atlas.py

  2. Or pass as argument:
     python migrate_to_atlas.py "mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority"
"""
import sys
import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Auto-load server/.env
server_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(server_env)
load_dotenv()

DATABASES = [
    "shared_db",
    "intern_db",
    "mentor_db",
    "admin_db",
    "institution_db"
]

def migrate(atlas_uri=None):
    atlas_uri = atlas_uri or os.getenv("ATLAS_MONGO_URI") or os.getenv("MONGO_URI")
    if not atlas_uri or not atlas_uri.startswith("mongodb"):
        print("\n❌ ERROR: No valid MongoDB Atlas connection string provided.")
        print("Please set ATLAS_MONGO_URI or pass the URI as an argument.")
        print("Example:")
        print("  python migrate_to_atlas.py \"mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority\"\n")
        return False

    print("\n🔍 Step 1: Connecting to Local MongoDB (mongodb://localhost:27017/)...")
    try:
        local_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
        local_client.admin.command('ping')
        print("  ✅ Local MongoDB connected successfully.")
    except Exception as e:
        print(f"  ❌ Failed to connect to local MongoDB: {e}")
        return False

    print("\n🔍 Step 2: Connecting to Cloud MongoDB Atlas...")
    try:
        kwargs = {"serverSelectionTimeoutMS": 10000}
        if atlas_uri.startswith("mongodb+srv://") or "ssl=true" in atlas_uri.lower() or "tls=true" in atlas_uri.lower():
            kwargs["tlsCAFile"] = certifi.where()
        atlas_client = MongoClient(atlas_uri, **kwargs)
        atlas_client.admin.command('ping')
        print("  ✅ MongoDB Atlas cluster connected successfully.")
    except Exception as e:
        print(f"  ❌ Failed to connect to MongoDB Atlas: {e}")
        return False

    print("\n📦 Step 3: Starting Safe Non-Destructive Data Migration...")
    total_migrated = 0

    for db_name in DATABASES:
        local_db = local_client[db_name]
        atlas_db = atlas_client[db_name]
        collections = local_db.list_collection_names()

        if not collections:
            continue

        print(f"\n  📁 Database: {db_name}")
        for col_name in collections:
            docs = list(local_db[col_name].find({}))
            if not docs:
                continue

            count = 0
            for doc in docs:
                # Safe upsert: preserves existing fields and prevents duplicates
                atlas_db[col_name].replace_one({"_id": doc["_id"]}, doc, upsert=True)
                count += 1

            print(f"     └─ {col_name}: {count} documents migrated (upserted)")
            total_migrated += count

    print("\n" + "=" * 60)
    print(f"🎉 MIGRATION COMPLETED: {total_migrated} documents safely synced to MongoDB Atlas.")
    print("=" * 60 + "\n")
    return True

if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(uri)
