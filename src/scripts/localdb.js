// 筑栖平台 - 本地存储模块 (模拟数据库)
// 使用 IndexedDB 或 localStorage 作为临时数据存储

class LocalDB {
    constructor() {
        this.dbName = 'zhiqu_platform_db';
        this.version = 1;
    }

    // 获取表数据
    async getAll(table) {
        try {
            const data = localStorage.getItem(`${this.dbName}_${table}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading from ${table}:`, error);
            return [];
        }
    }

    // 设置表数据
    async setAll(table, data) {
        try {
            localStorage.setItem(`${this.dbName}_${table}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving to ${table}:`, error);
            return false;
        }
    }

    // 添加单条记录
    async add(table, record) {
        try {
            const data = await this.getAll(table);
            record.id = Date.now();
            record.createdAt = new Date().toISOString();
            data.push(record);
            await this.setAll(table, data);
            return record;
        } catch (error) {
            console.error(`Error adding to ${table}:`, error);
            return null;
        }
    }

    // 更新单条记录
    async update(table, id, updates) {
        try {
            const data = await this.getAll(table);
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
                await this.setAll(table, data);
                return data[index];
            }
            return null;
        } catch (error) {
            console.error(`Error updating ${table}:`, error);
            return null;
        }
    }

    // 删除单条记录
    async delete(table, id) {
        try {
            const data = await this.getAll(table);
            const filtered = data.filter(item => item.id !== id);
            await this.setAll(table, filtered);
            return true;
        } catch (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }
    }

    // 查询
    async query(table, condition) {
        try {
            const data = await this.getAll(table);
            return data.filter(condition);
        } catch (error) {
            console.error(`Error querying ${table}:`, error);
            return [];
        }
    }

    // 初始化测试数据
    async initTestData() {
        // 用户表
        const users = await this.query('users', () => false);
        if (users.length === 0) {
            await this.add('users', { username: 'admin', password: '123456', role: 'customer', name: '管理员', email: 'admin@zhiqu.com' });
            await this.add('users', { username: 'user1', password: '123456', role: 'customer', name: '客户小王', email: 'user1@zhiqu.com' });
            console.log('✅ 初始化用户数据完成');
        }

        // 项目表
        const projects = await this.query('projects', () => false);
        if (projects.length === 0) {
            await this.add('projects', { 
                title: '李明住宅建设项目', 
                location: '北京市朝阳区建国路 123 号',
                area: 120,
                status: 'in_progress',
                progress: 65,
                budget: 1200000,
                spent: 780000
            });
            console.log('✅ 初始化项目数据完成');
        }

        // 施工团队表
        const teams = await this.query('teams', () => false);
        if (teams.length === 0) {
            await this.add('teams', { name: '宏达建设集团', rating: 4.9, completedProjects: 528, certified: true });
            await this.add('teams', { name: '匠心装修工作室', rating: 4.7, completedProjects: 312, certified: true });
            console.log('✅ 初始化施工团队数据完成');
        }

        // 材料表
        const materials = await this.query('materials', () => false);
        if (materials.length === 0) {
            await this.add('materials', { name: '水泥 P.O 42.5', price: 45, unit: '包', stock: 1000, supplier: '海螺水泥' });
            await this.add('materials', { name: '螺纹钢 HRB400', price: 3800, unit: '吨', stock: 50, supplier: '宝钢股份' });
            console.log('✅ 初始化材料数据完成');
        }

        console.log('🎉 所有测试数据初始化完成！');
    }
}

// 全局实例
const db = new LocalDB();

// 在页面加载时初始化测试数据
document.addEventListener('DOMContentLoaded', async function() {
    await db.initTestData();
});

export { LocalDB, db };