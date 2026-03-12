import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvironmentDataEntity, ENVIRONMENT_STANDARDS } from './entities/environment-data.entity';
import { ProgressRecordEntity, CONSTRUCTION_STAGES } from './entities/progress-record.entity';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(EnvironmentDataEntity)
    private readonly envDataRepository: Repository<EnvironmentDataEntity>,
    
    @InjectRepository(ProgressRecordEntity)
    private readonly progressRepository: Repository<ProgressRecordEntity>,
  ) {}

  // ========== 环境监测数据 =========

  /**
   * 记录环境数据
   */
  async recordEnvironmentData(dto: any): Promise<EnvironmentDataEntity> {
    const data = this.envDataRepository.create(dto);
    
    // 自动检测是否异常
    if (data.valueNumeric !== undefined && ENVIRONMENT_STANDARDS[data.sensorType]) {
      const standard = ENVIRONMENT_STANDARDS[data.sensorType];
      data.isAbnormal = !data.checkNormalRange(standard.min, standard.max);
    }

    return this.envDataRepository.save(data);
  }

  /**
   * 获取项目最新环境数据
   */
  async getLatestEnvironment(projectId: string) {
    const sensors = ['temperature', 'humidity', 'pm2_5', 'co2', 'noise'];
    const latestData = {};

    for (const sensor of sensors) {
      const data = await this.envDataRepository.findOne({
        where: { projectId, sensorType: sensor },
        order: { recordedAt: 'DESC' },
      });

      latestData[sensor] = data || null;
    }

    return latestData;
  }

  /**
   * 获取环境数据历史趋势
   */
  async getEnvironmentHistory(
    projectId: string,
    sensorType: string,
    hours: number = 24,
  ) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const data = await this.envDataRepository.find({
      where: { 
        projectId, 
        sensorType,
        recordedAt: { gt: since }
      },
      order: { recordedAt: 'ASC' },
    });

    return data.map(item => ({
      timestamp: item.recordedAt,
      value: item.valueNumeric,
      unit: item.unit,
      isAbnormal: item.isAbnormal,
    }));
  }

  /**
   * 获取异常数据列表
   */
  async getAbnormalRecords(projectId: string, hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const data = await this.envDataRepository.find({
      where: { 
        projectId, 
        isAbnormal: true,
        recordedAt: { gt: since }
      },
      order: { recordedAt: 'DESC' },
      take: 100,
    });

    return data;
  }

  // ========== 施工进度 =========

  /**
   * 创建进度记录
   */
  async createProgressRecord(dto: any): Promise<ProgressRecordEntity> {
    const record = this.progressRepository.create(dto);
    return this.progressRepository.save(record);
  }

  /**
   * 获取项目的全部进度记录
   */
  async getProgressTimeline(projectId: string) {
    const records = await this.progressRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });

    return {
      stages: CONSTRUCTION_STAGES,
      records: records.map(r => ({
        ...r,
        current: r.progressPercent >= (r.isCompleted ? 100 : 0),
      })),
    };
  }

  /**
   * 更新当前阶段进度
   */
  async updateCurrentProgress(projectId: string, stageName: string, progress: number) {
    let record = await this.progressRepository.findOne({
      where: { projectId, stageName, isCompleted: false },
    });

    if (!record) {
      record = this.progressRepository.create({
        projectId,
        stageName,
        progressPercent: 0,
        startDate: new Date(),
      });
    }

    record.progressPercent = progress;
    
    // 如果达到 100%，标记为完成
    if (progress >= 100) {
      record.isCompleted = true;
      record.endDate = new Date();
    }

    return this.progressRepository.save(record);
  }

  /**
   * 获取项目整体进度
   */
  async getOverallProgress(projectId: string) {
    const records = await this.progressRepository.find({
      where: { projectId },
    });

    const completedStages = records.filter(r => r.isCompleted).length;
    const totalStages = CONSTRUCTION_STAGES.length;
    
    const avgProgress = records.length > 0
      ? records.reduce((sum, r) => sum + r.progressPercent, 0) / records.length
      : 0;

    return {
      overallPercent: Math.round(avgProgress),
      completedStages,
      totalStages,
      nextStage: CONSTRUCTION_STAGES[completedStages]?.name || '已完成',
      estimatedCompletion: this.estimateCompletionDate(records),
    };
  }

  /**
   * 估算完工日期
   */
  private estimateCompletionDate(records: ProgressRecordEntity[]): Date | null {
    if (records.length === 0) return null;

    const completed = records.filter(r => r.isCompleted);
    if (completed.length === 0) return null;

    // 基于已完成阶段的平均耗时估算
    const durations = completed.map(r => {
      if (r.startDate && r.endDate) {
        return (r.endDate.getTime() - r.startDate.getTime()) / (1000 * 60 * 60 * 24); // 天数
      }
      return 7; // 默认 7 天
    });

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const remainingStages = CONSTRUCTION_STAGES.length - completed.length;

    const estimate = new Date();
    estimate.setDate(estimate.getDate() + avgDuration * remainingStages);

    return estimate;
  }

  /**
   * 质量验收上报
   */
  async reportQualityCheck(projectId: string, recordId: string, status: 'passed' | 'failed', notes?: string) {
    const record = await this.progressRepository.findOne({ where: { id: recordId, projectId } });
    if (!record) {
      throw new Error('进度记录不存在');
    }

    record.qualityStatus = status;
    if (notes) {
      record.description = `${record.description || ''}\n验收意见：${notes}`;
    }

    return this.progressRepository.save(record);
  }

  // ========== 实时监控接口 =========

  /**
   * WebSocket 推送（预留）
   * 实际使用需要结合 @nestjs/websockets
   */
  async subscribeRealtimeUpdates(projectId: string) {
    // TODO: 实现 WebSocket 订阅
    console.log(`WebSocket subscription started for project: ${projectId}`);
  }

  /**
   * 批量导入历史环境数据
   */
  async batchImportEnvironmentData(projectId: string, dataPoints: Array<any>) {
    const entities = dataPoints.map(point => 
      this.envDataRepository.create({
        projectId,
        ...point,
        isAbnormal: point.valueNumeric !== undefined && ENVIRONMENT_STANDARDS[point.sensorType]
          ? !point.checkNormalRange(
              ENVIRONMENT_STANDARDS[point.sensorType].min,
              ENVIRONMENT_STANDARDS[point.sensorType].max
            )
          : false,
      })
    );

    return this.envDataRepository.save(entities);
  }
}
