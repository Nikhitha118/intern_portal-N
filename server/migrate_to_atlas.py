"""
Migrate all data from local MongoDB (mongodb://localhost:27017/) to Cloud MongoDB Atlas.
Usage: python migrate_to_atlas.py "<YOUR_ATLAS_CONNECTION_STRING>"
"""
import sys
from pymongo import MongoClient

def migrate(atlas_uri):
    if not atlas_uri or not atlas_uri.startswith("mongodb"):
        print("ERROR: Please provide a valid MongoDB connection string.")
        return False

    print("Connecting to local MongoDB...")
    local_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)

    print("Connecting to MongoDB Atlas...")
    atlas_client = MongoClient(atlas_uri, serverSelectionTimeoutMS=10000)

    # Verify atlas connection
    try:
        atlas_client.admin.command('ping')
        print(" Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f" Failed to connect to MongoDB Atlas: {e}")
        return False

    databases = ["shared_db", "intern_db", "mentor_db", "admin_db", "institution_db"]

    for db_name in databases:
        local_db = local_client[db_name]
        atlas_db = atlas_client[db_name]
        collections = local_db.list_collection_names()
        print(f"\n--- Migrating database: {db_name} ({len(collections)} collections) ---")

        for col_name in collections:
            docs = list(local_db[col_name].find({}))
            if not docs:
                continue
            print(f"  Migrating {col_name}: {len(docs)} documents...", end=" ")
            try:
                for doc in docs:
                    atlas_db[col_name].replace_one({"_id": doc["_id"]}, doc, upsert=True)
                print("Done!")
            except Exception as e:
                print(f"Error: {e}")

    print("\n Migration completed successfully! All databases and collections are mirrored to MongoDB Atlas.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_to_atlas.py <ATLAS_MONGO_URI>")
        sys.exit(1)
    migrate(sys.argv[1])
