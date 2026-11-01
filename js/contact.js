/**
 * ==========================================================================
 * CONTACT & OFFICIAL WHATSAPP (wa.me) INTEGRATION CONTROLLER
 * ==========================================================================
 */

import {
  escapeHtml,
  sanitizeUrl,
  buildWhatsAppUrl,
  isValidWhatsAppNumber,
  showToast
} from './utils.js';
import { repository } from './data/repository.js';

export class ContactController {
  constructor() {
    this.contactSettings = {};
    this.whatsappSettings = {};
    this.boundForm = false;
  }

  render(contactSettings = {}, whatsappSettings = {}, socialLinks = [], profile = {}) {
    this.contactSettings = contactSettings || {};
    this.whatsappSettings = whatsappSettings || {};

    const headingEl = document.getElementById('contactHeading');
    const subheadingEl = document.getElementById('contactSubheading');
    const emailEl = document.getElementById('contactDirectEmail');
    const responseNoteEl = document.getElementById('contactResponseNote');
    const consentEl = document.getElementById('contactConsentText');

    if (headingEl && contactSettings.heading) headingEl.textContent = contactSettings.heading;
    if (subheadingEl && contactSettings.subheading) subheadingEl.textContent = contactSettings.subheading;
    if (emailEl) {
      const addr = contactSettings.recipient_email || profile.email || 'contact@nexvora.dev';
      emailEl.textContent = addr;
      emailEl.href = `mailto:${addr}`;
    }
    if (responseNoteEl && contactSettings.response_time_note) {
      responseNoteEl.textContent = contactSettings.response_time_note;
    }
    if (consentEl && contactSettings.consent_text) {
      consentEl.textContent = contactSettings.consent_text;
    }

    // Populate Project Type & Budget dropdowns
    const subjectSelect = document.getElementById('contactSubject');
    if (subjectSelect && Array.isArray(contactSettings.project_types)) {
      subjectSelect.innerHTML = contactSettings.project_types
        .map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
        .join('');
    }

    const budgetSelect = document.getElementById('contactBudget');
    if (budgetSelect && Array.isArray(contactSettings.budget_ranges)) {
      budgetSelect.innerHTML = contactSettings.budget_ranges
        .map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`)
        .join('');
    }

    // Render Social Links in Contact sidebar
    const socialList = document.getElementById('contactSocialList');
    if (socialList && Array.isArray(socialLinks)) {
      socialList.innerHTML = socialLinks
        .map(
          (s) => `
          <a href="${escapeHtml(sanitizeUrl(s.url))}"
             target="_blank"
             rel="noopener noreferrer"
             class="btn btn--secondary btn--sm">
            <span class="mono" style="color:var(--accent-primary);">${escapeHtml(s.icon || '↗')}</span>
            <span>${escapeHtml(s.platform)}</span>
          </a>
        `
        )
        .join('');
    }

    // Configure Floating WhatsApp CTA & Direct WhatsApp Card Button
    this.updateWhatsAppLinks();
    this.bindFormEvents();
  }

  updateWhatsAppLinks() {
    const floatingBtn = document.getElementById('floatingWhatsAppBtn');
    const floatingLabel = document.getElementById('floatingWhatsAppLabel');
    const directWaBtn = document.getElementById('contactDirectWhatsAppBtn');
    const waStatusNote = document.getElementById('whatsappConfigNote');

    const phone = this.whatsappSettings.phone_number || '';
    const greeting =
      this.whatsappSettings.default_greeting ||
      'Hello Saksham, I visited your portfolio website and would like to connect.';

    const defaultWaUrl = buildWhatsAppUrl(phone, { intro: greeting });

    if (floatingBtn) {
      if (this.whatsappSettings.show_floating_button === false) {
        floatingBtn.style.display = 'none';
      } else {
        floatingBtn.style.display = 'inline-flex';
        floatingBtn.href = defaultWaUrl;
      }
    }

    if (floatingLabel && this.whatsappSettings.floating_label) {
      floatingLabel.textContent = this.whatsappSettings.floating_label;
    }

    if (directWaBtn) {
      directWaBtn.href = defaultWaUrl;
    }

    if (waStatusNote) {
      if (!this.whatsappSettings.is_configured_by_owner) {
        waStatusNote.textContent =
          'Note: WhatsApp number is currently using the starter placeholder. Configure your verified country code + number in /admin/ -> WhatsApp Settings.';
        waStatusNote.style.display = 'block';
      } else {
        waStatusNote.style.display = 'none';
      }
    }
  }

  getFormValues() {
    return {
      name: (document.getElementById('contactName')?.value || '').trim(),
      email: (document.getElementById('contactEmail')?.value || '').trim(),
      subject: (document.getElementById('contactSubject')?.value || '').trim(),
      budget: (document.getElementById('contactBudget')?.value || '').trim(),
      deadline: (document.getElementById('contactDeadline')?.value || '').trim(),
      message: (document.getElementById('contactMessage')?.value || '').trim()
    };
  }

  validateForm(values, requireEmail = true) {
    let valid = true;
    const setError = (inputId, errId, msg) => {
      const input = document.getElementById(inputId);
      const err = document.getElementById(errId);
      if (input) {
        input.classList.toggle('is-invalid', Boolean(msg));
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
      if (err) err.textContent = msg || '';
      if (msg) valid = false;
    };

    if (!values.name || values.name.length < 2) {
      setError('contactName', 'errContactName', 'Please enter your name (at least 2 characters).');
    } else {
      setError('contactName', 'errContactName', '');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (requireEmail && (!values.email || !emailRegex.test(values.email))) {
      setError('contactEmail', 'errContactEmail', 'Please enter a valid email address.');
    } else if (values.email && !emailRegex.test(values.email)) {
      setError('contactEmail', 'errContactEmail', 'Please enter a valid email format.');
    } else {
      setError('contactEmail', 'errContactEmail', '');
    }

    if (!values.message || values.message.length < 10) {
      setError('contactMessage', 'errContactMessage', 'Please enter a message of at least 10 characters.');
    } else {
      setError('contactMessage', 'errContactMessage', '');
    }

    return valid;
  }

  bindFormEvents() {
    if (this.boundForm) return;
    this.boundForm = true;

    const form = document.getElementById('portfolioContactForm');
    const waSubmitBtn = document.getElementById('sendViaWhatsAppBtn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const values = this.getFormValues();
        if (!this.validateForm(values, true)) {
          showToast('Please check the highlighted form fields.', 'error');
          return;
        }

        const submitBtn = document.getElementById('submitContactFormBtn');
        const statusBox = document.getElementById('contactFormStatus');
        const originalText = submitBtn ? submitBtn.textContent : 'Send Inquiry';

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Transmitting...';
          }

          await repository.submitContactMessage(values);
          form.reset();

          if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.background = 'var(--status-success-bg)';
            statusBox.style.color = 'var(--status-success)';
            statusBox.textContent =
              '✓ Inquiry recorded! You can also click "Send via WhatsApp" to open an instant chat with Saksham.';
          }
          showToast('Message saved to inbox!', 'success');
        } catch (err) {
          if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.background = 'var(--status-danger-bg)';
            statusBox.style.color = 'var(--status-danger)';
            statusBox.textContent = err.message || 'Unable to submit message right now.';
          }
          showToast(err.message || 'Submission failed', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      });
    }

    if (waSubmitBtn) {
      waSubmitBtn.addEventListener('click', () => {
        const values = this.getFormValues();
        if (!this.validateForm(values, false)) {
          showToast('Please enter your name and message before opening WhatsApp.', 'warning');
          return;
        }

        const rawNumber = this.whatsappSettings.phone_number || '';
        if (rawNumber && !isValidWhatsAppNumber(rawNumber)) {
          showToast('Configured WhatsApp number format is invalid. Opening generic WhatsApp share.', 'warning');
        }

        const waUrl = buildWhatsAppUrl(rawNumber, {
          intro:
            this.whatsappSettings.default_greeting ||
            'Hello Saksham, I am reaching out from your portfolio contact form:',
          name: values.name,
          email: values.email,
          subject: values.subject,
          budget: values.budget,
          deadline: values.deadline,
          message: values.message
        });

        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening WhatsApp with your prefilled message...', 'info');
      });
    }
  }
}

export const contactController = new ContactController();
