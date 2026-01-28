import { z } from 'zod';

export const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'REJECTED']);

export const taskSchema = z.object({
  areaId: z.string().uuid('Área inválida'),
  employeeId: z.string().uuid().optional(),
  scheduledDate: z.coerce.date(),
  status: taskStatusEnum.default('PENDING'),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const taskUpdateSchema = taskSchema.partial();

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
