import type { User, UserRole } from '@attendandt/shared'
import type { PaginationOptions, PaginatedResult, ServiceContext, TransactionContext } from '../common.js'
import type { CreateUserData, UpdateUserData, UserFilters } from '../repositories/IUserRepository.js'

export interface UserServiceResult<T = User> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface IUserService {
  // Core CRUD operations
  getUserById(id: string, context: ServiceContext): Promise<UserServiceResult<User>>
  getUserByEmail(email: string, context: ServiceContext): Promise<UserServiceResult<User>>
  getUsers(filters: UserFilters, pagination: PaginationOptions, context: ServiceContext): Promise<UserServiceResult<PaginatedResult<User>>>
  
  // Business operations
  createUser(data: CreateUserData, context: ServiceContext): Promise<UserServiceResult<User>>
  updateUser(id: string, data: UpdateUserData, context: ServiceContext): Promise<UserServiceResult<User>>
  deleteUser(id: string, context: ServiceContext): Promise<UserServiceResult<void>>
  
  // Business logic methods
  resetUserPassword(id: string, newPassword: string, context: ServiceContext): Promise<UserServiceResult<void>>
  promoteUser(id: string, newRole: UserRole, context: ServiceContext): Promise<UserServiceResult<User>>
  deactivateUser(id: string, context: ServiceContext): Promise<UserServiceResult<User>>
  
  // Authorization helpers
  canUserAccessProfile(requestingUserId: string, targetUserId: string, userRole: UserRole): boolean
  canUserManageUser(requestingUserRole: UserRole, targetUserRole: UserRole): boolean
  
  // Validation
  validateUserData(data: Partial<CreateUserData | UpdateUserData>): Promise<{ isValid: boolean; errors?: string[] }>
}