from config.database import intern_db

# Journals stored in intern_db — intern folder
journals = intern_db["intern_journals"]

def create_journal(title, worked_on, learned, challenges, tomorrow_plan, date, user_id=None):
    return {
        "title": title,
        "workedOn": worked_on,
        "learned": learned,
        "challenges": challenges,
        "tomorrowPlan": tomorrow_plan,
        "date": date,
        "userId": user_id,
        "attachments": [],
        "mentorComment": None
    }

def serialize_journal(journal):
    journal["_id"] = str(journal["_id"])
    return journal
