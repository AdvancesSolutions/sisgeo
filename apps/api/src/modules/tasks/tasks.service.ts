import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Task } from '../../entities/task.entity';
import { taskSchema, taskUpdateSchema } from '@sigeo/shared';
import type { TaskInput, TaskUpdateInput } from '@sigeo/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async create(dto: TaskInput): Promise<Task> {
    const data = taskSchema.parse(dto);
    const e = this.repo.create({ id: uuid(), ...data });
    return this.repo.save(e);
  }

  async findAll(page = 1, limit = 50): Promise<{ data: Task[]; total: number; totalPages: number }> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { scheduledDate: 'DESC', createdAt: 'DESC' },
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<Task> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Tarefa não encontrada');
    return e;
  }

  async update(id: string, dto: TaskUpdateInput): Promise<Task> {
    const data = taskUpdateSchema.parse(dto);
    await this.findOne(id);
    await this.repo.update(id, data as Partial<Task>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
