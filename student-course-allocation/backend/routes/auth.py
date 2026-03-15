from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.student import Student

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/register')
def register():
    d = request.get_json()
    name = (d.get('name') or '').strip()
    email = (d.get('email') or '').strip().lower()
    password = d.get('password') or ''
    department = d.get('department') or 'General'
    if not all([name, email, password]):
        return jsonify(error='All fields are required'), 400
    if len(password) < 6:
        return jsonify(error='Password must be at least 6 characters'), 400
    if Student.by_email(email):
        return jsonify(error='Email already registered'), 409
    uid = Student.create(name, email, password, department)
    return jsonify(message='Registered successfully', user_id=uid), 201

@auth_bp.post('/login')
def login():
    d = request.get_json()
    email = (d.get('email') or '').strip().lower()
    password = d.get('password') or ''
    user = Student.by_email(email)
    if not user or not Student.verify(password, user['password_hash']):
        return jsonify(error='Invalid email or password'), 401
    token = create_access_token(identity=str(user['id']))
    return jsonify(access_token=token,
                   user=dict(id=user['id'], name=user['name'], email=user['email'],
                             department=user['department'], role=user['role'])), 200

@auth_bp.get('/me')
@jwt_required()
def me():
    user = Student.by_id(int(get_jwt_identity()))
    return jsonify(user=user), 200
