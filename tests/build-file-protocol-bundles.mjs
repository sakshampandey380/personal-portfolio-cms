/**
 * ==========================================================================
 * FILE-PROTOCOL SAFE BUNDLE GENERATOR (ZERO EXTERNAL DEPENDENCIES)
 * ==========================================================================
 * Browsers block `<script type="module">` imports when an HTML file is opened
 * directly via `file:///C:/...` due to CORS restrictions on null origins.
 *
 * This script packages the modular ES6 files in `js/` and `admin/js/` into
 * standard IIFE scripts (`js/runtime-bundle.js`, `admin/js/admin-bundle.js`,
 * and `admin/js/login-bundle.js`) so the portfolio and Admin CMS work 100%
 * seamlessly both via `file://` double-click AND via HTTP/HTTPS servers.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function stripImportsAndExports(source) {
  return source
    // Remove multi-line or single-line import statements
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    // Replace `export class` / `export function` / `export const` / `export async function`
    .replace(/^\s*export\s+(class|function|const|let|var|async\s+function)\s+/gm, '$1 ');
}

function buildPublicBundle() {
  const orderedFiles = [
    'js/utils.js',
    'js/data/seed-data.js',
    'js/services/api.js',
    'js/services/auth.js',
    'js/services/storage.js',
    'js/data/repository.js',
    'js/theme.js',
    'js/navigation.js',
    'js/scene-3d.js',
    'js/animations.js',
    'js/skills.js',
    'js/projects.js',
    'js/resumes.js',
    'js/contact.js',
    'js/app.js'
  ];

  const chunks = orderedFiles.map((relPath) => {
    const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    return `/* === MODULE: ${relPath} === */\n${stripImportsAndExports(raw)}`;
  });

  const output = `/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE RUNTIME BUNDLE
 * Works identically on file:// and http(s):// without CORS module errors.
 */
(function () {
  if (window.__NEXVORA_PUBLIC_RUNTIME_LOADED__) return;
  window.__NEXVORA_PUBLIC_RUNTIME_LOADED__ = true;

${chunks.join('\n\n')}
})();
`;

  fs.writeFileSync(path.join(ROOT, 'js/runtime-bundle.js'), output, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'script.js'), output, 'utf8');
  console.log('✓ Built js/runtime-bundle.js and script.js');
}

function buildUnifiedStyleCss() {
  const cssFiles = [
    'css/tokens.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/animations.css',
    'css/responsive.css'
  ];

  const combinedCss = cssFiles
    .map((relPath) => {
      const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      return `/* === STYLESHEET: ${relPath} === */\n${raw}`;
    })
    .join('\n\n');

  fs.writeFileSync(path.join(ROOT, 'style.css'), combinedCss, 'utf8');
  console.log('✓ Built unified style.css');
}

function buildAdminBundle() {
  const orderedFiles = [
    'js/utils.js',
    'js/data/seed-data.js',
    'js/services/api.js',
    'js/services/auth.js',
    'js/services/storage.js',
    'js/data/repository.js',
    'js/theme.js',
    'admin/js/dashboard.js',
    'admin/js/content-editor.js',
    'admin/js/resume-manager.js',
    'admin/js/settings.js',
    'admin/js/admin.js'
  ];

  const chunks = orderedFiles.map((relPath) => {
    const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    return `/* === MODULE: ${relPath} === */\n${stripImportsAndExports(raw)}`;
  });

  const output = `/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE ADMIN CMS BUNDLE
 */
(function () {
  if (window.__NEXVORA_ADMIN_RUNTIME_LOADED__) return;
  window.__NEXVORA_ADMIN_RUNTIME_LOADED__ = true;

${chunks.join('\n\n')}
})();
`;

  fs.writeFileSync(path.join(ROOT, 'admin/js/admin-bundle.js'), output, 'utf8');
  console.log('✓ Built admin/js/admin-bundle.js');
}

function buildLoginBundle() {
  const orderedFiles = [
    'js/utils.js',
    'js/services/api.js',
    'js/services/auth.js'
  ];

  const chunks = orderedFiles.map((relPath) => {
    const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    return `/* === MODULE: ${relPath} === */\n${stripImportsAndExports(raw)}`;
  });

  const loginInitCode = `
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
  `;

  const output = `/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE LOGIN BUNDLE
 */
(function () {
  if (window.__NEXVORA_LOGIN_RUNTIME_LOADED__) return;
  window.__NEXVORA_LOGIN_RUNTIME_LOADED__ = true;

${chunks.join('\n\n')}

${loginInitCode}
})();
`;

  fs.writeFileSync(path.join(ROOT, 'admin/js/login-bundle.js'), output, 'utf8');
  console.log('✓ Built admin/js/login-bundle.js');
}

buildUnifiedStyleCss();
buildPublicBundle();
buildAdminBundle();
buildLoginBundle();
