from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os
from bson import ObjectId

mentor_msg_bp = Blueprint("mentor_messages", __name__)
client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017/"))
mentor_db = client["mentor_db"]
messages = mentor_db["mentor_messages"]

def s(m): m["_id"]=str(m["_id"]); return m

@mentor_msg_bp.route("/", methods=["GET"])
def get_messages():
    return jsonify([s(m) for m in messages.find()])

@mentor_msg_bp.route("/notifications", methods=["GET"])
def get_notifications():
    notifs = mentor_db["mentor_notifications"]
    return jsonify([s(n) for n in notifs.find().sort("time",-1)])
