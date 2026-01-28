import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeClock } from '../../entities/time-clock.entity';
import { TimeClockController } from './time-clock.controller';
import { TimeClockService } from './time-clock.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeClock])],
  controllers: [TimeClockController],
  providers: [TimeClockService],
  exports: [TimeClockService],
})
export class TimeClockModule {}
