import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    // 返回时不包含密码
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      message: '注册成功',
      data: userWithoutPassword,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户列表（分页）' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() filters: any,
  ) {
    return this.usersService.findAll(page, limit, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取单个用户信息' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      data: userWithoutPassword,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      message: '用户信息更新成功',
      data: userWithoutPassword,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除用户（软删除）' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      success: true,
      message: '用户已删除',
    };
  }
}
