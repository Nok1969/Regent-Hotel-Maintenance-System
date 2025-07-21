-- Setup Database Schema for Vala Hua-Hin Nu Chapter Hotel
-- รันคำสั่งนี้ในฐานข้อมูลปัจจุบัน

-- 1. สร้าง schema สำหรับ Vala Hotel
CREATE SCHEMA IF NOT EXISTS vala_hotel;

-- 2. ย้ายตารางที่มีอยู่ไปยัง vala_hotel schema
-- (ถ้ามีตารางอยู่แล้ว)
DO $$
BEGIN
    -- ตรวจสอบว่ามีตาราง users ใน public schema หรือไม่
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE public.users SET SCHEMA vala_hotel;
    END IF;
    
    -- ตรวจสอบว่ามีตาราง repairs ใน public schema หรือไม่
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'repairs') THEN
        ALTER TABLE public.repairs SET SCHEMA vala_hotel;
    END IF;
    
    -- ตรวจสอบว่ามีตาราง notifications ใน public schema หรือไม่
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        ALTER TABLE public.notifications SET SCHEMA vala_hotel;
    END IF;
    
    -- ตรวจสอบว่ามีตาราง user_sessions ใน public schema หรือไม่
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
        ALTER TABLE public.user_sessions SET SCHEMA vala_hotel;
    END IF;
END $$;

-- 3. อัพเดท search_path เพื่อใช้ vala_hotel เป็นหลัก
ALTER DATABASE postgres SET search_path TO vala_hotel, public;

-- 4. ตรวจสอบตารางใน vala_hotel schema
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'vala_hotel'
ORDER BY tablename;

-- 5. Grant permissions
GRANT USAGE ON SCHEMA vala_hotel TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA vala_hotel TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA vala_hotel TO PUBLIC;

-- 6. สำหรับการสร้างตารางใหม่ในอนาคต
ALTER DEFAULT PRIVILEGES IN SCHEMA vala_hotel 
GRANT ALL PRIVILEGES ON TABLES TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA vala_hotel 
GRANT ALL PRIVILEGES ON SEQUENCES TO PUBLIC;

-- 7. แสดงข้อมูลสำเร็จ
SELECT 'Vala Hotel schema setup completed successfully!' as status;