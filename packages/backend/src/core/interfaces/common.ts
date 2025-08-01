/**
 * Common interfaces for pagination and filtering
 */

export interface PaginationOptions {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface BaseFilters {
  search?: string
  createdAfter?: Date
  createdBefore?: Date
  updatedAfter?: Date
  updatedBefore?: Date
}

/**
 * Common repository patterns
 */
export interface BaseRepository<T, CreateData, UpdateData, Filters = BaseFilters> {
  findById(id: string): Promise<T | null>
  findMany(filters?: Filters, pagination?: PaginationOptions, sort?: SortOptions[]): Promise<PaginatedResult<T>>
  create(data: CreateData): Promise<T>
  update(id: string, data: UpdateData): Promise<T>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
  count(filters?: Filters): Promise<number>
}

/**
 * Service context for request handling
 */
export interface ServiceContext {
  userId?: string
  userRole?: string
  userEmail?: string
  requestId: string
  timestamp: Date
}

/**
 * Transaction context for database operations
 */
export interface TransactionContext {
  userId?: string
  userRole?: string
  requestId: string
  timestamp: Date
}