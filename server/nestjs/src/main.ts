import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Injectable } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { SeedDataService } from './common/services/seed-data.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ========== 初始化示例数据（开发环境）==========
  if (process.env.NODE_ENV === 'development') {
    const seedService = new SeedDataService(app.get(SeedDataService).constructor);
    try {
      await seedService.seed();
    } catch (error) {
      console.warn('种子数据初始化跳过:', error.message);
    }
  }

  // ========== 安全中间件 ==========
  app.use(helmet()); // HTTPS 安全头
  app.use(compression()); // Gzip 压缩

  // ========== CORS 配置 ==========
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ========== 全局异常过滤器 ==========
  app.useGlobalFilters(new AllExceptionsFilter());

  // ========== 全局验证管道 ==========
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 删除 DTO 中未定义的属性
      forbidNonWhitelisted: true, // 拒绝非白名单属性
      transform: true, // 自动转换数据类型
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false, // 不返回目标类信息（安全性）
      },
    }),
  );

  // ========== Swagger 文档配置 ==========
  const config = new DocumentBuilder()
    .setTitle('筑栖平台 API')
    .setDescription('一站式家庭装修建造管理平台 - 10 万用户级架构')
    .setVersion('3.0')
    .addBearerAuth()
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户管理')
    .addTag('projects', '项目管理')
    .addTag('suppliers', '施工团队管理')
    .addTag('budgets', '预算管理')
    .addTag('notifications', '消息通知')
    .addTag('monitoring', '施工监控')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ========== 健康检查端点 ==========
  app.get('/health', () => ({
    status: 'healthy',
    version: process.env.npm_package_version || '3.0.0',
    timestamp: new Date().toISOString(),
  }));

  // ========== 启动服务器 ==========
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🏠 筑栖平台 v${process.env.npm_package_version}         ║
║   🚀 模块化单体架构 (支持 10 万用户)              ║
║                                            ║
║   服务地址：http://localhost:${port}            ║
║   API 文档：http://localhost:${port}/api-docs       ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
}

bootstrap();

// ========== 全局异常过滤器 ==========
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception.status || exception.statusCode || 500;
    const message =
      exception.message ||
      exception.response?.message ||
      '服务器内部错误';

    // 开发环境输出详细错误
    if (process.env.NODE_ENV === 'development') {
      console.error('[Exception]', {
        url: request.url,
        method: request.method,
        status,
        message,
        stack: exception.stack,
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
