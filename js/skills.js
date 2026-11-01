/**
 * ==========================================================================
 * INTERACTIVE 3D SKILL CONSTELLATION & COMPACT SKILL PILL/CHIP MATRIX
 * ==========================================================================
 * Keeps the rotating circular/orbit animation intact in the center and
 * renders the bottom skill badges as compact, neatly formatted pill/chip
 * templates across balanced rows.
 */

import { escapeHtml } from './utils.js';

export class SkillsController {
  constructor() {
    this.skills = [];
    this.activeCategory = 'All';
    this.selectedSkill = null;
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.rotAngle = 0;
    this.rafId = null;
  }

  render(skillsList = []) {
    this.skills = Array.isArray(skillsList) ? skillsList : [];
    if (this.skills.length > 0 && !this.selectedSkill) {
      this.selectedSkill = this.skills[0];
    } else if (this.selectedSkill) {
      const updated = this.skills.find((s) => s.id === this.selectedSkill.id);
      this.selectedSkill = updated || this.skills[0] || null;
    }

    this.renderCategoryFilters();
    this.renderSkillsPills();
    this.renderInspector(this.selectedSkill);
    this.initConstellationCanvas();
  }

  getCategories() {
    const defaultCats = [
      'Frontend Development',
      'Backend Development',
      'Programming Languages',
      'Databases',
      'APIs & Real-Time Communication',
      'AI & Automation',
      'DevOps & Deployment',
      'Development Tools'
    ];
    const dynamicCats = new Set(this.skills.map((s) => s.category).filter(Boolean));
    defaultCats.forEach((c) => dynamicCats.add(c));
    return ['All', ...Array.from(dynamicCats)];
  }

  renderCategoryFilters() {
    const filterContainer = document.getElementById('skillsCategoryFilters');
    if (!filterContainer) return;

    const categories = this.getCategories().filter(
      (cat) => cat === 'All' || this.skills.some((s) => s.category === cat)
    );

    filterContainer.innerHTML = categories
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-skill-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    filterContainer.querySelectorAll('[data-skill-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-skill-cat');
        this.renderCategoryFilters();
        this.renderSkillsPills();
        this.buildConstellationNodes();
      });
    });
  }

  getFilteredSkills() {
    if (this.activeCategory === 'All') return this.skills;
    return this.skills.filter((s) => s.category === this.activeCategory);
  }

  /**
   * Renders compact, balanced pill/chip templates across neat rows
   * instead of oversized cards.
   */
  renderSkillsPills() {
    const grid = document.getElementById('skillsGridContainer');
    if (!grid) return;

    const filtered = this.getFilteredSkills();
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state">No skills published in this category yet.</div>`;
      return;
    }

    grid.className = 'skills-pills-matrix';
    grid.innerHTML = filtered
      .map((skill) => {
        const isSelected = this.selectedSkill && this.selectedSkill.id === skill.id;
        return `
          <button type="button"
                  class="skill-chip-pill ${isSelected ? 'is-selected' : ''}"
                  aria-label="Inspect skill ${escapeHtml(skill.name)}"
                  data-skill-id="${escapeHtml(skill.id)}">
            <span class="skill-chip-pill__icon">${escapeHtml(skill.icon || skill.name.slice(0, 2).toUpperCase())}</span>
            <span class="skill-chip-pill__name">${escapeHtml(skill.name)}</span>
            ${
              skill.proficiency
                ? `<span class="skill-chip-pill__tag">${escapeHtml(skill.proficiency)}</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-skill-id]').forEach((pill) => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-skill-id');
        const found = this.skills.find((s) => s.id === id);
        if (found) {
          this.selectedSkill = found;
          this.renderInspector(found);
          this.renderSkillsPills();
          this.drawConstellationFrame();
        }
      });
    });
  }

  renderInspector(skill) {
    const inspector = document.getElementById('skillConstellationInspector');
    if (!inspector) return;

    if (!skill) {
      inspector.innerHTML = `<p style="color:var(--text-muted);">Select any node in the 3D orbit or click a skill pill below to inspect details.</p>`;
      return;
    }

    const related = Array.isArray(skill.related_projects) ? skill.related_projects : [];
    inspector.innerHTML = `
      <div style="min-width:0;">
        <span class="section-eyebrow" style="margin-bottom:0.5rem;">SELECTED NODE TELEMETRY</span>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.65rem;">
          <h3 style="font-size:1.3rem;overflow-wrap:break-word;">${escapeHtml(skill.name)}</h3>
          ${skill.proficiency ? `<span class="badge badge--accent">${escapeHtml(skill.proficiency)}</span>` : ''}
        </div>
        <p class="mono" style="font-size:0.74rem;color:var(--accent-primary);margin-bottom:0.65rem;overflow-wrap:break-word;">
          Domain // ${escapeHtml(skill.category)}
        </p>
        <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.6;overflow-wrap:break-word;">
          ${escapeHtml(skill.description || 'Core technology in Saksham Pandey’s NexVora engineering stack.')}
        </p>
      </div>
      <div style="min-width:0;">
        <span class="mono" style="font-size:0.68rem;text-transform:uppercase;color:var(--text-muted);display:block;margin-bottom:0.45rem;">
          Associated Architecture &amp; Projects
        </span>
        ${
          related.length > 0
            ? `<div class="tag-list">${related
                .map((r) => `<a href="projects.html" class="tech-tag" style="border-color:var(--border-accent);">${escapeHtml(r)}</a>`)
                .join('')}</div>`
            : `<span style="font-size:0.8rem;color:var(--text-muted);">Applied across NexVora full-stack architecture</span>`
        }
      </div>
    `;
  }

  initConstellationCanvas() {
    this.canvas = document.getElementById('skillConstellationCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    this.buildConstellationNodes();

    if (!this.canvas.dataset.bound) {
      this.canvas.dataset.bound = 'true';
      window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let closest = null;
        let minDist = 36;
        this.nodes.forEach((n) => {
          const d = Math.hypot(n.screenX - mx, n.screenY - my);
          if (d < minDist) {
            minDist = d;
            closest = n;
          }
        });

        if (closest) {
          this.selectedSkill = closest.skill;
          this.renderInspector(closest.skill);
          this.renderSkillsPills();
          this.drawConstellationFrame();
        }
      });

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        this.drawConstellationFrame();
      } else {
        const loop = () => {
          if (!document.hidden) {
            this.rotAngle += 0.0045;
            this.drawConstellationFrame();
          }
          this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
      }
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(260, rect.width);
    this.height = Math.max(260, rect.height);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  buildConstellationNodes() {
    const list = this.getFilteredSkills();
    const total = list.length || 1;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    this.nodes = list.map((skill, i) => {
      const y = total === 1 ? 0 : 1 - (i / (total - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      return {
        skill,
        x: Math.cos(theta) * radius,
        y: y * 0.78,
        z: Math.sin(theta) * radius,
        screenX: 0,
        screenY: 0,
        scale: 1
      };
    });
  }

  drawConstellationFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const sphereRadius = Math.min(this.width, this.height) * 0.35;

    // Draw subtle circular orbital tracks in the center
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(26, 117, 255, 0.16)' : 'rgba(26, 117, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const cosA = Math.cos(this.rotAngle);
    const sinA = Math.sin(this.rotAngle);

    this.nodes.forEach((node) => {
      const rx = node.x * cosA - node.z * sinA;
      const rz = node.z * cosA + node.x * sinA;
      const perspective = 2.8 / (2.8 - rz * 0.85);
      node.screenX = cx + rx * sphereRadius * perspective;
      node.screenY = cy + node.y * sphereRadius * perspective;
      node.depth = rz;
      node.scale = perspective;
    });

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const sameCategory = n1.skill.category === n2.skill.category;
        const dist = Math.hypot(n1.screenX - n2.screenX, n1.screenY - n2.screenY);
        if (sameCategory || dist < sphereRadius * 0.82) {
          ctx.beginPath();
          ctx.moveTo(n1.screenX, n1.screenY);
          ctx.lineTo(n2.screenX, n2.screenY);
          ctx.strokeStyle = sameCategory
            ? 'rgba(242, 140, 40, 0.36)'
            : isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(22,22,26,0.08)';
          ctx.lineWidth = sameCategory ? 1.4 : 0.9;
          ctx.stroke();
        }
      }
    }

    const sorted = [...this.nodes].sort((a, b) => a.depth - b.depth);
    sorted.forEach((node) => {
      const isSelected = this.selectedSkill && this.selectedSkill.id === node.skill.id;
      const r = (isSelected ? 8.5 : 5.5) * node.scale;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 140, 40, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#F28C28' : isDark ? '#4CC9FF' : '#16161A';
      ctx.fill();

      ctx.font = `${isSelected ? '700' : '600'} 11px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = isSelected
        ? '#F28C28'
        : isDark
        ? 'rgba(245,245,247,0.88)'
        : 'rgba(22,22,26,0.88)';
      ctx.fillText(node.skill.name, node.screenX + r + 5, node.screenY + 3.5);
    });
  }
}

export const skillsController = new SkillsController();
