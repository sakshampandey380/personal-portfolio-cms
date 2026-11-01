/**
 * ==========================================================================
 * ADMIN CMS MAIN CONTROLLER — ROUTE GUARD & 20-MODULE ROUTER
 * ==========================================================================
 */

import { authService } from '../../js/services/auth.js';
import { apiService } from '../../js/services/api.js';
import { repository } from '../../js/data/repository.js';
import { themeController } from '../../js/theme.js';
import { renderDashboardOverview } from './dashboard.js';
import {
  renderProfileModule,
  renderHeroModule,
  renderAboutModule,
  renderCollectionModule
} from './content-editor.js';
import {
  renderResumesManager,
  renderMediaLibraryModule
} from './resume-manager.js';
import {
  renderContactModule,
  renderWhatsAppModule,
  renderThemeModule,
  renderNavigationModule,
  renderSeoModule,
  renderSiteSettingsModule,
  renderSecurityModule
} from './settings.js';

class AdminCMSApp {
  constructor() {
    this.activeModule = 'overview';
    this.isDirty = false;
    this.pendingConfirmCallback = null;
  }

  async init() {
    // 1. Strict Route Protection
    if (!authService.isAuthenticated()) {
      window.location.replace('login.html');
      return;
    }

    await repository.init();
    const state = repository.getAdminData();
    themeController.init(state.theme_settings);

    this.updateTopbarStatus();
    this.bindNavigation();
    this.bindConfirmDialog();
    this.bindUnsavedWarning();
    this.renderCurrentModule();
  }

  updateTopbarStatus() {
    const session = authService.getSession();
    const badge = document.getElementById('adminModeStatusBadge');
    const userLabel = document.getElementById('adminActiveUserEmail');

    if (userLabel && session?.user?.email) {
      userLabel.textContent = session.user.email;
    }

    if (badge) {
      if (apiService.isConfigured() && session?.mode === 'supabase-live') {
        badge.className = 'badge badge--available';
        badge.textContent = '● Live Supabase Sync';
      } else {
        badge.className = 'badge badge--accent';
        badge.textContent = '◆ Local Preview Mode';
      }
    }
  }

  setDirty(dirty) {
    this.isDirty = Boolean(dirty);
    const indicator = document.getElementById('unsavedChangesIndicator');
    if (indicator) {
      indicator.style.display = this.isDirty ? 'inline-flex' : 'none';
    }
  }

  switchModule(moduleKey) {
    if (this.isDirty) {
      const proceed = window.confirm('You have unsaved changes on this form. Discard changes and switch module?');
      if (!proceed) return;
    }
    this.setDirty(false);
    this.activeModule = moduleKey;

    document.querySelectorAll('[data-admin-module]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-admin-module') === moduleKey);
    });

    // Close mobile sidebar if open
    document.getElementById('adminSidebar')?.classList.remove('is-open');
    this.renderCurrentModule();
  }

  renderCurrentModule() {
    if (!authService.isAuthenticated()) {
      window.location.replace('login.html');
      return;
    }

    const container = document.getElementById('adminModuleWorkspace');
    const titleEl = document.getElementById('adminCurrentModuleTitle');
    if (!container) return;

    const state = repository.getAdminData();
    const refresh = () => this.renderCurrentModule();
    const confirmDelete = (msg, onConfirm) => this.openConfirmModal(msg, onConfirm);
    const setDirty = (flag) => this.setDirty(flag);

    const moduleTitles = {
      overview: '1. Dashboard Overview',
      profile: '2. Profile & Personal Information',
      hero: '3. Hero Content & 3D Stage',
      about: '4. About Section & Pillars',
      skills: '5. Skills & Technology Categories',
      experience: '6. Professional Experience',
      education: '7. Education & Training',
      projects: '8. Projects & Case Studies',
      achievements: '9. Achievements & Milestones',
      certifications: '10. Certifications & Credentials',
      resumes: '11. Multiple Resumes & CV Manager',
      social: '12. Professional Social Links',
      contact: '13. Contact Settings & Inbox',
      whatsapp: '14. WhatsApp Integration (wa.me)',
      theme: '15. Theme & 3D Design Settings',
      navigation: '16. Navigation & Section Visibility',
      seo: '17. SEO & Open Graph Settings',
      media: '18. Media Asset Library',
      site: '19. Site-Wide Footer & Attribution',
      security: '20. Admin Account & Backend Security'
    };

    if (titleEl) {
      titleEl.textContent = moduleTitles[this.activeModule] || 'Admin CMS';
    }

    switch (this.activeModule) {
      case 'overview':
        renderDashboardOverview(container, state, (m) => this.switchModule(m));
        break;
      case 'profile':
        renderProfileModule(container, state, setDirty);
        break;
      case 'hero':
        renderHeroModule(container, state, setDirty);
        break;
      case 'about':
        renderAboutModule(container, state, setDirty);
        break;
      case 'skills':
        renderCollectionModule(container, 'skills', state, refresh, confirmDelete);
        break;
      case 'experience':
        renderCollectionModule(container, 'experiences', state, refresh, confirmDelete);
        break;
      case 'education':
        renderCollectionModule(container, 'education', state, refresh, confirmDelete);
        break;
      case 'projects':
        renderCollectionModule(container, 'projects', state, refresh, confirmDelete);
        break;
      case 'achievements':
        renderCollectionModule(container, 'achievements', state, refresh, confirmDelete);
        break;
      case 'certifications':
        renderCollectionModule(container, 'certifications', state, refresh, confirmDelete);
        break;
      case 'resumes':
        renderResumesManager(container, state, refresh, confirmDelete);
        break;
      case 'social':
        renderCollectionModule(container, 'social_links', state, refresh, confirmDelete);
        break;
      case 'contact':
        renderContactModule(container, state, refresh, confirmDelete);
        break;
      case 'whatsapp':
        renderWhatsAppModule(container, state);
        break;
      case 'theme':
        renderThemeModule(container, state);
        break;
      case 'navigation':
        renderNavigationModule(container, state, refresh);
        break;
      case 'seo':
        renderSeoModule(container, state);
        break;
      case 'media':
        renderMediaLibraryModule(container, state, refresh, confirmDelete);
        break;
      case 'site':
        renderSiteSettingsModule(container, state);
        break;
      case 'security':
        renderSecurityModule(container, refresh, confirmDelete);
        break;
      default:
        renderDashboardOverview(container, state, (m) => this.switchModule(m));
    }
  }

  bindNavigation() {
    document.querySelectorAll('[data-admin-module]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchModule(btn.getAttribute('data-admin-module'));
      });
    });

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.signOut();
        window.location.replace('login.html');
      });
    }

    const mobileSidebarToggle = document.getElementById('adminMobileSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (mobileSidebarToggle && sidebar) {
      mobileSidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
      });
    }
  }

  bindConfirmDialog() {
    const modal = document.getElementById('adminConfirmModal');
    const cancelBtn = document.getElementById('adminConfirmCancelBtn');
    const proceedBtn = document.getElementById('adminConfirmProceedBtn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        this.pendingConfirmCallback = null;
      });
    }

    if (proceedBtn) {
      proceedBtn.addEventListener('click', async () => {
        modal.classList.remove('is-open');
        if (typeof this.pendingConfirmCallback === 'function') {
          await this.pendingConfirmCallback();
          this.pendingConfirmCallback = null;
        }
      });
    }
  }

  openConfirmModal(message, onConfirm) {
    const modal = document.getElementById('adminConfirmModal');
    const msgEl = document.getElementById('adminConfirmMessage');
    if (!modal || !msgEl) return;
    msgEl.textContent = message;
    this.pendingConfirmCallback = onConfirm;
    modal.classList.add('is-open');
  }

  bindUnsavedWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cms = new AdminCMSApp();
  cms.init();
});
