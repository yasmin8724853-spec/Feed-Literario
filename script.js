//  ══════════════════════════════════════════════════════════
//      JAVASCRIPT — NÃO EDITE (a não ser que saiba o que faz)
//  ══════════════════════════════════════════════════════════ 
/* ── TEMA ── */
function setTheme(theme, btn) {
  document.documentElement.dataset.theme = theme === 'claro' ? '' : theme;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── CURTIR POST ── */
function toggleLike(btn) {
  btn.classList.toggle('liked');
  const card = btn.closest('.post-card');
  const likesEl = card.querySelector('.post-likes');
  const current = parseInt(likesEl.dataset.count || '0');
  if (btn.classList.contains('liked')) {
    const next = current + 1;
    likesEl.dataset.count = next;
    likesEl.textContent = `❤️ ${next} curtida${next > 1 ? 's' : ''}`;
  } else {
    const next = Math.max(current - 1, 0);
    likesEl.dataset.count = next;
    likesEl.textContent = next === 0 ? '🤍 Seja o primeiro a curtir' : `❤️ ${next} curtida${next > 1 ? 's' : ''}`;
  }
}

/* ── SALVAR POST ── */
function toggleSave(btn) {
  btn.classList.toggle('saved');
  btn.title = btn.classList.contains('saved') ? 'Remover dos salvos' : 'Salvar';
}

/* ── COMPARTILHAR ── */
function sharePost(btn) {
  if (navigator.share) {
    navigator.share({ title: 'Literatura Brasileira', url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      const orig = btn.innerHTML;
      btn.style.color = 'var(--accent)';
      setTimeout(() => { btn.style.color = ''; }, 1200);
    });
  }
}

/* ── MODAIS DE DESTAQUE ── */
function openHighlight(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function closeModalOnOverlay(e, overlay) {
  if (e.target === overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

/* ── SISTEMA DE STORIES ── */
let storyData = [];
let currentStoryIdx = 0;
let storyTimer = null;

function openStory(el) {
  // Coleta todos os stories do container
  const items = Array.from(document.querySelectorAll('#stories-container .story-item'));
  const clickedIdx = items.indexOf(el);

  storyData = items.map(item => ({
    media: item.dataset.media || '',
    type: item.dataset.type || 'image',
    caption: item.dataset.caption || '',
    label: item.dataset.label || item.querySelector('.story-label')?.textContent || '',
    thumbnail: item.querySelector('.story-inner img')?.src || ''
  }));

  currentStoryIdx = clickedIdx >= 0 ? clickedIdx : 0;
  showStory(currentStoryIdx);

  document.getElementById('story-modal').classList.add('active');
  document.body.classList.add('modal-open');
}

function showStory(idx) {
  if (idx < 0 || idx >= storyData.length) {
    closeStoryModal();
    return;
  }
  currentStoryIdx = idx;
  const s = storyData[idx];

  // Atualiza nome/avatar no header
  document.getElementById('story-modal-name').textContent =
    document.getElementById('profile-name')?.textContent || 'Escritor';

  const avatarEl = document.getElementById('story-modal-avatar');
  const profileAvatar = document.querySelector('.profile-avatar-inner img');
  if (profileAvatar) {
    avatarEl.innerHTML = `<img src="${profileAvatar.src}" alt="avatar">`;
  } else {
    avatarEl.textContent = document.querySelector('.profile-avatar-inner')?.textContent?.trim() || '📖';
  }

  // Legenda
  document.getElementById('story-modal-caption').textContent = s.caption;

  // Mídia
  const container = document.getElementById('story-media-container');
  if (s.media) {
    if (s.type === 'video') {
      container.innerHTML = `<video src="${s.media}" autoplay muted playsinline loop></video>`;
    } else {
      container.innerHTML = `<img src="${s.media}" alt="${s.label}">`;
    }
  } else {
    // Placeholder quando não há mídia configurada
    container.innerHTML = `
      <div class="story-placeholder-full">
        <div class="ph-icon">📸</div>
        <div class="ph-title">${s.label}</div>
        <div class="ph-hint">Preencha o atributo data-media="" com a URL da imagem ou vídeo</div>
      </div>`;
  }

  // Barra de progresso
  buildProgressBar(storyData.length, idx);

  // Marca como visto
  const storyItems = document.querySelectorAll('#stories-container .story-item');
  if (storyItems[idx]) {
    storyItems[idx].querySelector('.story-ring')?.classList.add('seen');
  }

  // Timer automático
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => nextStory(), 5000);
}

function buildProgressBar(total, active) {
  const bar = document.getElementById('story-progress-bar');
  bar.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const seg = document.createElement('div');
    seg.className = 'story-progress-segment';
    const fill = document.createElement('div');
    fill.className = 'story-progress-fill';
    if (i < active) fill.classList.add('done');
    if (i === active) fill.classList.add('active');
    seg.appendChild(fill);
    bar.appendChild(seg);
  }
}

function nextStory() {
  clearTimeout(storyTimer);
  if (currentStoryIdx < storyData.length - 1) {
    showStory(currentStoryIdx + 1);
  } else {
    closeStoryModal();
  }
}

function prevStory() {
  clearTimeout(storyTimer);
  if (currentStoryIdx > 0) {
    showStory(currentStoryIdx - 1);
  }
}

function handleStoryTap(e) {
  const modal = document.getElementById('story-modal');
  const inner = modal.querySelector('.story-modal-inner');
  const rect = inner.getBoundingClientRect();
  const tapX = e.clientX - rect.left;

  // Evita que cliques no header/close fechem o story errado
  if (e.target.closest('.story-modal-close') || e.target.closest('.story-modal-header')) return;

  const isLeftHalf = tapX < rect.width * 0.4;
  if (isLeftHalf) {
    prevStory();
  } else {
    nextStory();
  }
}

function closeStoryModal(e) {
  if (e) e.stopPropagation();
  clearTimeout(storyTimer);
  document.getElementById('story-modal').classList.remove('active');
  document.body.classList.remove('modal-open');
  document.getElementById('story-media-container').innerHTML = '';
}

/* ── FECHAR MODAIS COM ESC ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active, .story-modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
    clearTimeout(storyTimer);
  }
});

/* ── DICA NO CONSOLE ── */
console.log(`
╔══════════════════════════════════════════════════════╗
║       LITERATURA BRASILEIRA — FEED INTERATIVO       ║
╠══════════════════════════════════════════════════════╣
║  Seções para editar (marcadas com ✅ no HTML):      ║
║  • Perfil do escritor (nome, bio, foto, período)    ║
║  • Stories (data-media com URL da imagem/vídeo)     ║
║  • Destaques (modais com conteúdo já estruturado)   ║
║  • Posts (imagem + legenda + hashtags)              ║
║                                                     ║
║  Não edite:                                         ║
║  • Variáveis CSS (--bg, --accent, etc.)             ║
║  • Funções JS (openStory, openHighlight...)         ║
║  • Estrutura dos modais                             ║
╚══════════════════════════════════════════════════════╝
`);