# Database Setup Guide

## Issue Summary

The registration is failing because the Supabase database has an old structure that doesn't match the current Prisma schema. The current schema includes:

- UUID conversion for User IDs
- Enhanced sync fields for Mews integration
- Data completeness tracking
- Business rules engine
- Audit logging

## Quick Fix Steps

### 1. Run Database Setup Script

```bash
cd packages/backend
pnpm db:setup
```

This script will:
- Generate the Prisma client
- Test database connection
- Check if migrations need to be applied
- Apply migrations if needed
- Test user creation to verify everything works

### 2. Start the Backend Server

```bash
cd packages/backend
pnpm dev
```

The backend will start on port 3003 (matching the frontend proxy configuration).

### 3. Start the Frontend

```bash
cd packages/frontend
pnpm dev
```

The frontend will start on port 5173 with proxy configuration to the backend.

### 4. Test Registration and Login

1. Navigate to `http://localhost:5173/register`
2. Create a new account
3. Test login at `http://localhost:5173/login`

## Manual Database Migration (if needed)

If the setup script doesn't work, you can manually run migrations:

```bash
cd packages/backend

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Verify setup
pnpm db:init
```

## Database Schema Overview

The current schema includes:

### User Model
- UUID primary key
- Email, firstName, lastName
- Role-based access control (ADMIN, STAFF, CONCIERGE, VIEWER)
- Password hash for authentication
- Mews sync fields (mewsId, syncedAt, syncStatus)
- Profile completeness tracking
- Contact and preference fields

### Guest Model
- Comprehensive guest profiles
- Mews integration fields
- Data completeness scoring
- VIP scoring and analytics

### Vendor Model
- Vendor management
- Service categorization
- Mews sync integration

### Supporting Models
- Password reset tokens
- Audit logs
- Mews sync logs
- Business rules engine
- Completeness configurations

## Troubleshooting

### Common Issues

1. **"relation 'users' does not exist"**
   - Run: `pnpm db:migrate`

2. **"column 'password_hash' does not exist"**
   - Run: `pnpm db:migrate`

3. **"Internal Server Error" during registration**
   - Check backend logs for specific error
   - Ensure database connection is working
   - Verify all required environment variables are set

4. **CORS errors**
   - Backend is configured to accept requests from localhost:5173
   - Check that backend is running on port 3003

### Environment Variables

Ensure these environment variables are set in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# JWT
JWT_SECRET="your-secret-key-at-least-32-characters"

# Mews (optional for now)
MEWS_CLIENT_TOKEN="..."
MEWS_ACCESS_TOKEN="..."

# Server
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Verification

After setup, you should be able to:

1. ✅ Register new users
2. ✅ Login with registered users
3. ✅ Access the dashboard
4. ✅ View user profiles
5. ✅ Manage guests and vendors

## Next Steps

Once the database is properly set up:

1. Test all authentication flows
2. Verify dashboard functionality
3. Test guest and vendor management
4. Begin Phase 3.2 development (Data Intelligence UI)

## Support

If you encounter issues:

1. Check the backend logs for detailed error messages
2. Verify database connection and schema
3. Ensure all environment variables are correctly set
4. Run the setup script to verify database state 