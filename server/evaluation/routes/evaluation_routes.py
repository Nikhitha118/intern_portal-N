from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os, datetime

eval_portal_bp = Blueprint("eval_portal", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
db = client["evaluation_db"]

def s(x):
    if "_id" in x: x["_id"] = str(x["_id"])
    return x

def now(): return datetime.datetime.now().isoformat()

# ── EVALUATIONS ───────────────────────────────────────────────────────────────
@eval_portal_bp.route("/evaluations", methods=["GET"])
def get_evals():
    return jsonify([s(e) for e in db["evaluation_evaluations"].find().sort("dueDate",-1)])

@eval_portal_bp.route("/evaluations", methods=["POST"])
def add_eval():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["evaluation_evaluations"].insert_one(d)
    return jsonify({"message":"Evaluation added","id":str(r.inserted_id)}), 201

@eval_portal_bp.route("/evaluations/<id>", methods=["PATCH"])
def update_eval(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["evaluation_evaluations"].update_one({"_id":oid},{"$set":request.json or {}})
    return jsonify({"message":"Updated"})

@eval_portal_bp.route("/evaluations/<id>", methods=["DELETE"])
def delete_eval(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["evaluation_evaluations"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── RUBRICS ───────────────────────────────────────────────────────────────────
@eval_portal_bp.route("/rubrics", methods=["GET"])
def get_rubrics():
    return jsonify([s(r) for r in db["evaluation_rubrics"].find()])

@eval_portal_bp.route("/rubrics", methods=["POST"])
def add_rubric():
    d = request.json or {}
    d["createdAt"] = now()
    r = db["evaluation_rubrics"].insert_one(d)
    return jsonify({"message":"Rubric created","id":str(r.inserted_id)}), 201

@eval_portal_bp.route("/rubrics/<id>", methods=["DELETE"])
def delete_rubric(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["evaluation_rubrics"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── SUBMISSIONS ───────────────────────────────────────────────────────────────
@eval_portal_bp.route("/submissions", methods=["GET"])
def get_submissions():
    return jsonify([s(x) for x in db["evaluation_submissions"].find().sort("submittedOn",-1)])

@eval_portal_bp.route("/submissions", methods=["POST"])
def add_submission():
    d = request.json or {}
    d["submittedOn"] = datetime.date.today().strftime("%b %d, %Y")
    r = db["evaluation_submissions"].insert_one(d)
    return jsonify({"message":"Submission added","id":str(r.inserted_id)}), 201

@eval_portal_bp.route("/submissions/<id>/status", methods=["PATCH"])
def update_submission_status(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    db["evaluation_submissions"].update_one({"_id":oid},{"$set":{"status":d.get("status","Evaluated")}})
    return jsonify({"message":"Status updated"})

# ── SCORE ANALYTICS ───────────────────────────────────────────────────────────
@eval_portal_bp.route("/score-analytics", methods=["GET"])
def score_analytics():
    data = db["evaluation_score_analytics"].find_one({}) or {}
    if "_id" in data: data["_id"] = str(data["_id"])
    return jsonify(data)

# ── PERFORMANCE REPORTS ───────────────────────────────────────────────────────
@eval_portal_bp.route("/performance-reports", methods=["GET"])
def get_reports():
    return jsonify([s(r) for r in db["evaluation_performance_reports"].find()])

@eval_portal_bp.route("/performance-reports", methods=["POST"])
def add_report():
    d = request.json or {}
    d["generatedOn"] = datetime.date.today().strftime("%b %d, %Y")
    r = db["evaluation_performance_reports"].insert_one(d)
    return jsonify({"message":"Report generated","id":str(r.inserted_id)}), 201

@eval_portal_bp.route("/performance-reports/<id>", methods=["DELETE"])
def delete_report(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    db["evaluation_performance_reports"].delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── FEEDBACK ──────────────────────────────────────────────────────────────────
@eval_portal_bp.route("/feedback", methods=["GET"])
def get_feedback():
    return jsonify([s(f) for f in db["evaluation_feedback"].find().sort("date",-1)])

@eval_portal_bp.route("/feedback", methods=["POST"])
def add_feedback():
    d = request.json or {}
    d["date"] = datetime.date.today().strftime("%b %d, %Y")
    r = db["evaluation_feedback"].insert_one(d)
    return jsonify({"message":"Feedback added","id":str(r.inserted_id)}), 201

# ── SETTINGS ──────────────────────────────────────────────────────────────────
@eval_portal_bp.route("/settings", methods=["GET"])
def get_settings():
    data = db["evaluation_settings"].find_one({}) or {}
    if "_id" in data: data["_id"] = str(data["_id"])
    return jsonify(data)

@eval_portal_bp.route("/settings", methods=["PUT"])
def update_settings():
    db["evaluation_settings"].update_one({},{"$set":request.json or {}},upsert=True)
    return jsonify({"message":"Settings updated"})

# ── OVERVIEW ──────────────────────────────────────────────────────────────────
@eval_portal_bp.route("/overview", methods=["GET"])
def overview():
    total = db["evaluation_evaluations"].count_documents({})
    pending = db["evaluation_evaluations"].count_documents({"status":"Pending"})
    in_progress = db["evaluation_evaluations"].count_documents({"status":"In Progress"})
    completed = db["evaluation_evaluations"].count_documents({"status":"Completed"})
    analytics = db["evaluation_score_analytics"].find_one({}) or {}
    return jsonify({"total":total,"pending":pending,"inProgress":in_progress,"completed":completed,"averageScore":analytics.get("averageScore",82.4),"completionRate":analytics.get("completionRate",76)})
