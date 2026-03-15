from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notification import Notification

notif_bp = Blueprint('notif', __name__)

def uid(): return int(get_jwt_identity())

@notif_bp.get('/notifications')
@jwt_required()
def get_notifs():
    notifs = Notification.by_student(uid())
    unread = Notification.unread_count(uid())
    return jsonify(notifications=notifs, unread=unread), 200

@notif_bp.post('/notifications/read-all')
@jwt_required()
def read_all():
    Notification.mark_read(uid())
    return jsonify(message='Marked all read'), 200

@notif_bp.post('/notifications/<int:nid>/read')
@jwt_required()
def read_one(nid):
    Notification.mark_one_read(nid, uid())
    return jsonify(message='Marked read'), 200
