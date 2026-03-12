import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('environment_data')
export class EnvironmentDataEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Index()
  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => ProjectEntity)
  project: ProjectEntity;

  @Column({ name: 'sensor_type', length: 20 })
  sensorType: string; // temperature, humidity, pm2_5, co2, noise

  @Column({ name: 'metric_name', length: 50 })
  metricName: string; // 指标名称

  @Column({ name: 'value_numeric', type: 'double precision', nullable: true })
  valueNumeric?: number;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText?: string;

  @Column({ name: 'unit', type: 'varchar', length: 20, nullable: true })
  unit?: string; // °C, %, μg/m³, ppm, dB

  @Column({ 
    name: 'is_abnormal', 
    default: false,
    comment: '是否异常'
  })
  isAbnormal: boolean;

  @Index({ composite: true, with: ['projectId'] })
  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;

  // ========== 业务方法 ==========

  /**
   * 检查数值是否在正常范围内
   */
  checkNormalRange(minValue: number, maxValue: number): boolean {
    if (this.valueNumeric === undefined) return true;
    return this.valueNumeric >= minValue && this.valueNumeric <= maxValue;
  }

  /**
   * 获取友好显示值
   */
  getDisplayValue(): string {
    if (this.valueNumeric !== undefined) {
      return `${this.valueNumeric.toFixed(1)}${this.unit || ''}`;
    }
    return this.valueText || '-';
  }
}

// ========== 环境监测标准（常量）==========
export const ENVIRONMENT_STANDARDS = {
  temperature: { min: 18, max: 28, unit: '°C' },     // 温度：18-28°C
  humidity: { min: 40, max: 60, unit: '%' },          // 湿度：40%-60%
  pm2_5: { min: 0, max: 75, unit: 'μg/m³' },         // PM2.5: <75
  co2: { min: 0, max: 1000, unit: 'ppm' },           // CO2: <1000ppm
  noise: { min: 0, max: 85, unit: 'dB' },            // 噪声：<85dB
};
