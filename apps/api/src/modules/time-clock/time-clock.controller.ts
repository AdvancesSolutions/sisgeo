import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { TimeClockService } from './time-clock.service';
import { timeClockSchema } from '@sigeo/shared';
import type { TimeClockInput } from '@sigeo/shared';

const parseBody = (body: unknown, type: 'CHECKIN' | 'CHECKOUT') => {
  const b = body as Record<string, unknown>;
  return timeClockSchema.parse({ ...b, type }) as TimeClockInput;
};

@ApiTags('time-clock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-clock')
export class TimeClockController {
  constructor(private readonly service: TimeClockService) {}

  @Post('checkin')
  @ApiOperation({ summary: 'Check-in' })
  checkin(@Body() body: unknown) {
    const d = parseBody(body, 'CHECKIN');
    const eid = (body as { employeeId?: string })?.employeeId;
    if (!eid) throw new BadRequestException('employeeId é obrigatório');
    return this.service.register(eid, { ...d, type: 'CHECKIN' });
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Check-out' })
  checkout(@Body() body: unknown) {
    const d = parseBody(body, 'CHECKOUT');
    const eid = (body as { employeeId?: string })?.employeeId;
    if (!eid) throw new BadRequestException('employeeId é obrigatório');
    return this.service.register(eid, { ...d, type: 'CHECKOUT' });
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Listar por funcionário' })
  findByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByEmployee(employeeId, limit ? parseInt(limit, 10) : 50);
  }
}
