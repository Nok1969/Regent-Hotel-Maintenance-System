# REGENT CHA-AM HOTEL - คำแนะนำการติดตั้งแบบละเอียด

## ขั้นตอนที่ 1: สร้างโปรเจคใหม่ใน Replit

### 1.1 สร้าง Repl ใหม่
- ไปที่ Replit Dashboard
- คลิก "Create App" 
- ตั้งชื่อ: **"Regent-Cha-am-Hotel-Maintenance-System"**
- เลือก Template: "Node.js"
- คลิก "Create App"

### 1.2 สร้างฐานข้อมูลใหม่
- ในโปรเจคใหม่ ไปที่ Tools → Database
- เลือก PostgreSQL
- คลิก "Create Database"
- รอให้ระบบสร้าง DATABASE_URL ใหม่

## ขั้นตอนที่ 2: Copy ไฟล์จากโปรเจคเดิม

### 2.1 โครงสร้างไฟล์ที่ต้อง Copy
```
📁 Regent-Cha-am-Hotel-Maintenance-System/
├── 📁 client/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   ├── 📁 lib/
│   │   ├── 📁 locales/
│   │   ├── 📁 pages/
│   │   ├── index.css (⚠️ ใช้เวอร์ชันสีฟ้า)
│   │   └── main.tsx
│   └── index.html
├── 📁 server/
│   ├── 📁 middleware/
│   ├── 📁 routes/
│   ├── db.ts
│   ├── index.ts
│   ├── permissions.ts
│   ├── replitAuth.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── 📁 shared/
│   └── schema.ts (⚠️ ใช้เวอร์ชัน regent)
├── 📁 uploads/ (empty folder)
├── package.json (⚠️ ใช้เวอร์ชัน regent)
├── README.md (⚠️ ใช้เวอร์ชัน regent)
├── replit.md (⚠️ ใช้เวอร์ชัน regent)
├── components.json
├── drizzle.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### 2.2 วิธี Copy ไฟล์
1. เปิดโปรเจคเดิม (Vala Hotel) ในแท็บใหม่
2. เลือกไฟล์ทั้งหมด Ctrl+A
3. Copy Ctrl+C
4. กลับไปโปรเจคใหม่ (Regent Hotel)
5. Paste Ctrl+V
6. ยืนยันการ replace ไฟล์ทั้งหมด

## ขั้นตอนที่ 3: แทนที่ไฟล์สำคัญ

### 3.1 แทนที่ package.json
```json
{
  "name": "regent-cha-am-hotel-maintenance-system",
  "description": "Hotel maintenance management system for Regent Cha-am Beach Resort",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "keywords": ["hotel", "maintenance", "regent", "cha-am", "react", "express"],
  "author": "Regent Cha-am Beach Resort"
  // ... dependencies เหมือนเดิม
}
```

### 3.2 แทนที่ client/src/index.css
ใช้ไฟล์ `regent-blue-theme.css` ที่เตรียมไว้ (ธีมสีฟ้า #2563eb)

### 3.3 แทนที่ shared/schema.ts
ใช้เนื้อหาจากไฟล์ `shared/schema-regent.ts`

### 3.4 อัพเดท client/src/locales/

#### en.json (เฉพาะส่วนหลัก):
```json
{
  "app": {
    "title": "Regent Cha-am Hotel Maintenance System",
    "subtitle": "Hotel maintenance request system"
  },
  "auth": {
    "welcome": "Welcome to Regent Cha-am Hotel",
    "signIn": "Sign In",
    "signOut": "Logout"
  },
  "hotel": {
    "name": "Regent Cha-am Beach Resort",
    "location": "Cha-am, Thailand"
  }
}
```

#### th.json (เฉพาะส่วนหลัก):
```json
{
  "app": {
    "title": "ระบบแจ้งซ่อมโรงแรมรีเจนท์ ชะอำ",
    "subtitle": "ระบบแจ้งซ่อมสำหรับโรงแรม"
  },
  "auth": {
    "welcome": "ยินดีต้อนรับสู่โรงแรมรีเจนท์ ชะอำ",
    "signIn": "เข้าสู่ระบบ",
    "signOut": "ออกจากระบบ"
  },
  "hotel": {
    "name": "โรงแรมรีเจนท์ ชะอำ บีช รีสอร์ท",
    "location": "ชะอำ ประเทศไทย"
  }
}
```

### 3.5 อัพเดท Landing Page
แก้ไข `client/src/pages/Landing.tsx`:
- เปลี่ยนชื่อจาก "Vala Hua-Hin Nu Chapter Hotel" เป็น "Regent Cha-am Beach Resort"
- เปลี่ยนสีธีมเป็นสีฟ้า
- อัพเดทข้อความต้อนรับ

## ขั้นตอนที่ 4: ติดตั้ง Dependencies

### 4.1 ติดตั้งแพ็คเกจ
```bash
npm install
```

### 4.2 ตรวจสอบการติดตั้ง
```bash
npm list --depth=0
```

## ขั้นตอนที่ 5: ตั้งค่าฐานข้อมูล

### 5.1 รัน Setup Script
ใน Console ของ Replit:
```sql
-- สร้าง schema สำหรับ Regent Hotel
CREATE SCHEMA IF NOT EXISTS regent_hotel;

-- ตั้งค่า search_path
ALTER DATABASE postgres SET search_path TO regent_hotel, public;

-- สร้างตารางทั้งหมด (ใช้ script จาก setup-regent-schema.sql)
```

### 5.2 Push Schema ไปยังฐานข้อมูล
```bash
npm run db:push
```

### 5.3 ตรวจสอบตาราง
```sql
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'regent_hotel';
```

## ขั้นตอนที่ 6: ทดสอบระบบ

### 6.1 เริ่มต้น Development Server
```bash
npm run dev
```

### 6.2 ตรวจสอบฟังก์ชัน
- [ ] หน้า Landing แสดงชื่อ "Regent Cha-am Beach Resort"
- [ ] ธีมสีฟ้า (#2563eb) แสดงถูกต้อง
- [ ] ระบบ Login ทำงานได้
- [ ] Dashboard แสดงข้อมูลถูกต้อง
- [ ] สามารถสร้าง repair request ได้
- [ ] ระบบ notification ทำงานได้

## ขั้นตอนที่ 7: Deploy โปรเจค

### 7.1 เตรียมการ Deploy
```bash
npm run build
```

### 7.2 Deploy ผ่าน Replit
- ไปที่แท็บ "Deployments"
- คลิก "Deploy"
- รอให้ deployment เสร็จสิ้น

### 7.3 ตรวจสอบ URL ใหม่
URL จะเป็น: `regent-cha-am-hotel-maintenance-system-[username].replit.app`

## ขั้นตอนที่ 8: การตั้งค่าเพิ่มเติม

### 8.1 เพิ่มข้อมูลผู้ใช้เริ่มต้น
```sql
INSERT INTO regent_hotel.users (email, first_name, last_name, role, language) 
VALUES 
    ('admin@regent-chaام.com', 'Admin', 'Regent', 'admin', 'th'),
    ('manager@regent-chaام.com', 'Manager', 'Regent', 'manager', 'th'),
    ('staff@regent-chaasm.com', 'Staff', 'Regent', 'staff', 'th'),
    ('technician@regent-chaasm.com', 'Technician', 'Regent', 'technician', 'th');
```

### 8.2 ตั้งค่า Environment Variables (หากจำเป็น)
- `DATABASE_URL` (สร้างอัตโนมัติ)
- `NODE_ENV=production` (สำหรับ deployment)

## ผลลัพธ์สุดท้าย

### ✅ สำเร็จแล้ว:
- **Regent Cha-am Hotel** มี deployment ของตัวเองแล้ว
- **ฐานข้อมูลแยกสมบูรณ์** ไม่ปะปนกับ Vala Hotel
- **ธีมสีฟ้า** (#2563eb) สำหรับ Regent brand
- **URL แยกต่างหาก** สำหรับแต่ละโรงแรม
- **ข้อมูลผู้ใช้และการซ่อมแยกกัน**

### 🏨 ตอนนี้มี 2 ระบบแยกกัน:

**1. Vala Hua-Hin Nu Chapter Hotel**
- 🟠 สีส้ม (#e65100)
- 🌐 vala-hua-hin-nu-chapter-[username].replit.app

**2. Regent Cha-am Beach Resort** 
- 🔵 สีฟ้า (#2563eb)
- 🌐 regent-cha-am-hotel-maintenance-system-[username].replit.app

## การแก้ไขปัญหาที่อาจเกิดขึ้น

### ❌ Database Connection Error
```bash
# ตรวจสอบ DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run db:push
```

### ❌ Build Error
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Schema Error
```sql
-- Reset schema
DROP SCHEMA regent_hotel CASCADE;
-- Run setup script again
```

เมื่อทำตามขั้นตอนเหล่านี้เสร็จแล้ว คุณจะมีระบบจัดการการซ่อมโรงแรมสำหรับ Regent Cha-am Beach Resort ที่แยกออกจาก Vala Hotel สมบูรณ์แล้ว!