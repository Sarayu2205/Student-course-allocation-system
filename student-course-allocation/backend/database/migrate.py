"""Run this to apply any missing DB migrations."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database.db import run

run("""
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('allocated','waitlist','rejected','info') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
)
""")
print("Migration complete — notifications table ready.")
