import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: '获取施工团队列表（分页）' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('verified') verified?: boolean,
  ) {
    const filters: any = {};
    if (type) filters.supplierType = type;
    if (verified !== undefined) filters.verified = verified === true;
    
    return this.suppliersService.findAll(page, limit, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个施工团队详情' })
  async findOne(@Param('id') id: string) {
    const supplier = await this.suppliersService.findById(id);
    if (!supplier) return { success: false, message: '施工团队不存在' };
    return { success: true, data: supplier };
  }

  @Post('application')
  @ApiOperation({ summary: '提交入驻申请' })
  async createApplication(@Body() dto: any) {
    const supplier = await this.suppliersService.create(dto);
    return { 
      success: true, 
      message: '申请提交成功，将在 1-3 个工作日内审核',
      data: supplier 
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  
  @Post(':id/approve')
  @ApiOperation({ summary: '审核通过入驻申请（管理员）' })
  async approve(@Param('id') id: string) {
    const supplier = await this.suppliersService.approve(id);
    return { success: true, message: '审核通过', data: supplier };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '拒绝入驻申请（管理员）' })
  async reject(@Param('id') id: string) {
    const supplier = await this.suppliersService.reject(id);
    return { success: true, message: '申请已拒绝' };
  }
}
