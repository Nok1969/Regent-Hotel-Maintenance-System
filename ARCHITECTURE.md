# โครงสร้างและการทำงานของ Hotel Maintenance System

## ภาพรวมของระบบ

Hotel Maintenance System เป็นระบบจัดการงานซ่อมบำรุงของโรงแรมที่สร้างด้วย React + Express + PostgreSQL มีการรองรับภาษาไทย-อังกฤษ และระบบสิทธิ์ 4 ระดับ

## โครงสร้างโปรเจกต์

```
hotel-maintenance-system/
├── client/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/        # UI Components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── RepairForm.tsx    # ฟอร์มสร้างงานซ่อม
│   │   │   ├── RepairTable.tsx   # ตารางแสดงงานซ่อม
│   │   │   ├── Sidebar.tsx       # เมนูด้านข้าง
│   │   │   └── DashboardCharts.tsx # กราฟแสดงสถิติ
│   │   ├── pages/            # หน้าต่างๆ
│   │   │   ├── Dashboard.tsx     # หน้าแรก
│   │   │   ├── Repairs.tsx       # รายการงานซ่อม
│   │   │   ├── NewRepair.tsx     # สร้างงานซ่อมใหม่
│   │   │   ├── Users.tsx         # จัดการผู้ใช้
│   │   │   ├── Landing.tsx       # หน้าต้อนรับ
│   │   │   └── Login.tsx         # หน้าเข้าสู่ระบบ
│   │   ├── hooks/            # React Hooks
│   │   │   ├── useAuth.ts        # ตรวจสอบสิทธิ์
│   │   │   ├── useLanguage.ts    # เปลี่ยนภาษา
│   │   │   └── useTheme.ts       # เปลี่ยนธีม
│   │   ├── lib/              # ฟังก์ชันช่วย
│   │   │   ├── queryClient.ts    # TanStack Query setup
│   │   │   └── authUtils.ts      # ฟังก์ชันตรวจสอบ auth
│   │   └── locales/          # ไฟล์แปลภาษา
│   └── index.html
├── server/                    # Backend (Express + TypeScript)
│   ├── index.ts              # Entry point
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # Database operations
│   ├── db.ts                 # Database connection
│   ├── permissions.ts        # ระบบสิทธิ์
│   └── replitAuth.ts         # Authentication setup
├── shared/                    # ไฟล์ใช้ร่วม
│   └── schema.ts             # Database schema + Types
└── uploads/                   # โฟลเดอร์เก็บรูปภาพ
```

## สถาปัตยกรรมระบบ

### Frontend Architecture

**React 18 + TypeScript**
- **Build Tool**: Vite (hot reload, fast build)
- **UI Framework**: Radix UI + shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (server state) + React hooks (local state)
- **Routing**: Wouter (lightweight routing)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js สำหรับแสดงกราฟ
- **i18n**: react-i18next สำหรับรองรับภาษาไทย-อังกฤษ

### Backend Architecture

**Express.js + TypeScript**
- **Authentication**: Replit Auth (OAuth) + in-memory sessions
- **Database**: PostgreSQL with Drizzle ORM
- **File Upload**: Multer สำหรับอัพโหลดรูปภาพ
- **API Design**: RESTful endpoints with proper error handling
- **Security**: Role-based permissions, input validation

### Database Design

```sql
-- ตาราง users (ข้อมูลผู้ใช้)
users {
  id: varchar (primary key)
  email: varchar
  firstName: varchar
  lastName: varchar
  profileImageUrl: varchar
  role: varchar (admin|manager|staff|technician)
  language: varchar (en|th)
  createdAt: timestamp
  updatedAt: timestamp
}

-- ตาราง repairs (ข้อมูลงานซ่อม)
repairs {
  id: serial (primary key)
  title: varchar
  description: text
  location: varchar
  category: varchar (electrical|plumbing|hvac|furniture|other)
  urgency: varchar (low|medium|high)
  status: varchar (pending|in_progress|completed)
  images: varchar[] (array of image paths)
  userId: varchar (foreign key → users.id)
  createdAt: timestamp
  updatedAt: timestamp
}

-- ตาราง sessions (เก็บ session data)
sessions {
  sid: varchar (primary key)
  sess: jsonb
  expire: timestamp
}
```

## การทำงานของระบบ

### 1. Authentication Flow

```
1. ผู้ใช้เข้าเว็บไซต์ → หน้า Landing Page
2. กดปุ่ม "เข้าสู่ระบบ" → หน้า Login
3. ใส่ username/password → POST /api/auth/mock-login
4. ระบบตรวจสอบข้อมูล → เก็บ currentUser ใน memory
5. ส่ง response กลับ → redirect ไปหน้า Dashboard
6. ทุก request ใช้ GET /api/auth/user เพื่อตรวจสอบสถานะ
```

### 2. Role-Based Access Control

**Admin (ผู้ดูแลระบบ)**
- เข้าถึงได้ทุกหน้า
- จัดการผู้ใช้ (เพิ่ม/ลบ/เปลี่ยนสิทธิ์)
- ดู/สร้าง/แก้ไข/ลบงานซ่อม
- ดูสถิติและรายงาน

**Manager (ผู้จัดการ)**  
- เข้าถึงได้เกือบทุกหน้า ยกเว้นการเพิ่มผู้ใช้ใหม่
- ดู/สร้าง/แก้ไข/ลบงานซ่อม
- ดูสถิติและรายงาน

**Staff (พนักงาน)**
- ดูรายการงานซ่อม
- สร้างงานซ่อมใหม่
- ไม่สามารถเปลี่ยนสถานะงานได้

**Technician (ช่างซ่อม)**
- ดูรายการงานซ่อม
- รับงานและเปลี่ยนสถานะงาน
- สร้างงานซ่อมใหม่

### 3. API Endpoints

```
Authentication:
POST /api/auth/mock-login    # เข้าสู่ระบบ
GET  /api/auth/user          # ตรวจสอบสถานะผู้ใช้
POST /api/auth/logout        # ออกจากระบบ

Repairs Management:
GET    /api/repairs          # ดูรายการงานซ่อม (with filters)
POST   /api/repairs          # สร้างงานซ่อมใหม่
GET    /api/repairs/:id      # ดูงานซ่อมตาม ID
PATCH  /api/repairs/:id      # อัพเดทงานซ่อม
DELETE /api/repairs/:id      # ลบงานซ่อม

Statistics:
GET /api/stats               # ดูสถิติรวม

User Management:
GET   /api/users             # ดูรายชื่อผู้ใช้ (Admin/Manager)
PATCH /api/users/:id/role    # เปลี่ยนสิทธิ์ผู้ใช้ (Admin only)

File Upload:
POST /api/upload             # อัพโหลดรูปภาพ
```

### 4. Data Flow

**การสร้างงานซ่อมใหม่:**
```
1. ผู้ใช้กรอกฟอร์ม → validation ด้วย Zod
2. อัพโหลดรูปภาพ → POST /api/upload
3. ส่งข้อมูลงานซ่อม → POST /api/repairs
4. เก็บข้อมูลใน database → ส่ง response กลับ
5. Frontend update cache → แสดงข้อมูลใหม่
```

**การอัพเดทสถานะงาน:**
```
1. ตรวจสอบสิทธิ์ผู้ใช้ → canUpdateStatus()
2. ส่ง request → PATCH /api/repairs/:id
3. ตรวจสอบสิทธิ์ใน backend → customAuth middleware
4. อัพเดท database → ส่ง response กลับ
5. Update cache → แสดงสถานะใหม่
```

### 5. Security Measures

- **Input Validation**: Zod schemas สำหรับ validate ข้อมูล
- **Role-based Authorization**: ตรวจสอบสิทธิ์ทั้งใน frontend และ backend
- **File Upload Security**: จำกัดประเภทและขนาดไฟล์
- **SQL Injection Prevention**: ใช้ Drizzle ORM แทน raw SQL
- **Session Management**: เก็บ session ใน memory (development), PostgreSQL (production)

### 6. Internationalization (i18n)

- รองรับภาษาไทยและอังกฤษ
- ใช้ react-i18next สำหรับจัดการ
- เก็บภาษาที่เลือกใน localStorage
- แปลทุก UI text รวมถึง error messages

### 7. Development vs Production

**Development:**
- Vite dev server พร้อม hot reload
- In-memory authentication
- Mock data สำหรับทดสอบ
- Error overlay และ detailed logging

**Production:**
- Static build ด้วย Vite
- PostgreSQL session storage  
- Replit Auth integration
- Optimized bundles และ caching

## การติดตั้งและใช้งาน

1. Clone repository
2. ติดตั้ง dependencies: `npm install`
3. Setup PostgreSQL database
4. รัน development server: `npm run dev`
5. เข้าสู่ระบบด้วย mock authentication system

ระบบจะทำงานบน port 5000 และรองรับการใช้งานผ่าน web browser ทุกแพลตฟอร์ม