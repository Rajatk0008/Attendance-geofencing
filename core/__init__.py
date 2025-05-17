

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from core.config import Config
from flask_cors import CORS 
from core.auth import configure_oauth, oauth
from flask_session import Session
import os
from flask import session
from flask_mail import Mail

db = SQLAlchemy()
migrate = Migrate()
mail = Mail() 

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key")
    app.config.from_object(Config)

    # Session configuration (FIX)
    app.config['SESSION_TYPE'] = 'filesystem'      
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_COOKIE_NAME'] = 'flask_session'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Use 'None' only if you use HTTPS and Secure=True
    app.config['SESSION_COOKIE_SECURE'] = False    # Must be False for localhost HTTP

# mail initialization
    mail.init_app(app)

    # Initialize session
    Session(app)

    

    # DB
    db.init_app(app)
    migrate.init_app(app, db)

    # CORS (React frontend allowed)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    # OAuth
    configure_oauth(app)

    # Import models before migration
    from core import models

    # Routes
    from core.routes import routes_bp
    app.register_blueprint(routes_bp)

    return app

