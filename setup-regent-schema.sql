-- Setup Database Schema for Regent Cha-am Hotel
-- รันคำสั่งนี้ในฐานข้อมูลของโปรเจคใหม่

-- 1. สร้าง schema สำหรับ Regent Hotel
CREATE SCHEMA IF NOT EXISTS regent_hotel;

-- 2. ตั้งค่า search_path ให้ใช้ regent_hotel เป็นหลัก
ALTER DATABASE postgres SET search_path TO regent_hotel, public;

-- 3. สร้างตาราง users ใน regent_hotel schema
CREATE TABLE IF NOT EXISTS regent_hotel.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'technician')),
    language VARCHAR(2) DEFAULT 'th' CHECK (language IN ('en', 'th')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. สร้างตาราง repairs ใน regent_hotel schema
CREATE TABLE IF NOT EXISTS regent_hotel.repairs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES regent_hotel.users(id),
    room VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('electrical', 'plumbing', 'airconditioning', 'furniture', 'other')),
    urgency VARCHAR(10) NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'completed')),
    technician_id INTEGER REFERENCES regent_hotel.users(id),
    images TEXT[],
    notes TEXT,
    estimated_completion TIMESTAMP,
    actual_completion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. สร้างตาราง notifications ใน regent_hotel schema
CREATE TABLE IF NOT EXISTS regent_hotel.notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. สร้างตาราง user_sessions ใน regent_hotel schema (สำหรับ session management)
CREATE TABLE IF NOT EXISTS regent_hotel.user_sessions (
    sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- 7. สร้าง indexes สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_regent_repairs_user_id ON regent_hotel.repairs(user_id);
CREATE INDEX IF NOT EXISTS idx_regent_repairs_status ON regent_hotel.repairs(status);
CREATE INDEX IF NOT EXISTS idx_regent_repairs_category ON regent_hotel.repairs(category);
CREATE INDEX IF NOT EXISTS idx_regent_repairs_created_at ON regent_hotel.repairs(created_at);
CREATE INDEX IF NOT EXISTS idx_regent_notifications_user_id ON regent_hotel.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_regent_notifications_read ON regent_hotel.notifications(read);
CREATE INDEX IF NOT EXISTS idx_regent_sessions_expire ON regent_hotel.user_sessions(expire);

-- 8. Grant permissions
GRANT USAGE ON SCHEMA regent_hotel TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA regent_hotel TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA regent_hotel TO PUBLIC;

-- 9. สำหรับการสร้างตารางใหม่ในอนาคต
ALTER DEFAULT PRIVILEGES IN SCHEMA regent_hotel 
GRANT ALL PRIVILEGES ON TABLES TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA regent_hotel 
GRANT ALL PRIVILEGES ON SEQUENCES TO PUBLIC;

-- 10. เพิ่มข้อมูลผู้ใช้เริ่มต้นสำหรับ Regent Hotel
INSERT INTO regent_hotel.users (email, password, first_name, last_name, role, language) 
VALUES 
    ('admin@regent-chaам.com', '$2b$10$example_hash', 'Admin', 'Regent', 'admin', 'th'),
    ('manager@regent-chaام.com', '$2b$10$example_hash', 'Manager', 'Regent', 'manager', 'th'),
    ('staff@regent-chaام.com', '$2b$10$example_hash', 'Staff', 'Regent', 'staff', 'th'),
    ('technician@regent-chaام.com', '$2b$10$example_hash', 'Technician', 'Regent', 'technician', 'th')
ON CONFLICT (email) DO NOTHING;

-- 11. เพิ่มข้อมูลตัวอย่างการซ่อม
INSERT INTO regent_hotel.repairs (user_id, room, category, urgency, description, status)
VALUES 
    (1, '101', 'electrical', 'high', 'ไฟในห้องน้ำไม่ติด', 'pending'),
    (2, '205', 'plumbing', 'medium', 'ก๊อกน้ำหยด', 'inProgress'),
    (3, '312', 'airconditioning', 'low', 'แอร์เย็นไม่เพียงพอ', 'completed')
ON CONFLICT DO NOTHING;

-- 12. แสดงข้อมูลสำเร็จ
SELECT 'Regent Hotel schema setup completed successfully!' as status;
SELECT 'Tables created: ' || count(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'regent_hotel';