import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken?: string; user: any }> {
    const { email, password, rememberMe } = loginDto;

    // 查找用户
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查账户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('账户已被禁用，请联系管理员');
    }

    // 更新最后登录时间
    await this.usersService.updateLastLoginAt(user.id);

    // 生成 token
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: rememberMe ? this.generateRefreshToken(user.id) : undefined,
      user: user.getPublicInfo(),
    };
  }

  /**
   * 注册新用户并返回 token
   */
  async register(createUserDto: any): Promise<{ accessToken: string; user: any }> {
    // 先检查是否已存在（双重验证）
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 创建用户
    const user = await this.usersService.create(createUserDto);

    // 生成 token
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: user.getPublicInfo(),
    };
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // 这里需要实现 refresh token 的存储和验证逻辑
      // 简化版：直接从 token 中解码
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      return {
        accessToken: this.jwtService.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 生成刷新令牌
   */
  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      },
    );
  }

  /**
   * 验证 JWT token
   */
  async validateUser(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || user.status !== 'active') {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      return null;
    }
  }
}
