# Codebase Cleanup Analysis

## Overview
This document analyzes the current codebase to identify files and folders that are obsolete, redundant, or no longer needed after the completion of Phase 1.

## Analysis Results

### 🗑️ FILES TO REMOVE (Obsolete/Redundant)

#### Root Directory Test Files
- `test-auth-manual.js` - Manual auth testing script (obsolete, we have proper tests)
- `test-frontend-api.js` - Frontend API testing (obsolete)
- `test-registration.js` - Registration testing (obsolete)
- `test-db-connection.js` - Database connection testing (obsolete)
- `test-backend.js` - Backend testing (obsolete)
- `test-node.js` - Node.js testing (obsolete)

#### Database Check Files
- `check-db.js` - Database connection check (obsolete, we have proper Prisma setup)
- `check-prisma.js` - Prisma check (obsolete)
- `check-supabase-table.js` - Supabase table check (obsolete)
- `check-users.js` - Users table check (obsolete)
- `quick-db-check.js` - Quick database check (obsolete)

#### Backend Test Files
- `packages/backend/test-connection.js` - Connection testing (obsolete)
- `packages/backend/test-env.js` - Environment testing (obsolete)
- `packages/backend/test.sql` - Test SQL file (obsolete)

#### Documentation Files
- `project-foundation-report.md` - Outdated foundation report (Phase 1 is complete)
- `CLAUDE.md` - Old Claude documentation (obsolete)

#### SQL Files
- `create-users-table.sql` - Manual SQL (obsolete, we use Prisma migrations)
- `scripts/supabase-triggers.sql` - Supabase triggers (not implemented)
- `scripts/update-enum-migration.sql` - Enum migration (obsolete)

### 🔄 FILES TO UPDATE (Need Review/Updates)

#### Package Files
- `packages/backend/package.json` - May have unused dependencies
- `packages/frontend/package.json` - May have unused dependencies
- `packages/shared/package.json` - May have unused dependencies

#### Configuration Files
- `packages/backend/.env.example` - May need updates for Mews integration
- `packages/frontend/.env.example` - May need updates

#### Documentation
- `README.md` - May need updates to reflect current state
- `TASKS.md` - Already updated, but may need further refinement

### ✅ FILES TO KEEP (Essential)

#### Core Application Files
- All files in `packages/backend/src/` - Core application code
- All files in `packages/frontend/src/` - Frontend application code
- All files in `packages/shared/src/` - Shared types and DTOs

#### Configuration Files
- `package.json` (root) - Workspace configuration
- `pnpm-workspace.yaml` - Workspace configuration
- `pnpm-lock.yaml` - Dependency lock file
- `tsconfig.json` files - TypeScript configuration
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind configuration

#### Database Files
- `packages/backend/prisma/schema.prisma` - Database schema
- All migration files in `packages/backend/prisma/migrations/` - Database migrations

#### Memory Bank Files
- All files in `memory-bank/` - Project documentation and context

#### Essential Scripts
- `dev-start.js` - Development startup script
- `start-servers.js` - Server startup script
- `verify-build.js` - Build verification script

#### Git Files
- `.gitignore` - Git ignore rules
- `.cursor/` directory - Cursor IDE configuration

## Cleanup Plan

### Phase 1: Remove Obsolete Files
1. Remove all test files in root directory
2. Remove database check files
3. Remove obsolete documentation
4. Remove unused SQL files

### Phase 2: Update Configuration
1. Review and update package.json files
2. Update environment example files
3. Update README.md

### Phase 3: Verify Functionality
1. Test that application still builds
2. Test that all core functionality works
3. Verify documentation consistency

## Expected Benefits
- Reduced codebase size
- Improved maintainability
- Clearer project structure
- Reduced confusion for new developers
- Faster build times
- Cleaner git history 