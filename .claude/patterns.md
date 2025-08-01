# Development Patterns & Standards

## Code Organization Patterns

### Service Layer Architecture
```typescript
// Interface-first design
interface IUserService {
  createUser(data: CreateUserDto): Promise<User>
  getUserById(id: string): Promise<User | null>
  updateUser(id: string, data: UpdateUserDto): Promise<User>
  deleteUser(id: string): Promise<void>
}

// Implementation with dependency injection
class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger,
    private cache: ICache
  ) {}
}
```

### Repository Pattern
```typescript
// Repository interface for data access
interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}

// Prisma implementation
class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
}
```

### Error Handling Strategy
```typescript
// Custom exception hierarchy
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
  }
}

class ValidationError extends AppError {
  constructor(message: string, public field: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}
```

## API Design Patterns

### Consistent Response Structure
```typescript
// Success response
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
  }
}

// Error response
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: ValidationError[]
  }
  meta: {
    timestamp: string
    requestId: string
  }
}
```

### Route Organization
```typescript
// routes/v1/users.ts
const router = express.Router()

// Middleware stack pattern
router.use(authenticateToken)
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// Route handlers with dependency injection
router.get('/', 
  validateQuery(GetUsersQuery),
  asyncHandler(userController.getUsers.bind(userController))
)

router.post('/',
  requireRole(['ADMIN']),
  validateBody(CreateUserDto),
  asyncHandler(userController.createUser.bind(userController))
)
```

## Database Patterns

### Prisma Schema Conventions
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  role      UserRole @default(STAFF)
  
  // Audit fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relationships
  createdGuests Guest[] @relation("CreatedBy")
  
  @@map("users")
}
```

### Query Optimization Patterns
```typescript
// Selective field loading
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    createdAt: true
  }
})

// Batch operations
const users = await prisma.user.findMany({
  where: { role: 'STAFF' },
  include: {
    _count: {
      select: { createdGuests: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: offset
})
```

## Testing Patterns

### Unit Test Structure
```typescript
describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockLogger: jest.Mocked<ILogger>

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    mockLogger = createMockLogger()
    userService = new UserService(mockUserRepository, mockLogger)
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', role: 'STAFF' }
      mockUserRepository.create.mockResolvedValue(mockUser)

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result).toEqual(mockUser)
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData)
    })
  })
})
```

### Integration Test Patterns
```typescript
describe('POST /api/v1/users', () => {
  beforeEach(async () => {
    await testDb.reset()
  })

  it('should create user with admin role', async () => {
    const adminToken = await generateTestToken('ADMIN')
    
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'newuser@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STAFF'
      })
      .expect(201)

    expect(response.body.data.email).toBe('newuser@example.com')
  })
})
```

## Performance Patterns

### Caching Strategy
```typescript
// Service-level caching
class UserService {
  async getUserById(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.cache.get(`user:${id}`)
    if (cached) return JSON.parse(cached)

    // Fallback to database
    const user = await this.userRepository.findById(id)
    if (user) {
      await this.cache.setex(`user:${id}`, 300, JSON.stringify(user))
    }
    
    return user
  }
}
```

### Background Job Patterns
```typescript
// Job processor
export class EmailJobProcessor {
  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, body, template } = job.data
    
    try {
      await this.emailService.send({ to, subject, body, template })
      this.logger.info('Email sent successfully', { jobId: job.id, to })
    } catch (error) {
      this.logger.error('Email send failed', { jobId: job.id, error })
      throw error
    }
  }
}

// Job creation
await emailQueue.add('send-welcome-email', {
  to: user.email,
  template: 'welcome',
  data: { userName: user.firstName }
}, {
  delay: 1000,
  attempts: 3,
  backoff: 'exponential'
})
```

## Security Patterns

### Input Validation
```typescript
// Zod schema validation
export const CreateUserDto = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name required').optional(),
  lastName: z.string().min(1, 'Last name required').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'CONCIERGE']).default('STAFF')
})

// Middleware usage
const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors
          }
        })
      }
      next(error)
    }
  }
}
```

### Authentication Middleware
```typescript
// JWT validation with proper error handling
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid token')
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    // Check token blacklist
    if (await isTokenBlacklisted(token)) {
      throw new UnauthorizedError('Token has been revoked')
    }

    req.user = payload
    next()
  } catch (error) {
    next(error)
  }
}
```