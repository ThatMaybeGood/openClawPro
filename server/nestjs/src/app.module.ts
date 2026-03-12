import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';

// ========== 业务模块 ==========
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    // ========== 环境配置 ==========
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        
        // 数据库配置 (预留 PostgreSQL)
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().default('zhiqu_platform'),
        
        // Redis 配置 (预留)
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        
        // JWT 配置
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('15m'),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().default('7d'),
        
        // OAuth2 配置 (预留)
        WECHAT_APP_ID: Joi.string().optional(),
        WECHAT_APP_SECRET: Joi.string().optional(),
      }),
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),

    // ========== 数据库连接 (支持 JSON→PostgreSQL 平滑迁移) ==========
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // 后期可切换为 postgres
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'zhiqu_platform'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*.ts'],
        synchronize: configService.get<string>('NODE_ENV') === 'development', // 生产环境关闭自动同步
        
        // 连接池优化 (10 万用户级配置)
        max: 20, // 最大连接数
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        
        // 日志配置
        logging: configService.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
        
        // SSL 配置 (生产环境启用)
        // ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // ========== 定时任务 ==========
    ScheduleModule.forRoot(),

    // ========== 业务模块导入 ==========
    AuthModule,
    UsersModule,
    ProjectsModule,
    SuppliersModule,
    BudgetsModule,
    NotificationsModule,
    MonitoringModule,
  ],
})
export class AppModule {}
