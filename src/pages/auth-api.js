/**
 * 登录/注册页面 - API 集成版本
 */

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已登录
  if (window.apiClient?.isAuthenticated()) {
    redirectToDashboard();
  }

  // 绑定事件
  bindEvents();
});

function bindEvents() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // 切换表单显示
  const toggleButtons = document.querySelectorAll('[data-toggle-form]');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const formToShow = btn.dataset.toggleForm;
      document.querySelectorAll('.form-container').forEach(f => f.style.display = 'none');
      document.getElementById(`${formToShow}Form`).style.display = 'block';
    });
  });
}

// ========== 登录处理 ==========
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe')?.checked || false;

  setLoadingState(true, '登录中...');

  try {
    const response = await window.apiClient.login(email, password, rememberMe);

    if (response.success) {
      showSuccess(`欢迎回来，${response.data.user.username}！`);
      
      // 更新导航栏用户信息
      updateUserNavInfo(response.data.user);
      
      setTimeout(() => {
        redirectToDashboard();
      }, 500);
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    showError(error.message || '用户名或密码错误，请重试');
  } finally {
    setLoadingState(false, '登录');
  }
}

// ========== 注册处理 ==========
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone')?.value;

  setLoadingState(true, '注册中...');

  try {
    const userData = { username, email, password };
    if (phone) userData.phone = phone;

    const response = await window.apiClient.register(userData);

    if (response.success) {
      showSuccess('注册成功！正在跳转到控制台...');
      
      // 自动登录
      await window.apiClient.login(email, password);
      
      setTimeout(() => {
        redirectToDashboard();
      }, 500);
    } else {
      throw new Error(response.message || '注册失败');
    }
  } catch (error) {
    showError(error.message || '注册失败，请检查邮箱是否已被使用');
  } finally {
    setLoadingState(false, '注册');
  }
}

// ========== 辅助函数 ==========

function setLoadingState(loading, text) {
  const submitBtn = document.querySelector('[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? `${text}中...` : text;
    
    if (loading) {
      submitBtn.innerHTML = `<span class="spinner">⏳</span> ${text}`;
    } else {
      submitBtn.innerHTML = text;
    }
  }
}

function showSuccess(message) {
  alert(message);
}

function showError(message) {
  alert(message);
}

function redirectToDashboard() {
  // 根据当前页面判断跳转路径
  const currentPath = window.location.pathname;
  if (currentPath.includes('/login')) {
    window.location.href = '/dashboard.html';
  } else if (currentPath.includes('/register')) {
    window.location.href = '/dashboard.html';
  } else {
    window.location.href = '/index.html';
  }
}

function updateUserNavInfo(user) {
  const navAvatar = document.querySelector('.nav-avatar');
  const navName = document.querySelector('.nav-name');
  const loginLink = document.querySelector('[data-login-btn]');
  const logoutBtn = document.querySelector('[data-logout-btn]');

  if (user) {
    if (navAvatar) navAvatar.textContent = user.username.charAt(0).toUpperCase();
    if (navName) navName.textContent = user.username;
  }

  if (loginLink) loginLink.style.display = 'none';
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', handleLogout);
  }
}

async function handleLogout() {
  if (!confirm('确定要退出登录吗？')) return;

  try {
    window.apiClient.logout();
    showSuccess('已成功退出登录');
    window.location.href = '/login.html';
  } catch (error) {
    showError('退出失败');
  }
}

// ========== 全局暴露 ==========
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
