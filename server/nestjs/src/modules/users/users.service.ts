import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 创建新用户（注册）
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // 检查用户名是否已存在
    const existingByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingByUsername) {
      throw new ConflictException('用户名已被注册');
    }

    // 检查邮箱是否已存在
    const existingByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // 创建用户
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: [createUserDto.role || 'customer'],
    });

    return this.userRepository.save(user);
  }

  /**
   * 获取所有用户（分页）
   */
  async findAll(page: number = 1, limit: number = 20, filters?: any) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      where: filters || {},
      order: { createdAt: 'DESC' },
      relations: ['roles'],
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
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  /**
   * 更新用户信息
   */
  async update(id: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`用户 ID=${id} 不存在`);
    }

    // 如果更新邮箱，检查是否被占用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingByNewEmail = await this.findByEmail(updateUserDto.email);
      if (existingByNewEmail) {
        throw new ConflictException('该邮箱已被其他用户使用');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * 更新密码
   */
  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`用户 ID=${id} 不存在`);
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('原密码错误');
    }

    // 加密新密码
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.save(user);
  }

  /**
   * 软删除用户
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`用户 ID=${id} 不存在`);
    }

    user.status = 'deleted';
    await this.userRepository.save(user);
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLoginAt(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }
  }

  /**
   * 增加项目计数
   */
  async incrementProjectsCount(userId: string): Promise<void> {
    await this.userRepository.increment({ id: userId }, 'projectsCount', 1);
  }

  /**
   * 验证密码
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 修改账户状态
   */
  async updateStatus(id: string, status: 'active' | 'suspended' | 'deleted'): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`用户 ID=${id} 不存在`);
    }

    user.status = status;
    return this.userRepository.save(user);
  }
}
