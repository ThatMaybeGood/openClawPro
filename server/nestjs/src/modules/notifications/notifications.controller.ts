import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { success: true, data: { count } };
  }

  @Get()
  @ApiOperation({ summary: '获取通知列表（分页）' })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.notificationsService.findByUser(req.user.sub, page, limit, unreadOnly);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记为已读' })
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true, message: '已标记为已读' };
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: '全部标记为已读' })
  async markAllAsRead(@Request() req) {
    const count = await this.notificationsService.markAllAsRead(req.user.sub);
    return { success: true, message: `已将 ${count} 条通知标记为已读` };
  }
}
