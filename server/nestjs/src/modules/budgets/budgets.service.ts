import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetItemEntity } from './entities/budget-item.entity';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(BudgetItemEntity)
    private readonly budgetRepository: Repository<BudgetItemEntity>,
  ) {}

  /**
   * 创建预算明细
   */
  async create(createDto: CreateBudgetItemDto): Promise<BudgetItemEntity> {
    const item = this.budgetRepository.create({
      ...createDto,
      totalAmount: createDto.unitPrice * createDto.quantity, // 自动计算总价
    });
    return this.budgetRepository.save(item);
  }

  /**
   * 获取项目的所有预算明细（分页）
   */
  async findByProject(projectId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.budgetRepository.findAndCount({
      where: { projectId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // 计算统计信息
    const stats = this.calculateStats(data);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      stats,
    };
  }

  /**
   * 根据 ID 查找预算项
   */
  async findById(id: string): Promise<BudgetItemEntity | null> {
    return this.budgetRepository.findOne({ where: { id } });
  }

  /**
   * 更新预算项
   */
  async update(id: string, updateDto: Partial<UpdateBudgetItemDto>): Promise<BudgetItemEntity> {
    const item = await this.findById(id);
    if (!item) {
      throw new NotFoundException(`预算项 ID=${id} 不存在`);
    }

    Object.assign(item, updateDto);

    // 如果更新了单价或数量，重新计算总价
    if (updateDto.unitPrice !== undefined || updateDto.quantity !== undefined) {
      item.totalAmount = item.unitPrice * item.quantity;
    }

    // 如果更新了实际金额，重新计算偏差率
    if (updateDto.actualAmount !== undefined) {
      item.updateVarianceRatio();
    }

    return this.budgetRepository.save(item);
  }

  /**
   * 删除预算项
   */
  async remove(id: string): Promise<void> {
    const item = await this.findById(id);
    if (!item) {
      throw new NotFoundException(`预算项 ID=${id} 不存在`);
    }

    await this.budgetRepository.remove(item);
  }

  /**
   * 审批预算项
   */
  async approve(id: string): Promise<BudgetItemEntity> {
    return this.update(id, { isApproved: true });
  }

  /**
   * 获取项目的预算汇总
   */
  async getProjectSummary(projectId: string): Promise<any> {
    const items = await this.budgetRepository.find({
      where: { projectId },
    });

    const stats = this.calculateStats(items);

    return {
      projectId,
      ...stats,
    };
  }

  /**
   * 按类别分组统计
   */
  async getCategoryBreakdown(projectId: string): Promise<any[]> {
    const items = await this.budgetRepository.find({
      where: { projectId },
    });

    const categoryMap = new Map<string, any>();

    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, {
          category: item.category,
          count: 0,
          plannedTotal: 0,
          actualTotal: 0,
          variance: 0,
        });
      }

      const cat = categoryMap.get(item.category);
      cat.count++;
      cat.plannedTotal += item.totalAmount;
      if (item.actualAmount) {
        cat.actualTotal += item.actualAmount;
      }
    });

    // 计算每个类别的偏差
    categoryMap.forEach(cat => {
      cat.variance = cat.actualTotal - cat.plannedTotal;
      cat.variancePercent = cat.plannedTotal > 0 
        ? ((cat.actualTotal - cat.plannedTotal) / cat.plannedTotal * 100).toFixed(2) 
        : 0;
    });

    return Array.from(categoryMap.values());
  }

  /**
   * 找出超支的预算项
   */
  async findOverBudgetItems(projectId: string) {
    const items = await this.budgetRepository.find({
      where: { projectId },
    });

    return items.filter(item => item.isOverBudget());
  }

  /**
   * 批量更新实际金额
   */
  async batchUpdateActualAmount(projectId: string, updates: Array<{ itemId: string; amount: number }>) {
    for (const update of updates) {
      await this.update(update.itemId, { actualAmount: update.amount });
    }
  }

  /**
   * 私有方法：计算统计数据
   */
  private calculateStats(items: BudgetItemEntity[]) {
    const plannedTotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const actualTotal = items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    
    const overBudgetCount = items.filter(item => item.isOverBudget()).length;
    const approvedCount = items.filter(item => item.isApproved).length;

    return {
      totalItems: items.length,
      plannedTotal,
      actualTotal,
      remaining: plannedTotal - actualTotal,
      variancePercent: plannedTotal > 0 ? ((actualTotal - plannedTotal) / plannedTotal * 100).toFixed(2) : 0,
      overBudgetCount,
      approvedCount,
      pendingApprovalCount: items.length - approvedCount,
    };
  }
}
