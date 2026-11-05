from flask import Flask, jsonify
from flask_cors import CORS
import os

# ✅ IMPORT ALL BLUEPRINTS (THIS WAS MISSING)
from shared.routes.ai_routes import ai_bp
from shared.routes.auth_routes import auth_bp
from routes.oauth_routes import oauth_bp
from shared.routes.message_routes import msg_bp
from shared.routes.mentor_routes import mentor_list_bp

from intern.routes.task_routes import intern_task_bp
from intern.routes.journal_routes import intern_journal_bp
from intern.routes.attendance_routes import intern_att_bp
from intern.routes.calendar_routes import intern_cal_bp
from intern.routes.settings_routes import intern_settings_bp

from mentor.routes.evaluation_routes import mentor_eval_bp
from mentor.routes.task_routes import mentor_task_bp
from mentor.routes.calendar_routes import mentor_cal_bp
from mentor.routes.message_routes import mentor_msg_bp

from admin.routes.admin_routes import admin_bp as admin_portal_bp
from evaluation.routes.evaluation_routes import eval_portal_bp
from institution.routes.institution_routes import inst_bp


app = Flask(__name__)

# CORS (production safe for all origins including Vercel and localhost)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
}})

# Register blueprints
app.register_blueprint(ai_bp, url_prefix="/ai")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(oauth_bp, url_prefix="/auth/oauth")
app.register_blueprint(oauth_bp, url_prefix="/oauth", name="oauth_root")
app.register_blueprint(msg_bp, url_prefix="/messages")
app.register_blueprint(mentor_list_bp, url_prefix="/mentors")

app.register_blueprint(intern_task_bp, url_prefix="/intern/tasks")
app.register_blueprint(intern_journal_bp, url_prefix="/intern/journals")
app.register_blueprint(intern_att_bp, url_prefix="/intern/attendance")
app.register_blueprint(intern_cal_bp, url_prefix="/intern/calendar")
app.register_blueprint(intern_settings_bp, url_prefix="/intern/settings")

app.register_blueprint(mentor_eval_bp, url_prefix="/mentor")
app.register_blueprint(mentor_task_bp, url_prefix="/mentor/tasks")
app.register_blueprint(mentor_cal_bp, url_prefix="/mentor/calendar")
app.register_blueprint(mentor_msg_bp, url_prefix="/mentor/messages")

app.register_blueprint(admin_portal_bp, url_prefix="/admin")
app.register_blueprint(eval_portal_bp, url_prefix="/evaluation-portal")
app.register_blueprint(inst_bp, url_prefix="/institution")


@app.route("/")
def home():
    return jsonify({
        "status": "✅ InternPortal Backend Running",
        "project": "Smart Internship Workflow and Evaluation Portal",
        "version": "3.0",
        "databases": {
            "shared_db": "users, messages, mentors",
            "intern_db": "intern_tasks, intern_journals, intern_attendance, intern_calendar, intern_settings",
            "mentor_db": "mentor_evaluations, mentor_rubrics, mentor_submissions, mentor_feedback",
            "admin_db": "admin_logs, admin_settings",
            "institution_db": "institution_reports, institution_score_analytics"
        },
        "portals": {
            "intern": "https://intern-portal-e483.vercel.app/intern/dashboard",
            "mentor": "https://intern-portal-e483.vercel.app/mentor/dashboard",
            "admin": "https://intern-portal-e483.vercel.app/admin/dashboard",
            "institution": "https://intern-portal-e483.vercel.app/institution/dashboard"
        }
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "detail": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)