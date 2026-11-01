/**
 * ==========================================================================
 * ADMIN MODULE 11 (MULTIPLE RESUMES MANAGER) & MODULE 18 (MEDIA LIBRARY)
 * ==========================================================================
 * Supports uploading new PDF resumes, replacing an existing PDF while
 * preserving metadata, toggling featured/published state, previewing PDFs,
 * and managing media assets.
 */

import { repository } from '../../js/data/repository.js';
import { storageService } from '../../js/services/storage.js';
import { escapeHtml, formatDate, showToast, uid } from '../../js/utils.js';

export function renderResumesManager(container, state, refreshView, confirmDelete) {
  const resumes = [...(state.resumes || [])].sort(
    (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999)
  );

  const suggestedCategories = [
    'Full Stack Engineer',
    'Frontend Developer',
    'Backend / Python Developer',
    'AI and Automation',
    'International Opportunities',
    'Internship / Junior Roles',
    'Freelance / Client Profile'
  ];

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Multiple Resumes &amp; CV Version Manager</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Maintain multiple role-targeted PDF resumes simultaneously. Only published resumes appear on the public website.
          </p>
        </div>
        <button type="button" id="openNewResumeFormBtn" class="btn btn--primary btn--sm">
          + Upload / Create Resume Record
        </button>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Resume Title &amp; Target Role</th>
              <th>Category &amp; Version</th>
              <th>File &amp; Downloads</th>
              <th>Visibility</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="adminResumesTableBody">
            ${
              resumes.length === 0
                ? `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No resume records created yet.</td></tr>`
                : resumes
                    .map(
                      (r, idx) => `
                  <tr>
                    <td>
                      <div style="display:flex;gap:3px;">
                        <button type="button" class="btn btn--secondary btn--sm" style="padding:2px 6px;" data-res-up="${escapeHtml(r.id)}" ${idx === 0 ? 'disabled' : ''}>↑</button>
                        <button type="button" class="btn btn--secondary btn--sm" style="padding:2px 6px;" data-res-down="${escapeHtml(r.id)}" ${idx === resumes.length - 1 ? 'disabled' : ''}>↓</button>
                      </div>
                    </td>
                    <td>
                      <strong style="display:block;color:var(--text-primary);">
                        ${escapeHtml(r.title)}
                        ${r.featured ? `<span class="badge badge--accent" style="margin-left:6px;">★ Featured</span>` : ''}
                      </strong>
                      <span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHtml(r.target_role || '')}</span>
                    </td>
                    <td>
                      <span class="badge">${escapeHtml(r.category || 'General')}</span>
                      <span class="mono" style="font-size:0.72rem;color:var(--text-muted);margin-left:6px;">${escapeHtml(r.version || 'v1.0')}</span>
                    </td>
                    <td>
                      <span class="mono" style="font-size:0.74rem;display:block;">${escapeHtml(r.file_name || 'resume.pdf')}</span>
                      <span style="font-size:0.72rem;color:var(--text-muted);">
                        ${escapeHtml(r.file_size || 'PDF')} · ↓ ${Number(r.download_count) || 0} downloads · Updated ${escapeHtml(formatDate(r.updated_at))}
                      </span>
                    </td>
                    <td>
                      <button type="button"
                              class="badge ${r.published !== false ? 'badge--available' : ''}"
                              style="cursor:pointer;"
                              data-res-toggle-pub="${escapeHtml(r.id)}">
                        ${r.published !== false ? '● Published' : '○ Draft (Private)'}
                      </button>
                    </td>
                    <td style="text-align:right;">
                      <div class="table-actions" style="justify-content:flex-end;flex-wrap:wrap;">
                        <button type="button" class="btn btn--secondary btn--sm" data-res-preview="${escapeHtml(r.id)}">Preview</button>
                        <label class="btn btn--secondary btn--sm" style="cursor:pointer;" title="Replace PDF file without losing metadata">
                          Replace PDF
                          <input type="file" accept="application/pdf,.pdf" style="display:none;" data-res-replace-pdf="${escapeHtml(r.id)}" />
                        </label>
                        <button type="button" class="btn btn--secondary btn--sm" data-res-edit="${escapeHtml(r.id)}">Edit Meta</button>
                        <button type="button" class="btn btn--ghost btn--sm" style="color:var(--status-danger);" data-res-del="${escapeHtml(r.id)}">Delete</button>
                      </div>
                    </td>
                  </tr>
                `
                    )
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- Create / Edit Resume Metadata & Upload Form -->
    <section id="resumeFormPanel" class="admin-panel" style="display:none;">
      <div class="admin-panel__header">
        <h3 id="resumeFormHeading" style="font-size:1.1rem;">Create / Edit Resume Version</h3>
        <button type="button" id="closeResumeFormBtn" class="btn btn--ghost btn--sm">Cancel ✕</button>
      </div>
      <form id="adminResumeForm" class="admin-panel__body">
        <input type="hidden" id="resIdInput" />
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="resTitleInput">Resume Title *</label>
            <input type="text" id="resTitleInput" class="form-input" placeholder="e.g., Saksham Pandey — Full Stack Engineer Resume" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="resCategoryInput">Resume Category *</label>
            <input type="text" id="resCategoryInput" list="resumeCategorySuggestions" class="form-input" placeholder="e.g., Full Stack Engineer" required />
            <datalist id="resumeCategorySuggestions">
              ${suggestedCategories.map((c) => `<option value="${escapeHtml(c)}"></option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="resTargetRoleInput">Target Role Headline *</label>
            <input type="text" id="resTargetRoleInput" class="form-input" placeholder="e.g., Full Stack Engineer (React · TypeScript · FastAPI)" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="resVersionInput">Version Identifier</label>
            <input type="text" id="resVersionInput" class="form-input" placeholder="v2026.2" value="v2026.1" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="resDescInput">Short Description</label>
          <textarea id="resDescInput" rows="2" class="form-textarea" placeholder="Describe the focus of this resume version..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="resPdfFileInput">Upload PDF Document (.pdf only, max 10 MB)</label>
          <div class="upload-zone" id="resUploadZone">
            <input type="file" id="resPdfFileInput" accept="application/pdf,.pdf" style="max-width:100%;" />
            <p id="resCurrentFileNote" style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem;">
              Select a valid .pdf file. If editing an existing record without choosing a new file, the existing PDF is preserved.
            </p>
            <div class="upload-progress" id="resUploadProgressWrap" style="display:none;">
              <div class="upload-progress__bar" id="resUploadProgressBar"></div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:0.75rem;">
          <label class="switch-wrap">
            <input type="checkbox" id="resFeaturedInput" />
            <span>Set as Featured Resume (Highlighted on Hero &amp; Resumes Hub)</span>
          </label>
          <label class="switch-wrap">
            <input type="checkbox" id="resPublishedInput" checked />
            <span>Published on Public Website (Uncheck to keep as Private Draft)</span>
          </label>
        </div>

        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;gap:0.75rem;">
          <button type="button" id="cancelResumeFormBtn" class="btn btn--secondary btn--sm">Cancel</button>
          <button type="submit" id="saveResumeSubmitBtn" class="btn btn--primary btn--sm">Save Resume Record</button>
        </div>
      </form>
    </section>

    <!-- In-Admin PDF Preview Drawer -->
    <section id="adminResumePreviewPanel" class="admin-panel" style="display:none;">
      <div class="admin-panel__header">
        <h3 id="adminResumePreviewTitle" style="font-size:1.05rem;">PDF Document Preview</h3>
        <button type="button" id="closeAdminResumePreviewBtn" class="btn btn--ghost btn--sm">Close Preview ✕</button>
      </div>
      <div id="adminResumePreviewBody" class="admin-panel__body"></div>
    </section>
  `;

  const formPanel = document.getElementById('resumeFormPanel');
  const openEditor = (record = {}) => {
    document.getElementById('resumeFormHeading').textContent = record.id
      ? `Edit Resume Metadata: ${record.title}`
      : 'Upload & Create New Resume Version';
    document.getElementById('resIdInput').value = record.id || '';
    document.getElementById('resTitleInput').value = record.title || '';
    document.getElementById('resCategoryInput').value = record.category || 'Full Stack Engineer';
    document.getElementById('resTargetRoleInput').value = record.target_role || '';
    document.getElementById('resVersionInput').value = record.version || 'v2026.1';
    document.getElementById('resDescInput').value = record.description || '';
    document.getElementById('resFeaturedInput').checked = Boolean(record.featured);
    document.getElementById('resPublishedInput').checked = record.published !== false;
    document.getElementById('resPdfFileInput').value = '';
    document.getElementById('resCurrentFileNote').textContent = record.file_name
      ? `Current attached PDF: ${record.file_name} (${record.file_size || 'PDF'}). Choose a file above only if you want to replace it.`
      : 'Select a PDF file (.pdf, max 10 MB), or leave empty to use the starter sample PDF template.';

    formPanel.style.display = 'block';
    formPanel.scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('openNewResumeFormBtn').addEventListener('click', () => openEditor({}));
  document.getElementById('closeResumeFormBtn').addEventListener('click', () => {
    formPanel.style.display = 'none';
  });
  document.getElementById('cancelResumeFormBtn').addEventListener('click', () => {
    formPanel.style.display = 'none';
  });

  // Reorder buttons
  container.querySelectorAll('[data-res-up]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await repository.reorderCollectionItem('resumes', btn.getAttribute('data-res-up'), 'up');
      refreshView();
    });
  });

  container.querySelectorAll('[data-res-down]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await repository.reorderCollectionItem('resumes', btn.getAttribute('data-res-down'), 'down');
      refreshView();
    });
  });

  // Publish / Unpublish toggle
  container.querySelectorAll('[data-res-toggle-pub]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const updated = await repository.togglePublishItem('resumes', btn.getAttribute('data-res-toggle-pub'));
      showToast(`Resume is now ${updated.published ? 'Published (Public)' : 'Draft (Private)'}`, 'info');
      refreshView();
    });
  });

  // Edit metadata
  container.querySelectorAll('[data-res-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = resumes.find((r) => r.id === btn.getAttribute('data-res-edit'));
      if (target) openEditor(target);
    });
  });

  // Replace PDF directly without losing metadata
  container.querySelectorAll('[data-res-replace-pdf]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const resId = input.getAttribute('data-res-replace-pdf');
      const target = resumes.find((r) => r.id === resId);
      if (!target) return;

      try {
        const uploaded = await storageService.uploadFile(file, {
          category: 'pdf',
          existingStorageId: target.storage_id || null
        });

        await repository.upsertCollectionItem('resumes', {
          ...target,
          file_url: uploaded.file_url,
          file_name: uploaded.file_name,
          file_size: uploaded.file_size,
          storage_id: uploaded.storage_id,
          updated_at: new Date().toISOString().split('T')[0]
        });

        showToast(`Replaced PDF for "${target.title}" while preserving all metadata!`, 'success');
        refreshView();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        input.value = '';
      }
    });
  });

  // Preview PDF in Admin
  container.querySelectorAll('[data-res-preview]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = resumes.find((r) => r.id === btn.getAttribute('data-res-preview'));
      if (!target) return;
      const panel = document.getElementById('adminResumePreviewPanel');
      const body = document.getElementById('adminResumePreviewBody');
      const title = document.getElementById('adminResumePreviewTitle');
      const resolvedUrl = await storageService.resolveFileUrl(target.file_url);
      // Adjust relative path from /admin/ if pointing to assets/
      const previewSrc = resolvedUrl.startsWith('assets/') ? `../${resolvedUrl}` : resolvedUrl;

      title.textContent = `Preview: ${target.title} (${target.file_name})`;
      body.innerHTML = `
        <iframe src="${escapeHtml(previewSrc)}"
                title="PDF Preview"
                style="width:100%;height:520px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);background:#FFFFFF;">
        </iframe>
      `;
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.getElementById('closeAdminResumePreviewBtn')?.addEventListener('click', () => {
    document.getElementById('adminResumePreviewPanel').style.display = 'none';
  });

  // Delete Resume with confirmation
  container.querySelectorAll('[data-res-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = resumes.find((r) => r.id === btn.getAttribute('data-res-del'));
      if (!target) return;
      confirmDelete(`Permanently delete resume "${target.title}" (${target.file_name})?`, async () => {
        await storageService.deleteFile(target.file_url, 'pdf');
        await repository.deleteCollectionItem('resumes', target.id);
        showToast('Resume deleted', 'info');
        refreshView();
      });
    });
  });

  // Submit Create/Edit Form
  document.getElementById('adminResumeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('resIdInput').value.trim();
    const existing = resumes.find((r) => r.id === id) || {};
    const fileInput = document.getElementById('resPdfFileInput');
    const selectedFile = fileInput.files?.[0];
    const submitBtn = document.getElementById('saveResumeSubmitBtn');
    const progWrap = document.getElementById('resUploadProgressWrap');
    const progBar = document.getElementById('resUploadProgressBar');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Validating & Saving...';

      let fileMeta = {
        file_url: existing.file_url || 'assets/resumes/Saksham_Pandey_Full_Stack_Resume_Sample.pdf',
        file_name: existing.file_name || 'Saksham_Pandey_Resume.pdf',
        file_size: existing.file_size || '14 KB',
        storage_id: existing.storage_id || null
      };

      if (selectedFile) {
        progWrap.style.display = 'block';
        fileMeta = await storageService.uploadFile(selectedFile, {
          category: 'pdf',
          existingStorageId: existing.storage_id || null,
          onProgress: (pct) => {
            progBar.style.width = `${pct}%`;
          }
        });
      }

      const isFeatured = document.getElementById('resFeaturedInput').checked;
      // If marked featured, unfeature others first
      if (isFeatured) {
        const currentAdmin = repository.getAdminData();
        (currentAdmin.resumes || []).forEach((r) => {
          r.featured = false;
        });
        await repository.persistFullState(currentAdmin, 'Updated featured resume flag');
      }

      await repository.upsertCollectionItem('resumes', {
        ...existing,
        id: id || undefined,
        title: document.getElementById('resTitleInput').value.trim(),
        category: document.getElementById('resCategoryInput').value.trim(),
        target_role: document.getElementById('resTargetRoleInput').value.trim(),
        version: document.getElementById('resVersionInput').value.trim() || 'v1.0',
        description: document.getElementById('resDescInput').value.trim(),
        featured: isFeatured,
        published: document.getElementById('resPublishedInput').checked,
        download_count: existing.download_count || 0,
        ...fileMeta
      });

      showToast('Resume record saved and synchronized!', 'success');
      refreshView();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Resume Record';
      progWrap.style.display = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 18: MEDIA LIBRARY MANAGER
   -------------------------------------------------------------------------- */
export function renderMediaLibraryModule(container, state, refreshView, confirmDelete) {
  const mediaList = Array.isArray(state.media_library) ? state.media_library : [];

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Media &amp; Asset Library</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Upload project cover visuals, diagrams, or certificate PDFs. Strict MIME and size validation enforced.
          </p>
        </div>
        <label class="btn btn--primary btn--sm" style="cursor:pointer;">
          + Upload Media Asset
          <input type="file" id="mediaLibraryUploadInput" accept="image/*,application/pdf" style="display:none;" />
        </label>
      </div>

      <div class="admin-panel__body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
          ${mediaList
            .map((m) => {
              const displayUrl = m.url.startsWith('assets/') ? `../${m.url}` : m.url;
              return `
                <div style="border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:0.85rem;background:var(--bg-secondary);display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
                  <div style="height:120px;background:var(--bg-primary);border-radius:var(--radius-xs);display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    ${
                      (m.mime_type || '').startsWith('image/')
                        ? `<img src="${escapeHtml(displayUrl)}" alt="${escapeHtml(m.name)}" style="max-height:100%;object-fit:contain;" />`
                        : `<span class="mono" style="font-size:0.85rem;color:var(--accent-primary);">PDF // ASSET</span>`
                    }
                  </div>
                  <div>
                    <strong style="font-size:0.85rem;display:block;">${escapeHtml(m.name)}</strong>
                    <span class="mono" style="font-size:0.7rem;color:var(--text-muted);">${escapeHtml(m.size_label || '')} · ${escapeHtml(m.url)}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;gap:0.5rem;">
                    <button type="button" class="btn btn--secondary btn--sm" data-copy-media-url="${escapeHtml(m.url)}">Copy Path</button>
                    <button type="button" class="btn btn--ghost btn--sm" style="color:var(--status-danger);" data-del-media="${escapeHtml(m.id)}">Delete</button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    </section>
  `;

  const uploadInput = document.getElementById('mediaLibraryUploadInput');
  uploadInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const category = file.type === 'application/pdf' ? 'pdf' : 'image';
      const uploaded = await storageService.uploadFile(file, { category });
      const resolvedUrl = await storageService.resolveFileUrl(uploaded.file_url);

      await repository.upsertCollectionItem('media_library', {
        id: uid('med'),
        name: file.name,
        url: resolvedUrl,
        storage_url: uploaded.file_url,
        mime_type: file.type,
        size_label: uploaded.file_size,
        created_at: new Date().toISOString().split('T')[0]
      });

      showToast('Asset uploaded to Media Library!', 'success');
      refreshView();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      uploadInput.value = '';
    }
  });

  container.querySelectorAll('[data-copy-media-url]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-copy-media-url');
      navigator.clipboard?.writeText(url);
      showToast(`Copied asset URL: ${url}`, 'info');
    });
  });

  container.querySelectorAll('[data-del-media]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-media');
      confirmDelete('Remove this asset from the Media Library?', async () => {
        await repository.deleteCollectionItem('media_library', id);
        showToast('Asset removed', 'info');
        refreshView();
      });
    });
  });
}
