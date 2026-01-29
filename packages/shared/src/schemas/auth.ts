import { z } from 'zod';

export const roleEnum = z.enum(['ADMIN', 'FUNCIONARIO']);
export type Role = z.infer<typeof roleEnum>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
});

export const rejectTaskSchema = z.object({
  comment: z.string().min(1, 'Comentário obrigatório na recusa'),
  reason: z.string().optional(),
});
export type RejectTaskInput = z.infer<typeof rejectTaskSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
