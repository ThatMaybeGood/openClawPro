# 🏗️ 筑栖平台 - NestJS 后端服务

**v3.0 模块化单体架构 | 支持 10 万 + 用户规模**

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env，填入数据库连接等信息
```

### 3. 启动服务
```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build && npm run start:prod
```

### 4. 访问 API
- Swagger 文档：`http://localhost:3000/api-docs`
- 健康检查：`http://localhost:3000/health`

---

## 📁 项目结构

```
src/
├── common/                  # 公共模块
│   ├── decorators/         # 自定义装饰器 (@Public)
│   └── guards/             # JWT 守卫
│
├── modules/                # 业务模块（核心！）
│   ├── auth/              # 认证模块 ✓ 完成
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/login.dto.ts
│   │
│   ├── users/             # 用户模块 ✓ 完成
│   │   ├── entities/user.entity.ts
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   │
│   ├── projects/          # 项目模块 ✓ 完成
│   │   ├── entities/project.entity.ts
│   │   ├── projects.service.ts
│   │   └── projects.controller.ts
│   │
│   ├── suppliers/         # 供应商模块 ✓ 完成
│   │   ├── entities/supplier.entity.ts
│   │   ├── suppliers.service.ts
│   │   └── suppliers.controller.ts
│   │
│   ├── notifications/     # 通知模块 ✓ 完成
│   │   ├── entities/notification.entity.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.controller.ts
│   │
│   ├── budgets/           # 预算模块 📌 待补充
│   └── monitoring/        # 监控模块 📌 待补充
│
├── app.module.ts          # 根模块
└── main.ts                # 入口文件
```

---

## 🔧 技术栈

- **NestJS 10.x** - 企业级渐进式 Node.js 框架
- **TypeScript 5.x** - 类型安全开发
- **TypeORM** - ORM 数据访问层
- **PostgreSQL** (预留) - 关系型数据库
- **JWT** - 无状态认证
- **Swagger/OpenAPI** - API 文档自动生成
- **Helmet + Compression** - 安全防护

---

## 🛠️ 核心功能

### ✅ 已实现

#### 用户系统
- [x] 用户注册（密码加密存储）
- [x] 邮箱登录 / JWT Token
- [x] 用户信息 CRUD
- [x] 权限角色管理基础

#### 项目管理系统
- [x] 项目创建、编辑、删除
- [x] 进度追踪
- [x] 分页查询
- [x] 关联用户统计

#### 供应商生态
- [x] 施工团队入驻申请
- [x] 资质审核流程
- [x] 分类筛选（建筑/装修/设计/材料）
- [x] 作品集展示

#### 通知系统
- [x] 未读消息计数
- [x] 标记已读
- [x] 批量操作
- [x] 分页获取

### 📌 待完善

- [ ] 预算明细管理（entities + services）
- [ ] 环境监测数据采集（IoT）
- [ ] Redis 缓存集成
- [ ] 消息队列（BullMQ）
- [ ] 文件上传 OSS
- [ ] OAuth2 第三方登录

---

## 🎯 后续扩展方向

### 1. 接入真实数据库
修改 `app.module.ts` 中的 TypeORM 配置：
```typescript
type: 'postgres',
host: configService.get('DATABASE_HOST'),
username: configService.get('DATABASE_USERNAME'),
password: configService.get('DATABASE_PASSWORD'),
database: configService.get('DATABASE_NAME'),
```

### 2. 添加 Redis 缓存
```bash
npm install @nestjs/cache-manager cache-manager redis
```

### 3. 部署到服务器
```bash
# Docker 容器化
docker build -t zhiqu-api .
docker run -p 3000:3000 --env-file .env.zhiqu-api

# K8s 部署（高可用）
kubectl apply -f k8s/deployment.yaml
```

---

## 📊 API 接口概览

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/refresh` | 刷新 token |

### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users` | 用户列表 |
| GET | `/users/:id` | 用户详情 |
| PUT | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |

### 项目
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/projects` | 我的项目 |
| POST | `/projects` | 创建项目 |
| PUT | `/projects/:id` | 更新项目 |
| DELETE | `/projects/:id` | 删除项目 |

### 供应商
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/suppliers` | 供应商列表 |
| POST | `/suppliers/application` | 提交申请 |
| POST | `/suppliers/:id/approve` | 审核通过 |

### 通知
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/notifications/unread-count` | 未读数 |
| GET | `/notifications` | 通知列表 |
| PUT | `/notifications/:id/read` | 标记已读 |
| PUT | `/notifications/mark-all-read` | 全部已读 |

完整文档：**http://localhost:3000/api-docs**

---

## 🔐 安全加固建议

1. **生产环境启用 HTTPS**
2. **更换默认密钥** (`JWT_SECRET`, `REFRESH_TOKEN_SECRET`)
3. **数据库连接使用 SSL**
4. **关闭自动同步** (`synchronize: false`)
5. **启用请求限流**

---

## 💡 开发建议

### 添加新模块
```bash
nest g module modules/payments
nest g controller modules/payments
nest g service modules/payments
nest g resource modules/payments --skip-import
```

### 运行测试
```bash
npm run test          # 单元测试
npm run test:e2e      # 端到端测试
npm run test:cov      # 代码覆盖率
```

### 格式化代码
```bash
npm run format        # Prettier 格式化
npm run lint          # ESLint 检查
```

---

## 📈 性能优化清单

- [ ] 数据库索引优化（慢查询日志）
- [ ] Redis 缓存热点数据
- [ ] Gzip 压缩响应
- [ ] CDN 静态资源加速
- [ ] 读写分离主从复制
- [ ] Elasticsearch 全文检索

---

## 🆘 常见问题

**Q: 如何切换数据库为 SQLite 本地开发？**
```typescript
// app.module.ts
type: 'sqlite',
database: 'db.sqlite',
```

**Q: JWT Token 过期时间在哪里配置？**
```env
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
```

**Q: 如何查看数据库迁移日志？**
```bash
npm run migration:run
```

---

## 📮 联系方式

- **作者**: ThatMaybeGood
- **GitHub**: https://github.com/ThatMaybeGood/openClawPro
- **License**: MIT

---

**筑心筑造，安心安居** 🏗️✨

*版本：3.0.0 | 最后更新：2026-03-12*
