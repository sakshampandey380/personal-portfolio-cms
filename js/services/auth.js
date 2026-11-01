/**
 * ==========================================================================
 * AUTHENTICATION & SESSION SERVICE
 * ==========================================================================
 * Enforces real Supabase GoTrue JWT authentication when connected to a
 * Supabase project.
 *
 * When Supabase credentials have not yet been configured, provides an
 * explicitly labeled "Local Preview Sandbox Session" so the owner can
 * inspect and test all 20 CMS modules locally prior to cloud deployment.
 */

import { apiService } from './api.js';

const SESSION_STORAGE_KEY = 'nexvora_admin_session_v1';
const OWNER_CREDENTIALS_KEY = 'nexvora_owner_auth_v1';
const DEFAULT_OWNER_EMAILS = ['pandeysaksham180@gmail.com', 'saksham@nexvora.dev'];
const DEFAULT_OWNER_PASSWORD = 'NexVora@Saksham2026!';

export class AuthService {
  getOwnerConfig() {
    try {
      const raw = localStorage.getItem(OWNER_CREDENTIALS_KEY);
      if (!raw) {
        return {
          allowedEmails: DEFAULT_OWNER_EMAILS,
          password: DEFAULT_OWNER_PASSWORD
        };
      }
      const parsed = JSON.parse(raw);
      return {
        allowedEmails: Array.isArray(parsed.allowedEmails) && parsed.allowedEmails.length
          ? parsed.allowedEmails
          : DEFAULT_OWNER_EMAILS,
        password: parsed.password || DEFAULT_OWNER_PASSWORD
      };
    } catch {
      return {
        allowedEmails: DEFAULT_OWNER_EMAILS,
        password: DEFAULT_OWNER_PASSWORD
      };
    }
  }

  verifyOwnerCredentials(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');
    const cfg = this.getOwnerConfig();
    const emailAllowed = cfg.allowedEmails.some((e) => e.toLowerCase() === normalizedEmail);
    return emailAllowed && rawPassword === cfg.password;
  }

  getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);

      // Check token expiration
      if (session.expires_at && Date.now() > session.expires_at) {
        this.clearSession();
        return null;
      }

      // If Supabase was configured after a preview session started, invalidate preview session
      if (apiService.isConfigured() && session.mode === 'local-preview') {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  saveSession(sessionData) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  }

  clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  isAuthenticated() {
    return Boolean(this.getSession());
  }

  getAccessToken() {
    const session = this.getSession();
    return session ? session.access_token : null;
  }

  /**
   * Unified administrator sign-in requiring valid Owner ID (Email) & Password.
   * Uses Supabase GoTrue when configured, or strict Owner Credential verification.
   */
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both your Administrator ID (Email) and Password.');
    }

    if (apiService.isConfigured()) {
      return await this.signInWithSupabase(email, password);
    }

    if (!this.verifyOwnerCredentials(email, password)) {
      throw new Error('Access Denied: Invalid Administrator ID or Password.');
    }

    return this.startLocalPreviewSession(email.trim().toLowerCase());
  }

  /**
   * Authenticates with Supabase GoTrue using email + password.
   */
  async signInWithSupabase(email, password) {
    if (!apiService.isConfigured()) {
      throw new Error('Supabase URL and Anon Key are not configured yet.');
    }

    const data = await apiService.request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password }
    });

    if (!data || !data.access_token) {
      throw new Error('Authentication failed: No access token returned.');
    }

    const expiresInMs = (data.expires_in || 3600) * 1000;
    const session = {
      mode: 'supabase-live',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + expiresInMs,
      user: {
        id: data.user?.id || 'admin',
        email: data.user?.email || email,
        role: data.user?.role || 'authenticated'
      }
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Starts an authenticated Local Admin session when Supabase is not configured.
   */
  startLocalPreviewSession(adminEmail = 'pandeysaksham180@gmail.com') {
    if (apiService.isConfigured()) {
      throw new Error('Local Preview Mode is disabled when a Live Supabase Backend is configured. Please sign in with your Supabase Admin credentials.');
    }

    const session = {
      mode: 'local-preview',
      access_token: 'owner_authenticated_token',
      expires_at: Date.now() + 8 * 3600 * 1000, // 8 hours
      user: {
        id: 'nexvora_owner_admin',
        email: adminEmail || 'pandeysaksham180@gmail.com',
        role: 'owner_admin'
      }
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Updates password for the authenticated owner (persists locally or in Supabase).
   */
  async updatePassword(newPassword) {
    const session = this.getSession();
    if (!session) throw new Error('Your session has expired. Please sign in again.');
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const currentCfg = this.getOwnerConfig();
    localStorage.setItem(
      OWNER_CREDENTIALS_KEY,
      JSON.stringify({
        allowedEmails: currentCfg.allowedEmails,
        password: newPassword
      })
    );

    if (session.mode === 'supabase-live' && apiService.isConfigured()) {
      return await apiService.request('/auth/v1/user', {
        method: 'PUT',
        accessToken: session.access_token,
        body: { password: newPassword }
      });
    }

    return { updated: true, mode: 'owner-local' };
  }

  async signOut() {
    const session = this.getSession();
    if (session && session.mode === 'supabase-live' && apiService.isConfigured()) {
      try {
        await apiService.request('/auth/v1/logout', {
          method: 'POST',
          accessToken: session.access_token
        });
      } catch {
        // Proceed with local session cleanup even if network call fails
      }
    }
    this.clearSession();
  }
}

export const authService = new AuthService();
