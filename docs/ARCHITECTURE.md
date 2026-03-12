# 筑栖平台 - 可扩展性架构设计

## 📋 架构目标

**核心指标**: 支持 10 万 + 活跃用户，支撑日活 10,000+ 用户，QPS 峰值 5,000+

**设计原则**:
- ✅ 前期不浪费：不盲目上微服务
- ✅ 后期好拆：模块间低耦合可独立部署
- ✅ 平滑演进：从单体→模块化→微服务无感升级

---

## 🎯 推荐架构：**模块化单体 (Modular Monolith)**

### 为什么不是直接上微服务？

| 对比维度 | 微服务过早 | 模块化单体 |
|---------|-----------|-----------|
| **开发速度** | 慢（跨服务调用调试复杂） | 快（本地方法调用） |
| **运维成本** | 高（需要 K8s/监控体系） | 低（单机即可启动） |
| **学习曲线** | 陡（团队需掌握分布式知识） | 平（传统 MVC 模式） |
| **扩展能力** | 强但过度 | 足够且灵活 |
| **0-10 万用户** | Overkill | Sweet Spot |

**马歇尔·希尔斯定律**: "微服务在 10 人以下团队是毒药"

### 架构优势

```
┌─────────────────────────────────────────────────────────┐
│                  模块化单体应用                          │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ User 模块 │  │Project 模块│  │Supplier 模块│          │
│   │          │  │          │  │          │            │
│   │ - Auth   │  │ - CRUD   │  │ - Review │            │
│   │ - Profile│  │ - Budget │  │ - Apply  │            │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│        │             │              │                   │
│        └─────────────┼──────────────┘                   │
│                      ▼                                  │
│              ┌───────────────┐                         │
│              │  Shared Core  │                         │
│              │ - Repository  │                         │
│              │ - Middleware  │                         │
│              │ - Utils       │                         │
│              └───────────────┘                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  PostgreSQL      │
              │  Redis           │
              │  Elasticsearch   │
              └──────────────────┘
```

**关键点**: 代码组织按业务域划分，而非按技术层级（Controller/Service/DAO）。每个模块可以独立测试、独立文档化，未来拆分时直接抽离成新服务。

---

## 🏗️ v3.0 完整技术栈选型

### 前端技术栈

```yaml
框架：Vue 3 (Composition API + <script setup>)
构建工具：Vite (冷启动 < 1s)
类型安全：TypeScript 5.0
状态管理：Pinia (Vuex 替代者)
UI 组件：Element Plus / Ant Design Vue
样式方案：CSS Modules + Tailwind CSS
路由管理：Vue Router 4
HTTP 客户端：Axios + 请求拦截器
实时通信：Socket.IO Client
图片处理：WebP + Lazy Load
单元测试：Vitest + Testing Library
E2E 测试：Playwright
```

**为什么选 Vue 而不是 React？**
- 中国建筑行业开发者更熟悉 Vue（生态惯性）
- TypeScript 集成更好（React 模板语法限制多）
- 学习曲线平缓（快速招人）
- 性能差异可忽略不计

### 后端技术栈

```yaml
运行时：Node.js 20 LTS
框架：NestJS (9.x+)
ORM: TypeORM / Prisma
数据库：PostgreSQL 16
缓存：Redis 7.x
搜索：Elasticsearch 8.x
消息队列：BullMQ (Redis 队列)
文件存储：阿里云 OSS / MinIO
认证：JWT + Refresh Token
API 文档：Swagger / OpenAPI
日志：Winston + Sentry
定时任务：Bull (Cron Jobs)
```

**为什么 NestJS？**
- Angular 级别的工程化（依赖注入、装饰器、模块系统）
- 开箱即用的微服务支持（后续拆分零迁移成本）
- TypeScript First 开发体验
- 强大的生态中间件

### 基础设施

```yaml
容器化：Docker + Docker Compose
编排：Kubernetes (后期按需启用)
CI/CD: GitHub Actions
监控：Prometheus + Grafana
日志：ELK Stack
 CDN: Cloudflare / 阿里云 CDN
反向代理：Nginx / Traefik
负载均衡：ALB (云厂商提供)
```

---

## 📁 项目目录结构 (NestJS)

```
zhiqu-platform-backend/
├── src/
│   ├── common/                    # 公共模块
│   │   ├── decorators/           # 自定义装饰器
│   │   ├── filters/              # 异常过滤器
│   │   ├── guards/               # 权限守卫
│   │   ├── interceptors/         # 拦截器
│   │   ├── pipes/                # 数据管道
│   │   └── utils/                # 工具函数
│   │
│   ├── modules/                  # 业务模块（核心）
│   │   ├── auth/                 # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/              # 数据传输对象
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── login.dto.ts
│   │   │   └── strategies/       # JWT/Google OAuth 策略
│   │   │
│   │   ├── users/                # 用户模块
│   │   ├── projects/             # 项目模块
│   │   ├── suppliers/            # 供应商模块
│   │   ├── budget/               # 预算模块
│   │   ├── notifications/        # 通知模块
│   │   ├── monitoring/           # 监控模块
│   │   ├── payments/             # 支付模块
│   │   └── ai-assistant/         # AI 助手模块
│   │
│   ├── database/                 # 数据库配置
│   │   ├── entities/             # ORM 实体
│   │   ├── migrations/           # 数据库迁移脚本
│   │   └── seeds/                # 初始数据
│   │
│   ├── app.module.ts             # 根模块
│   ├── main.ts                   # 入口文件
│   └── config/                   # 环境配置
│       ├── config.module.ts
│       └── env.validation.ts
│
├── test/                         # 单元测试
├── docs/                         # API 文档
├── docker-compose.yml            # 本地开发环境
├── nest-cli.json                 # Nest 配置文件
└── package.json
```

**关键**: `modules/` 目录下的每个业务模块都是独立的！未来可以这样拆分：

```bash
# 当前（模块化单体）
modules/projects/project.module.ts

# 3 个月后拆分成独立服务
git subtree split -b project-service --prefix modules/projects
docker build -t project-service .
kubectl apply -f k8s/project-service.yaml
```

---

## 🔧 核心代码示例

### 1. 用户模块示例

```typescript
// src/modules/users/users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService] // 其他模块可以 inject 使用
})
export class UsersModule {}

// src/modules/users/users.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    user.password = await bcrypt.hash(user.password, 10);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['roles'] });
  }
}
```

### 2. 分页查询实现

```typescript
// src/common/pagination/paginated-response.interface.ts
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string | null;
    current: string;
    next: string | null;
    last: string;
  };
}

// src/common/filters/query-filter.interceptor.ts
@ApplyDecorators(
  Query('page', new DefaultValuePipe(1), new TypeValidatorPipe(Number)),
  Query('limit', new DefaultValuePipe(20), new TypeValidatorPipe(Number)),
)
export class QueryFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}
```

### 3. 事件驱动解耦（为未来做准备）

```typescript
// src/common/events/project-events.enum.ts
export enum ProjectEvents {
  CREATED = 'project.created',
  STATUS_CHANGED = 'project.status_changed',
  BUDGET_EXCEEDED = 'project.budget_exceeded',
}

// src/modules/projects/project.service.ts
@Injectable()
export class ProjectService {
  constructor(
    private eventEmitter: EventEmitter2, // 安装 @nestjs/event-emitter
  ) {}

  async updateStatus(id: number, status: string) {
    const project = await this.projectRepository.update(id, { status });
    
    // 发布事件，通知模块监听
    this.eventEmitter.emit(ProjectEvents.STATUS_CHANGED, { projectId: id, status });
    
    return project;
  }
}

// src/modules/notifications/notification.consumer.ts
@OnEvent(ProjectEvents.STATUS_CHANGED)
handleProjectStatusChange(payload: any) {
  // 自动创建通知记录
  this.notificationService.create({
    userId: payload.userId,
    type: 'progress',
    message: `项目状态已更新为 ${payload.status}`,
  });
}
```

**好处**: 各模块之间不直接调用，通过事件通信 → 未来拆分时天然就是 RPC 调用模式

---

## 📊 数据库设计 (PostgreSQL)

### ER 图概览

```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role ENUM('customer', 'supplier', 'designer', 'admin') DEFAULT 'customer',
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联（支持多角色）
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- 项目表
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    house_type ENUM('new_build', 'renovation', 'villa', 'apartment') NOT NULL,
    area_m2 DECIMAL(10, 2),
    location JSONB, -- {province, city, district, address}
    style_tags TEXT[], -- 风格标签数组
    status ENUM('draft', 'planning', 'construction', 'inspection', 'completed') DEFAULT 'draft',
    progress DECIMAL(5, 2) DEFAULT 0,
    budget_total DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 施工团队表
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_license TEXT,
    qualification_certificates TEXT[],
    supplier_type ENUM('construction', 'decoration', 'design', 'material') NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending',
    tags TEXT[],
    portfolio_urls TEXT[],
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目 - 供应商关联（多对多）
CREATE TABLE project_suppliers (
    project_id INTEGER REFERENCES projects(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    role_assigned VARCHAR(50),
    contract_amount DECIMAL(12, 2),
    start_work_date DATE,
    end_work_date DATE,
    status ENUM('quoted', 'hired', 'working', 'completed', 'cancelled') DEFAULT 'quoted',
    PRIMARY KEY (project_id, supplier_id)
);

-- 预算明细表
CREATE TABLE budget_items (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    category VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    unit_price DECIMAL(10, 2),
    quantity DECIMAL(10, 2),
    total_amount DECIMAL(12, 2),
    is_approved BOOLEAN DEFAULT FALSE,
    actual_amount DECIMAL(12, 2),
    variance_ratio DECIMAL(5, 2), -- 偏差率
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type ENUM('progress', 'warning', 'system', 'error') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    related_project_id INTEGER REFERENCES projects(id),
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at DESC)
);

-- 环境监测数据（时序数据优化）
CREATE TABLE environment_data (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    sensor_type VARCHAR(20) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    value_numeric DOUBLE PRECISION,
    value_text TEXT,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_time (project_id, recorded_at)
);

-- 索引优化建议
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_suppliers_verified ON suppliers(verified) WHERE verified = true;
CREATE INDEX idx_notifications_user_time ON notifications(user_id, created_at DESC);
```

### 分库分表策略（10 万用户阶段）

```sql
-- 1. 按用户 ID 哈希分片（水平分区）
-- 通知数据量大，单独分表
CREATE TABLE notifications_0 LIKE notifications;
CREATE TABLE notifications_1 LIKE notifications;
...
-- 使用 pg_partman 自动管理分区

-- 2. 历史数据归档
-- 超过 1 年的项目数据移动到历史库
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS projects_history LIKE projects;
    INSERT INTO projects_history
    SELECT * FROM projects 
    WHERE updated_at < NOW() - INTERVAL '1 year'
    AND status IN ('completed', 'cancelled');
END $$;
```

---

## 🔥 性能优化清单

### 第 1 层：应用层优化

```typescript
// 1. 响应式加载
@Get('projects')
async getProjects(@Query() query: PaginationQuery) {
  const { page = 1, limit = 20, ...filters } = query;
  
  // 只查询需要的字段
  return this.projectRepository.find({
    skip: (page - 1) * limit,
    take: limit,
    where: filters,
    select: ['id', 'name', 'status', 'progress', 'ownerId'], // 排除大字段
    relations: ['owner'],
    order: { createdAt: 'DESC' }
  });
}

// 2. 数据库连接池配置
typeorm.config.ts:
{
  options: {
    max: 20, // 最大连接数
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

// 3. 静态资源 CDN 配置
// nginx.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    proxy_pass https://cdn.zhiqu.com$request_uri;
    add_header Cache-Control "public, immutable";
}
```

### 第 2 层：缓存策略

```typescript
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@Controller('suppliers')
export class SupplierController {
  @Get('list')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('suppliers:all:$filters')
  @CacheTTL(300) // 5 分钟
  async getAllSuppliers(@Query() filters: any) {
    return this.supplierService.findAll(filters);
  }

  @Post(':id/rating')
  @CacheKey('suppliers:rating:$id')
  @CacheTTL(0) // 立即失效
  async updateRating(@Param('id') id: number, @Body() rating: number) {
    await this.supplierService.updateRating(id, rating);
    return cacheManager.del(`suppliers:all:*`); // 清除列表缓存
  }
}
```

### 第 3 层：数据库优化

```sql
-- 1. 读写分离
-- 主库写，从库读
postgres-primary:5432 (WRITE)
postgres-replica-1:5432 (READ)
postgres-replica-2:5432 (READ)

-- 2. 热数据预热
SELECT pg_preload_extension('pg_stat_statements');

-- 3. 慢查询日志
ALTER SYSTEM SET log_min_duration_statement = '1000'; -- 记录超过 1s 的 SQL

-- 4. EXPLAIN 分析执行计划
EXPLAIN ANALYZE 
SELECT * FROM projects p
JOIN budget_items b ON p.id = b.project_id
WHERE p.owner_id = 123;
```

### 第 4 层：消息队列削峰

```typescript
// 使用 BullMQ 处理耗时任务
const notificationQueue = new Queue('notifications', {
  connection: redisConfig,
});

async function sendBatchNotifications(notifications: Notification[]) {
  // 异步入队，不阻塞接口
  for (const notif of notifications) {
    await notificationQueue.add({
      userId: notif.userId,
      type: notif.type,
      message: notif.message,
    });
  }
}

// Worker 消费队列
const worker = new Worker('notifications', async job => {
  const { userId, type, message } = job.data;
  await smsGateway.send(userId, message);
  await emailGateway.send(userId, type, message);
}, { connection: redisConfig });
```

---

## 🛡️ 安全防护

### 1. JWT 令牌刷新机制

```typescript
// access_token: 15 分钟有效
// refresh_token: 7 天有效，存储在 HttpOnly Cookie

@Post('auth/refresh')
async refreshToken(@Request() req) {
  const refreshToken = req.cookies['refreshToken'];
  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  
  const user = await this.userService.findById(decoded.userId);
  
  return {
    accessToken: jwt.sign(
      { sub: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )
  };
}
```

### 2. 速率限制

```typescript
app.useThrottler({
  throttlers: [{
    ttl: 60, // 60 秒
    limit: 100, // 允许 100 次请求
    prefix: 'throttle:',
  }],
  storageProvider: {
    // 使用 Redis 存储计数器
    provider: 'redis',
    connect: { host: 'localhost', port: 6379 }
  }
});
```

### 3. SQL 注入防护

```typescript
// TypeORM 自动参数化查询
userRepository.find({
  where: { email: req.body.email } // 自动转义特殊字符
});

// ❌ 禁止原生拼接
// repository.query(`SELECT * FROM users WHERE email = '${email}'`)
```

---

## 📈 监控告警体系

### Prometheus 指标采集

```typescript
import * as client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: '请求时长分布',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || '*', status_code: res.statusCode });
  });
  next();
});
```

### Grafana 看板指标

- QPS / 错误率 / 平均响应时间
- CPU / 内存 / 磁盘 I/O
- 数据库连接池使用率
- Redis 命中率
- 消息队列积压量

---

## 🚀 部署流程

### Docker Compose (开发环境)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: zhiqu
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: zhiqu_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      discovery.type: single-node
      xpack.security.enabled: false
    ports:
      - "9200:9200"

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://zhiqu:devpassword@postgres:5432/zhiqu_platform
      REDIS_URL: redis://redis:6379

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes (生产环境)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zhiqu-api
spec:
  replicas: 3  # 至少 3 个副本保证高可用
  selector:
    matchLabels:
      app: zhiqu-api
  template:
    metadata:
      labels:
        app: zhiqu-api
    spec:
      containers:
        - name: api
          image: registry.cn-hangzhou.aliyuncs.com/zhiqu/api:v3.0.0
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## 💰 成本预估

### 月花费（10 万用户规模）

| 服务 | 规格 | 费用 |
|------|------|------|
| ECS 服务器 | 4 核 8G × 3 台 | ¥1,200 |
| RDS PostgreSQL | 4 核 16G 高可用 | ¥1,500 |
| Redis 集群 | 3 主 3 从 | ¥800 |
| Elasticsearch | 2 节点 | ¥600 |
| OSS 对象存储 | 500GB + 流量 | ¥200 |
| CDN 加速 | 1TB 流量包 | ¥300 |
| 短信服务 | 50 万条 | ¥2,500 |
| **总计** | | **¥7,100/月** |

**对比**: 如果采用完全托管云服务（如 AWS），成本会翻倍；自建 + 合理配置是关键。

---

## 🔄 升级路径

```
v3.0 (现在)     →   v4.0 (6 个月)    →   v5.0 (12 个月)
模块化单体      →   拆分热点模块     →   完整微服务
Express/NestJS  →   NestJS 统一      →   Go/Rust重写高性能服务
单 PostgreSQL    →   读写分离        →   分库分表
单机 Redis       →   Redis Cluster   →   Redis + Memcached混合
```

**关键转折点**:
- **DAU > 5,000**: 考虑拆分 `monitoring` 模块（高频写入）
- **DAU > 20,000**: 引入 ES 做全文检索
- **DAU > 50,000**: 拆分 `notification` 模块（消息量大）

---

## 📚 学习资源

- **NestJS 官方文档**: https://docs.nestjs.com
- **Vue 3 实战**: 《Vue.js 设计与实现》
- **PostgreSQL 调优**: 《High Performance PostgreSQL》
- **系统架构设计**: 《微服务架构设计模式》(Chris Richardson)

---

**总结**: 
选择**NestJS 模块化单体**起步，用**事件驱动架构**保持模块松耦合，配合**PostgreSQL + Redis + Elasticsearch**三剑客，可以在保证开发速度的同时，为未来的 10 万用户量级打下坚实基础。

当业务增长触发瓶颈时，只需逐步拆分模块、添加中间层，无需推倒重来！🚀

---

*最后更新：2026-03-12 20:42 GMT+8*
