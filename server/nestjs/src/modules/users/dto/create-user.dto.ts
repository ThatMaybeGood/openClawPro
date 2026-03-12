import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '用户名', description: '用户名' })
  @IsString()
  @MinLength(3, { message: '用户名长度不能少于 3 个字符' })
  @MaxLength(50, { message: '用户名长度不能超过 50 个字符' })
  username: string;

  @ApiProperty({ example: 'user@example.com', description: '邮箱地址' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ example: 'password123', description: '密码（至少 8 位，包含字母和数字）' })
  @IsString()
  @MinLength(8, { message: '密码长度不能少于 8 个字符' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: '密码必须包含字母和数字',
  })
  password: string;

  @ApiProperty({ example: '13800138000', description: '手机号（可选）' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, {
    message: '请输入有效的手机号码',
  })
  phone?: string;

  @ApiProperty({
    enum: ['customer', 'supplier', 'designer'],
    default: 'customer',
    description: '用户角色',
  })
  @IsOptional()
  @IsEnum(['customer', 'supplier', 'designer'])
  role?: 'customer' | 'supplier' | 'designer' = 'customer';
}
