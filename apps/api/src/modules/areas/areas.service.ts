import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Area } from '../../entities/area.entity';
import { areaSchema, areaUpdateSchema } from '@sigeo/shared';
import type { AreaInput, AreaUpdateInput } from '@sigeo/shared';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly repo: Repository<Area>,
  ) {}

  async create(dto: AreaInput): Promise<Area> {
    const data = areaSchema.parse(dto);
    const e = this.repo.create({ id: uuid(), ...data });
    return this.repo.save(e);
  }

  async findAll(page = 1, limit = 50): Promise<{ data: Area[]; total: number; totalPages: number }> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, totalPages };
  }

  async findByLocation(locationId: string): Promise<Area[]> {
    return this.repo.find({ where: { locationId }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Area> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Área não encontrada');
    return e;
  }

  async update(id: string, dto: AreaUpdateInput): Promise<Area> {
    const data = areaUpdateSchema.parse(dto);
    await this.findOne(id);
    await this.repo.update(id, data as Partial<Area>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
