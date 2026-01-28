import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AreasService } from './areas.service';
import { areaSchema } from '@sigeo/shared';
import type { AreaInput, AreaUpdateInput } from '@sigeo/shared';

@ApiTags('areas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly service: AreasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar área' })
  create(@Body() body: unknown) {
    return this.service.create(areaSchema.parse(body) as AreaInput);
  }

  @Get()
  @ApiOperation({ summary: 'Listar áreas' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locationId') locationId?: string,
  ) {
    if (locationId) return this.service.findByLocation(locationId);
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
  @ApiOperation({ summary: 'Atualizar área' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.service.update(id, body as AreaUpdateInput);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover área' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
