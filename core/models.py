from datetime import datetime
from core import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user') 

    def __repr__(self):
        return f"<User {self.name}, {self.email}, {self.role}>"

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100))
    punch_in_time = db.Column(db.DateTime)
    punch_out_time = db.Column(db.DateTime)
    date = db.Column(db.Date)
    device_ip = db.Column(db.String(100))

    user = db.relationship('User', backref=db.backref('attendance', lazy=True))


class UnregisteredUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False, default='user')
    

    def __repr__(self):
        return f"<UnregisteredUser {self.name}, {self.email}, {self.role}>"
