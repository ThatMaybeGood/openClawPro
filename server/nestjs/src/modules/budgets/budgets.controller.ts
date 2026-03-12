import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetItemDto } from './dto/create-budget-item.dto';
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: '创建预算明细' })
  async create(@Body() createDto: CreateBudgetItemDto) {
    const item = await this.budgetsService.create(createDto);
    return { success: true, message: '预算创建成功', data: item };
  }

  @Get()
  @ApiOperation({ summary: '获取项目的所有预算明细（分页）' })
  async findByProject(
    @Query('projectId') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    if (!projectId) {
      return { success: false, message: '请提供项目 ID' };
    }
    return this.budgetsService.findByProject(projectId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个预算项详情' })
  async findOne(@Param('id') id: string) {
    const item = await this.budgetsService.findById(id);
    if (!item) return { success: false, message: '预算项不存在' };
    return { success: true, data: item };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新预算项' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<UpdateBudgetItemDto>) {
    const item = await this.budgetsService.update(id, updateDto);
    return { success: true, message: '预算更新成功', data: item };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除预算项' })
  async remove(@Param('id') id: string) {
    await this.budgetsService.remove(id);
    return { success: true, message: '预算项已删除' };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审批通过预算项' })
  async approve(@Param('id') id: string) {
    const item = await this.budgetsService.approve(id);
    return { success: true, message: '预算已审批', data: item };
  }

  @Get('project/:projectId/summary')
  @ApiOperation({ summary: '获取项目预算汇总' })
  async getSummary(@Param('projectId') projectId: string) {
    const summary = await this.budgetsService.getProjectSummary(projectId);
    return { success: true, data: summary };
  }

  @Get('project/:projectId/category-breakdown')
  @ApiOperation({ summary: '按类别分组统计' })
  async getCategoryBreakdown(@Param('projectId') projectId: string) {
    const breakdown = await this.budgetsService.getCategoryBreakdown(projectId);
    return { success: true, data: breakdown };
  }

  @Get('project/:projectId/over-budget')
  @ApiOperation({ summary: '找出超支的预算项' })
  async findOverBudgetItems(@Param('projectId') projectId: string) {
    const items = await this.budgetsService.findOverBudgetItems(projectId);
    return { success: true, data: items };
  }
}
