"""Auto database setup - reads credentials from ../.env"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import mysql.connector
import bcrypt

# Read .env manually
env = {}
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    for line in open(env_path):
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

host = env.get('DB_HOST', 'localhost')
user = env.get('DB_USER', 'root')
password = env.get('DB_PASSWORD', '')

print(f"Connecting to MySQL at {host} as {user}...")

try:
    conn = mysql.connector.connect(host=host, user=user, password=password)
    cursor = conn.cursor()
    print("✓ Connected")

    print("Dropping old database if exists...")
    cursor.execute("DROP DATABASE IF EXISTS course_allocation")
    conn.commit()
    print("✓ Old database dropped")

    schema = open(os.path.join(os.path.dirname(__file__), 'schema.sql')).read()
    for stmt in schema.split(';'):
        stmt = stmt.strip()
        if stmt:
            cursor.execute(stmt)
    conn.commit()
    print("✓ Schema created")

    cursor.execute("USE course_allocation")

    # Admin user
    admin_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    cursor.execute("INSERT IGNORE INTO students (name,email,password_hash,department,role) VALUES (%s,%s,%s,%s,%s)",
                   ("Admin User","admin@university.edu",admin_hash,"Administration","admin"))

    # Courses
    courses = [
        ("Introduction to Programming","CS101","Computer Science",50,3,None,"MWF 9:00-10:00","Fundamentals of programming"),
        ("Data Structures","CS201","Computer Science",40,4,None,"TTH 10:00-12:00","Arrays, trees, graphs"),
        ("Database Systems","CS301","Computer Science",35,3,None,"MWF 11:00-12:00","Relational databases and SQL"),
        ("Web Development","CS302","Computer Science",30,3,None,"TTH 14:00-16:00","Full-stack web development"),
        ("Machine Learning","CS401","Computer Science",25,4,None,"MWF 14:00-15:30","ML algorithms"),
        ("Software Engineering","CS402","Computer Science",30,3,None,"TTH 16:00-18:00","Software lifecycle"),
        ("Computer Networks","CS403","Computer Science",35,3,None,"MWF 8:00-9:00","Network protocols"),
        ("Operating Systems","CS404","Computer Science",30,4,None,"TTH 8:00-10:00","OS concepts"),
    ]
    for c in courses:
        cursor.execute("INSERT IGNORE INTO courses (name,code,department,capacity,credits,prerequisite_id,time_slot,description) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)", c)

    # Prerequisites
    prereqs = [("CS201","CS101"),("CS301","CS201"),("CS302","CS101"),("CS401","CS201"),("CS402","CS201")]
    for course_code, prereq_code in prereqs:
        cursor.execute("SELECT id FROM courses WHERE code=%s", (prereq_code,))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE courses SET prerequisite_id=%s WHERE code=%s", (row[0], course_code))

    conn.commit()
    print("✓ Sample data inserted")
    print("\n" + "="*50)
    print("  DATABASE SETUP COMPLETE!")
    print("="*50)
    print("  Admin: admin@university.edu / admin123")
    print("="*50)
    cursor.close()
    conn.close()

except Exception as e:
    print(f"✗ Error: {e}")
    print("\nFix: Edit student-course-allocation/backend/.env")
    print("Set DB_PASSWORD=your_mysql_password")
    sys.exit(1)
