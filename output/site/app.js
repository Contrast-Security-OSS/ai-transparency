/* ============================================================
   Contrast Security — AI Transparency Page
   app.js: loads data.json and renders all page content
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
let appData = null;
let activeTab = 'features';

// ── Data Loading ─────────────────────────────────────────────
async function loadData() {
  const response = await fetch('data.json');
  if (!response.ok) throw new Error(`Failed to load data.json: ${response.status}`);
  return response.json();
}

// ── Helpers ──────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFramework(id) {
  return (appData.frameworks || []).find(f => f.id === id) || null;
}

// ── Renderers ────────────────────────────────────────────────

function renderCommitment(commitment) {
  if (!commitment) return;

  const introEl = document.getElementById('commitment-intro');
  if (introEl) introEl.textContent = commitment.intro || '';

  // Stats strip
  const strip = document.getElementById('stats-strip');
  if (strip && commitment.stats) {
    strip.innerHTML = commitment.stats.map(s => `
      <div class="stat-item">
        <span class="stat-value">${escHtml(s.value)}</span>
        <span class="stat-label">${escHtml(s.label)}</span>
      </div>
    `).join('');
  }

  // Pillars grid
  const grid = document.getElementById('pillars-grid');
  if (grid && commitment.pillars) {
    grid.innerHTML = commitment.pillars.map(p => {
      const guardrailsHtml = (p.guardrails || []).map(g => `
        <li>
          <span class="guardrail-label">${escHtml(g.label)}:</span>
          ${escHtml(g.detail)}
        </li>
      `).join('');

      return `
        <div class="pillar-card">
          <span class="pillar-number">${escHtml(String(p.number))}</span>
          <h3 class="pillar-title">${escHtml(p.title)}</h3>
          <p class="pillar-body">${escHtml(p.body)}</p>
          ${guardrailsHtml ? `<ul class="guardrails-list">${guardrailsHtml}</ul>` : ''}
        </div>
      `;
    }).join('');
  }
}

function renderFrameworkStrip(frameworks) {
  const strip = document.getElementById('framework-strip');
  if (!strip || !frameworks) return;
  strip.innerHTML = frameworks.map(fw => `
    <a href="${escHtml(fw.url)}" target="_blank" rel="noopener" class="framework-chip">
      ${escHtml(fw.name)}
    </a>
  `).join('');
}

function renderFeatureCard(feature) {
  const statusLabel = feature.status === 'live' ? 'Live' : 'Coming Soon';
  const statusClass = feature.status === 'live' ? 'status-live' : 'status-stub';

  const inputsHtml = (feature.data_inputs || []).map(i =>
    `<li>${escHtml(i)}</li>`
  ).join('');

  const controlsHtml = (feature.controls || []).map(c =>
    `<li>${escHtml(c)}</li>`
  ).join('');

  const frameworksHtml = (feature.frameworks || []).map(fId => {
    const fw = getFramework(fId);
    if (!fw) return '';
    return `<a href="${escHtml(fw.url)}" target="_blank" rel="noopener" class="fw-badge">${escHtml(fw.name)}</a>`;
  }).join('');

  const hitlHtml = feature.human_in_loop
    ? `<div class="hitl-indicator hitl-yes">
        <span class="hitl-icon">👤</span>
        <span>Human-in-the-Loop: ${escHtml(feature.human_in_loop_detail)}</span>
       </div>`
    : `<div class="hitl-indicator hitl-no">
        <span class="hitl-icon">⚡</span>
        <span>Automated — no human review step</span>
       </div>`;

  return `
    <article class="card"
      data-status="${escHtml(feature.status)}"
      data-search="${escHtml((feature.name + ' ' + feature.description + ' ' + feature.model_provider).toLowerCase())}">

      <div class="card-header">
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <span class="model-badge" title="${escHtml(feature.model_provider)}">${escHtml(feature.model_provider)}</span>
      </div>

      <div>
        <h3 class="card-title">${escHtml(feature.name)}</h3>
        ${feature.subtitle ? `<p class="card-subtitle">${escHtml(feature.subtitle)}</p>` : ''}
      </div>

      <p class="card-description">${escHtml(feature.description)}</p>

      ${inputsHtml ? `
      <div class="card-section">
        <div class="section-label">Data Inputs</div>
        <ul class="data-list">${inputsHtml}</ul>
      </div>` : ''}

      ${controlsHtml ? `
      <div class="card-section">
        <div class="section-label">Security Controls</div>
        <ul class="controls-list">${controlsHtml}</ul>
      </div>` : ''}

      ${hitlHtml}

      ${frameworksHtml ? `<div class="frameworks-bar">${frameworksHtml}</div>` : ''}
    </article>
  `;
}

function renderSubprocessorCard(sub) {
  const statusLabel = sub.status === 'stub' ? 'Pending Full Disclosure' : 'Documented';
  const statusClass = sub.status === 'stub' ? 'status-stub' : 'status-live';

  const controlsHtml = (sub.controls || []).map(c =>
    `<li>${escHtml(c)}</li>`
  ).join('');

  const usedInHtml = (sub.used_in || []).map(u =>
    `<span class="used-in-badge">${escHtml(u)}</span>`
  ).join('');

  const stubNote = sub.status === 'stub'
    ? `<p class="stub-note">Full subprocessor detail is pending. Contact <a href="mailto:${escHtml(appData.meta.contact_email)}">${escHtml(appData.meta.contact_label)}</a> for the current subprocessor list.</p>`
    : '';

  return `
    <article class="card"
      data-status="${escHtml(sub.status)}"
      data-search="${escHtml((sub.name + ' ' + sub.description + ' ' + sub.category).toLowerCase())}">

      <div class="card-header">
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <span class="category-badge">${escHtml(sub.category)}</span>
      </div>

      <div>
        <h3 class="card-title">${escHtml(sub.name)}</h3>
      </div>

      <p class="card-description">${escHtml(sub.description)}</p>

      ${sub.data_processed ? `
      <div class="card-section">
        <div class="section-label">Data Processed</div>
        <p class="card-description">${escHtml(sub.data_processed)}</p>
      </div>` : ''}

      ${controlsHtml ? `
      <div class="card-section">
        <div class="section-label">Controls</div>
        <ul class="controls-list">${controlsHtml}</ul>
      </div>` : ''}

      ${usedInHtml ? `
      <div class="card-section">
        <div class="section-label">Used In</div>
        <div class="used-in-list">${usedInHtml}</div>
      </div>` : ''}

      ${stubNote}

      ${sub.website ? `
      <div class="frameworks-bar">
        <a href="${escHtml(sub.website)}" target="_blank" rel="noopener" class="fw-badge">
          Vendor Website ↗
        </a>
      </div>` : ''}
    </article>
  `;
}

function renderChangelog(changelog) {
  const container = document.getElementById('changelog-content');
  if (!container || !changelog) return;

  const entriesHtml = changelog.map(entry => {
    const changesHtml = (entry.changes || []).map(c =>
      `<li>${escHtml(c)}</li>`
    ).join('');

    return `
      <div class="changelog-entry">
        <div class="changelog-header">
          <span class="changelog-version">v${escHtml(entry.version)}</span>
          <span class="changelog-date">${escHtml(entry.date)}</span>
        </div>
        <ul class="changelog-changes">${changesHtml}</ul>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="changelog-list">${entriesHtml}</div>`;
}

// ── Filtering ────────────────────────────────────────────────
function filterCards(gridId, emptyId) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid) return;

  const query = (document.getElementById('search-input').value || '').toLowerCase().trim();
  const statusFilter = (document.getElementById('status-filter').value || '').toLowerCase();

  const cards = grid.querySelectorAll('.card');
  let visibleCount = 0;

  cards.forEach(card => {
    const searchText = (card.dataset.search || '');
    const cardStatus = (card.dataset.status || '');

    const matchesSearch = !query || searchText.includes(query);
    const matchesStatus = !statusFilter || cardStatus === statusFilter;

    if (matchesSearch && matchesStatus) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (empty) {
    empty.classList.toggle('hidden', visibleCount > 0);
  }
}

function applyFilters() {
  if (activeTab === 'features') {
    filterCards('features-grid', 'features-empty');
  } else if (activeTab === 'subprocessors') {
    filterCards('subprocessors-grid', 'subprocessors-empty');
  }
}

// ── Tabs ─────────────────────────────────────────────────────
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const searchArea = document.getElementById('search-area');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      activeTab = targetTab;

      // Update tab active state
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === targetTab);
        t.setAttribute('aria-selected', t.dataset.tab === targetTab ? 'true' : 'false');
      });

      // Show/hide panels
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `tab-${targetTab}`);
      });

      // Hide search on changelog tab
      if (searchArea) {
        searchArea.style.display = targetTab === 'changelog' ? 'none' : '';
      }

      // Re-apply filters for new tab
      applyFilters();
    });
  });
}

// ── Search & Filter ──────────────────────────────────────────
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
}

// ── Meta / Header ────────────────────────────────────────────
function renderMeta(meta) {
  const dateEl = document.getElementById('last-updated-date');
  if (dateEl) dateEl.textContent = meta.last_updated || '—';

  const versionEl = document.getElementById('version-chip');
  if (versionEl) versionEl.textContent = `v${meta.version || '—'}`;

  const contactEl = document.getElementById('footer-contact');
  if (contactEl && meta.contact_email) {
    contactEl.href = `mailto:${meta.contact_email}`;
    contactEl.textContent = 'Contact Security Team';
  }

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ── Main ─────────────────────────────────────────────────────
async function init() {
  try {
    appData = await loadData();

    // Meta
    renderMeta(appData.meta || {});

    // Commitment section
    renderCommitment(appData.commitment || null);

    // Framework strip in header
    renderFrameworkStrip(appData.frameworks || []);

    // Product features
    const featuresGrid = document.getElementById('features-grid');
    const liveFeatures = (appData.product_features || []);
    if (featuresGrid) {
      featuresGrid.innerHTML = liveFeatures.map(renderFeatureCard).join('');
    }
    const featuresCount = document.getElementById('features-count');
    if (featuresCount) featuresCount.textContent = liveFeatures.length;

    // Subprocessors
    const subGrid = document.getElementById('subprocessors-grid');
    const subprocessors = (appData.subprocessors || []);
    if (subGrid) {
      subGrid.innerHTML = subprocessors.map(renderSubprocessorCard).join('');
    }
    const subCount = document.getElementById('subprocessors-count');
    if (subCount) subCount.textContent = subprocessors.length;

    // Changelog
    renderChangelog(appData.changelog || []);

    // Interactions
    initTabs();
    initSearch();

  } catch (err) {
    console.error('Failed to initialize AI Transparency page:', err);

    const grids = ['features-grid', 'subprocessors-grid'];
    grids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `
          <div class="loading-state" style="color: #c62828;">
            <p>Failed to load data. Please refresh the page or contact
               <a href="mailto:security@contrastsecurity.com">security@contrastsecurity.com</a>.</p>
          </div>
        `;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
