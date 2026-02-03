import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Task } from '../../entities/task.entity';
import { TaskPhoto } from '../../entities/task-photo.entity';
import { Area } from '../../entities/area.entity';
import { Employee } from '../../entities/employee.entity';
import { taskSchema, taskUpdateSchema, rejectTaskSchema } from '@sigeo/shared';
import type { TaskInput, TaskUpdateInput, RejectTaskInput } from '@sigeo/shared';
import { AuditService } from '../audit/audit.service';

/** Mínimo de fotos por tipo para enviar tarefa para validação (IN_REVIEW). Regra T5/F4. */
const MIN_PHOTOS_BEFORE = 1;
const MIN_PHOTOS_AFTER = 1;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
    @InjectRepository(TaskPhoto)
    private readonly photoRepo: Repository<TaskPhoto>,
    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly audit: AuditService,
  ) {}

  async create(dto: TaskInput): Promise<Task> {
    const data = taskSchema.parse(dto);
    await this.validateAreaExists(data.areaId);
    if (data.employeeId) await this.validateEmployeeActive(data.employeeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.scheduledDate < today) {
      throw new BadRequestException('Data agendada não pode ser no passado');
    }
    const e = this.repo.create({ id: uuid(), ...data });
    return this.repo.save(e);
  }

  private async validateAreaExists(areaId: string): Promise<void> {
    const area = await this.areaRepo.findOne({ where: { id: areaId } });
    if (!area) throw new BadRequestException('Área não encontrada');
  }

  /** Regra T7: funcionário atribuído à tarefa deve existir e estar ACTIVE. */
  private async validateEmployeeActive(employeeId: string): Promise<void> {
    const emp = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!emp) throw new BadRequestException('Funcionário não encontrado');
    if (emp.status !== 'ACTIVE') {
      throw new BadRequestException('Só é possível atribuir tarefa a funcionário com status ACTIVE');
    }
  }

  async findAll(
    page = 1,
    limit = 50,
    filters?: { status?: string; employeeId?: string },
  ): Promise<{ data: Task[]; total: number; totalPages: number }> {
    const qb = this.repo.createQueryBuilder('t');
    if (filters?.status) qb.andWhere('t.status = :status', { status: filters.status });
    if (filters?.employeeId) qb.andWhere('t.employee_id = :employeeId', { employeeId: filters.employeeId });
    qb.orderBy('t.scheduled_date', 'DESC').addOrderBy('t.created_at', 'DESC');
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, totalPages };
  }

  async findOne(id: string): Promise<Task> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Tarefa não encontrada');
    return e;
  }

  async findOneWithPhotos(id: string): Promise<Task & { photos?: TaskPhoto[] }> {
    const task = await this.findOne(id);
    const photos = await this.photoRepo.find({ where: { taskId: id }, order: { type: 'ASC', createdAt: 'DESC' } });
    return { ...task, photos };
  }

  async getPhotos(taskId: string): Promise<TaskPhoto[]> {
    return this.photoRepo.find({ where: { taskId }, order: { type: 'ASC', createdAt: 'DESC' } });
  }

  async addPhoto(taskId: string, type: string, url: string, key: string): Promise<TaskPhoto> {
    const task = await this.findOne(taskId);
    if (task.status !== 'PENDING' && task.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Só é possível adicionar foto em tarefa com status PENDING ou IN_PROGRESS');
    }
    const e = this.photoRepo.create({ id: uuid(), taskId, type, url, key });
    return this.photoRepo.save(e);
  }

  async findValidationQueue(): Promise<(Task & { photos: TaskPhoto[] })[]> {
    const tasks = await this.repo.find({
      where: { status: 'IN_REVIEW' },
      order: { updatedAt: 'DESC' },
    });
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length === 0) return tasks.map((t) => ({ ...t, photos: [] }));
    const photos = await this.photoRepo.find({ where: { taskId: In(taskIds) } });
    const byTask = photos.reduce((acc, p) => {
      if (!acc[p.taskId]) acc[p.taskId] = [];
      acc[p.taskId].push(p);
      return acc;
    }, {} as Record<string, TaskPhoto[]>);
    return tasks.map((t) => ({ ...t, photos: byTask[t.id] ?? [] }));
  }

  async approve(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    if (task.status !== 'IN_REVIEW') {
      throw new BadRequestException('Apenas tarefas em validação podem ser aprovadas');
    }
    const previousStatus = task.status;
    await this.repo.update(id, { status: 'DONE' });
    await this.audit.log(userId, 'APPROVE', 'Task', id, { previousStatus, newStatus: 'DONE' });
    return this.findOne(id);
  }

  async reject(id: string, userId: string, dto: RejectTaskInput): Promise<Task> {
    const task = await this.findOne(id);
    if (task.status !== 'IN_REVIEW') {
      throw new BadRequestException('Apenas tarefas em validação podem ser recusadas');
    }
    const { comment, reason } = rejectTaskSchema.parse(dto);
    const previousStatus = task.status;
    await this.repo.update(id, {
      status: 'IN_PROGRESS',
      rejectedComment: comment,
      rejectedAt: new Date(),
      rejectedBy: userId,
    });
    await this.audit.log(userId, 'REJECT', 'Task', id, {
      previousStatus,
      newStatus: 'IN_PROGRESS',
      comment,
      reason: reason ?? null,
    });
    return this.findOne(id);
  }

  async update(id: string, dto: TaskUpdateInput, userId?: string): Promise<Task> {
    const data = taskUpdateSchema.parse(dto);
    const task = await this.findOne(id);
    if (data.areaId !== undefined) await this.validateAreaExists(data.areaId);
    if (data.employeeId) await this.validateEmployeeActive(data.employeeId);
    if (data.status === 'IN_REVIEW') {
      if (task.status !== 'PENDING' && task.status !== 'IN_PROGRESS') {
        throw new BadRequestException('Só tarefas com status PENDING ou IN_PROGRESS podem ser enviadas para validação');
      }
      await this.validateMinPhotosForReview(id);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.scheduledDate !== undefined && data.scheduledDate < today) {
      throw new BadRequestException('Data agendada não pode ser no passado');
    }
    if (data.status !== undefined && data.status !== task.status && userId) {
      await this.audit.log(userId, 'UPDATE', 'Task', id, { previousStatus: task.status, newStatus: data.status });
    }
    await this.repo.update(id, data as Partial<Task>);
    return this.findOne(id);
  }

  private async validateMinPhotosForReview(taskId: string): Promise<void> {
    const photos = await this.photoRepo.find({ where: { taskId } });
    const before = photos.filter((p) => p.type === 'BEFORE').length;
    const after = photos.filter((p) => p.type === 'AFTER').length;
    if (before < MIN_PHOTOS_BEFORE || after < MIN_PHOTOS_AFTER) {
      throw new BadRequestException(
        `Para enviar à validação é necessário pelo menos ${MIN_PHOTOS_BEFORE} foto(s) ANTES e ${MIN_PHOTOS_AFTER} foto(s) DEPOIS`,
      );
    }
  }

  async remove(id: string, userId?: string): Promise<void> {
    const task = await this.findOne(id);
    if (task.status === 'DONE') {
      throw new BadRequestException('Não é permitido excluir tarefa já concluída (DONE)');
    }
    if (userId) await this.audit.log(userId, 'DELETE', 'Task', id, { status: task.status });
    await this.repo.delete(id);
  }
}
