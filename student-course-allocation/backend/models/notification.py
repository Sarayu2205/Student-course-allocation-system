from database.db import run

class Notification:
    @staticmethod
    def create(student_id, title, message, ntype='info'):
        return run(
            "INSERT INTO notifications(student_id,title,message,type) VALUES(%s,%s,%s,%s)",
            (student_id, title, message, ntype), fetch='id'
        )

    @staticmethod
    def by_student(student_id, limit=20):
        return run(
            """SELECT * FROM notifications WHERE student_id=%s
               ORDER BY created_at DESC LIMIT %s""",
            (student_id, limit)
        )

    @staticmethod
    def unread_count(student_id):
        r = run(
            "SELECT COUNT(*) as n FROM notifications WHERE student_id=%s AND is_read=0",
            (student_id,), fetch='one'
        )
        return r['n'] if r else 0

    @staticmethod
    def mark_read(student_id):
        run("UPDATE notifications SET is_read=1 WHERE student_id=%s AND is_read=0",
            (student_id,))

    @staticmethod
    def mark_one_read(notif_id, student_id):
        run("UPDATE notifications SET is_read=1 WHERE id=%s AND student_id=%s",
            (notif_id, student_id))
