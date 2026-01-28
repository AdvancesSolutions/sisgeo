import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { materialSchema } from '@sigeo/shared';
import type { MaterialInput, MaterialUpdateInput } from '@sigeo/shared';

@ApiTags('materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly service: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar material' })
  create(@Body() body: unknown) {
    return this.service.create(materialSchema.parse(body) as MaterialInput);
  }

  @Get()
  @ApiOperation({ summary: 'Listar materiais' })
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
  @ApiOperation({ summary: 'Atualizar material' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.service.update(id, body as MaterialUpdateInput);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover material' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
