import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => UserEntity)
  owner: UserEntity;

  @Column({ length: 200 })
  name: string;

  @Column({
    name: 'house_type',
    type: 'enum',
    enum: ['new_build', 'renovation', 'villa', 'apartment'],
  })
  houseType: 'new_build' | 'renovation' | 'villa' | 'apartment';

  @Column({ name: 'area_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaM2?: number;

  @Column({ name: 'location', type: 'jsonb', nullable: true }) // {province, city, district, address}
  location?: any;

  @Column({ type: 'simple-array', default: [] })
  styleTags: string[]; // 风格标签数组

  @Column({
    type: 'enum',
    enum: ['draft', 'planning', 'construction', 'inspection', 'completed'],
    default: 'draft',
  })
  status: 'draft' | 'planning' | 'construction' | 'inspection' | 'completed';

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 进度百分比

  @Column({ name: 'budget_total', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetTotal?: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  actualCost: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
