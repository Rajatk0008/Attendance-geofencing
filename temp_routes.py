# core/routes.py

from flask import Blueprint, request, jsonify, render_template, send_file, request
from datetime import datetime
from core import db
from core.models import User, Attendance
from core.utils import is_within_geofence
import pytz

import pandas as pd
import io

local_timezone = pytz.timezone('Asia/Kolkata')  # Adjust this according to your local time zone

routes_bp = Blueprint('routes_bp', __name__)

GEOFENCE_LAT = 20.294776
GEOFENCE_LON = 85.813756
GEOFENCE_RADIUS = 200  # meters

@routes_bp.route('/')
def index():
    return render_template('index.html')

@routes_bp.route('/register', methods=['GET', 'POST'])
def register():
    message = ''
    if request.method == 'POST':
        name = request.form.get('name', '').strip().lower()
        if name:
            try:
                user = User(name=name)
                db.session.add(user)
                db.session.commit()
                message = "✅ User registered successfully!"
            except Exception as e:
                db.session.rollback()
                message = f"⚠️ Error: {str(e)}"
    return render_template('register.html', message=message)

@routes_bp.route('/attendance', methods=['POST'])
def attendance():
    data = request.get_json()
    name = data.get('name', '').strip().lower()
    lat = data.get('latitude')
    lon = data.get('longitude')
    action = data.get('action')

    if not name or lat is None or lon is None or not action:
        return jsonify({'status': 'error', 'message': 'Missing name, coordinates, or action'}), 400

    user = User.query.filter_by(name=name).first()
    if not user:
        return jsonify({'status': 'denied', 'message': 'Unregistered user'}), 403

    if not is_within_geofence(lat, lon):
        return jsonify({'status': 'denied', 'message': 'Outside geofence area'}), 403

    ip_address = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

    # Get the current local time in your desired timezone
    current_time = datetime.now(local_timezone)

    # Calculate the start of the day in local time (midnight)
    today_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)

    # Get today's attendance for the user
    attendance_record = Attendance.query.filter_by(user_id=user.id).filter(
        Attendance.punch_in >= today_start
    ).order_by(Attendance.punch_in.desc()).first()

    if action == "punch_in":
        if attendance_record:
            return jsonify({'status': 'denied', 'message': '⚠️ Already punched in today.'}), 403

        # Prevent same IP punch-in
        ip_record = Attendance.query.filter_by(device_ip=ip_address).filter(
            Attendance.punch_in >= today_start
        ).first()
        if ip_record:
            return jsonify({'status': 'denied', 'message': '🚫 This IP has already been used for punch-in today'}), 403

        new_attendance = Attendance(
            user_id=user.id,
            punch_in=current_time,
            device_ip=ip_address
        )
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify({'status': 'success', 'message': f"✅ Punched in for {name}"}), 200

    elif action == "punch_out":
        if not attendance_record:
            return jsonify({'status': 'error', 'message': '⚠️ Missing punch-in. Cannot punch out.'}), 400
        
        # Check if the user has already punched out for the day
        if attendance_record.punch_out:
            return jsonify({'status': 'success', 'message': f"✅ Already punched out for {name}"}), 200
        
        # Check if the punch-out is from the same device as the punch-in
        if attendance_record.device_ip != ip_address:
            return jsonify({'status': 'error', 'message': '🚫 Punch-out must be from the same device as punch-in.'}), 403

        attendance_record.punch_out = current_time
        db.session.commit()
        return jsonify({'status': 'success', 'message': f"🕒 Punched out for {name}"}), 200

    else:
        return jsonify({'status': 'error', 'message': '⚠️ Invalid action.'}), 400
    

@routes_bp.route('/admin')
def admin_panel():
    today = datetime.now().date()
    users = User.query.all()
    user_data = []

    for user in users:
        records = Attendance.query.filter(
            Attendance.user_id == user.id,
            db.func.date(Attendance.punch_in) == today
        ).order_by(Attendance.punch_in.desc()).all()

        user_data.append({
            'name': user.name.title(),
            'records': records
        })

    return render_template('admin.html', user_data=user_data)


@routes_bp.route('/admin/download-attendance')
def download_attendance():
    records = Attendance.query.join(User).all()

    if not records:
        return "No attendance records found."

    data = []
    for r in records:
        data.append({
            "User ID": r.user_id,
            "Name": r.user.name if r.user else "N/A",
            "Punch In": r.punch_in,
            "Punch Out": r.punch_out,
            "Device IP": r.device_ip
        })

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Attendance')

    output.seek(0)
    filename = f"attendance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(output, download_name=filename, as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
