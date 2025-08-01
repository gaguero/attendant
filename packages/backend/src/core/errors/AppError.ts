/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true
  ) {
    super(message)
    
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    this.name = this.constructor.name
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  public readonly field?: string
  public readonly details?: any[]

  constructor(message: string, field?: string, details?: any[]) {
    super(message, 400, 'VALIDATION_ERROR')
    this.field = field
    this.details = details
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

/**
 * Conflict error for duplicate resources
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Unauthorized error for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

/**
 * Forbidden error for authorization failures
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR')
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  public readonly service: string

  constructor(message: string, service: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR')
    this.service = service
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends AppError {
  public readonly operation: string

  constructor(message: string, operation: string) {
    super(message, 500, 'DATABASE_ERROR', false)
    this.operation = operation
  }
}