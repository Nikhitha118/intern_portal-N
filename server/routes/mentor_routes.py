from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.mentor import mentors, create_mentor, serialize_mentor

mentor_bp = Blueprint("mentor_bp", __name__)

@mentor_bp.route("/all", methods=["GET"])
def get_all_mentors():
    return jsonify([serialize_mentor(m) for m in mentors.find()])

@mentor_bp.route("/<id>", methods=["GET"])
def get_single_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    m = mentors.find_one({"_id":oid})
    if not m: return jsonify({"error":"Mentor not found"}), 404
    return jsonify(serialize_mentor(m))

@mentor_bp.route("/add", methods=["POST"])
def add_mentor():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    new = create_mentor(data.get("name",""), data.get("email",""), data.get("role",""), data.get("company",""), data.get("expertise",[]), data.get("availability",""), data.get("experience",""))
    result = mentors.insert_one(new)
    return jsonify({"message":"Mentor Added Successfully","id":str(result.inserted_id)}), 201

@mentor_bp.route("/update/<id>", methods=["PUT"])
def update_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["name","email","role","company","expertise","availability","experience","available"] if k in data}
    result = mentors.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Mentor not found"}), 404
    return jsonify({"message":"Mentor Updated Successfully"})

@mentor_bp.route("/patch/<id>", methods=["PATCH"])
def patch_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["name","email","role","company","expertise","availability","experience","available"] if data.get(k) is not None}
    result = mentors.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Mentor not found"}), 404
    return jsonify({"message":"Mentor Partially Updated"})

@mentor_bp.route("/delete/<id>", methods=["DELETE"])
def delete_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = mentors.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Mentor not found"}), 404
    return jsonify({"message":"Mentor Deleted Successfully"})

@mentor_bp.route("/connect/<id>", methods=["POST"])
def connect_mentor(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    result = mentors.update_one({"_id":oid},{"$inc":{"sessionsUpcoming":1}})
    if result.matched_count == 0: return jsonify({"error":"Mentor not found"}), 404
    return jsonify({"message":"Connection Request Sent","mentorId":id.strip(),"internId":data.get("internId","")})
