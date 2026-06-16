import os
import logging
from datetime import datetime, timezone, timedelta
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy.orm import DeclarativeBase
from werkzeug.security import generate_password_hash, check_password_hash
import io
import base64

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
if not app.secret_key:
    logger.warning("SESSION_SECRET not set, generating random secret key")
    app.secret_key = os.urandom(24)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = None

with app.app_context():
    import models
    db.create_all()
    logger.info("Database tables created")


@login_manager.user_loader
def load_user(user_id):
    from models import User
    return db.session.get(User, int(user_id))


@app.route('/')
def index():
    try:
        logger.debug("Attempting to serve index page")
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error serving index page: {str(e)}")
        return str(e), 500


@app.route('/health')
def health():
    return "OK", 200


@app.route('/qr-login/<token>')
def qr_login(token):
    from models import QRToken
    now = datetime.now(timezone.utc)
    qr = QRToken.query.filter_by(token=token, used=False).first()
    if qr and qr.expires_at.replace(tzinfo=timezone.utc) > now:
        qr.used = True
        db.session.commit()
        login_user(qr.user)
        return redirect(url_for('index'))
    return redirect(url_for('index') + '?qr_error=1')


@app.route('/api/auth/me')
def auth_me():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': {'id': current_user.id, 'username': current_user.username, 'email': current_user.email}})
    return jsonify({'logged_in': False})


@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    from models import User
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'})
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'})
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already taken.'})
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered.'})

    user = User(username=username, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    from models import User
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Invalid username or password.'})

    login_user(user)
    return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username, 'email': user.email}})


@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    logout_user()
    return jsonify({'success': True})


@app.route('/api/auth/qr-token')
@login_required
def generate_qr_token():
    from models import QRToken
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    token = QRToken(user_id=current_user.id, expires_at=expires)
    db.session.add(token)
    db.session.commit()
    return jsonify({'token': token.token})


@app.route('/api/sessions/save', methods=['POST'])
def save_session():
    if not current_user.is_authenticated:
        return jsonify({'success': False, 'message': 'Not logged in'})

    from models import StudySession
    data = request.get_json()
    today = datetime.now(timezone.utc).date()
    subject = data.get('subject', 'General')
    duration = int(data.get('duration', 25))

    existing = StudySession.query.filter_by(user_id=current_user.id, date=today, subject=subject).first()
    if existing:
        existing.sessions_completed += 1
        existing.total_focus_minutes += duration
    else:
        record = StudySession(
            user_id=current_user.id,
            date=today,
            sessions_completed=1,
            total_focus_minutes=duration,
            subject=subject
        )
        db.session.add(record)

    db.session.commit()
    return jsonify({'success': True})


@app.route('/api/analytics/weekly')
def analytics_weekly():
    if not current_user.is_authenticated:
        return jsonify({'success': False, 'data': []})

    from models import StudySession
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=6)
    records = StudySession.query.filter(
        StudySession.user_id == current_user.id,
        StudySession.date >= start,
        StudySession.date <= end
    ).all()

    day_map = {}
    for r in records:
        key = r.date.isoformat()
        if key not in day_map:
            day_map[key] = {'sessions': 0, 'minutes': 0}
        day_map[key]['sessions'] += r.sessions_completed
        day_map[key]['minutes'] += r.total_focus_minutes

    result = []
    for i in range(6, -1, -1):
        d = end - timedelta(days=i)
        key = d.isoformat()
        result.append({'date': key, 'sessions': day_map.get(key, {}).get('sessions', 0), 'minutes': day_map.get(key, {}).get('minutes', 0)})

    return jsonify({'success': True, 'data': result})


@app.route('/api/analytics/today')
def analytics_today():
    if not current_user.is_authenticated:
        return jsonify({'success': False})

    from models import StudySession
    today = datetime.now(timezone.utc).date()
    records = StudySession.query.filter_by(user_id=current_user.id, date=today).all()

    total_sessions = sum(r.sessions_completed for r in records)
    total_minutes = sum(r.total_focus_minutes for r in records)
    subjects = [{'subject': r.subject, 'sessions': r.sessions_completed} for r in records]

    return jsonify({
        'success': True,
        'sessions': total_sessions,
        'minutes': total_minutes,
        'subjects': subjects
    })


logger.info("Flask application initialized")
