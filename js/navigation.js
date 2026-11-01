/**
 * ==========================================================================
 * NAVIGATION, MULTI-PAGE ROUTING & TELEPORT DROP-IN TRANSITIONS
 * ==========================================================================
 * Features:
 * - Multi-page navigation (index.html, about.html, projects.html, contact.html)
 * - NexVora Technologies branding header
 * - Centralized "Teleport Drop-In" transition: a code glyph/bracket icon (< />)
 *   explodes outward from the center on page/route changes, followed by a
 *   snappy teleport drop-in reveal for incoming page content.
 */

import { escapeHtml } from './utils.js';

export class NavigationController {
  constructor() {
    this.isOpen = false;
    this.boundListeners = false;
    this.currentPage = this.detectCurrentPage();
  }

  detectCurrentPage() {
    const bodyPage = document.body?.getAttribute('data-page');
    if (bodyPage) return bodyPage;

    const path = (window.location.pathname || '').toLowerCase();
    if (path.endsWith('about.html') || path.endsWith('/about')) return 'about.html';
    if (path.endsWith('projects.html') || path.endsWith('/projects')) return 'projects.html';
    if (path.endsWith('contact.html') || path.endsWith('/contact')) return 'contact.html';
    return 'index.html';
  }

  render(navSettings = {}, profile = {}) {
    this.currentPage = this.detectCurrentPage();

    const brandNameEl = document.getElementById('navBrandName');
    const brandSubEl = document.getElementById('navBrandSub');

    if (brandNameEl) brandNameEl.textContent = profile.full_name || 'Saksham Pandey';
    if (brandSubEl) brandSubEl.textContent = profile.brand_name || 'NEXVORA TECHNOLOGIES';

    const defaultPages = [
      { id: 'home', label: 'Home', href: 'index.html', visible: true, order: 1 },
      { id: 'about', label: 'About & Services', href: 'about.html', visible: true, order: 2 },
      { id: 'projects', label: 'Projects & CV', href: 'projects.html', visible: true, order: 3 },
      { id: 'contact', label: 'Contact', href: 'contact.html', visible: true, order: 4 }
    ];

    const sections = Array.isArray(navSettings.sections) && navSettings.sections.length > 0
      ? [...navSettings.sections].sort((a, b) => (a.order || 0) - (b.order || 0))
      : defaultPages;

    const navList = document.getElementById('navMenuList');
    if (navList) {
      // Check if we use multi-page links (index.html, about.html, projects.html, contact.html)
      // Always include the 4 main pages plus quick section anchors if on index.html
      const pageLinks = [
        { id: 'home', label: 'Home', href: 'index.html' },
        { id: 'about', label: 'About & Agency', href: 'about.html' },
        { id: 'projects', label: 'Projects & CV', href: 'projects.html' },
        { id: 'contact', label: 'Contact', href: 'contact.html' }
      ];

      navList.innerHTML = pageLinks
        .map((item) => {
          const isActive = this.currentPage === item.href;
          return `<li>
            <a href="${escapeHtml(item.href)}"
               class="nav-link ${isActive ? 'is-active' : ''}"
               data-page-route="${escapeHtml(item.href)}"
               data-section-link="${escapeHtml(item.id)}">
              ${escapeHtml(item.label)}
            </a>
          </li>`;
        })
        .join('');
    }

    // Apply section visibility on page if configured in Admin CMS
    sections.forEach((sec) => {
      const domSection = document.getElementById(sec.id);
      if (domSection && sec.id !== 'home') {
        domSection.style.display = sec.visible === false ? 'none' : '';
      }
    });

    const headerCta = document.getElementById('headerContactCta');
    if (headerCta) {
      headerCta.textContent = navSettings.cta_label || 'Let’s Talk';
      const targetHref =
        this.currentPage === 'contact.html'
          ? '#contact'
          : navSettings.cta_target && navSettings.cta_target.endsWith('.html')
          ? navSettings.cta_target
          : 'contact.html';
      headerCta.setAttribute('href', targetHref);
    }

    this.ensureTeleportOverlay();
    this.playIncomingTeleportDropIn();
    this.bindInteractions();
  }

  ensureTeleportOverlay() {
    let overlay = document.getElementById('teleportTransitionOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'teleportTransitionOverlay';
      overlay.className = 'teleport-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="teleport-overlay__core">
          <span class="teleport-overlay__bracket teleport-overlay__bracket--left">&lt;</span>
          <span class="teleport-overlay__slash">/</span>
          <span class="teleport-overlay__bracket teleport-overlay__bracket--right">&gt;</span>
          <div class="teleport-overlay__ring"></div>
          <span class="teleport-overlay__label">NEXVORA // TELEPORT ROUTE</span>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  playIncomingTeleportDropIn() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainEl = document.getElementById('mainContent') || document.querySelector('main');
    const overlay = this.ensureTeleportOverlay();

    let triggeredFromNav = false;
    try {
      triggeredFromNav = sessionStorage.getItem('nexvora_teleport_active') === '1';
      sessionStorage.removeItem('nexvora_teleport_active');
    } catch {
      // Ignore storage errors on restricted file:// origins
    }

    if (prefersReduced) {
      if (mainEl) mainEl.classList.add('teleport-drop-in-ready');
      return;
    }

    if (triggeredFromNav && overlay) {
      overlay.classList.add('is-exploding-in');
      setTimeout(() => {
        overlay.classList.remove('is-exploding-in');
      }, 520);
    }

    if (mainEl && !mainEl.dataset.teleportAnimated) {
      mainEl.dataset.teleportAnimated = 'true';
      mainEl.classList.remove('teleport-drop-in-active');
      void mainEl.offsetWidth; // Force reflow for snappy 60fps animation
      mainEl.classList.add('teleport-drop-in-active');
    }
  }

  triggerTeleportNavigation(targetHref) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.location.href = targetHref;
      return;
    }

    const overlay = this.ensureTeleportOverlay();
    const mainEl = document.getElementById('mainContent') || document.querySelector('main');

    try {
      sessionStorage.setItem('nexvora_teleport_active', '1');
    } catch {
      // Ignore
    }

    if (mainEl) {
      mainEl.classList.add('teleport-drop-out');
    }
    overlay.classList.add('is-exploding');

    setTimeout(() => {
      window.location.href = targetHref;
    }, 340);
  }

  bindInteractions() {
    if (this.boundListeners) return;
    this.boundListeners = true;

    const header = document.getElementById('siteHeader');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenuList');
    const backToTop = document.getElementById('backToTopBtn');

    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        navMenu.classList.toggle('is-open', this.isOpen);
        mobileBtn.setAttribute('aria-expanded', String(this.isOpen));
      });

      navMenu.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) {
          this.closeMobileMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMobileMenu();
          mobileBtn.focus();
        }
      });
    }

    // Intercept multi-page navigation clicks to play the "< />" Teleport Drop-In transition
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      // Ignore modified clicks, new-tab links, downloads, or external URLs
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      const rawHref = link.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref.startsWith('http') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      // Same-page hash anchor: trigger a quick visual teleport pulse & smooth scroll
      if (rawHref.startsWith('#')) {
        const targetSection = document.querySelector(rawHref);
        if (targetSection) {
          e.preventDefault();
          this.closeMobileMenu();
          this.pulseSectionTeleport(targetSection);
        }
        return;
      }

      // Internal multi-page route (index.html, about.html, projects.html, contact.html)
      const isPublicPage = /^(index|about|projects|contact)\.html(#.*)?$/i.test(rawHref);
      if (isPublicPage) {
        const [pagePart, hashPart] = rawHref.split('#');
        if (pagePart.toLowerCase() === this.currentPage.toLowerCase()) {
          if (hashPart) {
            const sec = document.getElementById(hashPart);
            if (sec) {
              e.preventDefault();
              this.closeMobileMenu();
              this.pulseSectionTeleport(sec);
            }
          } else {
            e.preventDefault();
            this.closeMobileMenu();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }

        e.preventDefault();
        this.closeMobileMenu();
        this.triggerTeleportNavigation(rawHref);
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        const scrollY = window.scrollY;
        if (header) {
          header.classList.toggle('is-scrolled', scrollY > 24);
        }
        if (backToTop) {
          backToTop.classList.toggle('is-visible', scrollY > 450);
        }
      },
      { passive: true }
    );

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  pulseSectionTeleport(targetSection) {
    const overlay = this.ensureTeleportOverlay();
    overlay.classList.add('is-exploding-quick');
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetSection.classList.remove('section-teleport-flash');
    void targetSection.offsetWidth;
    targetSection.classList.add('section-teleport-flash');
    setTimeout(() => {
      overlay.classList.remove('is-exploding-quick');
    }, 420);
  }

  closeMobileMenu() {
    this.isOpen = false;
    const navMenu = document.getElementById('navMenuList');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    if (navMenu) navMenu.classList.remove('is-open');
    if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
  }
}

export const navigationController = new NavigationController();
