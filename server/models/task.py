from config.database import intern_db

# Tasks stored in intern_db — intern folder
tasks = intern_db["intern_tasks"]

def create_task(title, category, due_date, priority, status, progress, description="", user_id=None):
    return {
        "title": title,
        "category": category,
        "dueDate": due_date,
        "priority": priority,
        "status": status,
        "progress": progress,
        "description": description,
        "userId": user_id,
        "attachments": [],
        "submission": None
    }

def serialize_task(task):
    task["_id"] = str(task["_id"])
    return task
