# Quality Assurance & Verification Suite

This directory contains the automated verification suite and manual QA checklist for **Saksham Pandey's 3D Personal Portfolio + Admin CMS (`NEXVORA TECHNOLOGIES`)**.

## Running the Automated Verification Suite

Run the zero-dependency Node ES6 verification script from the project root:

```bash
node tests/verify-suite.mjs
```

## What Is Tested Automatically

1. **Non-Negotiable Stack Compliance**: Verifies that no banned frameworks (React, Next.js, Vue, Angular, Svelte, Tailwind, Bootstrap, jQuery) exist anywhere in the codebase.
2. **Security & Sanitization**:
   - `escapeHtml()` blocks `<script>` and attribute injection.
   - `sanitizeUrl()` blocks `javascript:` and `data:text/html` URIs while allowing safe `https:`, `mailto:`, and relative asset paths.
   - `StorageService.validateFile()` rejects executable extensions (`.exe`, `.js`, `.bat`, `.sh`, `.html`), non-PDF resume uploads, and oversized payloads (>10 MB).
3. **WhatsApp Official `wa.me` Builder**:
   - `normalizeWhatsAppNumber()` strips formatting characters and leading `+`/`00`.
   - `isValidWhatsAppNumber()` enforces E.164 length (8–15 digits).
   - `buildWhatsAppUrl()` generates properly URL-encoded `https://wa.me/<number>?text=...` links containing visitor name, email, subject, and message.
4. **Public vs. Unpublished Draft Isolation**:
   - Verifies that `repository.getPublicData()` strictly filters out any record with `published: false` across projects, skills, experiences, education, achievements, certifications, and resumes.
5. **Asset & File Integrity**:
   - Verifies that all HTML, CSS, JS, SQL, SVG, and PDF files exist and contain valid structure.
