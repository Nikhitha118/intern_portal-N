from config.database import shared_db

# Messages in shared_db — accessible by interns, mentors, admins
messages      = shared_db["messages"]
conversations = shared_db["conversations"]

def create_message(sender_id, receiver_id, text, msg_type="text"):
    return {
        "senderId": sender_id,
        "receiverId": receiver_id,
        "text": text,
        "type": msg_type,
        "timestamp": None,
        "read": False
    }

def serialize_message(msg):
    msg["_id"] = str(msg["_id"])
    return msg
