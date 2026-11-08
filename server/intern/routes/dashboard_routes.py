from flask import Blueprint, request, jsonify
from intern.models.db import tasks, attendance, journals
from bson import ObjectId

intern_dash_bp = Blueprint("intern_dashboard", __name__)

def serialize_doc(d):
    d["_id"] = str(d["_id"])
    return d

@intern_dash_bp.route("/summary", methods=["GET"])
def get_dashboard_summary():
    uid = request.args.get("userId", "").strip()
    if not uid:
        return jsonify({
            "totalTasks": 0,
            "pendingTasks": 0,
            "inProgressTasks": 0,
            "submittedTasks": 0,
            "completedTasks": 0,
            "rejectedTasks": 0,
            "overallProgress": 0,
            "attendance": {"total": 0, "present": 0, "percentage": 0},
            "recentActivities": [],
            "upcomingDeadlines": []
        })

    # Query tasks strictly for this intern
    user_tasks = list(tasks.find({"userId": uid}))
    total_tasks = len(user_tasks)
    completed_tasks = len([
        t for t in user_tasks 
        if str(t.get("status", "")).strip().lower() in ["completed", "approved"]
    ])
    submitted_tasks = len([
        t for t in user_tasks 
        if str(t.get("status", "")).strip().lower() in ["submitted", "under review", "pending review"]
    ])
    in_progress_tasks = len([
        t for t in user_tasks 
        if str(t.get("status", "")).strip().lower() == "in progress" and (t.get("progress") or 0) < 100
    ])
    pending_tasks = len([
        t for t in user_tasks 
        if str(t.get("status", "")).strip().lower() in ["pending", "todo", "", "none"] and (t.get("progress") or 0) < 100
    ])
    rejected_tasks = len([
        t for t in user_tasks 
        if str(t.get("status", "")).strip().lower() in ["rejected", "needs changes"]
    ])

    # Never hardcode 75%; new intern with 0 tasks must be 0%
    # Submitted tasks are awaiting mentor review and do NOT inflate completion progress until approved
    overall_progress = round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    # Query attendance strictly for this intern
    user_att = list(attendance.find({"userId": uid}))
    # Deduplicate by date to eliminate duplicate punches
    att_by_date = {}
    for a in user_att:
        d = str(a.get("date", "")).strip()
        if not d:
            continue
        if d in att_by_date:
            curr = att_by_date[d]
            if a.get("checkOut") and a.get("checkOut") != "-" and (not curr.get("checkOut") or curr.get("checkOut") == "-"):
                att_by_date[d] = a
        else:
            att_by_date[d] = a

    deduped_att = list(att_by_date.values())
    present_count = len([a for a in deduped_att if str(a.get("status", "")).strip().lower() == "present"])
    late_count = len([a for a in deduped_att if str(a.get("status", "")).strip().lower() == "late"])
    absent_count = len([a for a in deduped_att if str(a.get("status", "")).strip().lower() == "absent"])
    
    # Attended = Present + Late; Total = Present + Late + Absent
    att_attended = present_count + late_count
    att_total = present_count + late_count + absent_count
    att_pct = round((att_attended / att_total) * 100, 1) if att_total > 0 else 0

    # Query journals strictly for this intern
    user_journals = list(journals.find({"userId": uid}).sort("_id", -1).limit(5))

    # Real user activities
    activities = []
    for j in user_journals:
        activities.append({
            "type": "journal",
            "title": f"Journal: {j.get('title', 'Daily Journal')}",
            "time": j.get("date", "Recent"),
            "path": "/intern/journals"
        })
    for a in sorted(user_att, key=lambda x: str(x.get("_id", "")), reverse=True)[:3]:
        activities.append({
            "type": "attendance",
            "title": f"Attendance: {a.get('status', 'Marked')} ({a.get('checkIn', '')})",
            "time": a.get("date", "Recent"),
            "path": "/intern/attendance"
        })
    for t in sorted(user_tasks, key=lambda x: str(x.get("_id", "")), reverse=True)[:3]:
        st = str(t.get("status", "Pending"))
        act_title = f"Task: {t.get('title', '')} ({st})"
        if st.lower() == "submitted":
            act_title = f"Task Submitted: {t.get('title', '')} (Awaiting Review)"
        elif st.lower() in ["completed", "approved"]:
            act_title = f"Task Completed: {t.get('title', '')}"
        activities.append({
            "type": "task",
            "title": act_title,
            "time": t.get("dueDate", "Assigned"),
            "path": "/intern/tasks"
        })

    # Real upcoming deadlines (uncompleted tasks with a due date, excluding submitted)
    deadlines = []
    for t in user_tasks:
        st = str(t.get("status", "")).strip().lower()
        if st not in ["completed", "approved", "submitted", "under review", "pending review"] and (t.get("progress") or 0) < 100:
            deadlines.append({
                "id": str(t["_id"]),
                "title": t.get("title", ""),
                "category": t.get("category", "General"),
                "dueDate": t.get("dueDate", "No deadline"),
                "priority": t.get("priority", "Medium"),
                "status": t.get("status", "Pending")
            })

    return jsonify({
        "totalTasks": total_tasks,
        "pendingTasks": pending_tasks,
        "inProgressTasks": in_progress_tasks,
        "submittedTasks": submitted_tasks,
        "completedTasks": completed_tasks,
        "rejectedTasks": rejected_tasks,
        "overallProgress": overall_progress,
        "attendance": {
            "total": att_total,
            "present": present_count,
            "late": late_count,
            "absent": absent_count,
            "attended": att_attended,
            "percentage": att_pct
        },
        "recentActivities": activities[:6],
        "upcomingDeadlines": deadlines[:5]
    })
