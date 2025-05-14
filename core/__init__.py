# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate
# from core.config import Config

# db = SQLAlchemy()
# migrate = Migrate()

# def create_app():
#     app = Flask(__name__)
#     app.config.from_object(Config)

#     db.init_app(app)
#     migrate.init_app(app, db)
    

    
#     from core import models  # Import models after app context is set
#     from core import routes # Import models and routes after db setup

#     return app
# core/__init__.py
# core/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from core.config import Config
from flask_cors import CORS 

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models to ensure they are registered before migration
    from core import models

    # Register blueprint routes
    from core.routes import routes_bp
    app.register_blueprint(routes_bp)
    

    return app
