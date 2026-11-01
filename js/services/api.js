/**
 * ==========================================================================
 * SUPABASE REST API SERVICE — ZERO-FRAMEWORK FETCH CLIENT
 * ==========================================================================
 * Communicates with Supabase PostgREST, GoTrue Auth, and Storage endpoints
 * using native browser fetch().
 *
 * Never stores or uses service_role secret keys on the client.
 * Write security is enforced by Supabase PostgreSQL Row-Level Security (RLS)
 * policies verifying the authenticated administrator's JWT Bearer token.
 */

const CONNECTION_CONFIG_KEY = 'nexvora_supabase_connection_v1';

export class ApiService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    // 1. Check runtime global config if provided
    if (window.__PORTFOLIO_CONFIG__ && window.__PORTFOLIO_CONFIG__.supabaseUrl && window.__PORTFOLIO_CONFIG__.supabaseAnonKey) {
      return {
        supabaseUrl: window.__PORTFOLIO_CONFIG__.supabaseUrl.replace(/\/+$/, ''),
        supabaseAnonKey: window.__PORTFOLIO_CONFIG__.supabaseAnonKey.trim(),
        storageBucketResumes: window.__PORTFOLIO_CONFIG__.storageBucketResumes || 'resumes',
        storageBucketMedia: window.__PORTFOLIO_CONFIG__.storageBucketMedia || 'portfolio-media'
      };
    }

    // 2. Check configured connection from Admin -> Backend Connection settings
    try {
      const saved = localStorage.getItem(CONNECTION_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
          return {
            supabaseUrl: parsed.supabaseUrl.replace(/\/+$/, ''),
            supabaseAnonKey: parsed.supabaseAnonKey.trim(),
            storageBucketResumes: parsed.storageBucketResumes || 'resumes',
            storageBucketMedia: parsed.storageBucketMedia || 'portfolio-media'
          };
        }
      }
    } catch {
      // Ignore storage read error
    }

    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storageBucketResumes: 'resumes',
      storageBucketMedia: 'portfolio-media'
    };
  }

  saveConfig({ supabaseUrl, supabaseAnonKey, storageBucketResumes = 'resumes', storageBucketMedia = 'portfolio-media' }) {
    const clean = {
      supabaseUrl: (supabaseUrl || '').trim().replace(/\/+$/, ''),
      supabaseAnonKey: (supabaseAnonKey || '').trim(),
      storageBucketResumes: (storageBucketResumes || 'resumes').trim(),
      storageBucketMedia: (storageBucketMedia || 'portfolio-media').trim()
    };
    localStorage.setItem(CONNECTION_CONFIG_KEY, JSON.stringify(clean));
    this.config = clean;
    return clean;
  }

  clearConfig() {
    localStorage.removeItem(CONNECTION_CONFIG_KEY);
    this.config = {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storageBucketResumes: 'resumes',
      storageBucketMedia: 'portfolio-media'
    };
  }

  isConfigured() {
    return Boolean(
      this.config.supabaseUrl &&
      this.config.supabaseAnonKey &&
      this.config.supabaseUrl.startsWith('https://')
    );
  }

  getHeaders(accessToken = null, extraHeaders = {}) {
    const headers = {
      apikey: this.config.supabaseAnonKey,
      Authorization: `Bearer ${accessToken || this.config.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    return headers;
  }

  /**
   * Queries or mutates the unified `portfolio_state` KV document table or
   * individual relational tables in Supabase.
   */
  async request(path, { method = 'GET', body = null, accessToken = null, headers = {} } = {}) {
    if (!this.isConfigured()) {
      throw new Error('Supabase backend is not configured. Operating in Local Preview Mode.');
    }

    const url = `${this.config.supabaseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(accessToken, headers),
      body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
      let errMessage = `Backend request failed (${response.status})`;
      try {
        const errJson = await response.json();
        errMessage = errJson.message || errJson.error_description || errJson.hint || errMessage;
      } catch {
        // Fallback to status text
      }
      const error = new Error(errMessage);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
