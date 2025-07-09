# Attendandt

A comprehensive guest management and concierge service platform designed for hospitality businesses.

## Overview

Attendandt combines guest profile management, vendor directory services, and concierge request handling with advanced data ingestion and discrepancy detection capabilities.

## Features

- **Guest Profile Management** - Complete CRUD operations for guest information
- **Vendor Directory** - Searchable directory of service providers
- **Concierge Services** - Request management system linking guests to vendors
- **Data Ingestion** - Automated data import from multiple sources
- **Discrepancy Detection** - Automated detection and resolution of data inconsistencies

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for utility-first styling
- React Router v6 for client-side navigation
- Zustand for global state management
- React Query (TanStack Query) for server state
- Formik with Yup validation

### Backend
- Node.js 18+ with TypeScript
- Express.js for REST API
- Prisma for type-safe database operations
- Supabase Auth for JWT-based authentication
- Zod for runtime type checking
- Winston for structured logging
- Redis for performance optimization

### Database & Infrastructure
- PostgreSQL via Supabase
- Row Level Security (RLS) policies
- Railway for production hosting
- Docker for development environment
- GitHub Actions for CI/CD

## Project Structure

```
Attendandt/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript
│   ├── backend/           # Node.js + Express + TypeScript
│   └── shared/            # Common types and DTOs
├── memory-bank/           # Project context and documentation
├── docker-compose.yml     # Development environment
├── pnpm-workspace.yaml    # Workspace configuration
└── TASKS.md              # Implementation roadmap
```

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose
- Git
- Supabase account
- Railway account (for deployment)

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

Copy the example environment files and fill in your values:

```bash
# Backend environment
cp packages/backend/.env.example packages/backend/.env

# Frontend environment
cp packages/frontend/.env.example packages/frontend/.env
```

### 4. Start development environment

```bash
# Start Docker services (PostgreSQL, Redis)
pnpm docker:up

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Development Scripts

### Root Level Commands

```bash
# Start all development servers
pnpm dev

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

### Package-Specific Commands

```bash
# Frontend only
pnpm dev:frontend
pnpm build:frontend

# Backend only
pnpm dev:backend
pnpm build:backend

# Database operations
pnpm db:studio      # Open Prisma Studio
pnpm db:migrate     # Run migrations
pnpm db:reset       # Reset database
```

### Docker Commands

```bash
# Start development services
pnpm docker:up

# Stop development services
pnpm docker:down

# View logs
pnpm docker:logs
```

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
JWT_SECRET="..."
REDIS_URL="redis://localhost:6379"
PORT=3000
```

### Frontend (.env)

```bash
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY="..."
VITE_API_URL="http://localhost:3000"
```

## Implementation Roadmap

The project follows a 20-step implementation plan organized into 6 sections:

1. **Project Foundation & Core Setup** (Steps 1-5)
2. **Authentication & User Management** (Steps 6-8)
3. **Guest Profile Management** (Steps 9-10)
4. **Vendor & Concierge Services** (Steps 11-14)
5. **Data Ingestion & Optimization** (Steps 15-18)
6. **Finalization & Deployment** (Steps 19-20)

See [TASKS.md](./TASKS.md) for detailed implementation steps.

## Architecture

### Monorepo Structure
- **Shared Package**: Common types, DTOs, and constants
- **Frontend Package**: React application with Tailwind UI
- **Backend Package**: Express API with Prisma ORM

### Security
- JWT-based authentication with Supabase Auth
- Role-Based Access Control (RBAC)
- Row Level Security (RLS) policies
- Input validation on client and server
- Security headers with Helmet.js

### Performance
- React Query for client-side caching
- Redis for server-side caching
- Optimized database queries with Prisma
- Code splitting and lazy loading

## Contributing

1. Follow the implementation steps in TASKS.md
2. Update the memory-bank documentation as needed
3. Maintain TypeScript strict mode compliance
4. Write tests for new features
5. Follow the established code patterns

## Deployment

The application is designed to deploy on Railway with:
- Automatic builds from Git
- Environment variable management
- Database migrations on deploy
- CDN for static assets

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please refer to the memory-bank documentation or create an issue in the repository. 