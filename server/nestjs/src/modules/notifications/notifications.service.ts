import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
   * 创建通知
   */
  async create(dto: any): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create(dto);
    return this.notificationRepository.save(notification);
  }

  /**
   * 获取用户的未读消息数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return count;
  }

  /**
   * 获取用户的通知列表（分页）
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20, unreadOnly?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
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
   * 标记为已读
   */
  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.affected || 0;
  }
}
