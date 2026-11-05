from flask import Blueprint, request, jsonify
from shared.models.mentor import mentors, create_mentor, serialize_mentor
from bson import ObjectId

mentor_list_bp = Blueprint("mentor_list", __name__)

@mentor_list_bp.route("/all", methods=["GET"])
def get_all():
    return jsonify([serialize_mentor(m) for m in mentors.find()])

@mentor_list_bp.route("/add", methods=["POST"])
def add_mentor():
    d = request.json or {}
    if not d.get("name"): return jsonify({"error":"name required"}), 400
    doc = create_mentor(d.get("name"),d.get("email",""),d.get("role","mentor"),d.get("company",""),d.get("expertise",[]),d.get("availability",""),d.get("experience",""))
    r = mentors.insert_one(doc)
    return jsonify({"message":"Mentor added","id":str(r.inserted_id)}), 201

@mentor_list_bp.route("/connect/<id>", methods=["POST"])
def connect(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    mentors.update_one({"_id":oid},{"$inc":{"sessionsUpcoming":1}})
    return jsonify({"message":"Connection request sent"})

@mentor_list_bp.route("/<id>", methods=["PUT"])
def update_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["name","role","company","expertise","availability","experience","available"] if k in d}
    mentors.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Updated"})

@mentor_list_bp.route("/<id>", methods=["DELETE"])
def delete_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    mentors.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})
