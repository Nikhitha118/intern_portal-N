from flask import Blueprint, request, jsonify
from shared.models.user import messages
from bson import ObjectId
import datetime

msg_bp = Blueprint("shared_msg", __name__)

@msg_bp.route("/send", methods=["POST"])
def send():
    d = request.json or {}
    msg = {"senderId":d.get("senderId"),"receiverId":d.get("receiverId"),"text":d.get("text",""),"timestamp":datetime.datetime.utcnow().isoformat(),"read":False}
    r = messages.insert_one(msg)
    return jsonify({"message":"Sent","id":str(r.inserted_id)}), 201

@msg_bp.route("/conversation", methods=["GET"])
def conversation():
    a = request.args.get("senderId","")
    b = request.args.get("receiverId","")
    msgs = list(messages.find({"$or":[{"senderId":a,"receiverId":b},{"senderId":b,"receiverId":a}]}).sort("timestamp",1))
    for m in msgs: m["_id"] = str(m["_id"])
    return jsonify(msgs)

@msg_bp.route("/conversations/<uid>", methods=["GET"])
def conversations(uid):
    msgs = list(messages.find({"$or":[{"senderId":uid},{"receiverId":uid}]}).sort("timestamp",-1).limit(50))
    for m in msgs: m["_id"] = str(m["_id"])
    return jsonify(msgs)

