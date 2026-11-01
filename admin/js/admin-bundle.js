/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE ADMIN CMS BUNDLE
 */
(function () {
  if (window.__NEXVORA_ADMIN_RUNTIME_LOADED__) return;
  window.__NEXVORA_ADMIN_RUNTIME_LOADED__ = true;

/* === MODULE: js/utils.js === */
/**
 * ==========================================================================
 * UTILITIES, SECURITY HELPERS, WHATSAPP NORMALIZER & A11Y TOOLS
 * ==========================================================================
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function sanitizeUrl(url, allowRelative = true) {
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
function uid(prefix = 'id') {
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID().split('-')[0]
    : Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}
function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
}
function formatDate(dateInput) {
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
function normalizeWhatsAppNumber(rawNumber = '') {
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
function isValidWhatsAppNumber(rawNumber = '') {
  const digits = normalizeWhatsAppNumber(rawNumber);
  return /^\d{8,15}$/.test(digits);
}

/**
 * Builds an official https://wa.me/<number>?text=<encoded> link.
 */
function buildWhatsAppUrl(rawNumber, payload = {}) {
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
function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
function showToast(message, type = 'info', duration = 3800) {
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
function trapFocus(element, onEscape) {
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


/* === MODULE: js/data/seed-data.js === */
/**
 * ==========================================================================
 * STARTER SEED DATA — SAKSHAM PANDEY | NEXVORA TECHNOLOGIES
 * ==========================================================================
 */
const SEED_DATA = {
  profile: {
    id: 'profile_main',
    full_name: 'Saksham Pandey',
    brand_name: 'NEXVORA TECHNOLOGIES',
    monogram: 'NV',
    role_title: 'Founder & CEO · Full Stack Engineer',
    headline: 'Founder & CEO at NexVora Technologies | Full Stack Engineer | React | TypeScript | Python | FastAPI | Node.js | AI Automation',
    short_bio: 'Empowering the future through technology — architecting resilient full-stack systems, AI automation, digital transformation, ERP/CRM platforms, and high-craft web & mobile applications.',
    location: 'Ranchi, Jharkhand, India',
    relocation_preference: 'Available Worldwide · Remote & Global Client Engagements',
    email: 'pandeysaksham180@gmail.com',
    phone: '+91 9546748859',
    avatar_url: 'assets/images/saksham-profile.png',
    business_card_url: 'assets/images/nexvora-card.jpg',
    availability_text: 'Available for Select Projects, Enterprise Solutions & Engineering Roles',
    show_availability: true,
    updated_at: '2026-11-01T20:30:00Z'
  },

  hero: {
    id: 'hero_main',
    eyebrow: 'NEXVORA TECHNOLOGIES // EMPOWERING THE FUTURE THROUGH TECHNOLOGY',
    title_prefix: 'Engineering Dimensional,',
    title_highlight: 'High-Throughput',
    title_suffix: 'Digital Systems.',
    subtitle: 'I am Saksham Pandey — Founder & CEO of NexVora Technologies and Full Stack Engineer building production software across React, TypeScript, Python, FastAPI, Node.js, distributed architectures, and AI automation.',
    specialties: [
      'AI Automation & Grounded RAG Pipelines',
      'Full Stack Systems (React · TypeScript · FastAPI · Node.js)',
      'Digital Transformation & Enterprise ERP / CRM Solutions',
      'Mobile & Dimensional 3D Web Application Development',
      'Custom Management Software & High-Craft UI/UX Design'
    ],
    primary_cta_label: 'Explore Projects',
    primary_cta_target: 'projects.html',
    secondary_cta_label: 'About & Services',
    secondary_cta_target: 'about.html',
    contact_cta_label: 'Initiate Collaboration',
    contact_cta_target: 'contact.html',
    sculpture_mode: 'crystalline',
    telemetry_top_label: 'CORE ARCHITECTURE',
    telemetry_top_value: 'Distributed & AI-Native',
    telemetry_bottom_label: 'PRIMARY STACK',
    telemetry_bottom_value: 'TS · Python · FastAPI · Node'
  },

  about: {
    id: 'about_main',
    introduction: 'I am Saksham Pandey, Founder & CEO of NexVora Technologies based in Ranchi, Jharkhand, India. My work blends elite full-stack software engineering with modern digital agency execution — delivering resilient backend architectures and tactile, high-performance user interfaces.',
    technical_interests: 'I specialize in designing systems where data flows predictably under load: asynchronous Python services with FastAPI, strongly typed React and TypeScript frontends, event-driven Node.js microservices, custom ERP/CRM platforms, and practical AI automation workflows.',
    professional_strengths: 'End-to-end ownership from database schema design, cloud infrastructure, and REST/WebSocket API architecture to responsive, accessible, 60fps 3D web experiences.',
    working_style: 'Architecture-first, transparent communication, and security-conscious execution. Every product is engineered for instantaneous load times, clean code maintainability, and measurable business impact.',
    career_goals: 'Partnering with ambitious founders, global enterprises, and engineering teams to deliver flagship AI automation, management software, and full-stack platforms.',
    current_focus: 'Scaling NexVora Technologies across AI Automation, Digital Transformation, ERP/CRM Solutions, and Full-Stack Product Engineering.',
    pillars: [
      {
        code: '01',
        title: 'AI Automation & Intelligent Workflows',
        description: 'Production LLM orchestration, RAG knowledge pipelines, automated business agents, and deterministic API integrations.'
      },
      {
        code: '02',
        title: 'Mobile & Website Development',
        description: 'High-performance React, TypeScript, Python/FastAPI, and Node.js applications engineered for speed, SEO, and universal responsiveness.'
      },
      {
        code: '03',
        title: 'ERP, CRM & Management Software',
        description: 'Custom enterprise resource planning, client management portals, real-time analytics dashboards, and role-based workflows.'
      },
      {
        code: '04',
        title: 'Digital Transformation & UI/UX Design',
        description: 'Modernizing legacy operations into cloud-native architectures paired with studio-grade 3D & interactive interfaces.'
      }
    ]
  },

  skills: [
    {
      id: 'sk_react',
      name: 'React.js',
      category: 'Frontend Development',
      icon: 'RC',
      proficiency: 'Core',
      description: 'Component architecture, custom hooks, state management, concurrent rendering patterns, and performance optimization.',
      related_projects: ['NEXVORA Distributed Workflow Studio', 'Synapse RAG & Knowledge Copilot'],
      display_order: 1,
      published: true
    },
    {
      id: 'sk_typescript',
      name: 'TypeScript',
      category: 'Programming Languages',
      icon: 'TS',
      proficiency: 'Core',
      description: 'Strict static typing, generics, discriminated unions, modular ES6+ architecture, and runtime schema contracts.',
      related_projects: ['NEXVORA Distributed Workflow Studio', 'HyperFlux Real-Time Telemetry Bus'],
      display_order: 2,
      published: true
    },
    {
      id: 'sk_python',
      name: 'Python',
      category: 'Programming Languages',
      icon: 'PY',
      proficiency: 'Core',
      description: 'Asyncio concurrency, type-annotated backend services, data pipelines, and AI automation orchestration.',
      related_projects: ['NEXVORA Distributed Workflow Studio', 'Synapse RAG & Knowledge Copilot'],
      display_order: 3,
      published: true
    },
    {
      id: 'sk_fastapi',
      name: 'FastAPI',
      category: 'Backend Development',
      icon: 'FA',
      proficiency: 'Core',
      description: 'High-throughput asynchronous REST APIs, Pydantic data modeling, dependency injection, OpenAPI specs, and JWT security.',
      related_projects: ['NEXVORA Distributed Workflow Studio', 'Synapse RAG & Knowledge Copilot'],
      display_order: 4,
      published: true
    },
    {
      id: 'sk_nodejs',
      name: 'Node.js',
      category: 'Backend Development',
      icon: 'ND',
      proficiency: 'Core',
      description: 'Event-loop optimization, streams, microservices, webhook processors, and real-time signaling servers.',
      related_projects: ['HyperFlux Real-Time Telemetry Bus'],
      display_order: 5,
      published: true
    },
    {
      id: 'sk_html_css_3d',
      name: 'HTML5, CSS3 & WebGL 3D',
      category: 'Frontend Development',
      icon: '3D',
      proficiency: 'Core',
      description: 'Semantic accessibility, custom design tokens, perspective 3D transforms, HTML5 Canvas, and 60fps animations.',
      related_projects: ['NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 6,
      published: true
    },
    {
      id: 'sk_javascript',
      name: 'Vanilla ES6+ JS',
      category: 'Programming Languages',
      icon: 'JS',
      proficiency: 'Core',
      description: 'Zero-dependency modular DOM architecture, Canvas projection engines, Fetch REST clients, and Web APIs.',
      related_projects: ['NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 7,
      published: true
    },
    {
      id: 'sk_postgres',
      name: 'PostgreSQL & Supabase',
      category: 'Databases',
      icon: 'PG',
      proficiency: 'Production',
      description: 'Relational schema design, indexing, Row-Level Security (RLS) policies, transactions, and pgvector embeddings.',
      related_projects: ['Synapse RAG & Knowledge Copilot', 'NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 8,
      published: true
    },
    {
      id: 'sk_redis',
      name: 'Redis & Streams',
      category: 'Databases',
      icon: 'RD',
      proficiency: 'Production',
      description: 'Distributed caching, Pub/Sub messaging, rate limiting, session state, and Redis Streams task queues.',
      related_projects: ['NEXVORA Distributed Workflow Studio', 'HyperFlux Real-Time Telemetry Bus'],
      display_order: 9,
      published: true
    },
    {
      id: 'sk_realtime',
      name: 'WebSockets & Distributed Systems',
      category: 'APIs & Real-Time Communication',
      icon: 'WS',
      proficiency: 'Core',
      description: 'Idempotent API design, bidirectional WebSockets, Server-Sent Events (SSE), and fault-tolerant distributed workflows.',
      related_projects: ['HyperFlux Real-Time Telemetry Bus', 'NEXVORA Distributed Workflow Studio'],
      display_order: 10,
      published: true
    },
    {
      id: 'sk_ai_apps',
      name: 'AI Automation & LLM RAG',
      category: 'AI & Automation',
      icon: 'AI',
      proficiency: 'Core',
      description: 'Retrieval-Augmented Generation (RAG), semantic search, structured JSON tool-calling, and automated enterprise agents.',
      related_projects: ['Synapse RAG & Knowledge Copilot'],
      display_order: 11,
      published: true
    },
    {
      id: 'sk_erp_crm',
      name: 'ERP & CRM Architecture',
      category: 'Backend Development',
      icon: 'ER',
      proficiency: 'Production',
      description: 'Custom enterprise management software, role-based access control, automated billing/inventory, and executive analytics.',
      related_projects: ['NEXVORA Distributed Workflow Studio'],
      display_order: 12,
      published: true
    },
    {
      id: 'sk_devops',
      name: 'Docker, Vercel & CI/CD',
      category: 'DevOps & Deployment',
      icon: 'VC',
      proficiency: 'Production',
      description: 'Edge static & serverless deployment on Vercel, containerized Docker services, GitHub Actions, and cloud storage.',
      related_projects: ['NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 13,
      published: true
    },
    {
      id: 'sk_ui_ux',
      name: 'UI/UX & Design Systems',
      category: 'Frontend Development',
      icon: 'UX',
      proficiency: 'Core',
      description: 'Design tokens, accessible component libraries, interactive 3D motion choreography, and responsive layouts.',
      related_projects: ['NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 14,
      published: true
    },
    {
      id: 'sk_tools',
      name: 'Git, Linux & API Security',
      category: 'Development Tools',
      icon: 'GT',
      proficiency: 'Core',
      description: 'Version control workflows, shell automation, performance profiling, security auditing, and integration testing.',
      related_projects: ['NexVora 3D Multi-Page Portfolio & CMS'],
      display_order: 15,
      published: true
    }
  ],

  experiences: [
    {
      id: 'exp_nexvora',
      type: 'Leadership & Engineering',
      title: 'Founder & CEO · Lead Full Stack Architect',
      organization: 'NexVora Technologies',
      location: 'Ranchi, Jharkhand, India',
      start_date: '2024-01',
      end_date: '',
      is_current: true,
      description: 'Spearheading full-stack software engineering, AI automation solutions, digital transformation, custom management software, and ERP/CRM systems for clients and internal studio products.',
      technologies: ['React', 'TypeScript', 'Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'AI Automation', 'UI/UX Design'],
      highlights: [
        'Delivering end-to-end AI Automation, Digital Transformation, and custom ERP & CRM platforms under NexVora Technologies.',
        'Architected modular full-stack systems combining Python/FastAPI microservices with reactive TypeScript and 3D WebGL frontends.',
        'Established strict security, accessibility, and high-speed Vercel deployment standards across client and studio applications.'
      ],
      external_link: 'https://github.com/sakshampandey380',
      display_order: 1,
      published: true
    },
    {
      id: 'exp_sample_freelance',
      type: 'Client Engagements',
      title: 'Independent Full Stack Engineer — Contract & Client Projects',
      organization: 'Global Remote & Enterprise Clients',
      location: 'Remote / India',
      start_date: '2023-01',
      end_date: '',
      is_current: true,
      description: 'Architected, developed, and deployed 6+ production-ready full-stack web applications and real-time systems using React, TypeScript, Python (FastAPI), and Node.js.',
      technologies: ['Python', 'FastAPI', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MySQL', 'Docker', 'GitHub Actions'],
      highlights: [
        'Architected, developed, and deployed 6+ production-ready full-stack web applications using React, TypeScript, Python (FastAPI), and Node.js, maintaining 99.8% uptime across deployed services.',
        'Engineered secure authentication and Role-Based Access Control (RBAC) systems using OAuth 2.0, JWT, and bcrypt, protecting sensitive user data and mitigating OWASP Top 10 vulnerabilities.',
        'Optimized relational database schemas and SQL indexing strategies in PostgreSQL and MySQL, reducing average API query execution time from 280ms to 65ms (76% improvement).',
        'Containerized multi-service applications with Docker and configured automated GitHub Actions CI/CD workflows, accelerating deployment velocity by 40%.'
      ],
      external_link: 'https://www.linkedin.com/in/saksham-pandey-184515250',
      display_order: 2,
      published: true
    }
  ],

  education: [
    {
      id: 'edu_iit_patna',
      type: 'Education',
      title: 'Integrated BS-MS in Artificial Intelligence and Cybersecurity',
      organization: 'Indian Institute of Technology (IIT) Patna',
      location: 'Patna, Bihar, India',
      start_date: '2025-07',
      end_date: '2030-05',
      is_current: true,
      description: 'Pursuing Integrated BS-MS in Artificial Intelligence and Cybersecurity at IIT Patna with strong focus on distributed systems, cryptography, low-latency architectures, and applied AI.',
      technologies: [
        'Data Structures & Algorithms',
        'Distributed Systems',
        'Network Security & Cryptography',
        'Database Management Systems',
        'Low-Latency Systems',
        'Artificial Intelligence'
      ],
      highlights: [
        'Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Network Security, Cryptography, Database Management Systems, and Low-Latency Systems.',
        'Multilingual communication fluency: English (Professional Working Proficiency), Hindi (Native), Russian (Intermediate), and German (Elementary).'
      ],
      external_link: 'https://www.iitp.ac.in',
      display_order: 1,
      published: true
    }
  ],

  projects: [
    {
      id: 'proj_airscrib_ai',
      title: 'AirScrib.ai — Gesture-Controlled AI Drawing Studio',
      summary: 'Script.ai is a gesture-controlled drawing studio that transforms hand movements into digital sketches using webcam-based MediaPipe tracking. Built with React, FastAPI, MySQL, and OpenCV, it supports drawing management, basic shape recognition, customizable settings, and PNG, JPG, PDF, and SVG exports.',
      description: 'Script.ai is a gesture-controlled drawing studio that transforms hand movements into digital sketches using webcam-based MediaPipe tracking. Built with React, FastAPI, MySQL, and OpenCV, it supports drawing management, basic shape recognition, customizable settings, and PNG, JPG, PDF, and SVG exports.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['React', 'FastAPI', 'Python', 'MediaPipe', 'OpenCV', 'MySQL', 'JavaScript'],
      key_features: [
        'Real-time webcam-based hand gesture tracking using MediaPipe and OpenCV',
        'Interactive digital sketch studio with shape recognition and customizable brushes',
        'Full-stack persistence with FastAPI and MySQL for saving and managing drawings',
        'Multi-format export support including PNG, JPG, PDF, and vector SVG'
      ],
      my_contribution: 'Full-stack architecture across React canvas frontend, MediaPipe/OpenCV tracking pipeline, and FastAPI + MySQL backend.',
      technical_challenges: 'Translating high-frequency webcam hand landmark coordinates into smooth, jitter-free strokes in real time.',
      solutions_tradeoffs: 'Combined MediaPipe landmark smoothing with low-latency FastAPI endpoints and vector stroke serialization.',
      measurable_outcomes: 'Seamless gesture-to-sketch drawing experience with multi-format export.',
      github_url: 'https://github.com/sakshampandey380/AirScrib.ai',
      live_url: 'https://github.com/sakshampandey380/AirScrib.ai',
      case_study: 'Official GitHub repository: sakshampandey380/AirScrib.ai',
      featured: true,
      published: true,
      display_order: 1,
      created_date: '2026-10'
    },
    {
      id: 'proj_viora_meet',
      title: 'Viora Meet — Offline-Aware WebRTC Video Conferencing Platform',
      summary: 'Viora Meet is a premium offline-aware video meeting app built with Python FastAPI, React, MySQL, WebRTC, and WebSocket signaling. It supports secure accounts, profile pictures, online meetings, local-network fallback, invite links, chat, screen sharing, call history, light/dark mode, and a smooth animated responsive UI.',
      description: 'Viora Meet is a premium offline-aware video meeting app built with Python FastAPI, React, MySQL, WebRTC, and WebSocket signaling. It supports secure accounts, profile pictures, online meetings, local-network fallback, invite links, chat, screen sharing, call history, light/dark mode, and a smooth animated responsive UI.',
      cover_image: 'assets/images/project-hyperflux-rt.svg',
      screenshots: ['assets/images/project-hyperflux-rt.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['Python', 'FastAPI', 'React', 'WebRTC', 'WebSockets', 'MySQL', 'JavaScript'],
      key_features: [
        'Peer-to-peer WebRTC video/audio streaming with FastAPI WebSocket signaling',
        'Offline-aware local-network fallback for uninterrupted LAN meetings',
        'Real-time in-meeting chat, screen sharing, invite links, and call history',
        'Secure user accounts, profile avatars, and adaptive light/dark UI'
      ],
      my_contribution: 'Designed and developed the WebRTC signaling server in FastAPI, MySQL schema, and responsive React video room interface.',
      technical_challenges: 'Maintaining stable peer connections and session recovery across both internet and local-network environments.',
      solutions_tradeoffs: 'Implemented custom WebSocket room signaling with automatic ICE candidate negotiation and LAN fallback.',
      measurable_outcomes: 'Full-featured video conferencing with screen share, chat, and offline LAN support.',
      github_url: 'https://github.com/sakshampandey380/viora_google-meet_copy',
      live_url: 'https://github.com/sakshampandey380/viora_google-meet_copy',
      case_study: 'Official GitHub repository: sakshampandey380/viora_google-meet_copy',
      featured: true,
      published: true,
      display_order: 2,
      created_date: '2026-10'
    },
    {
      id: 'proj_resumeai_pro',
      title: 'ResumeAI Pro — AI ATS Resume Checker & LinkedIn Analyzer',
      summary: 'AI-powered ATS Resume Checker and LinkedIn Profile Analyzer built with React, FastAPI, Python NLP, and PostgreSQL to score resumes, match job descriptions, detect missing keywords, and generate professional career improvement suggestions.',
      description: 'AI-powered ATS Resume Checker and LinkedIn Profile Analyzer built with React, FastAPI, Python NLP, and PostgreSQL to score resumes, match job descriptions, detect missing keywords, and generate professional career improvement suggestions.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['React', 'FastAPI', 'Python NLP', 'PostgreSQL', 'AI Workflows'],
      key_features: [
        'Automated ATS compatibility scoring against target job descriptions',
        'LinkedIn profile analysis and missing technical keyword detection',
        'Actionable AI-generated career and bullet-point improvement suggestions',
        'PostgreSQL persistence for tracking resume versions and match scores'
      ],
      my_contribution: 'Engineered the Python NLP parsing and scoring backend in FastAPI, PostgreSQL database integration, and React analytics dashboard.',
      technical_challenges: 'Accurately extracting structured sections from diverse PDF/DOCX resume layouts and matching domain-specific skills.',
      solutions_tradeoffs: 'Built a multi-stage Python NLP pipeline combining keyword taxonomy matching with contextual AI scoring.',
      measurable_outcomes: 'Instant ATS score breakdown and keyword gap analysis for job seekers.',
      github_url: 'https://github.com/sakshampandey380/resumeai_pro',
      live_url: 'https://github.com/sakshampandey380/resumeai_pro',
      case_study: 'Official GitHub repository: sakshampandey380/resumeai_pro',
      featured: true,
      published: true,
      display_order: 3,
      created_date: '2026-06'
    },
    {
      id: 'proj_astraflow_multiagent',
      title: 'AstraFlow — AI Multi-Agent Automation Studio',
      summary: 'AstraFlow Multi-Agent Studio is a full-stack AI-powered automation platform collaborative ecosystem of intelligent agents. The system integrates multiple specialized agents—including research, writing, social media, and email assistants domain-specific tasks such as trend analysis, content generation, idea creation, and communication drafting.',
      description: 'AstraFlow Multi-Agent Studio is a full-stack AI-powered automation platform collaborative ecosystem of intelligent agents. The system integrates multiple specialized agents—including research, writing, social media, and email assistants domain-specific tasks such as trend analysis, content generation, idea creation, and communication drafting.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['Python', 'FastAPI', 'AI Agents', 'LLM Orchestration', 'React', 'JavaScript'],
      key_features: [
        'Collaborative multi-agent ecosystem for research, writing, social media, and email automation',
        'Automated trend analysis, content generation, and communication drafting',
        'Modular Python backend coordinating specialized domain agents',
        'Interactive studio interface for monitoring agent tasks and outputs'
      ],
      my_contribution: 'Architected the multi-agent orchestration backend in Python and the unified workflow studio frontend.',
      technical_challenges: 'Coordinating context handoffs between specialized research and content-generation agents without losing prompt fidelity.',
      solutions_tradeoffs: 'Structured deterministic agent role prompts and shared memory state across workflow steps.',
      measurable_outcomes: 'End-to-end automated research and content generation pipelines.',
      github_url: 'https://github.com/sakshampandey380/ai_multiagent_system',
      live_url: 'https://github.com/sakshampandey380/ai_multiagent_system',
      case_study: 'Official GitHub repository: sakshampandey380/ai_multiagent_system',
      featured: true,
      published: true,
      display_order: 4,
      created_date: '2026-04'
    },
    {
      id: 'proj_chatbot_ai',
      title: 'Full-Stack AI Chatbot with Conversation Memory & Auth',
      summary: 'Developed a full-stack AI chatbot with user authentication, conversation memory, and a modular backend architecture, enabling intelligent and context-aware interactions through a clean and responsive interface.',
      description: 'Developed a full-stack AI chatbot with user authentication, conversation memory, and a modular backend architecture, enabling intelligent and context-aware interactions through a clean and responsive interface.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['Python', 'FastAPI', 'LLM APIs', 'Authentication', 'Conversation Memory', 'JavaScript'],
      key_features: [
        'Secure user authentication with per-user session history',
        'Persistent multi-turn conversation memory for context-aware responses',
        'Modular Python backend architecture for pluggable LLM providers',
        'Clean, responsive chat UI with real-time message streaming'
      ],
      my_contribution: 'Full-stack implementation of the authentication system, conversation memory store, and chat UI.',
      technical_challenges: 'Preserving multi-turn conversation context while keeping token usage within model context limits.',
      solutions_tradeoffs: 'Implemented sliding-window conversation history management tied to authenticated user sessions.',
      measurable_outcomes: 'Responsive, context-aware conversational AI experience.',
      github_url: 'https://github.com/sakshampandey380/chatbot',
      live_url: 'https://github.com/sakshampandey380/chatbot',
      case_study: 'Official GitHub repository: sakshampandey380/chatbot',
      featured: true,
      published: true,
      display_order: 5,
      created_date: '2026-10'
    },
    {
      id: 'proj_trilent_ai',
      title: 'TrilNtel AI — FastAPI Multi-Domain AI Forecasting Backend',
      summary: 'TrilNtel AI – A production-ready FastAPI backend integrating AI workflows for house price prediction, health assistance, and finance forecasting using PyTorch, OpenCV, and Groq.',
      description: 'TrilNtel AI – A production-ready FastAPI backend integrating AI workflows for house price prediction, health assistance, and finance forecasting using PyTorch, OpenCV, and Groq.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['Python', 'FastAPI', 'PyTorch', 'OpenCV', 'Groq LLM', 'REST API'],
      key_features: [
        'Unified FastAPI backend serving house price prediction, health assistance, and finance forecasting',
        'Integration of PyTorch machine learning models with high-speed Groq LLM inference',
        'Computer vision processing pipelines powered by OpenCV',
        'Structured REST API endpoints with strict request validation'
      ],
      my_contribution: 'Designed and implemented the FastAPI service architecture, model inference routes, and Groq integration.',
      technical_challenges: 'Serving both PyTorch predictive models and LLM workflows from a unified low-latency API.',
      solutions_tradeoffs: 'Modularized domain routers in FastAPI with asynchronous inference handlers.',
      measurable_outcomes: 'Production-ready multi-domain AI backend API.',
      github_url: 'https://github.com/sakshampandey380/TriLent_AI',
      live_url: 'https://github.com/sakshampandey380/TriLent_AI',
      case_study: 'Official GitHub repository: sakshampandey380/TriLent_AI',
      featured: false,
      published: true,
      display_order: 6,
      created_date: '2026-04'
    },
    {
      id: 'proj_vibly_social',
      title: 'Vibley — Full-Stack Social Media Platform (Reels, Stories & Chat)',
      summary: 'Vibley is a modern full-stack Instagram-inspired social media platform built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS featuring reels, chat, stories, profiles, authentication, media uploads, themes, notifications, and real-time social interactions.',
      description: 'Vibley is a modern full-stack Instagram-inspired social media platform built with React, TypeScript, Node.js, Express, MySQL, and Tailwind CSS featuring reels, chat, stories, profiles, authentication, media uploads, themes, notifications, and real-time social interactions.',
      cover_image: 'assets/images/project-hyperflux-rt.svg',
      screenshots: ['assets/images/project-hyperflux-rt.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MySQL', 'Tailwind CSS'],
      key_features: [
        'Full-stack social ecosystem with Reels, Stories, Direct Messaging, and User Profiles',
        'Secure authentication, media uploads, and real-time activity notifications',
        'Strongly typed TypeScript frontend paired with Node.js + Express + MySQL backend',
        'Customizable theme support and responsive mobile-first layout'
      ],
      my_contribution: 'End-to-end development of the React + TypeScript client, Node.js/Express REST APIs, and relational MySQL schema.',
      technical_challenges: 'Coordinating media feeds, stories, notifications, and real-time chat interactions seamlessly.',
      solutions_tradeoffs: 'Designed normalized MySQL tables with indexed feed queries and modular Express controllers.',
      measurable_outcomes: 'Complete social media platform with reels, stories, and real-time messaging.',
      github_url: 'https://github.com/sakshampandey380/vibly_insta-clone',
      live_url: 'https://github.com/sakshampandey380/vibly_insta-clone',
      case_study: 'Official GitHub repository: sakshampandey380/vibly_insta-clone',
      featured: true,
      published: true,
      display_order: 7,
      created_date: '2026-05'
    },
    {
      id: 'proj_friendsign_chat',
      title: 'FriendSign — Full-Stack Real-Time Friends Chat Platform',
      summary: 'A Premium Full-Stack Real-Time Friends Chat Application. FriendSign is a modern full-stack chat platform where users can create accounts, manage friend requests, connect only with accepted friends, and communicate through real-time private messaging using React, Node.js, Express.js, MySQL, JWT Authentication, and Socket.io.',
      description: 'A Premium Full-Stack Real-Time Friends Chat Application. FriendSign is a modern full-stack chat platform where users can create accounts, manage friend requests, connect only with accepted friends, and communicate through real-time private messaging using React, Node.js, Express.js, MySQL, JWT Authentication, and Socket.io.',
      cover_image: 'assets/images/project-hyperflux-rt.svg',
      screenshots: ['assets/images/project-hyperflux-rt.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['React', 'Node.js', 'Express.js', 'Socket.io', 'MySQL', 'JWT Auth'],
      key_features: [
        'Friend-request workflow ensuring private messaging only between accepted friends',
        'Real-time bidirectional messaging powered by Socket.io and Node.js',
        'Stateless JWT authentication with MySQL relational persistence',
        'Responsive React chat interface with online presence indicators'
      ],
      my_contribution: 'Built the Socket.io real-time server, JWT authentication middleware, MySQL friend-graph schema, and React UI.',
      technical_challenges: 'Enforcing strict friend-only authorization on both REST history endpoints and live Socket.io events.',
      solutions_tradeoffs: 'Validated JWT tokens and friendship status on socket handshake and message dispatch.',
      measurable_outcomes: 'Secure, real-time private messaging platform.',
      github_url: 'https://github.com/sakshampandey380/FriendSign',
      live_url: 'https://github.com/sakshampandey380/FriendSign',
      case_study: 'Official GitHub repository: sakshampandey380/FriendSign',
      featured: false,
      published: true,
      display_order: 8,
      created_date: '2026-06'
    },
    {
      id: 'proj_bitrix24_crm',
      title: 'Bitrix24 Fleet CRM & Dispatch Scheduling Prototype',
      summary: 'High-fidelity Bitrix24 CRM fleet branding prototype in vanilla JS/HTML5/CSS3. Features reactive quote modeling, master multi-tech syncing, strict fleet quota allocation, voyage dispatch date validation, interactive Gantt & calendar scheduling, and full state persistence with 0 external dependencies.',
      description: 'High-fidelity Bitrix24 CRM fleet branding prototype in vanilla JS/HTML5/CSS3. Features reactive quote modeling, master multi-tech syncing, strict fleet quota allocation, voyage dispatch date validation, interactive Gantt & calendar scheduling, and full state persistence with 0 external dependencies.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'ERP, CRM & Dashboards',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'CRM Architecture', 'Gantt Scheduling'],
      key_features: [
        'Reactive quote modeling and master multi-tech synchronization',
        'Strict fleet quota allocation and voyage dispatch date validation',
        'Interactive Gantt chart and calendar scheduling views',
        'Full client-side state persistence with zero external dependencies'
      ],
      my_contribution: 'Engineered the complete CRM state engine, quota validation rules, and interactive Gantt/calendar UI in vanilla JS.',
      technical_challenges: 'Synchronizing complex fleet quota allocations and dispatch dates across multiple views without external libraries.',
      solutions_tradeoffs: 'Built a deterministic reactive state store in pure ES6+ JavaScript.',
      measurable_outcomes: 'Zero-dependency enterprise CRM prototype with instant UI responsiveness.',
      github_url: 'https://github.com/sakshampandey380/bitrix24-fleet-crm-prototype',
      live_url: 'https://github.com/sakshampandey380/bitrix24-fleet-crm-prototype',
      case_study: 'Official GitHub repository: sakshampandey380/bitrix24-fleet-crm-prototype',
      featured: false,
      published: true,
      display_order: 9,
      created_date: '2026-10'
    },
    {
      id: 'proj_tablecrm_mobile',
      title: 'TableCRM — Next.js & TypeScript Sales Order Dashboard',
      summary: 'Modern CRM Sales Dashboard built with Next.js, TypeScript, Tailwind CSS, and Zustand. Features dynamic tables, customizable UI, and responsive design.',
      description: 'Modern CRM Sales Dashboard built with Next.js, TypeScript, Tailwind CSS, and Zustand. Features dynamic tables, customizable UI, and responsive design.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'ERP, CRM & Dashboards',
      tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Vercel'],
      key_features: [
        'Dynamic CRM sales order management tables with instant filtering',
        'Predictable client state management powered by Zustand and TypeScript',
        'Customizable, mobile-responsive operator interface',
        'Deployed live on Vercel for rapid global access'
      ],
      my_contribution: 'Developed the Next.js + TypeScript frontend architecture, Zustand store, and responsive order workflows.',
      technical_challenges: 'Keeping order table interactions fast and ergonomic across both desktop and mobile viewports.',
      solutions_tradeoffs: 'Used lightweight Zustand state slices and modular Tailwind UI components.',
      measurable_outcomes: 'Live production CRM dashboard deployed on Vercel.',
      github_url: 'https://github.com/sakshampandey380/tablecrm-mobile-order',
      live_url: 'https://tablecrm-mobile-order-zeta.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/tablecrm-mobile-order',
      featured: false,
      published: true,
      display_order: 10,
      created_date: '2026-04'
    },
    {
      id: 'proj_retailcrm_dashboard',
      title: 'RetailCRM Full-Stack Orders & Analytics Dashboard',
      summary: 'Full-Stack Orders Dashboard built with RetailCRM API, Node.js, and React. This project fetches order data from RetailCRM, processes it through a backend server, and displays it in a modern dashboard with search, filtering, and analytics.',
      description: 'Full-Stack Orders Dashboard built with RetailCRM API, Node.js, and React. This project fetches order data from RetailCRM, processes it through a backend server, and displays it in a modern dashboard with search, filtering, and analytics.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'ERP, CRM & Dashboards',
      tech_stack: ['React', 'Node.js', 'RetailCRM API', 'JavaScript', 'Vercel'],
      key_features: [
        'Backend proxy and data aggregation server integrating the RetailCRM API',
        'Interactive React dashboard with order search, status filtering, and analytics',
        'Clean separation between API credential handling in Node.js and frontend presentation',
        'Live deployment on Vercel'
      ],
      my_contribution: 'Built the Node.js RetailCRM integration layer and the React analytics dashboard.',
      technical_challenges: 'Normalizing external RetailCRM order payloads for fast client-side filtering and chart visualization.',
      solutions_tradeoffs: 'Processed and structured CRM data on the Node.js backend before serving to the React client.',
      measurable_outcomes: 'Live full-stack CRM order analytics dashboard.',
      github_url: 'https://github.com/sakshampandey380/dashboard_project',
      live_url: 'https://dashboard-project-pi-eight.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/dashboard_project',
      featured: false,
      published: true,
      display_order: 11,
      created_date: '2026-04'
    },
    {
      id: 'proj_taskflow_fullstack',
      title: 'TaskFlow — Full-Stack Task Management Application',
      summary: 'The project demonstrates practical full-stack development across backend API architecture, relational database design, authentication, authorization, validation, frontend/backend integration, responsive UI development, automated testing, and secure application organization.',
      description: 'The project demonstrates practical full-stack development across backend API architecture, relational database design, authentication, authorization, validation, frontend/backend integration, responsive UI development, automated testing, and secure application organization.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['Python', 'REST API', 'Relational Database', 'Authentication', 'Automated Testing'],
      key_features: [
        'End-to-end task lifecycle management with user authentication and authorization',
        'Strict backend input validation and relational database schema design',
        'Responsive frontend UI integrated with RESTful API endpoints',
        'Automated test suite verifying core business logic and security rules'
      ],
      my_contribution: 'Architected the backend API, database models, authentication flow, and responsive frontend.',
      technical_challenges: 'Ensuring strict per-user data isolation and comprehensive validation across all task mutations.',
      solutions_tradeoffs: 'Combined role/ownership checks with automated integration tests.',
      measurable_outcomes: 'Production-structured full-stack task management system.',
      github_url: 'https://github.com/sakshampandey380/TaskFlow-Full-Stack-Task-Management-Application',
      live_url: 'https://github.com/sakshampandey380/TaskFlow-Full-Stack-Task-Management-Application',
      case_study: 'Official GitHub repository: sakshampandey380/TaskFlow-Full-Stack-Task-Management-Application',
      featured: false,
      published: true,
      display_order: 12,
      created_date: '2026-09'
    },
    {
      id: 'proj_blogsphere_cms',
      title: 'BlogSphere — Full-Stack Blogging & Publishing CMS',
      summary: 'BlogSphere is a full-stack blogging and content management application built as a complete publishing workflow for authors, readers, and administrators. The platform allows authenticated users to create, edit, manage, and publish articles while providing public visitors with a structured interface for discovering and reading content.',
      description: 'BlogSphere is a full-stack blogging and content management application built as a complete publishing workflow for authors, readers, and administrators. The platform allows authenticated users to create, edit, manage, and publish articles while providing public visitors with a structured interface for discovering and reading content.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['Python', 'Full-Stack CMS', 'Authentication', 'Role-Based Access', 'Database'],
      key_features: [
        'Complete article publishing workflow for authors, readers, and administrators',
        'Authenticated authoring dashboard for creating, editing, and managing posts',
        'Structured public reader interface for content discovery',
        'Role-based permissions separating public readers from authors and admins'
      ],
      my_contribution: 'Designed and built the full-stack publishing workflow, authentication system, and reader/author interfaces.',
      technical_challenges: 'Separating draft authoring workflows from published public articles cleanly.',
      solutions_tradeoffs: 'Implemented role-aware controllers and publication state filters.',
      measurable_outcomes: 'Complete multi-role blogging and content management platform.',
      github_url: 'https://github.com/sakshampandey380/BlogSphere---Blog-writing-Application-',
      live_url: 'https://github.com/sakshampandey380/BlogSphere---Blog-writing-Application-',
      case_study: 'Official GitHub repository: sakshampandey380/BlogSphere---Blog-writing-Application-',
      featured: false,
      published: true,
      display_order: 13,
      created_date: '2026-09'
    },
    {
      id: 'proj_socialflow_ai',
      title: 'SocialFlow AI — Multi-Platform Social Media Automation SaaS',
      summary: 'AI-powered social media automation platform for scheduling posts, generating content, and managing multi-platform workflows with a modern SaaS dashboard. Automates LinkedIn, Instagram, and X accounts from a unified workspace.',
      description: 'AI-powered social media automation platform for scheduling posts, generating content, and managing multi-platform workflows with a modern SaaS dashboard. Automates LinkedIn, Instagram, and X accounts from a unified workspace.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['JavaScript', 'AI Content Generation', 'SaaS Dashboard', 'Workflow Automation'],
      key_features: [
        'AI-assisted post generation tailored for LinkedIn, Instagram, and X (Twitter)',
        'Multi-platform content scheduling and campaign calendar management',
        'Modern SaaS analytics and workflow automation dashboard',
        'Unified account management from a single interface'
      ],
      my_contribution: 'Developed the SaaS automation dashboard, AI content generation integration, and scheduling workflows.',
      technical_challenges: 'Adapting AI-generated copy and formatting rules across multiple social platforms simultaneously.',
      solutions_tradeoffs: 'Created platform-specific prompt templates and preview cards.',
      measurable_outcomes: 'Streamlined multi-platform social media scheduling and AI copywriting.',
      github_url: 'https://github.com/sakshampandey380/SocialFow_AI',
      live_url: 'https://github.com/sakshampandey380/SocialFow_AI',
      case_study: 'Official GitHub repository: sakshampandey380/SocialFow_AI',
      featured: false,
      published: true,
      display_order: 14,
      created_date: '2026-04'
    },
    {
      id: 'proj_user_mgmt_ts',
      title: 'Enterprise User Management & RBAC Backend System',
      summary: 'User Management Backend System built with Node.js, Express, TypeScript, MySQL, JWT, and bcrypt. Implements secure authentication, role-based authorization (admin/user), and protected APIs with ownership-based access control.',
      description: 'User Management Backend System built with Node.js, Express, TypeScript, MySQL, JWT, and bcrypt. Implements secure authentication, role-based authorization (admin/user), and protected APIs with ownership-based access control.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'Backend & Security',
      tech_stack: ['Node.js', 'Express.js', 'TypeScript', 'MySQL', 'JWT', 'bcrypt'],
      key_features: [
        'Strongly typed Node.js + Express + TypeScript backend architecture',
        'Password hashing with bcrypt and stateless JWT authentication',
        'Role-based authorization (Admin vs. User) and resource ownership guards',
        'MySQL relational persistence with parameterized queries'
      ],
      my_contribution: 'Engineered the TypeScript backend API, RBAC middleware, JWT security flow, and MySQL integration.',
      technical_challenges: 'Enforcing both role-level and record-ownership permissions cleanly across REST endpoints.',
      solutions_tradeoffs: 'Built composable Express middleware guards for authentication, role verification, and ownership checks.',
      measurable_outcomes: 'Hardened, reusable TypeScript identity and user management backend.',
      github_url: 'https://github.com/sakshampandey380/user_managment_system',
      live_url: 'https://github.com/sakshampandey380/user_managment_system',
      case_study: 'Official GitHub repository: sakshampandey380/user_managment_system',
      featured: false,
      published: true,
      display_order: 15,
      created_date: '2026-04'
    },
    {
      id: 'proj_auth_rbac_node',
      title: 'Zero-Framework Node.js Authentication & Fine-Grained RBAC Engine',
      summary: 'A custom-built backend system implementing authentication and role-based access control (RBAC) from scratch using Node.js, Express, and MySQL. Demonstrates how secure user authentication and fine-grained authorization can be designed without relying on built-in framework solutions.',
      description: 'A custom-built backend system implementing authentication and role-based access control (RBAC) from scratch using Node.js, Express, and MySQL. Demonstrates how secure user authentication and fine-grained authorization can be designed without relying on built-in framework solutions.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'Backend & Security',
      tech_stack: ['Node.js', 'Express.js', 'MySQL', 'RBAC', 'Security Architecture'],
      key_features: [
        'Custom authentication and session/token verification built from first principles',
        'Fine-grained Role-Based Access Control (RBAC) permission matrix in MySQL',
        'Zero reliance on heavy third-party authentication frameworks',
        'Clean, auditable security middleware for Express.js'
      ],
      my_contribution: 'Designed and implemented the RBAC database schema, authentication controllers, and authorization middleware.',
      technical_challenges: 'Designing a flexible permission schema that supports custom roles and route-level guards.',
      solutions_tradeoffs: 'Normalized role-permission mapping tables in MySQL with fast middleware lookups.',
      measurable_outcomes: 'Complete, transparent RBAC security architecture in Node.js.',
      github_url: 'https://github.com/sakshampandey380/auth_system',
      live_url: 'https://github.com/sakshampandey380/auth_system',
      case_study: 'Official GitHub repository: sakshampandey380/auth_system',
      featured: false,
      published: true,
      display_order: 16,
      created_date: '2026-04'
    },
    {
      id: 'proj_n8n_goodini',
      title: 'Production n8n Automation & FFmpeg Video Forensic Pipeline',
      summary: 'Production-ready n8n workflows: file upload pipeline + forensic analysis of video processing system with ffmpeg improvements.',
      description: 'Production-ready n8n workflows: file upload pipeline + forensic analysis of video processing system with ffmpeg improvements.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'Backend & Security',
      tech_stack: ['n8n Automation', 'FFmpeg', 'Video Processing', 'Workflow Pipelines'],
      key_features: [
        'Automated file upload and media ingestion pipeline in n8n',
        'Forensic analysis and bottleneck diagnostics of video processing workflows',
        'FFmpeg transcoding and stream optimization improvements',
        'Fault-tolerant webhook and error-handling nodes'
      ],
      my_contribution: 'Built the n8n workflow pipelines, performed forensic analysis on video processing bottlenecks, and optimized FFmpeg parameters.',
      technical_challenges: 'Eliminating video processing bottlenecks and handling large media uploads reliably.',
      solutions_tradeoffs: 'Tuned FFmpeg encoding presets and decoupled ingestion from processing stages.',
      measurable_outcomes: 'Reliable, production-ready n8n media automation pipeline.',
      github_url: 'https://github.com/sakshampandey380/n8n-test-assignment-goodini',
      live_url: 'https://github.com/sakshampandey380/n8n-test-assignment-goodini',
      case_study: 'Official GitHub repository: sakshampandey380/n8n-test-assignment-goodini',
      featured: false,
      published: true,
      display_order: 17,
      created_date: '2026-05'
    },
    {
      id: 'proj_green_api_whatsapp',
      title: 'GREEN-API WhatsApp Integration Client & JSON Console',
      summary: 'A responsive web client implementing GREEN-API WhatsApp endpoints (getSettings, getStateInstance, sendMessage, and sendFileByUrl) with dynamic host configuration and real-time JSON response logging.',
      description: 'A responsive web client implementing GREEN-API WhatsApp endpoints (getSettings, getStateInstance, sendMessage, and sendFileByUrl) with dynamic host configuration and real-time JSON response logging.',
      cover_image: 'assets/images/project-hyperflux-rt.svg',
      screenshots: ['assets/images/project-hyperflux-rt.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'GREEN-API WhatsApp', 'REST API', 'Vercel'],
      key_features: [
        'Direct integration with GREEN-API WhatsApp endpoints (getSettings, getStateInstance, sendMessage, sendFileByUrl)',
        'Dynamic API host configuration and instance credential management',
        'Real-time formatted JSON response inspector for API debugging',
        'Deployed live on Vercel'
      ],
      my_contribution: 'Developed the complete WhatsApp API web client, REST request handlers, and live JSON response console.',
      technical_challenges: 'Handling asynchronous API calls and error states cleanly across multiple WhatsApp instance endpoints.',
      solutions_tradeoffs: 'Built a modular Fetch client with real-time response formatting and validation.',
      measurable_outcomes: 'Live WhatsApp API integration console hosted on Vercel.',
      github_url: 'https://github.com/sakshampandey380/green-api-integration-task',
      live_url: 'https://green-api-integration-task.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/green-api-integration-task',
      featured: false,
      published: true,
      display_order: 18,
      created_date: '2026-09'
    },
    {
      id: 'proj_electro_ecommerce',
      title: 'Electro — Multi-Page Electronics E-Commerce Application',
      summary: 'Electro is a frontend e-commerce application for shopping for electronics products. Built with HTML5, CSS3, and vanilla JavaScript, it provides a multi-page shopping experience with product browsing, category filtering, promotional offers, product details, authentication, cart management, checkout, order history, and a customer dashboard.',
      description: 'Electro is a frontend e-commerce application for shopping for electronics products. Built with HTML5, CSS3, and vanilla JavaScript, it provides a multi-page shopping experience with product browsing, category filtering, promotional offers, product details, authentication, cart management, checkout, order history, and a customer dashboard.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'E-Commerce', 'Vercel'],
      key_features: [
        'Multi-page electronics shopping flow with product catalog and category filtering',
        'Interactive shopping cart, checkout simulation, and order history tracking',
        'Customer authentication and account dashboard',
        'Deployed live on Vercel for instant browsing'
      ],
      my_contribution: 'Designed and built the complete multi-page e-commerce frontend, cart state management, and checkout flow.',
      technical_challenges: 'Persisting cart state, user sessions, and order history seamlessly across multiple static HTML pages.',
      solutions_tradeoffs: 'Engineered a synchronized localStorage commerce store in vanilla JavaScript.',
      measurable_outcomes: 'Full multi-page electronics e-commerce experience live on Vercel.',
      github_url: 'https://github.com/sakshampandey380/ELECTRO---A-SHOPPING-APPLICATION',
      live_url: 'https://electro-shopping-app.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/ELECTRO---A-SHOPPING-APPLICATION',
      featured: false,
      published: true,
      display_order: 19,
      created_date: '2026-10'
    },
    {
      id: 'proj_nexora_ecommerce',
      title: 'NeXora — Full-Stack Digital Commerce Ecosystem',
      summary: 'NeXora is a modern, full-stack eCommerce web application designed to deliver a seamless and scalable online shopping experience. Built with performance, usability, and clean architecture in mind, NeXora showcases a complete digital commerce ecosystem—from product discovery to secure checkout.',
      description: 'NeXora is a modern, full-stack eCommerce web application designed to deliver a seamless and scalable online shopping experience. Built with performance, usability, and clean architecture in mind, NeXora showcases a complete digital commerce ecosystem—from product discovery to secure checkout.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript', 'Full-Stack E-Commerce'],
      key_features: [
        'End-to-end digital commerce workflow from product discovery to secure checkout',
        'Dynamic server-side product catalog and inventory management',
        'User authentication, shopping cart, and order processing backend',
        'Responsive storefront optimized for desktop and mobile shoppers'
      ],
      my_contribution: 'Built the full-stack PHP + MySQL commerce backend and responsive storefront UI.',
      technical_challenges: 'Structuring product catalog queries and checkout transactions for reliability and speed.',
      solutions_tradeoffs: 'Modularized backend controllers and relational database tables for products, carts, and orders.',
      measurable_outcomes: 'Complete full-stack e-commerce web application.',
      github_url: 'https://github.com/sakshampandey380/NeXora',
      live_url: 'https://github.com/sakshampandey380/NeXora',
      case_study: 'Official GitHub repository: sakshampandey380/NeXora',
      featured: false,
      published: true,
      display_order: 20,
      created_date: '2026-03'
    },
    {
      id: 'proj_unos_tacos',
      title: 'Unos Tacos y Birria — Artisanal Taqueria Web Application',
      summary: 'An artisanal Mexican taqueria web application highlighting slow-cooked birria de res, quesatacos, mulitas, vampiros, and house-made aguas frescas with modern responsive design.',
      description: 'An artisanal Mexican taqueria web application highlighting slow-cooked birria de res, quesatacos, mulitas, vampiros, and house-made aguas frescas with modern responsive design.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Responsive UI/UX', 'Vercel'],
      key_features: [
        'Rich culinary brand storytelling and interactive menu showcase',
        'Mobile-first responsive layout with smooth scroll animations',
        'Fast static asset delivery deployed on Vercel'
      ],
      my_contribution: 'Designed and developed the responsive frontend experience and deployed on Vercel.',
      technical_challenges: 'Creating a high-visual-impact hospitality website with instantaneous load times.',
      solutions_tradeoffs: 'Pure HTML5, CSS3, and vanilla JavaScript with zero framework overhead.',
      measurable_outcomes: 'Live hospitality web application on Vercel.',
      github_url: 'https://github.com/sakshampandey380/unos-tacos-y-birria-web',
      live_url: 'https://unos-tacos-y-birria-web.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/unos-tacos-y-birria-web',
      featured: false,
      published: true,
      display_order: 21,
      created_date: '2026-10'
    },
    {
      id: 'proj_lux_central_cafe',
      title: 'Lux Central — Artisan Cafe, Roastery & Cocktail Lounge Experience',
      summary: 'Lux Central is an interactive, responsive web experience built for the iconic Phoenix, Arizona artisan cafe, roastery, and cocktail lounge. Powered by modern HTML5, vanilla CSS3 animations, and dynamic JavaScript, this project brings the cafe’s distinctive day-to-night atmosphere directly to the browser.',
      description: 'Lux Central is an interactive, responsive web experience built for the iconic Phoenix, Arizona artisan cafe, roastery, and cocktail lounge. Powered by modern HTML5, vanilla CSS3 animations, and dynamic JavaScript, this project brings the cafe’s distinctive day-to-night atmosphere directly to the browser.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['HTML5', 'CSS3 Animations', 'Vanilla JavaScript', 'Vercel'],
      key_features: [
        'Dynamic day-to-night atmosphere transitions reflecting the cafe and cocktail lounge vibe',
        'Interactive menu exploration with vanilla CSS3 animations',
        'Fully responsive layout across mobile, tablet, and desktop devices'
      ],
      my_contribution: 'Crafted the interactive UI/UX, CSS3 animation choreography, and dynamic JavaScript components.',
      technical_challenges: 'Capturing the transition from daytime roastery to evening cocktail lounge smoothly in the browser.',
      solutions_tradeoffs: 'Used CSS custom properties and hardware-accelerated transitions.',
      measurable_outcomes: 'Live interactive brand experience hosted on Vercel.',
      github_url: 'https://github.com/sakshampandey380/lux-central-cafe',
      live_url: 'https://lux-central-cafe.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/lux-central-cafe',
      featured: false,
      published: true,
      display_order: 22,
      created_date: '2026-10'
    },
    {
      id: 'proj_el_cafezito',
      title: 'El Cafezito — Multilingual Café & Interactive Ordering Web App',
      summary: 'A premium, responsive café website built with HTML, CSS, and vanilla JavaScript. Features a multilingual experience, interactive digital menu, customizable orders, persistent cart, simulated pickup checkout, and elegant animations—crafted for a Latin-inspired café concept in Phoenix, Arizona.',
      description: 'A premium, responsive café website built with HTML, CSS, and vanilla JavaScript. Features a multilingual experience, interactive digital menu, customizable orders, persistent cart, simulated pickup checkout, and elegant animations—crafted for a Latin-inspired café concept in Phoenix, Arizona.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Multilingual UI', 'Persistent Cart', 'Vercel'],
      key_features: [
        'Multilingual user interface with instant language switching',
        'Interactive digital menu with customizable item modifiers and persistent cart',
        'Simulated pickup checkout workflow and smooth animations',
        'Deployed live on Vercel'
      ],
      my_contribution: 'Engineered the multilingual switcher, customizable cart logic, and responsive hospitality UI.',
      technical_challenges: 'Managing customizable drink/food options and bilingual content dynamically without page reloads.',
      solutions_tradeoffs: 'Structured a reactive JSON menu and localization dictionary in vanilla JavaScript.',
      measurable_outcomes: 'Live bilingual café ordering web app on Vercel.',
      github_url: 'https://github.com/sakshampandey380/el-cafezito',
      live_url: 'https://el-cafezito-rho.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/el-cafezito',
      featured: false,
      published: true,
      display_order: 23,
      created_date: '2026-10'
    },
    {
      id: 'proj_chat_app_php',
      title: 'Real-Time PHP, MySQL & AJAX Chat Application with Admin Panel',
      summary: 'A full-stack real-time chat application built with PHP, MySQL, and AJAX, featuring secure user authentication, dynamic messaging, online/offline status, and a complete admin dashboard for managing users and conversations.',
      description: 'A full-stack real-time chat application built with PHP, MySQL, and AJAX, featuring secure user authentication, dynamic messaging, online/offline status, and a complete admin dashboard for managing users and conversations.',
      cover_image: 'assets/images/project-hyperflux-rt.svg',
      screenshots: ['assets/images/project-hyperflux-rt.svg'],
      demo_video_url: '',
      category: 'Full Stack & Real-Time',
      tech_stack: ['PHP', 'MySQL', 'AJAX', 'JavaScript', 'Admin Dashboard'],
      key_features: [
        'Asynchronous real-time messaging powered by AJAX and PHP',
        'Live online/offline user status tracking and secure authentication',
        'Dedicated administrator dashboard to manage users and conversations',
        'Relational MySQL message storage'
      ],
      my_contribution: 'Built the PHP backend controllers, MySQL database schema, AJAX polling engine, and admin dashboard.',
      technical_challenges: 'Delivering responsive chat updates and presence tracking over standard HTTP hosting.',
      solutions_tradeoffs: 'Optimized lightweight AJAX delta queries against indexed MySQL timestamps.',
      measurable_outcomes: 'Full-stack chat platform with complete administrative controls.',
      github_url: 'https://github.com/sakshampandey380/Chat_App',
      live_url: 'https://github.com/sakshampandey380/Chat_App',
      case_study: 'Official GitHub repository: sakshampandey380/Chat_App',
      featured: false,
      published: true,
      display_order: 24,
      created_date: '2026-06'
    },
    {
      id: 'proj_dashboard_app',
      title: 'Scalable Full-Stack Analytics & Data Dashboard',
      summary: 'A scalable full-stack dashboard app featuring secure authentication, real-time data handling, and interactive analytics built with modern web stack.',
      description: 'A scalable full-stack dashboard app featuring secure authentication, real-time data handling, and interactive analytics built with modern web stack.',
      cover_image: 'assets/images/project-nexvora-mesh.svg',
      screenshots: ['assets/images/project-nexvora-mesh.svg'],
      demo_video_url: '',
      category: 'ERP, CRM & Dashboards',
      tech_stack: ['JavaScript', 'React', 'Node.js', 'Authentication', 'Analytics'],
      key_features: [
        'Secure user authentication and protected analytics routes',
        'Real-time data handling and interactive visualization widgets',
        'Modular full-stack web architecture'
      ],
      my_contribution: 'Developed the frontend analytics views and backend data endpoints.',
      technical_challenges: 'Rendering interactive data summaries cleanly across screen sizes.',
      solutions_tradeoffs: 'Built reusable chart and metric card components.',
      measurable_outcomes: 'Scalable full-stack analytics dashboard.',
      github_url: 'https://github.com/sakshampandey380/dashboard_app',
      live_url: 'https://github.com/sakshampandey380/dashboard_app',
      case_study: 'Official GitHub repository: sakshampandey380/dashboard_app',
      featured: false,
      published: true,
      display_order: 25,
      created_date: '2026-04'
    },
    {
      id: 'proj_quizly_ai',
      title: 'Quizly — AI-Powered Adaptive Quiz & Learning Platform',
      summary: 'Quizly is a modern full-stack AI-powered quiz application designed to deliver an engaging and dynamic learning experience. The platform features intelligent question generation using AI, combined with a structured level-based progression system and multiple quiz categories.',
      description: 'Quizly is a modern full-stack AI-powered quiz application designed to deliver an engaging and dynamic learning experience. The platform features intelligent question generation using AI, combined with a structured level-based progression system and multiple quiz categories.',
      cover_image: 'assets/images/project-synapse-ai.svg',
      screenshots: ['assets/images/project-synapse-ai.svg'],
      demo_video_url: '',
      category: 'AI & Computer Vision',
      tech_stack: ['Python', 'AI Question Generation', 'Full-Stack Web', 'JavaScript'],
      key_features: [
        'Dynamic AI-powered quiz question generation across multiple categories',
        'Structured level-based progression and score tracking',
        'Interactive, responsive quiz interface with instant feedback'
      ],
      my_contribution: 'Built the Python AI question generator backend and interactive quiz progression frontend.',
      technical_challenges: 'Validating AI-generated multiple-choice questions for consistent structure and difficulty.',
      solutions_tradeoffs: 'Enforced strict JSON schema parsing on AI quiz outputs.',
      measurable_outcomes: 'Engaging AI-driven quiz and learning platform.',
      github_url: 'https://github.com/sakshampandey380/Quiz_game',
      live_url: 'https://github.com/sakshampandey380/Quiz_game',
      case_study: 'Official GitHub repository: sakshampandey380/Quiz_game',
      featured: false,
      published: true,
      display_order: 26,
      created_date: '2026-04'
    },
    {
      id: 'proj_zentro_game_hub',
      title: 'Zentro — Multi-Game Interactive Web Platform',
      summary: 'Zentro is a modern multi-game web platform designed to provide an engaging and seamless gaming experience. The application brings together multiple interactive games, allowing users to explore, play, and switch between them effortlessly without leaving the platform.',
      description: 'Zentro is a modern multi-game web platform designed to provide an engaging and seamless gaming experience. The application brings together multiple interactive games, allowing users to explore, play, and switch between them effortlessly without leaving the platform.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Interactive & Utility Apps',
      tech_stack: ['JavaScript', 'HTML5', 'CSS3', 'Game Loops', 'Responsive UI'],
      key_features: [
        'Unified hub hosting multiple interactive browser games in one seamless platform',
        'Instant game switching without page reloads',
        'Smooth 60fps performance and responsive controls'
      ],
      my_contribution: 'Designed and developed the multi-game hub shell and interactive game modules in JavaScript.',
      technical_challenges: 'Isolating game loops and event listeners when switching between games dynamically.',
      solutions_tradeoffs: 'Implemented clean lifecycle mount/unmount handlers for each game module.',
      measurable_outcomes: 'Seamless multi-game web arcade platform.',
      github_url: 'https://github.com/sakshampandey380/multi_game_hub',
      live_url: 'https://github.com/sakshampandey380/multi_game_hub',
      case_study: 'Official GitHub repository: sakshampandey380/multi_game_hub',
      featured: false,
      published: true,
      display_order: 27,
      created_date: '2026-04'
    },
    {
      id: 'proj_translator_react',
      title: 'React & Vite Multi-Language Translator App',
      summary: 'A React translator app built with Vite that allows users to translate text into different languages using an external translation API. Improved with error handling, copy options, translation history, cleaner UI, and secure environment variable setup so API keys are not exposed.',
      description: 'A React translator app built with Vite that allows users to translate text into different languages using an external translation API. Improved with error handling, copy options, translation history, cleaner UI, and secure environment variable setup so API keys are not exposed.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Interactive & Utility Apps',
      tech_stack: ['React', 'Vite', 'JavaScript', 'REST Translation API'],
      key_features: [
        'Multi-language text translation powered by external translation APIs',
        'Translation history log and one-click clipboard copy feedback',
        'Robust error handling and secure environment variable configuration'
      ],
      my_contribution: 'Developed the React + Vite application, history state, and API integration.',
      technical_challenges: 'Handling network errors gracefully and protecting API credentials via environment variables.',
      solutions_tradeoffs: 'Added debounced requests, clear status feedback, and local translation history.',
      measurable_outcomes: 'Fast, user-friendly multi-language translation tool.',
      github_url: 'https://github.com/sakshampandey380/translator-app-',
      live_url: 'https://github.com/sakshampandey380/translator-app-',
      case_study: 'Official GitHub repository: sakshampandey380/translator-app-',
      featured: false,
      published: true,
      display_order: 28,
      created_date: '2026-06'
    },
    {
      id: 'proj_password_generator',
      title: 'React & Vite Cryptographic Password Generator',
      summary: 'A secure password generator built with React and Vite. Helps users create strong passwords with options for uppercase letters, lowercase letters, numbers, symbols, custom length, similar-character exclusion, copy feedback, password strength checking, and local password history.',
      description: 'A secure password generator built with React and Vite. Helps users create strong passwords with options for uppercase letters, lowercase letters, numbers, symbols, custom length, similar-character exclusion, copy feedback, password strength checking, and local password history.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Interactive & Utility Apps',
      tech_stack: ['React', 'Vite', 'JavaScript', 'Security Utility'],
      key_features: [
        'Customizable character sets (uppercase, lowercase, numbers, symbols) and length',
        'Similar-character exclusion and real-time password entropy/strength indicator',
        'One-click copy feedback and local password history'
      ],
      my_contribution: 'Built the password generation logic, strength evaluator, and React UI.',
      technical_challenges: 'Guaranteeing that every selected character class is represented in the generated password.',
      solutions_tradeoffs: 'Implemented deterministic character pool sampling with shuffle randomization.',
      measurable_outcomes: 'Clean, reliable security utility built with React and Vite.',
      github_url: 'https://github.com/sakshampandey380/Password-Generator',
      live_url: 'https://github.com/sakshampandey380/Password-Generator',
      case_study: 'Official GitHub repository: sakshampandey380/Password-Generator',
      featured: false,
      published: true,
      display_order: 29,
      created_date: '2026-06'
    },
    {
      id: 'proj_gvmt_ngo',
      title: 'GVMT — Educational NGO Web Platform',
      summary: 'GVMT is a dedicated non-governmental organization committed to transforming lives through the power of education. Focuses on providing accessible learning opportunities, skill development, and community initiatives.',
      description: 'GVMT is a dedicated non-governmental organization committed to transforming lives through the power of education. Focuses on providing accessible learning opportunities, skill development, and community initiatives.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['PHP', 'HTML5', 'CSS3', 'JavaScript', 'Responsive Web'],
      key_features: [
        'Mission-driven NGO platform showcasing educational programs and social impact',
        'Accessible layout for students, volunteers, and donors',
        'Dynamic PHP page templates and contact workflows'
      ],
      my_contribution: 'Designed and developed the full NGO web presence.',
      technical_challenges: 'Organizing program information clearly for diverse community visitors.',
      solutions_tradeoffs: 'Clean semantic HTML/CSS structure paired with PHP templates.',
      measurable_outcomes: 'Dedicated web platform for educational outreach.',
      github_url: 'https://github.com/sakshampandey380/NGO_Website',
      live_url: 'https://github.com/sakshampandey380/NGO_Website',
      case_study: 'Official GitHub repository: sakshampandey380/NGO_Website',
      featured: false,
      published: true,
      display_order: 30,
      created_date: '2026-03'
    },
    {
      id: 'proj_zomato_smartweb',
      title: 'Zomato-Inspired Food Discovery Landing Experience',
      summary: 'A modern and responsive Zomato-inspired landing page built with HTML, CSS, and JavaScript. Features a clean UI, responsive layout, food discovery sections, and an engaging design optimized for desktop and mobile devices.',
      description: 'A modern and responsive Zomato-inspired landing page built with HTML, CSS, and JavaScript. Features a clean UI, responsive layout, food discovery sections, and an engaging design optimized for desktop and mobile devices.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI'],
      key_features: [
        'Restaurant and food discovery sections inspired by Zomato',
        'Mobile-friendly responsive grid and category cards',
        'Polished hover interactions and clean typography'
      ],
      my_contribution: 'Built the responsive frontend layout and interactive UI components.',
      technical_challenges: 'Adapting complex multi-column food discovery grids across mobile and desktop screens.',
      solutions_tradeoffs: 'Used modern CSS Grid and Flexbox media queries.',
      measurable_outcomes: 'Responsive food delivery landing page clone.',
      github_url: 'https://github.com/sakshampandey380/KA--SmartWeb---cloning-',
      live_url: 'https://github.com/sakshampandey380/KA--SmartWeb---cloning-',
      case_study: 'Official GitHub repository: sakshampandey380/KA--SmartWeb---cloning-',
      featured: false,
      published: true,
      display_order: 31,
      created_date: '2026-08'
    },
    {
      id: 'proj_dev_portfolio_react',
      title: 'React & Vite Multi-Page Developer Portfolio',
      summary: 'A responsive developer portfolio website built with React, Vite, and React Router. Includes separate pages for Home, About, Projects, Skills, and Contact, with reusable components, active navigation, and contact form validation.',
      description: 'A responsive developer portfolio website built with React, Vite, and React Router. Includes separate pages for Home, About, Projects, Skills, and Contact, with reusable components, active navigation, and contact form validation.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'E-Commerce & Web Apps',
      tech_stack: ['React', 'Vite', 'React Router', 'JavaScript', 'CSS3'],
      key_features: [
        'Client-side multi-page routing with React Router (Home, About, Projects, Skills, Contact)',
        'Reusable component architecture and active route highlighting',
        'Interactive contact form validation'
      ],
      my_contribution: 'Developed the React component hierarchy, routing configuration, and responsive styles.',
      technical_challenges: 'Structuring clean, reusable components that are easy to customize.',
      solutions_tradeoffs: 'Modularized page views and shared UI primitives in Vite.',
      measurable_outcomes: 'Clean React + Vite single-page portfolio template.',
      github_url: 'https://github.com/sakshampandey380/Developer-Portfolio-Website',
      live_url: 'https://github.com/sakshampandey380/Developer-Portfolio-Website',
      case_study: 'Official GitHub repository: sakshampandey380/Developer-Portfolio-Website',
      featured: false,
      published: true,
      display_order: 32,
      created_date: '2026-06'
    },
    {
      id: 'proj_tictactoe_ai',
      title: 'Ultimate Tic-Tac-Toe — Smart AI & Dual-Player Strategy Game',
      summary: 'Welcome to the Ultimate Tic-Tac-Toe Game, a modern and feature-rich version of the classic strategy game, designed with a beautiful interface, smooth animations, and intelligent gameplay. Play solo against a smart AI or challenge a friend in dual mode across all devices.',
      description: 'Welcome to the Ultimate Tic-Tac-Toe Game, a modern and feature-rich version of the classic strategy game, designed with a beautiful interface, smooth animations, and intelligent gameplay. Play solo against a smart AI or challenge a friend in dual mode across all devices.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Interactive & Utility Apps',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Game AI', 'Vercel'],
      key_features: [
        'Solo mode against an intelligent AI opponent as well as 2-player local mode',
        'Smooth win-line animations, score tracking, and responsive layout',
        'Deployed live on Vercel'
      ],
      my_contribution: 'Built the game state engine, AI move logic, and animated UI.',
      technical_challenges: 'Creating a responsive AI opponent and smooth visual feedback for game states.',
      solutions_tradeoffs: 'Implemented heuristic move evaluation in vanilla JavaScript.',
      measurable_outcomes: 'Live playable strategy game on Vercel.',
      github_url: 'https://github.com/sakshampandey380/Tic-Tac-Toe_GAME',
      live_url: 'https://tic-tac-toe-game-zeta-azure.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/Tic-Tac-Toe_GAME',
      featured: false,
      published: true,
      display_order: 33,
      created_date: '2026-03'
    },
    {
      id: 'proj_snake_game',
      title: 'Classic Arcade Snake Game — HTML5, CSS3 & JavaScript',
      summary: 'The Snake Game is a classic arcade-style game developed using HTML, CSS, and JavaScript. The player controls a snake that moves across the screen to collect food, increasing its length and score while avoiding wall and self collisions.',
      description: 'The Snake Game is a classic arcade-style game developed using HTML, CSS, and JavaScript. The player controls a snake that moves across the screen to collect food, increasing its length and score while avoiding wall and self collisions.',
      cover_image: 'assets/images/project-aether-ui.svg',
      screenshots: ['assets/images/project-aether-ui.svg'],
      demo_video_url: '',
      category: 'Interactive & Utility Apps',
      tech_stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Arcade Game', 'Vercel'],
      key_features: [
        'Classic grid-based snake movement, food spawning, and collision detection',
        'Real-time score tracking and keyboard direction controls',
        'Deployed live on Vercel'
      ],
      my_contribution: 'Developed the game loop, collision detection, and rendering logic.',
      technical_challenges: 'Handling rapid directional key presses without causing self-collision bugs.',
      solutions_tradeoffs: 'Buffered input direction per game tick.',
      measurable_outcomes: 'Live playable arcade game on Vercel.',
      github_url: 'https://github.com/sakshampandey380/snake_game',
      live_url: 'https://snake-game-nu-topaz.vercel.app',
      case_study: 'Official GitHub repository: sakshampandey380/snake_game',
      featured: false,
      published: true,
      display_order: 34,
      created_date: '2026-05'
    }
  ],

  achievements: [
    {
      id: 'ach_nexvora_studio',
      category: 'Leadership & Studio Milestone',
      title: 'Founded NexVora Technologies — Digital Transformation & AI Studio',
      issuer: 'NexVora Technologies (Ranchi, Jharkhand, India)',
      date: '2024 – Present',
      description: 'Established NexVora Technologies delivering AI Automation, Digital Transformation, Management Software, Mobile & Website Development, UI/UX Design, and ERP/CRM Solutions.',
      credential_url: 'https://github.com/sakshampandey380',
      media_url: '',
      published: true,
      display_order: 1
    },
    {
      id: 'ach_hackerrank_gold',
      category: 'Competitive Programming & Engineering',
      title: 'HackerRank Gold Badge in Python & Problem Solving',
      issuer: 'HackerRank',
      date: '2025',
      description: 'Awarded Gold Badge for algorithmic problem solving, data structures, and Python optimization.',
      credential_url: 'https://github.com/sakshampandey380',
      media_url: '',
      published: true,
      display_order: 2
    }
  ],

  certifications: [
    {
      id: 'cert_meta_frontend',
      category: 'Certification',
      title: 'Meta Front-End Developer Specialization: Advanced React, State Management & Testing',
      issuer: 'Meta',
      date: '2025',
      description: 'Comprehensive specialization covering advanced React architecture, scalable state management, performance optimization, and automated UI testing.',
      credential_url: 'https://www.linkedin.com/in/saksham-pandey-184515250',
      media_url: '',
      published: true,
      display_order: 1
    },
    {
      id: 'cert_fullstack_arch',
      category: 'Certification',
      title: 'Advanced Full-Stack Engineering: REST APIs & Microservices Architecture',
      issuer: 'Professional Engineering Certification',
      date: '2025',
      description: 'Focused on high-concurrency REST APIs, distributed microservices, OAuth 2.0 / JWT security, and relational database optimization.',
      credential_url: 'https://www.linkedin.com/in/saksham-pandey-184515250',
      media_url: '',
      published: true,
      display_order: 2
    },
    {
      id: 'cert_hackerrank_python',
      category: 'Certification',
      title: 'HackerRank Verified Gold Badge — Python & Algorithmic Problem Solving',
      issuer: 'HackerRank',
      date: '2025',
      description: 'Verified proficiency in Python programming, data structures, and algorithmic complexity analysis.',
      credential_url: 'https://github.com/sakshampandey380',
      media_url: '',
      published: true,
      display_order: 3
    }
  ],

  resumes: [
    {
      id: 'res_fullstack_main',
      title: 'Saksham Pandey — Full Stack Engineer Resume',
      target_role: 'Full Stack Engineer | React • TypeScript • Python (FastAPI) • Node.js • Distributed Systems',
      category: 'Full Stack Engineer',
      description: 'Official Full Stack Engineer curriculum vitae highlighting IIT Patna BS-MS in AI & Cybersecurity, 6+ production full-stack systems (99.8% uptime), AirScrib.ai, Viora Meet, ResumeAI Pro, and Multi-Agent AI Orchestration.',
      file_url: 'assets/resumes/Saksham_Pandey_Full_Stack_Engineer_Resume.pdf',
      file_name: 'Saksham_Pandey_Full_Stack_Engineer_Resume.pdf',
      file_size: '6 KB (PDF)',
      version: 'v2026.4',
      updated_at: '2026-11-01',
      featured: true,
      published: true,
      download_count: 0,
      display_order: 1
    },
    {
      id: 'res_frontend_main',
      title: 'Saksham Pandey — Frontend Engineer Resume',
      target_role: 'Frontend Engineer | React • Next.js • TypeScript • TanStack Query • Performance Optimization',
      category: 'Frontend Engineer',
      description: 'Targeted Frontend Engineering resume emphasizing React 18, Next.js (App Router, SSR/SSG), TypeScript, Tailwind CSS, TanStack Query, WebRTC/WebSockets, Core Web Vitals (96+ Lighthouse), and WCAG 2.1 AA accessibility.',
      file_url: 'assets/resumes/Saksham_Pandey_Frontend_Engineer_Resume.pdf',
      file_name: 'Saksham_Pandey_Frontend_Engineer_Resume.pdf',
      file_size: '6 KB (PDF)',
      version: 'v2026.4',
      updated_at: '2026-11-01',
      featured: false,
      published: true,
      download_count: 0,
      display_order: 2
    },
    {
      id: 'res_germany_eu_fullstack',
      title: 'Saksham Pandey — Full Stack & Distributed Systems Resume (EU / Germany Edition)',
      target_role: 'Full Stack Software Engineer | Distributed Systems & Web Platforms (EU Blue Card / Relocation Ready)',
      category: 'International / Distributed Systems',
      description: 'International & European market curriculum vitae tailored for distributed systems, cloud-native Docker/CI/CD workflows, WebRTC signaling, and high-throughput web platforms.',
      file_url: 'assets/resumes/Saksham_Pandey_Distributed_Systems_EU_Resume.pdf',
      file_name: 'Saksham_Pandey_Distributed_Systems_EU_Resume.pdf',
      file_size: '16 KB (PDF)',
      version: 'v2026.4',
      updated_at: '2026-11-01',
      featured: false,
      published: true,
      download_count: 0,
      display_order: 3
    },
    {
      id: 'res_backend_developer',
      title: 'Saksham Pandey — Backend Developer Resume (International / RU Edition)',
      target_role: 'Backend / Full-Stack Engineer | Python (FastAPI) • Node.js • PostgreSQL • MySQL • WebSockets',
      category: 'Backend Developer',
      description: 'Specialized Backend & Full-Stack Developer curriculum vitae (Russian/International edition) covering asynchronous API architecture, relational database optimization, RBAC security, and AI backend services.',
      file_url: 'assets/resumes/Saksham_Pandey_Backend_Developer_RU_Resume.pdf',
      file_name: 'Saksham_Pandey_Backend_Developer_RU_Resume.pdf',
      file_size: '254 KB (PDF)',
      version: 'v2026.4',
      updated_at: '2026-11-01',
      featured: false,
      published: true,
      download_count: 0,
      display_order: 4
    }
  ],

  social_links: [
    {
      id: 'soc_github',
      platform: 'GitHub',
      label: 'github.com/sakshampandey380',
      url: 'https://github.com/sakshampandey380',
      icon: 'GH',
      published: true,
      display_order: 1
    },
    {
      id: 'soc_linkedin',
      platform: 'LinkedIn',
      label: 'linkedin.com/in/saksham-pandey-184515250',
      url: 'https://www.linkedin.com/in/saksham-pandey-184515250',
      icon: 'IN',
      published: true,
      display_order: 2
    },
    {
      id: 'soc_x',
      platform: 'X (Twitter)',
      label: 'x.com/PandeySaks42860',
      url: 'https://x.com/PandeySaks42860',
      icon: 'X',
      published: true,
      display_order: 3
    },
    {
      id: 'soc_whatsapp',
      platform: 'WhatsApp',
      label: '+91 9546748859',
      url: 'https://wa.me/919546748859',
      icon: 'WA',
      published: true,
      display_order: 4
    },
    {
      id: 'soc_email',
      platform: 'Email',
      label: 'pandeysaksham180@gmail.com',
      url: 'mailto:pandeysaksham180@gmail.com',
      icon: '@',
      published: true,
      display_order: 5
    },
    {
      id: 'soc_instagram',
      platform: 'Instagram',
      label: '@444_nexvora',
      url: 'https://www.instagram.com/444_nexvora',
      icon: 'IG',
      published: true,
      display_order: 6
    }
  ],

  contact_settings: {
    id: 'contact_main',
    heading: 'Let’s Architect Your Next Flagship System',
    subheading: 'Connect directly with Saksham Pandey (Founder & CEO, NexVora Technologies) for full-stack engineering roles, AI automation, ERP/CRM software, or enterprise consulting.',
    recipient_email: 'pandeysaksham180@gmail.com',
    phone_display: '+91 9546748859',
    response_time_note: 'Direct Response Window: Within 24 hours (Ranchi, Jharkhand, India · IST / UTC+5:30)',
    consent_text: 'By submitting this inquiry, you consent to sharing your contact details with Saksham Pandey / NexVora Technologies for professional communication.',
    project_types: [
      'AI Automation & Intelligent Workflows',
      'Mobile & Website Development (Full-Stack)',
      'ERP, CRM & Custom Management Software',
      'Digital Transformation & UI/UX Design',
      'Full-Time Software Engineering Role / Recruiter Inquiry'
    ],
    budget_ranges: [
      'Not Applicable (Recruiter / Full-Time Role Inquiry)',
      'Under $1,500 / Project Prototype',
      '$1,500 – $5,000 / Mid-Scale Solution',
      '$5,000 – $15,000 / Full-Stack Platform',
      '$15,000+ / Enterprise Scope'
    ]
  },

  whatsapp_settings: {
    id: 'wa_main',
    phone_number: '919546748859',
    is_configured_by_owner: true,
    default_greeting: 'Hello Saksham, I visited your NexVora Technologies portfolio and would like to connect regarding a project/opportunity.',
    show_floating_button: true,
    floating_label: 'Chat on WhatsApp'
  },

  theme_settings: {
    id: 'theme_main',
    default_theme: 'light',
    accent_color: '#F28C28',
    secondary_accent: '#1A75FF',
    enable_3d_effects: true,
    enable_opening_intro: true,
    enable_custom_cursor: true
  },

  navigation_settings: {
    id: 'nav_main',
    cta_label: 'Let’s Talk',
    cta_target: 'contact.html',
    sections: [
      { id: 'home', label: 'Home', url: 'index.html', visible: true, order: 1 },
      { id: 'about', label: 'About & Services', url: 'about.html', visible: true, order: 2 },
      { id: 'projects', label: 'Projects & CV', url: 'projects.html', visible: true, order: 3 },
      { id: 'contact', label: 'Contact', url: 'contact.html', visible: true, order: 4 }
    ]
  },

  seo_settings: {
    id: 'seo_main',
    site_title: 'Saksham Pandey — Founder & CEO, NexVora Technologies | Full Stack Engineer',
    meta_description: 'Official portfolio of Saksham Pandey, Founder & CEO at NexVora Technologies (Ranchi, India). Full Stack Engineer specializing in React, TypeScript, Python, FastAPI, Node.js, AI Automation, and ERP/CRM Solutions.',
    og_title: 'Saksham Pandey | NexVora Technologies — Empowering the Future Through Technology',
    og_description: 'Explore 3D interactive architectures, AI automation systems, full-stack case studies, and verified contact channels for Saksham Pandey.',
    og_image: 'assets/images/nexvora-card.jpg',
    canonical_url: 'https://nexvora.dev/'
  },

  site_settings: {
    id: 'site_main',
    footer_tagline: 'Empowering the Future Through Technology — AI Automation, Digital Transformation, Management Software, Mobile & Web Development, UI/UX Design, and ERP & CRM Solutions.',
    footer_attribution: 'Designed and developed by Saksham Pandey.',
    privacy_notice: 'Privacy Notice: Contact submissions and WhatsApp messages are used strictly for direct professional communication with Saksham Pandey / NexVora Technologies.',
    copyright_holder: 'Saksham Pandey · NexVora Technologies'
  },

  media_library: [
    {
      id: 'med_profile',
      name: 'Saksham Pandey — Official Executive Portrait',
      url: 'assets/images/saksham-profile.png',
      mime_type: 'image/png',
      size_label: 'Portrait PNG',
      created_at: '2026-10-23'
    },
    {
      id: 'med_card',
      name: 'NexVora Technologies Official Business Card',
      url: 'assets/images/nexvora-card.jpg',
      mime_type: 'image/jpeg',
      size_label: 'Brand Card JPG',
      created_at: '2026-10-23'
    },
    {
      id: 'med_1',
      name: 'NEXVORA Distributed Workflow Cover',
      url: 'assets/images/project-nexvora-mesh.svg',
      mime_type: 'image/svg+xml',
      size_label: '4 KB',
      created_at: '2026-10-23'
    },
    {
      id: 'med_2',
      name: 'Synapse AI RAG Architecture Cover',
      url: 'assets/images/project-synapse-ai.svg',
      mime_type: 'image/svg+xml',
      size_label: '4 KB',
      created_at: '2026-10-23'
    }
  ],

  contact_messages: []
};


/* === MODULE: js/services/api.js === */
/**
 * ==========================================================================
 * SUPABASE REST API SERVICE — ZERO-FRAMEWORK FETCH CLIENT
 * ==========================================================================
 * Communicates with Supabase PostgREST, GoTrue Auth, and Storage endpoints
 * using native browser fetch().
 *
 * Never stores or uses service_role secret keys on the client.
 * Write security is enforced by Supabase PostgreSQL Row-Level Security (RLS)
 * policies verifying the authenticated administrator's JWT Bearer token.
 */

const CONNECTION_CONFIG_KEY = 'nexvora_supabase_connection_v1';
class ApiService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    // 1. Check runtime global config if provided
    if (window.__PORTFOLIO_CONFIG__ && window.__PORTFOLIO_CONFIG__.supabaseUrl && window.__PORTFOLIO_CONFIG__.supabaseAnonKey) {
      return {
        supabaseUrl: window.__PORTFOLIO_CONFIG__.supabaseUrl.replace(/\/+$/, ''),
        supabaseAnonKey: window.__PORTFOLIO_CONFIG__.supabaseAnonKey.trim(),
        storageBucketResumes: window.__PORTFOLIO_CONFIG__.storageBucketResumes || 'resumes',
        storageBucketMedia: window.__PORTFOLIO_CONFIG__.storageBucketMedia || 'portfolio-media'
      };
    }

    // 2. Check configured connection from Admin -> Backend Connection settings
    try {
      const saved = localStorage.getItem(CONNECTION_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
          return {
            supabaseUrl: parsed.supabaseUrl.replace(/\/+$/, ''),
            supabaseAnonKey: parsed.supabaseAnonKey.trim(),
            storageBucketResumes: parsed.storageBucketResumes || 'resumes',
            storageBucketMedia: parsed.storageBucketMedia || 'portfolio-media'
          };
        }
      }
    } catch {
      // Ignore storage read error
    }

    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storageBucketResumes: 'resumes',
      storageBucketMedia: 'portfolio-media'
    };
  }

  saveConfig({ supabaseUrl, supabaseAnonKey, storageBucketResumes = 'resumes', storageBucketMedia = 'portfolio-media' }) {
    const clean = {
      supabaseUrl: (supabaseUrl || '').trim().replace(/\/+$/, ''),
      supabaseAnonKey: (supabaseAnonKey || '').trim(),
      storageBucketResumes: (storageBucketResumes || 'resumes').trim(),
      storageBucketMedia: (storageBucketMedia || 'portfolio-media').trim()
    };
    localStorage.setItem(CONNECTION_CONFIG_KEY, JSON.stringify(clean));
    this.config = clean;
    return clean;
  }

  clearConfig() {
    localStorage.removeItem(CONNECTION_CONFIG_KEY);
    this.config = {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storageBucketResumes: 'resumes',
      storageBucketMedia: 'portfolio-media'
    };
  }

  isConfigured() {
    return Boolean(
      this.config.supabaseUrl &&
      this.config.supabaseAnonKey &&
      this.config.supabaseUrl.startsWith('https://')
    );
  }

  getHeaders(accessToken = null, extraHeaders = {}) {
    const headers = {
      apikey: this.config.supabaseAnonKey,
      Authorization: `Bearer ${accessToken || this.config.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    return headers;
  }

  /**
   * Queries or mutates the unified `portfolio_state` KV document table or
   * individual relational tables in Supabase.
   */
  async request(path, { method = 'GET', body = null, accessToken = null, headers = {} } = {}) {
    if (!this.isConfigured()) {
      throw new Error('Supabase backend is not configured. Operating in Local Preview Mode.');
    }

    const url = `${this.config.supabaseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(accessToken, headers),
      body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
      let errMessage = `Backend request failed (${response.status})`;
      try {
        const errJson = await response.json();
        errMessage = errJson.message || errJson.error_description || errJson.hint || errMessage;
      } catch {
        // Fallback to status text
      }
      const error = new Error(errMessage);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
const apiService = new ApiService();


/* === MODULE: js/services/auth.js === */
/**
 * ==========================================================================
 * AUTHENTICATION & SESSION SERVICE
 * ==========================================================================
 * Enforces real Supabase GoTrue JWT authentication when connected to a
 * Supabase project.
 *
 * When Supabase credentials have not yet been configured, provides an
 * explicitly labeled "Local Preview Sandbox Session" so the owner can
 * inspect and test all 20 CMS modules locally prior to cloud deployment.
 */

const SESSION_STORAGE_KEY = 'nexvora_admin_session_v1';
const OWNER_CREDENTIALS_KEY = 'nexvora_owner_auth_v1';
const DEFAULT_OWNER_EMAILS = ['pandeysaksham180@gmail.com', 'saksham@nexvora.dev'];
const DEFAULT_OWNER_PASSWORD = 'NexVora@Saksham2026!';
class AuthService {
  getOwnerConfig() {
    try {
      const raw = localStorage.getItem(OWNER_CREDENTIALS_KEY);
      if (!raw) {
        return {
          allowedEmails: DEFAULT_OWNER_EMAILS,
          password: DEFAULT_OWNER_PASSWORD
        };
      }
      const parsed = JSON.parse(raw);
      return {
        allowedEmails: Array.isArray(parsed.allowedEmails) && parsed.allowedEmails.length
          ? parsed.allowedEmails
          : DEFAULT_OWNER_EMAILS,
        password: parsed.password || DEFAULT_OWNER_PASSWORD
      };
    } catch {
      return {
        allowedEmails: DEFAULT_OWNER_EMAILS,
        password: DEFAULT_OWNER_PASSWORD
      };
    }
  }

  verifyOwnerCredentials(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');
    const cfg = this.getOwnerConfig();
    const emailAllowed = cfg.allowedEmails.some((e) => e.toLowerCase() === normalizedEmail);
    return emailAllowed && rawPassword === cfg.password;
  }

  getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);

      // Check token expiration
      if (session.expires_at && Date.now() > session.expires_at) {
        this.clearSession();
        return null;
      }

      // If Supabase was configured after a preview session started, invalidate preview session
      if (apiService.isConfigured() && session.mode === 'local-preview') {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  saveSession(sessionData) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  }

  clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  isAuthenticated() {
    return Boolean(this.getSession());
  }

  getAccessToken() {
    const session = this.getSession();
    return session ? session.access_token : null;
  }

  /**
   * Unified administrator sign-in requiring valid Owner ID (Email) & Password.
   * Uses Supabase GoTrue when configured, or strict Owner Credential verification.
   */
  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both your Administrator ID (Email) and Password.');
    }

    if (apiService.isConfigured()) {
      return await this.signInWithSupabase(email, password);
    }

    if (!this.verifyOwnerCredentials(email, password)) {
      throw new Error('Access Denied: Invalid Administrator ID or Password.');
    }

    return this.startLocalPreviewSession(email.trim().toLowerCase());
  }

  /**
   * Authenticates with Supabase GoTrue using email + password.
   */
  async signInWithSupabase(email, password) {
    if (!apiService.isConfigured()) {
      throw new Error('Supabase URL and Anon Key are not configured yet.');
    }

    const data = await apiService.request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email, password }
    });

    if (!data || !data.access_token) {
      throw new Error('Authentication failed: No access token returned.');
    }

    const expiresInMs = (data.expires_in || 3600) * 1000;
    const session = {
      mode: 'supabase-live',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + expiresInMs,
      user: {
        id: data.user?.id || 'admin',
        email: data.user?.email || email,
        role: data.user?.role || 'authenticated'
      }
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Starts an authenticated Local Admin session when Supabase is not configured.
   */
  startLocalPreviewSession(adminEmail = 'pandeysaksham180@gmail.com') {
    if (apiService.isConfigured()) {
      throw new Error('Local Preview Mode is disabled when a Live Supabase Backend is configured. Please sign in with your Supabase Admin credentials.');
    }

    const session = {
      mode: 'local-preview',
      access_token: 'owner_authenticated_token',
      expires_at: Date.now() + 8 * 3600 * 1000, // 8 hours
      user: {
        id: 'nexvora_owner_admin',
        email: adminEmail || 'pandeysaksham180@gmail.com',
        role: 'owner_admin'
      }
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Updates password for the authenticated owner (persists locally or in Supabase).
   */
  async updatePassword(newPassword) {
    const session = this.getSession();
    if (!session) throw new Error('Your session has expired. Please sign in again.');
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const currentCfg = this.getOwnerConfig();
    localStorage.setItem(
      OWNER_CREDENTIALS_KEY,
      JSON.stringify({
        allowedEmails: currentCfg.allowedEmails,
        password: newPassword
      })
    );

    if (session.mode === 'supabase-live' && apiService.isConfigured()) {
      return await apiService.request('/auth/v1/user', {
        method: 'PUT',
        accessToken: session.access_token,
        body: { password: newPassword }
      });
    }

    return { updated: true, mode: 'owner-local' };
  }

  async signOut() {
    const session = this.getSession();
    if (session && session.mode === 'supabase-live' && apiService.isConfigured()) {
      try {
        await apiService.request('/auth/v1/logout', {
          method: 'POST',
          accessToken: session.access_token
        });
      } catch {
        // Proceed with local session cleanup even if network call fails
      }
    }
    this.clearSession();
  }
}
const authService = new AuthService();


/* === MODULE: js/services/storage.js === */
/**
 * ==========================================================================
 * STORAGE SERVICE — SUPABASE OBJECT STORAGE + INDEXEDDB PREVIEW STORE
 * ==========================================================================
 * Handles secure validation, upload, replacement, retrieval, and deletion
 * of Resume PDFs and Media Assets.
 *
 * Security Enforcement:
 * - Strict MIME type and file extension whitelisting (blocks executables,
 *   scripts, HTML, etc.)
 * - Strict file size limits (max 10 MB for PDFs, max 5 MB for images)
 * - Safe filename normalization
 */



const IDB_NAME = 'nexvora_media_blob_db_v1';
const IDB_STORE = 'files';

const ALLOWED_PDF_TYPES = ['application/pdf'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
class StorageService {
  constructor() {
    this.dbPromise = null;
    this.objectUrlCache = new Map();
  }

  openIndexedDB() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser.'));
        return;
      }
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  /**
   * Validates a file before upload.
   * @param {File} file
   * @param {'pdf'|'image'|'any'} category
   */
  validateFile(file, category = 'pdf') {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      throw new Error('No valid file selected.');
    }

    const fileName = (file.name || '').toLowerCase();
    const forbiddenExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.mjs', '.php', '.py', '.dll', '.msi', '.html', '.htm'];
    if (forbiddenExtensions.some((ext) => fileName.endsWith(ext))) {
      throw new Error('Security policy violation: Executable or script files are strictly prohibited.');
    }

    if (category === 'pdf') {
      const isPdfMime = ALLOWED_PDF_TYPES.includes(file.type);
      const isPdfExt = fileName.endsWith('.pdf');
      if (!isPdfMime || !isPdfExt) {
        throw new Error('Invalid file format. Only valid PDF documents (.pdf) are allowed for resumes.');
      }
      if (file.size > MAX_PDF_BYTES) {
        throw new Error(`PDF exceeds the maximum allowed size of 10 MB (Selected: ${this.formatBytes(file.size)}).`);
      }
    } else if (category === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Invalid image format. Allowed formats: PNG, JPG, WebP, SVG, GIF.');
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`Image exceeds the maximum allowed size of 5 MB (Selected: ${this.formatBytes(file.size)}).`);
      }
    } else {
      const allowedAll = [...ALLOWED_PDF_TYPES, ...ALLOWED_IMAGE_TYPES];
      if (!allowedAll.includes(file.type)) {
        throw new Error('Unsupported file type. Only PDF documents and standard web images are permitted.');
      }
      if (file.size > MAX_PDF_BYTES) {
        throw new Error('File exceeds the 10 MB maximum upload limit.');
      }
    }

    return true;
  }

  formatBytes(bytes = 0) {
    if (!bytes || bytes <= 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  sanitizeFileName(originalName = 'document.pdf') {
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase().replace(/[^a-z0-9]/g, '') : 'pdf';
    const base = slugify(parts.join('.'));
    return `${base}.${ext}`;
  }

  /**
   * Uploads a file to Supabase Storage (when configured) or IndexedDB (in Local Preview Mode).
   * Supports an optional progress callback.
   */
  async uploadFile(file, { category = 'pdf', onProgress = null, existingStorageId = null } = {}) {
    this.validateFile(file, category);

    if (typeof onProgress === 'function') onProgress(15);

    const safeName = this.sanitizeFileName(file.name || 'document.pdf');
    const storageKey = existingStorageId || `${category}_${uid('blob')}_${safeName}`;

    // 1. Live Supabase Storage Upload
    if (apiService.isConfigured()) {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Unauthorized: Please sign in as administrator to upload files.');
      }

      const bucket = category === 'pdf'
        ? apiService.config.storageBucketResumes
        : apiService.config.storageBucketMedia;

      const uploadUrl = `${apiService.config.supabaseUrl}/storage/v1/object/${bucket}/${storageKey}`;
      if (typeof onProgress === 'function') onProgress(45);

      const response = await fetch(uploadUrl, {
        method: existingStorageId ? 'PUT' : 'POST',
        headers: {
          apikey: apiService.config.supabaseAnonKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`Supabase Storage upload failed (${response.status}). Verify bucket "${bucket}" and RLS policies.`);
      }

      if (typeof onProgress === 'function') onProgress(100);
      const publicUrl = `${apiService.config.supabaseUrl}/storage/v1/object/public/${bucket}/${storageKey}`;

      return {
        storage_id: storageKey,
        file_url: publicUrl,
        file_name: safeName,
        file_size: this.formatBytes(file.size),
        mime_type: file.type
      };
    }

    // 2. Local Preview Mode — Persist binary File/Blob in IndexedDB
    if (typeof onProgress === 'function') onProgress(50);
    const db = await this.openIndexedDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({
        id: storageKey,
        blob: file,
        file_name: safeName,
        mime_type: file.type,
        size: file.size,
        updated_at: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (typeof onProgress === 'function') onProgress(100);

    return {
      storage_id: storageKey,
      file_url: `idb://${storageKey}`,
      file_name: safeName,
      file_size: this.formatBytes(file.size),
      mime_type: file.type
    };
  }

  /**
   * Resolves a stored file URL (handling `idb://` local preview blobs or regular URLs).
   */
  async resolveFileUrl(fileUrl) {
    if (!fileUrl) return '';
    if (!fileUrl.startsWith('idb://')) {
      return fileUrl;
    }

    const storageKey = fileUrl.replace('idb://', '');
    if (this.objectUrlCache.has(storageKey)) {
      return this.objectUrlCache.get(storageKey);
    }

    try {
      const db = await this.openIndexedDB();
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(storageKey);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (record && record.blob) {
        const objUrl = URL.createObjectURL(record.blob);
        this.objectUrlCache.set(storageKey, objUrl);
        return objUrl;
      }
    } catch {
      // Fallback to sample PDF if IDB read fails
    }

    return 'assets/resumes/Saksham_Pandey_Full_Stack_Resume_Sample.pdf';
  }

  /**
   * Deletes a file from Supabase Storage or IndexedDB.
   */
  async deleteFile(fileUrl, category = 'pdf') {
    if (!fileUrl) return;

    if (fileUrl.startsWith('idb://')) {
      const storageKey = fileUrl.replace('idb://', '');
      if (this.objectUrlCache.has(storageKey)) {
        URL.revokeObjectURL(this.objectUrlCache.get(storageKey));
        this.objectUrlCache.delete(storageKey);
      }
      try {
        const db = await this.openIndexedDB();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).delete(storageKey);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
        // Ignore cleanup error
      }
      return;
    }

    if (apiService.isConfigured() && fileUrl.includes('/storage/v1/object/public/')) {
      const token = authService.getAccessToken();
      if (!token) return;
      const bucket = category === 'pdf'
        ? apiService.config.storageBucketResumes
        : apiService.config.storageBucketMedia;
      const parts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
      if (parts[1]) {
        const delUrl = `${apiService.config.supabaseUrl}/storage/v1/object/${bucket}/${parts[1]}`;
        await fetch(delUrl, {
          method: 'DELETE',
          headers: {
            apikey: apiService.config.supabaseAnonKey,
            Authorization: `Bearer ${token}`
          }
        }).catch(() => {});
      }
    }
  }
}
const storageService = new StorageService();


/* === MODULE: js/data/repository.js === */
/**
 * ==========================================================================
 * UNIFIED DATA REPOSITORY — LIVE PERSISTENCE & PUBLIC/DRAFT ISOLATION
 * ==========================================================================
 * Single source of truth for both the Public Portfolio and the Private
 * Admin CMS (/admin/).
 *
 * Features:
 * - Syncs with Supabase PostgreSQL REST API when configured
 * - Provides full Local Preview persistence when Supabase is not yet connected
 * - Strictly filters out unpublished/draft items for public visitors
 * - Broadcasts real-time updates across tabs via BroadcastChannel
 * - Maintains rollback snapshots for safe content editing
 */




const REPO_STORAGE_KEY = 'nexvora_portfolio_repository_v4';
const SNAPSHOTS_STORAGE_KEY = 'nexvora_portfolio_snapshots_v4';
const SYNC_CHANNEL_NAME = 'nexvora_cms_live_sync';
class PortfolioRepository {
  constructor() {
    this.state = null;
    this.listeners = new Set();
    this.channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(SYNC_CHANNEL_NAME)
      : null;

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          this.state = this.loadLocalState();
          this.notifyListeners();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === REPO_STORAGE_KEY) {
        this.state = this.loadLocalState();
        this.notifyListeners();
      }
    });
  }

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  loadLocalState() {
    try {
      const raw = localStorage.getItem(REPO_STORAGE_KEY);
      if (!raw) {
        const seeded = this.deepClone(SEED_DATA);
        localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      // Merge any missing top-level keys from SEED_DATA for forward compatibility
      return {
        ...this.deepClone(SEED_DATA),
        ...parsed
      };
    } catch {
      return this.deepClone(SEED_DATA);
    }
  }

  /**
   * Initializes repository from Supabase (if configured) or Local Preview store.
   */
  async init() {
    if (apiService.isConfigured()) {
      try {
        const rows = await apiService.request('/rest/v1/portfolio_state?id=eq.main&select=payload,updated_at');
        if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
          this.state = {
            ...this.deepClone(SEED_DATA),
            ...rows[0].payload
          };
          localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
          return this.state;
        }
      } catch (err) {
        console.warn('Supabase read fallback to cached state:', err.message);
      }
    }

    this.state = this.loadLocalState();
    return this.state;
  }

  /**
   * Returns ONLY published content safe for public visitors.
   * Unpublished drafts and private contact messages are stripped.
   */
  getPublicData() {
    if (!this.state) {
      this.state = this.loadLocalState();
    }
    const raw = this.deepClone(this.state);
    const sortByOrder = (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999);

    return {
      profile: raw.profile,
      hero: raw.hero,
      about: raw.about,
      skills: (raw.skills || []).filter((i) => i.published !== false).sort(sortByOrder),
      experiences: (raw.experiences || []).filter((i) => i.published !== false).sort(sortByOrder),
      education: (raw.education || []).filter((i) => i.published !== false).sort(sortByOrder),
      projects: (raw.projects || []).filter((i) => i.published !== false).sort(sortByOrder),
      achievements: (raw.achievements || []).filter((i) => i.published !== false).sort(sortByOrder),
      certifications: (raw.certifications || []).filter((i) => i.published !== false).sort(sortByOrder),
      resumes: (raw.resumes || []).filter((i) => i.published !== false).sort(sortByOrder),
      social_links: (raw.social_links || []).filter((i) => i.published !== false).sort(sortByOrder),
      contact_settings: raw.contact_settings,
      whatsapp_settings: raw.whatsapp_settings,
      theme_settings: raw.theme_settings,
      navigation_settings: raw.navigation_settings,
      seo_settings: raw.seo_settings,
      site_settings: raw.site_settings
    };
  }

  /**
   * Returns complete data (including drafts, media library, and contact inbox)
   * strictly for authenticated administrators.
   */
  getAdminData() {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized access: Admin session required.');
    }
    if (!this.state) {
      this.state = this.loadLocalState();
    }
    return this.deepClone(this.state);
  }

  /**
   * Saves a rollback snapshot before mutating state.
   */
  saveSnapshot(label = 'Auto-Backup before edit') {
    try {
      const current = this.state || this.loadLocalState();
      const rawHistory = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      history.unshift({
        id: uid('snap'),
        label,
        timestamp: new Date().toISOString(),
        state: current
      });
      // Keep last 8 snapshots
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(history.slice(0, 8)));
    } catch {
      // Ignore quota limits on snapshots
    }
  }

  getSnapshots() {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async restoreSnapshot(snapshotId) {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized: Admin authentication required.');
    }
    const snapshots = this.getSnapshots();
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target || !target.state) {
      throw new Error('Snapshot not found.');
    }
    return await this.persistFullState(target.state, `Restored snapshot (${target.label})`);
  }

  /**
   * Persists full state to Supabase (if configured) and local cache.
   */
  async persistFullState(newState, actionLabel = 'Updated content') {
    if (!authService.isAuthenticated()) {
      throw new Error('Unauthorized: Please log in as administrator to save changes.');
    }

    this.saveSnapshot(actionLabel);

    // If connected to Live Supabase, persist to remote database first and wait for confirmation
    if (apiService.isConfigured()) {
      const token = authService.getAccessToken();
      await apiService.request('/rest/v1/portfolio_state', {
        method: 'POST',
        accessToken: token,
        headers: {
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: {
          id: 'main',
          payload: newState,
          updated_at: new Date().toISOString()
        }
      });
    }

    this.state = this.deepClone(newState);
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));

    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
    this.notifyListeners();
    return this.state;
  }

  /**
   * Updates a singleton section (e.g., profile, hero, about, whatsapp_settings, etc.)
   */
  async updateSingleton(sectionKey, payload) {
    const current = this.getAdminData();
    current[sectionKey] = {
      ...(current[sectionKey] || {}),
      ...payload,
      updated_at: new Date().toISOString()
    };
    await this.persistFullState(current, `Updated ${sectionKey}`);
    return current[sectionKey];
  }

  /**
   * Creates or updates an item in a collection (projects, skills, resumes, experiences, etc.)
   */
  async upsertCollectionItem(collectionKey, item) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? [...current[collectionKey]] : [];

    const now = new Date().toISOString().split('T')[0];
    if (item.id) {
      const idx = list.findIndex((x) => x.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item, updated_at: now };
      } else {
        list.push({ ...item, updated_at: now });
      }
    } else {
      const newItem = {
        ...item,
        id: uid(collectionKey.slice(0, 4)),
        display_order: Number(item.display_order) || list.length + 1,
        published: item.published !== undefined ? Boolean(item.published) : true,
        updated_at: now
      };
      list.push(newItem);
    }

    current[collectionKey] = list;
    await this.persistFullState(current, `Saved item in ${collectionKey}`);
    return current[collectionKey];
  }

  /**
   * Deletes an item from a collection by ID.
   */
  async deleteCollectionItem(collectionKey, itemId) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? current[collectionKey] : [];
    current[collectionKey] = list.filter((x) => x.id !== itemId);
    await this.persistFullState(current, `Deleted item from ${collectionKey}`);
    return current[collectionKey];
  }

  /**
   * Toggles published / draft visibility of an item.
   */
  async togglePublishItem(collectionKey, itemId) {
    const current = this.getAdminData();
    const list = Array.isArray(current[collectionKey]) ? current[collectionKey] : [];
    const target = list.find((x) => x.id === itemId);
    if (!target) throw new Error('Item not found.');
    target.published = !target.published;
    await this.persistFullState(current, `Toggled visibility in ${collectionKey}`);
    return target;
  }

  /**
   * Moves an item up or down in display_order.
   */
  async reorderCollectionItem(collectionKey, itemId, direction = 'up') {
    const current = this.getAdminData();
    const list = (current[collectionKey] || []).sort(
      (a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999)
    );
    const idx = list.findIndex((x) => x.id === itemId);
    if (idx === -1) return list;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return list;

    const temp = list[idx];
    list[idx] = list[swapIdx];
    list[swapIdx] = temp;

    list.forEach((item, index) => {
      item.display_order = index + 1;
    });

    current[collectionKey] = list;
    await this.persistFullState(current, `Reordered ${collectionKey}`);
    return list;
  }

  /**
   * Increments resume download count (publicly allowed analytics counter).
   */
  async incrementResumeDownload(resumeId) {
    if (!this.state) this.state = this.loadLocalState();
    const resumes = this.state.resumes || [];
    const target = resumes.find((r) => r.id === resumeId);
    if (target) {
      target.download_count = (Number(target.download_count) || 0) + 1;
      localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
      if (this.channel) {
        this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      }
    }
    return target ? target.download_count : 0;
  }

  /**
   * Saves a visitor contact message (public submission with basic rate limit check).
   */
  async submitContactMessage(payload) {
    const lastSubmit = Number(sessionStorage.getItem('nexvora_last_contact_ts') || 0);
    if (Date.now() - lastSubmit < 8000) {
      throw new Error('Please wait a few seconds before submitting another message.');
    }

    if (!this.state) this.state = this.loadLocalState();
    const msgRecord = {
      id: uid('msg'),
      name: String(payload.name || '').trim().slice(0, 120),
      email: String(payload.email || '').trim().slice(0, 160),
      subject: String(payload.subject || '').trim().slice(0, 200),
      budget: String(payload.budget || '').trim().slice(0, 100),
      deadline: String(payload.deadline || '').trim().slice(0, 100),
      message: String(payload.message || '').trim().slice(0, 3000),
      created_at: new Date().toISOString(),
      status: 'unread'
    };

    if (apiService.isConfigured()) {
      await apiService.request('/rest/v1/contact_messages', {
        method: 'POST',
        body: msgRecord
      }).catch(() => {});
    }

    if (!Array.isArray(this.state.contact_messages)) {
      this.state.contact_messages = [];
    }
    this.state.contact_messages.unshift(msgRecord);
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(this.state));
    sessionStorage.setItem('nexvora_last_contact_ts', String(Date.now()));

    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
    return msgRecord;
  }

  /**
   * Resets repository to initial starter seed data.
   */
  async resetToSeedData() {
    const seeded = this.deepClone(SEED_DATA);
    return await this.persistFullState(seeded, 'Reset to Starter Seed Data');
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.getPublicData());
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }
}
const repository = new PortfolioRepository();


/* === MODULE: js/theme.js === */
/**
 * ==========================================================================
 * THEME, DESIGN TOKENS & CUSTOM DESKTOP CURSOR CONTROLLER
 * ==========================================================================
 */

const USER_THEME_PREF_KEY = 'nexvora_user_theme_pref';
class ThemeController {
  constructor() {
    this.currentTheme = 'light';
    this.cursorInitialized = false;
  }

  init(themeSettings = {}) {
    const savedPref = localStorage.getItem(USER_THEME_PREF_KEY);
    const defaultTheme = themeSettings.default_theme || 'light';
    this.setTheme(savedPref || defaultTheme, false);

    if (themeSettings.accent_color) {
      document.documentElement.style.setProperty('--accent-primary', themeSettings.accent_color);
    }
    if (themeSettings.secondary_accent) {
      document.documentElement.style.setProperty('--accent-secondary', themeSettings.secondary_accent);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', () => {
        const next = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(next, true);
      });
    }

    if (themeSettings.enable_custom_cursor !== false) {
      this.initCustomCursor();
    }
  }

  setTheme(themeName, persistUserChoice = true) {
    this.currentTheme = themeName === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    if (persistUserChoice) {
      localStorage.setItem(USER_THEME_PREF_KEY, this.currentTheme);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      const isDark = this.currentTheme === 'dark';
      toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.innerHTML = isDark
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  initCustomCursor() {
    if (this.cursorInitialized) return;
    if (window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    this.cursorInitialized = true;

    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-active');
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, select, textarea, .card-3d')) {
        cursor.classList.add('is-hovering');
      } else {
        cursor.classList.remove('is-hovering');
      }
    }, { passive: true });
  }
}
const themeController = new ThemeController();


/* === MODULE: admin/js/dashboard.js === */
/**
 * ==========================================================================
 * ADMIN MODULE 1 — DASHBOARD OVERVIEW, SNAPSHOTS & BACKUP EXPORT/IMPORT
 * ==========================================================================
 */
function renderDashboardOverview(container, state, switchModule) {
  const projects = state.projects || [];
  const publishedProjects = projects.filter((p) => p.published !== false).length;
  const resumes = state.resumes || [];
  const publishedResumes = resumes.filter((r) => r.published !== false).length;
  const totalDownloads = resumes.reduce((acc, r) => acc + (Number(r.download_count) || 0), 0);
  const skills = state.skills || [];
  const messages = state.contact_messages || [];
  const snapshots = repository.getSnapshots();

  const isCloud = apiService.isConfigured();

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__label">Projects Showcase</span>
        <span class="stat-card__value">${publishedProjects} <span style="font-size:0.95rem;color:var(--text-muted);font-weight:400;">/ ${projects.length}</span></span>
        <span class="stat-card__meta">${projects.length - publishedProjects} Draft(s) hidden from public</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Active CV / Resumes</span>
        <span class="stat-card__value">${publishedResumes} <span style="font-size:0.95rem;color:var(--text-muted);font-weight:400;">/ ${resumes.length}</span></span>
        <span class="stat-card__meta">${totalDownloads} total PDF download(s)</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Technical Skills</span>
        <span class="stat-card__value">${skills.filter((s) => s.published !== false).length}</span>
        <span class="stat-card__meta">Across 8 engineering categories</span>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Persistence Mode</span>
        <span class="stat-card__value" style="font-size:1.25rem;color:${isCloud ? 'var(--status-success)' : 'var(--accent-primary)'};">
          ${isCloud ? 'Supabase Cloud' : 'Local Preview'}
        </span>
        <span class="stat-card__meta">${isCloud ? 'RLS & JWT Enforced' : 'Browser Sandbox Active'}</span>
      </div>
    </div>

    <div class="form-row" style="align-items:start;">
      <!-- Quick Module Launchers -->
      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h3 style="font-size:1.1rem;">Quick Studio Actions</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">Jump directly to frequent content management tasks.</p>
          </div>
        </div>
        <div class="admin-panel__body" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <button type="button" class="btn btn--primary btn--sm" data-goto-mod="projects">+ Manage Projects</button>
          <button type="button" class="btn btn--primary btn--sm" data-goto-mod="resumes">+ Upload / Replace CV</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="profile">Edit Profile Identity</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="skills">Edit Skill Constellation</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="whatsapp">Configure WhatsApp</button>
          <button type="button" class="btn btn--secondary btn--sm" data-goto-mod="security">Backend &amp; Security</button>
        </div>
      </section>

      <!-- Portable JSON Backup & Restore -->
      <section class="admin-panel">
        <div class="admin-panel__header">
          <div>
            <h3 style="font-size:1.1rem;">Portable Content Snapshot (JSON)</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin:0;">Export your entire portfolio database or import a backup file.</p>
          </div>
        </div>
        <div class="admin-panel__body" style="display:flex;flex-direction:column;gap:0.85rem;">
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button type="button" id="exportPortfolioJsonBtn" class="btn btn--secondary btn--sm">
              Export Full JSON Backup ↓
            </button>
            <label class="btn btn--secondary btn--sm" style="cursor:pointer;">
              Import JSON Backup ↑
              <input type="file" id="importPortfolioJsonInput" accept="application/json,.json" style="display:none;" />
            </label>
          </div>
          <p style="font-size:0.78rem;color:var(--text-muted);margin:0;">
            Every save also creates an automatic rollback checkpoint below.
          </p>
        </div>
      </section>
    </div>

    <!-- Rollback History & Recent Contact Inquiries -->
    <div class="form-row" style="align-items:start;">
      <section class="admin-panel">
        <div class="admin-panel__header">
          <h3 style="font-size:1.05rem;">Recent Contact Inquiries (${messages.length})</h3>
          <button type="button" class="btn btn--ghost btn--sm" data-goto-mod="contact">Open Inbox →</button>
        </div>
        <div class="admin-panel__body">
          ${
            messages.length === 0
              ? `<p style="font-size:0.85rem;color:var(--text-muted);">No visitor messages received yet.</p>`
              : `<div style="display:flex;flex-direction:column;gap:0.75rem;">
                  ${messages
                    .slice(0, 4)
                    .map(
                      (m) => `
                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                      <div style="display:flex;justify-content:space-between;font-size:0.8rem;">
                        <strong>${escapeHtml(m.name)}</strong>
                        <span class="mono" style="color:var(--text-muted);">${escapeHtml(formatDate(m.created_at))}</span>
                      </div>
                      <div style="font-size:0.78rem;color:var(--accent-primary);">${escapeHtml(m.subject || 'Inquiry')}</div>
                      <p style="font-size:0.82rem;margin-top:0.25rem;">${escapeHtml(m.message)}</p>
                    </div>`
                    )
                    .join('')}
                 </div>`
          }
        </div>
      </section>

      <section class="admin-panel">
        <div class="admin-panel__header">
          <h3 style="font-size:1.05rem;">Rollback Checkpoints (${snapshots.length})</h3>
        </div>
        <div class="admin-panel__body">
          ${
            snapshots.length === 0
              ? `<p style="font-size:0.85rem;color:var(--text-muted);">Checkpoints appear automatically as you edit and save content.</p>`
              : `<div style="display:flex;flex-direction:column;gap:0.6rem;">
                  ${snapshots
                    .slice(0, 5)
                    .map(
                      (s) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.65rem 0.85rem;background:var(--bg-secondary);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                      <div>
                        <strong style="font-size:0.82rem;display:block;">${escapeHtml(s.label)}</strong>
                        <span class="mono" style="font-size:0.7rem;color:var(--text-muted);">${new Date(s.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <button type="button" class="btn btn--secondary btn--sm" data-restore-snap="${escapeHtml(s.id)}">
                        Restore ↺
                      </button>
                    </div>`
                    )
                    .join('')}
                 </div>`
          }
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-goto-mod]').forEach((btn) => {
    btn.addEventListener('click', () => switchModule(btn.getAttribute('data-goto-mod')));
  });

  container.querySelectorAll('[data-restore-snap]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const snapId = btn.getAttribute('data-restore-snap');
      try {
        await repository.restoreSnapshot(snapId);
        showToast('Checkpoint restored and published!', 'success');
        switchModule('overview');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  const exportBtn = document.getElementById('exportPortfolioJsonBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const jsonStr = JSON.stringify(repository.getAdminData(), null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexvora_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported portfolio JSON backup', 'success');
    });
  }

  const importInput = document.getElementById('importPortfolioJsonInput');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed.profile || !Array.isArray(parsed.projects)) {
          throw new Error('Invalid backup JSON schema.');
        }
        await repository.persistFullState(parsed, 'Imported JSON Backup');
        showToast('Backup imported and synchronized!', 'success');
        switchModule('overview');
      } catch (err) {
        showToast(`Import failed: ${err.message}`, 'error');
      }
    });
  }
}


/* === MODULE: admin/js/content-editor.js === */
/**
 * ==========================================================================
 * ADMIN CONTENT EDITOR — PROFILE, HERO, ABOUT & COLLECTION CRUD MANAGERS
 * ==========================================================================
 * Handles Modules 2, 3, 4, 5, 6, 7, 8, 9, 10, and 12 with full validation,
 * search filtering, reordering, draft/publish toggling, and modal editing.
 */


/* --------------------------------------------------------------------------
   MODULE 2: PROFILE & PERSONAL INFORMATION
   -------------------------------------------------------------------------- */
function renderProfileModule(container, state, onDirtyChange) {
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
function renderHeroModule(container, state, onDirtyChange) {
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
function renderAboutModule(container, state, onDirtyChange) {
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
function renderCollectionModule(container, collectionKey, state, refreshView, confirmDelete) {
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


/* === MODULE: admin/js/resume-manager.js === */
/**
 * ==========================================================================
 * ADMIN MODULE 11 (MULTIPLE RESUMES MANAGER) & MODULE 18 (MEDIA LIBRARY)
 * ==========================================================================
 * Supports uploading new PDF resumes, replacing an existing PDF while
 * preserving metadata, toggling featured/published state, previewing PDFs,
 * and managing media assets.
 */
function renderResumesManager(container, state, refreshView, confirmDelete) {
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
function renderMediaLibraryModule(container, state, refreshView, confirmDelete) {
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


/* === MODULE: admin/js/settings.js === */
/**
 * ==========================================================================
 * ADMIN SETTINGS MODULES (13, 14, 15, 16, 17, 19, 20)
 * ==========================================================================
 * Handles Contact & Inbox, WhatsApp Normalization & wa.me Builder, Theme &
 * 3D Design, Navigation Visibility, SEO, Site-Wide Footer Content, and
 * Admin Account / Backend Security Configuration.
 */




/* --------------------------------------------------------------------------
   MODULE 13: CONTACT SETTINGS & INQUIRY INBOX
   -------------------------------------------------------------------------- */
function renderContactModule(container, state, refreshView, confirmDelete) {
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
function renderWhatsAppModule(container, state) {
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
function renderThemeModule(container, state) {
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
function renderNavigationModule(container, state, refreshView) {
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
function renderSeoModule(container, state) {
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
function renderSiteSettingsModule(container, state) {
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
function renderSecurityModule(container, refreshView, confirmDelete) {
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


/* === MODULE: admin/js/admin.js === */
/**
 * ==========================================================================
 * ADMIN CMS MAIN CONTROLLER — ROUTE GUARD & 20-MODULE ROUTER
 * ==========================================================================
 */








class AdminCMSApp {
  constructor() {
    this.activeModule = 'overview';
    this.isDirty = false;
    this.pendingConfirmCallback = null;
  }

  async init() {
    // 1. Strict Route Protection
    if (!authService.isAuthenticated()) {
      window.location.replace('login.html');
      return;
    }

    await repository.init();
    const state = repository.getAdminData();
    themeController.init(state.theme_settings);

    this.updateTopbarStatus();
    this.bindNavigation();
    this.bindConfirmDialog();
    this.bindUnsavedWarning();
    this.renderCurrentModule();
  }

  updateTopbarStatus() {
    const session = authService.getSession();
    const badge = document.getElementById('adminModeStatusBadge');
    const userLabel = document.getElementById('adminActiveUserEmail');

    if (userLabel && session?.user?.email) {
      userLabel.textContent = session.user.email;
    }

    if (badge) {
      if (apiService.isConfigured() && session?.mode === 'supabase-live') {
        badge.className = 'badge badge--available';
        badge.textContent = '● Live Supabase Sync';
      } else {
        badge.className = 'badge badge--accent';
        badge.textContent = '◆ Local Preview Mode';
      }
    }
  }

  setDirty(dirty) {
    this.isDirty = Boolean(dirty);
    const indicator = document.getElementById('unsavedChangesIndicator');
    if (indicator) {
      indicator.style.display = this.isDirty ? 'inline-flex' : 'none';
    }
  }

  switchModule(moduleKey) {
    if (this.isDirty) {
      const proceed = window.confirm('You have unsaved changes on this form. Discard changes and switch module?');
      if (!proceed) return;
    }
    this.setDirty(false);
    this.activeModule = moduleKey;

    document.querySelectorAll('[data-admin-module]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-admin-module') === moduleKey);
    });

    // Close mobile sidebar if open
    document.getElementById('adminSidebar')?.classList.remove('is-open');
    this.renderCurrentModule();
  }

  renderCurrentModule() {
    if (!authService.isAuthenticated()) {
      window.location.replace('login.html');
      return;
    }

    const container = document.getElementById('adminModuleWorkspace');
    const titleEl = document.getElementById('adminCurrentModuleTitle');
    if (!container) return;

    const state = repository.getAdminData();
    const refresh = () => this.renderCurrentModule();
    const confirmDelete = (msg, onConfirm) => this.openConfirmModal(msg, onConfirm);
    const setDirty = (flag) => this.setDirty(flag);

    const moduleTitles = {
      overview: '1. Dashboard Overview',
      profile: '2. Profile & Personal Information',
      hero: '3. Hero Content & 3D Stage',
      about: '4. About Section & Pillars',
      skills: '5. Skills & Technology Categories',
      experience: '6. Professional Experience',
      education: '7. Education & Training',
      projects: '8. Projects & Case Studies',
      achievements: '9. Achievements & Milestones',
      certifications: '10. Certifications & Credentials',
      resumes: '11. Multiple Resumes & CV Manager',
      social: '12. Professional Social Links',
      contact: '13. Contact Settings & Inbox',
      whatsapp: '14. WhatsApp Integration (wa.me)',
      theme: '15. Theme & 3D Design Settings',
      navigation: '16. Navigation & Section Visibility',
      seo: '17. SEO & Open Graph Settings',
      media: '18. Media Asset Library',
      site: '19. Site-Wide Footer & Attribution',
      security: '20. Admin Account & Backend Security'
    };

    if (titleEl) {
      titleEl.textContent = moduleTitles[this.activeModule] || 'Admin CMS';
    }

    switch (this.activeModule) {
      case 'overview':
        renderDashboardOverview(container, state, (m) => this.switchModule(m));
        break;
      case 'profile':
        renderProfileModule(container, state, setDirty);
        break;
      case 'hero':
        renderHeroModule(container, state, setDirty);
        break;
      case 'about':
        renderAboutModule(container, state, setDirty);
        break;
      case 'skills':
        renderCollectionModule(container, 'skills', state, refresh, confirmDelete);
        break;
      case 'experience':
        renderCollectionModule(container, 'experiences', state, refresh, confirmDelete);
        break;
      case 'education':
        renderCollectionModule(container, 'education', state, refresh, confirmDelete);
        break;
      case 'projects':
        renderCollectionModule(container, 'projects', state, refresh, confirmDelete);
        break;
      case 'achievements':
        renderCollectionModule(container, 'achievements', state, refresh, confirmDelete);
        break;
      case 'certifications':
        renderCollectionModule(container, 'certifications', state, refresh, confirmDelete);
        break;
      case 'resumes':
        renderResumesManager(container, state, refresh, confirmDelete);
        break;
      case 'social':
        renderCollectionModule(container, 'social_links', state, refresh, confirmDelete);
        break;
      case 'contact':
        renderContactModule(container, state, refresh, confirmDelete);
        break;
      case 'whatsapp':
        renderWhatsAppModule(container, state);
        break;
      case 'theme':
        renderThemeModule(container, state);
        break;
      case 'navigation':
        renderNavigationModule(container, state, refresh);
        break;
      case 'seo':
        renderSeoModule(container, state);
        break;
      case 'media':
        renderMediaLibraryModule(container, state, refresh, confirmDelete);
        break;
      case 'site':
        renderSiteSettingsModule(container, state);
        break;
      case 'security':
        renderSecurityModule(container, refresh, confirmDelete);
        break;
      default:
        renderDashboardOverview(container, state, (m) => this.switchModule(m));
    }
  }

  bindNavigation() {
    document.querySelectorAll('[data-admin-module]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchModule(btn.getAttribute('data-admin-module'));
      });
    });

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await authService.signOut();
        window.location.replace('login.html');
      });
    }

    const mobileSidebarToggle = document.getElementById('adminMobileSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (mobileSidebarToggle && sidebar) {
      mobileSidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
      });
    }
  }

  bindConfirmDialog() {
    const modal = document.getElementById('adminConfirmModal');
    const cancelBtn = document.getElementById('adminConfirmCancelBtn');
    const proceedBtn = document.getElementById('adminConfirmProceedBtn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('is-open');
        this.pendingConfirmCallback = null;
      });
    }

    if (proceedBtn) {
      proceedBtn.addEventListener('click', async () => {
        modal.classList.remove('is-open');
        if (typeof this.pendingConfirmCallback === 'function') {
          await this.pendingConfirmCallback();
          this.pendingConfirmCallback = null;
        }
      });
    }
  }

  openConfirmModal(message, onConfirm) {
    const modal = document.getElementById('adminConfirmModal');
    const msgEl = document.getElementById('adminConfirmMessage');
    if (!modal || !msgEl) return;
    msgEl.textContent = message;
    this.pendingConfirmCallback = onConfirm;
    modal.classList.add('is-open');
  }

  bindUnsavedWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cms = new AdminCMSApp();
  cms.init();
});

})();
