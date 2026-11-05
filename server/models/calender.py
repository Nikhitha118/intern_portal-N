from config.database import intern_db

# Calendar events stored in intern_db — intern folder
events = intern_db["intern_calendar"]

def create_event(title, date, time, event_type, color, user_id=None):
    return {
        "title": title,
        "date": date,
        "time": time,
        "type": event_type,
        "color": color,
        "userId": user_id
    }

def serialize_event(event):
    event["_id"] = str(event["_id"])
    return event
