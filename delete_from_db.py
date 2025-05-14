# reset_db.py
from core import create_app, db
from core.models import User, Attendance
from flask import Flask

# Create the Flask app
app = create_app()

def reset_data():
    """Delete all records from the database."""
    with app.app_context():
        try:
            # Delete all records from the Attendance table first (to remove dependency)
            Attendance.query.delete()
            db.session.commit()

            # Now delete all records from the User table
            User.query.delete()
            db.session.commit()

            print("All records deleted successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"An error occurred while deleting data: {e}")


def drop_and_create():
    """Drop all tables and recreate them."""
    with app.app_context():
        try:
            # Drop all tables
            db.drop_all()
            # Recreate all tables
            db.create_all()
            print("All tables dropped and recreated successfully.")
        except Exception as e:
            print(f"An error occurred while dropping and creating tables: {e}")

if __name__ == '__main__':
    # Call either reset_data() or drop_and_create() based on your need
    print("1. Reset Data\n2. Drop and Recreate Tables")
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == '1':
        reset_data()
    elif choice == '2':
        drop_and_create()
    else:
        print("Invalid choice. Exiting...")
