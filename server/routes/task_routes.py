from flask import Blueprint, request, jsonify
from models.task import tasks, create_task, serialize_task
from bson import ObjectId

task_bp = Blueprint("tasks", __name__)

def safe_id(id_str):
    """Strip whitespace and validate ObjectId"""
    try:
        return ObjectId(id_str.strip()), None
    except Exception:
        return None, jsonify({"error": "Invalid ID format"}), 400

@task_bp.route("/", methods=["GET"])
def get_tasks():
    user_id = request.args.get("userId","").strip()
    query = {"userId": user_id} if user_id else {}
    return jsonify([serialize_task(t) for t in tasks.find(query)])

@task_bp.route("/<id>", methods=["GET"])
def get_single_task(id):
    oid, err = safe_id(id)[:2] if len(safe_id(id))==2 else (safe_id(id)[0], None)
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    t = tasks.find_one({"_id": oid})
    if not t: return jsonify({"error":"Task not found"}), 404
    return jsonify(serialize_task(t))

@task_bp.route("/", methods=["POST"])
def add_task():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    new = create_task(data.get("title",""), data.get("category",""), data.get("dueDate",""), data.get("priority","Medium"), data.get("status","Pending"), data.get("progress",0), data.get("description",""), data.get("userId"))
    result = tasks.insert_one(new)
    return jsonify({"message":"Task Added Successfully","id":str(result.inserted_id)}), 201

@task_bp.route("/<id>", methods=["PUT"])
def update_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["title","category","dueDate","priority","status","progress","description"] if k in data}
    result = tasks.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Task not found"}), 404
    return jsonify({"message":"Task Updated Successfully"})

@task_bp.route("/<id>", methods=["DELETE"])
def delete_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = tasks.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Task not found"}), 404
    return jsonify({"message":"Task Deleted Successfully"})

@task_bp.route("/<id>/status", methods=["PATCH"])
def update_task_status(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    data = request.json or {}
    fields = {k:data[k] for k in ["status","progress"] if k in data}
    result = tasks.update_one({"_id":oid},{"$set":fields})
    if result.matched_count == 0: return jsonify({"error":"Task not found"}), 404
    return jsonify({"message":"Task Status Updated"})
