import { z } from 'zod';

export const timeClockSchema = z.object({
  type: z.enum(['CHECKIN', 'CHECKOUT']),
  employeeId: z.string().uuid().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type TimeClockInput = z.infer<typeof timeClockSchema>;
