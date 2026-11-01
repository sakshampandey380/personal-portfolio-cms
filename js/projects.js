/**
 * ==========================================================================
 * 3D PROJECTS SHOWCASE, FILTERING, SEARCH & CASE STUDY MODAL
 * ==========================================================================
 */

import { escapeHtml, sanitizeUrl, debounce, trapFocus } from './utils.js';
import { initCard3DTilt } from './scene-3d.js';

export class ProjectsController {
  constructor() {
    this.projects = [];
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.currentModalIndex = -1;
    this.releaseFocusTrap = null;
    this.boundEvents = false;
  }

  render(projectsList = []) {
    this.projects = Array.isArray(projectsList) ? projectsList : [];
    this.renderFilters();
    this.renderGrid();
    this.bindEvents();
  }

  getCategories() {
    const cats = new Set(this.projects.map((p) => p.category).filter(Boolean));
    return ['All', 'Featured', ...Array.from(cats)];
  }

  renderFilters() {
    const container = document.getElementById('projectCategoryFilters');
    if (!container) return;

    const categories = this.getCategories();
    container.innerHTML = categories
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-project-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('[data-project-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-project-cat');
        this.renderFilters();
        this.renderGrid();
      });
    });
  }

  getFilteredProjects() {
    return this.projects.filter((proj) => {
      const matchesCat =
        this.activeCategory === 'All' ||
        (this.activeCategory === 'Featured' && proj.featured) ||
        proj.category === this.activeCategory;

      if (!matchesCat) return false;
      if (!this.searchQuery) return true;

      const q = this.searchQuery.toLowerCase();
      const haystack = [
        proj.title,
        proj.summary,
        proj.description,
        proj.category,
        ...(Array.isArray(proj.tech_stack) ? proj.tech_stack : [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  renderGrid() {
    const grid = document.getElementById('projectsGridContainer');
    if (!grid) return;

    const filtered = this.getFilteredProjects();
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">No matching projects found</h3>
          <p style="margin-bottom:1rem;">Try clearing your search filter or selecting another architecture category.</p>
          <button type="button" class="btn btn--secondary btn--sm" id="resetProjectFiltersBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetProjectFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.activeCategory = 'All';
          this.searchQuery = '';
          const searchInput = document.getElementById('projectSearchInput');
          if (searchInput) searchInput.value = '';
          this.renderFilters();
          this.renderGrid();
        });
      }
      return;
    }

    grid.innerHTML = filtered
      .map((proj) => {
        const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
        const cover = sanitizeUrl(proj.cover_image || 'assets/images/project-nexvora-mesh.svg');
        return `
          <article class="card-3d project-card" data-project-id="${escapeHtml(proj.id)}">
            <div class="project-card__media">
              <div class="project-card__badges">
                <span class="badge">${escapeHtml(proj.category || 'Engineering')}</span>
                ${proj.featured ? `<span class="badge badge--accent">★ Featured</span>` : ''}
              </div>
              <img src="${escapeHtml(cover)}"
                   alt="${escapeHtml(proj.title)} architectural preview"
                   class="project-card__img"
                   loading="lazy" />
            </div>
            <div class="project-card__body">
              <h3 class="project-card__title">${escapeHtml(proj.title)}</h3>
              <p class="project-card__summary">${escapeHtml(proj.summary)}</p>
              <div class="tag-list">
                ${stack.slice(0, 6).map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
              <div class="project-card__footer">
                <button type="button"
                        class="btn btn--primary btn--sm"
                        data-open-case-study="${escapeHtml(proj.id)}">
                  Case Study &amp; Architecture
                </button>
                <div style="display:flex;gap:0.4rem;">
                  ${
                    proj.github_url
                      ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn--secondary btn--sm"
                            aria-label="GitHub Repository for ${escapeHtml(proj.title)}">Repo</a>`
                      : ''
                  }
                  ${
                    proj.live_url
                      ? `<a href="${escapeHtml(sanitizeUrl(proj.live_url))}"
                            target="${proj.live_url.startsWith('#') ? '_self' : '_blank'}"
                            rel="noopener noreferrer"
                            class="btn btn--secondary btn--sm"
                            aria-label="Live Demo for ${escapeHtml(proj.title)}">Live ↗</a>`
                      : ''
                  }
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-open-case-study]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-case-study');
        this.openCaseStudyModal(id);
      });
    });

    initCard3DTilt();
  }

  bindEvents() {
    if (this.boundEvents) return;
    this.boundEvents = true;

    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        debounce((e) => {
          this.searchQuery = e.target.value.trim();
          this.renderGrid();
        }, 150)
      );
    }

    const modalBackdrop = document.getElementById('projectCaseStudyModal');
    const closeBtn = document.getElementById('closeProjectModalBtn');
    const prevBtn = document.getElementById('prevProjectModalBtn');
    const nextBtn = document.getElementById('nextProjectModalBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateModal(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateModal(1));
    }
  }

  openCaseStudyModal(projectId) {
    const list = this.getFilteredProjects();
    const index = list.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    this.currentModalIndex = index;
    this.populateModal(list[index], index, list.length);

    const modal = document.getElementById('projectCaseStudyModal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (this.releaseFocusTrap) this.releaseFocusTrap();
    this.releaseFocusTrap = trapFocus(modal, () => this.closeModal());

    const closeBtn = document.getElementById('closeProjectModalBtn');
    if (closeBtn) closeBtn.focus();
  }

  navigateModal(delta) {
    const list = this.getFilteredProjects();
    if (list.length === 0) return;
    this.currentModalIndex = (this.currentModalIndex + delta + list.length) % list.length;
    this.populateModal(list[this.currentModalIndex], this.currentModalIndex, list.length);
  }

  populateModal(proj, index, total) {
    const titleEl = document.getElementById('modalProjectTitle');
    const bodyEl = document.getElementById('modalProjectBody');
    const counterEl = document.getElementById('modalProjectCounter');

    if (titleEl) titleEl.textContent = proj.title;
    if (counterEl) counterEl.textContent = `Project ${index + 1} of ${total}`;
    if (!bodyEl) return;

    const features = Array.isArray(proj.key_features) ? proj.key_features : [];
    const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
    const screenshots = Array.isArray(proj.screenshots) && proj.screenshots.length > 0
      ? proj.screenshots
      : [proj.cover_image || 'assets/images/project-nexvora-mesh.svg'];

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border-subtle);background:var(--bg-secondary);">
          <img id="modalActiveScreenshot"
               src="${escapeHtml(sanitizeUrl(screenshots[0]))}"
               alt="${escapeHtml(proj.title)} screenshot"
               style="width:100%;max-height:360px;object-fit:cover;" />
        </div>

        ${
          screenshots.length > 1
            ? `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                ${screenshots
                  .map(
                    (shot, i) => `
                  <button type="button"
                          class="btn btn--secondary btn--sm"
                          data-shot-url="${escapeHtml(sanitizeUrl(shot))}">
                    View Visual ${i + 1}
                  </button>`
                  )
                  .join('')}
               </div>`
            : ''
        }

        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
          <div class="tag-list">
            <span class="badge badge--accent">${escapeHtml(proj.category || 'Systems')}</span>
            ${stack.map((s) => `<span class="tech-tag">${escapeHtml(s)}</span>`).join('')}
          </div>
          <div style="display:flex;gap:0.75rem;">
            ${
              proj.github_url
                ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">GitHub Repository ↗</a>`
                : ''
            }
            ${
              proj.live_url
                ? `<a href="${escapeHtml(sanitizeUrl(proj.live_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">Launch Live Demo ↗</a>`
                : ''
            }
          </div>
        </div>

        <div>
          <h4 style="margin-bottom:0.5rem;">Architecture Overview</h4>
          <p>${escapeHtml(proj.description)}</p>
          ${proj.case_study ? `<p style="margin-top:0.5rem;">${escapeHtml(proj.case_study)}</p>` : ''}
        </div>

        ${
          features.length > 0
            ? `<div>
                <h4 style="margin-bottom:0.5rem;">Key Engineering Capabilities</h4>
                <ul class="timeline-item__highlights">
                  ${features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
                </ul>
              </div>`
            : ''
        }

        <div class="form-row">
          <div style="background:var(--bg-secondary);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem;margin-bottom:0.4rem;color:var(--accent-primary);">Technical Challenges</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.technical_challenges || 'Designed for concurrency and clean modular boundaries.')}</p>
          </div>
          <div style="background:var(--bg-secondary);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem;margin-bottom:0.4rem;color:var(--accent-primary);">Solutions &amp; Tradeoffs</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.solutions_tradeoffs || 'Balanced latency, reliability, and maintainability.')}</p>
          </div>
        </div>

        <div class="form-row">
          <div>
            <h4 style="font-size:0.95rem;margin-bottom:0.35rem;">My Contribution</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.my_contribution || 'End-to-end architecture and implementation.')}</p>
          </div>
          ${
            proj.measurable_outcomes
              ? `<div>
                  <h4 style="font-size:0.95rem;margin-bottom:0.35rem;">Outcomes &amp; Verification</h4>
                  <p style="font-size:0.88rem;">${escapeHtml(proj.measurable_outcomes)}</p>
                </div>`
              : ''
          }
        </div>
      </div>
    `;

    bodyEl.querySelectorAll('[data-shot-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const img = document.getElementById('modalActiveScreenshot');
        if (img) img.src = btn.getAttribute('data-shot-url');
      });
    });
  }

  closeModal() {
    const modal = document.getElementById('projectCaseStudyModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }
}

export const projectsController = new ProjectsController();
