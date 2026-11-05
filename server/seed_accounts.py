"""
InternPortal — Seed Test Accounts
===================================
Creates one test account for each portal role.
Run: python seed_accounts.py

Accounts created:
  INTERN      intern@test.com       / Test@1234
  MENTOR      mentor@test.com       / Test@1234
  EVALUATION  evaluator@test.com    / Test@1234
  INSTITUTION institution@test.com  / Test@1234
  ADMIN       admin@test.com        / Test@1234
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from pymongo import MongoClient
from datetime import datetime

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["shared_db"]
users = db["users"]

TEST_ACCOUNTS = [
    {"fullName": "Arjun Sharma",      "email": "arjun.intern2025@gmail.com",      "password": "Intern@2025",      "role": "intern"},
    {"fullName": "Priya Sharma",      "email": "priya.mentor2025@gmail.com",      "password": "Mentor@2025",      "role": "mentor"},
    {"fullName": "Dr. Neha Verma",    "email": "neha.evaluator2025@gmail.com",    "password": "Eval@2025",        "role": "evaluator"},
    {"fullName": "Prof. Rajan Mehta", "email": "rajan.institution2025@gmail.com", "password": "Instit@2025",      "role": "institution"},
    {"fullName": "Admin User",        "email": "admin.portal2025@gmail.com",      "password": "Admin@2025",       "role": "admin"},
]

print("\n🌱 Seeding InternPortal test accounts...\n")

for acc in TEST_ACCOUNTS:
    existing = users.find_one({"email": acc["email"]})
    if existing:
        print(f"  ⚠  Already exists: {acc['email']} ({acc['role']})")
        continue

    hashed = bcrypt.hashpw(acc["password"].encode(), bcrypt.gensalt()).decode()
    doc = {
        "fullName":  acc["fullName"],
        "email":     acc["email"],
        "password":  hashed,
        "role":      acc["role"],
        "createdAt": datetime.utcnow().isoformat(),
        "bio":       f"Test account for {acc['role']} portal.",
        "skills":    [],
        "phone":     "+91 98765 43210",
    }
    result = users.insert_one(doc)
    print(f"  ✅ Created: {acc['email']} | role: {acc['role']} | id: {result.inserted_id}")

print("\n✅ Done! Test accounts ready.\n")
print("=" * 55)
print("  PORTAL        EMAIL                    PASSWORD")
print("=" * 55)
for acc in TEST_ACCOUNTS:
    portal = acc["role"].upper().ljust(13)
    email  = acc["email"].ljust(28)
    print(f"  {portal} {email} {acc['password']}")
print("=" * 55)
print("\n  Login URL: http://localhost:3000/login")
print("  Routing:")
print("    intern      → /intern/dashboard")
print("    mentor      → /mentor/dashboard")
print("    evaluator   → /mentor/dashboard  (evaluation tab)")
print("    institution → /institution/dashboard")
print("    admin       → /admin/dashboard\n")
