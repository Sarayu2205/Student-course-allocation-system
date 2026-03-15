from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.student import Student
from models.allocation import Allocation
from models.notification import Notification
from models.course import Course
from ml.allocator import AllocationEngine

alloc_bp = Blueprint('alloc', __name__)

def uid(): return int(get_jwt_identity())

@alloc_bp.post('/run-allocation')
@jwt_required()
def run_alloc():
    u = Student.by_id(uid())
    if u['role'] != 'admin':
        return jsonify(error='Unauthorized'), 403

    semester = (request.get_json() or {}).get('semester', 'Fall 2024')
    result = AllocationEngine(semester).run()

    # Fire notifications for every student allocation
    _send_allocation_notifications(semester)

    return jsonify(message='Allocation complete', result=result), 200


def _send_allocation_notifications(semester):
    """Create a notification for every allocation record in this semester."""
    allocs = Allocation.all_allocs(semester)
    courses = {c['id']: c for c in Course.all()}

    # Group by student
    by_student = {}
    for a in allocs:
        by_student.setdefault(a['student_id'], []).append(a)

    for student_id, records in by_student.items():
        allocated  = [r for r in records if r['status'] == 'allocated']
        waitlisted = [r for r in records if r['status'] == 'waitlist']
        rejected   = [r for r in records if r['status'] == 'rejected']

        # One summary notification per student
        if allocated:
            names = ', '.join(r['course_name'] for r in allocated[:3])
            extra = f' and {len(allocated)-3} more' if len(allocated) > 3 else ''
            Notification.create(
                student_id,
                f'🎉 Course Allocation Results — {semester}',
                f'You have been allocated to: {names}{extra}. '
                f'Total: {len(allocated)} course(s) allocated'
                + (f', {len(waitlisted)} waitlisted' if waitlisted else '')
                + '.',
                'allocated'
            )
        elif waitlisted:
            names = ', '.join(r['course_name'] for r in waitlisted[:3])
            Notification.create(
                student_id,
                f'⏳ Waitlisted — {semester}',
                f'You are on the waitlist for: {names}. '
                'You will be notified if a seat opens up.',
                'waitlist'
            )
        elif rejected:
            Notification.create(
                student_id,
                f'❌ Allocation Update — {semester}',
                'Unfortunately no seats were available for your selected courses. '
                'Please contact your advisor.',
                'rejected'
            )


@alloc_bp.get('/allocation-result')
@jwt_required()
def result():
    semester = request.args.get('semester', 'Fall 2024')
    return jsonify(allocations=Allocation.by_student(uid(), semester)), 200


@alloc_bp.get('/admin/reports')
@jwt_required()
def reports():
    u = Student.by_id(uid())
    if u['role'] != 'admin':
        return jsonify(error='Unauthorized'), 403
    semester = request.args.get('semester', 'Fall 2024')
    return jsonify(
        stats=Allocation.stats(semester),
        unallocated=Allocation.unallocated(semester),
        allocations=Allocation.all_allocs(semester),
        total_students=len(Student.all_students())
    ), 200


@alloc_bp.get('/admin/students')
@jwt_required()
def students():
    u = Student.by_id(uid())
    if u['role'] != 'admin':
        return jsonify(error='Unauthorized'), 403
    return jsonify(students=Student.all_students()), 200
