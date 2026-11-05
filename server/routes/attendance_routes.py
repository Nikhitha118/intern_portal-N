from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.attendence import attendance, create_attendance, serialize_attendance
import datetime

attendance_bp = Blueprint("attendance_bp", __name__)

@attendance_bp.route("/checkin", methods=["POST"])
def check_in():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    now = datetime.datetime.utcnow()
    new = create_attendance(data.get("internName",""), data.get("date", now.strftime("%b %d, %Y")), data.get("checkIn", now.strftime("%I:%M %p")), "-", data.get("status","Present"), data.get("location",""), data.get("userId"))
    result = attendance.insert_one(new)
    return jsonify({"message":"Attendance Checked In","id":str(result.inserted_id)}), 201

@attendance_bp.route("/checkout/<id>", methods=["PATCH"])
def check_out(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    now = datetime.datetime.utcnow()
    co = data.get("checkOut", now.strftime("%I:%M %p"))
    result = attendance.update_one({"_id":oid},{"$set":{"checkOut":co}})
    if result.matched_count == 0: return jsonify({"error":"Record not found"}), 404
    return jsonify({"message":"Checked Out Successfully"})

@attendance_bp.route("/all", methods=["GET"])
def get_all_attendance():
    uid = request.args.get("userId","").strip()
    query = {"userId":uid} if uid else {}
    return jsonify([serialize_attendance(a) for a in attendance.find(query).sort("date",-1)])

@attendance_bp.route("/<id>", methods=["GET"])
def get_single_attendance(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    item = attendance.find_one({"_id":oid})
    if not item: return jsonify({"error":"Not Found"}), 404
    return jsonify(serialize_attendance(item))

@attendance_bp.route("/update/<id>", methods=["PUT"])
def update_attendance(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["internName","date","checkIn","checkOut","status","location"] if k in data}
    result = attendance.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Not found"}), 404
    return jsonify({"message":"Attendance Updated Successfully"})

@attendance_bp.route("/delete/<id>", methods=["DELETE"])
def delete_attendance(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = attendance.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Not found"}), 404
    return jsonify({"message":"Attendance Deleted Successfully"})

@attendance_bp.route("/stats", methods=["GET"])
def get_stats():
    uid = request.args.get("userId","").strip()
    query = {"userId":uid} if uid else {}
    total = attendance.count_documents(query)
    present = attendance.count_documents({**query,"status":"Present"})
    absent = attendance.count_documents({**query,"status":"Absent"})
    late = attendance.count_documents({**query,"status":"Late"})
    pct = round((present/total)*100,1) if total > 0 else 0
    return jsonify({"total":total,"present":present,"absent":absent,"late":late,"percentage":pct})

@attendance_bp.route("/patch/<id>", methods=["PATCH"])
def patch_attendance(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["internName","date","status","checkIn","checkOut","location"] if data.get(k)}
    result = attendance.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Not found"}), 404
    return jsonify({"message":"Attendance Partially Updated"})
