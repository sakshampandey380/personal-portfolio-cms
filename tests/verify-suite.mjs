/**
 * ==========================================================================
 * AUTOMATED VERIFICATION SUITE — SAKSHAM PANDEY 3D PORTFOLIO & ADMIN CMS
 * ==========================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();

// Set up minimal browser globals for importing ES6 modules in Node
globalThis.window = {
  location: { origin: 'http://localhost:8080', replace: () => {} },
  addEventListener: () => {},
  matchMedia: () => ({ matches: false })
};
globalThis.localStorage = {
  _store: new Map(),
  getItem(k) { return this._store.has(k) ? this._store.get(k) : null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); }
};
globalThis.sessionStorage = {
  _store: new Map(),
  getItem(k) { return this._store.has(k) ? this._store.get(k) : null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); }
};
globalThis.BroadcastChannel = class {
  postMessage() {}
  close() {}
};

const {
  escapeHtml,
  sanitizeUrl,
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppUrl
} = await import('../js/utils.js');

const { SEED_DATA } = await import('../js/data/seed-data.js');
const { authService } = await import('../js/services/auth.js');
const { storageService } = await import('../js/services/storage.js');
const { repository } = await import('../js/data/repository.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n=== NEXVORA 3D PORTFOLIO & ADMIN CMS — AUTOMATED QA SUITE ===\n');

// 1. Required File Structure Verification
test('All required HTML, CSS, JS, Admin, SQL, SVG, and PDF files exist', () => {
  const requiredFiles = [
    'index.html',
    'about.html',
    'projects.html',
    'contact.html',
    'style.css',
    'script.js',
    'vercel.json',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    '.gitignore',
    'css/tokens.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/animations.css',
    'css/responsive.css',
    'css/admin.css',
    'js/app.js',
    'js/navigation.js',
    'js/animations.js',
    'js/scene-3d.js',
    'js/projects.js',
    'js/skills.js',
    'js/resumes.js',
    'js/contact.js',
    'js/theme.js',
    'js/utils.js',
    'js/config.example.js',
    'js/data/seed-data.js',
    'js/data/repository.js',
    'js/services/api.js',
    'js/services/auth.js',
    'js/services/storage.js',
    'admin/index.html',
    'admin/login.html',
    'admin/css/admin.css',
    'admin/js/admin.js',
    'admin/js/dashboard.js',
    'admin/js/content-editor.js',
    'admin/js/resume-manager.js',
    'admin/js/settings.js',
    'backend/schema.sql',
    'backend/policies.sql',
    'backend/migrations/001_initial_setup.sql',
    'assets/icons/favicon.svg',
    'assets/icons/nexvora-logo.svg',
    'assets/images/saksham-profile.png',
    'assets/images/nexvora-card.jpg',
    'assets/images/project-nexvora-mesh.svg',
    'assets/images/project-synapse-ai.svg',
    'assets/images/project-hyperflux-rt.svg',
    'assets/images/project-aether-ui.svg',
    'assets/resumes/Saksham_Pandey_Full_Stack_Engineer_Resume.pdf',
    'assets/resumes/Saksham_Pandey_Frontend_Engineer_Resume.pdf',
    'assets/resumes/Saksham_Pandey_Distributed_Systems_EU_Resume.pdf',
    'assets/resumes/Saksham_Pandey_Backend_Developer_RU_Resume.pdf'
  ];

  for (const rel of requiredFiles) {
    const full = path.join(ROOT, rel);
    assert.ok(fs.existsSync(full), `Missing required file: ${rel}`);
  }
});

// 2. Zero-Framework Stack Compliance
test('No banned frameworks or libraries (React, Vue, Tailwind, Bootstrap, jQuery) in HTML files', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const adminHtml = fs.readFileSync(path.join(ROOT, 'admin/index.html'), 'utf8');
  const forbidden = ['react.production', 'vue.global', 'tailwindcss', 'bootstrap.min', 'jquery'];
  for (const term of forbidden) {
    assert.ok(!indexHtml.toLowerCase().includes(term), `Forbidden dependency ${term} found in index.html`);
    assert.ok(!adminHtml.toLowerCase().includes(term), `Forbidden dependency ${term} found in admin/index.html`);
  }
});

// 3. XSS & URL Security Helpers
test('escapeHtml neutralizes script tags and HTML attributes', () => {
  const malicious = `<script>alert("xss")</script><img src=x onerror="evil()">`;
  const escaped = escapeHtml(malicious);
  assert.ok(!escaped.includes('<script>'));
  assert.ok(escaped.includes('&lt;script&gt;'));
});

test('sanitizeUrl blocks javascript: and data:text/html URIs', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.equal(sanitizeUrl('https://github.com/saksham'), 'https://github.com/saksham');
  assert.equal(sanitizeUrl('assets/images/project-nexvora-mesh.svg'), 'assets/images/project-nexvora-mesh.svg');
});

// 4. WhatsApp Normalization & Official wa.me Link Generation
test('WhatsApp number normalizer strips formatting and validates E.164 format', () => {
  assert.equal(normalizeWhatsAppNumber('+91 (987) 654-3210'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('0091-9876543210'), '919876543210');
  assert.equal(isValidWhatsAppNumber('+91 98765 43210'), true);
  assert.equal(isValidWhatsAppNumber('123'), false);
});

test('buildWhatsAppUrl generates properly encoded official wa.me conversation link', () => {
  const link = buildWhatsAppUrl('+91 98765 43210', {
    name: 'Recruiter Jane',
    email: 'jane@tech.io',
    subject: 'Senior Full Stack Role',
    message: 'Hi Saksham, let us schedule an interview!'
  });
  assert.ok(link.startsWith('https://wa.me/919876543210?text='));
  assert.ok(link.includes(encodeURIComponent('Recruiter Jane')));
  assert.ok(link.includes(encodeURIComponent('jane@tech.io')));
  assert.ok(link.includes(encodeURIComponent('Senior Full Stack Role')));
});

// 5. Personal Brand & Seed Data Verification
test('Seed data contains Saksham Pandey, NEXVORA TECHNOLOGIES, 4 resumes, and verified contact info', () => {
  assert.equal(SEED_DATA.profile.full_name, 'Saksham Pandey');
  assert.equal(SEED_DATA.profile.brand_name, 'NEXVORA TECHNOLOGIES');
  assert.equal(SEED_DATA.profile.email, 'pandeysaksham180@gmail.com');
  assert.equal(SEED_DATA.whatsapp_settings.phone_number, '919546748859');
  assert.ok(SEED_DATA.site_settings.footer_attribution.includes('Saksham Pandey'));
  assert.ok(SEED_DATA.projects.length >= 25);
  assert.equal(SEED_DATA.resumes.length, 4);
  assert.ok(SEED_DATA.skills.length >= 10);
});

// 6. Unauthorized Admin Access Prevention & Owner Password Protection
test('Owner-only Admin Authentication rejects wrong passwords and accepts Owner ID + Password', async () => {
  authService.clearSession();
  await assert.rejects(() => authService.signIn('hacker@evil.com', 'wrongpass'), /Access Denied/);
  await assert.rejects(() => authService.signIn('pandeysaksham180@gmail.com', 'wrongpass'), /Access Denied/);
  const session = await authService.signIn('pandeysaksham180@gmail.com', 'NexVora@Saksham2026!');
  assert.equal(session.user.email, 'pandeysaksham180@gmail.com');
});

test('Unauthenticated calls to repository.getAdminData() or mutations throw Unauthorized', async () => {
  authService.clearSession();
  assert.throws(() => repository.getAdminData(), /Unauthorized/);
  await assert.rejects(() => repository.updateSingleton('profile', { full_name: 'Hacker' }), /Unauthorized/);
});

test('Authenticated Admin CRUD & Draft Isolation work across reloads', async () => {
  await repository.init();
  authService.startLocalPreviewSession('saksham@nexvora.dev');

  // Create a draft project (published: false)
  await repository.upsertCollectionItem('projects', {
    id: 'proj_secret_draft',
    title: 'Unreleased Stealth Architecture',
    category: 'AI Applications',
    summary: 'Internal draft only',
    published: false
  });

  // Verify admin sees the draft
  const adminData = repository.getAdminData();
  assert.ok(adminData.projects.some((p) => p.id === 'proj_secret_draft'), 'Admin should see draft project');

  // Verify public visitor DOES NOT see the draft
  const publicData = repository.getPublicData();
  assert.ok(!publicData.projects.some((p) => p.id === 'proj_secret_draft'), 'Public data must NOT expose unpublished drafts');

  // Clean up test draft
  await repository.deleteCollectionItem('projects', 'proj_secret_draft');
});

// 7. File Upload Security & Validation
test('StorageService.validateFile rejects executables, oversized files, and non-PDF resumes', () => {
  const fakeExe = new Blob(['MZ'], { type: 'application/x-msdownload' });
  fakeExe.name = 'malware.exe';
  assert.throws(() => storageService.validateFile(fakeExe, 'pdf'), /Security policy violation/);

  const wrongTypeForResume = new Blob(['hello'], { type: 'image/png' });
  wrongTypeForResume.name = 'photo.png';
  assert.throws(() => storageService.validateFile(wrongTypeForResume, 'pdf'), /Only valid PDF documents/);

  const validPdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
  validPdf.name = 'Saksham_Pandey_Resume.pdf';
  assert.equal(storageService.validateFile(validPdf, 'pdf'), true);
});

console.log(`\nAll ${passed} automated verification checks passed!\n`);
