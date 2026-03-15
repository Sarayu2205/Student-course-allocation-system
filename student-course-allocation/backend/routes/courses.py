from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.course import Course
from models.student import Student

courses_bp = Blueprint('courses', __name__)

def uid(): return int(get_jwt_identity())

@courses_bp.get('/courses')
@jwt_required()
def get_all():
    return jsonify(courses=Course.all()), 200

@courses_bp.post('/courses')
@jwt_required()
def create():
    u = Student.by_id(uid())
    if u['role'] != 'admin': return jsonify(error='Unauthorized'), 403
    d = request.get_json()
    cid = Course.create(d['name'], d['code'], d.get('department', 'Computer Science'),
                        d.get('capacity', 30), d.get('credits', 3),
                        d.get('prerequisite_id') or None, d.get('time_slot', ''), d.get('description', ''))
    return jsonify(message='Course created', id=cid), 201

@courses_bp.put('/courses/<int:cid>')
@jwt_required()
def update(cid):
    u = Student.by_id(uid())
    if u['role'] != 'admin': return jsonify(error='Unauthorized'), 403
    d = request.get_json()
    Course.update(cid, d['name'], d['code'], d.get('department', 'Computer Science'),
                  d.get('capacity', 30), d.get('credits', 3),
                  d.get('prerequisite_id') or None, d.get('time_slot', ''), d.get('description', ''))
    return jsonify(message='Updated'), 200

@courses_bp.delete('/courses/<int:cid>')
@jwt_required()
def delete(cid):
    u = Student.by_id(uid())
    if u['role'] != 'admin': return jsonify(error='Unauthorized'), 403
    Course.delete(cid)
    return jsonify(message='Deleted'), 200
