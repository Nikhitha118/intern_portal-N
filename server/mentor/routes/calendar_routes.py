from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os, datetime
from bson import ObjectId

mentor_cal_bp = Blueprint("mentor_calendar", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
mentor_db = client["mentor_db"]
calendar = mentor_db["mentor_calendar"]

def s(e): e["_id"]=str(e["_id"]); return e

@mentor_cal_bp.route("/", methods=["GET"])
def get_events():
    return jsonify([s(e) for e in calendar.find().sort("date",1)])

@mentor_cal_bp.route("/", methods=["POST"])
def add_event():
    d = request.json or {}
    d["createdAt"] = datetime.datetime.now().isoformat()
    r = calendar.insert_one(d)
    return jsonify({"message":"Event added","id":str(r.inserted_id)}), 201

@mentor_cal_bp.route("/<id>", methods=["DELETE"])
def delete_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    calendar.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})
