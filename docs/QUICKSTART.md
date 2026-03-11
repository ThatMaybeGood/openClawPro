# 筑栖平台 - 快速开始指南

## 🚀 立即体验 Demo

### 方式一：直接访问 GitHub Pages（推荐）

1. **克隆仓库到本地**
```bash
git clone git@github.com:ThatMaybeGood/openClawPro.git
cd zhiqu-platform
```

2. **启动本地服务器**（任选其一）

   **方法 A - Python HTTP Server:**
```bash
# Python 3.x
python -m http.server 8000

# 访问 http://localhost:8000
```

   **方法 B - Node.js HTTP Server:**
```bash
# 安装 npx（如果还没有）
npm install -g http-server

# 启动
http-server -p 8080

# 访问 http://localhost:8080
```

3. **访问 Demo 页面**
- 首页：`http://localhost:8000/index.html`
- Demo 中心：`http://localhost:8000/demo.html`
- 登录：`http://localhost:8000/pages/login.html`
- 控制台：`http://localhost:8000/pages/dashboard.html`

---

### 方式二：直接双击 HTML 文件

最简单的方式！只需：

1. 进入项目目录：`zhiqu-platform/src/`
2. 双击 `index.html`
3. 在浏览器中打开即可看到效果

> ⚠️ 注意：某些功能（如 LocalDB）需要服务器环境才能完整工作

---

## 🔍 测试平台功能

### 运行自动化测试

在任意页面打开浏览器开发者工具（F12），在 Console 中输入：

```javascript
// 运行所有测试
runAllTests()

// 查看测试结果
console.log(localStorage.getItem('zhiqu_last_test_result'))
```

测试内容包括：
- ✅ LocalDB 数据库操作
- ✅ 用户登录/注册系统
- ✅ 项目管理功能
- ✅ UI 组件响应式
- ✅ JavaScript 模块加载

---

## 🎯 核心功能演示路径

### 1. 新用户体验流程

```
demo.html (演示中心)
  ↓
login.html (登录页面)
  ├─ 使用账号：admin / 123456
  └─ 或使用：user1 / 123456
  ↓
dashboard.html (项目控制台)
  ├─ 查看所有项目统计
  └─ 查看实时施工监控
  ↓
monitoring.html (施工监控)
  ├─ 查看环境监测数据
  ├─ 上传质量问题报告
  └─ 添加施工日志
  ↓
budget.html (预算管理)
  ├─ 查看分项预算
  ├─ 审批价格变更
  └─ 管理支付记录
```

### 2. 典型用户使用场景

#### 场景 A：客户（建房业主）
1. 注册账号 → 完善个人信息
2. 创建新项目 → 上传宅基地信息
3. 选择施工团队 → 对比报价方案
4. 查看设计方案 → 确认预算明细
5. 实时监控进度 → 质量验收确认
6. 付款并验收 → 完成入住

#### 场景 B：施工方
1. 企业认证 → 展示资质案例
2. 接收项目投标 → 提交报价
3. 管理施工人员 → 分配任务
4. 每日施工日志 → 问题反馈上报
5. 材料采购申请 → 进度款确认
6. 竣工验收通过 → 获得评价

#### 场景 C：材料商
1. 供应商入驻 → 上传产品信息
2. 接收采购订单 → 安排配送
3. 更新库存状态 → 价格调整
4. 发货跟踪 → 确认收货
5. 对账结算 → 开具发票

---

## 📁 项目结构说明

```
zhiqu-platform/
├── src/                          # 源代码
│   ├── index.html                # 🏠 主页面
│   ├── demo.html                 # 🎯 Demo 演示中心
│   ├── pages/                    # 子页面
│   │   ├── login.html            # 🔐 登录页
│   │   ├── register.html         # 📝 注册页
│   │   ├── dashboard.html        # 📊 控制台
│   │   ├── monitoring.html       # 📹 施工监控
│   │   └── budget.html           # 💰 预算管理
│   ├── styles/                   # CSS 样式
│   │   └── main.css              # 主样式文件
│   └── scripts/                  # JavaScript
│       ├── app.js                # 主逻辑
│       ├── localdb.js            # 本地数据库
│       └── test.js               # 测试套件
├── docs/                         # 文档
│   ├── README.md                 # 项目说明
│   ├── API.md                    # API 接口文档
│   └── IMPROVEMENT.md            # 改进规划
└── .gitignore                    # Git 忽略配置
```

---

## 🧪 开发和测试环境

### 本地开发推荐配置

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | v18+ | 前端构建工具 |
| VS Code | 最新 | 代码编辑器 |
| Chrome/Firefox | 最新 | 浏览器调试 |
| Git | v2+ | 版本控制 |

### 常用命令

```bash
# 克隆项目
git clone git@github.com:ThatMaybeGood/openClawPro.git

# 进入项目目录
cd openClawPro/zhiqu-platform

# 启动本地服务（Python）
python -m http.server 8000

# 启动本地服务（Node.js）
npx http-server -p 8080

# 拉取最新代码
git pull origin main

# 推送本地更改
git push origin main
```

---

## 🔗 在线资源链接

- **GitHub 仓库**: https://github.com/ThatMaybeGood/openClawPro
- **项目文档**: `/docs/README.md`
- **API 文档**: `/docs/API.md`
- **改进规划**: `/docs/IMPROVEMENT.md`

---

## 📞 获取帮助

遇到问题？可以尝试以下方式：

1. **查看文档**: `docs/` 目录下有详细的技术文档
2. **运行测试**: 在控制台输入 `runAllTests()` 检查系统状态
3. **GitHub Issues**: 在仓库提交 Issue 反馈问题
4. **Email 支持**: support@zhiqu.com

---

## 🎉 下一步

Demo 已经准备好啦！你可以：

1. ✅ **立即体验**: 按照上面的步骤启动本地服务器
2. ✅ **探索功能**: 从 `demo.html` 开始浏览所有功能
3. ✅ **运行测试**: 验证各个模块是否正常工作
4. ✅ **准备上线**: 后续可以接入真实后端 API

有任何问题随时联系我们！🚀

---

_文档版本：v1.0 | 更新时间：2026-03-12_