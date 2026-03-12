import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
  ) {}

  /**
   * 创建新项目
   */
  async create(userId: string, dto: any): Promise<ProjectEntity> {
    const project = this.projectRepository.create({
      ...dto,
      ownerId: userId,
    });
    return this.projectRepository.save(project);
  }

  /**
   * 获取用户的所有项目（分页）
   */
  async findByOwner(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.projectRepository.findAndCount({
      where: { ownerId: userId },
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

  /**
   * 根据 ID 查找项目
   */
  async findById(id: string): Promise<ProjectEntity | null> {
    return this.projectRepository.findOne({ where: { id } });
  }

  /**
   * 更新项目信息
   */
  async update(id: string, dto: Partial<any>): Promise<ProjectEntity> {
    const project = await this.findById(id);
    if (!project) {
      throw new NotFoundException(`项目 ID=${id} 不存在`);
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  /**
   * 删除项目
   */
  async remove(id: string): Promise<void> {
    const project = await this.findById(id);
    if (!project) {
      throw new NotFoundException(`项目 ID=${id} 不存在`);
    }

    await this.projectRepository.remove(project);
  }

  /**
   * 更新进度
   */
  async updateProgress(id: string, progress: number): Promise<ProjectEntity> {
    return this.update(id, { progress: Math.min(100, Math.max(0, progress)) });
  }

  /**
   * 更新状态
   */
  async updateStatus(id: string, status: string): Promise<ProjectEntity> {
    return this.update(id, { status });
  }
}
