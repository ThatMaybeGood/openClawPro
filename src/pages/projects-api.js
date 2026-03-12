/**
 * 项目管理页面 - API 集成版本
 */

let currentPage = 1;
const itemsPerPage = 10;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 检查登录状态
  if (!window.apiClient?.isAuthenticated()) {
    alert('请先登录');
    window.location.href = '/login.html';
    return;
  }

  bindEvents();
  loadProjects();
  updateUnreadCount();
});

function bindEvents() {
  // 刷新按钮
  const refreshBtn = document.getElementById('refreshProjects');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadProjects);
  }

  // 创建项目按钮
  const createBtn = document.getElementById('createProject');
  if (createBtn) {
    createBtn.addEventListener('click', showCreateModal);
  }

  // 表单提交
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', handleCreateProject);
  }
}

// ========== 加载项目列表 ==========
async function loadProjects(page = 1) {
  currentPage = page;
  showLoading(true);

  try {
    const response = await window.apiClient.getMyProjects(page, itemsPerPage);
    
    if (response.success && response.data?.data?.length > 0) {
      renderProjects(response.data.data);
      renderPagination(response.data.meta);
    } else {
      showEmptyState();
    }
  } catch (error) {
    console.error('加载项目失败:', error);
    showError('加载项目列表失败：' + error.message);
  } finally {
    showLoading(false);
  }
}

// ========== 渲染项目列表 ==========
function renderProjects(projects) {
  const container = document.getElementById('projectsList');
  if (!container) return;

  if (projects.length === 0) {
    showEmptyState();
    return;
  }

  const statusColors = {
    draft: '#999',
    planning: '#667eea',
    construction: '#f59e0b',
    inspection: '#3b82f6',
    completed: '#22c55e'
  };

  const typeLabels = {
    new_build: '新建自住房',
    renovation: '老房改造',
    villa: '独栋别墅',
    apartment: '公寓装修'
  };

  container.innerHTML = projects.map(project => `
    <tr class="project-row">
      <td>
        <div style="font-weight: 500;">${project.name}</div>
        <div style="font-size: 0.85rem; color: #999;">ID: ${project.id.slice(0, 8)}</div>
      </td>
      <td>${typeLabels[project.houseType] || '-'}</td>
      <td>${project.areaM2 ? `${project.areaM2}㎡` : '-'}</td>
      <td>
        <span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${statusColors[project.status]}; color: white; border-radius: 12px; font-size: 0.85rem;">
          ${getStatusText(project.status)}
        </span>
      </td>
      <td>${project.progress}%</td>
      <td>${formatDate(project.createdAt)}</td>
      <td>
        <button onclick="viewProject('${project.id}')" class="btn-sm btn-primary">查看</button>
        <button onclick="editProject('${project.id}')" class="btn-sm btn-secondary">编辑</button>
      </td>
    </tr>
  `).join('');
}

// ========== 渲染分页 ==========
function renderPagination(meta) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = meta.totalPages;
  const current = meta.currentPage;

  let html = '';

  // 上一页
  if (current > 1) {
    html += `<button onclick="loadProjects(${current - 1})" class="btn-page">←</button>`;
  }

  // 页码
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const activeClass = i === current ? 'active' : '';
    html += `<button onclick="loadProjects(${i})" class="btn-page ${activeClass}">${i}</button>`;
  }

  // 下一页
  if (current < totalPages) {
    html += `<button onclick="loadProjects(${current + 1})" class="btn-page">→</button>`;
  }

  container.innerHTML = html;
}

// ========== 创建项目 ==========
async function handleCreateProject(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const projectData = {
    name: formData.get('name'),
    houseType: formData.get('houseType'),
    areaM2: parseFloat(formData.get('area')) || null,
    location: JSON.parse(formData.get('location') || '{}'),
    styleTags: formData.getAll('style[]'),
    description: formData.get('description'),
    startDate: formData.get('startDate'),
    budgetTotal: parseFloat(formData.get('budget')) || null
  };

  setLoadingState(true);

  try {
    const response = await window.apiClient.createProject(projectData);

    if (response.success) {
      showSuccess('项目创建成功！');
      closeModal();
      loadProjects(1);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    showError('创建失败：' + error.message);
  } finally {
    setLoadingState(false);
  }
}

// ========== 辅助函数 ==========

function showLoading(show) {
  const loadingEl = document.getElementById('loadingSpinner');
  if (loadingEl) {
    loadingEl.style.display = show ? 'block' : 'none';
  }
}

function showEmptyState() {
  const container = document.getElementById('projectsList');
  if (container) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 4rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🏠</div>
          <p style="color: #999;">暂无项目，点击右上角按钮创建第一个项目</p>
        </td>
      </tr>
    `;
  }
}

function showCreateModal() {
  const modal = document.getElementById('createProjectModal');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('createProjectModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('projectForm').reset();
  }
}

function setLoadingState(loading) {
  const btn = document.querySelector('#projectForm [type="submit"]');
  if (btn) {
    btn.disabled = loading;
    btn.textContent = loading ? '创建中...' : '创建项目';
  }
}

function viewProject(id) {
  alert(`查看详情功能：项目 ID=${id}`);
  // TODO: 跳转到详情页
}

function editProject(id) {
  alert(`编辑功能：项目 ID=${id}`);
  // TODO: 打开编辑模态框并填充数据
}

function showSuccess(message) {
  alert(message);
}

function showError(message) {
  alert(message);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 2019, month: 2, day: 2 });
}

function getStatusText(status) {
  const map = {
    draft: '草稿',
    planning: '规划中',
    construction: '施工中',
    inspection: '验收中',
    completed: '已完成'
  };
  return map[status] || status;
}

function getAreaUnit(area) {
  if (!area) return '-';
  return `${area}㎡`;
}

// ========== 更新未读通知数 ==========
async function updateUnreadCount() {
  try {
    const count = await window.apiClient.getUnreadNotificationCount();
    const badge = document.querySelector('.notification-badge');
    if (badge && count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'inline-block';
    }
  } catch (error) {
    console.warn('获取未读数失败:', error);
  }
}

// ========== 全局暴露 ==========
window.loadProjects = loadProjects;
window.showCreateModal = showCreateModal;
window.closeModal = closeModal;
window.viewProject = viewProject;
window.editProject = editProject;
