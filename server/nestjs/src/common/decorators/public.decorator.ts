import { SetMetadata } from '@nestjs/common';

// 公共路由标记（跳过 JWT 验证）
export const IS_PUBLIC_KEY = 'isPublic';
export const Public() = SetMetadata(IS_PUBLIC_KEY, true);
