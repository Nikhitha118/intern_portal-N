from flask import Blueprint, request, jsonify
from models.setting import settings, create_settings, serialize_settings

setting_bp = Blueprint("setting_bp", __name__)

@setting_bp.route("/<user_id>", methods=["GET"])
def get_settings(user_id):
    user_id = user_id.strip()
    s = settings.find_one({"userId": user_id})
    if not s:
        new_s = create_settings(user_id)
        result = settings.insert_one(new_s)
        new_s["_id"] = str(result.inserted_id)
        return jsonify(new_s)
    return jsonify(serialize_settings(s))

@setting_bp.route("/<user_id>", methods=["PUT"])
def update_settings(user_id):
    user_id = user_id.strip()
    data = request.json
    if not data: return jsonify({"error":"No data"}), 400
    fields = {}
    for f in ["emailNotifications","pushNotifications","taskReminders","theme","language"]:
        if f in data: fields[f] = data[f]
    settings.update_one({"userId":user_id},{"$set":fields},upsert=True)
    return jsonify({"message":"Settings Updated Successfully"})
