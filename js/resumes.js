/**
 * ==========================================================================
 * MULTIPLE RESUMES & CV MANAGEMENT HUB — PREVIEW & DOWNLOAD CONTROLLER
 * ==========================================================================
 */

import { escapeHtml, formatDate, slugify, showToast, trapFocus } from './utils.js';
import { storageService } from './services/storage.js';
import { repository } from './data/repository.js';
import { initCard3DTilt } from './scene-3d.js';

export class ResumesController {
  constructor() {
    this.resumes = [];
    this.activeCategory = 'All';
    this.releaseFocusTrap = null;
    this.boundModalEvents = false;
  }

  render(resumesList = []) {
    // Strictly show only published resumes on public site
    this.resumes = (Array.isArray(resumesList) ? resumesList : []).filter(
      (r) => r.published !== false
    );

    this.updateHeroFeaturedButton();
    this.renderCategoryFilters();
    this.renderResumesGrid();
    this.bindModalEvents();
  }

  updateHeroFeaturedButton() {
    const heroResumeBtn = document.getElementById('heroFeaturedResumeBtn');
    if (!heroResumeBtn) return;

    const featured = this.resumes.find((r) => r.featured) || this.resumes[0];
    if (!featured) {
      heroResumeBtn.style.display = 'none';
      return;
    }

    heroResumeBtn.style.display = 'inline-flex';
    heroResumeBtn.onclick = (e) => {
      e.preventDefault();
      this.triggerDownload(featured);
    };
  }

  renderCategoryFilters() {
    const container = document.getElementById('resumeCategoryFilters');
    if (!container) return;

    const cats = ['All', ...new Set(this.resumes.map((r) => r.category).filter(Boolean))];
    container.innerHTML = cats
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-resume-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('[data-resume-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-resume-cat');
        this.renderCategoryFilters();
        this.renderResumesGrid();
      });
    });
  }

  renderResumesGrid() {
    const grid = document.getElementById('resumesGridContainer');
    if (!grid) return;

    const filtered =
      this.activeCategory === 'All'
        ? this.resumes
        : this.resumes.filter((r) => r.category === this.activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No published resumes in this category yet. Manage resume versions in the Admin Dashboard.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((res) => {
        return `
          <article class="card-3d resume-card ${res.featured ? 'resume-card--featured' : ''}">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.85rem;">
                <span class="badge">${escapeHtml(res.category || 'Targeted CV')}</span>
                <div style="display:flex;gap:0.4rem;align-items:center;">
                  ${res.featured ? `<span class="badge badge--accent">★ Featured CV</span>` : ''}
                  <span class="mono" style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(res.version || 'v1.0')}</span>
                </div>
              </div>
              <h3 style="font-size:1.25rem;margin-bottom:0.35rem;">${escapeHtml(res.title)}</h3>
              <p class="mono" style="font-size:0.78rem;color:var(--accent-primary);margin-bottom:0.75rem;">
                Target Role: ${escapeHtml(res.target_role || res.category)}
              </p>
              <p style="font-size:0.9rem;color:var(--text-secondary);">
                ${escapeHtml(res.description || '')}
              </p>
            </div>

            <div>
              <div class="resume-card__preview-sheet" style="margin-bottom:1rem;">
                <div>
                  <span class="mono" style="font-size:0.72rem;color:var(--text-primary);display:block;font-weight:600;">
                    PDF // ${escapeHtml(res.file_name || 'Saksham_Pandey_Resume.pdf')}
                  </span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    Updated ${escapeHtml(formatDate(res.updated_at))} · ${escapeHtml(res.file_size || 'PDF')}
                  </span>
                </div>
                <span class="badge" title="Total downloads">↓ ${Number(res.download_count) || 0}</span>
              </div>

              <div class="resume-card__actions">
                <button type="button"
                        class="btn btn--primary btn--sm"
                        data-download-resume="${escapeHtml(res.id)}">
                  Download PDF ↓
                </button>
                <button type="button"
                        class="btn btn--secondary btn--sm"
                        data-preview-resume="${escapeHtml(res.id)}">
                  Preview in Browser
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-download-resume]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = this.resumes.find((r) => r.id === btn.getAttribute('data-download-resume'));
        if (target) this.triggerDownload(target);
      });
    });

    grid.querySelectorAll('[data-preview-resume]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = this.resumes.find((r) => r.id === btn.getAttribute('data-preview-resume'));
        if (target) this.openPreviewModal(target);
      });
    });

    initCard3DTilt();
  }

  async triggerDownload(resume) {
    try {
      const resolvedUrl = await storageService.resolveFileUrl(resume.file_url);
      const safeDownloadName =
        resume.file_name || `Saksham_Pandey_${slugify(resume.target_role || resume.title)}.pdf`;

      const link = document.createElement('a');
      link.href = resolvedUrl;
      link.download = safeDownloadName.endsWith('.pdf') ? safeDownloadName : `${safeDownloadName}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();

      await repository.incrementResumeDownload(resume.id);
      this.renderResumesGrid();
      showToast(`Downloading ${safeDownloadName}`, 'success');
    } catch (err) {
      showToast(`Unable to download PDF: ${err.message}`, 'error');
    }
  }

  async openPreviewModal(resume) {
    const modal = document.getElementById('resumePreviewModal');
    const titleEl = document.getElementById('modalResumeTitle');
    const frameContainer = document.getElementById('modalResumeFrameContainer');
    const downloadBtn = document.getElementById('modalResumeDownloadBtn');

    if (!modal || !frameContainer) return;

    const resolvedUrl = await storageService.resolveFileUrl(resume.file_url);
    if (titleEl) {
      titleEl.textContent = `${resume.title} (${resume.version || 'v1.0'})`;
    }

    frameContainer.innerHTML = `
      <iframe src="${escapeHtml(resolvedUrl)}"
              title="${escapeHtml(resume.title)} PDF Preview"
              style="width:100%;height:70vh;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);background:#FFFFFF;">
      </iframe>
    `;

    if (downloadBtn) {
      downloadBtn.onclick = () => this.triggerDownload(resume);
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (this.releaseFocusTrap) this.releaseFocusTrap();
    this.releaseFocusTrap = trapFocus(modal, () => this.closePreviewModal());
  }

  closePreviewModal() {
    const modal = document.getElementById('resumePreviewModal');
    const frameContainer = document.getElementById('modalResumeFrameContainer');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (frameContainer) frameContainer.innerHTML = '';
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }

  bindModalEvents() {
    if (this.boundModalEvents) return;
    this.boundModalEvents = true;

    const modal = document.getElementById('resumePreviewModal');
    const closeBtn = document.getElementById('closeResumeModalBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePreviewModal());
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closePreviewModal();
      });
    }
  }
}

export const resumesController = new ResumesController();
