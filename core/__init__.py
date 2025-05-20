from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from core.config import Config
from flask_cors import CORS
from core.auth import configure_oauth, oauth
from flask_session import Session
import os
from flask_mail import Mail
from core.extensions import db, migrate, mail
from core.routes import routes_bp
from core.mobileroutes import mobile

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_secret_key")
    app.config.from_object(Config)

    
    # Session configuration
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_COOKIE_NAME'] = 'flask_session'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
  
    Session(app)

    # CORS
    # CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

    # OAuth
    configure_oauth(app)

    # Routes
    app.register_blueprint(routes_bp)
    app.register_blueprint(mobile)

    return app
