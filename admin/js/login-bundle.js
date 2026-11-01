/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE LOGIN BUNDLE
 */
(function () {
  if (window.__NEXVORA_LOGIN_RUNTIME_LOADED__) return;
  window.__NEXVORA_LOGIN_RUNTIME_LOADED__ = true;

/* === MODULE: js/utils.js === */
/**
 * ==========================================================================
 * UTILITIES, SECURITY HELPERS, WHATSAPP NORMALIZER & A11Y TOOLS
 * ==========================================================================
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function sanitizeUrl(url, allowRelative = true) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';
  if (allowRelative && (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('#') || trimmed.startsWith('assets/'))) {
    return trimmed;
  }
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/') || trimmed.startsWith('data:application/pdf')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch {
    return '#';
  }
  return '#';
}
function uid(prefix = 'id') {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID().split('-')[0]
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
}
function formatDate(dateInput) {
  if (!dateInput) return 'Present';
  try {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Normalizes a phone number into international E.164 digits-only format required by wa.me.
 * Strips spaces, dashes, parentheses, and leading '+' or '00'.
 */
function normalizeWhatsAppNumber(rawNumber = '') {
  if (!rawNumber || typeof rawNumber !== 'string') return '';
  let cleaned = rawNumber.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }
  // Digits only
  const digits = cleaned.replace(/\D/g, '');
  return digits;
}

/**
 * Validates that a normalized WhatsApp number has between 8 and 15 digits (ITU-T E.164).
 */
function isValidWhatsAppNumber(rawNumber = '') {
  const digits = normalizeWhatsAppNumber(rawNumber);
  return /^\d{8,15}$/.test(digits);
}

/**
 * Builds an official https://wa.me/<number>?text=<encoded> link.
 */
function buildWhatsAppUrl(rawNumber, payload = {}) {
  const normalized = normalizeWhatsAppNumber(rawNumber);
  const lines = [];

  if (payload.intro) {
    lines.push(payload.intro);
  } else {
    lines.push('Hello Saksham, I visited your portfolio website and would like to connect.');
  }

  if (payload.name) lines.push(`\n*Name:* ${payload.name.trim()}`);
  if (payload.email) lines.push(`*Email:* ${payload.email.trim()}`);
  if (payload.subject) lines.push(`*Subject / Type:* ${payload.subject.trim()}`);
  if (payload.budget) lines.push(`*Estimated Budget:* ${payload.budget.trim()}`);
  if (payload.deadline) lines.push(`*Timeline:* ${payload.deadline.trim()}`);
  if (payload.message) lines.push(`\n*Message:*\n${payload.message.trim()}`);

  const fullText = lines.join('\n');
  const encodedText = encodeURIComponent(fullText);

  if (!normalized) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${normalized}?text=${encodedText}`;
}
function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function showToast(message, type = 'info', duration = 3800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: '◆'
  };

  const badge = document.createElement('span');
  badge.style.color = type === 'error' ? '#EF4444' : '#F28C28';
  badge.style.fontWeight = '700';
  badge.textContent = iconMap[type] || '◆';

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(badge);
  toast.appendChild(text);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.22s ease';
    setTimeout(() => toast.remove(), 240);
  }, duration);
}

/**
 * Accessible keyboard focus trap for modals and mobile menus.
 */
function trapFocus(element, onEscape) {
  const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeyDown(e) {
    if (e.key === 'Escape' && typeof onEscape === 'function') {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusables = Array.from(element.querySelectorAll(focusableSelector)).filter(
      (el) => el.offsetParent !== null
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  element.addEventListener('keydown', handleKeyDown);
  return () => element.removeEventListener('keydown', handleKeyDown);
}


/* === MODULE: js/services/api.js === */
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
class ApiService {
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
const apiService = new ApiService();


/* === MODULE: js/services/auth.js === */
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

const SESSION_STORAGE_KEY = 'nexvora_admin_session_v1';
const OWNER_CREDENTIALS_KEY = 'nexvora_owner_auth_v1';
const DEFAULT_OWNER_EMAILS = ['pandeysaksham180@gmail.com', 'saksham@nexvora.dev'];
const DEFAULT_OWNER_PASSWORD = 'NexVora@Saksham2026!';
class AuthService {
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
const authService = new AuthService();



  document.addEventListener('DOMContentLoaded', function () {
    if (authService.isAuthenticated()) {
      window.location.replace('index.html');
      return;
    }

    const modeBadge = document.getElementById('authModeBadge');
    const previewBox = document.getElementById('localPreviewAuthBox');
    const loginForm = document.getElementById('supabaseLoginForm');
    const loginBtn = document.getElementById('supabaseLoginBtn');
    const alertBox = document.getElementById('authAlertBox');
    const urlInput = document.getElementById('cfgSupabaseUrl');
    const keyInput = document.getElementById('cfgSupabaseKey');

    function setAlert(message, isError = true) {
      if (!message) {
        alertBox.style.display = 'none';
        return;
      }
      alertBox.style.display = 'block';
      alertBox.style.background = isError ? 'var(--status-danger-bg)' : 'var(--status-success-bg)';
      alertBox.style.color = isError ? 'var(--status-danger)' : 'var(--status-success)';
      alertBox.textContent = message;
    }

    function syncConnectionUI() {
      const configured = apiService.isConfigured();
      if (urlInput) urlInput.value = apiService.config.supabaseUrl || '';
      if (keyInput) keyInput.value = apiService.config.supabaseAnonKey || '';

      if (configured) {
        modeBadge.textContent = 'Live Supabase Auth';
        modeBadge.className = 'badge badge--available';
        if (previewBox) previewBox.style.display = 'none';
        loginBtn.disabled = false;
      } else {
        modeBadge.textContent = 'Owner Credential Lock';
        modeBadge.className = 'badge badge--accent';
        if (previewBox) previewBox.style.display = 'none';
        loginBtn.disabled = false;
      }
    }

    syncConnectionUI();

    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAlert('');
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (!email || !password) {
        setAlert('Please enter both your Administrator ID (Email) and Password.', true);
        return;
      }

      try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Verifying Owner Credentials...';
        await authService.signIn(email, password);
        window.location.replace('index.html');
      } catch (err) {
        setAlert(err.message || 'Access Denied: Invalid Administrator ID or Password.', true);
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Unlock NexVora Admin CMS';
      }
    });

    document.getElementById('saveBackendConfigBtn')?.addEventListener('click', () => {
      const supabaseUrl = urlInput.value.trim();
      const supabaseAnonKey = keyInput.value.trim();
      if (!supabaseUrl.startsWith('https://') || !supabaseAnonKey) {
        setAlert('Please enter a valid https:// Supabase URL and public anon key.', true);
        return;
      }
      apiService.saveConfig({ supabaseUrl, supabaseAnonKey });
      syncConnectionUI();
      setAlert('Supabase connection saved! Sign in with your Admin email and password.', false);
      showToast('Supabase connection configured', 'success');
    });

    document.getElementById('clearBackendConfigBtn')?.addEventListener('click', () => {
      apiService.clearConfig();
      syncConnectionUI();
      setAlert('Switched to Local Owner Authentication Mode.', false);
    });
  });
  
})();
