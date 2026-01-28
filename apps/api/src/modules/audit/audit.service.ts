import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    const sanitized = payload ? this.sanitize(payload) : undefined;
    const e = this.repo.create({
      id: uuid(),
      userId,
      action,
      entity,
      entityId: entityId ?? null,
      payload: sanitized ?? null,
    });
    await this.repo.save(e);
  }

  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const skip = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
    for (const [k, v] of Object.entries(obj)) {
      if (skip.some((s) => k.toLowerCase().includes(s))) continue;
      if (v != null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        out[k] = this.sanitize(v as Record<string, unknown>);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  async findAll(
    page = 1,
    limit = 50,
  ): Promise<{ data: AuditLog[]; total: number; totalPages: number }> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, totalPages };
  }
}
