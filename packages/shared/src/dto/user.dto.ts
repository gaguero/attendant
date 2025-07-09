import { z } from 'zod';
import { UserRole } from '../types/index.js';

// User creation DTO
export const CreateUserDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF),
  authId: z.string().uuid().optional(), // Supabase Auth ID, optional
});

// User update DTO
export const UpdateUserDto = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  authId: z.string().uuid().optional(),
});

// User response DTO
export const UserResponseDto = z.object({
  id: z.string().uuid(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.nativeEnum(UserRole),
  authId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User list query DTO
export const UserListQueryDto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().max(255).optional(),
});

// Type exports
export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
export type UserResponseDto = z.infer<typeof UserResponseDto>;
export type UserListQueryDto = z.infer<typeof UserListQueryDto>; 