/**
 * ==========================================================================
 * ADMIN SETTINGS MODULES (13, 14, 15, 16, 17, 19, 20)
 * ==========================================================================
 * Handles Contact & Inbox, WhatsApp Normalization & wa.me Builder, Theme &
 * 3D Design, Navigation Visibility, SEO, Site-Wide Footer Content, and
 * Admin Account / Backend Security Configuration.
 */

import { repository } from '../../js/data/repository.js';
import { apiService } from '../../js/services/api.js';
import { authService } from '../../js/services/auth.js';
import {
  escapeHtml,
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppUrl,
  formatDate,
  showToast
} from '../../js/utils.js';

/* --------------------------------------------------------------------------
   MODULE 13: CONTACT SETTINGS & INQUIRY INBOX
   -------------------------------------------------------------------------- */
export function renderContactModule(container, state, refreshView, confirmDelete) {
  const c = state.contact_settings || {};
  const messages = Array.isArray(state.contact_messages) ? state.contact_messages : [];

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Contact Settings &amp; Form Configuration</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Configure contact headings, direct email, response time note, and project inquiry options.
          </p>
        </div>
      </div>
      <form id="adminContactSettingsForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="cntHeading">Section Heading</label>
            <input type="text" id="cntHeading" class="form-input" value="${escapeHtml(c.heading || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="cntEmail">Recipient Email</label>
            <input type="email" id="cntEmail" class="form-input" value="${escapeHtml(c.recipient_email || '')}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="cntSubheading">Section Subheading</label>
          <textarea id="cntSubheading" rows="2" class="form-textarea">${escapeHtml(c.subheading || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="cntResponse">Response Time Notice</label>
            <input type="text" id="cntResponse" class="form-input" value="${escapeHtml(c.response_time_note || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="cntConsent">Consent Language</label>
            <input type="text" id="cntConsent" class="form-input" value="${escapeHtml(c.consent_text || '')}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="cntTypes">Project / Inquiry Types (One per line)</label>
            <textarea id="cntTypes" rows="4" class="form-textarea">${escapeHtml((c.project_types || []).join('\n'))}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="cntBudgets">Budget Ranges (One per line)</label>
            <textarea id="cntBudgets" rows="4" class="form-textarea">${escapeHtml((c.budget_ranges || []).join('\n'))}</textarea>
          </div>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary btn--sm">Save Contact Settings</button>
        </div>
      </form>
    </section>

    <section class="admin-panel">
      <div class="admin-panel__header">
        <h3 style="font-size:1.1rem;">Visitor Inquiry Inbox (${messages.length})</h3>
      </div>
      <div class="admin-panel__body">
        ${
          messages.length === 0
            ? `<p style="color:var(--text-muted);font-size:0.88rem;">No inquiries submitted yet.</p>`
            : `<div style="display:flex;flex-direction:column;gap:0.85rem;">
                ${messages
                  .map(
                    (m) => `
                  <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.4rem;">
                      <div>
                        <strong>${escapeHtml(m.name)}</strong>
                        <span class="mono" style="font-size:0.75rem;color:var(--accent-primary);margin-left:0.5rem;">&lt;${escapeHtml(m.email)}&gt;</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:0.75rem;">
                        <span class="mono" style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(formatDate(m.created_at))}</span>
                        <button type="button" class="btn btn--ghost btn--sm" style="color:var(--status-danger);" data-del-msg="${escapeHtml(m.id)}">Delete</button>
                      </div>
                    </div>
                    <p class="mono" style="font-size:0.76rem;color:var(--text-secondary);margin-bottom:0.4rem;">
                      Type: ${escapeHtml(m.subject || 'General')} · Budget: ${escapeHtml(m.budget || 'N/A')} · Timeline: ${escapeHtml(m.deadline || 'N/A')}
                    </p>
                    <p style="font-size:0.9rem;color:var(--text-primary);margin:0;">${escapeHtml(m.message)}</p>
                  </div>`
                  )
                  .join('')}
               </div>`
        }
      </div>
    </section>
  `;

  document.getElementById('adminContactSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await repository.updateSingleton('contact_settings', {
        heading: document.getElementById('cntHeading').value.trim(),
        recipient_email: document.getElementById('cntEmail').value.trim(),
        subheading: document.getElementById('cntSubheading').value.trim(),
        response_time_note: document.getElementById('cntResponse').value.trim(),
        consent_text: document.getElementById('cntConsent').value.trim(),
        project_types: document.getElementById('cntTypes').value.split('\n').map((s) => s.trim()).filter(Boolean),
        budget_ranges: document.getElementById('cntBudgets').value.split('\n').map((s) => s.trim()).filter(Boolean)
      });
      showToast('Contact settings updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelectorAll('[data-del-msg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-msg');
      confirmDelete('Delete this visitor message?', async () => {
        await repository.deleteCollectionItem('contact_messages', id);
        showToast('Message deleted', 'info');
        refreshView();
      });
    });
  });
}

/* --------------------------------------------------------------------------
   MODULE 14: WHATSAPP INTEGRATION SETTINGS
   -------------------------------------------------------------------------- */
export function renderWhatsAppModule(container, state) {
  const w = state.whatsapp_settings || {};
  const normalized = normalizeWhatsAppNumber(w.phone_number || '');
  const sampleLink = buildWhatsAppUrl(normalized, {
    intro: w.default_greeting || 'Hello Saksham!',
    name: 'Sample Recruiter',
    subject: 'Full Stack Role Inquiry',
    message: 'Testing official wa.me prefilled message integration.'
  });

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">WhatsApp Integration Settings (Official wa.me)</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Configure your WhatsApp number (including country code, e.g., 91 for India), default prefilled message, and floating button visibility.
          </p>
        </div>
      </div>

      <form id="adminWhatsAppForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="waPhoneInput">
              <span>WhatsApp Phone Number (Include Country Code, e.g., +91 98765 43210) *</span>
            </label>
            <input type="tel"
                   id="waPhoneInput"
                   class="form-input"
                   placeholder="+91 9876543210"
                   value="${escapeHtml(w.phone_number || '')}"
                   required />
            <span id="waNormalizedPreview" class="mono" style="font-size:0.75rem;color:var(--accent-primary);">
              Normalized E.164 Digits: ${escapeHtml(normalized || 'None')}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label" for="waFloatingLabel">Floating CTA Button Text</label>
            <input type="text"
                   id="waFloatingLabel"
                   class="form-input"
                   value="${escapeHtml(w.floating_label || 'Chat on WhatsApp')}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="waGreetingInput">Default Prefilled Opening Greeting</label>
          <textarea id="waGreetingInput" rows="2" class="form-textarea">${escapeHtml(w.default_greeting || '')}</textarea>
        </div>

        <label class="switch-wrap" style="margin-bottom:1.25rem;">
          <input type="checkbox" id="waShowFloating" ${w.show_floating_button !== false ? 'checked' : ''} />
          <span>Show Floating WhatsApp Button on Public Website</span>
        </label>

        <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);margin-bottom:1.25rem;">
          <strong style="font-size:0.82rem;display:block;margin-bottom:0.35rem;">Generated Official wa.me URL Preview:</strong>
          <code id="waUrlLiveCode" style="font-size:0.74rem;word-break:break-all;color:var(--text-secondary);display:block;margin-bottom:0.75rem;">
            ${escapeHtml(sampleLink)}
          </code>
          <a id="waTestLaunchBtn" href="${escapeHtml(sampleLink)}" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--sm">
            Test Prefilled WhatsApp Link ↗
          </a>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save &amp; Publish WhatsApp Settings</button>
        </div>
      </form>
    </section>
  `;

  const phoneInput = document.getElementById('waPhoneInput');
  const greetingInput = document.getElementById('waGreetingInput');
  const normPreview = document.getElementById('waNormalizedPreview');
  const liveCode = document.getElementById('waUrlLiveCode');
  const testBtn = document.getElementById('waTestLaunchBtn');

  const updatePreview = () => {
    const raw = phoneInput.value;
    const digits = normalizeWhatsAppNumber(raw);
    const valid = isValidWhatsAppNumber(raw);
    normPreview.textContent = valid
      ? `✓ Valid E.164 Normalized Digits: ${digits}`
      : `⚠ Enter 8–15 digits including country code (Current digits: ${digits || 'none'})`;
    normPreview.style.color = valid ? 'var(--status-success)' : 'var(--status-danger)';

    const url = buildWhatsAppUrl(digits, {
      intro: greetingInput.value.trim(),
      name: 'Sample Visitor',
      subject: 'Portfolio Collaboration',
      message: 'Hello Saksham, testing WhatsApp link generation.'
    });
    liveCode.textContent = url;
    testBtn.href = url;
  };

  phoneInput.addEventListener('input', updatePreview);
  greetingInput.addEventListener('input', updatePreview);

  document.getElementById('adminWhatsAppForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawPhone = phoneInput.value.trim();
    if (!isValidWhatsAppNumber(rawPhone)) {
      showToast('Please enter a valid phone number including country code (8 to 15 digits).', 'error');
      return;
    }

    try {
      await repository.updateSingleton('whatsapp_settings', {
        phone_number: normalizeWhatsAppNumber(rawPhone),
        is_configured_by_owner: true,
        floating_label: document.getElementById('waFloatingLabel').value.trim() || 'Chat on WhatsApp',
        default_greeting: greetingInput.value.trim(),
        show_floating_button: document.getElementById('waShowFloating').checked
      });
      showToast('WhatsApp number normalized and published!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 15: THEME & DESIGN SETTINGS
   -------------------------------------------------------------------------- */
export function renderThemeModule(container, state) {
  const t = state.theme_settings || {};
  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Theme, Accent Palette &amp; 3D Experience Controls</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Configure default light/dark appearance, brand accent colors (#F28C28 default), opening intro sequence, and desktop cursor.
          </p>
        </div>
      </div>
      <form id="adminThemeForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="thmDefault">Default Portfolio Theme</label>
            <select id="thmDefault" class="form-select">
              <option value="light" ${t.default_theme !== 'dark' ? 'selected' : ''}>Warm Pearl Light Theme (Recommended Signature)</option>
              <option value="dark" ${t.default_theme === 'dark' ? 'selected' : ''}>Refined Charcoal Dark Theme</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="thmPrimaryAccent">Primary Brand Accent Hex (#F28C28)</label>
            <input type="text" id="thmPrimaryAccent" class="form-input" value="${escapeHtml(t.accent_color || '#F28C28')}" />
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.85rem;margin-block:1rem;">
          <label class="switch-wrap">
            <input type="checkbox" id="thmEnableIntro" ${t.enable_opening_intro !== false ? 'checked' : ''} />
            <span>Enable Cinematic 3D Opening Sequence on First Visit</span>
          </label>
          <label class="switch-wrap">
            <input type="checkbox" id="thmEnableCursor" ${t.enable_custom_cursor !== false ? 'checked' : ''} />
            <span>Enable Subtle Custom Desktop Cursor Ring</span>
          </label>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save Design System Settings</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById('adminThemeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await repository.updateSingleton('theme_settings', {
        default_theme: document.getElementById('thmDefault').value,
        accent_color: document.getElementById('thmPrimaryAccent').value.trim() || '#F28C28',
        enable_opening_intro: document.getElementById('thmEnableIntro').checked,
        enable_custom_cursor: document.getElementById('thmEnableCursor').checked
      });
      showToast('Theme settings updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 16: NAVIGATION & SECTION VISIBILITY
   -------------------------------------------------------------------------- */
export function renderNavigationModule(container, state, refreshView) {
  const nav = state.navigation_settings || {};
  const sections = [...(nav.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Navigation &amp; Section Visibility</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Customize navigation link labels and toggle public visibility for any portfolio section.
          </p>
        </div>
      </div>
      <form id="adminNavSettingsForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="navCtaLabel">Header CTA Button Label</label>
            <input type="text" id="navCtaLabel" class="form-input" value="${escapeHtml(nav.cta_label || 'Let’s Talk')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="navCtaTarget">Header CTA Target Anchor</label>
            <input type="text" id="navCtaTarget" class="form-input" value="${escapeHtml(nav.cta_target || '#contact')}" />
          </div>
        </div>

        <div class="admin-table-wrap" style="margin-block:1rem;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Section ID</th>
                <th>Navigation Label</th>
                <th>Public Visibility</th>
              </tr>
            </thead>
            <tbody>
              ${sections
                .map(
                  (sec, idx) => `
                <tr>
                  <td class="mono">#${escapeHtml(sec.id)}</td>
                  <td>
                    <input type="text"
                           class="form-input"
                           style="max-width:240px;padding:0.4rem 0.65rem;"
                           data-nav-label="${idx}"
                           value="${escapeHtml(sec.label)}" />
                  </td>
                  <td>
                    <label class="switch-wrap">
                      <input type="checkbox"
                             data-nav-vis="${idx}"
                             ${sec.visible !== false ? 'checked' : ''}
                             ${sec.id === 'home' ? 'disabled' : ''} />
                      <span>${sec.id === 'home' ? 'Always Visible (Hero)' : 'Visible on Website'}</span>
                    </label>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save Navigation &amp; Visibility</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById('adminNavSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const updatedSections = sections.map((sec, idx) => ({
        ...sec,
        label: container.querySelector(`[data-nav-label="${idx}"]`).value.trim() || sec.label,
        visible: sec.id === 'home' ? true : container.querySelector(`[data-nav-vis="${idx}"]`).checked
      }));

      await repository.updateSingleton('navigation_settings', {
        cta_label: document.getElementById('navCtaLabel').value.trim() || 'Let’s Talk',
        cta_target: document.getElementById('navCtaTarget').value.trim() || '#contact',
        sections: updatedSections
      });
      showToast('Navigation & section visibility updated!', 'success');
      refreshView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 17: SEO & OPEN GRAPH SETTINGS
   -------------------------------------------------------------------------- */
export function renderSeoModule(container, state) {
  const s = state.seo_settings || {};
  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">SEO &amp; Open Graph Metadata</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Configure search engine page title, meta description, canonical URL, and social sharing cards.
          </p>
        </div>
      </div>
      <form id="adminSeoForm" class="admin-panel__body">
        <div class="form-group">
          <label class="form-label" for="seoTitle">Document Title (&lt;title&gt;)</label>
          <input type="text" id="seoTitle" class="form-input" value="${escapeHtml(s.site_title || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="seoDesc">Meta Description</label>
          <textarea id="seoDesc" rows="2" class="form-textarea">${escapeHtml(s.meta_description || '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="seoOgTitle">Open Graph Social Title</label>
            <input type="text" id="seoOgTitle" class="form-input" value="${escapeHtml(s.og_title || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="seoCanonical">Canonical URL</label>
            <input type="url" id="seoCanonical" class="form-input" value="${escapeHtml(s.canonical_url || '')}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="seoOgImage">Open Graph Preview Image Path/URL</label>
          <input type="text" id="seoOgImage" class="form-input" value="${escapeHtml(s.og_image || '')}" />
        </div>
        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save SEO Metadata</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById('adminSeoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await repository.updateSingleton('seo_settings', {
        site_title: document.getElementById('seoTitle').value.trim(),
        meta_description: document.getElementById('seoDesc').value.trim(),
        og_title: document.getElementById('seoOgTitle').value.trim(),
        canonical_url: document.getElementById('seoCanonical').value.trim(),
        og_image: document.getElementById('seoOgImage').value.trim()
      });
      showToast('SEO metadata saved!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 19: SITE-WIDE CONTENT & FOOTER SETTINGS
   -------------------------------------------------------------------------- */
export function renderSiteSettingsModule(container, state) {
  const st = state.site_settings || {};
  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Site-Wide Footer &amp; Attribution Settings</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Customize footer tagline, copyright holder, privacy notice, and the signature attribution line.
          </p>
        </div>
      </div>
      <form id="adminSiteSettingsForm" class="admin-panel__body">
        <div class="form-group">
          <label class="form-label" for="stTagline">Footer Tagline</label>
          <textarea id="stTagline" rows="2" class="form-textarea">${escapeHtml(st.footer_tagline || '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="stAttribution">Signature Attribution Line</label>
            <input type="text" id="stAttribution" class="form-input" value="${escapeHtml(st.footer_attribution || 'Designed and developed by Saksham Pandey.')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="stCopyright">Copyright Holder</label>
            <input type="text" id="stCopyright" class="form-input" value="${escapeHtml(st.copyright_holder || '')}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="stPrivacy">Visitor Privacy Notice</label>
          <textarea id="stPrivacy" rows="2" class="form-textarea">${escapeHtml(st.privacy_notice || '')}</textarea>
        </div>
        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save Site-Wide Content</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById('adminSiteSettingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await repository.updateSingleton('site_settings', {
        footer_tagline: document.getElementById('stTagline').value.trim(),
        footer_attribution: document.getElementById('stAttribution').value.trim(),
        copyright_holder: document.getElementById('stCopyright').value.trim(),
        privacy_notice: document.getElementById('stPrivacy').value.trim()
      });
      showToast('Site-wide footer settings saved!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 20: ADMIN ACCOUNT, SUPABASE CONNECTION & SECURITY SETTINGS
   -------------------------------------------------------------------------- */
export function renderSecurityModule(container, refreshView, confirmDelete) {
  const session = authService.getSession();
  const cfg = apiService.config;

  container.innerHTML = `
    <div class="form-row" style="align-items:start;">
      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h2 style="font-size:1.15rem;">Supabase Cloud Persistence Connection</h2>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">
              Connect your Supabase Project URL and Public Anon Key for cross-device cloud persistence.
            </p>
          </div>
        </div>
        <form id="adminBackendConfigForm" class="admin-panel__body">
          <div class="form-group">
            <label class="form-label" for="secSupaUrl">Supabase Project URL</label>
            <input type="url" id="secSupaUrl" class="form-input" placeholder="https://your-project.supabase.co" value="${escapeHtml(cfg.supabaseUrl || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="secSupaKey">Public Anon Key (Never use service_role key)</label>
            <input type="text" id="secSupaKey" class="form-input" placeholder="eyJhbGciOiJIUzI1NiIs..." value="${escapeHtml(cfg.supabaseAnonKey || '')}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="secBucketRes">Resumes Storage Bucket</label>
              <input type="text" id="secBucketRes" class="form-input" value="${escapeHtml(cfg.storageBucketResumes || 'resumes')}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="secBucketMed">Media Storage Bucket</label>
              <input type="text" id="secBucketMed" class="form-input" value="${escapeHtml(cfg.storageBucketMedia || 'portfolio-media')}" />
            </div>
          </div>
          <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
            <button type="button" id="secDisconnectBtn" class="btn btn--secondary btn--sm">Use Local Preview Mode</button>
            <button type="submit" class="btn btn--primary btn--sm">Save Cloud Config</button>
          </div>
        </form>
      </section>

      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h2 style="font-size:1.15rem;">Admin Session &amp; Password Security</h2>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">
              Active User: <strong>${escapeHtml(session?.user?.email || 'Admin')}</strong> (${escapeHtml(session?.mode || 'session')})
            </p>
          </div>
        </div>
        <form id="adminPasswordUpdateForm" class="admin-panel__body">
          <div class="form-group">
            <label class="form-label" for="secNewPassword">New Administrator Password (min 8 chars)</label>
            <input type="password" id="secNewPassword" class="form-input" minlength="8" placeholder="••••••••••••" required />
          </div>
          <button type="submit" class="btn btn--primary btn--sm">Update Supabase Password</button>

          <div style="margin-top:2rem;padding-top:1.25rem;border-top:1px solid var(--border-subtle);">
            <h3 style="font-size:0.95rem;color:var(--status-danger);margin-bottom:0.4rem;">Factory Seed Reset</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem;">
              Restore all starter content for Saksham Pandey (NEXVORA TECHNOLOGIES). A rollback checkpoint will still be saved automatically before resetting.
            </p>
            <button type="button" id="resetSeedDataBtn" class="btn btn--secondary btn--sm" style="border-color:var(--status-danger);color:var(--status-danger);">
              Reset Repository to Starter Seed Data
            </button>
          </div>
        </form>
      </section>
    </div>
  `;

  document.getElementById('adminBackendConfigForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const supabaseUrl = document.getElementById('secSupaUrl').value.trim();
    const supabaseAnonKey = document.getElementById('secSupaKey').value.trim();
    const storageBucketResumes = document.getElementById('secBucketRes').value.trim() || 'resumes';
    const storageBucketMedia = document.getElementById('secBucketMed').value.trim() || 'portfolio-media';

    if (!supabaseUrl.startsWith('https://') || !supabaseAnonKey) {
      showToast('Please enter a valid https:// Supabase URL and Anon Key.', 'error');
      return;
    }

    apiService.saveConfig({ supabaseUrl, supabaseAnonKey, storageBucketResumes, storageBucketMedia });
    showToast('Supabase configuration saved. Please sign in with your Supabase account.', 'success');
    setTimeout(() => window.location.replace('login.html'), 900);
  });

  document.getElementById('secDisconnectBtn').addEventListener('click', () => {
    apiService.clearConfig();
    authService.startLocalPreviewSession();
    showToast('Switched to Local Preview Mode', 'info');
    refreshView();
  });

  document.getElementById('adminPasswordUpdateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('secNewPassword').value;
    try {
      await authService.updatePassword(pw);
      document.getElementById('secNewPassword').value = '';
      showToast('Administrator password updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('resetSeedDataBtn').addEventListener('click', () => {
    confirmDelete('Reset all portfolio sections to the initial Saksham Pandey starter seed data?', async () => {
      await repository.resetToSeedData();
      showToast('Repository reset to starter seed data!', 'success');
      refreshView();
    });
  });
}
