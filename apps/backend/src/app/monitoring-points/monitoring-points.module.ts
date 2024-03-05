import { Module } from '@nestjs/common';
import { JwtStrategy } from '../guard/jwt.strategy';
import { PrismaService } from '../database/PrismaService';
import { SensorsService } from '../sensors/sensors.service';
import { MachinesService } from '../machines/machines.service';
import { MonitoringPointsService } from './monitoring-points.service';
import { MonitoringPointsController } from './monitoring-points.controller';

@Module({
  controllers: [MonitoringPointsController],
  providers: [MonitoringPointsService, PrismaService, JwtStrategy, SensorsService, MachinesService],
})
export class MonitoringPointsModule {}
