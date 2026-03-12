// 筑栖平台 - Node.js 后端服务
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '../src')));

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 简单的数据存储类
class DataStore {
    constructor(fileName) {
        this.fileName = fileName;
        this.filePath = path.join(DATA_DIR, fileName);
        this.data = this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const content = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error(`Error loading ${this.fileName}:`, error);
        }
        return [];
    }
    
    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error saving ${this.fileName}:`, error);
        }
    }
    
    getAll() {
        return this.data;
    }
    
    getById(id) {
        return this.data.find(item => item.id === id);
    }
    
    create(item) {
        item.id = Date.now();
        item.createdAt = new Date().toISOString();
        this.data.push(item);
        this.save();
        return item;
    }
    
    update(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date().toISOString() };
            this.save();
            return this.data[index];
        }
        return null;
    }
    
    delete(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            const deleted = this.data.splice(index, 1)[0];
            this.save();
            return deleted;
        }
        return null;
    }
    
    findByField(field, value) {
        return this.data.filter(item => item[field] === value);
    }
}

// 初始化数据存储
const usersStore = new DataStore('users.json');
const projectsStore = new DataStore('projects.json');
const suppliersStore = new DataStore('suppliers.json');
const notificationsStore = new DataStore('notifications.json');
const budgetsStore = new DataStore('budgets.json');

// ==================== 用户相关 API ====================

// 用户注册
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, phone } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }
    
    // 检查用户是否存在
    const existingUser = usersStore.findByField('email', email);
    if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }
    
    // 创建用户
    const user = usersStore.create({
        username,
        email,
        password: hashPassword(password), // 实际应该使用 bcrypt
        phone,
        role: 'customer',
        status: 'active'
    });
    
    // 删除密码后返回
    delete user.password;
    
    res.status(201).json({ 
        success: true, 
        message: '注册成功',
        data: user 
    });
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: '请输入邮箱和密码' });
    }
    
    const users = usersStore.findByField('email', email);
    const user = users[0];
    
    if (!user) {
        return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    
    if (user.password !== hashPassword(password)) {
        return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
    
    // 删除密码
    delete user.password;
    
    // 生成简单 token（实际应该使用 JWT）
    const token = generateToken(user.id);
    
    res.json({ 
        success: true, 
        message: '登录成功',
        data: {
            user,
            token
        }
    });
});

// 获取当前用户信息
app.get('/api/users/me', (req, res) => {
    // 从 token 中解析用户 ID（简化实现）
    const userId = req.headers['x-user-id'] || 1;
    const user = usersStore.getById(userId);
    
    if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    delete user.password;
    res.json({ success: true, data: user });
});

// ==================== 项目相关 API ====================

// 获取所有项目
app.get('/api/projects', (req, res) => {
    const projects = projectsStore.getAll();
    res.json({ success: true, data: projects });
});

// 获取单个项目
app.get('/api/projects/:id', (req, res) => {
    const project = projectsStore.getById(parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    res.json({ success: true, data: project });
});

// 创建项目
app.post('/api/projects', (req, res) => {
    const projectData = req.body;
    
    // 添加默认状态
    projectData.status = projectData.status || 'draft';
    projectData.progress = projectData.progress || 0;
    
    const project = projectsStore.create(projectData);
    
    res.status(201).json({ success: true, message: '项目创建成功', data: project });
});

// 更新项目
app.put('/api/projects/:id', (req, res) => {
    const project = projectsStore.update(parseInt(req.params.id), req.body);
    
    if (!project) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    res.json({ success: true, message: '项目更新成功', data: project });
});

// 删除项目
app.delete('/api/projects/:id', (req, res) => {
    const deleted = projectsStore.delete(parseInt(req.params.id));
    
    if (!deleted) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    res.json({ success: true, message: '项目已删除' });
});

// ==================== 施工团队 API ====================

// 获取所有施工团队
app.get('/api/suppliers', (req, res) => {
    const { type, verified } = req.query;
    let suppliers = suppliersStore.getAll();
    
    if (type) {
        suppliers = suppliers.filter(s => s.type === type);
    }
    
    if (verified === 'true') {
        suppliers = suppliers.filter(s => s.verified === true);
    }
    
    res.json({ success: true, data: suppliers });
});

// 获取单个施工团队
app.get('/api/suppliers/:id', (req, res) => {
    const supplier = suppliersStore.getById(parseInt(req.params.id));
    
    if (!supplier) {
        return res.status(404).json({ success: false, message: '施工团队不存在' });
    }
    
    res.json({ success: true, data: supplier });
});

// 申请入驻
app.post('/api/suppliers/application', (req, res) => {
    const application = {
        ...req.body,
        status: 'pending',
        applyDate: new Date().toISOString()
    };
    
    const created = suppliersStore.create(application);
    
    // 发送审核通知（模拟）
    sendAdminNotification(`收到新的施工团队入驻申请：${application.teamName}`);
    
    res.status(201).json({ 
        success: true, 
        message: '申请提交成功，我们将在 1-3 个工作日内完成审核',
        data: created 
    });
});

// 审核入驻申请（管理员）
app.post('/api/suppliers/:id/approve', (req, res) => {
    const { approved } = req.body;
    const supplier = suppliersStore.getById(parseInt(req.params.id));
    
    if (!supplier) {
        return res.status(404).json({ success: false, message: '申请不存在' });
    }
    
    if (supplier.status !== 'pending') {
        return res.status(400).json({ success: false, message: '该申请已处理' });
    }
    
    if (approved) {
        supplier.verified = true;
        supplier.status = 'active';
        res.json({ success: true, message: '审核通过', data: supplier });
    } else {
        supplier.status = 'rejected';
        res.json({ success: true, message: '申请已拒绝' });
    }
});

// ==================== 通知 API ====================

// 获取用户的未读通知数量
app.get('/api/notifications/unread-count', (req, res) => {
    const notifications = notificationsStore.getAll();
    const unreadCount = notifications.filter(n => n.unread).length;
    
    res.json({ success: true, data: { count: unreadCount } });
});

// 标记通知为已读
app.put('/api/notifications/:id/read', (req, res) => {
    const notification = notificationsStore.update(parseInt(req.params.id), { unread: false });
    
    if (!notification) {
        return res.status(404).json({ success: false, message: '通知不存在' });
    }
    
    res.json({ success: true, message: '已标记为已读' });
});

// 标记所有通知为已读
app.put('/api/notifications/mark-all-read', (req, res) => {
    let updated = 0;
    const notifications = notificationsStore.getAll();
    
    notifications.forEach(n => {
        if (n.unread) {
            notificationsStore.update(n.id, { unread: false });
            updated++;
        }
    });
    
    notificationsStore.save(); // 保存更改
    
    res.json({ success: true, message: `已将 ${updated} 条通知标记为已读` });
});

// ==================== 预算管理 API ====================

// 获取项目预算
app.get('/api/budgets/:projectId', (req, res) => {
    const budget = budgetsStore.findByField('projectId', parseInt(req.params.id))[0];
    
    if (!budget) {
        return res.status(404).json({ success: false, message: '该项目暂无预算记录' });
    }
    
    res.json({ success: true, data: budget });
});

// 创建预算
app.post('/api/budgets', (req, res) => {
    const budget = budgetsStore.create(req.body);
    
    res.status(201).json({ success: true, message: '预算创建成功', data: budget });
});

// 更新预算
app.put('/api/budgets/:id', (req, res) => {
    const budget = budgetsStore.update(parseInt(req.params.id), req.body);
    
    if (!budget) {
        return res.status(404).json({ success: false, message: '预算记录不存在' });
    }
    
    res.json({ success: true, message: '预算更新成功', data: budget });
});

// ==================== 文件上传 API ====================

// 安装 multer 用于文件上传
const multer = require('multer');
const upload = multer({ 
    dest: path.join(__dirname, 'uploads'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 上传图片
app.post('/api/upload/image', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传文件' });
    }
    
    res.json({ 
        success: true, 
        message: '上传成功',
        data: {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            size: req.file.size
        }
    });
});

// ==================== 监控数据 API ====================

// 获取环境监测数据
app.get('/api/monitoring/environment/:projectId', (req, res) => {
    // 模拟实时环境数据
    const envData = {
        temperature: (20 + Math.random() * 10).toFixed(1),
        humidity: (40 + Math.random() * 30).toFixed(1),
        pm2_5: Math.floor(25 + Math.random() * 50),
        co2: Math.floor(400 + Math.random() * 200),
        timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: envData });
});

// 获取施工进度
app.get('/api/monitoring/progress/:projectId', (req, res) => {
    const project = projectsStore.getById(parseInt(req.params.id));
    
    if (!project) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    
    // 模拟进度阶段
    const stages = [
        { name: '规划设计', percent: 10 },
        { name: '基础工程', percent: 30 },
        { name: '主体结构', percent: 50 },
        { name: '水电改造', percent: 70 },
        { name: '装饰装修', percent: 90 },
        { name: '竣工验收', percent: 100 }
    ];
    
    res.json({ 
        success: true, 
        data: {
            currentProgress: project.progress || 0,
            currentStage: stages[Math.min(Math.floor(project.progress / 10), stages.length - 1)],
            stages
        }
    });
});

// ==================== 健康检查 ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==================== 错误处理 ====================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: '接口不存在' 
    });
});

// ==================== 辅助函数 ====================

function hashPassword(password) {
    // 简化的哈希函数，生产环境请使用 bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function generateToken(userId) {
    // 简化的 token 生成，生产环境请使用 JWT
    return `token_${userId}_${Date.now()}`;
}

function sendAdminNotification(message) {
    console.log(`[ADMIN NOTIFICATION] ${message}`);
    // 实际应发送邮件或站内信给管理员
}

// ==================== 启动服务 ====================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🏠 筑栖平台 - 后端服务已启动              ║
║                                            ║
║   访问地址：http://localhost:${PORT}         ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
    
    // 初始化示例数据
    initSampleData();
});

// 初始化示例数据
function initSampleData() {
    // 检查是否需要初始化
    if (usersStore.getAll().length === 0) {
        console.log('\n正在初始化示例数据...\n');
        
        // 创建管理员账户
        usersStore.create({
            username: 'admin',
            email: 'admin@zhiqu.com',
            password: hashPassword('admin123'),
            role: 'admin',
            status: 'active'
        });
        
        console.log('✓ 管理员账户已创建 (admin@zhiqu.com / admin123)');
        
        // 创建示例施工团队
        suppliersStore.create({
            teamName: '匠心建筑团队',
            contactName: '王建国',
            phone: '138****5678',
            type: 'construction',
            verified: true,
            rating: 4.9,
            reviewCount: 156,
            projectsCompleted: 234,
            tags: ['自建房屋', '框架结构', '别墅建造'],
            status: 'active'
        });
        
        console.log('✓ 示例施工团队已创建');
        console.log('\n示例数据初始化完成！\n');
    }
}

module.exports = app;
