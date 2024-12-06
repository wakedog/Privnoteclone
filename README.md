Secure Notes Web Application
A web application for creating and sharing self-destructing encrypted notes with client-side encryption and modern UI design.

Features
Client-side encryption for note content
Password-protected note access with client-side hashing
Single-view note access with automatic deletion
Time-based note expiration (1 hour to 30 days)
Secure error handling and validation
Zero-knowledge note sharing system
Theme toggle support with dark/light modes
Social media sharing integration with animated menu
Modern UI with responsive design and interactive elements
Tech Stack
Frontend
React 18
TypeScript
Vite
Tailwind CSS
Shadcn/ui Components
React Query (TanStack Query)
Wouter (Router)
Zod (Schema Validation)
Lucide Icons
Backend
Express.js
Node.js
TypeScript
Drizzle ORM
PostgreSQL
Project Setup
Install Node.js 18 or later

Install project dependencies:

npm install
Set up PostgreSQL database and add connection URL to environment variables:
DATABASE_URL=postgresql://user:password@host:port/database
Push database schema:
npm run db:push
Start development server:
npm run dev
The application will be available at http://localhost:5000

Project Structure
/client - Frontend React application
/src/components - Reusable UI components
/src/lib - Utility functions and configurations
/src/pages - Application pages
/server - Backend Express server
/db - Database schema and configurations
Environment Variables
Required environment variables:

DATABASE_URL - PostgreSQL connection URL
PGDATABASE - PostgreSQL database name
PGHOST - PostgreSQL host
PGPORT - PostgreSQL port
PGUSER - PostgreSQL user
PGPASSWORD - PostgreSQL password
Scripts
npm run dev - Start development server
npm run build - Build for production
npm run start - Start production server
npm run db:push - Push database schema changes
Version
Current version: 1.0.0

Repository
Available at: github.com/wakedog/Privnoteclone
