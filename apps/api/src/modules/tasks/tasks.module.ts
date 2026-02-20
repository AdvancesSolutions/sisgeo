import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TaskPhoto } from '../../entities/task-photo.entity';
import { Area } from '../../entities/area.entity';
import { Employee } from '../../entities/employee.entity';
import { AuditModule } from '../audit/audit.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksSchedulerService } from './tasks-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskPhoto, Area, Employee]), AuditModule],
  controllers: [TasksController],
  providers: [TasksService, TasksSchedulerService],
  exports: [TasksService],
})
export class TasksModule {}
