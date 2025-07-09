// Common TypeScript types
// These will be implemented in future steps

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// User role types (Step 6)
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CONCIERGE = 'concierge',
  VIEWER = 'viewer'
}

// Common entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status types
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Placeholder for future types
export const Types = {
  // Additional types will be added as implementation progresses
} as const;

export enum GuestStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VIP = 'VIP',
  BLACKLISTED = 'BLACKLISTED',
}

export interface Guest extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
  preferences?: string;
  notes?: string;
  status: GuestStatus;
  createdById?: string;
}

export enum VendorCategory {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export interface Vendor extends BaseEntity {
  name: string;
  category: VendorCategory;
  rating: number;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  createdById: string;
} 