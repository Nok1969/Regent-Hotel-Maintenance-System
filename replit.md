# Hotel Maintenance System

## Overview

This is a full-stack hotel maintenance system built with modern web technologies. The application allows hotel staff to submit maintenance requests and enables administrators to manage and track repair tasks. The system features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and includes internationalization support for English and Thai languages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
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
- **Authorization**: Role-based access control (admin/staff roles)
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Security**: HTTP-only cookies with secure settings

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
- **Languages**: English and Thai support
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

The application is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, comprehensive type safety, and modern development practices throughout the stack.