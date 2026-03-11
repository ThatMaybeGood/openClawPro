# 筑栖平台 - 项目文档

## 📚 目录结构说明

```
zhiqu-platform/
├── src/                        # 源代码目录
│   ├── index.html              # 首页
│   ├── pages/                  # 子页面目录
│   │   ├── dashboard.html      # 控制台
│   │   ├── upload-plan.html    # 户型上传页
│   │   ├── team-select.html    # 施工团队选择
│   │   ├── materials.html      # 材料供应页
│   │   ├── monitoring.html     # 施工监控页
│   │   └── design-budget.html  # 设计与预算页
│   ├── styles/                 # 样式文件
│   │   ├── main.css            # 主样式
│   │   ├── dashboard.css       # 控制台样式
│   │   └── mobile.css          # 移动端适配
│   └── scripts/                # JavaScript 文件
│       ├── app.js              # 主逻辑
│       ├── dashboard.js        # 控制台逻辑
│       └── api.js              # API 接口封装
├── docs/                       # 文档目录
│   ├── README.md               # 项目说明
│   ├── API.md                  # API 文档
│   ├── DATABASE.md             # 数据库设计
│   └── DEPLOY.md               # 部署指南
├── config/                     # 配置文件
│   ├── dev.env                 # 开发环境
│   └── prod.env                # 生产环境
├── assets/                     # 资源文件
│   ├── images/                 # 图片资源
│   └── icons/                  # 图标文件
└── tests/                      # 测试文件
    └── unit.tests.js           # 单元测试
```

## 🎯 核心模块说明

### 1. 用户系统（User System）
**功能：**
- 用户注册/登录/登出
- 身份认证（JWT Token）
- 角色权限管理（客户/施工方/材料商/管理员）
- 个人信息管理
- 历史项目查看

### 2. 项目管理（Project Management）
**功能：**
- 创建新工程项目
- 项目信息管理（地点、面积、风格等）
- 项目进度跟踪
- 里程碑节点设置
- 项目相册管理

### 3. 方案设计（Design Service）
**功能：**
- 户型图上传与解析
- AI 辅助设计方案
- 多方案对比
- 3D 效果图预览
- 设计修改记录

### 4. 施工团队（Construction Teams）
**功能：**
- 团队展示与搜索
- 资质审核与认证
- 案例作品集
- 用户评价系统
- 在线报价对比

### 5. 材料供应链（Material Supply）
**功能：**
- 材料商品展示
- 价格实时查询
- 库存管理
- 订单下单追踪
- 物流配送状态

### 6. 施工监控（Monitoring）
**功能：**
- 实时监控视频接入
- IoT 设备数据集成
- 天气环境数据
- 施工质量拍照上传
- 问题反馈与整改
- 验收确认流程

### 7. 预算管理（Budget Control）
**功能：**
- 分项明细报价
- 费用变更审批
- 支付进度跟踪
- 发票管理
- 成本分析报告

### 8. 消息通知（Notifications）
**功能：**
- 站内信系统
- 短信提醒
- 邮件推送
- 紧急告警
- 项目关键节点通知

## 🔧 技术实现细节

### 前端技术栈
- **框架**: Vue.js 3 / React 18 (可选)
- **UI 组件**: Element Plus / Ant Design
- **状态管理**: Pinia / Redux Toolkit
- **路由**: Vue Router / React Router
- **构建工具**: Vite

### 后端技术栈
- **API 服务**: Node.js + Express / Python FastAPI
- **数据库**: PostgreSQL + Redis (缓存)
- **文件存储**: MinIO / Aliyun OSS
- **消息队列**: RabbitMQ / Redis Stream
- **WebSocket**: 实时通信支持

### 监控集成
- **气象 API**: 和风天气 / OpenWeather
- **IoT 协议**: MQTT 设备接入
- **视频流**: RTSP → WebSocket
- **地理位置**: 高德地图 API

## 📊 数据库表设计（概览）

### 用户相关表
- `users` - 用户基本信息
- `user_profiles` - 用户详细资料
- `roles` - 角色定义
- `permissions` - 权限配置
- `user_roles` - 用户角色关联

### 项目相关表
- `projects` - 项目主表
- `project_documents` - 项目文档
- `project_milestones` - 项目里程碑
- `project_photos` - 项目照片

### 设计相关表
- `design_proposals` - 设计方案
- `design_versions` - 设计版本记录
- `floor_plans` - 平面图数据

### 施工相关表
- `construction_teams` - 施工团队信息
- `team_certifications` - 团队资质认证
- `construction_logs` - 施工日志
- `quality_issues` - 质量问题记录

### 材料相关表
- `materials` - 材料商品信息
- `suppliers` - 供应商信息
- `orders` - 采购订单
- `order_items` - 订单项
- `inventory` - 库存数据

### 监控相关表
- `iot_devices` - IoT 设备信息
- `monitoring_data` - 监控数据采集
- `weather_logs` - 天气历史记录
- `video_streams` - 视频监控链接

### 预算相关表
- `budgets` - 预算主表
- `budget_items` - 预算明细项
- `price_changes` - 价格变更记录
- `payments` - 支付记录
- `invoices` - 发票信息

### 消息通知表
- `notifications` - 站内信
- `notification_users` - 用户接收关系
- `sms_logs` - 短信发送记录
- `email_logs` - 邮件发送记录

## 🌐 API 接口设计（示例）

### 用户认证
```http
POST /api/v1/auth/register      # 用户注册
POST /api/v1/auth/login         # 用户登录
POST /api/v1/auth/logout        # 用户登出
GET  /api/v1/auth/profile       # 获取个人信息
PUT  /api/v1/auth/profile       # 更新个人信息
```

### 项目管理
```http
POST /api/v1/projects           # 创建项目
GET  /api/v1/projects           # 获取项目列表
GET  /api/v1/projects/:id       # 获取项目详情
PUT  /api/v1/projects/:id       # 更新项目
DELETE /api/v1/projects/:id     # 删除项目
GET  /api/v1/projects/:id/photos# 获取项目照片
```

### 施工监控
```http
GET  /api/v1/monitoring/live-video# 获取直播流
GET  /api/v1/monitoring/weather   # 获取天气数据
POST /api/v1/monitoring/report    # 上传质量报告
GET  /api/v1/monitoring/devices   # 获取设备列表
```

## 🚀 部署指南

### 本地开发环境
1. 安装 Node.js >= 18
2. 安装 PostgreSQL 和 Redis
3. 克隆仓库：`git clone git@github.com:ThatMaybeGood/openClawPro.git`
4. 进入项目目录并安装依赖：`npm install`
5. 配置环境变量（复制 `.env.example` 为 `.env`）
6. 启动开发服务器：`npm run dev`

### 生产部署
1. Docker 容器化部署（推荐）
2. Kubernetes 集群部署（大型项目）
3. 阿里云/腾讯云云服务器部署
4. Nginx 反向代理配置
5. SSL 证书配置

详细部署步骤见 `docs/DEPLOY.md`

## 🔒 安全考虑

1. **身份认证**: JWT Token + Refresh Token
2. **权限控制**: RBAC 基于角色的访问控制
3. **数据加密**: HTTPS + AES 加密存储敏感数据
4. **SQL 注入防护**: 参数化查询 + ORM 框架
5. **XSS 防护**: 输入验证 + 输出转义
6. **CSRF 防护**: Token 验证机制
7. **文件上传**: 文件格式白名单 + 大小限制
8. **速率限制**: API 调用频率控制
9. **日志审计**: 所有操作记录留痕
10. **备份策略**: 定期数据备份 + 灾难恢复

## 📱 移动端适配

### 响应式设计
- 采用 Flexbox + Grid 布局
- 媒体查询适配不同屏幕尺寸
- 触摸手势支持

### PWA 支持（计划中）
- 离线缓存
- 桌面应用快捷方式
- 推送通知

## 🧪 测试策略

### 单元测试
- Jest 前端测试框架
- 覆盖率要求 > 80%

### 集成测试
- E2E 测试使用 Playwright
- API 接口自动化测试

### 性能测试
- Lighthouse 性能评分优化
- 加载时间控制在 3 秒内
- TTI（可交互时间）< 2 秒

## 🔄 CI/CD 流程

1. Git push → GitHub Actions
2. 自动运行单元测试
3. 构建 Docker 镜像
4. 推送到私有 Registry
5. 自动部署到测试环境
6. 人工审核后部署到生产环境

---

_持续更新中..._ 🏗️