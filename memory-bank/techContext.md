# Technical Context: Attendandt

## Technology Stack

### Frontend Technologies
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router v6 for client-side navigation
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query) for server state
- **Forms**: Formik with Yup validation
- **UI Components**: Custom components built with Tailwind

### Backend Technologies
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Prisma for type-safe database operations
- **Authentication**: Supabase Auth for JWT-based authentication
- **Validation**: Zod for runtime type checking
- **Logging**: Winston or Pino for structured logging
- **Caching**: Redis for performance optimization

### Database & Infrastructure
- **Database**: PostgreSQL via Supabase
- **Security**: Row Level Security (RLS) policies
- **Migrations**: Prisma migrations for schema management
- **Deployment**: Railway for production hosting
- **Containerization**: Docker for development environment
- **CI/CD**: GitHub Actions for automated testing and deployment

### Package Management
- **Tool**: pnpm for efficient package management
- **Structure**: Workspace configuration for monorepo
- **Dependency Sharing**: Shared packages between frontend/backend

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker and Docker Compose
- Git
- Supabase account
- Railway account (for deployment)

### Environment Configuration
```bash
# Backend Environment Variables
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
JWT_SECRET="..."
REDIS_URL="redis://localhost:6379"
PORT=3000

# Frontend Environment Variables
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY="..."
VITE_API_URL="http://localhost:3000"
```

### Local Development Workflow
1. **Initial Setup**:
   ```bash
   pnpm install
   docker-compose up -d
   cd packages/backend && pnpm prisma migrate dev
   ```

2. **Development Mode**:
   ```bash
   pnpm dev  # Starts both frontend and backend
   ```

3. **Database Management**:
   ```bash
   pnpm db:studio  # Prisma Studio
   pnpm db:migrate  # Run migrations
   pnpm db:reset   # Reset database
   ```

## Technical Constraints

### Performance Requirements
- **API Response Time**: < 200ms for CRUD operations
- **Page Load Time**: < 2 seconds for initial load
- **Database Queries**: Optimized with proper indexing
- **Caching**: Redis for frequently accessed data

### Security Requirements
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row Level Security on all tables
- **Input Validation**: Client and server-side validation
- **Security Headers**: Helmet.js for security headers

### Scalability Constraints
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session and data caching
- **File Storage**: Supabase Storage for file uploads
- **API Rate Limiting**: Implemented for production

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: Responsive design for tablet usage
- **JavaScript**: ES2020+ features supported

## Dependencies

### Core Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "react-router-dom": "^6.15.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^4.32.0",
  "formik": "^2.4.0",
  "yup": "^1.2.0",
  "@supabase/supabase-js": "^2.33.0"
}
```

### Core Backend Dependencies
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "prisma": "^5.2.0",
  "@prisma/client": "^5.2.0",
  "zod": "^3.22.0",
  "winston": "^3.10.0",
  "helmet": "^7.0.0",
  "cors": "^2.8.0",
  "redis": "^4.6.0",
  "@supabase/supabase-js": "^2.33.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.5.0",
  "@types/express": "^4.17.0",
  "eslint": "^8.47.0",
  "prettier": "^3.0.0",
  "husky": "^8.0.0",
  "lint-staged": "^13.2.0",
  "vitest": "^0.34.0"
}
```

## Build and Deployment

### Build Process
- **Frontend**: Vite build with TypeScript compilation
- **Backend**: TypeScript compilation with Prisma generation
- **Shared**: TypeScript compilation for shared packages

### Deployment Strategy
- **Platform**: Railway for production deployment
- **Environment**: Containerized deployment with Docker
- **Database**: Supabase PostgreSQL in production
- **CDN**: Railway's built-in CDN for static assets

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
- Lint and type checking
- Unit tests
- Integration tests
- Build verification
- Deployment to Railway
```

## Monitoring and Logging

### Application Monitoring
- **Logging**: Structured logging with Winston/Pino
- **Error Tracking**: Comprehensive error handling
- **Performance**: Database query monitoring
- **Uptime**: Railway's built-in monitoring

### Development Tools
- **Database**: Prisma Studio for database management
- **API Testing**: Thunder Client or Postman
- **Code Quality**: ESLint and Prettier
- **Git Hooks**: Husky for pre-commit validation

## Migration Strategy

### Database Migrations
- **Tool**: Prisma migrations
- **Process**: Version-controlled schema changes
- **Rollback**: Migration rollback capabilities
- **Seeding**: Database seeding for development

### Deployment Migrations
- **Zero-downtime**: Migrations run before deployment
- **Validation**: Schema validation in CI/CD
- **Backup**: Automatic backups before major changes 