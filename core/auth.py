from authlib.integrations.flask_client import OAuth
from flask import url_for
import os

oauth = OAuth()

def configure_oauth(app):
    oauth.init_app(app)

    app.config['GOOGLE_CLIENT_ID'] = os.getenv("YOUR_CLIENT_ID")
    app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('YOUR_CLIENT_SECRET')

    oauth.register(
        name='google',
        client_id=app.config['GOOGLE_CLIENT_ID'],
        client_secret=app.config['GOOGLE_CLIENT_SECRET'],
        access_token_url='https://oauth2.googleapis.com/token',
        access_token_params=None,
        authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
        authorize_params=None,
        api_base_url='https://www.googleapis.com/oauth2/v1/',
        userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
        client_kwargs={'scope': 'openid email profile'},
        jwks_uri='https://www.googleapis.com/oauth2/v3/certs' 
    )

    