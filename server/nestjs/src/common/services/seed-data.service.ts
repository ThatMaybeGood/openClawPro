import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../modules/users/entities/user.entity';

@Injectable()
export class SeedDataService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * 初始化示例数据
   */
  async seed(): Promise<void> {
    // 检查是否已有用户
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('跳过种子数据初始化，已存在用户');
      return;
    }

    console.log('\n正在初始化示例数据...\n');

    // 创建管理员账户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = this.userRepository.create({
      username: 'admin',
      email: 'admin@zhiqu.com',
      password: adminPassword,
      phone: '138****8888',
      role: 'admin',
      roles: ['admin'],
      status: 'active' as const,
    });
    await this.userRepository.save(admin);
    console.log('✓ 管理员账户已创建');
    console.log(`  邮箱：admin@zhiqu.com`);
    console.log(`  密码：admin123`);

    // 创建测试用户
    const testUserPassword = await bcrypt.hash('user123456', 10);
    const testUser = this.userRepository.create({
      username: 'test_user',
      email: 'test@zhiqu.com',
      password: testUserPassword,
      phone: '139****6666',
      role: 'customer',
      roles: ['customer'],
      status: 'active' as const,
    });
    await this.userRepository.save(testUser);
    console.log('\n✓ 测试用户已创建');
    console.log(`  邮箱：test@zhiqu.com`);
    console.log(`  密码：user123456`);

    console.log('\n✅ 示例数据初始化完成！\n');
  }
}
