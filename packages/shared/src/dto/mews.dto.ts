// packages/shared/src/dto/mews.dto.ts
import { z } from 'zod';

export const MewsReservationSchema = z.object({
  id: z.string(),
  // Add other reservation fields here
});

export const MewsCustomerSchema = z.object({
  id: z.string(),
  // Add other customer fields here
});

export const MewsServiceSchema = z.object({
  id: z.string(),
  // Add other service fields here
});

export type MewsReservation = z.infer<typeof MewsReservationSchema>;
export type MewsCustomer = z.infer<typeof MewsCustomerSchema>;
export type MewsService = z.infer<typeof MewsServiceSchema>;
