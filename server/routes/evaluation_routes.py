from flask import Blueprint, request, jsonify
from bson import ObjectId
from config.database import db
import datetime

evaluation_bp = Blueprint("evaluation_bp", __name__)

evaluations = db["evaluations"]
rubrics = db["rubrics"]

# ─── EVALUATION RUBRICS ───────────────────────────────────────────────────────

@evaluation_bp.route("/rubrics", methods=["GET"])
def get_rubrics():
    """Get all evaluation rubrics"""
    data = []
    for r in rubrics.find():
        r["_id"] = str(r["_id"])
        data.append(r)
    if not data:
        # Return default rubrics if none exist
        data = [
            {"name": "Technical Skills",    "weight": 30, "criteria": ["Code quality", "Problem solving", "Technology usage"]},
            {"name": "Communication",        "weight": 20, "criteria": ["Written reports", "Presentations", "Team interaction"]},
            {"name": "Punctuality",          "weight": 20, "criteria": ["Attendance", "Deadline adherence", "Meeting attendance"]},
            {"name": "Task Completion",      "weight": 20, "criteria": ["Tasks completed", "Quality of work", "Initiative"]},
            {"name": "Learning & Growth",    "weight": 10, "criteria": ["New skills", "Adaptability", "Self-improvement"]},
        ]
    return jsonify(data)


@evaluation_bp.route("/rubrics", methods=["POST"])
def create_rubric():
    data = request.json
    result = rubrics.insert_one({
        "name": data.get("name"),
        "weight": data.get("weight", 20),
        "criteria": data.get("criteria", []),
        "createdAt": datetime.datetime.utcnow().isoformat()
    })
    return jsonify({"message": "Rubric created", "id": str(result.inserted_id)}), 201


# ─── EVALUATIONS ──────────────────────────────────────────────────────────────

@evaluation_bp.route("/submit", methods=["POST"])
def submit_evaluation():
    """Mentor submits evaluation for an intern"""
    data = request.json
    evaluation = {
        "internId":   data.get("internId"),
        "mentorId":   data.get("mentorId"),
        "scores":     data.get("scores", {}),   # { rubricName: score }
        "feedback":   data.get("feedback", ""),
        "period":     data.get("period", ""),
        "totalScore": data.get("totalScore", 0),
        "grade":      data.get("grade", ""),
        "createdAt":  datetime.datetime.utcnow().isoformat()
    }
    result = evaluations.insert_one(evaluation)
    return jsonify({"message": "Evaluation submitted", "id": str(result.inserted_id)}), 201


@evaluation_bp.route("/intern/<intern_id>", methods=["GET"])
def get_intern_evaluations(intern_id):
    """Get all evaluations for an intern"""
    data = []
    for e in evaluations.find({"internId": intern_id}).sort("createdAt", -1):
        e["_id"] = str(e["_id"])
        data.append(e)
    return jsonify(data)


@evaluation_bp.route("/performance/<intern_id>", methods=["GET"])
def get_performance_analytics(intern_id):
    """Get performance analytics for an intern"""
    from models.task import tasks
    from models.attendence import attendance

    # Task stats
    all_tasks = list(tasks.find({"userId": intern_id}))
    total_tasks = len(all_tasks)
    completed = len([t for t in all_tasks if t.get("status") in ["Completed", "Submitted"]])
    pending = len([t for t in all_tasks if t.get("status") == "Pending"])
    in_progress = len([t for t in all_tasks if t.get("status") == "In Progress"])
    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0

    # Attendance stats
    all_att = list(attendance.find({"userId": intern_id}))
    total_att = len(all_att)
    present = len([a for a in all_att if a.get("status") == "Present"])
    absent = len([a for a in all_att if a.get("status") == "Absent"])
    late = len([a for a in all_att if a.get("status") == "Late"])
    att_rate = round((present / total_att * 100), 1) if total_att > 0 else 92

    # Evaluation scores
    eval_list = list(evaluations.find({"internId": intern_id}).sort("createdAt", -1))
    avg_score = 0
    if eval_list:
        avg_score = round(sum(e.get("totalScore", 0) for e in eval_list) / len(eval_list), 1)

    return jsonify({
        "internId": intern_id,
        "tasks": {
            "total": total_tasks, "completed": completed,
            "pending": pending, "inProgress": in_progress,
            "completionRate": completion_rate
        },
        "attendance": {
            "total": total_att, "present": present,
            "absent": absent, "late": late,
            "percentage": att_rate
        },
        "evaluation": {
            "count": len(eval_list),
            "averageScore": avg_score,
            "grade": "A" if avg_score >= 90 else "B" if avg_score >= 75 else "C" if avg_score >= 60 else "D"
        },
        "overallScore": round((completion_rate * 0.4 + att_rate * 0.3 + avg_score * 0.3), 1)
    })


# ─── DOCUMENT SUBMISSIONS ─────────────────────────────────────────────────────

submissions = db["submissions"]

@evaluation_bp.route("/submissions", methods=["POST"])
def submit_document():
    """Intern submits a document for a task"""
    data = request.json
    doc = {
        "internId":  data.get("internId"),
        "taskId":    data.get("taskId"),
        "fileName":  data.get("fileName"),
        "fileSize":  data.get("fileSize"),
        "fileType":  data.get("fileType"),
        "notes":     data.get("notes", ""),
        "status":    "Submitted",
        "submittedAt": datetime.datetime.utcnow().isoformat()
    }
    result = submissions.insert_one(doc)
    # Update task status to Submitted
    if data.get("taskId"):
        from models.task import tasks
        try:
            tasks.update_one({"_id": ObjectId(data["taskId"])}, {"$set": {"status": "Submitted", "progress": 100}})
        except Exception:
            pass
    return jsonify({"message": "Document submitted", "id": str(result.inserted_id)}), 201


@evaluation_bp.route("/submissions/<intern_id>", methods=["GET"])
def get_submissions(intern_id):
    data = []
    for s in submissions.find({"internId": intern_id}).sort("submittedAt", -1):
        s["_id"] = str(s["_id"])
        data.append(s)
    return jsonify(data)


# ─── INSTITUTION MONITORING ───────────────────────────────────────────────────

@evaluation_bp.route("/monitor/overview", methods=["GET"])
def institution_overview():
    """Institution-level overview of all interns"""
    from models.user import users
    from models.task import tasks
    from models.attendence import attendance

    all_interns = list(users.find({"role": {"$in": ["intern", "student"]}}))
    overview = []
    for intern in all_interns:
        iid = str(intern["_id"])
        t_total = tasks.count_documents({"userId": iid})
        t_done = tasks.count_documents({"userId": iid, "status": {"$in": ["Completed", "Submitted"]}})
        a_total = attendance.count_documents({"userId": iid})
        a_present = attendance.count_documents({"userId": iid, "status": "Present"})
        overview.append({
            "internId": iid,
            "name": intern.get("fullName", ""),
            "email": intern.get("email", ""),
            "tasksTotal": t_total,
            "tasksCompleted": t_done,
            "completionRate": round(t_done/t_total*100, 1) if t_total > 0 else 0,
            "attendanceRate": round(a_present/a_total*100, 1) if a_total > 0 else 0,
        })
    return jsonify({"total": len(overview), "interns": overview})
