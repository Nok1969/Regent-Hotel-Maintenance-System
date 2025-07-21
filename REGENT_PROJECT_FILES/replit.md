# Regent Cha-am Beach Resort - Hotel Maintenance System

## Overview

This is a comprehensive hotel maintenance management system built specifically for **Regent Cha-am Beach Resort**. The application features a modern React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and includes internationalization support for English and Thai languages. The system uses a professional blue theme (#2563eb) reflecting the luxury beachfront resort brand.

## User Preferences

Preferred communication style: Simple, everyday language in Thai language (ภาษาไทย).
UI Theme Preference: Professional blue theme (#2563eb) with white text for luxury resort branding.

## Recent Changes

**July 21, 2025 - Complete Project Separation for Regent Cha-am Beach Resort**
- ✅ Created completely separate project package for Regent Cha-am Beach Resort
- ✅ Designed professional blue theme (#2563eb) for Regent luxury branding
- ✅ Updated all branding to "Regent Cha-am Beach Resort" throughout the system
- ✅ Created complete translation files for English and Thai languages
- ✅ Prepared independent database schema for separate deployment
- ✅ Generated comprehensive setup instructions for new project creation
- ✅ Established complete project separation from Vala Hotel system
- ✅ Created professional README.md and documentation for Regent project
- ✅ Prepared all necessary configuration files (package.json, CSS, localization)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with professional blue theme variables
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js for dashboard visualizations
- **Internationalization**: react-i18next for English/Thai language support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL storage
- **File Uploads**: Multer for image handling
- **API Design**: RESTful endpoints with proper error handling

### Database Design
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Migration**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OAuth flow
- **Authorization**: 4-tier role-based access control system
  - **Admin**: Full system access including user management
  - **Manager**: Full access except cannot add new users
  - **Staff**: Cannot change job status (view and create only)
  - **Technician**: Can accept jobs and change job status
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Security**: HTTP-only cookies with secure settings
- **Permissions**: Granular permission system with backend enforcement

### Hotel Branding - Regent Cha-am Beach Resort
- **Theme Colors**: Professional blue (#2563eb, #1d4ed8, #1e40af)
- **Typography**: Inter and Poppins fonts for modern luxury appearance
- **Branding**: "Regent Cha-am Beach Resort" throughout the system
- **Location**: Cha-am, Thailand luxury beachfront resort
- **Styling**: Professional gradient backgrounds and enhanced text clarity

### Maintenance Request Management
- **Request Creation**: Multi-step form with image uploads
- **Categories**: Electrical, plumbing, air conditioning, furniture, other
- **Priority Levels**: High, medium, low urgency classification
- **Status Tracking**: Pending, in progress, completed workflow
- **File Management**: Image attachments with size and type validation

### Dashboard & Analytics
- **Statistics**: Real-time counts and status summaries
- **Visualizations**: Pie charts for categories, bar charts for status distribution
- **Recent Activity**: Latest repair requests display
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Internationalization
- **Languages**: English and Thai support for Regent Resort
- **Storage**: localStorage for user preference persistence
- **Fallback**: English as default language
- **Coverage**: Complete UI translation including forms and messages

## Data Flow

### Request Lifecycle
1. **Creation**: Staff submits repair request via form
2. **Storage**: Data saved to PostgreSQL with uploaded images
3. **Notification**: Real-time updates via dashboard refresh
4. **Management**: Admin can view, filter, and update status
5. **Completion**: Status tracking throughout repair process

### Authentication Flow
1. **Login**: Redirect to Replit OAuth provider
2. **Callback**: Token exchange and user profile creation
3. **Session**: Persistent session with role-based permissions
4. **Authorization**: Route protection and API access control

### File Upload Process
1. **Validation**: Client-side file type and size checks
2. **Upload**: Multer processing with disk storage
3. **Storage**: Local filesystem with served static routes
4. **Reference**: Database stores file paths for retrieval

## External Dependencies

### Core Dependencies
- **UI Components**: Radix UI primitives for accessibility
- **Database**: Neon PostgreSQL serverless platform
- **Authentication**: Replit Auth OAuth service
- **Charts**: Chart.js for data visualization
- **File Processing**: Multer for multipart form handling

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint integration via Vite
- **Build Process**: Vite with React plugin and optimizations
- **Path Resolution**: Custom aliases for clean imports

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static file serving with Express
- **Environment**: NODE_ENV-based configuration switching

### Development Environment
- **Hot Reload**: Vite dev server with HMR
- **Proxy Setup**: Backend API proxied through Vite
- **Database**: Live connection to provisioned PostgreSQL
- **Error Handling**: Runtime error overlays and logging

### Database Management
- **Schema**: Version-controlled with Drizzle migrations
- **Deployment**: Push schema changes via `drizzle-kit push`
- **Connection**: Environment variable-based configuration
- **Pooling**: Connection pool management for scalability

### File Storage
- **Local Development**: Files stored in `/uploads` directory
- **Static Serving**: Express middleware for file access
- **Security**: File type validation and size limits
- **Organization**: Structured directory layout for maintenance

## Project Separation Details

### Regent Cha-am Beach Resort (New Project)
- **URL**: regent-cha-am-hotel-maintenance-system-[username].replit.app
- **Database**: Completely separate PostgreSQL database
- **Theme**: Professional blue (#2563eb) luxury branding
- **Branding**: Regent Cha-am Beach Resort specific content
- **Independence**: No shared data or dependencies with other hotels

The application is designed for complete independence as a luxury resort maintenance management solution, with modern development practices, comprehensive security, and professional branding throughout the stack.