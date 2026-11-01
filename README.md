# Saksham Pandey — 3D Personal Portfolio & Private Admin CMS (`NEXVORA TECHNOLOGIES`)

A studio-grade, dimensional 3D personal brand portfolio and 20-module headless Content Management System built strictly with **HTML5, CSS3, and Vanilla ES6+ JavaScript** (zero frontend frameworks, zero build step required).

---

## 1. Architecture & Technology Stack

### Frontend (Zero-Framework Native Web Standards)
- **HTML5**: Semantic landmarks (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`), ARIA live regions, accessible modal dialogs, keyboard focus traps, and Open Graph metadata.
- **CSS3**: Custom design-token architecture ([`css/tokens.css`](css/tokens.css)), predominantly warm pearl/alabaster light theme (`#FAF8F5` / `#F3EFEA`) with charcoal typography (`#16161A`), signature `#F28C28` warm orange accent, dark theme toggle, 3D perspective transforms, and full `prefers-reduced-motion` + print stylesheet support.
- **Vanilla ES6+ JavaScript**: Modular ES6 architecture using native browser APIs:
  - **Custom 3D Projection Engine ([`js/scene-3d.js`](js/scene-3d.js))**: Real-time 60fps HTML5 Canvas 3D renderer with Lambertian facet shading, Painter's algorithm depth sorting, orbital telemetry rings, pointer inertia, and three switchable 3D geometries (*Crystalline Polyhedron*, *Distributed Hyper-Lattice*, *Orbital Wireframe*). Automatically pauses via `IntersectionObserver` and `visibilitychange` when off-screen or hidden.
  - **Interactive 3D Skill Constellation ([`js/skills.js`](js/skills.js))**: Fibonacci-sphere 3D orbital skill network paired with a live telemetry inspector panel and 8-category filter matrix.
  - **Cross-Tab Live Sync ([`js/data/repository.js`](js/data/repository.js))**: Uses `BroadcastChannel` and `storage` events so edits saved in `/admin/` immediately update open public portfolio tabs.

### Backend & Persistence Strategy: Why Supabase?
A static HTML/CSS/JavaScript frontend cannot securely enforce private authentication, cross-device persistence, or protected file uploads by itself.
- **Production Cloud Mode (Supabase)**: Uses Supabase's managed **PostgreSQL REST API (PostgREST)**, **GoTrue JWT Authentication**, and **Supabase Storage Buckets** via native `fetch()`. All write permissions and draft visibility rules are enforced server-side via PostgreSQL **Row-Level Security (RLS)** policies ([`backend/policies.sql`](backend/policies.sql)).
- **Local Preview Sandbox Mode (Zero-Config Out-of-the-Box)**: When Supabase credentials have not yet been configured, the application runs in an explicitly labeled **Local Preview Mode** backed by `localStorage` (for structured JSON state and automatic rollback checkpoints) and **IndexedDB** (for binary PDF resumes and uploaded images).

---

## 2. Project File Structure

```text
/
├── index.html                        # Public 3D Portfolio
├── 404.html                          # Custom 404 Page
├── robots.txt                        # Crawler indexing rules
├── sitemap.xml                       # Search engine sitemap
├── README.md                         # Architecture & deployment guide
├── .gitignore                        # Excludes local secrets
├── assets/
│   ├── icons/favicon.svg             # Custom SP / NEXVORA monogram icon
│   ├── images/                       # Custom SVG architectural covers
│   └── resumes/                      # Starter valid PDF resume sample
├── css/
│   ├── tokens.css                    # Design system custom properties
│   ├── base.css                      # Reset, typography, a11y, print styles
│   ├── layout.css                    # Section & spatial grid structures
│   ├── components.css                # 3D cards, buttons, modals, forms
│   ├── animations.css                # Opening sequence, scroll reveals, cursor
│   ├── responsive.css                # Tablet & mobile breakpoints
│   └── admin.css                     # Alias import for Admin CMS styles
├── js/
│   ├── app.js                        # Public portfolio orchestrator
│   ├── navigation.js                 # Header, scroll-spy, mobile drawer
│   ├── animations.js                 # Intro sequence & IntersectionObserver
│   ├── scene-3d.js                   # 3D Hero Sculpture & Card Tilt engine
│   ├── projects.js                   # Filterable 3D showcase & Case Study modal
│   ├── skills.js                     # 3D Skill Constellation & category matrix
│   ├── resumes.js                    # Multi-resume hub, PDF viewer & downloads
│   ├── contact.js                    # Contact validation & official wa.me builder
│   ├── theme.js                      # Light/Dark theme & custom cursor
│   ├── utils.js                      # XSS escaping, URL sanitizer, WhatsApp helpers
│   ├── config.example.js             # Safe configuration template
│   ├── data/
│   │   ├── seed-data.js              # Editable starter data for Saksham Pandey
│   │   └── repository.js             # Unified CRUD repository & snapshot manager
│   └── services/
│       ├── api.js                    # Native fetch() Supabase REST client
│       ├── auth.js                   # JWT session & Local Preview auth manager
│       └── storage.js                # Supabase Storage + IndexedDB blob manager
├── admin/
│   ├── index.html                    # 20-Module Private Admin Dashboard
│   ├── login.html                    # Secure Authentication Gateway
│   ├── css/admin.css                 # Studio CMS stylesheet
│   └── js/
│       ├── admin.js                  # Auth guard, router, unsaved-change warnings
│       ├── dashboard.js              # Overview stats, JSON backup, rollback history
│       ├── content-editor.js         # Profile, Hero, About & Collection CRUD
│       ├── resume-manager.js         # Multi-Resume PDF uploader & Media Library
│       └── settings.js               # Contact, WhatsApp, Theme, Nav, SEO, Security
├── backend/
│   ├── schema.sql                    # PostgreSQL tables & storage buckets
│   ├── policies.sql                  # Row-Level Security (RLS) policies
│   └── migrations/
│       └── 001_initial_setup.sql     # Initial seed row migration
└── tests/
    ├── README.md                     # QA documentation
    └── verify-suite.mjs              # Automated verification script
```

---

## 3. Running Locally (Zero Build Step Required)

Because ES6 modules (`<script type="module">`) use standard CORS rules, serve the directory over any local static HTTP server:

```bash
# Option A: Using Node.js npx serve or http-server
npx serve . -l 8080

# Option B: Using Python 3
python -m http.server 8080
```

Then open:
- **Public Portfolio**: `http://localhost:8080/`
- **Admin CMS Login**: `http://localhost:8080/admin/login.html`

---

## 4. Production Backend Setup (Supabase)

### Step 1: Create Database Tables & Storage Buckets
1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`backend/schema.sql`](backend/schema.sql).
4. Paste and run the contents of [`backend/policies.sql`](backend/policies.sql).
5. Paste and run [`backend/migrations/001_initial_setup.sql`](backend/migrations/001_initial_setup.sql).

### Step 2: Create Your First Administrator Account Securely
1. In your Supabase Dashboard, go to **Authentication → Users**.
2. Click **Add User → Create New User**.
3. Enter your administrator email (e.g., `saksham@nexvora.dev`) and a strong password, and check **Auto Confirm User**.
4. Disable public signups in **Authentication → Providers → Email** (*Turn off "Enable Sign Ups"*) so only your pre-authorized administrator account can authenticate.

### Step 3: Connect the Frontend
1. In Supabase, go to **Project Settings → API** and copy your **Project URL** and **`anon` `public` key**.
   - **CRITICAL SECURITY WARNING**: Never copy or expose the `service_role` secret key in frontend files.
2. Open `/admin/login.html` → expand **"Configure Supabase Cloud Connection"** (or go to Module 20 **Account & Security** inside `/admin/`), paste your Project URL and `anon` key, and click **Save Connection**.
3. Alternatively, copy `js/config.example.js` to `js/config.js` for static hosting deployment.

---

## 5. Connecting Your WhatsApp Number (`wa.me` Integration)

1. Sign in to `/admin/` and open **Module 14: WhatsApp (`wa.me`)**.
2. Enter your WhatsApp phone number including your country code (for example, `+91 98765 43210` for India).
3. The CMS automatically normalizes the number into E.164 digits-only format (`919876543210`), validates its length (8–15 digits), and displays a live preview of the generated `https://wa.me/<number>?text=...` URL.
4. Click **Save & Publish WhatsApp Settings**.

### Technical Note on WhatsApp Delivery
- An official `https://wa.me/` link opens WhatsApp (on mobile or desktop web) with the visitor's Name, Email, Subject, Budget, Timeline, and Message prefilled using `encodeURIComponent()`. The visitor reviews and clicks Send inside WhatsApp.
- If silent background WhatsApp delivery without visitor interaction is ever required in the future, you must provision the official **Meta WhatsApp Business Platform (Cloud API)** with a verified business phone number ID, approved message templates, and a server-side webhook/Edge Function holding the Meta access token.

---

## 6. Pre-Production Checklist for Saksham Pandey

Before publishing to your live domain:
1. **Connect Supabase**: Run `backend/schema.sql` and `backend/policies.sql`, create your admin user, and disable public signups.
2. **Upload Official Resume PDFs**: In `/admin/` → **11. Multiple Resumes (CVs)**, replace the starter sample PDFs with your final role-specific PDF resumes.
3. **Update Sample Placeholders**: Review Experience, Education, Achievements, Certifications, and Projects in `/admin/` and replace any entry marked `[Sample — Edit in Admin]` with your verified records and live repository URLs.
4. **Set Your Real WhatsApp Number**: Update the placeholder number in `/admin/` → **14. WhatsApp (`wa.me`)**.
