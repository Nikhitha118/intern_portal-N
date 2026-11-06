"""
InternPortal - MongoDB Atlas Connection Tester
==============================================
Tests connection to MongoDB Atlas without modifying any data.

Usage:
  1. Pass via environment variable:
     $env:ATLAS_MONGO_URI = "mongodb+srv://..."
     python test_atlas_connection.py

  2. Or pass as argument:
     python test_atlas_connection.py "mongodb+srv://..."
"""
import sys
import os
import certifi
from pymongo import MongoClient

def test_connection(uri=None):
    uri = uri or os.getenv("ATLAS_MONGO_URI") or os.getenv("MONGO_URI")
    if not uri or not uri.startswith("mongodb"):
        print("❌ Error: No MongoDB connection string provided.")
        print("Usage: python test_atlas_connection.py \"<YOUR_CONNECTION_STRING>\"")
        return False

    print("🔍 Testing connection to MongoDB Atlas...")
    try:
        kwargs = {"serverSelectionTimeoutMS": 8000}
        if uri.startswith("mongodb+srv://") or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
            kwargs["tlsCAFile"] = certifi.where()

        client = MongoClient(uri, **kwargs)
        client.admin.command('ping')
        server_info = client.server_info()
        print("✅ SUCCESS: Successfully connected to MongoDB Atlas!")
        print(f"   MongoDB Version: {server_info.get('version')}")
        print(f"   Existing Databases: {client.list_database_names()}")
        return True
    except Exception as e:
        print(f"❌ Connection FAILED: {e}")
        return False

if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else None
    test_connection(uri)
