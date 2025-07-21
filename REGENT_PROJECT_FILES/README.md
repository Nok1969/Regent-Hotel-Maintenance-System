# Regent Cha-am Beach Resort - Hotel Maintenance System

## Overview

A comprehensive hotel maintenance management system designed specifically for **Regent Cha-am Beach Resort**. This modern web application enables efficient tracking and management of hotel maintenance requests with a professional blue theme reflecting the resort's luxury beachfront brand.

## Key Features

### 🏨 Hotel Management
- **Complete maintenance request lifecycle management**
- **Multi-role user system** (Admin, Manager, Staff, Technician)
- **Real-time notifications** for status updates
- **Interactive dashboard** with comprehensive statistics
- **File upload support** for repair documentation

### 🎨 Design & Branding
- **Professional blue theme** (#2563eb) representing Regent's luxury brand
- **Responsive design** optimized for all devices
- **Modern UI components** with smooth animations
- **Consistent typography** using Inter and Poppins fonts

### 🌐 Multi-language Support
- **English and Thai** language options
- **Complete translation coverage** for all UI elements
- **Localized content** for Regent Cha-am Beach Resort

### 📊 Analytics & Reporting
- **Real-time dashboard** with repair statistics
- **Interactive charts** showing trends and categories
- **Monthly trend analysis** for management insights
- **Status distribution** and category breakdowns

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling and theming
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database management
- **PostgreSQL** database
- **Replit Auth** for authentication
- **Multer** for file uploads

### Development Tools
- **ESLint** for code quality
- **Drizzle Kit** for database migrations
- **Modern build pipeline** with optimized production builds

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Replit account for authentication

### Installation

1. **Clone or create the project:**
   ```bash
   # Create new Replit project: "Regent-Cha-am-Hotel-Maintenance-System"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # DATABASE_URL will be automatically provided by Replit
   ```

4. **Initialize database:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
regent-cha-am-hotel-maintenance-system/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── locales/       # Translation files
│   │   └── styles/        # CSS and styling
│   └── public/            # Static assets
├── server/
│   ├── routes/            # API endpoint handlers
│   ├── middleware/        # Express middleware
│   ├── db.ts             # Database configuration
│   └── index.ts          # Server entry point
├── shared/
│   └── schema.ts         # Database schema definitions
├── uploads/              # File storage directory
└── configuration files
```

## Features

### User Roles & Permissions
- **Admin:** Full system access including user management
- **Manager:** All functions except user creation
- **Staff:** Create and view repair requests
- **Technician:** Accept jobs and update status

### Repair Management
- **Request Creation:** Multi-step forms with image uploads
- **Status Tracking:** Pending → In Progress → Completed
- **Category System:** Electrical, Plumbing, HVAC, Furniture, Other
- **Priority Levels:** High, Medium, Low urgency classification

### Notification System
- **Real-time updates** for new requests
- **Status change notifications** to relevant users
- **Job assignment alerts** for technicians
- **Completion notifications** to requesters

### Dashboard Analytics
- **Statistical overview** with key metrics
- **Visual charts** for category and status distribution
- **Monthly trends** for management reporting
- **Recent activity** summaries

## Deployment

### Replit Deployment
1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy via Replit:**
   - Go to "Deployments" tab
   - Click "Deploy"
   - Your app will be available at: `regent-cha-am-hotel-maintenance-system-[username].replit.app`

### Environment Configuration
- **Development:** Automatic hot reload with Vite
- **Production:** Optimized builds with Express static serving
- **Database:** PostgreSQL with automatic connection pooling

## Customization

### Theme Colors
The professional blue theme can be customized in `client/src/index.css`:
```css
:root {
  --primary: hsl(219, 85%, 58%); /* Regent Blue */
  --secondary: hsl(220, 85%, 55%); /* Darker Blue */
  --accent: hsl(221, 83%, 53%); /* Accent Blue */
}
```

### Hotel Branding
Update hotel information in translation files:
- `client/src/locales/en.json`
- `client/src/locales/th.json`

### Database Schema
Modify schema in `shared/schema.ts` and run:
```bash
npm run db:push
```

## Support

For technical support or customization requests:
- **Hotel:** Regent Cha-am Beach Resort
- **Location:** Cha-am, Thailand
- **System:** Professional maintenance management solution

## License

Proprietary software developed for Regent Cha-am Beach Resort.

---

**Regent Cha-am Beach Resort** - Luxury Beachfront Experience with Professional Service Management