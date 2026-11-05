from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.calender import events, create_event, serialize_event
import datetime

calendar_bp = Blueprint("calendar_bp", __name__)

@calendar_bp.route("/all", methods=["GET"])
def get_all_events():
    uid = request.args.get("userId","").strip()
    query = {"userId":uid} if uid else {}
    return jsonify([serialize_event(e) for e in events.find(query).sort("date",1)])

@calendar_bp.route("/<id>", methods=["GET"])
def get_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    e = events.find_one({"_id":oid})
    if not e: return jsonify({"error":"Event not found"}), 404
    return jsonify(serialize_event(e))

@calendar_bp.route("/add", methods=["POST"])
def add_event():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    new = create_event(data.get("title",""), data.get("date",""), data.get("time",""), data.get("type","general"), data.get("color","#7C3AED"), data.get("userId"))
    result = events.insert_one(new)
    return jsonify({"message":"Event Added Successfully","id":str(result.inserted_id)}), 201

@calendar_bp.route("/update/<id>", methods=["PUT"])
def update_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["title","date","time","type","color"] if k in data}
    result = events.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Event not found"}), 404
    return jsonify({"message":"Event Updated Successfully"})

@calendar_bp.route("/delete/<id>", methods=["DELETE"])
def delete_event(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = events.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Event not found"}), 404
    return jsonify({"message":"Event Deleted Successfully"})

@calendar_bp.route("/upcoming", methods=["GET"])
def get_upcoming():
    uid = request.args.get("userId","").strip()
    today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    query = {"date":{"$gte":today}}
    if uid: query["userId"] = uid
    return jsonify([serialize_event(e) for e in events.find(query).sort("date",1).limit(10)])
