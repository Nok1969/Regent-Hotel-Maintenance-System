# Database Separation Guide - สำหรับโรงแรม 2 แห่ง

## วิธีแยกฐานข้อมูลระหว่างโปรเจค

### วิธีที่ 1: ใช้ Database Schema แยกกัน (แนะนำ)

#### ในโปรเจคเดิม (Vala Hua-Hin Nu Chapter):
```sql
-- สร้าง schema สำหรับ Vala
CREATE SCHEMA IF NOT EXISTS vala_hotel;

-- ย้ายตารางไปยัง schema ใหม่
ALTER TABLE users SET SCHEMA vala_hotel;
ALTER TABLE repairs SET SCHEMA vala_hotel;
ALTER TABLE notifications SET SCHEMA vala_hotel;
```

#### ในโปรเจคใหม่ (Regent Cha-am):
```sql
-- สร้าง schema สำหรับ Regent
CREATE SCHEMA IF NOT EXISTS regent_hotel;

-- สร้างตารางใน schema ใหม่
CREATE TABLE regent_hotel.users (...);
CREATE TABLE regent_hotel.repairs (...);
CREATE TABLE regent_hotel.notifications (...);
```

### วิธีที่ 2: ใช้ Table Prefix

#### ปรับ shared/schema.ts:
```typescript
// สำหรับ Vala Hotel
export const users = pgTable("vala_users", {
  id: serial("id").primaryKey(),
  // ... fields อื่นๆ
});

export const repairs = pgTable("vala_repairs", {
  id: serial("id").primaryKey(),
  // ... fields อื่นๆ
});

// สำหรับ Regent Hotel (ในโปรเจคใหม่)
export const users = pgTable("regent_users", {
  id: serial("id").primaryKey(),
  // ... fields อื่นๆ
});

export const repairs = pgTable("regent_repairs", {
  id: serial("id").primaryKey(),
  // ... fields อื่นๆ
});
```

### วิธีที่ 3: ใช้ Hotel ID Field

#### เพิ่ม hotel_id ในทุกตาราง:
```typescript
export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  hotelId: varchar("hotel_id", { length: 50 }).notNull(),
  room: varchar("room", { length: 10 }).notNull(),
  // ... fields อื่นๆ
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  hotelId: varchar("hotel_id", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  // ... fields อื่นๆ
});
```

## การตั้งค่าโปรเจคใหม่

### 1. สร้างฐานข้อมูลใหม่ใน Replit
```bash
# ในโปรเจคใหม่ จะได้ DATABASE_URL ใหม่
```

### 2. อัพเดท Environment Variables
```
VALA_DATABASE_URL=postgres://... (ของเดิม)
REGENT_DATABASE_URL=postgres://... (ของใหม่)
```

### 3. ปรับ drizzle.config.ts
```typescript
// ในโปรเจคใหม่
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.REGENT_DATABASE_URL!,
  },
} satisfies Config;
```

### 4. ปรับ server/db.ts
```typescript
// ในโปรเจคใหม่
const connectionString = process.env.REGENT_DATABASE_URL || process.env.DATABASE_URL;
```

## ข้อดีของแต่ละวิธี:

### Schema Separation:
✅ แยกข้อมูลสมบูรณ์
✅ ความปลอดภัยสูง
✅ สามารถใช้ฐานข้อมูลเดียวกัน

### Table Prefix:
✅ ง่ายต่อการติดตั้ง
✅ เห็นความแตกต่างชัดเจน
✅ Query ง่าย

### Hotel ID Field:
✅ ยืดหยุ่นมาก
✅ ขยายได้ไม่จำกัด
✅ รองรับโรงแรมหลายแห่ง

## แนะนำ: ใช้วิธีที่ 1 (Schema Separation)
เพราะปลอดภัยและแยกข้อมูลได้ชัดเจนที่สุด