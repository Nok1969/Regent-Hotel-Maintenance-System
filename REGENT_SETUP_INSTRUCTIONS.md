# Regent Cha-am Hotel - Setup Instructions

## การสร้างโปรเจคใหม่

### ขั้นตอนที่ 1: สร้าง Repl ใหม่
1. ไปที่ Replit Dashboard
2. คลิก "Create App"
3. เลือก "Node.js"
4. ตั้งชื่อ: **"Regent-Cha-am-Hotel-Maintenance-System"**

### ขั้นตอนที่ 2: Copy ไฟล์จากโปรเจคเดิม
Copy ไฟล์ทั้งหมดจากโปรเจค Vala-Hua-Hin ไปยังโปรเจคใหม่:

```bash
# ไฟล์และโฟลเดอร์ที่ต้อง copy:
├── client/
├── server/
├── shared/
├── uploads/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json
├── drizzle.config.ts
└── ไฟล์อื่นๆ
```

### ขั้นตอนที่ 3: อัพเดทไฟล์การแปลภาษา

#### แทนที่ไฟล์ en.json:
ใช้เนื้อหาจากไฟล์ `en-regent.json` ที่สร้างไว้

#### แทนที่ไฟล์ th.json:
ใช้เนื้อหาจากไฟล์ `th-regent.json` ที่สร้างไว้

### ขั้นตอนที่ 4: เปลี่ยนธีมสี

#### อัพเดท `client/src/index.css`:
แทนที่ส่วน `:root` และ `.dark` ด้วยเนื้อหาจากไฟล์ `regent-blue-theme.css`

### ขั้นตอนที่ 5: อัพเดทไฟล์ package.json
```json
{
  "name": "regent-cha-am-hotel-maintenance-system",
  "description": "Maintenance management system for Regent Cha-am Hotel",
  "version": "1.0.0"
}
```

### ขั้นตอนที่ 6: อัพเดทไฟล์หลัก

#### Landing.tsx:
- เปลี่ยน "Vala Hua-Hin Nu Chapter Hotel" เป็น "Regent Cha-am Hotel"
- อัพเดทคำบรรยาย

#### HotelLogo.tsx:
- เปลี่ยนข้อความในโลโก้
- เปลี่ยนสีจากส้มเป็นฟ้า

### ขั้นตอนที่ 7: ติดตั้งและทดสอบ
```bash
npm install
npm run dev
```

### ขั้นตอนที่ 8: Deploy
1. ไปที่แท็บ "Deployments"  
2. คลิก "Deploy"
3. ตรวจสอบโดเมนใหม่: `regent-cha-am-hotel-maintenance-system-[username].replit.app`

## ผลลัพธ์ที่คาดหวัง:
- ✅ ระบบใช้ธีมสีฟ้าแทนสีส้ม
- ✅ ชื่อโรงแรมเปลี่ยนเป็น "Regent Cha-am Hotel" ทุกที่
- ✅ โดเมนใหม่ที่ถูกต้อง
- ✅ การแปลภาษาไทยและอังกฤษที่เหมาะสม
- ✅ ฟังก์ชันการทำงานเหมือนเดิมทุกอย่าง

## หมายเหตุ:
- ข้อมูลในฐานข้อมูลจะแยกออกจากโปรเจคเดิม
- สามารถสร้างข้อมูลตัวอย่างใหม่ได้ด้วย `add-sample-data.sql`
- ระบบ authentication ใช้วิธีเดียวกันกับโปรเจคเดิม