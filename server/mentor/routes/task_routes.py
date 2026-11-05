from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os, datetime
from bson import ObjectId

mentor_task_bp = Blueprint("mentor_tasks", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
mentor_db = client["mentor_db"]
tasks = mentor_db["mentor_tasks"]

def s(t): t["_id"]=str(t["_id"]); return t

@mentor_task_bp.route("/", methods=["GET"])
def get_tasks():
    return jsonify([s(t) for t in tasks.find().sort("createdAt",-1)])

@mentor_task_bp.route("/", methods=["POST"])
def add_task():
    d = request.json or {}
    d["createdAt"] = datetime.datetime.now().isoformat()
    r = tasks.insert_one(d)
    return jsonify({"message":"Task added","id":str(r.inserted_id)}), 201

@mentor_task_bp.route("/<id>", methods=["PUT"])
def update_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    tasks.update_one({"_id":oid},{"$set":d})
    return jsonify({"message":"Updated"})

@mentor_task_bp.route("/<id>", methods=["DELETE"])
def delete_task(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    tasks.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})
