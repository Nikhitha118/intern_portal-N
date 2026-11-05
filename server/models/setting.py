from config.database import intern_db

# Settings stored in intern_db — intern folder
settings = intern_db["intern_settings"]

def create_settings(user_id):
    return {
        "userId": user_id,
        "emailNotifications": True,
        "pushNotifications": True,
        "taskReminders": False,
        "theme": "dark",
        "language": "en"
    }

def serialize_settings(s):
    s["_id"] = str(s["_id"])
    return s
