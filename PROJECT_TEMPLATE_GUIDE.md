# PROJECT TEMPLATE GUIDE - แผนการสร้างโปรเจคโรงแรมใหม่

## 🏗️ โครงสร้างระบบแยก Deployment

### สถานการณ์ปัจจุบัน:
1. **Vala Hua-Hin Nu Chapter Hotel** - โปรเจคเดิม (สีส้ม)
2. **Regent Cha-am Beach Resort** - โปรเจคใหม่ (สีฟ้า)

### ข้อดีของการแยก Deployment:
✅ **ข้อมูลแยกสมบูรณ์** - ไม่มีการปะปนข้อมูลระหว่างโรงแรม
✅ **ปรับแต่งแยกกันได้** - ธีมสี, ฟีเจอร์, และการตั้งค่าเฉพาะโรงแรม
✅ **อัพเดทแยกกัน** - สามารถพัฒนาและ deploy แยกกันได้
✅ **ความปลอดภัย** - แต่ละโรงแรมเข้าถึงได้เฉพาะข้อมูลของตัวเอง
✅ **การขยายตัว** - เพิ่มโรงแรมใหม่ได้ง่าย

## 📋 Template สำหรับโรงแรมใหม่

### ขั้นตอนการสร้างโปรเจคใหม่:

#### 1. สร้าง Repl ใหม่
```
ชื่อ: [Hotel-Name]-Maintenance-System
Template: Node.js
```

#### 2. Copy Base Files
- Copy ไฟล์ทั้งหมดจากโปรเจค Vala Hotel
- เก็บโครงสร้างและฟังก์ชันหลักไว้

#### 3. Customize Hotel Information

##### package.json:
```json
{
  "name": "[hotel-name]-maintenance-system",
  "description": "Hotel maintenance management system for [Hotel Full Name]",
  "author": "[Hotel Full Name]",
  "keywords": ["hotel", "maintenance", "[hotel-name]", "react", "express"]
}
```

##### Translations (en.json & th.json):
```json
{
  "app": {
    "title": "[Hotel Name] Maintenance System",
    "subtitle": "Hotel maintenance request system"
  },
  "hotel": {
    "name": "[Hotel Full Name]",
    "location": "[City, Country]"
  }
}
```

#### 4. Theme Customization

##### Color Themes:
```css
/* Hotel A - Orange Theme */
--primary: hsl(22, 82%, 39%); /* #e65100 */

/* Hotel B - Blue Theme */
--primary: hsl(219, 85%, 58%); /* #2563eb */

/* Hotel C - Green Theme */
--primary: hsl(142, 76%, 36%); /* #16a34a */

/* Hotel D - Purple Theme */
--primary: hsl(262, 83%, 58%); /* #7c3aed */
```

#### 5. Database Schema
```typescript
// แต่ละโรงแรมใช้ schema แยกกัน
export const users = pgTable("users", {
  // ... fields เหมือนกัน
});

// หรือใช้ hotel_id field
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  hotelId: varchar("hotel_id", { length: 50 }).notNull(),
  // ... fields อื่นๆ
});
```

## 🎨 Theme Templates

### 1. Orange Theme (Vala Hotel)
```css
:root {
  --primary: hsl(22, 82%, 39%); /* #e65100 */
  --secondary: hsl(24, 82%, 35%); /* #d84315 */
  --accent: hsl(20, 82%, 43%); /* #f57c00 */
}

body {
  background: linear-gradient(135deg, #e65100, #d84315, #f57c00, #ff8a50, #ffab40);
}
```

### 2. Blue Theme (Regent Hotel)
```css
:root {
  --primary: hsl(219, 85%, 58%); /* #2563eb */
  --secondary: hsl(220, 85%, 55%); /* #1d4ed8 */
  --accent: hsl(221, 83%, 53%); /* #1e40af */
}

body {
  background: linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af, #3b82f6, #60a5fa);
}
```

### 3. Green Theme (Template)
```css
:root {
  --primary: hsl(142, 76%, 36%); /* #16a34a */
  --secondary: hsl(140, 84%, 33%); /* #15803d */
  --accent: hsl(145, 63%, 42%); /* #22c55e */
}

body {
  background: linear-gradient(135deg, #16a34a, #15803d, #22c55e, #4ade80, #86efac);
}
```

### 4. Purple Theme (Template)
```css
:root {
  --primary: hsl(262, 83%, 58%); /* #7c3aed */
  --secondary: hsl(263, 70%, 50%); /* #7c2d12 */
  --accent: hsl(258, 90%, 66%); /* #a855f7 */
}

body {
  background: linear-gradient(135deg, #7c3aed, #6d28d9, #a855f7, #c084fc, #d8b4fe);
}
```

## 📊 Database Strategy Options

### Option 1: Schema Separation (แนะนำ)
```sql
-- แต่ละโรงแรมใช้ schema แยกกัน
CREATE SCHEMA vala_hotel;
CREATE SCHEMA regent_hotel;
CREATE SCHEMA [new_hotel]_hotel;

-- ข้อดี: แยกข้อมูลสมบูรณ์, ปลอดภัย
-- ข้อเสีย: ต้องสร้าง database connection แยก
```

### Option 2: Database Separation (ที่ใช้อยู่)
```sql
-- แต่ละโรงแรมใช้ฐานข้อมูลแยกกัน
Hotel A: DATABASE_URL_A
Hotel B: DATABASE_URL_B
Hotel C: DATABASE_URL_C

-- ข้อดี: แยกสมบูรณ์, deploy แยกกัน
-- ข้อเสีย: ค่าใช้จ่ายเพิ่มขึ้น
```

### Option 3: Hotel ID Field
```typescript
// เพิ่ม hotelId ในทุกตาราง
export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  hotelId: varchar("hotel_id", { length: 50 }).notNull(),
  // ... fields อื่นๆ
});

// ข้อดี: ใช้ฐานข้อมูลเดียว, ประหยัด
// ข้อเสีย: ต้องระวังการ query ข้ามโรงแรม
```

## 🚀 Deployment Strategy

### Current Setup (Database Separation):
```
Vala Hotel → vala-hua-hin-nu-chapter-[user].replit.app
Regent Hotel → regent-cha-am-hotel-[user].replit.app
Hotel C → [hotel-c]-maintenance-[user].replit.app
```

### Future Scaling Options:

#### 1. Multi-tenant Single Deployment
```
hotels-management-system-[user].replit.app
├── /vala (Vala Hotel)
├── /regent (Regent Hotel)  
└── /hotel-c (Hotel C)
```

#### 2. Microservices Architecture
```
auth-service-[user].replit.app
hotels-api-[user].replit.app
vala-frontend-[user].replit.app
regent-frontend-[user].replit.app
```

## 📝 Checklist สำหรับโรงแรมใหม่

### ✅ Setup Checklist:
- [ ] สร้าง Repl ใหม่
- [ ] Copy base files
- [ ] แก้ไข package.json
- [ ] อัพเดท translations (en.json, th.json)
- [ ] ปรับ theme colors
- [ ] ตั้งค่าฐานข้อมูลใหม่
- [ ] รัน database setup script
- [ ] ทดสอบระบบทั้งหมด
- [ ] Deploy และตรวจสอบ URL

### ✅ Customization Checklist:
- [ ] ชื่อโรงแรม
- [ ] ที่อยู่โรงแรม
- [ ] ธีมสี (primary, secondary, accent)
- [ ] Logo และ branding
- [ ] การตั้งค่าภาษา
- [ ] ข้อมูลผู้ใช้เริ่มต้น
- [ ] การตั้งค่าเฉพาะโรงแรม

## 🔄 Maintenance Strategy

### การอัพเดทระบบ:
1. **Core Features** - อัพเดทใน base template
2. **Hotel-specific Features** - อัพเดทในแต่ละโปรเจค
3. **Security Updates** - อัพเดททุกโปรเจคพร้อมกัน

### การ Backup:
- แต่ละโรงแรมมี database backup แยกกัน
- Source code backup ผ่าน Git
- Environment variables backup

ระบบนี้รองรับการขยายตัวและเพิ่มโรงแรมใหม่ได้อย่างมีประสิทธิภาพ!