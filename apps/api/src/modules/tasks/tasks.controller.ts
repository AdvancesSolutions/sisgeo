import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { taskSchema } from '@sigeo/shared';
import type { TaskInput, TaskUpdateInput } from '@sigeo/shared';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tarefa' })
  create(@Body() body: unknown) {
    return this.service.create(taskSchema.parse(body) as TaskInput);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.service.update(id, body as TaskUpdateInput);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tarefa' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
