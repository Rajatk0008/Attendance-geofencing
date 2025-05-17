from flask import Blueprint, request, jsonify, send_file
from datetime import datetime, time
from core import db
from core.models import User, Attendance, UnregisteredUser
from core.utils import is_within_geofence
import pytz, pandas as pd, io

from flask import redirect, url_for, session, jsonify
from core.auth import oauth
import secrets
from sqlalchemy import func
from core.monthly_report import generate_and_send_monthly_report
from flask import current_app

routes_bp = Blueprint('routes_bp', __name__)

local_timezone = pytz.timezone('Asia/Kolkata')
GEOFENCE_LAT = 20.294776
GEOFENCE_LON = 85.813756
GEOFENCE_RADIUS = 200  # meters

# ---------- API: Register ----------
# @routes_bp.route('/api/admin/register-user', methods=['POST'])
# def api_register():
#     data = request.get_json()
#     name = data.get('name', '').strip()
#     email = data.get('email', '').strip().lower()
#     role = data.get('role', 'user').strip().lower()  # Default to 'user' if not provided

#     # Validate name, email, and optionally role
#     if not name:
#         return jsonify({'status': 'error', 'message': 'Name is required'}), 400
#     if not email:
#         return jsonify({'status': 'error', 'message': 'Email is required'}), 400
#     if role not in ['admin', 'user','superadmin']:
#         return jsonify({'status': 'error', 'message': 'Invalid role'}), 400

#     # Ensure the email is unique
#     existing_user = User.query.filter_by(email=email).first()
#     if existing_user:
#         return jsonify({'status': 'error', 'message': 'User with this email already exists'}), 400

#     try:
#         # Create and add the new user to the database
#         user = User(name=name, email=email, role=role)
#         db.session.add(user)
#         db.session.commit()

#         return jsonify({'status': 'success', 'message': f'✅ {role.capitalize()} registered successfully'}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'status': 'error', 'message': str(e)}), 500



# ---------- API: Mark Attendance ----------
@routes_bp.route('/api/attendance', methods=['POST'])
def api_attendance():
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
    now = datetime.now(local_timezone).replace(tzinfo=None)
    today_date = now.date()

    attendance_record = Attendance.query.filter_by(
        user_id=user.id,
        date=today_date
    ).order_by(Attendance.punch_in_time.desc()).first()

    if action == "punch_in":
        if attendance_record and attendance_record.punch_in_time:
            return jsonify({'status': 'denied', 'message': '⚠️ Already punched in today.'}), 403

        ip_record = Attendance.query.filter_by(
            device_ip=ip_address,
            date=today_date
        ).first()
        if ip_record:
            return jsonify({'status': 'denied', 'message': '🚫 This IP has already been used for punch-in today'}), 403

        new_attendance = Attendance(
            user_id=user.id,
            name=name,
            punch_in_time=now,
            date=today_date,
            device_ip=ip_address
        )
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify({'status': 'success', 'message': f"✅ Punched in for {name}"}), 200

    elif action == "punch_out":
        if not attendance_record or not attendance_record.punch_in_time:
            return jsonify({'status': 'error', 'message': '⚠️ Missing punch-in. Cannot punch out.'}), 400
        if attendance_record.punch_out_time:
            return jsonify({'status': 'success', 'message': f"✅ Already punched out for {name}"}), 200
        if attendance_record.device_ip != ip_address:
            return jsonify({'status': 'error', 'message': '🚫 Punch-out must be from the same device as punch-in.'}), 403

        attendance_record.punch_out_time = now
        db.session.commit()
        return jsonify({'status': 'success', 'message': f"🕒 Punched out for {name}"}), 200

    return jsonify({'status': 'error', 'message': '⚠️ Invalid action.'}), 400



@routes_bp.route('/api/me')
def api_me():
    # print("----- Incoming /api/me request -----")
    
    # print(f"Request method: {request.method}")
    # print(f"Request headers: {dict(request.headers)}")
    # print(f"Request cookies: {request.cookies}")

    # print("Session contents in /api/me:", dict(session))
    
    user = session.get('user')
    
    if not user:
        print("User not found in session, returning 401")
        return jsonify({'error': 'Unauthorized'}), 401
    print("User found in session:", user)
    return jsonify(user), 200



# ---------- API: Admin Panel ----------
@routes_bp.route('/api/admin/attendance', methods=['GET'])
def api_admin_attendance():
    # Get `date` query parameter
    date_str = request.args.get('date')
    try:
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            target_date = datetime.now(local_timezone).date()
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    users = User.query.all()
    result = []

    for user in users:
        records = Attendance.query.filter_by(
            user_id=user.id,
            date=target_date
        ).order_by(Attendance.punch_in_time.desc()).all()

        result.append({
            'name': user.name.title(),
            'records': [
                {
                    'punch_in': r.punch_in_time.isoformat() if r.punch_in_time else None,
                    'punch_out': r.punch_out_time.isoformat() if r.punch_out_time else None,
                    'device_ip': r.device_ip
                } for r in records
            ]
        })

    return jsonify(result), 200
# ---------- API: User Attendance ----------

@routes_bp.route('/api/admin/user-attendance')
def api_user_attendance():
    name = request.args.get('name', '').strip().lower()
    date_str = request.args.get('date')

    if not name or not date_str:
        return jsonify({}), 400

    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({}), 400

    user = User.query.filter(func.lower(User.name) == name).first()
    if not user:
        return jsonify({}), 404

    attendance = Attendance.query.filter_by(user_id=user.id, date=date_obj).first()
    if not attendance:
        return jsonify({})

    return jsonify({
        'punch_in': attendance.punch_in_time.strftime('%H:%M:%S') if attendance.punch_in_time else None,
        'punch_out': attendance.punch_out_time.strftime('%H:%M:%S') if attendance.punch_out_time else None,
    })

# ---------- API: Download Excel ----------
@routes_bp.route('/api/admin/download-attendance', methods=['GET'])
def api_download_attendance():
    records = Attendance.query.join(User).all()
    if not records:
        return jsonify({'status': 'error', 'message': 'No records found'}), 404

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
    filename = f"attendance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(
        output,
        download_name=filename,
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )


# ---------- Route to initiate login ---------- 

@routes_bp.route('/login')
def login():
    nonce = secrets.token_urlsafe(32)
    session['nonce'] = nonce
    print("Session set before redirect:", dict(session))  # <-- Debug this

    redirect_uri = url_for('routes_bp.auth_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri, nonce=nonce)


# ---------- Callback after login ---------- 


@routes_bp.route('/login/callback')
def auth_callback():
    try:
        print("Session on callback:", dict(session))
        # Step 1: Exchange code for token
        token = oauth.google.authorize_access_token()
        print("Token:", token)

        # Step 2: Verify and parse ID token with nonce for CSRF protection
        nonce = session.pop('nonce', None)
        if not nonce:
            return jsonify({'status': 'error', 'message': 'Missing nonce'}), 400

        # Get user information from Google
        user_info = oauth.google.get('userinfo').json()
        print("User Info:", user_info)

        # Step 3: Extract email and name from user info
        email = user_info.get('email', '').lower()
        name = user_info.get('name', '').strip()

        if not email or not name:
            return jsonify({'status': 'error', 'message': 'Missing user info in Google response'}), 400

        # Step 4: Check if the user is pre-registered by admin
        user = User.query.filter_by(email=email).first()
        if not user:
            # If user is not registered, redirect to the 'unregistered' page
            return redirect("http://localhost:5173/unregistered")

        # Step 5: Store user session data
        session['user'] = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
        print("Session after setting user:", dict(session))  # <-- Debug this

        # Step 6: Redirect user based on their role
        if user.role == 'admin' or user.role == 'superadmin':
            return redirect("http://localhost:5173/admin") 
        else:
            return redirect("http://localhost:5173/home")  
        

    except Exception as e:
        # Catch any errors and return a meaningful response
        return jsonify({
            'status': 'error',
            'message': 'Failed to authenticate with Google',
            'details': str(e)
        }), 400





# ---------- logout ----------

@routes_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'status': 'success', 'message': 'Logged out'}), 200





        
    
    
@routes_bp.route('/api/admin/register-user', methods=['POST'])
def admin_register_user():
    current_user = session.get('user')
    if not current_user:
        return jsonify({'status': 'error', 'message': 'Access denied. Login required.'}), 403
    
    current_user_role = current_user.get('role')  # e.g. 'superadmin', 'admin', 'user'
    
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    name = data.get('name', '').strip()
    new_user_role = data.get('role', 'user').strip().lower()  # default to 'user' if not provided

    # Basic validation
    if not email or not name:
        return jsonify({'status': 'error', 'message': 'Email and name are required'}), 400
    
    # Role validation
    allowed_roles = ['superadmin', 'admin', 'user']
    if new_user_role not in allowed_roles:
        return jsonify({'status': 'error', 'message': 'Invalid role specified'}), 400

    # Permission check function
    def can_create_user(creator_role, new_role):
        if creator_role == 'superadmin':
            return True  # can create any role
        elif creator_role == 'admin':
            return new_role == 'user'  # admin can create only 'user'
        else:
            return False  # normal users cannot create

    if not can_create_user(current_user_role, new_user_role):
        return jsonify({'status': 'error', 'message': 'Access denied. You cannot create this type of user.'}), 403

    # Check if user already exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'status': 'error', 'message': 'User already registered'}), 409

    # Create user with role
    user = User(name=name, email=email, role=new_user_role)
    db.session.add(user)
    db.session.commit()

    return jsonify({'status': 'success', 'message': f'✅ {new_user_role.capitalize()} {name} registered successfully'}), 200



# ---------- fetch today attendance ----------
@routes_bp.route('/api/admin/attendance-today', methods=['GET'])
def get_today_attendance():
    try:
        today = datetime.today().strftime('%Y-%m-%d')

        # Fetch all attendance records for today
        attendance = db.session.query(User.name, Attendance.punch_in, Attendance.punch_out, Attendance.device_ip) \
            .join(Attendance, User.id == Attendance.user_id) \
            .filter(Attendance.punch_in.like(f'{today}%')) \
            .all()

        return jsonify([{
            'name': record.name,
            'punch_in': record.punch_in,
            'punch_out': record.punch_out,
            'device_ip': record.device_ip
        } for record in attendance]), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

@routes_bp.route('/api/test-send-report', methods=['GET'])
def test_send_report():
    try:
        # Optionally get year/month from query parameters
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)

        generate_and_send_monthly_report(current_app, year, month)
        return {"status": "success", "message": f"Monthly report email sent for {month}/{year}"}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500
    

@routes_bp.route('/api/delete-user', methods=['DELETE'])
def delete_user():
    
    if 'user' not in session or 'id' not in session['user']:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
    
    # Get current logged-in user info
    current_user = User.query.get(session['user']['id'])

    if not current_user:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    data = request.get_json()
    email_to_delete = data.get('email')

    if not email_to_delete:
        return jsonify({'status': 'error', 'message': 'Email is required'}), 400

    user_to_delete = User.query.filter_by(email=email_to_delete).first()
    if not user_to_delete:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404

    # Authorization logic
    if current_user.role == 'superadmin':
        # superadmin can delete anyone except themselves (optional)
        if user_to_delete.id == current_user.id:
            return jsonify({'status': 'error', 'message': 'You cannot delete yourself'}), 400

    elif current_user.role == 'admin':
        # admin can only delete users with role 'user'
        if user_to_delete.role != 'user':
            return jsonify({'status': 'error', 'message': 'Admins can only delete regular users'}), 403
        if user_to_delete.id == current_user.id:
            return jsonify({'status': 'error', 'message': 'You cannot delete yourself'}), 400

    else:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    # Perform deletion
    db.session.delete(user_to_delete)
    db.session.commit()

    return jsonify({'status': 'success', 'message': f'User {email_to_delete} deleted'}), 200







# ---------- post users from UR page ----------
@routes_bp.route('/api/request-registration', methods=['POST'])
def request_registration():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')

    if not name or not email:
        return jsonify({'status': 'error', 'message': 'Name and email required'}), 400

    # Check if email already exists in UnregisteredUser to avoid duplicates
    existing_user = UnregisteredUser.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'status': 'error', 'message': 'This email is already submitted for registration'}), 409

    # Create new unregistered user record
    new_unregistered_user = UnregisteredUser(name=name, email=email)
    db.session.add(new_unregistered_user)
    db.session.commit()

    print(f"📩 Registration request received: {name} <{email}> and stored in DB")

    return jsonify({'status': 'success', 'message': 'Registration request submitted'}), 200



# ---------- Get users admin ----------
@routes_bp.route('/api/unregistered-users', methods=['GET'])
def get_unregistered_users():
    # Optional: check if current user is admin or superadmin here
    unregistered = UnregisteredUser.query.all()
    result = [
        {'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role}
        for u in unregistered
    ]
    return jsonify(result), 200

# ---------- Accept unregistered user ----------

@routes_bp.route('/api/unregistered-users/<int:user_id>/accept', methods=['POST'])
def accept_unregistered_user(user_id):
    unreg_user = UnregisteredUser.query.get_or_404(user_id)

    # Check if email already in User
    existing_user = User.query.filter_by(email=unreg_user.email).first()
    if existing_user:
        # Remove from unregistered anyway because they exist in User table already
        db.session.delete(unreg_user)
        db.session.commit()
        return jsonify({'status': 'error', 'message': 'User already registered'}), 409

    # Create a new User with role 'user'
    new_user = User(name=unreg_user.name, email=unreg_user.email, role='user')
    db.session.add(new_user)
    db.session.delete(unreg_user)
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'User accepted and added'}), 200

# ---------- Reject unregistered user ----------
@routes_bp.route('/api/unregistered-users/<int:user_id>/reject', methods=['POST'])
def reject_unregistered_user(user_id):
    unreg_user = UnregisteredUser.query.get_or_404(user_id)
    db.session.delete(unreg_user)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'User rejected and removed'}), 200

# ---------- Update user details ----------
@routes_bp.route('/api/admin/update-user', methods=['PUT'])
def update_user():
    data = request.get_json()
    user_id = data.get('id')
    new_name = data.get('name')
    new_email = data.get('email')
    new_role = data.get('role')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404

    if new_name:
        user.name = new_name
    if new_email:
        user.email = new_email
    if new_role:
        user.role = new_role

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'User updated'})

# ---------- Get all users ----------
@routes_bp.route('/api/admin/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([
        {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        } for user in users
    ])

# ---------- Update punch in status ----------

@routes_bp.route('/api/admin/punchupdate', methods=['PUT'])  # Or your custom role check decorator
def update_attendance():
    data = request.get_json()
    user_id = data.get('user_id')
    date_str = data.get('date')  # e.g., '2025-05-16'
    punch_in_time = data.get('punch_in')  # expected format: 'HH:MM'
    punch_out_time = data.get('punch_out')  # expected format: 'HH:MM'

    if not user_id or not date_str:
        return jsonify({'status': 'error', 'message': 'User ID and date are required'}), 400

    try:
        # Parse date
        date = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Fetch or create attendance record
        attendance = Attendance.query.filter_by(user_id=user_id, date=date).first()
        if not attendance:
            attendance = Attendance(user_id=user_id, date=date)

        # Update punch-in time
        if punch_in_time:
            h_in, m_in = map(int, punch_in_time.split(':'))
            attendance.punch_in_time = datetime.combine(date, time(h_in, m_in))
            print(f"✅ Punch-in updated to {attendance.punch_in_time}")

        # Update punch-out time
        if punch_out_time:
            h_out, m_out = map(int, punch_out_time.split(':'))
            attendance.punch_out_time = datetime.combine(date, time(h_out, m_out))
            print(f"✅ Punch-out updated to {attendance.punch_out_time}")

        db.session.add(attendance)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Attendance updated successfully'}), 200

    except Exception as e:
        print(f"Error updating attendance: {e}")
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

