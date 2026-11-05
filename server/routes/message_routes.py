from flask import Blueprint, request, jsonify
from bson import ObjectId
from models.message import messages, conversations, create_message, serialize_message
import datetime

message_bp = Blueprint("message_bp", __name__)

@message_bp.route("/send", methods=["POST"])
def send_message():
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    sender_id   = data.get("senderId","").strip()
    receiver_id = data.get("receiverId","").strip()
    text        = data.get("text","")
    if not sender_id or not receiver_id or not text:
        return jsonify({"error":"senderId, receiverId and text required"}), 400
    new_msg = create_message(sender_id, receiver_id, text, data.get("type","text"))
    new_msg["timestamp"] = datetime.datetime.utcnow().isoformat()
    result = messages.insert_one(new_msg)
    conv_id = "_".join(sorted([sender_id, receiver_id]))
    conversations.update_one(
        {"convId": conv_id},
        {"$set":{"convId":conv_id,"participants":[sender_id,receiver_id],"lastMessage":text,"lastTime":new_msg["timestamp"]},"$inc":{"unreadCount":1}},
        upsert=True
    )
    return jsonify({"message":"Message Sent","id":str(result.inserted_id)}), 201

@message_bp.route("/conversation", methods=["GET"])
def get_conversation():
    sender_id   = request.args.get("senderId","").strip()
    receiver_id = request.args.get("receiverId","").strip()
    if not sender_id or not receiver_id:
        return jsonify({"error":"senderId and receiverId required"}), 400
    msgs = messages.find({"$or":[{"senderId":sender_id,"receiverId":receiver_id},{"senderId":receiver_id,"receiverId":sender_id}]}).sort("timestamp",1)
    return jsonify([serialize_message(m) for m in msgs])

@message_bp.route("/conversations/<user_id>", methods=["GET"])
def get_conversations(user_id):
    user_id = user_id.strip()
    convs = conversations.find({"participants":user_id}).sort("lastTime",-1)
    result = []
    for c in convs:
        c["_id"] = str(c["_id"])
        result.append(c)
    return jsonify(result)

@message_bp.route("/read", methods=["PATCH"])
def mark_read():
    data = request.json or {}
    sender_id   = data.get("senderId","").strip()
    receiver_id = data.get("receiverId","").strip()
    messages.update_many({"senderId":sender_id,"receiverId":receiver_id,"read":False},{"$set":{"read":True}})
    conv_id = "_".join(sorted([sender_id, receiver_id]))
    conversations.update_one({"convId":conv_id},{"$set":{"unreadCount":0}})
    return jsonify({"message":"Messages marked as read"})

@message_bp.route("/<id>", methods=["DELETE"])
def delete_message(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    result = messages.delete_one({"_id":oid})
    if result.deleted_count == 0: return jsonify({"error":"Message not found"}), 404
    return jsonify({"message":"Message Deleted"})
