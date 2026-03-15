from database.db import run

class Course:
    @staticmethod
    def all():
        return run("""SELECT c.*,p.name as prerequisite_name,p.code as prerequisite_code
                      FROM courses c LEFT JOIN courses p ON c.prerequisite_id=p.id
                      ORDER BY c.code""")

    @staticmethod
    def by_id(cid):
        return run("SELECT * FROM courses WHERE id=%s", (cid,), fetch='one')

    @staticmethod
    def create(name, code, dept, capacity, credits, prereq_id, time_slot, desc):
        return run("INSERT INTO courses(name,code,department,capacity,credits,prerequisite_id,time_slot,description) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)",
                   (name, code, dept, int(capacity), int(credits), prereq_id or None, time_slot, desc), fetch='id')

    @staticmethod
    def update(cid, name, code, dept, capacity, credits, prereq_id, time_slot, desc):
        run("UPDATE courses SET name=%s,code=%s,department=%s,capacity=%s,credits=%s,prerequisite_id=%s,time_slot=%s,description=%s WHERE id=%s",
            (name, code, dept, int(capacity), int(credits), prereq_id or None, time_slot, desc, cid))

    @staticmethod
    def delete(cid):
        run("DELETE FROM courses WHERE id=%s", (cid,))

    @staticmethod
    def seat_count(cid, semester):
        r = run("SELECT COUNT(*) as n FROM allocations WHERE course_id=%s AND semester=%s AND status='allocated'",
                (cid, semester), fetch='one')
        return r['n'] if r else 0
