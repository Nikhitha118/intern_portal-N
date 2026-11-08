from flask import Blueprint, request, jsonify
from intern.models.db import attendance
from bson import ObjectId
from datetime import datetime

intern_att_bp = Blueprint("intern_attendance", __name__)

def s(a):
    a["_id"] = str(a["_id"])
    return a

def parse_date_obj(date_str):
    if not date_str:
        return datetime.min
    d = str(date_str).strip()
    for fmt in ["%b %d, %Y", "%B %d, %Y", "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y"]:
        try:
            return datetime.strptime(d, fmt)
        except ValueError:
            pass
    return datetime.min

def deduplicate_records_by_date(records):
    """
    Deduplicates attendance records for a single user by date.
    Preserves records with checkOut or the most recent record for that date.
    """
    by_date = {}
    for r in records:
        d = str(r.get("date", "")).strip()
        if not d:
            continue
        if d in by_date:
            curr = by_date[d]
            curr_has_co = curr.get("checkOut") and curr.get("checkOut") != "-"
            new_has_co = r.get("checkOut") and r.get("checkOut") != "-"
            if new_has_co and not curr_has_co:
                by_date[d] = r
            elif str(r.get("_id", "")) > str(curr.get("_id", "")) and not curr_has_co:
                by_date[d] = r
        else:
            by_date[d] = r
    
    # Sort chronologically descending
    sorted_recs = sorted(by_date.values(), key=lambda x: parse_date_obj(x.get("date")), reverse=True)
    return sorted_recs

def calculate_stats(deduped_records):
    """
    Defined Attendance Formula:
    - Present Days: Count of unique eligible days with status 'Present'
    - Late Entries: Count of unique eligible days with status 'Late' (attended, arrived late)
    - Absent Days: Count of unique eligible days with status 'Absent'
    - Attended Days: Present Days + Late Entries (no double counting)
    - Total Eligible Attendance Days: Present Days + Late Entries + Absent Days
    - Attendance Percentage: (Attended Days / Total Eligible Attendance Days) * 100
    - If total == 0: displays 0.0%
    """
    present = 0
    late = 0
    absent = 0

    for r in deduped_records:
        st = str(r.get("status", "")).strip().capitalize()
        if st == "Present":
            present += 1
        elif st == "Late":
            late += 1
        elif st == "Absent":
            absent += 1
        else:
            # Default fallback for unrecognized positive attendance
            present += 1

    attended = present + late
    total = present + late + absent
    pct = round((attended / total) * 100, 1) if total > 0 else 0.0

    return {
        "total": total,
        "present": present,
        "late": late,
        "absent": absent,
        "attended": attended,
        "percentage": pct
    }

@intern_att_bp.route("/checkin", methods=["POST"])
def checkin():
    d = request.json or {}
    uid = str(d.get("userId", "")).strip()
    if not uid:
        return jsonify({"error": "userId is required"}), 400

    date_str = str(d.get("date", "")).strip() or datetime.now().strftime("%b %d, %Y")
    status = str(d.get("status", "Present")).strip().capitalize()
    if status not in ["Present", "Late", "Absent"]:
        status = "Present"

    # Avoid duplicate check-ins for the same user and date
    existing = attendance.find_one({"userId": uid, "date": date_str})
    if existing:
        update_fields = {
            "status": status,
            "location": d.get("location") or existing.get("location", ""),
        }
        if d.get("checkIn") and d.get("checkIn") != "-":
            update_fields["checkIn"] = d.get("checkIn")
        attendance.update_one({"_id": existing["_id"]}, {"$set": update_fields})
        return jsonify({"message": "Attendance updated", "id": str(existing["_id"])}), 200

    doc = {
        "internName": d.get("internName", ""),
        "date": date_str,
        "checkIn": d.get("checkIn", "-"),
        "checkOut": "-",
        "status": status,
        "location": d.get("location", ""),
        "hours": "-",
        "userId": uid
    }
    r = attendance.insert_one(doc)
    return jsonify({"message": "Checked in", "id": str(r.inserted_id)}), 201

@intern_att_bp.route("/checkout/<id>", methods=["PATCH"])
def checkout(id):
    try:
        oid = ObjectId(id.strip())
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    d = request.json or {}
    co = d.get("checkOut", "-")
    rec = attendance.find_one({"_id": oid})
    if not rec:
        return jsonify({"error": "Record not found"}), 404

    hours = "-"
    ci = rec.get("checkIn", "-")
    date_str = rec.get("date", "")
    if ci != "-" and co != "-":
        try:
            t1 = datetime.strptime(f"{date_str} {ci}", "%b %d, %Y %I:%M %p")
            t2 = datetime.strptime(f"{date_str} {co}", "%b %d, %Y %I:%M %p")
            diff_sec = max(0, int((t2 - t1).total_seconds()))
            h = diff_sec // 3600
            m = (diff_sec % 3600) // 60
            hours = f"{h}h {m}m"
        except Exception:
            pass

    attendance.update_one({"_id": oid}, {"$set": {"checkOut": co, "hours": hours}})
    return jsonify({"message": "Checked out", "hours": hours})

@intern_att_bp.route("/all", methods=["GET"])
def get_all():
    uid = request.args.get("userId", "").strip()
    if not uid:
        return jsonify([])

    raw_recs = list(attendance.find({"userId": uid}))
    deduped = deduplicate_records_by_date(raw_recs)
    return jsonify([s(a) for a in deduped])

@intern_att_bp.route("/stats", methods=["GET"])
def stats():
    uid = request.args.get("userId", "").strip()
    if not uid:
        return jsonify({
            "total": 0,
            "present": 0,
            "late": 0,
            "absent": 0,
            "attended": 0,
            "percentage": 0.0
        })

    raw_recs = list(attendance.find({"userId": uid}))
    deduped = deduplicate_records_by_date(raw_recs)
    result = calculate_stats(deduped)
    return jsonify(result)

@intern_att_bp.route("/<id>", methods=["PATCH", "PUT"])
def update_attendance(id):
    try:
        oid = ObjectId(id.strip())
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    d = request.json or {}
    allowed = ["internName", "date", "checkIn", "checkOut", "status", "location", "hours"]
    updates = {}
    for k in allowed:
        if k in d:
            if k == "status":
                st = str(d[k]).strip().capitalize()
                updates[k] = st if st in ["Present", "Late", "Absent"] else "Present"
            else:
                updates[k] = d[k]

    if not updates:
        return jsonify({"message": "No updates provided"}), 400

    res = attendance.update_one({"_id": oid}, {"$set": updates})
    if res.matched_count == 0:
        return jsonify({"error": "Record not found"}), 404

    updated_rec = attendance.find_one({"_id": oid})
    return jsonify({"message": "Attendance record updated", "record": s(updated_rec)})

@intern_att_bp.route("/<id>", methods=["DELETE"])
def delete_attendance(id):
    try:
        oid = ObjectId(id.strip())
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400

    res = attendance.delete_one({"_id": oid})
    if res.deleted_count == 0:
        return jsonify({"error": "Record not found"}), 404

    return jsonify({"message": "Attendance record deleted"})
