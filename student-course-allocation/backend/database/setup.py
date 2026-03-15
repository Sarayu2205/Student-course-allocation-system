"""Run this once to create the database, tables, and seed data."""
import mysql.connector
from getpass import getpass
import bcrypt

print("=" * 55)
print("  STUDENT COURSE ALLOCATION - DATABASE SETUP")
print("=" * 55)
print("\nPress ENTER to accept defaults shown in (brackets)\n")

host = input("MySQL Host (localhost): ").strip() or "localhost"
user = input("MySQL User (root): ").strip() or "root"
password = getpass("MySQL Password: ")

try:
    conn = mysql.connector.connect(host=host, user=user, password=password)
    cursor = conn.cursor()
    print("\n✓ Connected to MySQL")

    # Create DB and tables
    statements = open("schema.sql").read().split(";")
    for s in statements:
        s = s.strip()
        if s:
            cursor.execute(s)
    conn.commit()
    print("✓ Database and tables created")

    # Update .env with password
    with open("../.env", "w") as f:
        f.write(f"DB_HOST={host}\nDB_USER={user}\nDB_PASSWORD={password}\nDB_NAME=course_allocation\nJWT_SECRET_KEY=super-secret-jwt-key-2024\n")
    print("✓ .env file updated")

    # Seed admin user
    cursor.execute("USE course_allocation")
    admin_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    cursor.execute("""
        INSERT IGNORE INTO students (name, email, password_hash, department, role)
        VALUES (%s, %s, %s, %s, %s)
    """, ("Admin User", "admin@university.edu", admin_hash, "Administration", "admin"))

    # Seed courses
    courses = [
        ("Introduction to Programming", "CS101", "Computer Science", 50, 3, None, "MWF 9:00-10:00", "Fundamentals of programming"),
        ("Data Structures", "CS201", "Computer Science", 40, 4, None, "TTH 10:00-12:00", "Arrays, trees, graphs"),
        ("Database Systems", "CS301", "Computer Science", 35, 3, None, "MWF 11:00-12:00", "Relational databases and SQL"),
        ("Web Development", "CS302", "Computer Science", 30, 3, None, "TTH 14:00-16:00", "Full-stack web development"),
        ("Machine Learning", "CS401", "Computer Science", 25, 4, None, "MWF 14:00-15:30", "ML algorithms and applications"),
        ("Software Engineering", "CS402", "Computer Science", 30, 3, None, "TTH 16:00-18:00", "Software development lifecycle"),
        ("Computer Networks", "CS403", "Computer Science", 35, 3, None, "MWF 8:00-9:00", "Network protocols"),
        ("Operating Systems", "CS404", "Computer Science", 30, 4, None, "TTH 8:00-10:00", "OS concepts"),
    ]
    for c in courses:
        cursor.execute("""
            INSERT IGNORE INTO courses (name, code, department, capacity, credits, prerequisite_id, time_slot, description)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, c)

    # Set prerequisites
    prereqs = [("CS201", "CS101"), ("CS301", "CS201"), ("CS302", "CS101"),
               ("CS401", "CS201"), ("CS402", "CS201")]
    for course_code, prereq_code in prereqs:
        cursor.execute("SELECT id FROM courses WHERE code=%s", (prereq_code,))
        prereq = cursor.fetchone()
        if prereq:
            cursor.execute("UPDATE courses SET prerequisite_id=%s WHERE code=%s", (prereq[0], course_code))

    conn.commit()
    print("✓ Sample data inserted")
    print("\n" + "=" * 55)
    print("  SETUP COMPLETE!")
    print("=" * 55)
    print("\n  Admin Login:")
    print("  Email   : admin@university.edu")
    print("  Password: admin123")
    print("\n  Now run: python app.py")
    print("=" * 55)

except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nMake sure MySQL is running and credentials are correct")
finally:
    try:
        cursor.close()
        conn.close()
    except:
        pass
