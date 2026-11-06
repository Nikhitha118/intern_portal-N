"""
InternPortal - MongoDB Atlas Connection Tester
==============================================
Tests connection to MongoDB Atlas without modifying any data.
Automatically reads MONGO_URI from server/.env.
Never prints or exposes passwords.
"""
import sys
import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load server/.env and root .env
server_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(server_env)
load_dotenv()

def mask_uri(uri):
    if not uri:
        return ""
    if "@" in uri and "://" in uri:
        prefix, rest = uri.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0] if ":" in creds else creds
        return f"{prefix}://{user}:******@{host}"
    return uri

def test_connection(uri=None):
    uri = uri or os.getenv("MONGO_URI") or os.getenv("ATLAS_MONGO_URI")
    if not uri or not uri.startswith("mongodb"):
        print("❌ Error: No MongoDB connection string provided in server/.env.")
        return False

    masked = mask_uri(uri)
    print(f"🔍 Testing connection to: {masked}")
    try:
        kwargs = {"serverSelectionTimeoutMS": 8000}
        if uri.startswith("mongodb+srv://") or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
            kwargs["tlsCAFile"] = certifi.where()

        client = MongoClient(uri, **kwargs)
        client.admin.command('ping')
        server_info = client.server_info()
        print("✅ SUCCESS: Successfully connected to MongoDB Atlas!")
        print(f"   MongoDB Version: {server_info.get('version')}")
        print(f"   Databases on cluster: {client.list_database_names()}")
        return True
    except Exception as e:
        print(f"❌ Connection FAILED: {type(e).__name__} - {e}")
        return False

if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else None
    test_connection(uri)
