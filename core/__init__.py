

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from core.config import Config
from flask_cors import CORS 
from core.auth import configure_oauth, oauth
from flask_session import Session
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key")
    app.config.from_object(Config)

    # Session configuration (FIX)
    app.config['SESSION_TYPE'] = 'filesystem'      # Store session server-side
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_COOKIE_NAME'] = 'flask_session'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Use 'None' only if you use HTTPS and Secure=True
    app.config['SESSION_COOKIE_SECURE'] = False    # Must be False for localhost HTTP

    # Initialize session
    Session(app)

    # CORS (React frontend allowed)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    # DB
    db.init_app(app)
    migrate.init_app(app, db)

    # OAuth
    configure_oauth(app)

    # Import models before migration
    from core import models

    # Routes
    from core.routes import routes_bp
    app.register_blueprint(routes_bp)

    return app

