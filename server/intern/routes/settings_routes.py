from flask import Blueprint, request, jsonify
from intern.models.db import settings

intern_settings_bp = Blueprint("intern_settings", __name__)

def s(x): x["_id"]=str(x["_id"]); return x

@intern_settings_bp.route("/<uid>", methods=["GET"])
def get_settings(uid):
    doc = settings.find_one({"userId":uid.strip()})
    if not doc:
        doc = {"userId":uid,"emailNotifications":True,"pushNotifications":True,"taskReminders":False,"theme":"dark","language":"en"}
        settings.insert_one(doc)
    return jsonify(s(doc))

@intern_settings_bp.route("/<uid>", methods=["PUT"])
def update_settings(uid):
    d = request.json or {}
    fields = {k:d[k] for k in ["emailNotifications","pushNotifications","taskReminders","theme","language"] if k in d}
    settings.update_one({"userId":uid.strip()},{"$set":fields},upsert=True)
    return jsonify({"message":"Settings updated"})

