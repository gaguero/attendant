# Attendandt - Smart Hospitality Operations Platform

A comprehensive hospitality operations platform that integrates deeply with the Mews Property Management System (PMS) to provide real-time data synchronization, intelligent guest profile management, and streamlined operations for hotel staff.

## Overview

Attendandt is designed to move beyond basic property management and create a proactive, data-driven operational tool. By enriching guest data, automating workflows, and providing actionable insights, the platform empowers staff to deliver personalized, high-quality service efficiently.

## Current Status

**Phase 1: Foundation & Core Integration** ✅ **COMPLETED**

- ✅ Mews API Integration with authentication and rate limiting
- ✅ Real-time WebSocket connections for live updates
- ✅ Database schema with sync tracking fields
- ✅ Bidirectional sync framework ready for implementation

## Features (Implemented)

- **Mews Integration** - Real-time synchronization with Mews PMS
- **WebSocket Connections** - Live event handling from Mews
- **Database Sync Tracking** - Comprehensive sync status monitoring
- **Authentication System** - Dual auth (Supabase + custom)
- **Rate Limiting** - Respects Mews API limits (500 requests/15min)
- **Error Handling** - Robust retry logic with exponential backoff

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- React Router v6 for client-side navigation
- Zustand for global state management
- React Query (TanStack Query) for server state

### Backend
- Node.js 18+ with TypeScript
- Express.js for REST API
- Prisma for type-safe database operations
- Supabase Auth for JWT-based authentication
- Zod for runtime type checking
- Winston for structured logging
- Axios for HTTP client with retry logic
- WebSocket client for real-time connections

### Database & Infrastructure
- PostgreSQL via Supabase
- Row Level Security (RLS) policies
- Railway for production hosting
- Docker for development environment

### Mews Integration
- REST API client with authentication
- WebSocket client for real-time events
- Rate limiting and error handling
- Sync tracking with `mewsId` and `syncedAt` fields

## Project Structure

```
Attendandt/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript
│   ├── backend/           # Node.js + Express + TypeScript
│   │   ├── src/
│   │   │   ├── lib/       # Core libraries (mews.ts, mews.ws.ts)
│   │   │   ├── services/  # Business logic services
│   │   │   ├── routes/    # API endpoints
│   │   │   └── config/    # Configuration management
│   │   └── prisma/        # Database schema and migrations
│   └── shared/            # Common types and DTOs
├── memory-bank/           # Project context and documentation
├── pnpm-workspace.yaml    # Workspace configuration
└── TASKS.md              # Implementation roadmap
```

## Prerequisites

- Node.js 18+
- pnpm 8+
- Git
- Supabase account
- Mews API credentials (demo environment available)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd attendandt
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create environment files for backend and frontend:

```bash
# Backend environment
cp packages/backend/.env.example packages/backend/.env
# Add your Mews API credentials and database URLs

# Frontend environment  
cp packages/frontend/.env.example packages/frontend/.env
```

### 4. Start development servers

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:frontend  # Frontend on port 5173
pnpm dev:backend   # Backend on port 3003
```

### 5. Test Mews Integration

The application will automatically:
- Connect to Mews API with your credentials
- Establish WebSocket connection for real-time events
- Log incoming events for verification

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only

# Building
pnpm build            # Build all packages
pnpm type-check       # TypeScript validation

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio
pnpm db:migrate       # Run migrations

# Testing
pnpm test             # Run tests
```

### Mews Integration Testing

The platform includes comprehensive Mews integration:

- **API Client**: `packages/backend/src/lib/mews.ts`
- **WebSocket Client**: `packages/backend/src/lib/mews.ws.ts`
- **Sync Service**: `packages/backend/src/services/sync.service.ts`

## Next Steps

The project is ready for **Phase 2: Smart Data Management**, which will include:
- Guest Profile Completeness Scoring
- Data Gap Detection
- Auto-enrichment rules
- Configurable validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here] 