/**
 * ==========================================================================
 * UNIFIED DATA REPOSITORY — LIVE PERSISTENCE & PUBLIC/DRAFT ISOLATION
 * ==========================================================================
 * Single source of truth for both the Public Portfolio and the Private
 * Admin CMS (/admin/).
 *
 * Features:
 * - Syncs with Supabase PostgreSQL REST API when configured
 * - Provides full Local Preview persistence when Supabase is not yet connected
 * - Strictly filters out unpublished/draft items for public visitors
 * - Broadcasts real-time updates across tabs via BroadcastChannel
 * - Maintains rollback snapshots for safe content editing
 */

import { SEED_DATA } from './seed-data.js';
import { apiService } from '../services/api.js';
import { authService } from '../services/auth.js';
import { uid } from '../utils.js';

const REPO_STORAGE_KEY = 'nexvora_portfolio_repository_v4';
const SNAPSHOTS_STORAGE_KEY = 'nexvora_portfolio_snapshots_v4';
const SYNC_CHANNEL_NAME = 'nexvora_cms_live_sync';

export class PortfolioRepository {
  constructor() {
    this.state = null;
    this.listeners = new Set();
    this.channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(SYNC_CHANNEL_NAME)
      : null;

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          this.state = this.loadLocalState();
          this.notifyListeners();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === REPO_STORAGE_KEY) {
        this.state = this.loadLocalState();
        this.notifyListeners();
      }
    });
  }

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  loadLocalState() {
    try {
      const raw = localStorage.getItem(REPO_STORAGE_KEY);
      if (!raw) {
        const seeded = this.deepClone(SEED_DATA);
        localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      // Merge any missing top-level keys from SEED_DATA for forward compatibility
      return {
        ...this.deepClone(SEED_DATA),
        ...parsed
      };
    } catch {
      return this.deepClone(SEED_DATA);
    }
  }

  /**
   * Initializes repository from Supabase (if configured) or Local Preview store.
   */
  async init() {
    if (apiService.isConfigured()) {
      try {
        const rows = await apiService.request('/rest/v1/portfolio_state?id=eq.main&select=payload,updated_at');
        if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
          this.state = {
            ...this.deepClone(SEED_DATA),
            ...rows[0].payload
          };
          localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
          return this.state;
        }
      } catch (err) {
        console.warn('Supabase read fallback to cached state:', err.message);
      }
    }

    this.state = this.loadLocalState();
    return this.state;
  }

  /**
   * Returns ONLY published content safe for public visitors.
   * Unpublished drafts and private contact messages are stripped.
   */
  getPublicData() {
    if (!this.state) {
      this.state = this.loadLocalState();
    }
    const raw = this.deepClone(this.state);
    const sortByOrder = (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999);

    return {
      profile: raw.profile,
      hero: raw.hero,
      about: raw.about,
      skills: (raw.skills || []).filter((i) => i.published !== false).sort(sortByOrder),
      experiences: (raw.experiences || []).filter((i) => i.published !== false).sort(sortByOrder),
      education: (raw.education || []).filter((i) => i.published !== false).sort(sortByOrder),
      projects: (raw.projects || []).filter((i) => i.published !== false).sort(sortByOrder),
      achievements: (raw.achievements || []).filter((i) => i.published !== false).sort(sortByOrder),
      certifications: (raw.certifications || []).filter((i) => i.published !== false).sort(sortByOrder),
      resumes: (raw.resumes || []).filter((i) => i.published !== false).sort(sortByOrder),
      social_links: (raw.social_links || []).filter((i) => i.published !== false).sort(sortByOrder),
      contact_settings: raw.contact_settings,
      whatsapp_settings: raw.whatsapp_settings,
      theme_settings: raw.theme_settings,
      navigation_settings: raw.navigation_settings,
      seo_settings: raw.seo_settings,
      site_settings: raw.site_settings
    };
  }

  /**
   * Returns complete data (including drafts, media library, and contact inbox)
   * strictly for authenticated administrators.
   */
  getAdminData() {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized access: Admin session required.');
    }
    if (!this.state) {
      this.state = this.loadLocalState();
    }
    return this.deepClone(this.state);
  }

  /**
   * Saves a rollback snapshot before mutating state.
   */
  saveSnapshot(label = 'Auto-Backup before edit') {
    try {
      const current = this.state || this.loadLocalState();
      const rawHistory = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      history.unshift({
        id: uid('snap'),
        label,
        timestamp: new Date().toISOString(),
        state: current
      });
      // Keep last 8 snapshots
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(history.slice(0, 8)));
    } catch {
      // Ignore quota limits on snapshots
    }
  }

  getSnapshots() {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async restoreSnapshot(snapshotId) {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized: Admin authentication required.');
    }
    const snapshots = this.getSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target || !target.state) {
      throw new Error('Snapshot not found.');
    }
    return await this.persistFullState(target.state, `Restored snapshot (${target.label})`);
  }

  /**
   * Persists full state to Supabase (if configured) and local cache.
   */
  async persistFullState(newState, actionLabel = 'Updated content') {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized: Please log in as administrator to save changes.');
    }

    this.saveSnapshot(actionLabel);

    // If connected to Live Supabase, persist to remote database first and wait for confirmation
    if (apiService.isConfigured()) {
      const token = authService.getAccessToken();
      await apiService.request('/rest/v1/portfolio_state', {
        method: 'POST',
        accessToken: token,
        headers: {
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: {
          id: 'main',
          payload: newState,
          updated_at: new Date().toISOString()
        }
      });
    }

    this.state = this.deepClone(newState);
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));

    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
    this.notifyListeners();
    return this.state;
  }

  /**
   * Updates a singleton section (e.g., profile, hero, about, whatsapp_settings, etc.)
   */
  async updateSingleton(sectionKey, payload) {
    const current = this.getAdminData();
    current[sectionKey] = {
      ...(current[sectionKey] || {}),
      ...payload,
      updated_at: new Date().toISOString()
    };
    await this.persistFullState(current, `Updated ${sectionKey}`);
    return current[sectionKey];
  }

  /**
   * Creates or updates an item in a collection (projects, skills, resumes, experiences, etc.)
   */
  async upsertCollectionItem(collectionKey, item) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? [...current[collectionKey]] : [];

    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item, updated_at: now };
      } else {
        list.push({ ...item, updated_at: now });
      }
    } else {
      const newItem = {
        ...item,
        id: uid(collectionKey.slice(0, 4)),
        display_order: Number(item.display_order) || list.length + 1,
        published: item.published !== undefined ? Boolean(item.published) : true,
        updated_at: now
      };
      list.push(newItem);
    }

    current[collectionKey] = list;
    await this.persistFullState(current, `Saved item in ${collectionKey}`);
    return current[collectionKey];
  }

  /**
   * Deletes an item from a collection by ID.
   */
  async deleteCollectionItem(collectionKey, itemId) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? current[collectionKey] : [];
    current[collectionKey] = list.filter((x) => x.id !== itemId);
    await this.persistFullState(current, `Deleted item from ${collectionKey}`);
    return current[collectionKey];
  }

  /**
   * Toggles published / draft visibility of an item.
   */
  async togglePublishItem(collectionKey, itemId) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? current[collectionKey] : [];
    const target = list.find((x) => x.id === itemId);
    if (!target) throw new Error('Item not found.');
    target.published = !target.published;
    await this.persistFullState(current, `Toggled visibility in ${collectionKey}`);
    return target;
  }

  /**
   * Moves an item up or down in display_order.
   */
  async reorderCollectionItem(collectionKey, itemId, direction = 'up') {
    const current = this.getAdminData();
    const list = (current[collectionKey] || []).sort(
      (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999)
    );
    const idx = list.findIndex((x) => x.id === itemId);
    if (idx === -1) return list;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return list;

    const temp = list[idx];
    list[idx] = list[swapIdx];
    list[swapIdx] = temp;

    list.forEach((item, index) => {
      item.display_order = index + 1;
    });

    current[collectionKey] = list;
    await this.persistFullState(current, `Reordered ${collectionKey}`);
    return list;
  }

  /**
   * Increments resume download count (publicly allowed analytics counter).
   */
  async incrementResumeDownload(resumeId) {
    if (!this.state) this.state = this.loadLocalState();
    const resumes = this.state.resumes || [];
    const target = resumes.find((r) => r.id === resumeId);
    if (target) {
      target.download_count = (Number(target.download_count) || 0) + 1;
      localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      }
    }
    return target ? target.download_count : 0;
  }

  /**
   * Saves a visitor contact message (public submission with basic rate limit check).
   */
  async submitContactMessage(payload) {
    const lastSubmit = Number(sessionStorage.getItem('nexvora_last_contact_ts') || 0);
    if (Date.now() - lastSubmit < 8000) {
      throw new Error('Please wait a few seconds before submitting another message.');
    }

    if (!this.state) this.state = this.loadLocalState();
    const msgRecord = {
      id: uid('msg'),
      name: String(payload.name || '').trim().slice(0, 120),
      email: String(payload.email || '').trim().slice(0, 160),
      subject: String(payload.subject || '').trim().slice(0, 200),
      budget: String(payload.budget || '').trim().slice(0, 100),
      deadline: String(payload.deadline || '').trim().slice(0, 100),
      message: String(payload.message || '').trim().slice(0, 3000),
      created_at: new Date().toISOString(),
      status: 'unread'
    };

    if (apiService.isConfigured()) {
      await apiService.request('/rest/v1/contact_messages', {
        method: 'POST',
        body: msgRecord
      }).catch(() => {});
    }

    if (!Array.isArray(this.state.contact_messages)) {
      this.state.contact_messages = [];
    }
    this.state.contact_messages.unshift(msgRecord);
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
    sessionStorage.setItem('nexvora_last_contact_ts', String(Date.now()));

    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
    return msgRecord;
  }

  /**
   * Resets repository to initial starter seed data.
   */
  async resetToSeedData() {
    const seeded = this.deepClone(SEED_DATA);
    return await this.persistFullState(seeded, 'Reset to Starter Seed Data');
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.getPublicData());
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }
}

export const repository = new PortfolioRepository();
