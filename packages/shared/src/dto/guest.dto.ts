import { z } from 'zod';
import { GuestStatus } from '../types/index.js';

export const CreateGuestDto = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  stateOrProvince: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  externalBookingIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(GuestStatus).default(GuestStatus.ACTIVE).optional(),
});
export type CreateGuestDto = z.infer<typeof CreateGuestDto>;

export const UpdateGuestDto = CreateGuestDto.partial();
export type UpdateGuestDto = z.infer<typeof UpdateGuestDto>; 