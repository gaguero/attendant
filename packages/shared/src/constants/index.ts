// Shared constants across the application

// Polyfill import.meta.env for TypeScript
const metaEnv = import.meta as any;

// API Configuration
export const API_CONFIG = {
  BASE_URL: metaEnv.env?.VITE_API_BASE_URL || 'http://localhost:3000',
  VERSION: 'v1',
  TIMEOUT: 30000,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const; 