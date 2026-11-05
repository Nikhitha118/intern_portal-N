from flask import Blueprint, request, jsonify
from models.journal import journals, create_journal, serialize_journal
from bson import ObjectId
import datetime

journal_bp = Blueprint("journals", __name__)

@journal_bp.route("/", methods=["GET"])
def get_journals():
    uid = request.args.get("userId","").strip()
    query = {"userId":uid} if uid else {}
    return jsonify([serialize_journal(j) for j in journals.find(query).sort("date",-1)])

@journal_bp.route("/<id>", methods=["GET"])
def get_single_journal(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    j = journals.find_one({"_id":oid})
    if not j: return jsonify({"error":"Journal not found"}), 404
    return jsonify(serialize_journal(j))

@journal_bp.route("/", methods=["POST"])
def add_journal():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    now = datetime.datetime.utcnow()
    new = create_journal(data.get("title",""), data.get("workedOn",""), data.get("learned",""), data.get("challenges",""), data.get("tomorrowPlan",""), data.get("date", now.strftime("%b %d, %Y")), data.get("userId"))
    result = journals.insert_one(new)
    return jsonify({"message":"Journal Added Successfully","id":str(result.inserted_id)}), 201

@journal_bp.route("/<id>", methods=["PUT"])
def update_journal(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["title","workedOn","learned","challenges","tomorrowPlan","date"] if k in data}
    result = journals.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Journal not found"}), 404
    return jsonify({"message":"Journal Updated Successfully"})

@journal_bp.route("/<id>", methods=["DELETE"])
def delete_journal(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = journals.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Journal not found"}), 404
    return jsonify({"message":"Journal Deleted Successfully"})

@journal_bp.route("/<id>/comment", methods=["POST"])
def add_mentor_comment(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    comment = {"text":data.get("text",""), "mentor":data.get("mentor",""), "time":datetime.datetime.utcnow().isoformat()}
    result = journals.update_one({"_id":oid},{"$set":{"mentorComment":comment}})
    if result.matched_count == 0: return jsonify({"error":"Journal not found"}), 404
    return jsonify({"message":"Comment Added Successfully"})
