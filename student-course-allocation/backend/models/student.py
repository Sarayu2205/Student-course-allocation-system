import bcrypt
from database.db import run

class Student:
    @staticmethod
    def create(name, email, password, department):
        pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        return run("INSERT INTO students(name,email,password_hash,department) VALUES(%s,%s,%s,%s)",
                   (name, email, pw, department), fetch='id')

    @staticmethod
    def by_email(email):
        return run("SELECT * FROM students WHERE email=%s", (email,), fetch='one')

    @staticmethod
    def by_id(sid):
        return run("SELECT id,name,email,department,role FROM students WHERE id=%s", (sid,), fetch='one')

    @staticmethod
    def verify(password, pw_hash):
        return bcrypt.checkpw(password.encode(), pw_hash.encode())

    @staticmethod
    def all_students():
        return run("SELECT id,name,email,department,role,created_at FROM students WHERE role='student'")
