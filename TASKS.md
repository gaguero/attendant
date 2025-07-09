# Attendandt Implementation Tasks

## Project Foundation & Core Setup

### [✅] Step 1: Initialize Monorepo and Project Structure
(see `Technical Specifications.md` lines 45–52, 475)
Task: Set up the monorepo with pnpm workspaces. Create the basic structure for packages/frontend, packages/backend, and packages/shared.

Files:
- pnpm-workspace.yaml: Configure workspaces for frontend, backend, and shared packages.
- package.json: Root package.json with workspace management scripts.
- packages/frontend/package.json: React + Vite + TypeScript frontend setup.
- packages/backend/package.json: Node.js + Express + TypeScript backend setup.
- packages/shared/package.json: Shared types and utilities.

Step Dependencies: None.

UX/UI: A well-structured monorepo enables consistent development practices and efficient code sharing, leading to faster development cycles.

### [✅] Step 2: Supabase Project Setup and Prisma Integration
(see `Technical Specifications.md` lines 4–6, 35, 124)
Task: Create a Supabase project and integrate Prisma ORM. Set up the initial database schema with a User model.

Files:
- packages/backend/prisma/schema.prisma: Define the User model with fields like id, email, name, role, etc.
- packages/backend/src/lib/prisma.ts: Prisma client setup and configuration.
- packages/backend/src/lib/logger.ts: Winston or Pino logger configuration.
- packages/backend/src/config/index.ts: Environment configuration management.

Step Dependencies: Step 1.

UX/UI: Reliable data persistence and structured logging enable a smooth user experience by ensuring data integrity and quick issue resolution.

### [✅] Step 3: Core Backend Setup (Express, Logging, Config)
(see `Technical Specifications.md` lines 35, 122, 97, 486)
Task: Set up the core Express.js server. Implement essential middleware for body parsing and CORS. Integrate a logging library (Winston or Pino) for structured logging.

Files:
- packages/backend/src/app.ts: Initialize the Express app and apply middleware.
- packages/backend/src/server.ts: Start the HTTP server.
- packages/backend/src/lib/logger.ts: Configure and export the logger instance.
- packages/backend/src/config/index.ts: A module to safely access environment variables.

Step Dependencies: Step 1.

UX/UI: Structured logging allows for rapid debugging of issues that directly affect the user experience.

## Authentication & User Management

### [✅] Step 4: User Authentication System (JWT, Middleware)
(see `Technical Specifications.md` lines 128, 358, 401)
Task: Implement JWT-based authentication with secure token generation and validation. Create middleware for protecting routes.

Files:
- packages/backend/src/lib/auth.ts: JWT utility functions (sign, verify, refresh).
- packages/backend/src/middleware/auth.ts: Authentication middleware for protected routes.
- packages/backend/src/routes/auth.ts: Authentication routes (login, register, refresh, logout).

Step Dependencies: Steps 1, 2, 3.

UX/UI: Secure authentication ensures user data protection and enables personalized experiences.

### [✅] Step 4.1: Forgot Password Email Service
Task: Configure SMTP email (Gmail) and send real password reset emails.
Files:
- packages/backend/src/config/index.ts: Add SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`).
- packages/backend/src/lib/mailer.ts: Create a Nodemailer transport and helper to send reset emails.
- packages/backend/src/routes/auth.ts: Implement sending password reset email in `/auth/forgot-password`.

Step Dependencies: Steps 1, 2, 3, 4.

### [ ] Step 4.2: Multi-tenant Email Configuration
Task: Implement per-account (hotel, agency, channel) email settings so each can use its own SMTP credentials.
Files:
- packages/backend/src/config/index.ts or new `emailConfig` module: Load email credentials per account.
- packages/backend/src/lib/mailer.ts: Fetch the correct SMTP settings based on the account context.
Step Dependencies: Steps 1, 2, 3, 4.

### [✅] Step 5: User Management API (CRUD Operations)
(see `Technical Specifications.md` line 305)
Task: Build comprehensive user management endpoints with proper validation and error handling.

Files:
- packages/backend/src/routes/users.ts: User CRUD operations (GET, POST, PUT, DELETE).
- packages/backend/src/controllers/users.ts: User business logic and database operations.
- packages/shared/src/dto/user.dto.ts: User DTOs for request/response validation.

Step Dependencies: Steps 1, 2, 3, 4.

UX/UI: Robust user management provides reliable account operations and data consistency.

### [✅] Step 6: Frontend Authentication Setup
(see `Technical Specifications.md` lines 33, 108)
Task: Create authentication components and context for the React frontend. Implement login/register forms with validation.

Files:
- packages/frontend/src/context/AuthContext.tsx: React context for authentication state.
- packages/frontend/src/components/auth/LoginForm.tsx: Login form component.
- packages/frontend/src/components/auth/RegisterForm.tsx: Registration form component.
- packages/frontend/src/hooks/useAuth.ts: Custom hook for authentication operations.

Step Dependencies: Steps 1, 4, 5.

UX/UI: Intuitive authentication forms with clear feedback enhance user onboarding and security.

Pending Backend Subtasks:
- [ ] Extend User table (phone, address, preferences, notes, theme)
- [ ] Add audit_log table & Prisma middleware for profile updates
- [ ] Update UpdateProfileDto & new PATCH endpoints (preferences, theme)
- [ ] Rate-limit profile updates (express-rate-limit)

Pending Frontend Subtasks:
- [ ] Add Phone / Address / Notes / Preferences inputs with validation
- [ ] Sectioned layout (Personal Info, Contact, Preferences) & mobile accordions
- [ ] Optimistic profile updates with React Query
- [ ] Real-time phone validation (libphonenumber-js)
- [ ] Skeleton loaders for profile page
- [ ] Success banner after save
- [ ] Default avatar image & drag-drop crop / progress bar
- [ ] Global dark-mode support with user preference toggle

Done UI/UX Subtasks:
- [x] Redesign Profile page layout for clarity
- [x] Improve AvatarUpload drag-and-drop styling
- [x] Validate error states and helper texts
- [x] Mobile responsiveness & accessibility checks

### [✅] Step 7: Protected Routes and Role-Based Access Control
(see `Technical Specifications.md` line 405)
Task: Implement route protection on both frontend and backend. Set up role-based access control (RBAC) for different user types.

Files:
- packages/backend/src/middleware/rbac.ts: Role-based access control middleware.
- packages/frontend/src/components/auth/ProtectedRoute.tsx: Route protection component.
- packages/frontend/src/hooks/usePermissions.ts: Permission checking hook.

Step Dependencies: Steps 1, 4, 5, 6.

UX/UI: Proper access control ensures users see only relevant content and functionality.

### [🟡] Step 8: User Profile Management
(see `Technical Specifications.md` lines 60, 138, 338)
Task: Create user profile components and API endpoints for profile updates, including avatar upload.

Files:
- packages/backend/src/routes/profile.ts: Profile management endpoints.
- packages/frontend/src/components/profile/ProfileForm.tsx: Profile editing form.
- packages/frontend/src/components/profile/AvatarUpload.tsx: Avatar upload component.

Step Dependencies: Steps 1, 4, 5, 6, 7.

UX/UI: User-friendly profile management enhances personalization and user engagement.

Pending Backend Subtasks:
- [ ] Extend User table (phone, address, preferences, notes, theme)
- [ ] Add audit_log table & Prisma middleware for profile updates
- [ ] Update UpdateProfileDto & new PATCH endpoints (preferences, theme)
- [ ] Rate-limit profile updates (express-rate-limit)

Pending Frontend Subtasks:
- [ ] Add Phone / Address / Notes / Preferences inputs with validation
- [ ] Sectioned layout (Personal Info, Contact, Preferences) & mobile accordions
- [ ] Optimistic profile updates with React Query
- [ ] Real-time phone validation (libphonenumber-js)
- [ ] Skeleton loaders for profile page
- [ ] Success banner after save
- [ ] Default avatar image & drag-drop crop / progress bar
- [ ] Global dark-mode support with user preference toggle

Done UI/UX Subtasks:
- [x] Redesign Profile page layout for clarity
- [x] Improve AvatarUpload drag-and-drop styling
- [x] Validate error states and helper texts
- [x] Mobile responsiveness & accessibility checks

## Guest Profile Management

### [✅] Step 9: Guest Profile Database Schema
(see `Technical Specifications.md` line 309)
Task: Design and implement the guest profile database schema with comprehensive fields for hospitality management.

Files:
- packages/backend/prisma/schema.prisma: Guest model with profile fields, preferences, and relationships.
- packages/backend/prisma/migrations/: Database migration files.
- packages/shared/src/dto/guest.dto.ts: Guest DTOs for validation.

Step Dependencies: Steps 1, 2.

UX/UI: Comprehensive guest profiles enable personalized service and better guest satisfaction.

### [🟡] Step 10: Guest Profile API and Components
(see `Technical Specifications.md` lines 184–192)
Task: Build guest profile CRUD operations and React components for managing guest information.

Files:
- packages/backend/src/routes/guests.ts: Guest profile endpoints.
- packages/backend/src/controllers/guests.ts: Guest business logic.
- packages/frontend/src/components/guests/GuestForm.tsx: Guest profile form.
- packages/frontend/src/components/guests/GuestList.tsx: Guest listing component.

Step Dependencies: Steps 1, 4, 5, 6, 7, 9.

UX/UI: Efficient guest management interface improves staff productivity and guest service quality.

Pending UI Design Subtasks:
- [ ] Implement table/grid view for GuestList with sorting & filters
- [ ] Style GuestForm with step-wise sections
- [ ] Add toast notifications for CRUD actions
- [ ] Ensure responsive layout and keyboard navigation

## Vendor & Concierge Services

### [🟡] Step 11: Vendor Management System
(see `Technical Specifications.md` line 321)
Task: Create vendor database schema and management interface for service providers.

Files:
- packages/backend/prisma/schema.prisma: Vendor model with service categories and ratings.
- packages/backend/src/routes/vendors.ts: Vendor CRUD endpoints.
- packages/frontend/src/components/vendors/VendorForm.tsx: Vendor management form.
- packages/frontend/src/components/vendors/VendorDirectory.tsx: Vendor directory component.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7.

UX/UI: Organized vendor management enables efficient service coordination and quality control.

Pending UI Design Subtasks:
- [ ] Create card/grid view for VendorDirectory with category badges
- [ ] Enhance VendorForm with grouped inputs and validation hints
- [ ] Add search & filter UI components
- [ ] Mobile & accessibility polish

### [ ] Step 12: Service Request System
(see `Technical Specifications.md` lines 315, 221–227)
Task: Implement service request workflow with status tracking and notifications.

Files:
- packages/backend/prisma/schema.prisma: ServiceRequest model with status and tracking.
- packages/backend/src/routes/requests.ts: Service request endpoints.
- packages/frontend/src/components/requests/RequestForm.tsx: Service request form.
- packages/frontend/src/components/requests/RequestTracker.tsx: Request tracking component.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7, 11.

UX/UI: Clear request tracking and status updates improve guest satisfaction and staff efficiency.

### [ ] Step 13: Concierge Dashboard
(see `Technical Specifications.md` lines 194, 461)
Task: Build a comprehensive dashboard for concierge staff to manage requests and guest services.

Files:
- packages/frontend/src/components/dashboard/ConciergeMain.tsx: Main dashboard component.
- packages/frontend/src/components/dashboard/RequestQueue.tsx: Request queue management.
- packages/frontend/src/components/dashboard/GuestOverview.tsx: Guest information overview.
- packages/frontend/src/hooks/useDashboard.ts: Dashboard data management hook.

Step Dependencies: Steps 1, 4, 5, 6, 7, 10, 11, 12.

UX/UI: Intuitive dashboard design enhances staff productivity and service quality.

### [ ] Step 14: Communication System
(see `Technical Specifications.md` lines 20, 39, 62)
Task: Implement real-time communication between guests, staff, and vendors.

Files:
- packages/backend/src/lib/websocket.ts: WebSocket server setup.
- packages/backend/src/routes/messages.ts: Message endpoints.
- packages/frontend/src/components/chat/ChatInterface.tsx: Chat component.
- packages/frontend/src/hooks/useWebSocket.ts: WebSocket connection hook.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7, 11, 12.

UX/UI: Real-time communication improves response times and guest satisfaction.

## Data Ingestion, Discrepancy & Optimization

### [ ] Step 15: Data Import/Export System
(see `Technical Specifications.md` lines 327, 277–285)
Task: Create tools for importing guest data from various sources and exporting reports.

Files:
- packages/backend/src/routes/import.ts: Data import endpoints.
- packages/backend/src/lib/importers/: Data import utilities for different formats.
- packages/frontend/src/components/import/ImportWizard.tsx: Import wizard component.
- packages/backend/src/lib/exporters/: Report generation utilities.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7, 9, 10.

UX/UI: Streamlined data import/export processes reduce manual work and improve accuracy.

### [ ] Step 16: Data Validation and Discrepancy Detection
(see `Technical Specifications.md` lines 287, 331, 299–301, 467)
Task: Implement automated data validation and discrepancy detection with reporting.

Files:
- packages/backend/src/lib/validators/: Data validation utilities.
- packages/backend/src/routes/validation.ts: Validation endpoints.
- packages/frontend/src/components/validation/DiscrepancyReport.tsx: Discrepancy reporting component.
- packages/backend/src/jobs/dataValidation.ts: Background validation jobs.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7, 9, 10, 15.

UX/UI: Automated validation reduces errors and improves data quality for better decision-making.

### [ ] Step 17: Analytics and Reporting
(see `Technical Specifications.md` line 97)
Task: Build analytics dashboard with key metrics and customizable reports.

Files:
- packages/backend/src/routes/analytics.ts: Analytics endpoints.
- packages/backend/src/lib/analytics/: Analytics calculation utilities.
- packages/frontend/src/components/analytics/Dashboard.tsx: Analytics dashboard.
- packages/frontend/src/components/reports/ReportBuilder.tsx: Custom report builder.

Step Dependencies: Steps 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 15, 16.

UX/UI: Clear analytics and reporting help stakeholders make informed decisions.

### [ ] Step 18: Performance Optimization and Caching
(see `Technical Specifications.md` lines 106, 140, 340–342, 344)
Task: Implement Redis caching and database query optimization for better performance.

Files:
- packages/backend/src/lib/redis.ts: Redis client setup and caching utilities.
- packages/backend/src/middleware/cache.ts: Caching middleware.
- packages/backend/src/lib/queryOptimizer.ts: Database query optimization utilities.
- packages/backend/src/config/cache.ts: Cache configuration.

Step Dependencies: Steps 1, 2, 3, 4, 5.

UX/UI: Improved performance ensures fast response times and better user experience.

## Finalization & Deployment

### [ ] Step 19: Testing and Quality Assurance
(see `Technical Specifications.md` lines 35, 114, 132)
Task: Implement comprehensive testing suite including unit, integration, and end-to-end tests.

Files:
- packages/backend/src/__tests__/: Backend test suites.
- packages/frontend/src/__tests__/: Frontend test suites.
- packages/shared/src/__tests__/: Shared utilities tests.
- cypress/: End-to-end test configurations.

Step Dependencies: All previous steps.

UX/UI: Thorough testing ensures reliability and prevents user-facing bugs.

### [ ] Step 20: Deployment and Documentation
(see `Technical Specifications.md` lines 41, 87, 477–478, 486)
Task: Set up deployment pipeline and create comprehensive documentation.

Files:
- Dockerfile: Container configuration.
- docker-compose.yml: Development environment setup.
- railway.json: Railway deployment configuration.
- docs/: API documentation and user guides.

Step Dependencies: All previous steps.

UX/UI: Proper deployment and documentation ensure smooth operations and user adoption.