from flask import Blueprint, request, jsonify, url_for, session, flash, redirect, render_template, make_response, current_app
from flask_login import current_user, login_user, logout_user
from flask_mail import Mail, Message
from config import app, db, bcrypt, login_manager
from functools import wraps
from itsdangerous import URLSafeTimedSerializer
from models import db, User
from email_service import send_email_via_api
import os
import requests


# Create a Blueprint for authentication routes
auth = Blueprint('auth', __name__)
mail = Mail(app)


API_BASE = "https://venuo.mk0x.com"


# Decorator to check if the user is already authenticated and redirect to home page if so
def logout_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if current_user.is_authenticated:
            flash("You are already authenticated", "info")
            return redirect("/")
        return func(*args, **kwargs)
    return decorated_function

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Takes email and generated token based on email and salt
def generate_token(email):
    serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"]) # This is for mail token generation
    return serializer.dumps(email, salt=app.config["SECURITY_PASSWORD_SALT"])

# Checks if the token is valid and has not expired (returns True)
def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])
    try:
        email = serializer.loads(
            token, salt=app.config["SECURITY_PASSWORD_SALT"], max_age=expiration
        )
        return email
    except Exception:
        return False

def send_mail(to, subject, message_file, email):
    email_message = Message(
        subject,
        recipients=[to],
        html=message_file,
        sender=app.config["MAIL_DEFAULT_SENDER"],
    )
    email.send(email_message)


@auth.route("/confirm/<token>", methods=["GET"])
def confirm_email(token):
    try:
        email = confirm_token(token)
        if not email:
            return jsonify({"message": "Invalid or expired confirmation link"}), 400
            
        user = User.query.filter_by(user_email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        if user.is_confirmed:
            return jsonify({"message": "Email already confirmed"}), 200
            
        if user.user_email == email:
            user.is_confirmed = True
            db.session.add(user)
            db.session.commit()
            return jsonify({"message": "Email confirmed successfully"}), 200
        else:
            return jsonify({"message": "The confirmation link is invalid or has expired."}), 400
        
        
    except Exception as e:
        print(f"Email confirmation error: {e}")
        return jsonify({"message": "Email confirmation failed"}), 500


@auth.route("/register", methods=["POST"])
def register():
    print("Registration started")
    data = request.json
    name = data.get("userName")
    surname = data.get("userSurname")
    email = data.get("userEmail")
    password = data.get("userPassword")

    user_exists = User.query.filter_by(user_email=email).first() is not None
    if user_exists:
        return jsonify({"message": "User with this email already exists"}), 409

    raw_hashed_password = bcrypt.generate_password_hash(password)
    str_hashed_password = raw_hashed_password.decode("utf-8")
    new_user = User(
        user_name=name,
        user_surname=surname,
        user_email=email,
        user_password=str_hashed_password,
        is_confirmed=False,
    )

    db.session.add(new_user)
    db.session.commit()

    token = generate_token(email)
    confirm_url = f"https://venuo.mk0x.com/confirm/{token}"
    print(f"Confirmation URL: {confirm_url}")

    subject = "Please confirm your email - Venuo Events"
    try:
        app.template_folder = os.path.abspath('templates')
        html = render_template("confirm_email.html", confirm_url=confirm_url)
        
        # Use HTTP API instead of SMTP
        send_email_via_api(new_user.user_email, subject, html)
        print("Email sent successfully via API!")
        
        return jsonify({
            "id": new_user.id,
            "userName": new_user.user_name,
            "userSurname": new_user.user_surname,
            "userEmail": new_user.user_email,
            "message": "Registration successful! Please check your email to confirm your account."
        }), 201
        
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return jsonify({
            "id": new_user.id,
            "userName": new_user.user_name,
            "userSurname": new_user.user_surname,
            "userEmail": new_user.user_email,
            "message": "Registration successful, but email sending failed. Please contact support.",
            "warning": str(e)
        }), 201


@auth.route("/login", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return jsonify({"message": "You are already logged in"}), 200
    data = request.json
    email = data.get("userEmail")
    password = data.get("userPassword")
    
    if not email or not password:
        return jsonify({"message": "Both email and password field cannot be empty"}), 400

    user = User.query.filter_by(user_email=email).first()
    if not user:
        return jsonify({"message": "User Not Found"}), 401

    if not bcrypt.check_password_hash(user.user_password, password):
        return jsonify({"message": "Unauthorized"}), 401

    if not user.is_confirmed:
        return jsonify({"message": "Please confirm your email before logging in"}), 403

    login_user(user)
    session["user_id"] = user.id # this assigns a session cookie with redis??

    return jsonify({
        "id": user.id,
        "userName": user.user_name,
        "userSurname": user.user_surname,
        "userEmail": user.user_email,
    }), 200


@auth.route("/logout", methods=["POST"])
def logout():
    print("Logout route called")  # Debug print
    print(f"Current user authenticated: {current_user.is_authenticated}")  # Debug print
    print(f"Session before logout: {dict(session)}")  # Debug print
    
    # Log out the user (this clears Flask-Login's user session)
    logout_user()
    
    # Clear all session data
    session.clear()
    
    # Create response
    response = make_response(jsonify({"message": "Logout successful"}), 200)
    
    # Get the session cookie name from Flask config (default is 'session')
    session_cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')
    
    # Clear the session cookie completely - NO WARNING VERSION
    response.set_cookie(
        session_cookie_name,
        '',
        expires=0,
        httponly=app.config.get('SESSION_COOKIE_HTTPONLY', True),
        secure=app.config.get('SESSION_COOKIE_SECURE', True),
        samesite=app.config.get('SESSION_COOKIE_SAMESITE', 'None'),
        domain=app.config.get('SESSION_COOKIE_DOMAIN'),
        path=app.config.get('SESSION_COOKIE_PATH', '/')
    )

    print("Logout completed")  # Debug print
    return response


@auth.route("/auth/check", methods=["GET"])
def check_auth():
    return jsonify({"authenticated": current_user.is_authenticated}), 200


@auth.route("/@me", methods=["GET"])
def get_current_user():
    user_id = session.get("user_id")
    
    # If not in session but user is authenticated via Flask-Login, use current_user
    if not user_id and current_user.is_authenticated:
        user_id = current_user.id
        session["user_id"] = user_id

    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = User.query.filter_by(id=user_id).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "userName": user.user_name,
        "userSurname": user.user_surname,
        "userEmail": user.user_email,
    })

