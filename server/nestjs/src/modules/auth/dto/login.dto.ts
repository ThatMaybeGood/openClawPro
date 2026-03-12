import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '邮箱地址' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: 'password123', description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ example: false, required: false, description: '记住我（7 天免登录）' })
  @IsOptional()
  rememberMe?: boolean = false;
}
