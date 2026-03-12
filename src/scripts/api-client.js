/**
 * 筑栖平台 - 前后端 API Client
 * 替代 LocalDB，调用 NestJS 后端服务
 */

class APIClient {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    this.token = localStorage.getItem('auth_token') || null;
    
    // 配置拦截器
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * 设置 Token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 获取请求头
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * 统一请求方法
   */
  async request(url, options = {}) {
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
      baseURL: this.baseURL
    };

    try {
      const response = await fetch(this.buildUrl(url), config);
      
      // 处理未授权响应
      if (response.status === 401) {
        console.warn('Token 失效，清除认证信息');
        this.setToken(null);
        window.location.href = '/login.html';
        throw new Error('需要重新登录');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Failed:', url, error);
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { method: 'GET' });
  }

  /**
   * POST 请求
   */
  async post(url, body = {}) {
    return this.request(url, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    });
  }

  /**
   * PUT 请求
   */
  async put(url, body = {}) {
    return this.request(url, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    });
  }

  /**
   * DELETE 请求
   */
  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  }

  /**
   * 构建完整 URL
   */
  buildUrl(path) {
    if (path.startsWith('http')) return path;
    return `${this.baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // ========== 认证相关 API ==========

  /**
   * 用户注册
   */
  async register(userData) {
    return this.post('/auth/register', userData);
  }

  /**
   * 用户登录
   */
  async login(email, password, rememberMe = false) {
    const response = await this.post('/auth/login', { email, password, rememberMe });
    if (response.success && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }
    return response;
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken) {
    const response = await this.post('/auth/refresh', { refreshToken });
    if (response.success && response.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  /**
   * 退出登录
   */
  logout() {
    this.setToken(null);
    localStorage.clear();
  }

  // ========== 用户相关 API ==========

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return this.get('/users/me');
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, data) {
    return this.put(`/users/${userId}`, data);
  }

  // ========== 项目相关 API ==========

  /**
   * 获取我的项目列表
   */
  async getMyProjects(page = 1, limit = 20) {
    return this.get('/projects', { page, limit });
  }

  /**
   * 创建新项目
   */
  async createProject(projectData) {
    return this.post('/projects', projectData);
  }

  /**
   * 获取项目详情
   */
  async getProject(projectId) {
    return this.get(`/projects/${projectId}`);
  }

  /**
   * 更新项目信息
   */
  async updateProject(projectId, data) {
    return this.put(`/projects/${projectId}`, data);
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId) {
    return this.delete(`/projects/${projectId}`);
  }

  // ========== 供应商相关 API ==========

  /**
   * 获取施工团队列表
   */
  async getSuppliers(params = {}) {
    return this.get('/suppliers', params);
  }

  /**
   * 获取单个团队详情
   */
  async getSupplier(supplierId) {
    return this.get(`/suppliers/${supplierId}`);
  }

  /**
   * 提交入驻申请
   */
  async applySupplierApplication(applicationData) {
    return this.post('/suppliers/application', applicationData);
  }

  // ========== 预算相关 API ==========

  /**
   * 获取项目预算明细
   */
  async getProjectBudget(projectId, page = 1, limit = 50) {
    return this.get('/budgets', { projectId, page, limit });
  }

  /**
   * 创建预算项
   */
  async createBudgetItem(itemData) {
    return this.post('/budgets', itemData);
  }

  /**
   * 获取项目预算汇总
   */
  async getBudgetSummary(projectId) {
    return this.get(`/budgets/project/${projectId}/summary`);
  }

  /**
   * 获取超支预警
   */
  async getOverBudgetItems(projectId) {
    return this.get(`/budgets/project/${projectId}/over-budget`);
  }

  // ========== 通知相关 API ==========

  /**
   * 获取未读消息数量
   */
  async getUnreadNotificationCount() {
    const response = await this.get('/notifications/unread-count');
    return response.data?.count || 0;
  }

  /**
   * 获取通知列表
   */
  async getNotifications(unreadOnly = false, page = 1, limit = 20) {
    return this.get('/notifications', { unreadOnly, page, limit });
  }

  /**
   * 标记为已读
   */
  async markNotificationRead(notificationId) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  /**
   * 全部标记为已读
   */
  async markAllNotificationsRead() {
    return this.put('/notifications/mark-all-read');
  }

  // ========== 监控相关 API ==========

  /**
   * 获取最新环境数据
   */
  async getLatestEnvironment(projectId) {
    return this.get(`/monitoring/environment/latest/${projectId}`);
  }

  /**
   * 获取环境历史趋势
   */
  async getEnvironmentHistory(projectId, sensorType, hours = 24) {
    return this.get(`/monitoring/environment/history/${projectId}`, { 
      sensorType, 
      hours 
    });
  }

  /**
   * 获取项目整体进度
   */
  async getOverallProgress(projectId) {
    return this.get(`/monitoring/progress/overall/${projectId}`);
  }

  // ========== 文件上传 API ==========

  /**
   * 上传图片（返回 File Upload Form）
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    return response.json();
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated() {
    return !!this.token;
  }
}

// ========== 全局实例 ==========
window.apiClient = new APIClient();

// ========== 辅助函数 ==========

/**
 * 显示加载状态
 */
function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '<div style="text-align: center; padding: 2rem;">加载中...</div>';
  }
}

/**
 * 显示错误提示
 */
function showError(message) {
  alert(message); // TODO: 替换为美观的 Toast
}

/**
 * 显示成功提示
 */
function showSuccess(message) {
  alert(message); // TODO: 替换为美观的 Toast
}
