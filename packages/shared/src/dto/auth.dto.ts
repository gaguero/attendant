import { z } from 'zod';
import { UserRole } from '../types/index.js';

// Login DTO
export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
});

// Register DTO
export const RegisterDto = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.nativeEnum(UserRole).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Token refresh DTO
export const RefreshTokenDto = z.object({
  refreshToken: z.string(),
});

// Change password DTO
export const ChangePasswordDto = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Auth response DTO
export const AuthResponseDto = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    role: z.nativeEnum(UserRole),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
  }),
});

// JWT payload DTO
export const JwtPayloadDto = z.object({
  userId: z.string().uuid(),
  email: z.string(),
  role: z.nativeEnum(UserRole),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Add ForgotPasswordDto for forgot-password endpoint
export const ForgotPasswordDto = z.object({
  email: z.string().email('Invalid email format'),
});

// Add ResetPasswordDto for reset-password endpoint
export const ResetPasswordDto = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type LoginDto = z.infer<typeof LoginDto>;
export type RegisterDto = z.infer<typeof RegisterDto>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>;
export type AuthResponseDto = z.infer<typeof AuthResponseDto>;
export type JwtPayloadDto = z.infer<typeof JwtPayloadDto>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>; 