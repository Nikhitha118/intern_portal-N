from flask import Blueprint, request, jsonify
from intern.models.db import journals
from bson import ObjectId
import datetime

intern_journal_bp = Blueprint("intern_journals", __name__)

def s(j): j["_id"]=str(j["_id"]); return j

@intern_journal_bp.route("/", methods=["GET"])
def get_journals():
    uid = request.args.get("userId","").strip()
    q = {"userId":uid} if uid else {}
    return jsonify([s(j) for j in journals.find(q).sort("date",-1)])

@intern_journal_bp.route("/", methods=["POST"])
def add_journal():
    d = request.json or {}
    if not d.get("title"): return jsonify({"error":"title required"}), 400
    doc = {"title":d.get("title"),"workedOn":d.get("workedOn",""),"learned":d.get("learned",""),"challenges":d.get("challenges",""),"tomorrowPlan":d.get("tomorrowPlan",""),"date":d.get("date",datetime.date.today().strftime("%b %d, %Y")),"userId":d.get("userId"),"mentorComment":None}
    r = journals.insert_one(doc)
    return jsonify({"message":"Journal created","id":str(r.inserted_id)}), 201

@intern_journal_bp.route("/<id>", methods=["PUT"])
def update_journal(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    fields = {k:d[k] for k in ["title","workedOn","learned","challenges","tomorrowPlan"] if k in d}
    journals.update_one({"_id":oid},{"$set":fields})
    return jsonify({"message":"Updated"})

@intern_journal_bp.route("/<id>", methods=["DELETE"])
def delete_journal(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    journals.delete_one({"_id":oid})
    return jsonify({"message":"Deleted"})

@intern_journal_bp.route("/<id>/comment", methods=["POST"])
def add_comment(id):
    try: oid = ObjectId(id.strip())
    except: return jsonify({"error":"Invalid ID"}), 400
    d = request.json or {}
    comment = {"text":d.get("text",""),"mentor":d.get("mentor","Mentor"),"time":datetime.datetime.utcnow().strftime("%b %d, %Y â€¢ %I:%M %p")}
    journals.update_one({"_id":oid},{"$set":{"mentorComment":comment}})
    return jsonify({"message":"Comment added"})

