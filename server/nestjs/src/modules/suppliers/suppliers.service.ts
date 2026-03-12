import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepository: Repository<SupplierEntity>,
  ) {}

  async findAll(page: number = 1, limit: number = 20, filters?: any) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.supplierRepository.findAndCount({
      where: filters || {},
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findById(id: string): Promise<SupplierEntity | null> {
    return this.supplierRepository.findOne({ where: { id } });
  }

  async create(dto: any): Promise<SupplierEntity> {
    const supplier = this.supplierRepository.create({
      ...dto,
      status: 'pending', // 新申请默认为待审核
    });
    return this.supplierRepository.save(supplier);
  }

  async update(id: string, dto: Partial<any>): Promise<SupplierEntity> {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new NotFoundException(`施工团队 ID=${id} 不存在`);
    }
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  /**
   * 审核通过入驻申请
   */
  async approve(id: string): Promise<SupplierEntity> {
    return this.update(id, { verified: true, status: 'active' });
  }

  /**
   * 拒绝入驻申请
   */
  async reject(id: string): Promise<SupplierEntity> {
    return this.update(id, { status: 'rejected' });
  }

  /**
   * 根据类型筛选
   */
  async findByType(type: string, page: number = 1, limit: number = 20) {
    return this.findAll(page, limit, { supplierType: type, verified: true });
  }

  /**
   * 只返回已认证的团队
   */
  async findVerified(page: number = 1, limit: number = 20) {
    return this.findAll(page, limit, { verified: true, status: 'active' });
  }
}
