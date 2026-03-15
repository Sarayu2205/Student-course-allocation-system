from database.db import run

class Allocation:
    @staticmethod
    def save(student_id, course_id, semester, score, status):
        run("""INSERT INTO allocations(student_id,course_id,semester,allocation_score,status)
               VALUES(%s,%s,%s,%s,%s)
               ON DUPLICATE KEY UPDATE allocation_score=%s,status=%s""",
            (student_id, course_id, semester, score, status, score, status))

    @staticmethod
    def clear(semester):
        run("DELETE FROM allocations WHERE semester=%s", (semester,))

    @staticmethod
    def by_student(student_id, semester):
        return run("""SELECT a.*,c.name as course_name,c.code,c.credits,c.time_slot,c.department
                      FROM allocations a JOIN courses c ON a.course_id=c.id
                      WHERE a.student_id=%s AND a.semester=%s ORDER BY a.status,c.code""",
                   (student_id, semester))

    @staticmethod
    def all_allocs(semester):
        return run("""SELECT a.*,s.name as student_name,s.email,s.department,
                             c.name as course_name,c.code
                      FROM allocations a JOIN students s ON a.student_id=s.id
                      JOIN courses c ON a.course_id=c.id
                      WHERE a.semester=%s ORDER BY c.code,a.status""", (semester,))

    @staticmethod
    def stats(semester):
        return run("""SELECT c.id,c.code,c.name,c.capacity,c.department,
                             COUNT(CASE WHEN a.status='allocated' THEN 1 END) as allocated,
                             COUNT(CASE WHEN a.status='waitlist' THEN 1 END) as waitlisted,
                             COUNT(CASE WHEN a.status='rejected' THEN 1 END) as rejected
                      FROM courses c LEFT JOIN allocations a ON c.id=a.course_id AND a.semester=%s
                      GROUP BY c.id ORDER BY c.code""", (semester,))

    @staticmethod
    def unallocated(semester):
        return run("""SELECT s.id,s.name,s.email,s.department FROM students s
                      WHERE s.role='student' AND s.id NOT IN(
                        SELECT DISTINCT student_id FROM allocations
                        WHERE semester=%s AND status='allocated')""", (semester,))

    @staticmethod
    def completed(student_id):
        rows = run("SELECT course_id FROM completed_courses WHERE student_id=%s", (student_id,))
        return [r['course_id'] for r in rows]
