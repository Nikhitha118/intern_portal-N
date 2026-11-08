from flask import Blueprint, request, jsonify
from mentor.models.db import evaluations, rubrics, submissions, feedback, client
from bson import ObjectId
import datetime

mentor_eval_bp = Blueprint("mentor_eval", __name__)
intern_db = client["intern_db"]
intern_tasks = intern_db["intern_tasks"]

def s(x):
    if not x: return x
    x = dict(x)
    x["_id"] = str(x["_id"])
    return x

# ── RUBRICS ──────────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/rubrics", methods=["GET"])
def get_rubrics():
    data = [s(r) for r in rubrics.find()]
    if not data:
        data = [
            {"name": "Technical Skills", "weight": 30, "criteria": ["Code quality", "Problem solving", "Tech usage"]},
            {"name": "Communication", "weight": 20, "criteria": ["Reports", "Presentations", "Team interaction"]},
            {"name": "Punctuality", "weight": 20, "criteria": ["Attendance", "Deadlines", "Meetings"]},
            {"name": "Task Completion", "weight": 20, "criteria": ["Tasks done", "Quality", "Initiative"]},
            {"name": "Learning & Growth", "weight": 10, "criteria": ["New skills", "Adaptability", "Self-improvement"]},
        ]
    return jsonify(data)

@mentor_eval_bp.route("/rubrics", methods=["POST"])
def create_rubric():
    d = request.json or {}
    doc = {
        "name": d.get("name"),
        "weight": d.get("weight", 20),
        "criteria": d.get("criteria", []),
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    r = rubrics.insert_one(doc)
    return jsonify({"message": "Rubric created", "id": str(r.inserted_id)}), 201

@mentor_eval_bp.route("/rubrics/<id>", methods=["DELETE"])
def delete_rubric(id):
    try: oid = ObjectId(id.strip())
    except Exception: return jsonify({"error": "Invalid ID"}), 400
    rubrics.delete_one({"_id": oid})
    return jsonify({"message": "Deleted"})

# ── EVALUATIONS ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/evaluations/submit", methods=["POST"])
@mentor_eval_bp.route("/submit", methods=["POST"])
def submit_eval():
    d = request.json or {}
    doc = {
        "internId": d.get("internId"),
        "mentorId": d.get("mentorId"),
        "scores": d.get("scores", {}),
        "feedback": d.get("feedback", ""),
        "period": d.get("period", ""),
        "totalScore": d.get("totalScore", 0),
        "grade": d.get("grade", ""),
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    r = evaluations.insert_one(doc)
    return jsonify({"message": "Evaluation submitted", "id": str(r.inserted_id)}), 201

@mentor_eval_bp.route("/evaluations/intern/<intern_id>", methods=["GET"])
@mentor_eval_bp.route("/intern/<intern_id>", methods=["GET"])
def get_evals(intern_id):
    return jsonify([s(e) for e in evaluations.find({"internId": intern_id}).sort("createdAt", -1)])

@mentor_eval_bp.route("/evaluations/all", methods=["GET"])
@mentor_eval_bp.route("/all", methods=["GET"])
def get_all_evals():
    return jsonify([s(e) for e in evaluations.find().sort("createdAt", -1)])

# ── SUBMISSIONS ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/submissions", methods=["GET"])
def get_submissions():
    intern_id = request.args.get("internId", "").strip()
    q = {}
    if intern_id:
        q = {"$or": [{"internId": intern_id}, {"internUserId": intern_id}]}
    return jsonify([s(x) for x in submissions.find(q).sort("submittedAt", -1)])

@mentor_eval_bp.route("/submissions", methods=["POST"])
def add_submission():
    d = request.json or {}
    now_iso = datetime.datetime.utcnow().isoformat()
    now_str = datetime.datetime.utcnow().strftime("%b %d, %Y")
    file_name = d.get("fileName") or d.get("file") or "submission.zip"
    task_id = str(d.get("taskId", "")).strip()
    task_name = d.get("task") or ""
    uid = str(d.get("internId") or d.get("internUserId") or "").strip()

    doc = {
        "internId": uid,
        "internUserId": uid,
        "intern": d.get("intern") or d.get("internName") or "Intern",
        "internName": d.get("intern") or d.get("internName") or "Intern",
        "taskId": task_id,
        "task": task_name,
        "fileName": file_name,
        "file": file_name,
        "fileSize": d.get("fileSize", "Unknown"),
        "fileData": d.get("fileData"),
        "fileMime": d.get("fileMime"),
        "notes": d.get("notes", ""),
        "comments": "",
        "status": "Pending Review",
        "submittedOn": now_str,
        "submittedAt": now_iso
    }
    r = submissions.insert_one(doc)

    # Sync with intern_db.intern_tasks
    task_q = None
    if task_id:
        try: task_q = {"_id": ObjectId(task_id)}
        except Exception: task_q = {"_id": task_id}
    if not task_q or not intern_tasks.find_one(task_q):
        if task_name or uid:
            task_q = {}
            if task_name: task_q["title"] = task_name
            if uid: task_q["userId"] = uid

    if task_q:
        intern_tasks.update_one(
            task_q,
            {"$set": {
                "status": "Submitted",
                "progress": 100,
                "submittedAt": now_iso,
                "submittedFile": file_name
            }}
        )

    return jsonify({"message": "Submitted", "id": str(r.inserted_id)}), 201

@mentor_eval_bp.route("/submissions/<id>/review", methods=["PATCH"])
def review_submission(id):
    sub = None
    try:
        sub = submissions.find_one({"_id": ObjectId(id.strip())})
    except Exception:
        sub = submissions.find_one({"_id": id.strip()})

    if not sub:
        return jsonify({"error": "Submission not found"}), 404

    d = request.json or {}
    new_status = d.get("status", "Approved")
    comments = d.get("comments") or d.get("note") or d.get("reviewNote", "")
    score = d.get("score")
    now_iso = datetime.datetime.utcnow().isoformat()

    update_fields = {
        "status": new_status,
        "comments": comments,
        "reviewNote": comments,
        "reviewedAt": now_iso
    }
    if score is not None:
        update_fields["score"] = score

    submissions.update_one({"_id": sub["_id"]}, {"$set": update_fields})

    # Synchronize corresponding task in intern_db.intern_tasks
    status_lower = str(new_status).strip().lower()
    if status_lower in ["approved", "completed"]:
        task_status = "Completed"
        task_progress = 100
    elif status_lower in ["rejected", "needs changes"]:
        task_status = "Rejected"
        task_progress = 0
    else:
        task_status = "Under Review"
        task_progress = 50

    task_id = sub.get("taskId")
    intern_uid = sub.get("internUserId") or sub.get("internId")
    task_title = sub.get("task")

    task_q = None
    if task_id:
        try:
            task_q = {"_id": ObjectId(str(task_id))}
        except Exception:
            task_q = {"_id": str(task_id)}

    if not task_q or not intern_tasks.find_one(task_q):
        q = {}
        if task_title:
            q["title"] = task_title
        if intern_uid:
            q["userId"] = str(intern_uid)
        if q:
            task_q = q

    if task_q:
        intern_tasks.update_one(
            task_q,
            {"$set": {
                "status": task_status,
                "progress": task_progress,
                "reviewStatus": new_status,
                "reviewComments": comments,
                "reviewedAt": now_iso
            }}
        )

    return jsonify({
        "message": "Reviewed and synchronized with intern task",
        "status": new_status,
        "taskStatus": task_status
    })

# ── FEEDBACK ──────────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/feedback", methods=["POST"])
def add_feedback():
    d = request.json or {}
    doc = {
        "from": d.get("from"),
        "to": d.get("to"),
        "text": d.get("text", ""),
        "rating": d.get("rating", 5),
        "date": datetime.datetime.utcnow().isoformat()
    }
    r = feedback.insert_one(doc)
    return jsonify({"message": "Feedback added", "id": str(r.inserted_id)}), 201

@mentor_eval_bp.route("/feedback", methods=["GET"])
def get_feedback():
    mentor_id = request.args.get("mentorId", "")
    q = {"from": mentor_id} if mentor_id else {}
    return jsonify([s(f) for f in feedback.find(q).sort("date", -1)])

# ── PERFORMANCE ───────────────────────────────────────────────────────────────
@mentor_eval_bp.route("/performance/<intern_id>", methods=["GET"])
def performance(intern_id):
    all_tasks = list(intern_tasks.find({"userId": intern_id}))
    from intern.models.db import attendance as intern_attendance
    all_att = list(intern_attendance.find({"userId": intern_id}))
    total_t = len(all_tasks)
    done_t = len([t for t in all_tasks if t.get("status") in ["Completed", "Approved"]])
    submitted_t = len([t for t in all_tasks if t.get("status") in ["Submitted", "Under Review"]])
    total_a = len(all_att)
    present = len([a for a in all_att if a.get("status") == "Present"])
    eval_list = list(evaluations.find({"internId": intern_id}))
    avg = round(sum(e.get("totalScore", 0) for e in eval_list) / len(eval_list), 1) if eval_list else 0
    return jsonify({
        "internId": intern_id,
        "tasks": {
            "total": total_t,
            "completed": done_t,
            "submitted": submitted_t,
            "completionRate": round(done_t / total_t * 100, 1) if total_t else 0
        },
        "attendance": {
            "total": total_a,
            "present": present,
            "percentage": round(present / total_a * 100, 1) if total_a else 0
        },
        "evaluation": {
            "count": len(eval_list),
            "averageScore": avg,
            "grade": "A" if avg >= 90 else "B" if avg >= 75 else "C" if avg >= 60 else "D"
        },
        "overallScore": round((done_t / total_t * 100 * 0.4 + (present / total_a * 100 if total_a else 0) * 0.3 + avg * 0.3), 1) if total_t else 0
    })
