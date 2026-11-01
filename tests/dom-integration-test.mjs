/**
 * ==========================================================================
 * END-TO-END DOM ID & MULTI-PAGE WORKFLOW INTEGRATION VERIFICATION
 * ==========================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const aboutHtml = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
const projectsHtml = fs.readFileSync(path.join(ROOT, 'projects.html'), 'utf8');
const contactHtml = fs.readFileSync(path.join(ROOT, 'contact.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin/index.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(ROOT, 'admin/login.html'), 'utf8');

function assertIdsExist(html, ids, fileLabel) {
  for (const id of ids) {
    const pattern = new RegExp(`id=["']${id}["']`);
    assert.ok(pattern.test(html), `Missing #${id} in ${fileLabel}`);
  }
}

console.log('\n=== MULTI-PAGE DOM CONTRACT & MODULE INTEGRATION CHECK ===\n');

// 1. Verify global layout & transition IDs across all 4 public pages
const sharedPageIds = [
  'ambient3dBgCanvas',
  'teleportTransitionOverlay',
  'customCursor',
  'syncStatusBanner',
  'siteHeader',
  'navBrandName',
  'navBrandSub',
  'navMenuList',
  'themeToggleBtn',
  'headerContactCta',
  'mobileMenuToggle',
  'mainContent',
  'footerBrandName',
  'footerCompanySub',
  'footerTagline',
  'footerNavLinks',
  'footerSocialLinks',
  'footerYear',
  'footerCopyrightHolder',
  'footerAttribution',
  'footerPrivacyNotice',
  'backToTopBtn',
  'floatingWhatsAppBtn',
  'floatingWhatsAppLabel'
];

assertIdsExist(indexHtml, sharedPageIds, 'index.html');
assertIdsExist(aboutHtml, sharedPageIds, 'about.html');
assertIdsExist(projectsHtml, sharedPageIds, 'projects.html');
assertIdsExist(contactHtml, sharedPageIds, 'contact.html');
console.log(`  ✓ Verified all ${sharedPageIds.length} global header, 3D background, teleport transition, and footer hooks across index.html, about.html, projects.html, and contact.html`);

// 2. Verify Home page specific hooks (index.html)
const homeIds = [
  'introOverlay',
  'skipIntroBtn',
  'home',
  'heroProfileImage',
  'heroAvailabilityBadge',
  'heroAvailabilityText',
  'heroEyebrow',
  'heroTitlePrefix',
  'heroTitleHighlight',
  'heroTitleSuffix',
  'heroHeadlineText',
  'heroDynamicSpecialty',
  'heroSubtitleText',
  'heroPrimaryCta',
  'heroSecondaryCta',
  'heroFeaturedResumeBtn',
  'heroMetaLocation',
  'heroMetaBrand',
  'heroMetaRelocation',
  'spatialTopLabel',
  'spatialTopValue',
  'spatialBottomLabel',
  'spatialBottomValue',
  'hero3dCanvas',
  'heroLiveCodeWorkbench',
  'agencyServicesGrid',
  'skillsCategoryFilters',
  'skillConstellationCanvas',
  'skillConstellationInspector',
  'skillsGridContainer',
  'homeFeaturedProjectsGrid'
];
assertIdsExist(indexHtml, homeIds, 'index.html');
console.log(`  ✓ Verified all ${homeIds.length} Hero, 3D Sculpture, Live Code Explainer, and Skill Orbit hooks in index.html`);

// 3. Verify About page specific hooks (about.html)
const aboutIds = [
  'about',
  'aboutNarrativeContent',
  'aboutPillarsContainer',
  'aboutProfileImage',
  'agencyServicesGrid',
  'skillsCategoryFilters',
  'skillConstellationCanvas',
  'skillConstellationInspector',
  'skillsGridContainer',
  'experience',
  'timelineFilterTabs',
  'timelineListContainer',
  'achievements',
  'achievementsFilterTabs',
  'achievementsGridContainer'
];
assertIdsExist(aboutHtml, aboutIds, 'about.html');
console.log(`  ✓ Verified all ${aboutIds.length} About, Agency Services, Timeline, and Achievements hooks in about.html`);

// 4. Verify Projects & Resumes page specific hooks (projects.html)
const projectsIds = [
  'projects',
  'projectSearchInput',
  'projectCategoryFilters',
  'projectsGridContainer',
  'resumes',
  'resumeCategoryFilters',
  'resumesGridContainer',
  'projectCaseStudyModal',
  'modalProjectCounter',
  'modalProjectTitle',
  'closeProjectModalBtn',
  'modalProjectBody',
  'prevProjectModalBtn',
  'nextProjectModalBtn',
  'resumePreviewModal',
  'modalResumeTitle',
  'modalResumeDownloadBtn',
  'closeResumeModalBtn',
  'modalResumeFrameContainer'
];
assertIdsExist(projectsHtml, projectsIds, 'projects.html');
console.log(`  ✓ Verified all ${projectsIds.length} Projects, Case Study Modal, and Resumes CV Hub hooks in projects.html`);

// 5. Verify Contact page specific hooks (contact.html)
const contactIds = [
  'contact',
  'contactHeading',
  'contactSubheading',
  'contactResponseNote',
  'contactDirectEmail',
  'contactDirectWhatsAppBtn',
  'whatsappConfigNote',
  'contactSocialList',
  'portfolioContactForm',
  'contactName',
  'errContactName',
  'contactEmail',
  'errContactEmail',
  'contactSubject',
  'contactBudget',
  'contactDeadline',
  'contactMessage',
  'errContactMessage',
  'contactConsentText',
  'contactFormStatus',
  'submitContactFormBtn',
  'sendViaWhatsAppBtn'
];
assertIdsExist(contactHtml, contactIds, 'contact.html');
console.log(`  ✓ Verified all ${contactIds.length} Contact & WhatsApp integration hooks in contact.html`);

// 6. Verify all Admin index.html IDs
const adminIds = [
  'adminSidebar',
  'adminActiveUserEmail',
  'adminLogoutBtn',
  'adminMobileSidebarToggle',
  'adminCurrentModuleTitle',
  'unsavedChangesIndicator',
  'adminModeStatusBadge',
  'themeToggleBtn',
  'adminModuleWorkspace',
  'adminConfirmModal',
  'adminConfirmTitle',
  'adminConfirmMessage',
  'adminConfirmCancelBtn',
  'adminConfirmProceedBtn'
];

assertIdsExist(adminHtml, adminIds, 'admin/index.html');
console.log(`  ✓ Verified all ${adminIds.length} Admin CMS shell hooks in admin/index.html`);

// 7. Verify all 20 Admin Sidebar Module buttons exist in admin/index.html
const requiredModules = [
  'overview',
  'profile',
  'hero',
  'about',
  'skills',
  'experience',
  'education',
  'projects',
  'achievements',
  'certifications',
  'resumes',
  'social',
  'contact',
  'whatsapp',
  'theme',
  'navigation',
  'seo',
  'media',
  'site',
  'security'
];

for (const mod of requiredModules) {
  assert.ok(
    adminHtml.includes(`data-admin-module="${mod}"`),
    `Missing sidebar button for admin module: ${mod}`
  );
}
console.log(`  ✓ Verified all ${requiredModules.length} Admin CMS modules in sidebar navigation`);

// 8. Verify Admin login.html IDs & Absence of Public Admin Links
const loginIds = [
  'authModeBadge',
  'authSubtitle',
  'authAlertBox',
  'supabaseLoginForm',
  'adminEmail',
  'adminPassword',
  'supabaseLoginBtn',
  'cfgSupabaseUrl',
  'cfgSupabaseKey',
  'saveBackendConfigBtn',
  'clearBackendConfigBtn'
];

assertIdsExist(loginHtml, loginIds, 'admin/login.html');
console.log(`  ✓ Verified all ${loginIds.length} Authentication hooks in admin/login.html`);

// 9. Verify Public Pages Have ZERO Links to Admin Section
for (const [name, content] of [
  ['index.html', indexHtml],
  ['about.html', aboutHtml],
  ['projects.html', projectsHtml],
  ['contact.html', contactHtml]
]) {
  assert.ok(!content.includes('admin/index.html'), `Public page ${name} must not link to admin/index.html`);
  assert.ok(!content.includes('Open Admin Dashboard'), `Public page ${name} must not show Open Admin Dashboard button`);
  assert.ok(!/nextvora/i.test(content), `Public page ${name} must use NexVora spelling, not NextVora`);
}
console.log('  ✓ Verified zero Admin CMS links and 100% NexVora spelling across all public HTML pages\n');
