USE course_allocation;

-- Admin user (password: admin123)
INSERT INTO students (name, email, password_hash, department, role) VALUES
('Admin User', 'admin@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEg7dO', 'Administration', 'admin');

-- Sample courses
INSERT INTO courses (name, code, department, capacity, credits, time_slot, description) VALUES
('Introduction to Programming', 'CS101', 'Computer Science', 50, 3, 'MWF 9:00-10:00', 'Fundamentals of programming using Python'),
('Data Structures', 'CS201', 'Computer Science', 40, 4, 'TTH 10:00-12:00', 'Arrays, linked lists, trees, graphs'),
('Database Systems', 'CS301', 'Computer Science', 35, 3, 'MWF 11:00-12:00', 'Relational databases and SQL'),
('Web Development', 'CS302', 'Computer Science', 30, 3, 'TTH 14:00-16:00', 'Full-stack web development'),
('Machine Learning', 'CS401', 'Computer Science', 25, 4, 'MWF 14:00-15:30', 'ML algorithms and applications'),
('Software Engineering', 'CS402', 'Computer Science', 30, 3, 'TTH 16:00-18:00', 'Software development lifecycle'),
('Computer Networks', 'CS403', 'Computer Science', 35, 3, 'MWF 8:00-9:00', 'Network protocols and architecture'),
('Operating Systems', 'CS404', 'Computer Science', 30, 4, 'TTH 8:00-10:00', 'OS concepts and system programming');

-- Set prerequisites
UPDATE courses SET prerequisite_id = (SELECT id FROM (SELECT id FROM courses WHERE code='CS101') t) WHERE code='CS201';
UPDATE courses SET prerequisite_id = (SELECT id FROM (SELECT id FROM courses WHERE code='CS201') t) WHERE code='CS301';
UPDATE courses SET prerequisite_id = (SELECT id FROM (SELECT id FROM courses WHERE code='CS101') t) WHERE code='CS302';
UPDATE courses SET prerequisite_id = (SELECT id FROM (SELECT id FROM courses WHERE code='CS201') t) WHERE code='CS401';
UPDATE courses SET prerequisite_id = (SELECT id FROM (SELECT id FROM courses WHERE code='CS201') t) WHERE code='CS402';
