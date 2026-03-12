import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: '创建新项目' })
  async create(@Request() req, @Body() dto: any) {
    const project = await this.projectsService.create(req.user.sub, dto);
    return { success: true, data: project };
  }

  @Get()
  @ApiOperation({ summary: '获取用户所有项目（分页）' })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.projectsService.findByOwner(req.user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个项目详情' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findById(id);
    if (!project) return { success: false, message: '项目不存在' };
    return { success: true, data: project };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目信息' })
  async update(@Param('id') id: string, @Body() dto: Partial<any>) {
    const project = await this.projectsService.update(id, dto);
    return { success: true, message: '项目更新成功', data: project };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
    return { success: true, message: '项目已删除' };
  }
}
