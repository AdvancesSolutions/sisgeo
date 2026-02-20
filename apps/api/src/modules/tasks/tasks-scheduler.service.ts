import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksSchedulerService {
  constructor(private readonly tasksService: TasksService) {}

  /** A cada 10 minutos, marca tarefas atrasadas como LATE. */
  @Cron('*/10 * * * *')
  async handleMarkLateTasks() {
    const count = await this.tasksService.markLateTasks();
    if (count > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[TasksScheduler] ${count} tarefa(s) marcada(s) como LATE`);
    }
  }
}
