# Project Context for Claude Agents

## Project Overview
Attendant is a comprehensive hospitality operations platform designed for hotels and hospitality businesses. It combines guest profile management, vendor directory services, and concierge request handling with advanced data ingestion and discrepancy detection capabilities.

## Current Architecture State

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **State Management**: Zustand + React Query (planned)
- **Deployment**: Railway with CI/CD pipeline
- **Development**: pnpm workspaces monorepo

### Project Structure
```
Attendandt/
├── packages/
│   ├── frontend/          # React application
│   ├── backend/           # Express API server
│   └── shared/            # Common types and DTOs
├── memory-bank/           # Project documentation
├── .claude/              # Agent configurations
└── CLAUDE.md             # Development guidelines
```

### Completion Status (55% - 11/20 steps)
- ✅ **Foundation**: Monorepo, Supabase, Express backend
- ✅ **Authentication**: JWT + Supabase Auth system (stable)
- ✅ **Core Features**: User management, Guest profiles, Vendor management
- 🟡 **UI Polish**: Profile management needs refinement
- ❌ **Advanced Features**: Service requests, concierge dashboard, data ingestion

## Current Implementation Strengths
1. **Solid Foundation**: Well-structured monorepo with proper separation
2. **Modern Stack**: Latest versions of React, TypeScript, Prisma
3. **Security**: Proper JWT implementation with RBAC and RLS
4. **Database Design**: Clean schema with audit logging

## Areas for Strategic Improvement
1. **Service Layer**: Business logic scattered across routes
2. **Performance**: No caching or optimization implemented
3. **Testing**: Minimal test coverage
4. **Background Jobs**: No async processing system
5. **Real-time Features**: WebSocket integration needed

## Key Business Requirements
- **Multi-tenant**: Support for hotel chains
- **Real-time Updates**: Live status changes for requests
- **Data Intelligence**: Smart data ingestion and conflict resolution
- **Mobile-First**: Touch-optimized interface for staff
- **White-label**: Customizable branding per client

## Quality Standards
- **Performance**: Sub-200ms API response times
- **Security**: OWASP compliance, regular security audits
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: 80%+ code coverage
- **Documentation**: Complete API and user documentation

## Development Priorities
1. **Phase 1**: Architecture foundation & optimization
2. **Phase 2**: Core feature enhancement
3. **Phase 3**: Data intelligence & automation
4. **Phase 4**: Production readiness & deployment