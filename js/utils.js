/**
 * ==========================================================================
 * UTILITIES, SECURITY HELPERS, WHATSAPP NORMALIZER & A11Y TOOLS
 * ==========================================================================
 */

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url, allowRelative = true) {
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

export function uid(prefix = 'id') {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID().split('-')[0]
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
}

export function formatDate(dateInput) {
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
export function normalizeWhatsAppNumber(rawNumber = '') {
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
export function isValidWhatsAppNumber(rawNumber = '') {
  const digits = normalizeWhatsAppNumber(rawNumber);
  return /^\d{8,15}$/.test(digits);
}

/**
 * Builds an official https://wa.me/<number>?text=<encoded> link.
 */
export function buildWhatsAppUrl(rawNumber, payload = {}) {
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

export function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function showToast(message, type = 'info', duration = 3800) {
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
export function trapFocus(element, onEscape) {
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
