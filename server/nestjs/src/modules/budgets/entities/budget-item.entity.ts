import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('budget_items')
export class BudgetItemEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => ProjectEntity)
  project: ProjectEntity;

  @Column({ length: 50 })
  category: string; // 类别：材料/人工/设备/其他

  @Column({ name: 'item_name', length: 200 })
  itemName: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualAmount?: number;

  @Column({ 
    name: 'variance_ratio', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    nullable: true 
  })
  varianceRatio?: number; // 偏差率（实际 - 预算）/ 预算 * 100

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ========== 业务方法 ==========

  /**
   * 计算总价
   */
  calculateTotal(): void {
    this.totalAmount = this.unitPrice * this.quantity;
  }

  /**
   * 更新偏差率
   */
  updateVarianceRatio(): void {
    if (this.actualAmount && this.totalAmount > 0) {
      this.varianceRatio = ((this.actualAmount - this.totalAmount) / this.totalAmount) * 100;
    }
  }

  /**
   * 是否超支
   */
  isOverBudget(): boolean {
    return this.actualAmount && this.actualAmount > this.totalAmount;
  }

  /**
   * 获取超支金额
   */
  getOverBudgetAmount(): number | null {
    if (!this.actualAmount) return null;
    const diff = this.actualAmount - this.totalAmount;
    return diff > 0 ? diff : null;
  }
}
