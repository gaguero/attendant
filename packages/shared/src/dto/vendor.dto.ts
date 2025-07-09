import { z } from 'zod';
import { VendorCategory } from '../types/index.js';

export const CreateVendorDto = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().optional(),
  category: z.nativeEnum(VendorCategory).default(VendorCategory.OTHER),
  rating: z.number().min(0).max(5).default(0).optional(),
  servicesOffered: z.array(z.string()).default([]),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  website: z.string().url('Invalid URL').optional(),
  notes: z.string().optional(),
});
export type CreateVendorDto = z.infer<typeof CreateVendorDto>;

export const UpdateVendorDto = CreateVendorDto.partial();
export type UpdateVendorDto = z.infer<typeof UpdateVendorDto>; 