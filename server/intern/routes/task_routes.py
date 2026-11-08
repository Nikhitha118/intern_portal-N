from flask import Blueprint, request, jsonify
from intern.models.db import tasks, client
from bson import ObjectId
import datetime

intern_task_bp = Blueprint("intern_tasks", __name__)
mentor_db = client["mentor_db"]
mentor_submissions = mentor_db["mentor_submissions"]

def s(t):
    if not t: return t
    t = dict(t)
    t["_id"] = str(t["_id"])
    return t

@intern_task_bp.route("/summary", methods=["GET"])
def task_summary():
    uid = request.args.get("userId", "").strip()
    q = {"userId": uid} if uid else {}
    user_tasks = list(tasks.find(q))
    total = len(user_tasks)
    completed = len([t for t in user_tasks if str(t.get("status", "")).strip().lower() in ["completed", "approved"]])
    submitted = len([t for t in user_tasks if str(t.get("status", "")).strip().lower() in ["submitted", "under review", "pending review"]])
    in_progress = len([t for t in user_tasks if str(t.get("status", "")).strip().lower() == "in progress" and (t.get("progress") or 0) < 100])
    pending = len([t for t in user_tasks if str(t.get("status", "")).strip().lower() in ["pending", "todo", "", "none"] and (t.get("progress") or 0) < 100])
    rejected = len([t for t in user_tasks if str(t.get("status", "")).strip().lower() in ["rejected", "needs changes"]])
    progress = round((completed / total) * 100) if total > 0 else 0
    return jsonify({
        "totalTasks": total,
        "completedTasks": completed,
        "submittedTasks": submitted,
        "inProgressTasks": in_progress,
        "pendingTasks": pending,
        "rejectedTasks": rejected,
        "progress": progress
    })

@intern_task_bp.route("/", methods=["GET"])
@intern_task_bp.route("", methods=["GET"])
def get_tasks():
    uid = request.args.get("userId", "").strip()
    q = {"userId": uid} if uid else {}
    user_tasks = list(tasks.find(q))
    return jsonify([s(t) for t in user_tasks])

@intern_task_bp.route("/", methods=["POST"])
@intern_task_bp.route("", methods=["POST"])
def add_task():
    d = request.json or {}
    if not d.get("title"): return jsonify({"error": "title required"}), 400
    doc = {
        "title": d.get("title"),
        "category": d.get("category", "Backend"),
        "dueDate": d.get("dueDate", ""),
        "priority": d.get("priority", "Medium"),
        "status": d.get("status", "Pending"),
        "progress": d.get("progress", 0),
        "description": d.get("description", ""),
        "userId": d.get("userId"),
        "attachments": []
    }
    r = tasks.insert_one(doc)
    return jsonify({"message": "Task created", "id": str(r.inserted_id)}), 201

@intern_task_bp.route("/<id>", methods=["PUT"])
def update_task(id):
    try: oid = ObjectId(id.strip())
    except Exception: return jsonify({"error": "Invalid ID"}), 400
    d = request.json or {}
    fields = {k: d[k] for k in ["title", "category", "dueDate", "priority", "status", "progress", "description"] if k in d}
    tasks.update_one({"_id": oid}, {"$set": fields})
    return jsonify({"message": "Updated"})

@intern_task_bp.route("/<id>", methods=["DELETE"])
def delete_task(id):
    try: oid = ObjectId(id.strip())
    except Exception: return jsonify({"error": "Invalid ID"}), 400
    tasks.delete_one({"_id": oid})
    return jsonify({"message": "Deleted"})

@intern_task_bp.route("/<id>/status", methods=["PATCH"])
def patch_status(id):
    try: oid = ObjectId(id.strip())
    except Exception: return jsonify({"error": "Invalid ID"}), 400
    d = request.json or {}
    fields = {k: d[k] for k in ["status", "progress"] if k in d}
    tasks.update_one({"_id": oid}, {"$set": fields})
    return jsonify({"message": "Status updated"})

@intern_task_bp.route("/<id>/submit", methods=["POST"])
def submit_task(id):
    d = request.json or {}
    uid = str(d.get("userId", "")).strip()
    user_name = d.get("userName") or d.get("internName") or "Intern"
    file_name = d.get("fileName") or "solution.zip"
    file_size = d.get("fileSize") or "Unknown"
    file_data = d.get("fileData")
    file_mime = d.get("fileMime")
    notes = d.get("notes") or d.get("comments") or ""
    task_title = d.get("taskTitle") or ""

    task = None
    try:
        task = tasks.find_one({"_id": ObjectId(id.strip())})
    except Exception:
        task = tasks.find_one({"_id": id.strip()})

    if not task and (task_title or uid):
        q = {}
        if task_title:
            q["title"] = task_title
        if uid:
            q["userId"] = uid
        task = tasks.find_one(q)

    # If task doesn't exist yet in intern_tasks, insert it
    if not task:
        new_task = {
            "title": task_title or "Task",
            "category": d.get("category", "Backend"),
            "dueDate": d.get("dueDate", ""),
            "priority": d.get("priority", "Medium"),
            "status": "Submitted",
            "progress": 100,
            "description": notes,
            "userId": uid,
            "attachments": []
        }
        res = tasks.insert_one(new_task)
        task = tasks.find_one({"_id": res.inserted_id})

    now_iso = datetime.datetime.utcnow().isoformat()
    now_str = datetime.datetime.utcnow().strftime("%b %d, %Y")

    submission_info = {
        "fileName": file_name,
        "fileSize": file_size,
        "submittedAt": now_iso,
        "submittedOn": now_str,
        "notes": notes,
        "status": "Pending Review"
    }

    # 1. Update task in intern_db.intern_tasks: mark as Submitted (NOT Completed!)
    tasks.update_one(
        {"_id": task["_id"]},
        {"$set": {
            "status": "Submitted",
            "progress": 100,
            "submittedAt": now_iso,
            "submittedFile": file_name,
            "submission": submission_info
        }}
    )

    # 2. Record submission in mentor_db.mentor_submissions for mentor review
    sub_doc = {
        "internId": str(uid),
        "internUserId": str(uid),
        "intern": user_name,
        "internName": user_name,
        "taskId": str(task["_id"]),
        "task": task.get("title", task_title),
        "file": file_name,
        "fileName": file_name,
        "fileSize": file_size,
        "fileData": file_data,
        "fileMime": file_mime,
        "notes": notes,
        "comments": "",
        "status": "Pending Review",
        "submittedOn": now_str,
        "submittedAt": now_iso
    }

    existing_sub = mentor_submissions.find_one({
        "taskId": str(task["_id"]),
        "internUserId": str(uid)
    })
    if existing_sub:
        mentor_submissions.update_one(
            {"_id": existing_sub["_id"]},
            {"$set": sub_doc}
        )
        sub_id = str(existing_sub["_id"])
    else:
        sub_res = mentor_submissions.insert_one(sub_doc)
        sub_id = str(sub_res.inserted_id)

    updated_task = tasks.find_one({"_id": task["_id"]})
    return jsonify({
        "message": "Task submitted successfully",
        "task": s(updated_task),
        "submissionId": sub_id,
        "status": "Submitted"
    }), 200
