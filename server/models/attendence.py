from config.database import intern_db

# Attendance stored in intern_db — intern folder
attendance = intern_db["intern_attendance"]

def create_attendance(intern_name, date, check_in, check_out, status, location, user_id=None):
    return {
        "internName": intern_name,
        "date": date,
        "checkIn": check_in,
        "checkOut": check_out,
        "status": status,
        "location": location,
        "userId": user_id
    }

def serialize_attendance(item):
    item["_id"] = str(item["_id"])
    return item
