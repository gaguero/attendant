# Project Brief: Attendandt

## Project Overview
Attendandt is a comprehensive guest management and concierge service platform designed for hospitality businesses. The platform combines guest profile management, vendor directory services, and concierge request handling with advanced data ingestion and discrepancy detection capabilities.

## Core Requirements

### Primary Features
1. **Guest Profile Management** - Complete CRUD operations for guest information
2. **Vendor Directory** - Searchable directory of service providers
3. **Concierge Services** - Request management system linking guests to vendors
4. **Data Ingestion** - Automated data import from multiple sources
5. **Discrepancy Detection** - Automated detection and resolution of data inconsistencies

### Technical Requirements
- **Architecture**: Monorepo with pnpm workspaces
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **State Management**: Zustand + React Query
- **Deployment**: Railway with CI/CD pipeline
- **Development**: Docker containerization

### Quality Requirements
- **Security**: Role-Based Access Control (RBAC) with comprehensive RLS policies
- **Performance**: Redis caching for frequently accessed data
- **Reliability**: Comprehensive error handling and validation
- **Maintainability**: Type-safe operations throughout the stack
- **Scalability**: Asynchronous processing for data ingestion

## Project Goals
1. **User Experience**: Seamless, intuitive interface with clear feedback
2. **Data Integrity**: Robust validation and error handling at all levels
3. **Security**: Multi-layered security with authentication, authorization, and data protection
4. **Performance**: Fast, responsive application with optimized database queries
5. **Reliability**: Stable platform with automated testing and deployment

## Success Criteria
- All 20 implementation steps completed successfully
- Comprehensive test coverage with automated CI/CD
- Production deployment on Railway
- Security audit passed with all RLS policies implemented
- Performance benchmarks met with Redis caching active

## Constraints
- Must use specified technology stack
- Must follow monorepo architecture
- Must implement comprehensive security measures
- Must support Railway deployment
- Must maintain consistent UX/UI patterns throughout 