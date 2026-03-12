import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('progress_records')
export class ProgressRecordEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => ProjectEntity)
  project: ProjectEntity;

  @Column({ length: 100 })
  stageName: string; // 阶段名称：基础工程/主体结构/水电改造等

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  progressPercent: number; // 进度百分比

  @Column({ type: 'text', nullable: true })
  description?: string; // 完成内容描述

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'quality_status', type: 'enum', enum: ['pending', 'passed', 'failed'], default: 'pending' })
  qualityStatus: 'pending' | 'passed' | 'failed';

  @Column({ name: 'photos_urls', type: 'simple-array', default: [] })
  photosUrls: string[]; // 现场照片 URL 数组

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// ========== 标准施工阶段 ==========
export const CONSTRUCTION_STAGES = [
  { name: '规划设计', percent: 10 },
  { name: '基础工程', percent: 30 },
  { name: '主体结构', percent: 50 },
  { name: '水电改造', percent: 70 },
  { name: '装饰装修', percent: 90 },
  { name: '竣工验收', percent: 100 },
];
