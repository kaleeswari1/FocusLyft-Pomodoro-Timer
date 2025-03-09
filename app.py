from flask import Flask, render_template
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

if not app.secret_key:
    logger.warning("SESSION_SECRET not set, generating random secret key")
    app.secret_key = os.urandom(24)

@app.route('/')
def index():
    try:
        logger.debug("Attempting to serve index page")
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error serving index page: {str(e)}")
        return str(e), 500

# Log startup
logger.info("Flask application initialized")