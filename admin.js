// admin.js - Admin Panel Logic

document.addEventListener('DOMContentLoaded', () => {

  // ─── Hamburger Menu ───
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  function toggleMenu() {
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('open');
    navOverlay?.classList.toggle('show');
  }
  hamburger?.addEventListener('click', toggleMenu);
  navOverlay?.addEventListener('click', toggleMenu);
  navMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (navMenu?.classList.contains('open')) toggleMenu();
  }));

  // ─── Auth State ───
  try {
    auth.onAuthStateChanged(user => {
      if (user) {
        showAdminPanel(user);
      } else {
        showLoginForm();
      }
    });
  } catch (e) {
    showLoginForm();
  }

  // ─── Login Form ───
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('.btn-login');

    btn.textContent = 'CONNECTING...';
    btn.disabled = true;
    loginError.style.display = 'none';

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      loginError.style.display = 'block';
      loginError.textContent = '⚠ INVALID CREDENTIALS';
      btn.textContent = 'LOGIN';
      btn.disabled = false;
    }
  });

  // ─── Logout ───
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await auth.signOut();
  });

  // ─── Save Configs ───
  document.getElementById('save-btn')?.addEventListener('click', async () => {
    const textarea = document.getElementById('config-textarea');
    const btn = document.getElementById('save-btn');
    const raw = textarea.value.trim();

    if (!raw) {
      showToast('⚠ NO CONFIGS TO SAVE', true);
      return;
    }

    // Parse: each non-empty line is a config
    const configs = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    btn.textContent = 'SAVING...';
    btn.disabled = true;

    try {
      await db.ref('configs').set(configs);
      showToast(`✓ ${configs.length} CONFIGS SAVED`);
      btn.textContent = 'SAVE CONFIGS';
      btn.disabled = false;
    } catch (err) {
      showToast('⚠ SAVE FAILED', true);
      btn.textContent = 'SAVE CONFIGS';
      btn.disabled = false;
    }
  });
});

function showLoginForm() {
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('admin-section').style.display = 'none';
}

function showAdminPanel(user) {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'block';

  const emailEl = document.getElementById('admin-email');
  if (emailEl) emailEl.textContent = user.email;

  // Load existing configs into textarea
  try {
    db.ref('configs').once('value').then(snap => {
      const data = snap.val();
      const configs = Array.isArray(data) ? data : (data ? Object.values(data) : []);
      const validConfigs = configs.filter(c => c && c.trim().length > 0);
      const textarea = document.getElementById('config-textarea');
      if (textarea) textarea.value = validConfigs.join('\n');
    });
  } catch (e) {}
}

function showToast(msg, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  if (isError) {
    toast.style.borderColor = '#ff2d55';
    toast.style.color = '#ff2d55';
    toast.style.background = 'rgba(255,45,85,0.1)';
    toast.style.boxShadow = '0 0 20px rgba(255,45,85,0.3)';
  } else {
    toast.style.borderColor = '';
    toast.style.color = '';
    toast.style.background = '';
    toast.style.boxShadow = '';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
