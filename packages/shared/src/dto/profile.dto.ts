import { z } from 'zod';

export const UpdateProfileDto = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  notes: z.string().optional(),
  theme: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>;

export const ProfileDto = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  phone: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  stateOrProvince: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  preferences: z.record(z.any()).nullable(),
  notes: z.string().nullable(),
  theme: z.string().nullable(),
});

export type ProfileDto = z.infer<typeof ProfileDto>; 