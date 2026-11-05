"""
Add more interns and mentors to existing MongoDB.
Run: python add_users.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from pymongo import MongoClient
import bcrypt, datetime

client = MongoClient("mongodb://localhost:27017/")
shared_db = client["shared_db"]
intern_db = client["intern_db"]
mentor_db = client["mentor_db"]

users   = shared_db["users"]
mentors = shared_db["mentors"]
intern_tasks      = intern_db["intern_tasks"]
intern_attendance = intern_db["intern_attendance"]
intern_calendar   = intern_db["intern_calendar"]
intern_settings   = intern_db["intern_settings"]
mentor_evaluations = mentor_db["mentor_evaluations"]

def hp(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def now(): return datetime.datetime.now().isoformat()

# ── NEW INTERNS ───────────────────────────────────────────────────────────────
new_interns = [
    {"fullName":"Aditya Singh",   "email":"aditya@intern.com",   "password":hp("aditya1234"),   "role":"intern", "bio":"DevOps intern passionate about cloud infrastructure.", "skills":["AWS","Docker","Linux","CI/CD"],          "phone":"+91 90001 11111", "createdAt":now()},
    {"fullName":"Priya Nair",     "email":"priya.n@intern.com",  "password":hp("priya1234"),    "role":"intern", "bio":"Data science intern with ML background.",              "skills":["Python","ML","TensorFlow","Pandas"],     "phone":"+91 90002 22222", "createdAt":now()},
    {"fullName":"Rohan Gupta",    "email":"rohan@intern.com",    "password":hp("rohan1234"),    "role":"intern", "bio":"Full-stack intern building scalable web apps.",         "skills":["React","Node.js","MongoDB","Express"],   "phone":"+91 90003 33333", "createdAt":now()},
    {"fullName":"Ananya Reddy",   "email":"ananya@intern.com",   "password":hp("ananya1234"),   "role":"intern", "bio":"UI/UX and frontend intern.",                           "skills":["Figma","React","CSS","Tailwind"],        "phone":"+91 90004 44444", "createdAt":now()},
    {"fullName":"Vikram Patel",   "email":"vikram@intern.com",   "password":hp("vikram1234"),   "role":"intern", "bio":"Backend intern specializing in APIs.",                 "skills":["Python","Flask","PostgreSQL","REST"],    "phone":"+91 90005 55555", "createdAt":now()},
]

# ── NEW MENTORS ───────────────────────────────────────────────────────────────
new_mentors_users = [
    {"fullName":"Amit Patel",     "email":"amit@mentor.com",     "password":hp("amit1234"),     "role":"mentor", "bio":"Full Stack Developer at Tech Solutions. 7+ years.",   "skills":["JavaScript","Node.js","React"],          "phone":"+91 90006 66666", "createdAt":now()},
    {"fullName":"Sneha Iyer",     "email":"sneha.m@mentor.com",  "password":hp("sneha1234"),    "role":"mentor", "bio":"DevOps Engineer at CloudTech. 5+ years.",              "skills":["AWS","Docker","CI/CD","Kubernetes"],     "phone":"+91 90007 77777", "createdAt":now()},
    {"fullName":"Vikram Singh",   "email":"vikram.m@mentor.com", "password":hp("vikram1234"),   "role":"mentor", "bio":"Data Scientist at DataLabs Inc. 4+ years.",            "skills":["Python","ML","TensorFlow","Spark"],      "phone":"+91 90008 88888", "createdAt":now()},
]

# Insert users
intern_result = users.insert_many(new_interns)
mentor_result = users.insert_many(new_mentors_users)

intern_ids = [str(i) for i in intern_result.inserted_ids]
mentor_ids = [str(i) for i in mentor_result.inserted_ids]

print("✓ Inserted 5 new interns")
print("✓ Inserted 3 new mentors")

# ── ADD MENTOR PROFILES ───────────────────────────────────────────────────────
mentor_profiles = [
    {"name":"Amit Patel",   "email":"amit@mentor.com",     "userId":mentor_ids[0], "role":"mentor", "company":"Tech Solutions",  "expertise":["JavaScript","Node.js","React"], "availability":"Mon–Fri\n11:00 AM–7:00 PM", "experience":"7+ Years", "sessionsCompleted":5, "sessionsUpcoming":1, "available":False},
    {"name":"Sneha Iyer",   "email":"sneha.m@mentor.com",  "userId":mentor_ids[1], "role":"mentor", "company":"CloudTech",       "expertise":["AWS","Docker","CI/CD"],         "availability":"Mon–Fri\n10:00 AM–4:00 PM", "experience":"5+ Years", "sessionsCompleted":4, "sessionsUpcoming":0, "available":True},
    {"name":"Vikram Singh", "email":"vikram.m@mentor.com", "userId":mentor_ids[2], "role":"mentor", "company":"DataLabs Inc",    "expertise":["Python","ML","TensorFlow"],     "availability":"Mon–Thu\n9:00 AM–5:00 PM",  "experience":"4+ Years", "sessionsCompleted":3, "sessionsUpcoming":1, "available":True},
]
mentors.insert_many(mentor_profiles)
print("✓ Inserted 3 mentor profiles into shared_db.mentors")

# ── ADD TASKS FOR NEW INTERNS ─────────────────────────────────────────────────
task_sets = [
    # Aditya
    [{"title":"Setup CI/CD Pipeline","category":"DevOps","dueDate":"Jun 10, 2025","priority":"High","status":"In Progress","progress":55,"description":"Setup GitHub Actions CI/CD pipeline for the project.","userId":intern_ids[0],"attachments":[]},
     {"title":"Docker Containerization","category":"DevOps","dueDate":"Jun 15, 2025","priority":"Medium","status":"Pending","progress":0,"description":"Containerize the application using Docker.","userId":intern_ids[0],"attachments":[]}],
    # Priya N
    [{"title":"Build ML Model","category":"Backend","dueDate":"Jun 12, 2025","priority":"High","status":"In Progress","progress":40,"description":"Build a classification model for intern performance prediction.","userId":intern_ids[1],"attachments":[]},
     {"title":"Data Analysis Report","category":"Documentation","dueDate":"Jun 18, 2025","priority":"Medium","status":"Pending","progress":10,"description":"Analyze attendance and task data and create report.","userId":intern_ids[1],"attachments":[]}],
    # Rohan
    [{"title":"Build REST API","category":"Backend","dueDate":"Jun 08, 2025","priority":"High","status":"Submitted","progress":100,"description":"Build complete REST API for the internship portal.","userId":intern_ids[2],"attachments":[]},
     {"title":"React Dashboard","category":"Frontend","dueDate":"Jun 14, 2025","priority":"High","status":"In Progress","progress":65,"description":"Build React dashboard with charts and analytics.","userId":intern_ids[2],"attachments":[]}],
    # Ananya
    [{"title":"UI Design System","category":"Frontend","dueDate":"Jun 06, 2025","priority":"Medium","status":"Completed","progress":100,"description":"Create a design system with reusable components.","userId":intern_ids[3],"attachments":[]},
     {"title":"Responsive Landing Page","category":"Frontend","dueDate":"Jun 11, 2025","priority":"Low","status":"In Progress","progress":75,"description":"Build responsive landing page for the portal.","userId":intern_ids[3],"attachments":[]}],
    # Vikram P
    [{"title":"Flask API Development","category":"Backend","dueDate":"Jun 09, 2025","priority":"High","status":"In Progress","progress":50,"description":"Develop Flask REST API with authentication.","userId":intern_ids[4],"attachments":[]},
     {"title":"PostgreSQL Schema","category":"Database","dueDate":"Jun 16, 2025","priority":"Medium","status":"Pending","progress":0,"description":"Design and implement PostgreSQL database schema.","userId":intern_ids[4],"attachments":[]}],
]
all_tasks = [t for ts in task_sets for t in ts]
intern_tasks.insert_many(all_tasks)
print(f"✓ Inserted {len(all_tasks)} tasks for new interns")

# ── ADD ATTENDANCE FOR NEW INTERNS ────────────────────────────────────────────
import random
att_docs = []
names = ["Aditya Singh","Priya Nair","Rohan Gupta","Ananya Reddy","Vikram Patel"]
for idx, iid in enumerate(intern_ids):
    for day in range(1, 23):
        d = datetime.date(2025, 5, day)
        if d.weekday() >= 5: continue
        status = "Present" if random.random() > 0.12 else ("Late" if random.random() > 0.5 else "Absent")
        att_docs.append({"internName":names[idx],"date":d.strftime("%b %d, %Y"),"checkIn":"09:10 AM" if status!="Absent" else "-","checkOut":"06:05 PM" if status!="Absent" else "-","status":status,"location":"Sector 62, Noida","hours":"8h 55m" if status=="Present" else ("-" if status=="Absent" else "8h 30m"),"userId":iid})
intern_attendance.insert_many(att_docs)
print(f"✓ Inserted {len(att_docs)} attendance records for new interns")

# ── ADD SETTINGS FOR NEW INTERNS ──────────────────────────────────────────────
intern_settings.insert_many([{"userId":iid,"emailNotifications":True,"pushNotifications":True,"taskReminders":True,"theme":"dark","language":"en"} for iid in intern_ids])
print("✓ Inserted settings for new interns")

# ── ADD EVALUATIONS FOR NEW INTERNS ──────────────────────────────────────────
eval_data = [
    (intern_ids[0], mentor_ids[1], 78, "C", "Good DevOps skills. Needs more practice with Kubernetes."),
    (intern_ids[1], mentor_ids[2], 88, "B", "Strong ML background. Improve communication of results."),
    (intern_ids[2], mentor_ids[0], 92, "A", "Excellent full-stack skills. Very proactive."),
    (intern_ids[3], mentor_ids[0], 85, "B", "Great UI work. Focus on accessibility."),
    (intern_ids[4], mentor_ids[1], 74, "C", "Decent backend skills. Work on code quality."),
]
mentor_evaluations.insert_many([
    {"internId":iid,"mentorId":mid,"scores":{"Technical Skills":sc,"Communication":sc-5,"Punctuality":sc+2,"Task Completion":sc-3,"Learning & Growth":sc-8},"feedback":fb,"period":"May 2025","totalScore":sc,"grade":gr,"createdAt":now()}
    for iid,mid,sc,gr,fb in eval_data
])
print("✓ Inserted evaluations for new interns")

print()
print("=" * 55)
print("✅ Done! All new users added.")
print("=" * 55)
print()
print("NEW INTERN CREDENTIALS:")
print("  aditya@intern.com    / aditya1234  (DevOps)")
print("  priya.n@intern.com   / priya1234   (Data Science)")
print("  rohan@intern.com     / rohan1234   (Full Stack)")
print("  ananya@intern.com    / ananya1234  (UI/UX)")
print("  vikram@intern.com    / vikram1234  (Backend)")
print()
print("NEW MENTOR CREDENTIALS:")
print("  amit@mentor.com      / amit1234    (Full Stack)")
print("  sneha.m@mentor.com   / sneha1234   (DevOps)")
print("  vikram.m@mentor.com  / vikram1234  (Data Science)")
