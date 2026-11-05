"""
RESET AND SEED — Clears ALL old MongoDB data and creates fresh structured databases.

Databases created:
  shared_db       → users, messages, mentors
  intern_db       → intern_tasks, intern_journals, intern_attendance, intern_calendar, intern_settings
  mentor_db       → mentor_evaluations, mentor_rubrics, mentor_submissions, mentor_feedback
  admin_db        → admin_logs, admin_settings
  institution_db  → institution_reports, institution_score_analytics

Run: python reset_and_seed.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from pymongo import MongoClient
import bcrypt, datetime, random

MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)

print("=" * 60)
print("STEP 1: Dropping ALL old databases...")
print("=" * 60)

OLD_DBS = ["internship_dashboard", "internship_portal", "internship", "intern_db",
           "mentor_db", "admin_db", "institution_db", "shared_db",
           "intern_portal", "local_intern"]

for db_name in OLD_DBS:
    try:
        client.drop_database(db_name)
        print(f"  ✓ Dropped: {db_name}")
    except Exception as e:
        print(f"  - Skipped {db_name}: {e}")

print()
print("=" * 60)
print("STEP 2: Creating fresh structured databases...")
print("=" * 60)

# ── Database references ───────────────────────────────────────────────────────
shared_db      = client["shared_db"]
intern_db      = client["intern_db"]
mentor_db      = client["mentor_db"]
admin_db       = client["admin_db"]
institution_db = client["institution_db"]

# ── Collections ───────────────────────────────────────────────────────────────
users          = shared_db["users"]
messages       = shared_db["messages"]
mentors        = shared_db["mentors"]

intern_tasks      = intern_db["intern_tasks"]
intern_journals   = intern_db["intern_journals"]
intern_attendance = intern_db["intern_attendance"]
intern_calendar   = intern_db["intern_calendar"]
intern_settings   = intern_db["intern_settings"]

mentor_evaluations = mentor_db["mentor_evaluations"]
mentor_rubrics     = mentor_db["mentor_rubrics"]
mentor_submissions = mentor_db["mentor_submissions"]
mentor_feedback    = mentor_db["mentor_feedback"]

admin_logs     = admin_db["admin_logs"]
admin_settings = admin_db["admin_settings"]

inst_reports   = institution_db["institution_reports"]
inst_analytics = institution_db["institution_score_analytics"]

print("  ✓ All collection references created")
print()

# ── HELPER ────────────────────────────────────────────────────────────────────
def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def now():
    return datetime.datetime.utcnow().isoformat()

# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 3: Seeding shared_db → users, mentors, messages")
print("=" * 60)

# ── USERS ─────────────────────────────────────────────────────────────────────
user_docs = [
    # Demo intern
    {"fullName":"Arjun Sharma",   "email":"demo@internportal.com",    "password":hash_pw("demo1234"),    "role":"intern",      "bio":"Full-stack intern at CodeCraft Solutions.", "skills":["Python","React","Node.js","MongoDB","Flask"], "phone":"+91 98765 43210", "createdAt":now(), "isDemo":True},
    # Real interns
    {"fullName":"Riya Sharma",    "email":"riya@intern.com",          "password":hash_pw("riya1234"),    "role":"intern",      "bio":"Frontend developer intern.", "skills":["React","CSS","JavaScript"], "phone":"+91 91234 56789", "createdAt":now()},
    {"fullName":"Karan Verma",    "email":"karan@intern.com",         "password":hash_pw("karan1234"),   "role":"intern",      "bio":"Backend developer intern.", "skills":["Node.js","Express","MongoDB"], "phone":"+91 92345 67890", "createdAt":now()},
    {"fullName":"Sneha Patil",    "email":"sneha@intern.com",         "password":hash_pw("sneha1234"),   "role":"intern",      "bio":"Database intern.", "skills":["MongoDB","SQL","Python"], "phone":"+91 93456 78901", "createdAt":now()},
    {"fullName":"Mehul Joshi",    "email":"mehul@intern.com",         "password":hash_pw("mehul1234"),   "role":"intern",      "bio":"Testing intern.", "skills":["Jest","Selenium","Python"], "phone":"+91 94567 89012", "createdAt":now()},
    # Mentors
    {"fullName":"Rahul Sharma",   "email":"rahul@mentor.com",         "password":hash_pw("rahul1234"),   "role":"mentor",      "bio":"Backend Developer at CodeCraft Solutions. 8+ years.", "skills":["Node.js","Express","MongoDB"], "phone":"+91 95678 90123", "createdAt":now()},
    {"fullName":"Priya Verma",    "email":"priya@mentor.com",         "password":hash_pw("priya1234"),   "role":"mentor",      "bio":"Frontend Developer at CodeCraft Solutions. 6+ years.", "skills":["React","Next.js","Tailwind"], "phone":"+91 96789 01234", "createdAt":now()},
    # Admin
    {"fullName":"Admin User",     "email":"admin@internportal.com",   "password":hash_pw("admin1234"),   "role":"admin",       "bio":"System Administrator.", "skills":[], "phone":"+91 97890 12345", "createdAt":now()},
    # Institution
    {"fullName":"Dr. Neha Verma", "email":"institution@portal.com",   "password":hash_pw("inst1234"),    "role":"institution", "bio":"Evaluator at TechNova Solutions.", "skills":[], "phone":"+91 98901 23456", "createdAt":now()},
]

result = users.insert_many(user_docs)
user_ids = result.inserted_ids
print(f"  ✓ Inserted {len(user_ids)} users into shared_db.users")

# Map names to IDs
uid = {doc["email"]: str(user_ids[i]) for i, doc in enumerate(user_docs)}
demo_id   = uid["demo@internportal.com"]
riya_id   = uid["riya@intern.com"]
karan_id  = uid["karan@intern.com"]
sneha_id  = uid["sneha@intern.com"]
mehul_id  = uid["mehul@intern.com"]
rahul_id  = uid["rahul@mentor.com"]
priya_id  = uid["priya@mentor.com"]
admin_id  = uid["admin@internportal.com"]
inst_id   = uid["institution@portal.com"]

# ── MENTORS LIST ──────────────────────────────────────────────────────────────
mentor_docs = [
    {"name":"Rahul Sharma",  "email":"rahul@mentor.com",  "userId":rahul_id, "role":"mentor", "company":"CodeCraft Solutions", "expertise":["Node.js","Express","MongoDB"],   "availability":"Mon–Fri\n10:00 AM–5:00 PM",  "experience":"8+ Years", "sessionsCompleted":8,  "sessionsUpcoming":2, "available":True},
    {"name":"Priya Verma",   "email":"priya@mentor.com",  "userId":priya_id, "role":"mentor", "company":"CodeCraft Solutions", "expertise":["React","Next.js","Tailwind"],    "availability":"Mon–Sat\n9:00 AM–6:00 PM",   "experience":"6+ Years", "sessionsCompleted":6,  "sessionsUpcoming":1, "available":True},
    {"name":"Amit Patel",    "email":"amit@tech.com",     "userId":"",       "role":"mentor", "company":"Tech Solutions",      "expertise":["JavaScript","Node.js","React"], "availability":"Mon–Fri\n11:00 AM–7:00 PM",  "experience":"7+ Years", "sessionsCompleted":5,  "sessionsUpcoming":1, "available":False},
    {"name":"Sneha Iyer",    "email":"sneha@cloud.com",   "userId":"",       "role":"mentor", "company":"CloudTech",           "expertise":["AWS","Docker","CI/CD"],         "availability":"Mon–Fri\n10:00 AM–4:00 PM",  "experience":"5+ Years", "sessionsCompleted":4,  "sessionsUpcoming":0, "available":True},
    {"name":"Vikram Singh",  "email":"vikram@data.com",   "userId":"",       "role":"mentor", "company":"DataLabs Inc",        "expertise":["Python","ML","TensorFlow"],     "availability":"Mon–Thu\n9:00 AM–5:00 PM",   "experience":"4+ Years", "sessionsCompleted":3,  "sessionsUpcoming":1, "available":True},
]
mentors.insert_many(mentor_docs)
print(f"  ✓ Inserted {len(mentor_docs)} mentors into shared_db.mentors")

# ── MESSAGES ──────────────────────────────────────────────────────────────────
msg_docs = [
    {"senderId":rahul_id, "receiverId":demo_id, "text":"Hi Arjun, how's the progress on the Login API task?", "timestamp":now(), "read":True},
    {"senderId":demo_id,  "receiverId":rahul_id,"text":"Hi Rahul! I have completed the API. Please check the documentation.", "timestamp":now(), "read":True},
    {"senderId":rahul_id, "receiverId":demo_id, "text":"Great! Please share the GitHub link and a short demo video.", "timestamp":now(), "read":False},
]
messages.insert_many(msg_docs)
print(f"  ✓ Inserted {len(msg_docs)} messages into shared_db.messages")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 4: Seeding intern_db → tasks, journals, attendance, calendar, settings")
print("=" * 60)

# ── INTERN TASKS ──────────────────────────────────────────────────────────────
task_docs = [
    {"title":"Build Login API",         "category":"Backend",       "dueDate":"May 25, 2025","priority":"High",   "status":"In Progress","progress":70, "description":"Develop a secure login API with JWT authentication using Node.js and Express.", "userId":demo_id, "attachments":[]},
    {"title":"Create Dashboard UI",     "category":"Frontend",      "dueDate":"May 30, 2025","priority":"High",   "status":"Submitted",  "progress":100,"description":"Design and implement the main dashboard UI with all components.", "userId":demo_id, "attachments":[]},
    {"title":"Integrate MongoDB",       "category":"Database",      "dueDate":"Jun 05, 2025","priority":"Medium", "status":"In Progress","progress":60, "description":"Set up MongoDB connection and integrate with the backend APIs.", "userId":demo_id, "attachments":[]},
    {"title":"Write API Documentation", "category":"Documentation", "dueDate":"Jun 08, 2025","priority":"Low",    "status":"Pending",    "progress":20, "description":"Write comprehensive API documentation using Swagger/OpenAPI.", "userId":demo_id, "attachments":[]},
    {"title":"Deploy Application",      "category":"DevOps",        "dueDate":"Jun 12, 2025","priority":"High",   "status":"Pending",    "progress":0,  "description":"Deploy the application to AWS EC2 with CI/CD pipeline setup.", "userId":demo_id, "attachments":[]},
    {"title":"Unit Testing",            "category":"Testing",       "dueDate":"Jun 15, 2025","priority":"Medium", "status":"Pending",    "progress":0,  "description":"Write unit tests for all API endpoints using Jest and Supertest.", "userId":demo_id, "attachments":[]},
    # Riya's tasks
    {"title":"Build Login API",         "category":"Backend",       "dueDate":"May 25, 2025","priority":"High",   "status":"Submitted",  "progress":100,"description":"Login API with JWT.", "userId":riya_id, "attachments":[]},
    {"title":"Create Dashboard UI",     "category":"Frontend",      "dueDate":"May 30, 2025","priority":"High",   "status":"In Progress","progress":60, "description":"Dashboard UI.", "userId":riya_id, "attachments":[]},
    # Karan's tasks
    {"title":"Database Schema Design",  "category":"Database",      "dueDate":"Jun 05, 2025","priority":"Medium", "status":"Completed",  "progress":100,"description":"MongoDB schema design.", "userId":karan_id, "attachments":[]},
    {"title":"API Integration",         "category":"Backend",       "dueDate":"Jun 10, 2025","priority":"High",   "status":"In Progress","progress":45, "description":"Integrate all APIs.", "userId":karan_id, "attachments":[]},
]
intern_tasks.insert_many(task_docs)
print(f"  ✓ Inserted {len(task_docs)} tasks into intern_db.intern_tasks")

# ── INTERN JOURNALS ───────────────────────────────────────────────────────────
journal_docs = [
    {"title":"Integrated Login API",     "workedOn":"Integrated the login API with JWT authentication. Implemented validation and error handling.", "learned":"Learned how to secure endpoints using JWT and handle refresh tokens effectively.", "challenges":"Facing issues with token expiration and CORS configuration.", "tomorrowPlan":"Work on refresh token and logout API.", "date":"May 20, 2025", "userId":demo_id, "mentorComment":{"text":"Great work! Try to handle edge cases for invalid tokens.","mentor":"Rahul Sharma","time":"May 20, 2025 • 10:30 AM"}},
    {"title":"Worked on Authentication", "workedOn":"Worked on authentication middleware and route protection.", "learned":"Understood how middleware chains work in Express.js.", "challenges":"Had trouble with async error handling in middleware.", "tomorrowPlan":"Complete the user profile API.", "date":"May 19, 2025", "userId":demo_id, "mentorComment":None},
    {"title":"Database Design",          "workedOn":"Designed the MongoDB schema for users and tasks collections.", "learned":"Learned about indexing and schema validation in MongoDB.", "challenges":"Deciding between embedded documents vs references.", "tomorrowPlan":"Start implementing the schema in code.", "date":"May 18, 2025", "userId":demo_id, "mentorComment":None},
    {"title":"API Documentation",        "workedOn":"Started writing API documentation using Swagger.", "learned":"Learned Swagger/OpenAPI specification format.", "challenges":"Complex request/response schemas are verbose.", "tomorrowPlan":"Complete authentication endpoints documentation.", "date":"May 12, 2025", "userId":demo_id, "mentorComment":None},
    {"title":"Implemented Login API",    "workedOn":"Implemented login API with JWT.", "learned":"JWT authentication flow.", "challenges":"Token refresh logic.", "tomorrowPlan":"Add logout endpoint.", "date":"May 21, 2025", "userId":riya_id, "mentorComment":None},
]
intern_journals.insert_many(journal_docs)
print(f"  ✓ Inserted {len(journal_docs)} journals into intern_db.intern_journals")

# ── INTERN ATTENDANCE ─────────────────────────────────────────────────────────
att_docs = []
for day in range(1, 23):
    d = datetime.date(2025, 5, day)
    if d.weekday() >= 5: continue
    status = "Present" if random.random() > 0.1 else ("Late" if random.random() > 0.5 else "Absent")
    att_docs.append({"internName":"Arjun Sharma","date":d.strftime("%b %d, %Y"),"checkIn":"09:10 AM" if status!="Absent" else "-","checkOut":"06:05 PM" if status!="Absent" else "-","status":status,"location":"Sector 62, Noida","hours":"8h 55m" if status=="Present" else ("-" if status=="Absent" else "8h 30m"),"userId":demo_id})
intern_attendance.insert_many(att_docs)
print(f"  ✓ Inserted {len(att_docs)} attendance records into intern_db.intern_attendance")

# ── INTERN CALENDAR ───────────────────────────────────────────────────────────
cal_docs = [
    {"title":"Mentor Meeting",     "date":"2025-05-03","time":"10:00 AM","type":"Meeting",    "color":"#7C3AED","userId":demo_id},
    {"title":"Task Deadline",      "date":"2025-05-06","time":"11:59 PM","type":"Deadline",   "color":"#ef4444","userId":demo_id},
    {"title":"Journal Submission", "date":"2025-05-08","time":"10:00 AM","type":"Submission", "color":"#06B6D4","userId":demo_id},
    {"title":"Code Review",        "date":"2025-05-12","time":"2:00 PM", "type":"Review",     "color":"#22c55e","userId":demo_id},
    {"title":"Mid Evaluation",     "date":"2025-05-15","time":"12:00 PM","type":"Evaluation", "color":"#f59e0b","userId":demo_id},
    {"title":"Report Submission",  "date":"2025-05-22","time":"11:59 PM","type":"Submission", "color":"#22c55e","userId":demo_id},
    {"title":"Mentor Meeting",     "date":"2025-05-25","time":"10:00 AM","type":"Meeting",    "color":"#06B6D4","userId":demo_id},
    {"title":"Final Presentation", "date":"2025-05-28","time":"2:00 PM", "type":"Presentation","color":"#ec4899","userId":demo_id},
    {"title":"Sprint Start",       "date":"2025-06-02","time":"9:00 AM", "type":"Sprint",     "color":"#7C3AED","userId":demo_id},
    {"title":"Deploy Application", "date":"2025-06-12","time":"3:00 PM", "type":"Deployment", "color":"#ec4899","userId":demo_id},
]
intern_calendar.insert_many(cal_docs)
print(f"  ✓ Inserted {len(cal_docs)} calendar events into intern_db.intern_calendar")

# ── INTERN SETTINGS ───────────────────────────────────────────────────────────
settings_docs = [
    {"userId":demo_id,  "emailNotifications":True,"pushNotifications":True,"taskReminders":False,"theme":"dark","language":"en"},
    {"userId":riya_id,  "emailNotifications":True,"pushNotifications":False,"taskReminders":True,"theme":"dark","language":"en"},
    {"userId":karan_id, "emailNotifications":True,"pushNotifications":True,"taskReminders":True,"theme":"dark","language":"en"},
]
intern_settings.insert_many(settings_docs)
print(f"  ✓ Inserted {len(settings_docs)} settings into intern_db.intern_settings")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 5: Seeding mentor_db → evaluations, rubrics, submissions, feedback")
print("=" * 60)

# ── MENTOR RUBRICS ────────────────────────────────────────────────────────────
rubric_docs = [
    {"name":"Technical Skills",   "weight":30,"criteria":["Code quality","Problem solving","Technology usage"],       "createdAt":now()},
    {"name":"Communication",       "weight":20,"criteria":["Written reports","Presentations","Team interaction"],       "createdAt":now()},
    {"name":"Punctuality",         "weight":20,"criteria":["Attendance","Deadline adherence","Meeting attendance"],     "createdAt":now()},
    {"name":"Task Completion",     "weight":20,"criteria":["Tasks completed","Quality of work","Initiative"],           "createdAt":now()},
    {"name":"Learning & Growth",   "weight":10,"criteria":["New skills","Adaptability","Self-improvement"],             "createdAt":now()},
]
mentor_rubrics.insert_many(rubric_docs)
print(f"  ✓ Inserted {len(rubric_docs)} rubrics into mentor_db.mentor_rubrics")

# ── MENTOR EVALUATIONS ────────────────────────────────────────────────────────
eval_docs = [
    {"internId":demo_id,  "mentorId":rahul_id, "scores":{"Technical Skills":85,"Communication":80,"Punctuality":90,"Task Completion":88,"Learning & Growth":82}, "feedback":"Great technical skills. Improve documentation.", "period":"May 2025", "totalScore":85, "grade":"B", "createdAt":now()},
    {"internId":riya_id,  "mentorId":priya_id, "scores":{"Technical Skills":90,"Communication":85,"Punctuality":95,"Task Completion":92,"Learning & Growth":88}, "feedback":"Excellent frontend work. Keep it up!", "period":"May 2025", "totalScore":91, "grade":"A", "createdAt":now()},
    {"internId":karan_id, "mentorId":rahul_id, "scores":{"Technical Skills":78,"Communication":75,"Punctuality":80,"Task Completion":76,"Learning & Growth":72}, "feedback":"Good progress. Focus on code quality.", "period":"May 2025", "totalScore":77, "grade":"C", "createdAt":now()},
]
mentor_evaluations.insert_many(eval_docs)
print(f"  ✓ Inserted {len(eval_docs)} evaluations into mentor_db.mentor_evaluations")

# ── MENTOR SUBMISSIONS ────────────────────────────────────────────────────────
sub_docs = [
    {"internId":demo_id,  "taskId":"", "fileName":"login_api.zip",    "fileSize":"2.4 MB", "notes":"Login API with JWT auth", "status":"Pending Review", "submittedAt":now()},
    {"internId":riya_id,  "taskId":"", "fileName":"dashboard.zip",    "fileSize":"1.8 MB", "notes":"Dashboard UI components", "status":"Reviewed",       "submittedAt":now()},
    {"internId":karan_id, "taskId":"", "fileName":"schema.pdf",       "fileSize":"850 KB", "notes":"MongoDB schema design",   "status":"Pending Review", "submittedAt":now()},
    {"internId":sneha_id, "taskId":"", "fileName":"unit_tests.zip",   "fileSize":"1.2 MB", "notes":"Unit test suite",         "status":"Reviewed",       "submittedAt":now()},
]
mentor_submissions.insert_many(sub_docs)
print(f"  ✓ Inserted {len(sub_docs)} submissions into mentor_db.mentor_submissions")

# ── MENTOR FEEDBACK ───────────────────────────────────────────────────────────
fb_docs = [
    {"from":rahul_id, "to":demo_id,  "text":"Good technical skills and commitment.", "rating":4, "date":now()},
    {"from":priya_id, "to":riya_id,  "text":"Excellent frontend work. Very proactive.", "rating":5, "date":now()},
    {"from":rahul_id, "to":karan_id, "text":"Needs improvement in documentation.", "rating":3, "date":now()},
]
mentor_feedback.insert_many(fb_docs)
print(f"  ✓ Inserted {len(fb_docs)} feedback entries into mentor_db.mentor_feedback")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 6: Seeding admin_db → logs, settings")
print("=" * 60)

admin_logs.insert_many([
    {"action":"system_init",  "userId":admin_id, "detail":"System initialized with fresh data", "at":now()},
    {"action":"user_created", "userId":demo_id,  "detail":"Demo user created",                  "at":now()},
])
admin_settings.insert_one({"userId":admin_id, "systemName":"InternPortal", "version":"3.0", "maintenanceMode":False, "createdAt":now()})
print("  ✓ Inserted admin logs and settings into admin_db")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 7: Seeding institution_db → reports, score_analytics")
print("=" * 60)

inst_reports.insert_many([
    {"name":"May 2025 Performance Report", "type":"Summary",    "generatedAt":now(), "generatedBy":"Dr. Neha Verma", "internId":"", "data":{}},
    {"name":"Riya Sharma Report",          "type":"Individual", "generatedAt":now(), "generatedBy":"Dr. Neha Verma", "internId":riya_id, "data":{}},
])
inst_analytics.insert_one({"period":"May 2025", "averageScore":84.3, "highestScore":91, "lowestScore":77, "distribution":{"A":1,"B":1,"C":1,"D":0}, "total":3, "createdAt":now()})
print("  ✓ Inserted reports and analytics into institution_db")

# ─────────────────────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("✅ ALL DONE! Fresh structured data seeded.")
print("=" * 60)
print()
print("📦 Database Structure:")
print("  shared_db       → users, messages, mentors")
print("  intern_db       → intern_tasks, intern_journals, intern_attendance, intern_calendar, intern_settings")
print("  mentor_db       → mentor_evaluations, mentor_rubrics, mentor_submissions, mentor_feedback")
print("  admin_db        → admin_logs, admin_settings")
print("  institution_db  → institution_reports, institution_score_analytics")
print()
print("🔑 Login Credentials:")
print("  INTERN (Demo):  demo@internportal.com    / demo1234")
print("  INTERN:         riya@intern.com          / riya1234")
print("  INTERN:         karan@intern.com         / karan1234")
print("  MENTOR:         rahul@mentor.com         / rahul1234")
print("  MENTOR:         priya@mentor.com         / priya1234")
print("  ADMIN:          admin@internportal.com   / admin1234")
print("  INSTITUTION:    institution@portal.com   / inst1234")
print()
print("🌐 Portals:")
print("  Intern:      http://localhost:3000/intern/dashboard")
print("  Mentor:      http://localhost:3000/mentor/dashboard")
print("  Admin:       http://localhost:3000/admin/dashboard")
print("  Institution: http://localhost:3000/institution/dashboard")
