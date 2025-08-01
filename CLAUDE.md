# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Start all development servers (frontend on :5173, backend on :3003)
pnpm dev

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Type checking and linting
pnpm type-check
pnpm lint
```

### Package-Specific Commands
```bash
# Frontend only (React + Vite + Tailwind)
pnpm dev:frontend
pnpm build:frontend

# Backend only (Node.js + Express + TypeScript)
pnpm dev:backend
pnpm build:backend

# Backend testing with Vitest
pnpm --filter @attendandt/backend test
pnpm --filter @attendandt/backend test:local  # includes db reset for clean test environment
```

### Database Operations
```bash
# Open Prisma Studio for database inspection
pnpm db:studio

# Run database migrations
pnpm db:migrate

# Reset database (destructive - use carefully)
pnpm db:reset

# Generate Prisma client after schema changes
pnpm --filter @attendandt/backend db:generate
```

## Architecture Overview

### Monorepo Structure
This is a **pnpm workspace monorepo** with three packages:
- **@attendandt/frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **@attendandt/backend**: Node.js + Express + TypeScript + Prisma ORM  
- **@attendandt/shared**: Common TypeScript types and DTOs

### Authentication Architecture
- **Primary auth**: Supabase Auth with JWT tokens
- **Legacy auth**: Custom auth system at `/api/v1/auth-legacy` (being migrated from)
- **User linking**: Users table has `authId` field linking to Supabase auth.users.id
- **RBAC**: Role-based access control with roles: ADMIN, STAFF, CONCIERGE, VIEWER
- **Frontend auth**: Managed via AuthContext, with ProtectedRoute components

### Database Schema (PostgreSQL + Prisma)
Key models and their relationships:
- **User**: Core auth entity with Supabase integration, contains profile data
- **Guest**: Customer profiles with full contact/preference management
- **Vendor**: Service provider directory with categories and ratings
- **PasswordResetToken**: Secure password recovery tokens
- **AuditLog**: Tracks user actions and profile changes

Database conventions:
- UUID primary keys for all entities
- snake_case column names (mapped from camelCase in Prisma models)
- Consistent timestamps: createdAt, updatedAt on all models

### API Architecture
- **Base path**: `/api/v1/`
- **Auth routes**: `/auth` (Supabase), `/auth-legacy` (custom)
- **Resource routes**: `/users`, `/profile`, `/guests`, `/vendors`
- **Middleware stack**: Authentication → RBAC → Rate limiting → Logging
- **Error handling**: Structured JSON responses with proper HTTP status codes
- **Security**: Helmet.js, CORS, Zod validation

### Frontend Architecture
- **State management**: Zustand for global state, React Query for server state
- **Form handling**: Formik + Yup validation
- **Routing**: React Router v6 with role-based protected routes
- **Component organization**:
  - `components/auth/` - Authentication forms and protection
  - `components/guests/` - Guest management CRUD
  - `components/vendors/` - Vendor directory
  - `components/layout/` - App shell and navigation

### Development Environment
- **API proxy**: Vite dev server proxies `/api` requests to `localhost:3003`
- **Hot reload**: Both frontend (Vite HMR) and backend (tsx watch) support hot reload
- **Environment files**: Separate `.env` files in frontend and backend packages
- **Database**: PostgreSQL via Supabase with connection pooling

## Code Conventions

### TypeScript Configuration
- **Strict mode** enabled across all packages
- **ESM modules**: All packages use `"type": "module"`
- **Shared types**: Centralized in `packages/shared/src/types/index.ts`
- **Import style**: Relative imports, avoid complex path aliases

### API Response Patterns
- Use `ApiResponse<T>` interface from shared types for consistent responses
- Paginated responses use `PaginatedResponse<T>` interface
- Error responses include `error`, `message`, and `timestamp` fields
- HTTP status codes follow REST conventions

### Database Patterns
- All entities extend `BaseEntity` interface (id, createdAt, updatedAt)
- Enum values use SCREAMING_SNAKE_CASE with `@@map` for database names
- Foreign key fields follow `{relation}Id` naming (e.g., `createdById`)
- JSON fields used for flexible data (preferences, notes)

### Design System (Tailwind + Custom Colors)
Based on `.cursor/rules/design-system.md`:
- **Primary colors**: Teal (#2CB9B0), Midnight (#1F2937), White (#FFFFFF)
- **Typography**: Inter font with defined scale (H1: 32px/700, Body: 16px/400)
- **Components**: 48px button height, 8px border radius, consistent spacing scale
- **Accessibility**: 4.5:1 contrast ratios, 44px minimum touch targets

## Testing Strategy

### Backend Testing
- **Framework**: Vitest with TypeScript support
- **Database isolation**: `test:local` command resets test database before running
- **Test files**: Located in `packages/backend/src/__tests__/`
- **Coverage**: Authentication, profile management, and vendor operations

### Environment Variables
**Backend (.env)**:
- `DATABASE_URL`, `DIRECT_URL` - PostgreSQL connections
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` - Token signing key

**Frontend (.env)**:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` - Backend API endpoint

## Key Implementation Details

### Dual Authentication System
The app is transitioning from custom auth to Supabase Auth:
- New registrations use Supabase Auth (`/api/v1/auth`)
- Legacy users can still authenticate via custom auth (`/api/v1/auth-legacy`)
- Both systems create/update records in the Users table
- RBAC middleware works with both authentication methods

### Guest Management Flow
- Guests are created by authenticated staff members
- Full CRUD operations with address and preference tracking
- Status management (ACTIVE, INACTIVE, VIP, BLACKLISTED)
- Audit logging for all profile changes

### Vendor Directory
- Categorized vendor management (FOOD, TRANSPORT, ENTERTAINMENT, etc.)
- Rating system and service offerings tracking
- Contact management with notes and website links
- Created by staff with proper attribution tracking

## PROJECT IMPLEMENTATION PLAN & PROGRESS TRACKING

**CRITICAL INSTRUCTIONS FOR CLAUDE AGENTS:**
1. **ALWAYS update this section** when completing tasks or phases
2. **Use TodoWrite tool** for session tracking, but update this file for permanent record
3. **Mark progress with timestamps** and your agent type
4. **Document what was tested** and what needs testing next
5. **Update status**: ❌ Not Started, 🔄 In Progress, ✅ Completed, ⚠️ Issues Found

### Current Project Status: Smart Hospitality Operations Platform with Mews PMS Integration

**Last Updated**: 2025-01-08 (Phase 1.1 In Progress)
**Current Phase**: Phase 1 - Foundation & Core Integration
**Next Testing Required**: Project foundation verification

### Phase 1: Foundation & Core Integration (Weeks 1-3)
**Target Completion**: Week 3
**Responsible Agents**: devops-automator, backend-architect

#### Phase 1.1: Project Foundation Setup
**Status**: ✅ Completed
**Started**: 2025-01-08
**Completed**: 2025-01-08 by devops-automator
**Tasks**:
- ✅ Verify monorepo structure and build processes
- ✅ Check dependency compatibility and versions
- ✅ Test development server startup (frontend:5173, backend:3003)
- ✅ Verify Prisma database connection
- ✅ Confirm API proxy configuration
- ✅ Create/verify environment file templates

**Completed Work**:
- Created environment file templates (.env.example files)
- Validated all TypeScript configurations
- Confirmed pnpm workspace structure working
- Verified API proxy configuration in Vite
- Created build verification and development helper scripts

**Testing Required**: Manual verification of build commands and dev server startup

#### Phase 1.2: Mews API Integration Framework
**Status**: ❌ Not Started
**Tasks**:
- ❌ Implement Mews Connector API client with sandbox tokens
- ❌ Add Mews Distributor API integration
- ❌ Create authentication and rate limiting handlers
- ❌ Build error handling and retry mechanisms
- ❌ Add Mews API types and DTOs

**Testing Required**: Mews API connection, fetch reservations, handle rate limits

#### Phase 1.3: Real-time WebSocket Connections
**Status**: ❌ Not Started
**Tasks**:
- ❌ Configure Mews WebSocket connection (wss://ws.mews-demo.com)
- ❌ Implement event handlers for reservation changes
- ❌ Add reconnection logic and error handling
- ❌ Create WebSocket client for frontend
- ❌ Build real-time update system

**Testing Required**: WebSocket connection, live event handling, reconnection

#### Phase 1.4: Bidirectional Sync Engine
**Status**: ❌ Not Started
**Tasks**:
- ❌ Build Mews → Platform sync (reservations, guest updates)
- ❌ Implement Platform → Mews sync (charges, service orders)
- ❌ Add conflict resolution and data validation
- ❌ Create sync status tracking and logging
- ❌ Build manual sync triggers for testing

**Testing Required**: Bidirectional sync, conflict handling, data integrity

### Phase 2: Smart Data Management (Weeks 2-4)
**Status**: ❌ Not Started
**Target Completion**: Week 4

#### Phase 2.1: Enhanced Database Schema
**Tasks**:
- ❌ Extend Guest/User models for Mews integration
- ❌ Add data completeness tracking fields
- ❌ Implement audit logging for Mews sync operations
- ❌ Create configurable business rules engine
- ❌ Add Mews-specific fields (externalId, syncStatus, etc.)

#### Phase 2.2: Smart Data Intelligence
**Tasks**:
- ❌ Guest Profile Completeness Scoring algorithm (0-100%)
- ❌ Data Gap Detection system
- ❌ Auto-enrichment rules from Mews data
- ❌ Configurable validation rules by admin
- ❌ Smart recommendations engine

### Phase 3: Real-time Operations Dashboard (Weeks 3-5)
**Status**: ❌ Not Started
**Target Completion**: Week 5

#### Phase 3.1: Smart Dashboard System
**Tasks**:
- ❌ Operation Health Dashboard with real-time metrics
- ❌ Arrival Readiness Board with completeness scores
- ❌ Service Opportunity Tracker for upselling
- ❌ Staff Task Management with priority system
- ❌ Mobile-responsive dashboard design

#### Phase 3.2: Advanced Notification System
**Tasks**:
- ❌ Smart Alert Engine with priority routing
- ❌ Multi-channel notifications (email, SMS, in-app)
- ❌ Escalation rules for overdue tasks
- ❌ Customizable trigger conditions
- ❌ Notification preferences management

### Phase 4: Service Orchestration & Vendor Management (Weeks 4-6)
**Status**: ❌ Not Started
**Target Completion**: Week 6

#### Phase 4.1: Enhanced Vendor System
**Tasks**:
- ❌ Smart Vendor Matching with AI algorithms
- ❌ Dynamic Pricing Engine for services
- ❌ Service Timeline Management
- ❌ Quality Scoring and performance tracking
- ❌ Vendor availability integration

#### Phase 4.2: Automated Service Workflows
**Tasks**:
- ❌ Pre-arrival Service Creation automation
- ❌ Mews Charge Integration for seamless billing
- ❌ Service Status Tracking across systems
- ❌ Guest Communication automation
- ❌ Service conflict detection and resolution

### Phase 5: Advanced Analytics & AI Features (Weeks 5-7)
**Status**: ❌ Not Started
**Target Completion**: Week 7

#### Phase 5.1: Predictive Intelligence
**Tasks**:
- ❌ Guest Satisfaction Predictor
- ❌ Revenue Optimization algorithms
- ❌ Demand Forecasting for staff planning
- ❌ VIP Detection and preference learning
- ❌ Behavioral pattern analysis

#### Phase 5.2: Advanced Reporting
**Tasks**:
- ❌ Guest Journey Analytics
- ❌ Revenue Attribution by service/segment
- ❌ Operational Efficiency Reports
- ❌ Custom Report Builder
- ❌ Real-time KPI dashboards

### Phase 6: Integration Ecosystem & Mobile (Weeks 6-8)
**Status**: ❌ Not Started
**Target Completion**: Week 8

#### Phase 6.1: Extended Integrations
**Tasks**:
- ❌ WhatsApp Business API integration
- ❌ Email Automation system
- ❌ Calendar Integration for staff
- ❌ Payment Gateway integration
- ❌ SMS notification system

#### Phase 6.2: Mobile Optimization
**Tasks**:
- ❌ Progressive Web App development
- ❌ Offline capabilities
- ❌ Push Notifications
- ❌ QR Code integration
- ❌ Mobile-first UI components

### Phase 7: Performance & Production Readiness (Weeks 7-8)
**Status**: ❌ Not Started
**Target Completion**: Week 8

#### Phase 7.1: Performance Optimization
**Tasks**:
- ❌ Redis Caching implementation
- ❌ Database query optimization
- ❌ API Rate Limiting proper handling
- ❌ Load Testing under peak conditions
- ❌ CDN setup for static assets

#### Phase 7.2: Production Deployment
**Tasks**:
- ❌ Environment Setup (staging/production)
- ❌ Monitoring & Alerting system
- ❌ Backup & Recovery procedures
- ❌ Security Audit and penetration testing
- ❌ Documentation completion

## SUCCESS METRICS & KPIs

### Technical Metrics
- **Data Completeness**: >95% of guest profiles complete before arrival
- **Response Time**: <2 seconds for all dashboard operations
- **Sync Accuracy**: 100% accuracy between Mews and platform data
- **System Uptime**: >99.9% availability
- **API Performance**: <500ms average response time

### Business Metrics  
- **Staff Efficiency**: 50% reduction in manual data entry
- **Revenue Impact**: 15% increase in ancillary service revenue
- **Guest Satisfaction**: Improved completion of pre-arrival requirements
- **Operational Efficiency**: 30% faster service delivery
- **Error Reduction**: 90% fewer data discrepancies

## TESTING PROTOCOLS

### After Each Phase
1. **Integration Testing**: All APIs and data flows work correctly
2. **Functional Testing**: Features work as specified
3. **Performance Testing**: System handles expected load
4. **User Acceptance Testing**: Staff can complete workflows efficiently
5. **Security Testing**: No vulnerabilities introduced

### Critical Test Scenarios
1. **Mews Integration**: Reservations sync, charges post correctly
2. **Real-time Updates**: WebSocket events trigger UI updates
3. **Data Intelligence**: Completeness scores calculate accurately
4. **Dashboard Performance**: Real-time metrics update smoothly
5. **Mobile Responsiveness**: All features work on mobile devices

## ENVIRONMENT SETUP REQUIREMENTS

### Additional Environment Variables Needed
**Backend (.env)**:
```bash
# Mews API Configuration
MEWS_CLIENT_TOKEN=E0D439EE522F44368DC78E1BFB03710C-D24FB11DBE31D4621C4817E028D9E1D
MEWS_ACCESS_TOKEN=C66EF7B239D24632943D115EDE9CB810-EA00F8FD8294692C940F6B5A8F9453D
MEWS_API_URL=https://api.mews-demo.com
MEWS_WS_URL=wss://ws.mews-demo.com
MEWS_CLIENT_NAME=AttendantPlatform 1.0.0

# Redis for caching
REDIS_URL=redis://localhost:6379

# Notification services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMS_API_KEY=your-sms-api-key
WHATSAPP_API_TOKEN=your-whatsapp-token
```

### Mews Integration Notes
- Using Mews Demo environment with provided sandbox tokens
- Gross pricing environment (UK-based) supports GBP, EUR, USD
- Rate limits: 500 requests per 15 minutes (demo), 3000 in production
- All datetime values must be in UTC ISO 8601 format
- WebSocket connection for real-time updates: wss://ws.mews-demo.com

---
**REMEMBER**: Always update this progress section when completing work!