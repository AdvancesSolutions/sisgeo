import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Employee } from '../../entities/employee.entity';
import { employeeSchema, employeeUpdateSchema } from '@sigeo/shared';
import type { EmployeeInput, EmployeeUpdateInput } from '@sigeo/shared';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async create(dto: EmployeeInput): Promise<Employee> {
    const data = employeeSchema.parse(dto);
    const e = this.repo.create({ id: uuid(), ...data });
    return this.repo.save(e);
  }

  async findAll(page = 1, limit = 50): Promise<{ data: Employee[]; total: number; totalPages: number }> {
    const [data, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<Employee> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Funcionário não encontrado');
    return e;
  }

  async update(id: string, dto: EmployeeUpdateInput): Promise<Employee> {
    const data = employeeUpdateSchema.parse(dto);
    await this.findOne(id);
    await this.repo.update(id, data as Partial<Employee>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
