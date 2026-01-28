import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TimeClock } from '../../entities/time-clock.entity';
import { timeClockSchema } from '@sigeo/shared';
import type { TimeClockInput } from '@sigeo/shared';

@Injectable()
export class TimeClockService {
  constructor(
    @InjectRepository(TimeClock)
    private readonly repo: Repository<TimeClock>,
  ) {}

  async register(employeeId: string, dto: Omit<TimeClockInput, 'type'> & { type: 'CHECKIN' | 'CHECKOUT' }): Promise<TimeClock> {
    const data = timeClockSchema.parse({ ...dto, type: dto.type });
    const e = this.repo.create({
      id: uuid(),
      employeeId,
      type: data.type,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
    });
    return this.repo.save(e);
  }

  async findByEmployee(employeeId: string, limit = 50): Promise<TimeClock[]> {
    return this.repo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
