from flask import Blueprint, request, jsonify
from mentor.models.db import evaluations, rubrics, submissions, feedback
from bson import ObjectId
import datetime

mentor_eval_bp = Blueprint("mentor_eval", __name__)

def s(x): x["_id"]=str(x["_id"]); return x

# ── RUBRICS ──────────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/rubrics", methods=["GET"])
def get_rubrics():
    data = [s(r) for r in rubrics.find()]
    if not data:
        data = [
            {"name":"Technical Skills",   "weight":30,"criteria":["Code quality","Problem solving","Tech usage"]},
            {"name":"Communication",       "weight":20,"criteria":["Reports","Presentations","Team interaction"]},
            {"name":"Punctuality",         "weight":20,"criteria":["Attendance","Deadlines","Meetings"]},
            {"name":"Task Completion",     "weight":20,"criteria":["Tasks done","Quality","Initiative"]},
            {"name":"Learning & Growth",   "weight":10,"criteria":["New skills","Adaptability","Self-improvement"]},
        ]
    return jsonify(data)

@mentor_eval_bp.route("/rubrics", methods=["POST"])
def create_rubric():
    d = request.json or {}
    doc = {"name":d.get("name"),"weight":d.get("weight",20),"criteria":d.get("criteria",[]),"createdAt":datetime.datetime.utcnow().isoformat()}
    r = rubrics.insert_one(doc)
    return jsonify({"message":"Rubric created","id":str(r.inserted_id)}), 201

@mentor_eval_bp.route("/rubrics/<id>", methods=["DELETE"])
def delete_rubric(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    rubrics.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

# ── EVALUATIONS ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/submit", methods=["POST"])
def submit_eval():
    d = request.json or {}
    doc = {"internId":d.get("internId"),"mentorId":d.get("mentorId"),"scores":d.get("scores",{}),"feedback":d.get("feedback",""),"period":d.get("period",""),"totalScore":d.get("totalScore",0),"grade":d.get("grade",""),"createdAt":datetime.datetime.utcnow().isoformat()}
    r = evaluations.insert_one(doc)
    return jsonify({"message":"Evaluation submitted","id":str(r.inserted_id)}), 201

@mentor_eval_bp.route("/intern/<intern_id>", methods=["GET"])
def get_evals(intern_id):
    return jsonify([s(e) for e in evaluations.find({"internId":intern_id}).sort("createdAt",-1)])

@mentor_eval_bp.route("/all", methods=["GET"])
def get_all_evals():
    return jsonify([s(e) for e in evaluations.find().sort("createdAt",-1)])

# ── SUBMISSIONS ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/submissions", methods=["GET"])
def get_submissions():
    intern_id = request.args.get("internId","")
    q = {"internId":intern_id} if intern_id else {}
    return jsonify([s(x) for x in submissions.find(q).sort("submittedAt",-1)])

@mentor_eval_bp.route("/submissions", methods=["POST"])
def add_submission():
    d = request.json or {}
    doc = {"internId":d.get("internId"),"taskId":d.get("taskId"),"fileName":d.get("fileName"),"fileSize":d.get("fileSize"),"notes":d.get("notes",""),"status":"Submitted","submittedAt":datetime.datetime.utcnow().isoformat()}
    r = submissions.insert_one(doc)
    return jsonify({"message":"Submitted","id":str(r.inserted_id)}), 201

@mentor_eval_bp.route("/submissions/<id>/review", methods=["PATCH"])
def review_submission(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    submissions.update_one({"_id":oid},{"$set":{"status":d.get("status","Reviewed"),"reviewNote":d.get("note","")}})
    return jsonify({"message":"Reviewed"})

# ── FEEDBACK ──────────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/feedback", methods=["POST"])
def add_feedback():
    d = request.json or {}
    doc = {"from":d.get("from"),"to":d.get("to"),"text":d.get("text",""),"rating":d.get("rating",5),"date":datetime.datetime.utcnow().isoformat()}
    r = feedback.insert_one(doc)
    return jsonify({"message":"Feedback added","id":str(r.inserted_id)}), 201

@mentor_eval_bp.route("/feedback", methods=["GET"])
def get_feedback():
    mentor_id = request.args.get("mentorId","")
    q = {"from":mentor_id} if mentor_id else {}
    return jsonify([s(f) for f in feedback.find(q).sort("date",-1)])

# ── PERFORMANCE ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/performance/<intern_id>", methods=["GET"])
def performance(intern_id):
    from pymongo import MongoClient
    import os
    c = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
    intern_db = c["intern_db"]
    all_tasks = list(intern_db["intern_tasks"].find({"userId":intern_id}))
    all_att   = list(intern_db["intern_attendance"].find({"userId":intern_id}))
    total_t = len(all_tasks)
    done_t  = len([t for t in all_tasks if t.get("status") in ["Completed","Submitted"]])
    total_a = len(all_att)
    present = len([a for a in all_att if a.get("status")=="Present"])
    eval_list = list(evaluations.find({"internId":intern_id}))
    avg = round(sum(e.get("totalScore",0) for e in eval_list)/len(eval_list),1) if eval_list else 0
    return jsonify({
        "internId":intern_id,
        "tasks":{"total":total_t,"completed":done_t,"completionRate":round(done_t/total_t*100,1) if total_t else 0},
        "attendance":{"total":total_a,"present":present,"percentage":round(present/total_a*100,1) if total_a else 0},
        "evaluation":{"count":len(eval_list),"averageScore":avg,"grade":"A" if avg>=90 else "B" if avg>=75 else "C" if avg>=60 else "D"},
        "overallScore":round((done_t/total_t*100*0.4 + (present/total_a*100 if total_a else 0)*0.3 + avg*0.3),1) if total_t else 0
    })
