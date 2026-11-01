/**
 * ==========================================================================
 * MAIN PUBLIC PORTFOLIO ORCHESTRATOR — SAKSHAM PANDEY | NEXVORA TECHNOLOGIES
 * ==========================================================================
 * Supports multi-page architecture (index.html, about.html, projects.html,
 * contact.html) as well as unified single-page sections, with ambient 3D
 * particle + terminal canvas, rotating circular skill orbit, compact skill
 * pills, and real-time synchronization.
 */

import { repository } from './data/repository.js';
import { apiService } from './services/api.js';
import { themeController } from './theme.js';
import { navigationController } from './navigation.js';
import { Ambient3DBackground, Hero3DScene, initCard3DTilt } from './scene-3d.js';
import { animationController } from './animations.js';
import { skillsController } from './skills.js';
import { projectsController } from './projects.js';
import { resumesController } from './resumes.js';
import { contactController } from './contact.js';
import { escapeHtml, sanitizeUrl, formatDate } from './utils.js';

class PortfolioApp {
  constructor() {
    this.ambientBg = new Ambient3DBackground('ambient3dBgCanvas');
    this.heroScene = new Hero3DScene('hero3dCanvas');
    this.activeTimelineTab = 'all';
    this.activeAchievementTab = 'all';
  }

  async init() {
    await repository.init();
    const data = repository.getPublicData();

    themeController.init(data.theme_settings);
    this.ambientBg.init();
    animationController.initOpeningSequence(data.theme_settings);
    animationController.initLiveCodeExplainer();
    this.renderSyncBanner();
    this.renderAll(data);
    this.heroScene.init(data.hero?.sculpture_mode || 'crystalline');

    // Subscribe to real-time updates from the Admin CMS
    repository.subscribe((updatedPublicData) => {
      themeController.init(updatedPublicData.theme_settings);
      this.renderSyncBanner();
      this.renderAll(updatedPublicData);
    });
  }

  renderSyncBanner() {
    const banner = document.getElementById('syncStatusBanner');
    if (!banner) return;

    banner.innerHTML = `
      <span class="sync-banner__dot" style="background:var(--status-success);box-shadow:0 0 8px var(--status-success);"></span>
      <span><strong>NexVora Technologies:</strong> Empowering the Future Through Technology · Ranchi, India · Available Worldwide</span>
    `;
  }

  renderAll(data) {
    this.applySeoMeta(data.seo_settings, data.profile);
    navigationController.render(data.navigation_settings, data.profile);
    this.renderHero(data.profile, data.hero);
    this.renderAbout(data.profile, data.about);
    this.renderAgencyServices(data.about);
    skillsController.render(data.skills);
    this.renderTimeline(data.experiences, data.education);
    projectsController.render(data.projects);
    this.renderFeaturedProjectsPreview(data.projects);
    this.renderAchievements(data.achievements, data.certifications);
    resumesController.render(data.resumes);
    contactController.render(
      data.contact_settings,
      data.whatsapp_settings,
      data.social_links,
      data.profile
    );
    this.renderFooter(data.profile, data.site_settings, data.social_links, data.navigation_settings);

    animationController.initScrollReveals();
    initCard3DTilt();
  }

  applySeoMeta(seo = {}, profile = {}) {
    const page = navigationController.detectCurrentPage();
    const baseTitle =
      seo.site_title ||
      `${profile.full_name || 'Saksham Pandey'} | ${profile.brand_name || 'NexVora Technologies'}`;

    if (page === 'about.html') {
      document.title = `About & Agency Services — ${baseTitle}`;
    } else if (page === 'projects.html') {
      document.title = `Projects, Case Studies & Resumes — ${baseTitle}`;
    } else if (page === 'contact.html') {
      document.title = `Contact & Direct WhatsApp — ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    const setMeta = (selector, attr, value) => {
      if (!value) return;
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', seo.meta_description || profile.short_bio);
    setMeta('meta[property="og:title"]', 'content', seo.og_title || seo.site_title);
    setMeta('meta[property="og:description"]', 'content', seo.og_description || seo.meta_description);
    setMeta('meta[property="og:image"]', 'content', seo.og_image);
  }

  renderHero(profile = {}, hero = {}) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };

    setText('heroEyebrow', hero.eyebrow || `${profile.brand_name || 'NEXVORA TECHNOLOGIES'} // STUDIO`);
    setText('heroTitlePrefix', hero.title_prefix || 'Engineering Dimensional,');
    setText('heroTitleHighlight', hero.title_highlight || 'High-Throughput');
    setText('heroTitleSuffix', hero.title_suffix || 'Digital Systems.');
    setText('heroHeadlineText', `${profile.full_name || 'Saksham Pandey'} — ${profile.headline || ''}`);
    setText('heroSubtitleText', hero.subtitle || profile.short_bio || '');
    setText('heroMetaLocation', profile.location || 'Ranchi, Jharkhand, India');
    setText('heroMetaBrand', profile.brand_name || 'NEXVORA TECHNOLOGIES');
    setText('heroMetaRelocation', profile.relocation_preference || 'Global Remote & India');

    setText('spatialTopLabel', hero.telemetry_top_label || 'NEXVORA STUDIO');
    setText('spatialTopValue', hero.telemetry_top_value || 'AI · Web · ERP · CRM');
    setText('spatialBottomLabel', hero.telemetry_bottom_label || 'PRIMARY STACK');
    setText('spatialBottomValue', hero.telemetry_bottom_value || 'TS · Python · FastAPI · Node');

    const profileImg = document.getElementById('heroProfileImage');
    if (profileImg && profile.avatar_url) {
      profileImg.src = sanitizeUrl(profile.avatar_url);
    }

    const availBadge = document.getElementById('heroAvailabilityBadge');
    const availText = document.getElementById('heroAvailabilityText');
    if (availBadge) {
      availBadge.style.display = profile.show_availability === false ? 'none' : 'inline-flex';
    }
    if (availText) {
      availText.textContent = profile.availability_text || 'Available for Opportunities & Client Projects';
    }

    const primaryCta = document.getElementById('heroPrimaryCta');
    if (primaryCta) {
      primaryCta.textContent = hero.primary_cta_label || 'Explore Projects';
      primaryCta.setAttribute('href', hero.primary_cta_target || 'projects.html');
    }

    const secondaryCta = document.getElementById('heroSecondaryCta');
    if (secondaryCta) {
      secondaryCta.textContent = hero.secondary_cta_label || 'View Resumes & CV';
      secondaryCta.setAttribute('href', hero.secondary_cta_target || 'projects.html#resumes');
    }

    animationController.startSpecialtyRotator(hero.specialties);
  }

  renderAbout(profile = {}, about = {}) {
    const narrativeEl = document.getElementById('aboutNarrativeContent');
    if (narrativeEl) {
      const blocks = [
        { label: 'Founder & Engineering Overview', text: about.introduction },
        { label: 'Technical Architecture & Interests', text: about.technical_interests },
        { label: 'Core Engineering Strengths', text: about.professional_strengths },
        { label: 'Working Philosophy', text: about.working_style },
        {
          label: 'Current Focus & NexVora Vision',
          text: `${about.current_focus || ''} ${about.career_goals || ''}`.trim()
        }
      ].filter((b) => b.text);

      narrativeEl.innerHTML = blocks
        .map(
          (b) => `
          <div style="margin-bottom:1.35rem;min-width:0;">
            <span class="mono" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent-primary);display:block;margin-bottom:0.25rem;overflow-wrap:break-word;">
              // ${escapeHtml(b.label)}
            </span>
            <p style="color:var(--text-secondary);margin:0;overflow-wrap:break-word;">${escapeHtml(b.text)}</p>
          </div>
        `
        )
        .join('');
    }

    const pillarsEl = document.getElementById('aboutPillarsContainer');
    if (pillarsEl && Array.isArray(about.pillars)) {
      pillarsEl.innerHTML = about.pillars
        .map(
          (p, i) => `
          <article class="card-3d pillar-card">
            <div class="pillar-card__icon">${escapeHtml(p.code || `0${i + 1}`)}</div>
            <div style="min-width:0;">
              <h3 class="pillar-card__title">${escapeHtml(p.title)}</h3>
              <p class="pillar-card__desc">${escapeHtml(p.description)}</p>
            </div>
          </article>
        `
        )
        .join('');
    }

    const aboutProfileImg = document.getElementById('aboutProfileImage');
    if (aboutProfileImg && profile.avatar_url) {
      aboutProfileImg.src = sanitizeUrl(profile.avatar_url);
    }
  }

  renderAgencyServices(about = {}) {
    const grid = document.getElementById('agencyServicesGrid');
    if (!grid) return;

    const services = Array.isArray(about.agency_services)
      ? about.agency_services
      : [
          {
            code: 'NV-01',
            title: 'AI Automation & Intelligent Agents',
            description: 'Custom LLM workflows, RAG knowledge pipelines, and automated business processes.'
          },
          {
            code: 'NV-02',
            title: 'Mobile & Web Application Engineering',
            description: 'Responsive, high-performance web platforms and cross-platform mobile applications.'
          },
          {
            code: 'NV-03',
            title: 'ERP, CRM & Management Software',
            description: 'Tailored enterprise resource planning, customer management, and real-time analytics dashboards.'
          },
          {
            code: 'NV-04',
            title: 'UI/UX Design & Digital Transformation',
            description: '3D interactive web experiences, design systems, and end-to-end cloud modernization.'
          }
        ];

    grid.innerHTML = services
      .map(
        (srv) => `
        <article class="card-3d service-agency-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <span class="badge badge--accent">${escapeHtml(srv.code)}</span>
            <span class="mono" style="font-size:0.72rem;color:var(--text-muted);">NEXVORA SOLUTIONS</span>
          </div>
          <h3 style="font-size:1.18rem;margin-bottom:0.5rem;overflow-wrap:break-word;">${escapeHtml(srv.title)}</h3>
          <p style="font-size:0.92rem;color:var(--text-secondary);margin-bottom:1.1rem;overflow-wrap:break-word;">${escapeHtml(srv.description)}</p>
          <a href="contact.html" class="btn btn--ghost btn--sm" style="padding-left:0;color:var(--accent-primary);">
            Discuss Solution →
          </a>
        </article>
      `
      )
      .join('');
  }

  renderFeaturedProjectsPreview(projects = []) {
    const previewGrid = document.getElementById('homeFeaturedProjectsGrid');
    if (!previewGrid) return;

    const featured = projects.filter((p) => p.featured).slice(0, 6);
    const list = featured.length > 0 ? featured : projects.slice(0, 6);

    previewGrid.innerHTML = list
      .map((proj) => {
        const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
        const cover = sanitizeUrl(proj.cover_image || 'assets/images/project-nexvora-mesh.svg');
        return `
          <article class="card-3d project-card">
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
                ${stack.slice(0, 5).map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
              <div class="project-card__footer">
                <a href="projects.html" class="btn btn--primary btn--sm">
                  Full Case Study →
                </a>
                ${
                  proj.github_url
                    ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">GitHub ↗</a>`
                    : ''
                }
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  renderTimeline(experiences = [], education = []) {
    const tabsContainer = document.getElementById('timelineFilterTabs');
    const listContainer = document.getElementById('timelineListContainer');
    if (!listContainer) return;

    const combined = [
      ...experiences.map((e) => ({ ...e, _group: 'experience' })),
      ...education.map((e) => ({ ...e, _group: 'education' }))
    ];

    const renderItems = () => {
      const filtered =
        this.activeTimelineTab === 'all'
          ? combined
          : combined.filter((item) => item._group === this.activeTimelineTab);

      if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">No timeline entries published in this view.</div>`;
        return;
      }

      listContainer.innerHTML = filtered
        .map((item) => {
          const start = formatDate(item.start_date);
          const end = item.is_current || !item.end_date ? 'Present' : formatDate(item.end_date);
          const highlights = Array.isArray(item.highlights) ? item.highlights : [];
          const techs = Array.isArray(item.technologies) ? item.technologies : [];

          return `
            <article class="card-3d timeline-item">
              <div class="timeline-item__header">
                <div style="min-width:0;">
                  <span class="badge" style="margin-bottom:0.4rem;">${escapeHtml(item.type || (item._group === 'education' ? 'Education' : 'Experience'))}</span>
                  <h3 class="timeline-item__role">${escapeHtml(item.title)}</h3>
                  <p class="timeline-item__org">
                    ${escapeHtml(item.organization)}
                    ${item.location ? `<span style="color:var(--text-muted);font-weight:400;"> · ${escapeHtml(item.location)}</span>` : ''}
                  </p>
                </div>
                <span class="timeline-item__dates">${escapeHtml(start)} — ${escapeHtml(end)}</span>
              </div>

              ${item.description ? `<p style="font-size:0.94rem;overflow-wrap:break-word;">${escapeHtml(item.description)}</p>` : ''}

              ${
                highlights.length > 0
                  ? `<ul class="timeline-item__highlights">
                      ${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
                     </ul>`
                  : ''
              }

              ${
                techs.length > 0
                  ? `<div class="tag-list" style="margin-top:1rem;">
                      ${techs.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
                     </div>`
                  : ''
              }

              ${
                item.external_link
                  ? `<div style="margin-top:0.85rem;">
                      <a href="${escapeHtml(sanitizeUrl(item.external_link))}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost btn--sm">
                        Verify / External Reference ↗
                      </a>
                     </div>`
                  : ''
              }
            </article>
          `;
        })
        .join('');

      initCard3DTilt();
    };

    if (tabsContainer && !tabsContainer.dataset.bound) {
      tabsContainer.dataset.bound = 'true';
      tabsContainer.querySelectorAll('[data-timeline-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeTimelineTab = btn.getAttribute('data-timeline-tab');
          tabsContainer.querySelectorAll('[data-timeline-tab]').forEach((b) =>
            b.classList.toggle('is-active', b === btn)
          );
          renderItems();
        });
      });
    }

    renderItems();
  }

  renderAchievements(achievements = [], certifications = []) {
    const grid = document.getElementById('achievementsGridContainer');
    const tabs = document.getElementById('achievementsFilterTabs');
    if (!grid) return;

    const allItems = [
      ...achievements.map((a) => ({ ...a, _kind: 'achievement' })),
      ...certifications.map((c) => ({ ...c, _kind: 'certification' }))
    ];

    const renderCards = () => {
      const filtered =
        this.activeAchievementTab === 'all'
          ? allItems
          : allItems.filter((x) => x._kind === this.activeAchievementTab);

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No published records in this category.</div>`;
        return;
      }

      grid.innerHTML = filtered
        .map(
          (item) => `
          <article class="card-3d resume-card">
            <div style="min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                <span class="badge badge--accent">${escapeHtml(item.category || (item._kind === 'certification' ? 'Certification' : 'Achievement'))}</span>
                <span class="mono" style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(item.date || '')}</span>
              </div>
              <h3 style="font-size:1.15rem;margin-bottom:0.35rem;overflow-wrap:break-word;">${escapeHtml(item.title)}</h3>
              <p class="mono" style="font-size:0.76rem;color:var(--accent-primary);margin-bottom:0.65rem;overflow-wrap:break-word;">
                Issuer // ${escapeHtml(item.issuer || 'Verified')}
              </p>
              <p style="font-size:0.9rem;color:var(--text-secondary);overflow-wrap:break-word;">
                ${escapeHtml(item.description || '')}
              </p>
            </div>
            ${
              item.credential_url
                ? `<div>
                    <a href="${escapeHtml(sanitizeUrl(item.credential_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">
                      Verify Credential ↗
                    </a>
                   </div>`
                : ''
            }
          </article>
        `
        )
        .join('');

      initCard3DTilt();
    };

    if (tabs && !tabs.dataset.bound) {
      tabs.dataset.bound = 'true';
      tabs.querySelectorAll('[data-ach-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeAchievementTab = btn.getAttribute('data-ach-tab');
          tabs.querySelectorAll('[data-ach-tab]').forEach((b) =>
            b.classList.toggle('is-active', b === btn)
          );
          renderCards();
        });
      });
    }

    renderCards();
  }

  renderFooter(profile = {}, siteSettings = {}, socialLinks = [], navSettings = {}) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };

    setText('footerBrandName', profile.full_name || 'Saksham Pandey');
    setText('footerCompanySub', profile.brand_name || 'NEXVORA TECHNOLOGIES');
    setText('footerTagline', siteSettings.footer_tagline || profile.short_bio || '');
    setText('footerAttribution', siteSettings.footer_attribution || 'Designed and engineered by Saksham Pandey · NexVora Technologies.');
    setText('footerPrivacyNotice', siteSettings.privacy_notice || '');
    setText('footerYear', String(new Date().getFullYear()));
    setText('footerCopyrightHolder', siteSettings.copyright_holder || 'Saksham Pandey · NEXVORA TECHNOLOGIES');

    const footerNav = document.getElementById('footerNavLinks');
    if (footerNav) {
      const links = [
        { label: 'Home & 3D Studio', href: 'index.html' },
        { label: 'About & Agency Services', href: 'about.html' },
        { label: 'Projects & Case Studies', href: 'projects.html' },
        { label: 'Resumes & CV Hub', href: 'projects.html#resumes' },
        { label: 'Contact & WhatsApp', href: 'contact.html' }
      ];
      footerNav.innerHTML = links
        .map(
          (item) =>
            `<li><a href="${escapeHtml(item.href)}" style="color:var(--text-secondary);font-size:0.9rem;">${escapeHtml(item.label)}</a></li>`
        )
        .join('');
    }

    const footerSocials = document.getElementById('footerSocialLinks');
    if (footerSocials && Array.isArray(socialLinks)) {
      footerSocials.innerHTML = socialLinks
        .map(
          (s) =>
            `<li><a href="${escapeHtml(sanitizeUrl(s.url))}" target="_blank" rel="noopener noreferrer" style="color:var(--text-secondary);font-size:0.9rem;overflow-wrap:break-word;">${escapeHtml(s.platform)} ↗</a></li>`
        )
        .join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.init();
});
