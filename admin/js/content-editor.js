/**
 * ==========================================================================
 * ADMIN CONTENT EDITOR — PROFILE, HERO, ABOUT & COLLECTION CRUD MANAGERS
 * ==========================================================================
 * Handles Modules 2, 3, 4, 5, 6, 7, 8, 9, 10, and 12 with full validation,
 * search filtering, reordering, draft/publish toggling, and modal editing.
 */

import { repository } from '../../js/data/repository.js';
import { escapeHtml, showToast } from '../../js/utils.js';

/* --------------------------------------------------------------------------
   MODULE 2: PROFILE & PERSONAL INFORMATION
   -------------------------------------------------------------------------- */
export function renderProfileModule(container, state, onDirtyChange) {
  const p = state.profile || {};
  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Profile &amp; Personal Brand Identity</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Update your name, professional headline, company/studio identity, location, and availability status.
          </p>
        </div>
      </div>
      <form id="adminProfileForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="profFullName">Full Name *</label>
            <input type="text" id="profFullName" class="form-input" value="${escapeHtml(p.full_name || '')}" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="profBrandName">Company / Studio Brand</label>
            <input type="text" id="profBrandName" class="form-input" value="${escapeHtml(p.brand_name || '')}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="profMonogram">Logo Monogram (2–3 chars)</label>
            <input type="text" id="profMonogram" class="form-input" maxlength="3" value="${escapeHtml(p.monogram || 'SP')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="profEmail">Public Contact Email</label>
            <input type="email" id="profEmail" class="form-input" value="${escapeHtml(p.email || '')}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="profHeadline">Professional Headline *</label>
          <input type="text" id="profHeadline" class="form-input" value="${escapeHtml(p.headline || '')}" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="profShortBio">Concise Summary / Tagline</label>
          <textarea id="profShortBio" rows="2" class="form-textarea">${escapeHtml(p.short_bio || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="profLocation">Primary Location</label>
            <input type="text" id="profLocation" class="form-input" value="${escapeHtml(p.location || 'India')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="profRelocation">Relocation &amp; Remote Scope</label>
            <input type="text" id="profRelocation" class="form-input" value="${escapeHtml(p.relocation_preference || '')}" />
          </div>
        </div>

        <div class="form-row" style="align-items:center;">
          <div class="form-group">
            <label class="form-label" for="profAvailText">Availability Badge Text</label>
            <input type="text" id="profAvailText" class="form-input" value="${escapeHtml(p.availability_text || '')}" />
          </div>
          <div class="form-group" style="padding-top:1.4rem;">
            <label class="switch-wrap">
              <input type="checkbox" id="profShowAvail" ${p.show_availability !== false ? 'checked' : ''} />
              <span>Display Availability Status Badge on Hero</span>
            </label>
          </div>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save &amp; Publish Profile</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById('adminProfileForm');
  form.addEventListener('input', () => onDirtyChange(true));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('profFullName').value.trim();
    const headline = document.getElementById('profHeadline').value.trim();
    if (!fullName || !headline) {
      showToast('Full Name and Headline are required.', 'error');
      return;
    }

    try {
      await repository.updateSingleton('profile', {
        full_name: fullName,
        brand_name: document.getElementById('profBrandName').value.trim(),
        monogram: document.getElementById('profMonogram').value.trim() || 'SP',
        email: document.getElementById('profEmail').value.trim(),
        headline,
        short_bio: document.getElementById('profShortBio').value.trim(),
        location: document.getElementById('profLocation').value.trim(),
        relocation_preference: document.getElementById('profRelocation').value.trim(),
        availability_text: document.getElementById('profAvailText').value.trim(),
        show_availability: document.getElementById('profShowAvail').checked
      });
      onDirtyChange(false);
      showToast('Profile saved and synchronized to public site!', 'success');
    } catch (err) {
      showToast(`Failed to save profile: ${err.message}`, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 3: HERO CONTENT & 3D TELEMETRY
   -------------------------------------------------------------------------- */
export function renderHeroModule(container, state, onDirtyChange) {
  const h = state.hero || {};
  const specs = Array.isArray(h.specialties) ? h.specialties.join('\n') : '';

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">Hero Content &amp; Interactive 3D Stage</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Customize the opening hero headlines, rotating specialty tags, CTA buttons, and 3D sculpture telemetry cards.
          </p>
        </div>
      </div>
      <form id="adminHeroForm" class="admin-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="heroEyebrowInput">Eyebrow Badge</label>
            <input type="text" id="heroEyebrowInput" class="form-input" value="${escapeHtml(h.eyebrow || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="heroSculptureMode">Default 3D Hero Geometry</label>
            <select id="heroSculptureMode" class="form-select">
              <option value="crystalline" ${h.sculpture_mode === 'crystalline' ? 'selected' : ''}>Crystalline Polyhedron</option>
              <option value="lattice" ${h.sculpture_mode === 'lattice' ? 'selected' : ''}>Distributed Hyper-Lattice</option>
              <option value="orbital" ${h.sculpture_mode === 'orbital' ? 'selected' : ''}>Orbital Wireframe</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="heroTitlePre">Hero Title Prefix</label>
            <input type="text" id="heroTitlePre" class="form-input" value="${escapeHtml(h.title_prefix || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="heroTitleHigh">Highlighted Orange Phrase</label>
            <input type="text" id="heroTitleHigh" class="form-input" value="${escapeHtml(h.title_highlight || '')}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="heroTitleSuf">Hero Title Suffix</label>
          <input type="text" id="heroTitleSuf" class="form-input" value="${escapeHtml(h.title_suffix || '')}" />
        </div>

        <div class="form-group">
          <label class="form-label" for="heroSubInput">Hero Introduction Paragraph</label>
          <textarea id="heroSubInput" rows="3" class="form-textarea">${escapeHtml(h.subtitle || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="heroSpecsInput">Rotating Specialties (One per line)</label>
          <textarea id="heroSpecsInput" rows="4" class="form-textarea">${escapeHtml(specs)}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="heroPrimaryLabel">Primary CTA Label</label>
            <input type="text" id="heroPrimaryLabel" class="form-input" value="${escapeHtml(h.primary_cta_label || 'Explore My Work')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="heroSecondaryLabel">Secondary CTA Label</label>
            <input type="text" id="heroSecondaryLabel" class="form-input" value="${escapeHtml(h.secondary_cta_label || 'View Resumes')}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="heroTelTopVal">3D Top Telemetry Value</label>
            <input type="text" id="heroTelTopVal" class="form-input" value="${escapeHtml(h.telemetry_top_value || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="heroTelBotVal">3D Bottom Telemetry Value</label>
            <input type="text" id="heroTelBotVal" class="form-input" value="${escapeHtml(h.telemetry_bottom_value || '')}" />
          </div>
        </div>

        <div style="padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save &amp; Publish Hero</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById('adminHeroForm');
  form.addEventListener('input', () => onDirtyChange(true));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const specialties = document
        .getElementById('heroSpecsInput')
        .value.split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await repository.updateSingleton('hero', {
        eyebrow: document.getElementById('heroEyebrowInput').value.trim(),
        sculpture_mode: document.getElementById('heroSculptureMode').value,
        title_prefix: document.getElementById('heroTitlePre').value.trim(),
        title_highlight: document.getElementById('heroTitleHigh').value.trim(),
        title_suffix: document.getElementById('heroTitleSuf').value.trim(),
        subtitle: document.getElementById('heroSubInput').value.trim(),
        specialties,
        primary_cta_label: document.getElementById('heroPrimaryLabel').value.trim(),
        secondary_cta_label: document.getElementById('heroSecondaryLabel').value.trim(),
        telemetry_top_value: document.getElementById('heroTelTopVal').value.trim(),
        telemetry_bottom_value: document.getElementById('heroTelBotVal').value.trim()
      });
      onDirtyChange(false);
      showToast('Hero content updated on public website!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   MODULE 4: ABOUT SECTION
   -------------------------------------------------------------------------- */
export function renderAboutModule(container, state, onDirtyChange) {
  const a = state.about || {};
  const pillars = Array.isArray(a.pillars) ? a.pillars : [];

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">About Section &amp; Engineering Philosophy</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
            Edit your professional introduction, technical interests, strengths, working style, and career focus.
          </p>
        </div>
      </div>
      <form id="adminAboutForm" class="admin-panel__body">
        <div class="form-group">
          <label class="form-label" for="abtIntro">Professional Introduction *</label>
          <textarea id="abtIntro" rows="3" class="form-textarea" required>${escapeHtml(a.introduction || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="abtInterests">Technical Interests &amp; Architecture Focus</label>
          <textarea id="abtInterests" rows="3" class="form-textarea">${escapeHtml(a.technical_interests || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="abtStrengths">Professional Strengths</label>
            <textarea id="abtStrengths" rows="3" class="form-textarea">${escapeHtml(a.professional_strengths || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="abtStyle">Working Style</label>
            <textarea id="abtStyle" rows="3" class="form-textarea">${escapeHtml(a.working_style || '')}</textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="abtFocus">Current Focus</label>
            <textarea id="abtFocus" rows="2" class="form-textarea">${escapeHtml(a.current_focus || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="abtGoals">Career Goals</label>
            <textarea id="abtGoals" rows="2" class="form-textarea">${escapeHtml(a.career_goals || '')}</textarea>
          </div>
        </div>

        <h3 style="font-size:1rem;margin:1rem 0 0.75rem;">Architectural Pillar Cards (4 Cards)</h3>
        <div class="form-row">
          ${[0, 1, 2, 3]
            .map((idx) => {
              const p = pillars[idx] || { code: `0${idx + 1}`, title: '', description: '' };
              return `
                <div style="padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                  <div class="form-group">
                    <label class="form-label">Pillar 0${idx + 1} Title</label>
                    <input type="text" class="form-input" data-pillar-title="${idx}" value="${escapeHtml(p.title)}" />
                  </div>
                  <div class="form-group" style="margin:0;">
                    <label class="form-label">Pillar 0${idx + 1} Description</label>
                    <textarea rows="2" class="form-textarea" data-pillar-desc="${idx}">${escapeHtml(p.description)}</textarea>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <div style="padding-top:1.25rem;margin-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button type="submit" class="btn btn--primary">Save &amp; Publish About Section</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById('adminAboutForm');
  form.addEventListener('input', () => onDirtyChange(true));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const updatedPillars = [0, 1, 2, 3].map((idx) => ({
        code: `0${idx + 1}`,
        title: container.querySelector(`[data-pillar-title="${idx}"]`).value.trim(),
        description: container.querySelector(`[data-pillar-desc="${idx}"]`).value.trim()
      })).filter((p) => p.title);

      await repository.updateSingleton('about', {
        introduction: document.getElementById('abtIntro').value.trim(),
        technical_interests: document.getElementById('abtInterests').value.trim(),
        professional_strengths: document.getElementById('abtStrengths').value.trim(),
        working_style: document.getElementById('abtStyle').value.trim(),
        current_focus: document.getElementById('abtFocus').value.trim(),
        career_goals: document.getElementById('abtGoals').value.trim(),
        pillars: updatedPillars
      });
      onDirtyChange(false);
      showToast('About section updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/* --------------------------------------------------------------------------
   GENERIC COLLECTION MANAGER FACTORY FOR:
   Skills (5), Experience (6), Education (7), Projects (8),
   Achievements (9), Certifications (10), Social Links (12)
   -------------------------------------------------------------------------- */
const COLLECTION_SCHEMAS = {
  skills: {
    title: 'Skills & Technology Constellation',
    subtitle: 'Manage technical skills across 8 engineering categories. No fake percentage bars.',
    primaryField: 'name',
    secondaryField: 'category',
    fields: [
      { key: 'name', label: 'Skill / Technology Name *', type: 'text', required: true },
      {
        key: 'category',
        label: 'Category *',
        type: 'select',
        options: [
          'Frontend Development',
          'Backend Development',
          'Programming Languages',
          'Databases',
          'APIs & Real-Time Communication',
          'AI & Automation',
          'DevOps & Deployment',
          'Development Tools'
        ]
      },
      { key: 'icon', label: 'Short Monogram / Icon (e.g., TS, PY, FA)', type: 'text' },
      { key: 'proficiency', label: 'Optional Proficiency Label (e.g., Core Stack, Production)', type: 'text' },
      { key: 'description', label: 'Capability Description', type: 'textarea' },
      { key: 'related_projects', label: 'Related Projects (Comma-separated)', type: 'array' }
    ]
  },

  experiences: {
    title: 'Professional Experience & Independent Projects',
    subtitle: 'Add, edit, reorder, or unpublish employment, freelance consulting, and studio roles.',
    primaryField: 'title',
    secondaryField: 'organization',
    fields: [
      { key: 'title', label: 'Role / Position Title *', type: 'text', required: true },
      { key: 'organization', label: 'Organization / Company *', type: 'text', required: true },
      {
        key: 'type',
        label: 'Engagement Type',
        type: 'select',
        options: ['Employment', 'Independent Development', 'Freelance Projects', 'Internship', 'Advisory']
      },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'start_date', label: 'Start Date (YYYY-MM)', type: 'text' },
      { key: 'end_date', label: 'End Date (Leave blank if ongoing)', type: 'text' },
      { key: 'description', label: 'Role Overview', type: 'textarea' },
      { key: 'highlights', label: 'Key Achievements / Bullet Points (One per line)', type: 'lines' },
      { key: 'technologies', label: 'Technologies Used (Comma-separated)', type: 'array' },
      { key: 'external_link', label: 'Optional External Reference URL', type: 'url' }
    ]
  },

  education: {
    title: 'Education & Academic Training',
    subtitle: 'Manage academic credentials, coursework, and specialized technical training.',
    primaryField: 'title',
    secondaryField: 'organization',
    fields: [
      { key: 'title', label: 'Degree / Program / Focus *', type: 'text', required: true },
      { key: 'organization', label: 'Institution / University *', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'start_date', label: 'Start Date (YYYY-MM)', type: 'text' },
      { key: 'end_date', label: 'End Date (Leave blank if ongoing)', type: 'text' },
      { key: 'description', label: 'Description & Academic Focus', type: 'textarea' },
      { key: 'highlights', label: 'Key Highlights (One per line)', type: 'lines' },
      { key: 'technologies', label: 'Relevant Coursework / Subjects (Comma-separated)', type: 'array' }
    ]
  },

  projects: {
    title: 'Projects & Architectural Case Studies',
    subtitle: 'Manage your 3D project showcase, case studies, tech stacks, screenshots, and live/repo links.',
    primaryField: 'title',
    secondaryField: 'category',
    hasFeatured: true,
    fields: [
      { key: 'title', label: 'Project Title *', type: 'text', required: true },
      { key: 'category', label: 'Category (e.g., Distributed Systems, AI Applications)', type: 'text', required: true },
      { key: 'summary', label: 'Short Card Summary *', type: 'textarea', required: true },
      { key: 'description', label: 'Full Architecture Description', type: 'textarea' },
      { key: 'case_study', label: 'Extended Case Study Narrative', type: 'textarea' },
      { key: 'cover_image', label: 'Cover Image Path or URL', type: 'text' },
      { key: 'screenshots', label: 'Screenshots URLs (Comma-separated)', type: 'array' },
      { key: 'tech_stack', label: 'Technology Stack (Comma-separated)', type: 'array' },
      { key: 'key_features', label: 'Key Features (One per line)', type: 'lines' },
      { key: 'my_contribution', label: 'My Contribution & Role', type: 'textarea' },
      { key: 'technical_challenges', label: 'Technical Challenges', type: 'textarea' },
      { key: 'solutions_tradeoffs', label: 'Solutions & Tradeoffs', type: 'textarea' },
      { key: 'measurable_outcomes', label: 'Optional Measurable Outcomes', type: 'text' },
      { key: 'github_url', label: 'GitHub Repository URL', type: 'url' },
      { key: 'live_url', label: 'Live Demo URL', type: 'text' },
      { key: 'featured', label: 'Highlight as Featured Project', type: 'checkbox' }
    ]
  },

  achievements: {
    title: 'Achievements, Hackathons & Milestones',
    subtitle: 'Manage verified accomplishments, competition results, and engineering milestones.',
    primaryField: 'title',
    secondaryField: 'issuer',
    fields: [
      { key: 'title', label: 'Achievement Title *', type: 'text', required: true },
      { key: 'category', label: 'Type (Award, Hackathon, Milestone, Publication)', type: 'text' },
      { key: 'issuer', label: 'Issuer / Organization', type: 'text' },
      { key: 'date', label: 'Date / Year', type: 'text' },
      { key: 'description', label: 'Description & Context', type: 'textarea' },
      { key: 'credential_url', label: 'Optional Verification Link', type: 'url' }
    ]
  },

  certifications: {
    title: 'Certifications & Technical Courses',
    subtitle: 'Manage verified certificates and credential links without fabricating claims.',
    primaryField: 'title',
    secondaryField: 'issuer',
    fields: [
      { key: 'title', label: 'Certification Title *', type: 'text', required: true },
      { key: 'issuer', label: 'Issuing Organization *', type: 'text', required: true },
      { key: 'date', label: 'Issue Date / Year', type: 'text' },
      { key: 'description', label: 'Skills & Verification Summary', type: 'textarea' },
      { key: 'credential_url', label: 'Credential Verification URL', type: 'url' }
    ]
  },

  social_links: {
    title: 'Professional Social & Network Links',
    subtitle: 'Configure GitHub, LinkedIn, X/Twitter, and other professional profiles.',
    primaryField: 'platform',
    secondaryField: 'url',
    fields: [
      { key: 'platform', label: 'Platform Name (e.g., GitHub, LinkedIn) *', type: 'text', required: true },
      { key: 'label', label: 'Accessible Label', type: 'text' },
      { key: 'icon', label: 'Short Badge Text (e.g., GH, IN, X)', type: 'text' },
      { key: 'url', label: 'Profile URL *', type: 'url', required: true }
    ]
  }
};

export function renderCollectionModule(container, collectionKey, state, refreshView, confirmDelete) {
  const schema = COLLECTION_SCHEMAS[collectionKey];
  if (!schema) return;

  const rawItems = Array.isArray(state[collectionKey]) ? [...state[collectionKey]] : [];
  const items = rawItems.sort(
    (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999)
  );

  container.innerHTML = `
    <section class="admin-panel">
      <div class="admin-panel__header">
        <div>
          <h2 style="font-size:1.25rem;">${escapeHtml(schema.title)}</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">${escapeHtml(schema.subtitle)}</p>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <input type="search"
                 id="colSearchInput"
                 class="form-input"
                 style="width:220px;padding:0.45rem 0.75rem;"
                 placeholder="Filter records..." />
          <button type="button" id="addNewColItemBtn" class="btn btn--primary btn--sm">
            + Create New Entry
          </button>
        </div>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width:60px;">Order</th>
              <th>${escapeHtml(schema.primaryField.toUpperCase())}</th>
              <th>${escapeHtml(schema.secondaryField.toUpperCase())}</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="colTableBody">
            <!-- Rows populated below -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- Dynamic Editor Form Drawer / Panel -->
    <section id="colEditorPanel" class="admin-panel" style="display:none;">
      <div class="admin-panel__header">
        <h3 id="colEditorHeading" style="font-size:1.1rem;">Edit Record</h3>
        <button type="button" id="closeColEditorBtn" class="btn btn--ghost btn--sm">Cancel ✕</button>
      </div>
      <form id="colEditorForm" class="admin-panel__body">
        <input type="hidden" id="editItemId" />
        <div id="colDynamicFields" style="display:flex;flex-direction:column;gap:0.75rem;"></div>
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
          <label class="switch-wrap">
            <input type="checkbox" id="editItemPublished" checked />
            <span>Published on Public Website (Uncheck to save as private Draft)</span>
          </label>
          <div style="display:flex;gap:0.75rem;">
            <button type="button" id="cancelColFormBtn" class="btn btn--secondary btn--sm">Cancel</button>
            <button type="submit" class="btn btn--primary btn--sm">Save &amp; Sync Record</button>
          </div>
        </div>
      </form>
    </section>
  `;

  const tbody = document.getElementById('colTableBody');
  const searchInput = document.getElementById('colSearchInput');
  const editorPanel = document.getElementById('colEditorPanel');
  const dynamicFields = document.getElementById('colDynamicFields');

  const renderRows = (query = '') => {
    const q = query.toLowerCase().trim();
    const filtered = items.filter((item) => {
      if (!q) return true;
      return (
        String(item[schema.primaryField] || '').toLowerCase().includes(q) ||
        String(item[schema.secondaryField] || '').toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">No records match your filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map(
        (item, idx) => `
        <tr>
          <td>
            <div style="display:flex;gap:3px;">
              <button type="button" class="btn btn--secondary btn--sm" style="padding:2px 6px;" title="Move Up" data-move-up="${escapeHtml(item.id)}" ${idx === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" class="btn btn--secondary btn--sm" style="padding:2px 6px;" title="Move Down" data-move-down="${escapeHtml(item.id)}" ${idx === filtered.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
          </td>
          <td>
            <strong style="color:var(--text-primary);">${escapeHtml(item[schema.primaryField] || 'Untitled')}</strong>
            ${item.featured ? `<span class="badge badge--accent" style="margin-left:6px;">★ Featured</span>` : ''}
          </td>
          <td style="color:var(--text-secondary);">${escapeHtml(item[schema.secondaryField] || '—')}</td>
          <td>
            <button type="button"
                    class="badge ${item.published !== false ? 'badge--available' : ''}"
                    style="cursor:pointer;"
                    title="Click to toggle Published / Draft status"
                    data-toggle-pub="${escapeHtml(item.id)}">
              ${item.published !== false ? '● Published' : '○ Draft (Hidden)'}
            </button>
          </td>
          <td style="text-align:right;">
            <div class="table-actions" style="justify-content:flex-end;">
              <button type="button" class="btn btn--secondary btn--sm" data-edit-item="${escapeHtml(item.id)}">Edit</button>
              <button type="button" class="btn btn--ghost btn--sm" style="color:var(--status-danger);" data-del-item="${escapeHtml(item.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');

    tbody.querySelectorAll('[data-move-up]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await repository.reorderCollectionItem(collectionKey, btn.getAttribute('data-move-up'), 'up');
        refreshView();
      });
    });

    tbody.querySelectorAll('[data-move-down]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await repository.reorderCollectionItem(collectionKey, btn.getAttribute('data-move-down'), 'down');
        refreshView();
      });
    });

    tbody.querySelectorAll('[data-toggle-pub]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const updated = await repository.togglePublishItem(collectionKey, btn.getAttribute('data-toggle-pub'));
        showToast(`Status changed to ${updated.published ? 'Published' : 'Draft'}`, 'info');
        refreshView();
      });
    });

    tbody.querySelectorAll('[data-edit-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = items.find((x) => x.id === btn.getAttribute('data-edit-item'));
        if (target) openEditor(target);
      });
    });

    tbody.querySelectorAll('[data-del-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = items.find((x) => x.id === btn.getAttribute('data-del-item'));
        if (!target) return;
        confirmDelete(`Delete "${target[schema.primaryField]}"? This action will remove it from your portfolio.`, async () => {
          await repository.deleteCollectionItem(collectionKey, target.id);
          showToast('Record deleted', 'info');
          refreshView();
        });
      });
    });
  };

  const openEditor = (item = {}) => {
    document.getElementById('colEditorHeading').textContent = item.id
      ? `Edit: ${item[schema.primaryField] || ''}`
      : `Create New Entry in ${schema.title}`;
    document.getElementById('editItemId').value = item.id || '';
    document.getElementById('editItemPublished').checked = item.published !== false;

    dynamicFields.innerHTML = schema.fields
      .map((f) => {
        const rawVal = item[f.key];
        if (f.type === 'checkbox') {
          return `
            <label class="switch-wrap" style="margin-top:0.4rem;">
              <input type="checkbox" data-field-key="${f.key}" ${rawVal ? 'checked' : ''} />
              <span>${escapeHtml(f.label)}</span>
            </label>
          `;
        }
        if (f.type === 'select') {
          return `
            <div class="form-group" style="margin:0;">
              <label class="form-label">${escapeHtml(f.label)}</label>
              <select class="form-select" data-field-key="${f.key}">
                ${f.options
                  .map(
                    (opt) =>
                      `<option value="${escapeHtml(opt)}" ${rawVal === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`
                  )
                  .join('')}
              </select>
            </div>
          `;
        }
        if (f.type === 'textarea' || f.type === 'lines') {
          const textVal =
            f.type === 'lines' && Array.isArray(rawVal)
              ? rawVal.join('\n')
              : rawVal || '';
          return `
            <div class="form-group" style="margin:0;">
              <label class="form-label">${escapeHtml(f.label)}</label>
              <textarea rows="3" class="form-textarea" data-field-key="${f.key}" ${f.required ? 'required' : ''}>${escapeHtml(textVal)}</textarea>
            </div>
          `;
        }
        const strVal =
          f.type === 'array' && Array.isArray(rawVal)
            ? rawVal.join(', ')
            : rawVal || '';
        return `
          <div class="form-group" style="margin:0;">
            <label class="form-label">${escapeHtml(f.label)}</label>
            <input type="${f.type === 'url' ? 'url' : 'text'}"
                   class="form-input"
                   data-field-key="${f.key}"
                   value="${escapeHtml(strVal)}"
                   ${f.required ? 'required' : ''} />
          </div>
        `;
      })
      .join('');

    editorPanel.style.display = 'block';
    editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.getElementById('addNewColItemBtn').addEventListener('click', () => openEditor({}));
  document.getElementById('closeColEditorBtn').addEventListener('click', () => {
    editorPanel.style.display = 'none';
  });
  document.getElementById('cancelColFormBtn').addEventListener('click', () => {
    editorPanel.style.display = 'none';
  });

  searchInput.addEventListener('input', (e) => renderRows(e.target.value));

  document.getElementById('colEditorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editItemId').value.trim();
    const existing = items.find((x) => x.id === id) || {};
    const payload = {
      ...existing,
      published: document.getElementById('editItemPublished').checked
    };
    if (id) payload.id = id;

    for (const f of schema.fields) {
      const el = dynamicFields.querySelector(`[data-field-key="${f.key}"]`);
      if (!el) continue;
      if (f.type === 'checkbox') {
        payload[f.key] = el.checked;
      } else if (f.type === 'array') {
        payload[f.key] = el.value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === 'lines') {
        payload[f.key] = el.value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        payload[f.key] = el.value.trim();
      }

      if (f.required && !payload[f.key]) {
        showToast(`Please complete required field: ${f.label}`, 'error');
        return;
      }
    }

    try {
      await repository.upsertCollectionItem(collectionKey, payload);
      showToast('Record saved and synchronized!', 'success');
      refreshView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  renderRows();
}
