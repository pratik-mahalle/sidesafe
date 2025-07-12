# RakshaSahayak - Women's Safety Platform

## Overview

RakshaSahayak is a comprehensive women's safety platform designed specifically for rural Maharashtra, India. It's a Progressive Web App (PWA) that combines emergency response, family tracking, incident reporting, and AI-powered safety recommendations with offline capabilities to ensure reliability in areas with poor connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom safety-themed colors
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Structure**: RESTful API with JSON responses
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple

### PWA Features
- **Service Worker**: Custom service worker for offline functionality
- **Manifest**: Web app manifest for native app-like experience
- **Offline Storage**: LocalStorage for offline data persistence
- **Background Sync**: Automatic data synchronization when online

## Key Components

### Safety Features
1. **SOS Button**: Emergency alert system with location sharing
2. **Safety Status**: Real-time safety status updates for users and family
3. **Family Tracking**: Location tracking and status monitoring for family members
4. **Incident Reporting**: Detailed incident reporting with evidence upload
5. **AI Recommendations**: Google Gemini AI-powered safety recommendations

### Database Schema
- **Users**: User profiles with safety status and location
- **Incidents**: Incident reports with type, urgency, and evidence
- **Family Members**: Family member tracking and status
- **Safety Recommendations**: AI-generated safety advice
- **Emergency Alerts**: Emergency notification system

### External Integrations
- **Google Gemini AI**: For generating contextual safety recommendations
- **Geolocation API**: For location tracking and sharing
- **Service Worker**: For offline functionality and push notifications

## Data Flow

1. **User Registration/Login**: Users access the platform (currently using mock user ID 1)
2. **Real-time Status Updates**: Users can update their safety status and location
3. **Incident Reporting**: Users report incidents with location and evidence
4. **Family Tracking**: Family members share locations and safety status
5. **AI Recommendations**: System generates safety recommendations based on location and recent incidents
6. **Emergency Alerts**: SOS button triggers emergency notifications to predefined contacts
7. **Offline Mode**: Critical functions work offline with data sync when connectivity returns

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: Neon Database serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler for production
- **tailwindcss**: CSS framework

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with hot module replacement
- **Backend**: tsx for running TypeScript server directly
- **Database**: Drizzle Kit for schema management and migrations

### Production
- **Frontend**: Vite build creates static assets in `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Deployment**: Express server serves both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **GEMINI_API_KEY**: Google Gemini AI API key for recommendations
- **NODE_ENV**: Environment setting (development/production)

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **TypeScript Throughout**: Full TypeScript adoption for type safety and developer experience
3. **Offline-First Design**: Critical safety features work without internet connectivity
4. **Mobile-First UI**: Responsive design optimized for mobile devices with bottom navigation
5. **AI Integration**: Google Gemini AI for contextual safety recommendations
6. **Serverless Database**: Neon Database for scalable, serverless PostgreSQL
7. **Progressive Web App**: PWA capabilities for native app-like experience
8. **Real-time Updates**: Immediate status updates and family tracking
9. **Evidence Upload**: Support for photo/video evidence in incident reports
10. **Cultural Sensitivity**: Designed specifically for rural Maharashtra context

The architecture prioritizes reliability, offline functionality, and user safety while maintaining simplicity and cultural appropriateness for the target demographic.