from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from core import db
from core.models import Attendance, User
from flask import current_app
import pytz
from flask_mail import Message
from core import mail  # Assuming you initialized Flask-Mail in your app
from email.mime.application import MIMEApplication
import io
import pandas as pd

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


def generate_and_send_monthly_report(app, year, month):
    """Generate attendance Excel report and email to all admins"""

    with app.app_context():
        # Filter attendance for the given month/year
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date()
        else:
            end_date = datetime(year, month + 1, 1).date()

        records = Attendance.query.join(User).filter(
            Attendance.date >= start_date,
            Attendance.date < end_date
        ).all()

        if not records:
            current_app.logger.info(f"No attendance records found for {month}/{year}. No email sent.")
            return

        data = []
        for r in records:
            user = User.query.get(r.user_id)
            data.append({
                "User ID": user.id,
                "Name": user.name.title() if user.name else "N/A",
                "Email": user.email,
                "Date": r.date.strftime("%Y-%m-%d") if r.date else "N/A",
                "Punch In": r.punch_in_time.strftime("%H:%M:%S") if r.punch_in_time else "N/A",
                "Punch Out": r.punch_out_time.strftime("%H:%M:%S") if r.punch_out_time else "N/A",
                "Device IP": r.device_ip
            })

        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Attendance')
        output.seek(0)

        # Prepare email
        month_name = start_date.strftime('%B %Y')
        subject = f"Monthly Attendance Report - {month_name}"
        body = f"Dear Admin,\n\nPlease find attached the attendance report for {month_name}.\n\nRegards,\nAttendance System"

        # Get all superadmin emails
        admins = User.query.filter(User.role.in_(['superadmin'])).all()
        recipient_emails = [admin.email for admin in admins]

        if not recipient_emails:
            current_app.logger.info("No superadmin emails found. Skipping sending monthly report email.")
            return

        msg = Message(subject=subject, recipients=recipient_emails, body=body)

        # Attach the Excel file
        part = MIMEApplication(output.read(), _subtype='vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        part.add_header('Content-Disposition', 'attachment', filename=f"attendance_{year}_{month:02d}.xlsx")
        msg.attach(part)

        try:
            mail.send(msg)
            current_app.logger.info(f"Monthly attendance report sent to admins for {month_name}")
        except Exception as e:
            current_app.logger.error(f"Failed to send monthly report email: {e}")


def start_scheduler():
    """Start the scheduler to reset attendance every midnight"""
    scheduler = BackgroundScheduler()
    scheduler.add_job(reset_attendance, 'cron', hour=0, minute=0, timezone=local_timezone)  # Run at midnight in local timezone

    def send_monthly_report():
        now = datetime.now(local_timezone)
        month = now.month - 1 or 12
        year = now.year - 1 if month == 12 else now.year
        current_app.logger.info(f"Starting monthly report email job for {month}/{year}")
        generate_and_send_monthly_report(current_app._get_current_object(), year, month)

    scheduler.add_job(send_monthly_report, 'cron', day=1, hour=2, minute=0, timezone=local_timezone)

    scheduler.start()
    current_app.logger.info("Scheduler started: daily attendance reset + monthly report email.")
    
