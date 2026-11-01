/**
 * ==========================================================================
 * ADMIN MODULE 1 — DASHBOARD OVERVIEW, SNAPSHOTS & BACKUP EXPORT/IMPORT
 * ==========================================================================
 */

import { repository } from '../../js/data/repository.js';
import { apiService } from '../../js/services/api.js';
import { escapeHtml, formatDate, showToast } from '../../js/utils.js';

export function renderDashboardOverview(container, state, switchModule) {
  const projects = state.projects || [];
  const publishedProjects = projects.filter((p) => p.published !== false).length;
  const resumes = state.resumes || [];
  const publishedResumes = resumes.filter((r) => r.published !== false).length;
  const totalDownloads = resumes.reduce((acc, r) => acc + (Number(r.download_count) || 0), 0);
  const skills = state.skills || [];
  const messages = state.contact_messages || [];
  const snapshots = repository.getSnapshots();

  const isCloud = apiService.isConfigured();

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__label">Projects Showcase</span>
        <span class="stat-card__value">${publishedProjects} <span style="font-size:0.95rem;color:var(--text-muted);font-weight:400;">/ ${projects.length}</span></span>
        <span class="stat-card__meta">${projects.length - publishedProjects} Draft(s) hidden from public</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Active CV / Resumes</span>
        <span class="stat-card__value">${publishedResumes} <span style="font-size:0.95rem;color:var(--text-muted);font-weight:400;">/ ${resumes.length}</span></span>
        <span class="stat-card__meta">${totalDownloads} total PDF download(s)</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Technical Skills</span>
        <span class="stat-card__value">${skills.filter((s) => s.published !== false).length}</span>
        <span class="stat-card__meta">Across 8 engineering categories</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Persistence Mode</span>
        <span class="stat-card__value" style="font-size:1.25rem;color:${isCloud ? 'var(--status-success)' : 'var(--accent-primary)'};">
          ${isCloud ? 'Supabase Cloud' : 'Local Preview'}
        </span>
        <span class="stat-card__meta">${isCloud ? 'RLS & JWT Enforced' : 'Browser Sandbox Active'}</span>
      </div>
    </div>

    <div class="form-row" style="align-items:start;">
      <!-- Quick Module Launchers -->
      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h3 style="font-size:1.1rem;">Quick Studio Actions</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">Jump directly to frequent content management tasks.</p>
          </div>
        </div>
        <div class="admin-panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <button type="button" class="btn btn--primary btn--sm" data-goto-mod="projects">+ Manage Projects</button>
          <button type="button" class="btn btn--primary btn--sm" data-goto-mod="resumes">+ Upload / Replace CV</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="profile">Edit Profile Identity</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="skills">Edit Skill Constellation</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="whatsapp">Configure WhatsApp</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="security">Backend &amp; Security</button>
        </div>
      </section>

      <!-- Portable JSON Backup & Restore -->
      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h3 style="font-size:1.1rem;">Portable Content Snapshot (JSON)</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">Export your entire portfolio database or import a backup file.</p>
          </div>
        </div>
        <div class="admin-panel__body" style="display:flex;flex-direction:column;gap:0.85rem;">
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button type="button" id="exportPortfolioJsonBtn" class="btn btn--secondary btn--sm">
              Export Full JSON Backup ↓
            </button>
            <label class="btn btn--secondary btn--sm" style="cursor:pointer;">
              Import JSON Backup ↑
              <input type="file" id="importPortfolioJsonInput" accept="application/json,.json" style="display:none;" />
            </label>
          </div>
          <p style="font-size:0.78rem;color:var(--text-muted);margin:0;">
            Every save also creates an automatic rollback checkpoint below.
          </p>
        </div>
      </section>
    </div>

    <!-- Rollback History & Recent Contact Inquiries -->
    <div class="form-row" style="align-items:start;">
      <section class="admin-panel">
        <div class="admin-panel__header">
          <h3 style="font-size:1.05rem;">Recent Contact Inquiries (${messages.length})</h3>
          <button type="button" class="btn btn--ghost btn--sm" data-goto-mod="contact">Open Inbox →</button>
        </div>
        <div class="admin-panel__body">
          ${
            messages.length === 0
              ? `<p style="font-size:0.85rem;color:var(--text-muted);">No visitor messages received yet.</p>`
              : `<div style="display:flex;flex-direction:column;gap:0.75rem;">
                  ${messages
                    .slice(0, 4)
                    .map(
                      (m) => `
                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                      <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                        <strong>${escapeHtml(m.name)}</strong>
                        <span class="mono" style="color:var(--text-muted);">${escapeHtml(formatDate(m.created_at))}</span>
                      </div>
                      <div style="font-size:0.78rem;color:var(--accent-primary);">${escapeHtml(m.subject || 'Inquiry')}</div>
                      <p style="font-size:0.82rem;margin-top:0.25rem;">${escapeHtml(m.message)}</p>
                    </div>`
                    )
                    .join('')}
                 </div>`
          }
        </div>
      </section>

      <section class="admin-panel">
        <div class="admin-panel__header">
          <h3 style="font-size:1.05rem;">Rollback Checkpoints (${snapshots.length})</h3>
        </div>
        <div class="admin-panel__body">
          ${
            snapshots.length === 0
              ? `<p style="font-size:0.85rem;color:var(--text-muted);">Checkpoints appear automatically as you edit and save content.</p>`
              : `<div style="display:flex;flex-direction:column;gap:0.6rem;">
                  ${snapshots
                    .slice(0, 5)
                    .map(
                      (s) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.65rem 0.85rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                      <div>
                        <strong style="font-size:0.82rem;display:block;">${escapeHtml(s.label)}</strong>
                        <span class="mono" style="font-size:0.7rem;color:var(--text-muted);">${new Date(s.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <button type="button" class="btn btn--secondary btn--sm" data-restore-snap="${escapeHtml(s.id)}">
                        Restore ↺
                      </button>
                    </div>`
                    )
                    .join('')}
                 </div>`
          }
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-goto-mod]').forEach((btn) => {
    btn.addEventListener('click', () => switchModule(btn.getAttribute('data-goto-mod')));
  });

  container.querySelectorAll('[data-restore-snap]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const snapId = btn.getAttribute('data-restore-snap');
      try {
        await repository.restoreSnapshot(snapId);
        showToast('Checkpoint restored and published!', 'success');
        switchModule('overview');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  const exportBtn = document.getElementById('exportPortfolioJsonBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const jsonStr = JSON.stringify(repository.getAdminData(), null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexvora_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported portfolio JSON backup', 'success');
    });
  }

  const importInput = document.getElementById('importPortfolioJsonInput');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed.profile || !Array.isArray(parsed.projects)) {
          throw new Error('Invalid backup JSON schema.');
        }
        await repository.persistFullState(parsed, 'Imported JSON Backup');
        showToast('Backup imported and synchronized!', 'success');
        switchModule('overview');
      } catch (err) {
        showToast(`Import failed: ${err.message}`, 'error');
      }
    });
  }
}
