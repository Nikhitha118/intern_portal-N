from config.database import mentor_db, shared_db

# Mentors list in shared_db — visible to all
mentors = shared_db["mentors"]

# Mentor-specific data in mentor_db
mentor_evaluations = mentor_db["mentor_evaluations"]
mentor_rubrics     = mentor_db["mentor_rubrics"]
mentor_submissions = mentor_db["mentor_submissions"]
mentor_feedback    = mentor_db["mentor_feedback"]
mentor_settings    = mentor_db["mentor_settings"]

DEFAULT_MENTORS = [
    {"name":"Rahul Sharma",  "email":"rahul@codecraft.io",   "role":"mentor", "company":"CodeCraft Solutions", "expertise":["Node.js","Express","MongoDB"],   "availability":"Mon–Fri\n10:00 AM–5:00 PM",  "experience":"8+ Years", "sessionsCompleted":8,  "sessionsUpcoming":2, "available":True},
    {"name":"Priya Verma",   "email":"priya@codecraft.io",   "role":"mentor", "company":"CodeCraft Solutions", "expertise":["React","Next.js","Tailwind"],    "availability":"Mon–Sat\n9:00 AM–6:00 PM",   "experience":"6+ Years", "sessionsCompleted":6,  "sessionsUpcoming":1, "available":True},
    {"name":"Amit Patel",    "email":"amit@techsolutions.io","role":"mentor", "company":"Tech Solutions",      "expertise":["JavaScript","Node.js","React"], "availability":"Mon–Fri\n11:00 AM–7:00 PM",  "experience":"7+ Years", "sessionsCompleted":5,  "sessionsUpcoming":1, "available":False},
    {"name":"Sneha Iyer",    "email":"sneha@cloudtech.io",   "role":"mentor", "company":"CloudTech",           "expertise":["AWS","Docker","CI/CD"],         "availability":"Mon–Fri\n10:00 AM–4:00 PM",  "experience":"5+ Years", "sessionsCompleted":4,  "sessionsUpcoming":0, "available":True},
    {"name":"Vikram Singh",  "email":"vikram@datalabs.io",   "role":"mentor", "company":"DataLabs Inc",        "expertise":["Python","ML","TensorFlow"],     "availability":"Mon–Thu\n9:00 AM–5:00 PM",   "experience":"4+ Years", "sessionsCompleted":3,  "sessionsUpcoming":1, "available":True},
]

def seed_mentors():
    if mentors.count_documents({}) == 0:
        mentors.insert_many(DEFAULT_MENTORS)

try:
    seed_mentors()
except Exception:
    pass

def create_mentor(name, email, role, company, expertise, availability, experience):
    return {
        "name": name, "email": email, "role": role, "company": company,
        "expertise": expertise, "availability": availability, "experience": experience,
        "sessionsCompleted": 0, "sessionsUpcoming": 0, "available": True
    }

def serialize_mentor(mentor):
    mentor["_id"] = str(mentor["_id"])
    return mentor
