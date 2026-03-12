# 🚀 筑栖平台 - 快速启动指南

## ⚡ 5 分钟跑通前后端

### Step 1: 启动后端服务

```bash
cd server/nestjs

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 编辑.env，至少填写以下字段：
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=zhiqu_platform
JWT_SECRET=my-super-secret-key-minimum-32-chars

# 启动开发服务器（带热重载）
npm run start:dev
```

**预期输出**:
```
╔════════════════════════════════════════════╗
║                                            ║
║   🏠 筑栖平台 v3.0.0                        ║
║   🚀 模块化单体架构 (支持 10 万用户)              ║
║                                            ║
║   服务地址：http://localhost:3000            ║
║   API 文档：http://localhost:3000/api-docs    ║
║                                            ║
╚════════════════════════════════════════════╝
```

---

### Step 2: 启动前端服务

选择任意一个方式：

**方式 A: Python 本地服务器（最简单）**
```bash
cd src
python -m http.server 8080
```

**方式 B: Node.js serve**
```bash
npx serve src -p 8080
```

**方式 C: VS Code Live Server**
1. 安装 "Live Server" 扩展
2. 在 `src/index.html` 右键 → Open with Live Server

**预期效果**:
打开浏览器访问 `http://localhost:8080`

---

### Step 3: 验证前后端连通

#### 3.1 访问 API 文档
```
http://localhost:3000/api-docs
```

尝试调用登录接口：
```json
POST /auth/login
{
  "email": "admin@zhiqu.com",
  "password": "admin123"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@zhiqu.com",
      "role": "admin"
    }
  }
}
```

#### 3.2 测试前端调用

1. 打开 `http://localhost:8080/pages/login.html`
2. 输入账号：`admin@zhiqu.com` / `admin123`
3. 点击登录
4. 观察控制台日志：
   ```javascript
   // 成功登录后会看到：
   Console: API Request Success: POST /auth/login
   ```

---

## 📋 功能对照表

| 前端页面 | 后端 API | 状态 | 说明 |
|---------|---------|------|------|
| **登录/注册** | `/auth/*` | ✅ | 已完成对接 |
| **项目列表** | `/projects` | ✅ | 已完成对接 |
| **创建项目** | `POST /projects` | ✅ | 已完成对接 |
| **施工团队** | `/suppliers` | 🟡 | 需改造数据源 |
| **预算管理** | `/budgets` | 🟡 | 需改造数据源 |
| **环境监控** | `/monitoring/*` | 🔴 | WebSocket 待实现 |

---

## 🔧 常见问题排查

### Q1: 后端无法启动？
```bash
# 检查 Node 版本
node --version  # 应该 >= 18

# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q2: 数据库连接失败？
```bash
# 1. 确认 PostgreSQL 已安装并启动
# Windows: 服务管理器 → PostgreSQL → 启动
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# 2. 修改.env 中的数据库连接信息
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=你的用户名
DATABASE_PASSWORD=你的密码
DATABASE_NAME=zhiqu_platform
```

### Q3: 跨域错误（CORS）？
**症状**: 前端报错 `Access to fetch at ... from origin 'http://localhost:8080' has been blocked by CORS policy`

**解决**: 
后端 `main.ts` 已经配置了 CORS，确保设置正确的端口：
```typescript
app.enableCors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
});
```

### Q4: Token 失效/未登录？
```javascript
// 清除旧的 token
localStorage.removeItem('auth_token');

// 重新登录获取新的
const res = await window.apiClient.login(email, password);
console.log(res.data.accessToken); // 保存这个 token
```

---

## 🎯 下一步开发计划

### P0 - 核心功能完整对接（本周）
- [ ] 供应商列表展示 → `GET /suppliers`
- [ ] 预算明细查询 → `GET /budgets?projectId=x`
- [ ] 通知中心 → `GET /notifications`

### P1 - 用户体验优化（下周）
- [ ] Toast 提示组件替代 alert()
- [ ] 加载状态动画
- [ ] 表单验证反馈
- [ ] 图片上传预览 + OSS 存储

### P2 - 高级功能（下月）
- [ ] WebSocket 实时推送环境监测
- [ ] Vue 3 重构（可选）
- [ ] TypeScript 类型定义生成
- [ ] E2E 自动化测试

---

## 💻 开发环境要求

| 工具 | 最低版本 | 推荐版本 |
|------|---------|----------|
| Node.js | 18 LTS | 20 LTS |
| PostgreSQL | 14 | 16 |
| npm / yarn | 9 | 10 |
| Git | 2.x | latest |

---

## 📞 技术支持

遇到问题可以：
1. 查看 Swagger API 文档验证后端是否正常
2. 检查浏览器 Console 日志
3. 查看后端终端输出
4. 查阅 `docs/ARCHITECTURE.md` 了解设计细节

---

## ✨ 快速命令速查

```bash
# 启动后端
cd server/nestjs && npm run start:dev

# 启动前端
cd src && python -m http.server 8080

# 查看日志
tail -f server/nestjs/*.log

# 重置数据库
docker-compose down -v && docker-compose up -d

# 构建生产包
cd server/nestjs && npm run build
```

---

**最后更新**: 2026-03-12 21:30 GMT+8  
**Git 仓库**: https://github.com/ThatMaybeGood/openClawPro
