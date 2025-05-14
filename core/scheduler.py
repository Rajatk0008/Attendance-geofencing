from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from core import db
from core.models import Attendance
from flask import current_app
import pytz

# Define local timezone
local_timezone = pytz.timezone('Asia/Kolkata')

def reset_attendance():
    """Reset attendance for all users for the new day and auto punch-out users who forgot"""
    with current_app.app_context():
        # Get today's date in local time
        today = datetime.now(local_timezone).date()

        # Get all attendance records where punch_out is None (forgotten punch-out)
        forgot_to_punch_out = Attendance.query.filter(Attendance.punch_out == None).all()

        # Automatically punch out users who forgot
        for attendance in forgot_to_punch_out:
            attendance.punch_out = datetime.now(local_timezone)  # Set punch_out to the current time

        # Commit all updates in one go
        db.session.commit()

        current_app.logger.info(
            f"Attendance for {today} has been reset and users with forgotten punch-outs have been updated."
        )


def start_scheduler():
    """Start the scheduler to reset attendance every midnight"""
    scheduler = BackgroundScheduler()
    scheduler.add_job(reset_attendance, 'cron', hour=0, minute=0, timezone=local_timezone)  # Run at midnight in local timezone
    scheduler.start()
    current_app.logger.info("Scheduler started to reset attendance every midnight.")
