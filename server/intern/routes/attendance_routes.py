from flask import Blueprint, request, jsonify
from intern.models.db import attendance
from bson import ObjectId

intern_att_bp = Blueprint("intern_attendance", __name__)

def s(a): a["_id"]=str(a["_id"]); return a

@intern_att_bp.route("/checkin", methods=["POST"])
def checkin():
    d = request.json or {}
    doc = {"internName":d.get("internName",""),"date":d.get("date",""),"checkIn":d.get("checkIn",""),"checkOut":"-","status":d.get("status","Present"),"location":d.get("location",""),"hours":"-","userId":d.get("userId")}
    r = attendance.insert_one(doc)
    return jsonify({"message":"Checked in","id":str(r.inserted_id)}), 201

@intern_att_bp.route("/checkout/<id>", methods=["PATCH"])
def checkout(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    attendance.update_one({"_id":oid},{"$set":{"checkOut":d.get("checkOut","-")}})
    return jsonify({"message":"Checked out"})

@intern_att_bp.route("/all", methods=["GET"])
def get_all():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    return jsonify([s(a) for a in attendance.find(q).sort("date",-1)])

@intern_att_bp.route("/stats", methods=["GET"])
def stats():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    all_att = list(attendance.find(q))
    total = len(all_att)
    present = len([a for a in all_att if a.get("status")=="Present"])
    absent  = len([a for a in all_att if a.get("status")=="Absent"])
    late    = len([a for a in all_att if a.get("status")=="Late"])
    pct = round(present/total*100,1) if total > 0 else 0
    return jsonify({"total":total,"present":present,"absent":absent,"late":late,"percentage":pct})

