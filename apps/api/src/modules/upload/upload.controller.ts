import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { TasksService } from '../tasks/tasks.service';
import { memoryStorage } from 'multer';

const storage = memoryStorage();
const limit = 10 * 1024 * 1024; // 10MB

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly upload: UploadService,
    private readonly tasksService: TasksService,
  ) {}

  @Post('photo')
  @ApiOperation({ summary: 'Upload de foto (antes/depois) vinculada à tarefa' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        taskId: { type: 'string', description: 'UUID da tarefa realizada no local/área' },
        type: { type: 'string', enum: ['BEFORE', 'AFTER'], description: 'Antes ou depois do serviço' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: limit },
      fileFilter: (_, file, cb) => {
        const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
        cb(null, ok);
      },
    }),
  )
  async photo(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('taskId') taskId?: string,
    @Body('type') type?: string,
  ): Promise<{ url: string; key: string }> {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    const prefix = 'photos';
    const opts =
      taskId && type && ['BEFORE', 'AFTER'].includes(type)
        ? { taskId, type: type as 'BEFORE' | 'AFTER' }
        : undefined;
    const result = await this.upload.save(file, prefix, undefined, opts);
    if (taskId && type && ['BEFORE', 'AFTER'].includes(type)) {
      await this.tasksService.addPhoto(taskId, type, result.url, result.key);
    }
    return result;
  }
}
