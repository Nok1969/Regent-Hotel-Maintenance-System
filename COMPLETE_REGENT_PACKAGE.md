# REGENT CHA-AM HOTEL - COMPLETE DEPLOYMENT PACKAGE

## สำหรับการสร้างโปรเจคใหม่แยกต่างหาก

### ขั้นตอนที่ 1: สร้าง Repl ใหม่
1. ไปที่ Replit Dashboard
2. คลิก "Create App"
3. ตั้งชื่อ: "Regent-Cha-am-Hotel-Maintenance-System"
4. เลือก Node.js

### ขั้นตอนที่ 2: สร้างฐานข้อมูลใหม่
1. ในโปรเจคใหม่ ไปที่ Tools → Database
2. เลือก PostgreSQL
3. คลิก Create Database

### ขั้นตอนที่ 3: Copy ไฟล์ทั้งหมด
Copy โครงสร้างเต็มรูปแบบจากโปรเจค Vala Hotel

### ขั้นตอนที่ 4: แก้ไขไฟล์สำคัญ

#### A. package.json:
```json
{
  "name": "regent-cha-am-hotel-maintenance-system",
  "description": "Maintenance management system for Regent Cha-am Hotel",
  "version": "1.0.0"
}
```

#### B. client/src/locales/en.json:
```json
{
  "app": {
    "title": "Regent Cha-am Hotel Maintenance System",
    "subtitle": "Hotel maintenance request system"
  }
}
```

#### C. client/src/locales/th.json:
```json
{
  "app": {
    "title": "ระบบแจ้งซ่อมโรงแรมรีเจนท์ ชะอำ",
    "subtitle": "ระบบแจ้งซ่อมสำหรับโรงแรม"
  }
}
```

#### D. client/src/index.css (เปลี่ยนเป็นธีมสีฟ้า):
```css
:root {
  --primary: hsl(219, 85%, 58%); /* Blue #2563eb */
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(220, 85%, 55%); /* #1d4ed8 */
  --accent: hsl(221, 83%, 53%); /* #1e40af */
  /* ... และสีอื่นๆ ตามธีมสีฟ้า */
}

body {
  background: #2563eb !important;
  background-image: linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af, #3b82f6, #60a5fa) !important;
}
```

#### E. client/src/pages/Landing.tsx:
เปลี่ยนชื่อโรงแรมจาก "Vala Hua-Hin Nu Chapter Hotel" เป็น "Regent Cha-am Hotel"

#### F. shared/schema.ts:
ใช้เนื้อหาจากไฟล์ `shared/schema-regent.ts` ที่สร้างไว้

#### G. server/db.ts:
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // ใช้ regent_hotel schema สำหรับ Regent Hotel
  options: '--search_path=regent_hotel,public'
});
export const db = drizzle({ client: pool, schema });
```

### ขั้นตอนที่ 5: ตั้งค่าฐานข้อมูล
รันใน Console ของโปรเจคใหม่:
```sql
-- สร้าง schema และตาราง
CREATE SCHEMA IF NOT EXISTS regent_hotel;

-- ตั้งค่า search_path
ALTER DATABASE postgres SET search_path TO regent_hotel, public;

-- สร้างตารางทั้งหมด (ใช้ script จาก setup-regent-schema.sql)
```

### ขั้นตอนที่ 6: ติดตั้งและทดสอบ
```bash
npm install
npm run dev
```

### ขั้นตอนที่ 7: Deploy โปรเจคใหม่
1. ไปที่แท็บ Deployments
2. คลิก Deploy
3. รอให้เสร็จ

## ผลลัพธ์สุดท้าย:

### โปรเจค 1: Vala Hua-Hin Nu Chapter Hotel
- URL: vala-hua-hin-nu-chapter-hotel-maintenance-system-[username].replit.app
- ธีม: สีส้ม (#e65100)
- ฐานข้อมูล: Schema vala_hotel
- ข้อมูล: แยกต่างหาก

### โปรเจค 2: Regent Cha-am Hotel
- URL: regent-cha-am-hotel-maintenance-system-[username].replit.app  
- ธีม: สีฟ้า (#2563eb)
- ฐานข้อมูล: ฐานข้อมูลใหม่ + Schema regent_hotel
- ข้อมูล: แยกต่างหาก

## ข้อดี:
✅ แยก deployment สมบูรณ์
✅ แยกฐานข้อมูลสมบูรณ์  
✅ แยก URL/domain
✅ แยกข้อมูลผู้ใช้และการซ่อม
✅ ธีมสีต่างกัน
✅ รันพร้อมกันได้
✅ อัพเดทแยกกันได้

## การบำรุงรักษา:
- อัพเดทโค้ดแยกกันได้
- Deploy แยกกันได้
- ข้อมูลไม่ปะปนกัน
- สามารถขยายเพิ่มโรงแรมอื่นได้ในอนาคต