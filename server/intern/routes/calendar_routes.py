from flask import Blueprint, request, jsonify
from intern.models.db import calendar
from bson import ObjectId

intern_cal_bp = Blueprint("intern_calendar", __name__)

def s(e): e["_id"]=str(e["_id"]); return e

@intern_cal_bp.route("/all", methods=["GET"])
def get_events():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    return jsonify([s(e) for e in calendar.find(q).sort("date",1)])

@intern_cal_bp.route("/add", methods=["POST"])
def add_event():
    d = request.json or {}
    if not d.get("title"): return jsonify({"error":"title required"}), 400
    doc = {"title":d.get("title"),"date":d.get("date",""),"time":d.get("time",""),"type":d.get("type","Event"),"color":d.get("color","#7C3AED"),"userId":d.get("userId")}
    r = calendar.insert_one(doc)
    return jsonify({"message":"Event added","id":str(r.inserted_id)}), 201

@intern_cal_bp.route("/upcoming", methods=["GET"])
def upcoming():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    return jsonify([s(e) for e in calendar.find(q).sort("date",1).limit(10)])

@intern_cal_bp.route("/<id>", methods=["DELETE"])
def delete_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    calendar.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

