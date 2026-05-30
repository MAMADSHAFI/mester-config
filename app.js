// app.js - Home Page Logic

document.addEventListener('DOMContentLoaded', () => {

  // ─── Loading Screen ───
  const loadingScreen = document.getElementById('loading-screen');
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 1800);

  // ─── Hamburger Menu ───
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    navOverlay.classList.toggle('show');
  }

  hamburger?.addEventListener('click', toggleMenu);
  navOverlay?.addEventListener('click', toggleMenu);
  navMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) toggleMenu();
  }));

  // ─── Firebase Load ───
  loadConfigs();
  updateLastUpdate();

  // ─── Refresh Button ───
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn?.addEventListener('click', () => {
    refreshBtn.classList.add('spinning');
    loadConfigs(() => {
      refreshBtn.classList.remove('spinning');
    });
  });
});

function getConfigType(config) {
  if (config.startsWith('vless://')) return 'vless';
  if (config.startsWith('vmess://')) return 'vmess';
  if (config.startsWith('trojan://')) return 'trojan';
  return 'other';
}

function loadConfigs(callback) {
  const grid = document.getElementById('configs-grid');
  const totalEl = document.getElementById('total-configs');
  const statusEl = document.getElementById('online-status');

  if (!grid) return;

  statusEl && (statusEl.textContent = '●');
  statusEl && (statusEl.style.color = '#ffaa00');

  try {
    db.ref('configs').once('value')
      .then(snapshot => {
        const data = snapshot.val();
        const configs = Array.isArray(data) ? data : (data ? Object.values(data) : []);

        // Filter empty strings
        const validConfigs = configs.filter(c => c && c.trim().length > 0);

        totalEl && (totalEl.textContent = validConfigs.length);
        statusEl && (statusEl.textContent = 'ONLINE');
        statusEl && (statusEl.style.color = '#00ff88');

        renderConfigs(validConfigs);
        updateLastUpdate();
        callback && callback();
      })
      .catch(err => {
        console.error('Firebase error:', err);
        statusEl && (statusEl.textContent = 'ERROR');
        statusEl && (statusEl.style.color = '#ff2d55');
        grid.innerHTML = `<div class="empty-state">⚠ CONNECTION FAILED<br><small style="opacity:0.5;font-size:0.65rem;margin-top:8px;display:block">CHECK FIREBASE CONFIG</small></div>`;
        callback && callback();
      });
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">⚠ FIREBASE NOT INITIALIZED<br><small style="opacity:0.5;font-size:0.65rem;margin-top:8px;display:block">ADD FIREBASE CONFIG</small></div>`;
    callback && callback();
  }
}

function renderConfigs(configs) {
  const grid = document.getElementById('configs-grid');
  if (!grid) return;

  if (!configs || configs.length === 0) {
    grid.innerHTML = `<div class="empty-state">◈ NO CONFIGS AVAILABLE<br><small style="opacity:0.5;font-size:0.65rem;margin-top:8px;display:block">ADMIN PANEL → ADD CONFIGS</small></div>`;
    return;
  }

  grid.innerHTML = '';
  configs.forEach((config, i) => {
    const type = getConfigType(config.trim());
    const card = document.createElement('div');
    card.className = 'config-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="config-header">
        <span class="config-num">#${String(i + 1).padStart(2, '0')}</span>
        <span class="config-type ${type}">${type.toUpperCase()}</span>
        <button class="copy-btn" data-config="${escapeHtml(config.trim())}">⎘ COPY</button>
      </div>
      <div class="config-text" data-expanded="false">${escapeHtml(config.trim())}</div>
    `;
    grid.appendChild(card);
  });

  // Copy buttons
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const txt = btn.getAttribute('data-config');
      navigator.clipboard.writeText(txt).then(() => {
        btn.textContent = '✓ COPIED';
        btn.classList.add('copied');
        showToast('CONFIG COPIED!');
        setTimeout(() => {
          btn.textContent = '⎘ COPY';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // Expand/collapse config text
  grid.querySelectorAll('.config-text').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('expanded');
    });
  });
}

function updateLastUpdate() {
  const el = document.getElementById('last-update');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
