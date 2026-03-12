import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  // ========== 环境数据 =========

  @Post('environment/record')
  @ApiOperation({ summary: '记录环境数据' })
  async recordEnvironment(@Body() dto: any) {
    const data = await this.monitoringService.recordEnvironmentData(dto);
    return { success: true, data };
  }

  @Get('environment/latest/:projectId')
  @ApiOperation({ summary: '获取项目最新环境数据' })
  async getLatestEnvironment(@Param('projectId') projectId: string) {
    const data = await this.monitoringService.getLatestEnvironment(projectId);
    return { success: true, data };
  }

  @Get('environment/history/:projectId')
  @ApiOperation({ summary: '获取环境数据历史趋势' })
  async getEnvironmentHistory(
    @Param('projectId') projectId: string,
    @Query('sensorType') sensorType: string,
    @Query('hours') hours: number = 24,
  ) {
    if (!sensorType) {
      return { success: false, message: '请指定传感器类型' };
    }
    
    const data = await this.monitoringService.getEnvironmentHistory(projectId, sensorType, hours);
    return { success: true, data };
  }

  @Get('environment/abnormal/:projectId')
  @ApiOperation({ summary: '获取异常环境数据' })
  async getAbnormalRecords(
    @Param('projectId') projectId: string,
    @Query('hours') hours: number = 24,
  ) {
    const data = await this.monitoringService.getAbnormalRecords(projectId, hours);
    return { success: true, data };
  }

  // ========== 进度管理 =========

  @Post('progress/record')
  @ApiOperation({ summary: '创建进度记录' })
  async createProgressRecord(@Body() dto: any) {
    const record = await this.monitoringService.createProgressRecord(dto);
    return { success: true, data: record };
  }

  @Get('progress/timeline/:projectId')
  @ApiOperation({ summary: '获取项目进度时间线' })
  async getProgressTimeline(@Param('projectId') projectId: string) {
    const data = await this.monitoringService.getProgressTimeline(projectId);
    return { success: true, data };
  }

  @Put('progress/update')
  @ApiOperation({ summary: '更新当前阶段进度' })
  async updateCurrentProgress(
    @Body('projectId') projectId: string,
    @Body('stageName') stageName: string,
    @Body('progress') progress: number,
  ) {
    const record = await this.monitoringService.updateCurrentProgress(projectId, stageName, progress);
    return { success: true, data: record };
  }

  @Get('progress/overall/:projectId')
  @ApiOperation({ summary: '获取项目整体进度' })
  async getOverallProgress(@Param('projectId') projectId: string) {
    const data = await this.monitoringService.getOverallProgress(projectId);
    return { success: true, data };
  }

  @Put('quality/report')
  @ApiOperation({ summary: '质量验收上报' })
  async reportQualityCheck(
    @Body('projectId') projectId: string,
    @Body('recordId') recordId: string,
    @Body('status') status: 'passed' | 'failed',
    @Body('notes') notes?: string,
  ) {
    const result = await this.monitoringService.reportQualityCheck(projectId, recordId, status, notes);
    return { success: true, data: result };
  }

  @Post('environment/batch-import')
  @ApiOperation({ summary: '批量导入历史环境数据' })
  async batchImportEnvironmentData(
    @Body('projectId') projectId: string,
    @Body('dataPoints') dataPoints: Array<any>,
  ) {
    const result = await this.monitoringService.batchImportEnvironmentData(projectId, dataPoints);
    return { success: true, count: result.length };
  }
}
