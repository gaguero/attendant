# System Patterns: Attendandt Architecture

## Overall Architecture

### Monorepo Structure
```
Attendandt/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript
│   ├── backend/           # Node.js + Express + TypeScript  
│   └── shared/            # Shared types, DTOs, constants
├── memory-bank/           # AI agent context and documentation
└── pnpm-workspace.yaml    # Workspace configuration
```

## Backend Architecture Patterns

### 1. Express Application Structure
**File**: `packages/backend/src/app.ts`

**Pattern**: Modular Express App with Middleware Stack
```typescript
// Layered middleware approach
app.use(helmet({ ... }))     // Security first
app.use(cors({ ... }))       // Cross-origin handling
app.use(morgan(...))         // Request logging
app.use(express.json())      // Body parsing
app.use('/api/v1/auth', authRoutes)  // Route mounting
app.use(notFoundHandler)     // 404 handling
app.use(errorHandler)        // Global error handling
```

**Key Decisions**:
- Security-first middleware ordering
- Environment-aware CORS configuration
- Structured request/response logging
- Centralized error handling

### 2. Authentication System Architecture
**Files**: 
- `packages/backend/src/lib/auth.ts` - JWT utilities
- `packages/backend/src/middleware/auth.ts` - Auth middleware
- `packages/backend/src/routes/auth.ts` - Auth endpoints

**Pattern**: JWT with Refresh Token Strategy
```typescript
// Token Strategy
Access Token:  15 minutes (short-lived, frequent refresh)
Refresh Token: 7 days (stored securely, rotated on use)
Token Blacklist: In-memory Set (Redis in production)

// Middleware Pattern
requireAuth()    → Verify token, add user context
optionalAuth()   → Add user context if token present
requireRole()    → Check user role authorization
```

**Security Patterns**:
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Signing**: HS256 with 256-bit secret
- **Token Blacklisting**: Secure logout implementation
- **Role-Based Access**: Middleware-based authorization

### 3. Database Integration Pattern
**File**: `packages/backend/src/lib/prisma.ts`

**Pattern**: Singleton with Connection Management
```typescript
// Singleton pattern with proper cleanup
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Graceful shutdown handling
process.on('beforeExit', () => prisma.$disconnect())
```

### 4. Configuration Management
**File**: `packages/backend/src/config/index.ts`

**Pattern**: Zod-based Environment Validation
```typescript
// Runtime validation with type safety
const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... other environment variables
})

export const config = configSchema.parse(process.env)
```

### 5. Logging Strategy
**File**: `packages/backend/src/lib/logger.ts`

**Pattern**: Winston with Multiple Transports
```typescript
// Structured logging with multiple outputs
winston.createLogger({
  transports: [
    new winston.transports.Console(),     // Development
    new winston.transports.File(),        // Production logs
  ]
})
```

### 6. Error Handling Pattern
**Implementation**: Global error middleware in `app.ts`

**Pattern**: Centralized Error Processing
```typescript
// Environment-aware error exposure
if (config.NODE_ENV === 'development') {
  return res.status(500).json({ error: err.message, stack: err.stack })
} else {
  return res.status(500).json({ error: 'Internal Server Error' })
}
```

## Frontend Architecture Patterns

### 1. Vite + React + TypeScript Setup
**Package**: `packages/frontend/`

**Pattern**: Modern React Development Stack
- **Build Tool**: Vite for fast development and building
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (planned)
- **State Management**: Zustand (planned)

## Shared Package Patterns

### 1. DTO (Data Transfer Object) Pattern
**Files**: `packages/shared/src/dto/`

**Pattern**: Zod-based Validation Schemas
```typescript
// Shared validation between frontend and backend
export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginDto = z.infer<typeof LoginDto>
```

**Benefits**:
- Type safety across frontend/backend boundary
- Runtime validation with descriptive errors
- Single source of truth for data structures

### 2. Type Definition Pattern
**File**: `packages/shared/src/types/index.ts`

**Pattern**: Central Type Definitions
```typescript
// Shared enums and types
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', 
  STAFF = 'STAFF'
}

// Database model extensions
export type UserWithoutPassword = Omit<User, 'password'>
```

## Security Patterns

### 1. Authentication Flow
```
1. User registers/logs in → Backend validates credentials
2. Backend generates JWT pair → Access (15m) + Refresh (7d)
3. Frontend stores tokens → Secure storage strategy
4. API requests include token → Authorization header
5. Middleware validates token → Adds user context to request
6. Token refresh on expiry → Seamless user experience
7. Logout blacklists tokens → Secure session termination
```

### 2. Authorization Patterns
**Role-Based Access Control (RBAC)**:
```typescript
// Route protection patterns
router.get('/admin', requireRole('ADMIN'), handler)
router.get('/staff', requireAuth, handler)
router.get('/public', optionalAuth, handler)

// Middleware chaining for complex authorization
router.put('/users/:id', 
  requireAuth, 
  requireRole(['ADMIN', 'MANAGER']), 
  handler
)
```

### 3. Input Validation Strategy
**Pattern**: Multi-layer Validation
1. **Frontend**: Form validation with Zod schemas
2. **Backend**: Request validation with same Zod schemas
3. **Database**: Prisma schema constraints
4. **Runtime**: Environment variable validation

## Data Patterns

### 1. Database Schema Design
**File**: `packages/backend/prisma/schema.prisma`

**Pattern**: Normalized Relational Design
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Patterns Applied**:
- CUID for primary keys (collision-resistant)
- Enum types for constrained values
- Timestamp tracking (createdAt/updatedAt)
- Unique constraints for business logic

### 2. Migration Strategy
**Pattern**: Version-controlled Schema Evolution
- Prisma migrations for database schema changes
- Forward-only migration strategy
- Environment-specific migration application

## Development Patterns

### 1. Package Management
**Tool**: pnpm with workspaces
**Pattern**: Monorepo with shared dependencies
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**Benefits**:
- Shared dependencies across packages
- Faster installs with pnpm
- Type safety across package boundaries

### 2. Development Workflow
**Pattern**: Hot Reload Development
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Environment Management
**Pattern**: Example-based Configuration
- `env.example` with placeholder/correct values
- Manual `.env` file creation for local development
- Environment validation on application startup

## API Design Patterns

### 1. RESTful Endpoint Structure
**Pattern**: Consistent REST API Design
```
Authentication:
POST   /api/v1/auth/register    # User registration
POST   /api/v1/auth/login       # User login
POST   /api/v1/auth/refresh     # Token refresh
POST   /api/v1/auth/logout      # Secure logout
GET    /api/v1/auth/profile     # Current user profile
POST   /api/v1/auth/change-password  # Password change

User Management (Planned):
GET    /api/v1/users            # List users (admin)
GET    /api/v1/users/:id        # Get user details
PUT    /api/v1/users/:id        # Update user
DELETE /api/v1/users/:id        # Delete user
```

### 2. Response Structure Pattern
**Pattern**: Consistent API Responses
```typescript
// Success Response
{
  success: true,
  data: { ... },
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: ValidationError[]
}

// Authentication Response
{
  user: UserWithoutPassword,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
}
```

## Testing Patterns (Planned)

### 1. Unit Testing Strategy
- **Backend**: Jest with Prisma mocking
- **Frontend**: Vitest with React Testing Library
- **Shared**: DTO validation testing

### 2. Integration Testing
- **API Testing**: Supertest for endpoint testing
- **Database Testing**: Test database with migrations
- **Authentication Testing**: Token flow validation

## Deployment Patterns (Planned)

### 1. Containerization Strategy
- **Backend**: Node.js Alpine Docker image
- **Database**: Supabase PostgreSQL (managed)
- **Frontend**: Static build with CDN deployment

### 2. Environment Strategy
- **Development**: Local with Docker Compose
- **Staging**: Railway with Supabase
- **Production**: Railway with optimized builds

## Key Architectural Decisions

1. **Monorepo Structure**: Enables code sharing while maintaining separation of concerns
2. **JWT Authentication**: Stateless authentication with refresh token strategy for security
3. **Role-Based Authorization**: Flexible permission system using middleware functions
4. **Zod Validation**: Runtime type safety with descriptive error messages
5. **Prisma ORM**: Type-safe database access with migration management
6. **Winston Logging**: Structured logging for debugging and monitoring
7. **Environment Validation**: Fail-fast configuration with runtime validation
8. **Express Middleware**: Layered approach to request processing and security 