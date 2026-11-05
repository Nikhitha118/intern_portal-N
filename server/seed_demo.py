"""
Run this ONCE to seed the demo user and all demo data into MongoDB.
Usage: python seed_demo.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from config.database import intern_db, shared_db
import bcrypt, datetime

# ── Collections ──────────────────────────────────────────────────────────────
users      = shared_db["users"]
tasks      = intern_db["intern_tasks"]
journals   = intern_db["intern_journals"]
attendance = intern_db["intern_attendance"]
events     = intern_db["intern_calendar"]
mentors    = shared_db["mentors"]

DEMO_EMAIL    = "demo@internportal.com"
DEMO_PASSWORD = "demo1234"
DEMO_NAME     = "Arjun Sharma"

# ── 1. Create / update demo user ─────────────────────────────────────────────
existing = users.find_one({"email": DEMO_EMAIL})
if existing:
    demo_id = str(existing["_id"])
    print(f"Demo user already exists: {demo_id}")
else:
    hashed = bcrypt.hashpw(DEMO_PASSWORD.encode(), bcrypt.gensalt()).decode()
    result = users.insert_one({
        "fullName": DEMO_NAME,
        "email":    DEMO_EMAIL,
        "password": hashed,
        "role":     "intern",
        "bio":      "Full-stack intern at CodeCraft Solutions. Passionate about building scalable APIs.",
        "phone":    "+91 98765 43210",
        "skills":   ["Python", "React", "Node.js", "MongoDB", "Flask"],
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "isDemo":   True,
    })
    demo_id = str(result.inserted_id)
    print(f"Created demo user: {demo_id}")

# ── 2. Seed tasks ─────────────────────────────────────────────────────────────
if tasks.count_documents({"userId": demo_id}) == 0:
    tasks.insert_many([
        {"title":"Build Login API",         "category":"Backend",       "dueDate":"May 25, 2025","priority":"High",   "status":"In Progress","progress":70, "description":"Develop a secure login API with JWT authentication using Node.js and Express.", "userId":demo_id},
        {"title":"Create Dashboard UI",     "category":"Frontend",      "dueDate":"May 30, 2025","priority":"High",   "status":"Submitted",  "progress":100,"description":"Design and implement the main dashboard UI with all components.",              "userId":demo_id},
        {"title":"Integrate MongoDB",       "category":"Database",      "dueDate":"Jun 05, 2025","priority":"Medium", "status":"In Progress","progress":60, "description":"Set up MongoDB connection and integrate with the backend APIs.",                "userId":demo_id},
        {"title":"Write API Documentation", "category":"Documentation", "dueDate":"Jun 08, 2025","priority":"Low",    "status":"Pending",    "progress":20, "description":"Write comprehensive API documentation using Swagger/OpenAPI.",                 "userId":demo_id},
        {"title":"Deploy Application",      "category":"DevOps",        "dueDate":"Jun 12, 2025","priority":"High",   "status":"Pending",    "progress":0,  "description":"Deploy the application to AWS EC2 with CI/CD pipeline setup.",               "userId":demo_id},
        {"title":"Unit Testing",            "category":"Testing",       "dueDate":"Jun 15, 2025","priority":"Medium", "status":"Pending",    "progress":0,  "description":"Write unit tests for all API endpoints using Jest and Supertest.",            "userId":demo_id},
    ])
    print("Seeded 6 tasks")

# ── 3. Seed journals ──────────────────────────────────────────────────────────
if journals.count_documents({"userId": demo_id}) == 0:
    journals.insert_many([
        {"title":"Integrated Login API",    "workedOn":"Integrated the login API with JWT authentication. Implemented validation and error handling.", "learned":"Learned how to secure endpoints using JWT and handle refresh tokens effectively.", "challenges":"Facing issues with token expiration and CORS configuration.", "tomorrowPlan":"Work on refresh token and logout API.", "date":"May 20, 2025", "userId":demo_id},
        {"title":"Worked on Authentication","workedOn":"Worked on authentication middleware and route protection.", "learned":"Understood how middleware chains work in Express.js.", "challenges":"Had trouble with async error handling in middleware.", "tomorrowPlan":"Complete the user profile API.", "date":"May 19, 2025", "userId":demo_id},
        {"title":"Database Design",         "workedOn":"Designed the MongoDB schema for users and tasks collections.", "learned":"Learned about indexing and schema validation in MongoDB.", "challenges":"Deciding between embedded documents vs references.", "tomorrowPlan":"Start implementing the schema in code.", "date":"May 18, 2025", "userId":demo_id},
        {"title":"API Documentation",       "workedOn":"Started writing API documentation using Swagger.", "learned":"Learned Swagger/OpenAPI specification format.", "challenges":"Complex request/response schemas are verbose.", "tomorrowPlan":"Complete authentication endpoints documentation.", "date":"May 12, 2025", "userId":demo_id},
    ])
    print("Seeded 4 journals")

# ── 4. Seed attendance ────────────────────────────────────────────────────────
if attendance.count_documents({"userId": demo_id}) == 0:
    att_records = []
    import random
    for i in range(22):
        d = datetime.date(2025, 5, i + 1)
        if d.weekday() >= 5: continue  # skip weekends
        status = "Present" if random.random() > 0.1 else ("Late" if random.random() > 0.5 else "Absent")
        att_records.append({
            "internName": DEMO_NAME,
            "date":       d.strftime("%b %d, %Y"),
            "checkIn":    "09:10 AM" if status != "Absent" else "-",
            "checkOut":   "06:05 PM" if status != "Absent" else "-",
            "status":     status,
            "location":   "Sector 62, Noida",
            "hours":      "8h 55m" if status == "Present" else ("-" if status == "Absent" else "8h 30m"),
            "userId":     demo_id,
        })
    attendance.insert_many(att_records)
    print(f"Seeded {len(att_records)} attendance records")

# ── 5. Seed calendar events ───────────────────────────────────────────────────
if events.count_documents({"userId": demo_id}) == 0:
    events.insert_many([
        {"title":"Mentor Meeting",     "date":"2025-05-03","time":"10:00 AM","color":"#7C3AED","type":"Meeting",    "userId":demo_id},
        {"title":"Task Deadline",      "date":"2025-05-06","time":"11:59 PM","color":"#ef4444","type":"Deadline",   "userId":demo_id},
        {"title":"Journal Submission", "date":"2025-05-08","time":"10:00 AM","color":"#06B6D4","type":"Submission", "userId":demo_id},
        {"title":"Code Review",        "date":"2025-05-12","time":"2:00 PM", "color":"#22c55e","type":"Review",     "userId":demo_id},
        {"title":"Mid Evaluation",     "date":"2025-05-15","time":"12:00 PM","color":"#f59e0b","type":"Evaluation", "userId":demo_id},
        {"title":"Report Submission",  "date":"2025-05-22","time":"11:59 PM","color":"#22c55e","type":"Submission", "userId":demo_id},
        {"title":"Mentor Meeting",     "date":"2025-05-25","time":"10:00 AM","color":"#06B6D4","type":"Meeting",    "userId":demo_id},
        {"title":"Final Presentation", "date":"2025-05-28","time":"2:00 PM", "color":"#ec4899","type":"Presentation","userId":demo_id},
        {"title":"Sprint Start",       "date":"2025-06-02","time":"9:00 AM", "color":"#7C3AED","type":"Sprint",     "userId":demo_id},
        {"title":"Deploy Application", "date":"2025-06-12","time":"3:00 PM", "color":"#ec4899","type":"Deployment", "userId":demo_id},
    ])
    print("Seeded 10 calendar events")

print(f"\n✅ Demo user ready!")
print(f"   Email:    {DEMO_EMAIL}")
print(f"   Password: {DEMO_PASSWORD}")
print(f"   User ID:  {demo_id}")
