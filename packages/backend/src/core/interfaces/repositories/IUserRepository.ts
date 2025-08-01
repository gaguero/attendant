import type { User, UserRole } from '@attendandt/shared'
import type { PaginationOptions, PaginatedResult } from '../common.js'

export interface CreateUserData {
  email: string
  firstName?: string | null
  lastName?: string | null
  role?: UserRole
  authId?: string | null
  passwordHash?: string | null
}

export interface UpdateUserData {
  email?: string
  firstName?: string | null
  lastName?: string | null
  role?: UserRole
  authId?: string | null
  passwordHash?: string | null
}

export interface UserFilters {
  role?: UserRole
  search?: string
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByAuthId(authId: string): Promise<User | null>
  findMany(filters?: UserFilters, pagination?: PaginationOptions): Promise<PaginatedResult<User>>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
  count(filters?: UserFilters): Promise<number>
}