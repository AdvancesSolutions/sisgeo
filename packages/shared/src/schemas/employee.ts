import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().optional(),
  role: z.string().min(1, 'Função obrigatória'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).default('ACTIVE'),
  unitId: z.string().uuid('Unidade inválida'),
});

export const employeeUpdateSchema = employeeSchema.partial();

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
