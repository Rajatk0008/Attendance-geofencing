
from datetime import datetime
from core import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # Changed to 'id'
    punch_in = db.Column(db.DateTime, default=datetime.now)
    punch_out = db.Column(db.DateTime, nullable=True)
    device_ip = db.Column(db.String(50), nullable=False)

    user = db.relationship('User', backref=db.backref('attendance', lazy=True))
