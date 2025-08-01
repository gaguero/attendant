import type { Guest, GuestStatus } from '@attendandt/shared'
import type { PaginationOptions, PaginatedResult, ServiceContext } from '../common.js'

export interface CreateGuestData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: Date
  addressLine1?: string
  addressLine2?: string
  city?: string
  stateOrProvince?: string
  postalCode?: string
  country?: string
  preferences?: any
  notes?: string
  status?: GuestStatus
}

export interface UpdateGuestData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: Date
  addressLine1?: string
  addressLine2?: string
  city?: string
  stateOrProvince?: string
  postalCode?: string
  country?: string
  preferences?: any
  notes?: string
  status?: GuestStatus
}

export interface GuestFilters {
  status?: GuestStatus
  search?: string
  createdById?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export interface GuestServiceResult<T = Guest> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface IGuestService {
  // Core CRUD operations
  getGuestById(id: string, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  getGuestByEmail(email: string, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  getGuests(filters: GuestFilters, pagination: PaginationOptions, context: ServiceContext): Promise<GuestServiceResult<PaginatedResult<Guest>>>
  
  // Business operations
  createGuest(data: CreateGuestData, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  updateGuest(id: string, data: UpdateGuestData, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  deleteGuest(id: string, context: ServiceContext): Promise<GuestServiceResult<void>>
  
  // Business logic methods
  promoteToVIP(id: string, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  blacklistGuest(id: string, reason: string, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  reactivateGuest(id: string, context: ServiceContext): Promise<GuestServiceResult<Guest>>
  
  // Analytics and reporting
  getGuestStats(filters?: GuestFilters): Promise<{
    totalGuests: number
    activeGuests: number
    vipGuests: number
    newGuestsThisMonth: number
  }>
  
  // Validation
  validateGuestData(data: Partial<CreateGuestData | UpdateGuestData>): Promise<{ isValid: boolean; errors?: string[] }>
}