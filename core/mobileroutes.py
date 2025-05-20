from flask import Blueprint, request, jsonify, session
import face_recognition
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from datetime import datetime, date
import pytz
from core.models import User, Attendance
from core.extensions import db
from core.utils import is_within_geofence

mobile = Blueprint('mobile', __name__)
local_timezone = pytz.timezone('Asia/Kolkata')

@mobile.route('/api/verify-face', methods=['POST'])
def verify_face():
    try:
        data = request.get_json()
        image_base64 = data.get("image")
        lat = data.get("latitude")
        lon = data.get("longitude")

        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        if lat is None or lon is None:
            return jsonify({'error': 'Missing coordinates'}), 400

        if not is_within_geofence(lat, lon):
            return jsonify({'error': 'Outside geofence area'}), 403

        image_data = base64.b64decode(image_base64.split(',')[-1])
        image = np.array(Image.open(BytesIO(image_data)))

        uploaded_encodings = face_recognition.face_encodings(image)
        if len(uploaded_encodings) == 0:
            return jsonify({'error': 'No face detected'}), 400

        uploaded_encoding = uploaded_encodings[0]
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()
        now = datetime.now(local_timezone).replace(tzinfo=None)
        today_date = now.date()

        users = User.query.filter(User.face_encoding != None).all()
        for user in users:
            known_encoding = np.frombuffer(user.face_encoding)
            match = face_recognition.compare_faces([known_encoding], uploaded_encoding, tolerance=0.45)[0]
            if match:
                # Store user info in session, mimicking OAuth2 login
                session['user'] = {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                    'name': user.name
                }
                session.modified = True  # Ensure session is saved

                attendance_record = Attendance.query.filter_by(
                    user_id=user.id,
                    date=today_date
                ).order_by(Attendance.punch_in_time.desc()).first()

                if not attendance_record or not attendance_record.punch_in_time:
                    ip_record = Attendance.query.filter_by(
                        device_ip=ip_address,
                        date=today_date
                    ).first()
                    if ip_record:
                        return jsonify({'error': 'This IP has already been used for punch-in today'}), 403

                    new_attendance = Attendance(
                        user_id=user.id,
                        name=user.name,
                        punch_in_time=now,
                        punch_out_time=None,
                        date=today_date,
                        device_ip=ip_address
                    )
                    db.session.add(new_attendance)
                    db.session.commit()
                    return jsonify({
                        'success': True,
                        'message': f'Punched in for {user.name}',
                        'role': user.role
                    }), 200

                else:
                    if attendance_record.punch_out_time:
                        return jsonify({
                            'success': True,
                            'message': f'Already punched out for {user.name}',
                            'role': user.role
                        }), 200
                    if attendance_record.device_ip != ip_address:
                        return jsonify({'error': 'Punch-out must be from the same device as punch-in'}), 403

                    attendance_record.punch_out_time = now
                    db.session.commit()
                    return jsonify({
                        'success': True,
                        'message': f'Punched out for {user.name}',
                        'role': user.role
                    }), 200

        return jsonify({'success': False, 'message': 'Face did not match'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500