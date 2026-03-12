import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 50 })
  username: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 100 })
  email: string;

  @Exclude() // API 响应中自动排除密码
  @Column({ select: false })
  password: string;

  @Column({ name: 'phone', nullable: true, length: 20 })
  phone?: string;

  @Column({ name: 'avatar_url', nullable: true, type: 'text' })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: ['customer', 'supplier', 'designer', 'admin'],
    default: 'customer',
  })
  role: 'customer' | 'supplier' | 'designer' | 'admin';

  @Column({
    type: 'simple-array',
    default: [],
  })
  roles: string[];

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  })
  status: 'active' | 'suspended' | 'deleted';

  // OAuth 关联账户 (预留)
  @Column({ name: 'wechat_openid', nullable: true, unique: true })
  wechatOpenId?: string;

  @Column({ name: 'alipay_uid', nullable: true, unique: true })
  alipayUid?: string;

  // 统计信息
  @Column({ name: 'projects_count', default: 0 })
  projectsCount: number;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ========== 业务方法 ==========

  /**
   * 验证是否为活跃状态
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 检查是否具有某个角色
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role) || this.role === role;
  }

  /**
   * 格式化用户信息（脱敏）
   */
  getPublicInfo() {
    return {
      id: this.id,
      username: this.username,
      email: this.maskEmail(),
      phone: this.phone ? this.maskPhone() : null,
      avatarUrl: this.avatarUrl,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  /**
   * 邮箱脱敏
   */
  maskEmail(): string {
    const [name, domain] = this.email.split('@');
    if (name.length <= 2) return this.email;
    return `${name[0]}***@${domain}`;
  }

  /**
   * 手机号脱敏
   */
  maskPhone(): string {
    if (!this.phone) return '';
    return `${this.phone.slice(0, 3)}****${this.phone.slice(-4)}`;
  }
}
