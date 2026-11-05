from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os, datetime

inst_bp = Blueprint("institution", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
db = client["institution_db"]

def s(x):
    if "_id" in x: x["_id"] = str(x["_id"])
    return x

def now(): return datetime.datetime.now().isoformat()

# ── OVERVIEW ──────────────────────────────────────────────────────────────────
@inst_bp.route("/overview", methods=["GET"])
def overview():
    analytics = db["institution_score_analytics"].find_one({}) or {}
    if "_id" in analytics: analytics["_id"] = str(analytics["_id"])
    return jsonify({
        "departments": db["institution_departments"].count_documents({}),
        "organizations": db["institution_organizations"].count_documents({}),
        "internships": db["institution_internships"].count_documents({}),
        "activeInterns": db["institution_interns"].count_documents({"status":"Active"}),
        "analytics": analytics
    })

# ── ORGANIZATIONS ─────────────────────────────────────────────────────────────
@inst_bp.route("/organizations", methods=["GET"])
def get_orgs():
    return jsonify([s(o) for o in db["institution_organizations"].find()])

@inst_bp.route("/organizations", methods=["POST"])
def add_org():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["institution_organizations"].insert_one(d)
    return jsonify({"message":"Organization added","id":str(r.inserted_id)}), 201

@inst_bp.route("/organizations/<id>", methods=["PUT"])
def update_org(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_organizations"].update_one({"_id":oid},{"$set":request.json or {}})
    return jsonify({"message":"Updated"})

@inst_bp.route("/organizations/<id>", methods=["DELETE"])
def delete_org(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_organizations"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── INTERNSHIPS ───────────────────────────────────────────────────────────────
@inst_bp.route("/internships", methods=["GET"])
def get_internships():
    return jsonify([s(i) for i in db["institution_internships"].find()])

@inst_bp.route("/internships", methods=["POST"])
def add_internship():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["institution_internships"].insert_one(d)
    return jsonify({"message":"Internship created","id":str(r.inserted_id)}), 201

@inst_bp.route("/internships/<id>", methods=["DELETE"])
def delete_internship(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_internships"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── DEPARTMENTS ───────────────────────────────────────────────────────────────
@inst_bp.route("/departments", methods=["GET"])
def get_depts():
    return jsonify([s(d) for d in db["institution_departments"].find()])

@inst_bp.route("/departments", methods=["POST"])
def add_dept():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["institution_departments"].insert_one(d)
    return jsonify({"message":"Department added","id":str(r.inserted_id)}), 201

@inst_bp.route("/departments/<id>", methods=["DELETE"])
def delete_dept(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_departments"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── INTERNS ───────────────────────────────────────────────────────────────────
@inst_bp.route("/interns", methods=["GET"])
def get_interns():
    return jsonify([s(i) for i in db["institution_interns"].find()])

# ── REPORTS & ANALYTICS ───────────────────────────────────────────────────────
@inst_bp.route("/reports", methods=["GET"])
def get_reports():
    return jsonify([s(r) for r in db["institution_reports"].find()])

@inst_bp.route("/reports", methods=["POST"])
def add_report():
    d = request.json or {}
    d["uploadedOn"] = datetime.date.today().strftime("%b %d, %Y")
    r = db["institution_reports"].insert_one(d)
    return jsonify({"message":"Document added","id":str(r.inserted_id)}), 201

@inst_bp.route("/reports/<id>", methods=["DELETE"])
def delete_report(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_reports"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

@inst_bp.route("/score-analytics", methods=["GET"])
def score_analytics():
    data = db["institution_score_analytics"].find_one({}) or {}
    if "_id" in data: data["_id"] = str(data["_id"])
    return jsonify(data)

# ── COMPLETION STATUS ─────────────────────────────────────────────────────────
@inst_bp.route("/completion-status", methods=["GET"])
def completion_status():
    return jsonify([s(c) for c in db["institution_completion_status"].find()])

# ── CALENDAR ──────────────────────────────────────────────────────────────────
@inst_bp.route("/calendar", methods=["GET"])
def get_calendar():
    return jsonify([s(e) for e in db["institution_calendar"].find().sort("date",1)])

@inst_bp.route("/calendar", methods=["POST"])
def add_event():
    d = request.json or {}
    r = db["institution_calendar"].insert_one(d)
    return jsonify({"message":"Event added","id":str(r.inserted_id)}), 201

@inst_bp.route("/calendar/<id>", methods=["DELETE"])
def delete_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_calendar"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
@inst_bp.route("/notifications", methods=["GET"])
def get_notifs():
    return jsonify([s(n) for n in db["institution_notifications"].find().sort("time",-1)])

@inst_bp.route("/notifications/read-all", methods=["PATCH"])
def read_all():
    db["institution_notifications"].update_many({},{"$set":{"read":True}})
    return jsonify({"message":"All marked as read"})

# ── SETTINGS ──────────────────────────────────────────────────────────────────
@inst_bp.route("/settings", methods=["GET"])
def get_settings():
    s_data = db["institution_settings"].find_one({}) or {}
    if "_id" in s_data: s_data["_id"] = str(s_data["_id"])
    return jsonify(s_data)

@inst_bp.route("/settings", methods=["PUT"])
def update_settings():
    d = request.json or {}
    db["institution_settings"].update_one({},{"$set":d},upsert=True)
    return jsonify({"message":"Settings updated"})

# ── USER MANAGEMENT ───────────────────────────────────────────────────────────
@inst_bp.route("/users", methods=["GET"])
def get_users():
    return jsonify([s(u) for u in db["institution_users"].find()])

@inst_bp.route("/users", methods=["POST"])
def add_user():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["institution_users"].insert_one(d)
    return jsonify({"message":"User added","id":str(r.inserted_id)}), 201

@inst_bp.route("/users/<id>", methods=["DELETE"])
def delete_user(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["institution_users"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── SYSTEM ACTIVITY ───────────────────────────────────────────────────────────
@inst_bp.route("/system-activity", methods=["GET"])
def system_activity():
    return jsonify([s(a) for a in db["institution_system_activity"].find().sort("dateTime",-1)])

# ── PROFILE ───────────────────────────────────────────────────────────────────
@inst_bp.route("/profile", methods=["GET"])
def get_profile():
    from shared.models.user import users
    from bson import ObjectId as OID
    token_user_id = request.args.get("userId","")
    try:
        u = users.find_one({"_id":OID(token_user_id)})
        if u:
            u["_id"] = str(u["_id"]); u.pop("password",None)
            return jsonify(u)
    except: pass
    return jsonify({"fullName":"Admin User","email":"admin@abcit.edu.in","role":"Institution Administrator","employeeId":"ADM001","dept":"Administration","dateJoined":"Jun 18, 2025 10:30 AM","phone":"+91 98765 43210","lastLogin":"May 28, 2025 11:30 AM"})
