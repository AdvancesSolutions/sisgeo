import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

const storage = memoryStorage();
const limit = 10 * 1024 * 1024; // 10MB

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('photo')
  @ApiOperation({ summary: 'Upload de foto (antes/depois)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        serviceRecordId: { type: 'string' },
        type: { type: 'string', enum: ['BEFORE', 'AFTER'] },
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
  ): Promise<{ url: string; key: string }> {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    const prefix = 'photos';
    return this.upload.save(file, prefix);
  }
}
