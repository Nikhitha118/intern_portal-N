from flask import Blueprint, request, jsonify
from intern.models.db import tasks
from bson import ObjectId

intern_task_bp = Blueprint("intern_tasks", __name__)

def s(t): t["_id"]=str(t["_id"]); return t

@intern_task_bp.route("/", methods=["GET"])
def get_tasks():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    return jsonify([s(t) for t in tasks.find(q)])

@intern_task_bp.route("/", methods=["POST"])
def add_task():
    d = request.json or {}
    if not d.get("title"): return jsonify({"error":"title required"}), 400
    doc = {"title":d.get("title"),"category":d.get("category","Backend"),"dueDate":d.get("dueDate",""),"priority":d.get("priority","Medium"),"status":d.get("status","Pending"),"progress":d.get("progress",0),"description":d.get("description",""),"userId":d.get("userId"),"attachments":[]}
    r = tasks.insert_one(doc)
    return jsonify({"message":"Task created","id":str(r.inserted_id)}), 201

@intern_task_bp.route("/<id>", methods=["PUT"])
def update_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["title","category","dueDate","priority","status","progress","description"] if k in d}
    tasks.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Updated"})

@intern_task_bp.route("/<id>", methods=["DELETE"])
def delete_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    tasks.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

@intern_task_bp.route("/<id>/status", methods=["PATCH"])
def patch_status(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["status","progress"] if k in d}
    tasks.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Status updated"})

