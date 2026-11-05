"""
Admin Portal Routes — Full access to ALL portals data
URL prefix: /admin
"""
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os, datetime

admin_bp = Blueprint("admin_portal", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))

# All databases
shared_db  = client["shared_db"]
intern_db  = client["intern_db"]
mentor_db  = client["mentor_db"]
eval_db    = client["evaluation_db"]
inst_db    = client["institution_db"]
admin_db   = client["admin_db"]

def s(x):
    if "_id" in x: x["_id"] = str(x["_id"])
    return x

def now(): return datetime.datetime.now().isoformat()

# ── OVERVIEW — sees ALL portals ───────────────────────────────────────────────
@admin_bp.route("/overview", methods=["GET"])
def overview():
    return jsonify({
        "users": {
            "total": shared_db["users"].count_documents({}),
            "interns": shared_db["users"].count_documents({"role":"intern"}),
            "mentors": shared_db["users"].count_documents({"role":"mentor"}),
            "admins": shared_db["users"].count_documents({"role":"admin"}),
            "institutions": shared_db["users"].count_documents({"role":"institution"}),
        },
        "intern": {
            "tasks": intern_db["intern_tasks"].count_documents({}),
            "journals": intern_db["intern_journals"].count_documents({}),
            "attendance": intern_db["intern_attendance"].count_documents({}),
        },
        "mentor": {
            "evaluations": mentor_db["mentor_evaluations"].count_documents({}),
            "submissions": mentor_db["mentor_submissions"].count_documents({}),
            "rubrics": mentor_db["mentor_rubrics"].count_documents({}),
        },
        "evaluation": {
            "evaluations": eval_db["evaluation_evaluations"].count_documents({}),
            "rubrics": eval_db["evaluation_rubrics"].count_documents({}),
            "submissions": eval_db["evaluation_submissions"].count_documents({}),
        },
        "institution": {
            "organizations": inst_db["institution_organizations"].count_documents({}),
            "internships": inst_db["institution_internships"].count_documents({}),
            "departments": inst_db["institution_departments"].count_documents({}),
        },
    })

# ── USERS (shared_db) ─────────────────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
def get_users():
    users = list(shared_db["users"].find())
    for u in users: u["_id"]=str(u["_id"]); u.pop("password",None)
    return jsonify(users)

@admin_bp.route("/users/<uid>", methods=["GET"])
def get_user(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    u = shared_db["users"].find_one({"_id":oid})
    if not u: return jsonify({"error":"Not found"}), 404
    u["_id"]=str(u["_id"]); u.pop("password",None)
    return jsonify(u)

@admin_bp.route("/users/<uid>", methods=["PUT"])
def update_user(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    d.pop("password",None)
    shared_db["users"].update_one({"_id":oid},{"$set":d})
    admin_db["admin_logs"].insert_one({"action":"update_user","userId":uid,"by":"admin","at":now()})
    return jsonify({"message":"User updated"})

@admin_bp.route("/users/<uid>", methods=["DELETE"])
def delete_user(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    shared_db["users"].delete_one({"_id":oid})
    intern_db["intern_tasks"].delete_many({"userId":uid})
    intern_db["intern_journals"].delete_many({"userId":uid})
    intern_db["intern_attendance"].delete_many({"userId":uid})
    admin_db["admin_logs"].insert_one({"action":"delete_user","userId":uid,"by":"admin","at":now()})
    return jsonify({"message":"User and all data deleted"})

@admin_bp.route("/users/<uid>/role", methods=["PATCH"])
def change_role(uid):
    try: oid = ObjectId(uid.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    role = (request.json or {}).get("role","intern")
    shared_db["users"].update_one({"_id":oid},{"$set":{"role":role}})
    admin_db["admin_logs"].insert_one({"action":"change_role","userId":uid,"newRole":role,"by":"admin","at":now()})
    return jsonify({"message":f"Role changed to {role}"})

# ── INTERN DATA ───────────────────────────────────────────────────────────────
@admin_bp.route("/intern/tasks", methods=["GET"])
def all_tasks():
    return jsonify([s(t) for t in intern_db["intern_tasks"].find()])

@admin_bp.route("/intern/tasks/<id>", methods=["DELETE"])
def delete_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    intern_db["intern_tasks"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

@admin_bp.route("/intern/attendance", methods=["GET"])
def all_attendance():
    return jsonify([s(a) for a in intern_db["intern_attendance"].find()])

@admin_bp.route("/intern/journals", methods=["GET"])
def all_journals():
    return jsonify([s(j) for j in intern_db["intern_journals"].find()])

# ── MENTOR DATA ───────────────────────────────────────────────────────────────
@admin_bp.route("/mentor/evaluations", methods=["GET"])
def all_mentor_evals():
    return jsonify([s(e) for e in mentor_db["mentor_evaluations"].find()])

@admin_bp.route("/mentor/submissions", methods=["GET"])
def all_mentor_subs():
    return jsonify([s(x) for x in mentor_db["mentor_submissions"].find()])

@admin_bp.route("/mentor/rubrics", methods=["GET"])
def all_mentor_rubrics():
    return jsonify([s(r) for r in mentor_db["mentor_rubrics"].find()])

# ── EVALUATION DATA ───────────────────────────────────────────────────────────
@admin_bp.route("/evaluation/evaluations", methods=["GET"])
def all_eval_evals():
    return jsonify([s(e) for e in eval_db["evaluation_evaluations"].find()])

@admin_bp.route("/evaluation/submissions", methods=["GET"])
def all_eval_subs():
    return jsonify([s(x) for x in eval_db["evaluation_submissions"].find()])

# ── INSTITUTION DATA ──────────────────────────────────────────────────────────
@admin_bp.route("/institution/organizations", methods=["GET"])
def all_orgs():
    return jsonify([s(o) for o in inst_db["institution_organizations"].find()])

@admin_bp.route("/institution/internships", methods=["GET"])
def all_internships():
    return jsonify([s(i) for i in inst_db["institution_internships"].find()])

@admin_bp.route("/institution/departments", methods=["GET"])
def all_depts():
    return jsonify([s(d) for d in inst_db["institution_departments"].find()])

# ── ADMIN LOGS ────────────────────────────────────────────────────────────────
@admin_bp.route("/logs", methods=["GET"])
def get_logs():
    return jsonify([s(l) for l in admin_db["admin_logs"].find().sort("at",-1).limit(100)])

@admin_bp.route("/logs", methods=["POST"])
def add_log():
    d = request.json or {}
    d["at"] = now()
    r = admin_db["admin_logs"].insert_one(d)
    return jsonify({"message":"Log added","id":str(r.inserted_id)}), 201

# ── ADMIN SETTINGS ────────────────────────────────────────────────────────────
@admin_bp.route("/settings", methods=["GET"])
def get_settings():
    data = admin_db["admin_settings"].find_one({}) or {"systemName":"InternPortal","version":"3.0","maintenanceMode":False}
    if "_id" in data: data["_id"] = str(data["_id"])
    return jsonify(data)

@admin_bp.route("/settings", methods=["PUT"])
def update_settings():
    admin_db["admin_settings"].update_one({},{"$set":request.json or {}},upsert=True)
    return jsonify({"message":"Settings updated"})

# ── SYSTEM STATS ──────────────────────────────────────────────────────────────
@admin_bp.route("/stats", methods=["GET"])
def system_stats():
    dbs = ["shared_db","intern_db","mentor_db","evaluation_db","institution_db","admin_db"]
    stats = {}
    for db_name in dbs:
        db = client[db_name]
        stats[db_name] = {col: db[col].count_documents({}) for col in db.list_collection_names()}
    return jsonify(stats)
