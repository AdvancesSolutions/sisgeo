import { z } from 'zod';

export const areaSchema = z.object({
  locationId: z.string().uuid('Local inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
});

export const areaUpdateSchema = areaSchema.partial().omit({ locationId: true });

export type AreaInput = z.infer<typeof areaSchema>;
export type AreaUpdateInput = z.infer<typeof areaUpdateSchema>;
