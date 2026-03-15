from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.preference import Preference

prefs_bp = Blueprint('prefs', __name__)

def uid(): return int(get_jwt_identity())

@prefs_bp.post('/submit-preferences')
@jwt_required()
def submit():
    d = request.get_json()
    prefs = d.get('preferences', [])
    semester = d.get('semester', 'Fall 2024')
    if not prefs:
        return jsonify(error='No preferences provided'), 400
    Preference.submit(uid(), prefs, semester)
    return jsonify(message='Preferences submitted'), 200

@prefs_bp.get('/preferences')
@jwt_required()
def get_prefs():
    semester = request.args.get('semester', 'Fall 2024')
    return jsonify(preferences=Preference.by_student(uid(), semester)), 200
