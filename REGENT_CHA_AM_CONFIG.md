# REGENT CHA-AM HOTEL - CONFIG FILES

## ไฟล์ configuration สำหรับโปรเจคใหม่

### 1. package.json
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
  "author": "Regent Cha-am Beach Resort",
  "license": "ISC",
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@jridgewell/trace-mapping": "^0.3.20",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@replit/vite-plugin-cartographer": "^1.0.2",
    "@replit/vite-plugin-runtime-error-modal": "^1.0.1",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/vite": "^4.0.0-alpha.3",
    "@tanstack/react-query": "^5.17.1",
    "@types/bcrypt": "^5.0.2",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/memoizee": "^0.4.11",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.6",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "bcrypt": "^5.1.1",
    "chart.js": "^4.4.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "connect-pg-simple": "^9.0.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "date-fns": "^3.0.6",
    "drizzle-kit": "^0.20.7",
    "drizzle-orm": "^0.29.2",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.0.0",
    "esbuild": "^0.19.11",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.17.3",
    "express-validator": "^7.0.1",
    "framer-motion": "^10.18.0",
    "helmet": "^7.1.0",
    "i18next": "^23.7.16",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.306.0",
    "memoizee": "^0.4.15",
    "memorystore": "^1.6.7",
    "multer": "^1.4.5-lts.1",
    "next-themes": "^0.2.1",
    "openid-client": "^5.6.4",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "postcss": "^8.4.32",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-i18next": "^14.0.0",
    "react-icons": "^4.12.0",
    "react-resizable-panels": "^0.0.55",
    "react-window": "^1.8.8",
    "react-window-infinite-loader": "^1.0.9",
    "recharts": "^2.10.3",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.6.2",
    "tw-animate-css": "^2.0.5",
    "typescript": "^5.3.3",
    "vaul": "^0.8.0",
    "vite": "^5.0.10",
    "wouter": "^3.0.0",
    "ws": "^8.16.0",
    "zod": "^3.22.4",
    "zod-validation-error": "^2.1.0"
  }
}
```

### 2. README.md
```markdown
# Regent Cha-am Beach Resort - Maintenance Management System

ระบบจัดการการแจ้งซ่อมสำหรับโรงแรมรีเจนท์ ชะอำ บีช รีสอร์ท

## Features
- 🏨 Hotel maintenance request management
- 👥 Role-based user access control  
- 📊 Real-time dashboard and analytics
- 🔧 Technician assignment and tracking
- 📱 Responsive mobile-friendly design
- 🌏 Multi-language support (Thai/English)
- 🔵 Regent brand blue theme

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: Radix UI + Tailwind CSS
- **State**: TanStack Query
- **Auth**: Replit Auth

## Quick Start
1. Clone this repository
2. Install dependencies: `npm install`
3. Set up database: `npm run db:push`
4. Start development: `npm run dev`
5. Open: http://localhost:5000

## Deployment
This project is designed for Replit deployment:
1. Create new Repl from this repository
2. Provision PostgreSQL database
3. Deploy using Replit's one-click deployment

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: development | production

## Hotel Information
- **Name**: Regent Cha-am Beach Resort
- **Location**: Cha-am, Thailand  
- **Theme**: Professional blue (#2563eb)
- **Languages**: Thai (primary), English

## Support
For technical support, contact the hotel IT department.
```

### 3. replit.md (สำหรับโปรเจคใหม่)
```markdown
# Regent Cha-am Beach Resort - Maintenance Management System

## Overview

This is a comprehensive hotel maintenance management system specifically designed for Regent Cha-am Beach Resort. The application enables hotel staff to submit maintenance requests efficiently and allows administrators and technicians to manage repair workflows seamlessly.

## User Preferences

Preferred communication style: Simple, everyday language in Thai language (ภาษาไทย).
UI Theme Preference: Professional blue theme (#2563eb) with white text for Regent brand identity.
Hotel Branding: Regent Cha-am Beach Resort - luxury beachfront resort in Cha-am, Thailand.

## Project Architecture

### Hotel Information
- **Official Name**: Regent Cha-am Beach Resort
- **Location**: Cha-am Beach, Phetchaburi Province, Thailand
- **Brand Identity**: Professional luxury resort with blue color scheme
- **Target Users**: Hotel staff, management, maintenance technicians
- **Languages**: Thai (primary), English (secondary)

### Technical Stack
- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Node.js with Express framework  
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: Replit Auth with role-based access
- **Theme**: Professional blue (#2563eb) color scheme

### Database Schema
- **Schema Name**: regent_hotel
- **Separate Database**: Independent PostgreSQL instance
- **Tables**: users, repairs, notifications, user_sessions
- **Isolation**: Complete data separation from other hotel systems

### Features Implemented
- ✅ Role-based user management (admin, manager, staff, technician)
- ✅ Maintenance request submission with image uploads
- ✅ Real-time dashboard with statistics and charts
- ✅ Notification system for request status updates
- ✅ Multi-language support (Thai/English)
- ✅ Responsive design for mobile and desktop
- ✅ Professional blue theme consistent with Regent branding

### Deployment Configuration
- **Platform**: Replit deployment with auto-scaling
- **Database**: Dedicated PostgreSQL instance
- **Domain**: regent-cha-am-hotel-maintenance-system-[username].replit.app
- **Environment**: Production-ready with proper security configurations

## Recent Changes

**Initial Project Setup - [Current Date]**
- ✅ Created independent deployment package for Regent Cha-am Beach Resort
- ✅ Configured professional blue theme (#2563eb) consistent with Regent branding  
- ✅ Set up dedicated PostgreSQL database with regent_hotel schema
- ✅ Implemented complete separation from Vala Hotel system
- ✅ Configured Thai/English translations specific to Regent resort
- ✅ Prepared comprehensive deployment documentation and setup scripts

The system is designed for scalability and maintainability, with complete data isolation from other hotel management systems and professional branding aligned with Regent Cha-am Beach Resort's luxury positioning.
```

## คำแนะนำการใช้งาน:

1. **สร้าง Repl ใหม่** ชื่อ "Regent-Cha-am-Hotel-Maintenance-System"
2. **Copy ไฟล์ทั้งหมด** จากโปรเจคปัจจุบัน
3. **แทนที่ไฟล์** package.json, README.md, replit.md ด้วยเวอร์ชันข้างต้น
4. **ตั้งค่าฐานข้อมูล** ใหม่และรัน setup script
5. **Deploy** และทดสอบระบบ

ระบบจะมีการแยกแบรนด์และข้อมูลสมบูรณ์สำหรับโรงแรมรีเจนท์ ชะอำ!