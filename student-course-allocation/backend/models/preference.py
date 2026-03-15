from database.db import run

class Preference:
    @staticmethod
    def submit(student_id, prefs, semester):
        run("DELETE FROM preferences WHERE student_id=%s AND semester=%s", (student_id, semester))
        for p in prefs:
            run("INSERT INTO preferences(student_id,course_id,rank_order,semester) VALUES(%s,%s,%s,%s)",
                (student_id, p['course_id'], p['rank'], semester))

    @staticmethod
    def by_student(student_id, semester):
        return run("""SELECT p.*,c.name as course_name,c.code,c.credits,c.capacity,c.time_slot,c.department
                      FROM preferences p JOIN courses c ON p.course_id=c.id
                      WHERE p.student_id=%s AND p.semester=%s ORDER BY p.rank_order""",
                   (student_id, semester))

    @staticmethod
    def all_prefs(semester):
        return run("""SELECT p.*,s.name as student_name,c.name as course_name,c.code
                      FROM preferences p JOIN students s ON p.student_id=s.id
                      JOIN courses c ON p.course_id=c.id
                      WHERE p.semester=%s ORDER BY p.student_id,p.rank_order""", (semester,))
