import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { EnvironmentDataEntity } from './entities/environment-data.entity';
import { ProgressRecordEntity } from './entities/progress-record.entity';
import { ProjectEntity } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentDataEntity, ProgressRecordEntity, ProjectEntity])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
