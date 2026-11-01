/**
 * AUTO-GENERATED FILE-PROTOCOL SAFE RUNTIME BUNDLE
 * Works identically on file:// and http(s):// without CORS module errors.
 */
(function () {
  if (window.__NEXVORA_PUBLIC_RUNTIME_LOADED__) return;
  window.__NEXVORA_PUBLIC_RUNTIME_LOADED__ = true;

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


/* === MODULE: js/navigation.js === */
/**
 * ==========================================================================
 * NAVIGATION, MULTI-PAGE ROUTING & TELEPORT DROP-IN TRANSITIONS
 * ==========================================================================
 * Features:
 * - Multi-page navigation (index.html, about.html, projects.html, contact.html)
 * - NexVora Technologies branding header
 * - Centralized "Teleport Drop-In" transition: a code glyph/bracket icon (< />)
 *   explodes outward from the center on page/route changes, followed by a
 *   snappy teleport drop-in reveal for incoming page content.
 */
class NavigationController {
  constructor() {
    this.isOpen = false;
    this.boundListeners = false;
    this.currentPage = this.detectCurrentPage();
  }

  detectCurrentPage() {
    const bodyPage = document.body?.getAttribute('data-page');
    if (bodyPage) return bodyPage;

    const path = (window.location.pathname || '').toLowerCase();
    if (path.endsWith('about.html') || path.endsWith('/about')) return 'about.html';
    if (path.endsWith('projects.html') || path.endsWith('/projects')) return 'projects.html';
    if (path.endsWith('contact.html') || path.endsWith('/contact')) return 'contact.html';
    return 'index.html';
  }

  render(navSettings = {}, profile = {}) {
    this.currentPage = this.detectCurrentPage();

    const brandNameEl = document.getElementById('navBrandName');
    const brandSubEl = document.getElementById('navBrandSub');

    if (brandNameEl) brandNameEl.textContent = profile.full_name || 'Saksham Pandey';
    if (brandSubEl) brandSubEl.textContent = profile.brand_name || 'NEXVORA TECHNOLOGIES';

    const defaultPages = [
      { id: 'home', label: 'Home', href: 'index.html', visible: true, order: 1 },
      { id: 'about', label: 'About & Services', href: 'about.html', visible: true, order: 2 },
      { id: 'projects', label: 'Projects & CV', href: 'projects.html', visible: true, order: 3 },
      { id: 'contact', label: 'Contact', href: 'contact.html', visible: true, order: 4 }
    ];

    const sections = Array.isArray(navSettings.sections) && navSettings.sections.length > 0
      ? [...navSettings.sections].sort((a, b) => (a.order || 0) - (b.order || 0))
      : defaultPages;

    const navList = document.getElementById('navMenuList');
    if (navList) {
      // Check if we use multi-page links (index.html, about.html, projects.html, contact.html)
      // Always include the 4 main pages plus quick section anchors if on index.html
      const pageLinks = [
        { id: 'home', label: 'Home', href: 'index.html' },
        { id: 'about', label: 'About & Agency', href: 'about.html' },
        { id: 'projects', label: 'Projects & CV', href: 'projects.html' },
        { id: 'contact', label: 'Contact', href: 'contact.html' }
      ];

      navList.innerHTML = pageLinks
        .map((item) => {
          const isActive = this.currentPage === item.href;
          return `<li>
            <a href="${escapeHtml(item.href)}"
               class="nav-link ${isActive ? 'is-active' : ''}"
               data-page-route="${escapeHtml(item.href)}"
               data-section-link="${escapeHtml(item.id)}">
              ${escapeHtml(item.label)}
            </a>
          </li>`;
        })
        .join('');
    }

    // Apply section visibility on page if configured in Admin CMS
    sections.forEach((sec) => {
      const domSection = document.getElementById(sec.id);
      if (domSection && sec.id !== 'home') {
        domSection.style.display = sec.visible === false ? 'none' : '';
      }
    });

    const headerCta = document.getElementById('headerContactCta');
    if (headerCta) {
      headerCta.textContent = navSettings.cta_label || 'Let’s Talk';
      const targetHref =
        this.currentPage === 'contact.html'
          ? '#contact'
          : navSettings.cta_target && navSettings.cta_target.endsWith('.html')
          ? navSettings.cta_target
          : 'contact.html';
      headerCta.setAttribute('href', targetHref);
    }

    this.ensureTeleportOverlay();
    this.playIncomingTeleportDropIn();
    this.bindInteractions();
  }

  ensureTeleportOverlay() {
    let overlay = document.getElementById('teleportTransitionOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'teleportTransitionOverlay';
      overlay.className = 'teleport-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="teleport-overlay__core">
          <span class="teleport-overlay__bracket teleport-overlay__bracket--left">&lt;</span>
          <span class="teleport-overlay__slash">/</span>
          <span class="teleport-overlay__bracket teleport-overlay__bracket--right">&gt;</span>
          <div class="teleport-overlay__ring"></div>
          <span class="teleport-overlay__label">NEXVORA // TELEPORT ROUTE</span>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  playIncomingTeleportDropIn() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainEl = document.getElementById('mainContent') || document.querySelector('main');
    const overlay = this.ensureTeleportOverlay();

    let triggeredFromNav = false;
    try {
      triggeredFromNav = sessionStorage.getItem('nexvora_teleport_active') === '1';
      sessionStorage.removeItem('nexvora_teleport_active');
    } catch {
      // Ignore storage errors on restricted file:// origins
    }

    if (prefersReduced) {
      if (mainEl) mainEl.classList.add('teleport-drop-in-ready');
      return;
    }

    if (triggeredFromNav && overlay) {
      overlay.classList.add('is-exploding-in');
      setTimeout(() => {
        overlay.classList.remove('is-exploding-in');
      }, 520);
    }

    if (mainEl && !mainEl.dataset.teleportAnimated) {
      mainEl.dataset.teleportAnimated = 'true';
      mainEl.classList.remove('teleport-drop-in-active');
      void mainEl.offsetWidth; // Force reflow for snappy 60fps animation
      mainEl.classList.add('teleport-drop-in-active');
    }
  }

  triggerTeleportNavigation(targetHref) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      window.location.href = targetHref;
      return;
    }

    const overlay = this.ensureTeleportOverlay();
    const mainEl = document.getElementById('mainContent') || document.querySelector('main');

    try {
      sessionStorage.setItem('nexvora_teleport_active', '1');
    } catch {
      // Ignore
    }

    if (mainEl) {
      mainEl.classList.add('teleport-drop-out');
    }
    overlay.classList.add('is-exploding');

    setTimeout(() => {
      window.location.href = targetHref;
    }, 340);
  }

  bindInteractions() {
    if (this.boundListeners) return;
    this.boundListeners = true;

    const header = document.getElementById('siteHeader');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenuList');
    const backToTop = document.getElementById('backToTopBtn');

    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        navMenu.classList.toggle('is-open', this.isOpen);
        mobileBtn.setAttribute('aria-expanded', String(this.isOpen));
      });

      navMenu.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) {
          this.closeMobileMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMobileMenu();
          mobileBtn.focus();
        }
      });
    }

    // Intercept multi-page navigation clicks to play the "< />" Teleport Drop-In transition
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      // Ignore modified clicks, new-tab links, downloads, or external URLs
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      const rawHref = link.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref.startsWith('http') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      // Same-page hash anchor: trigger a quick visual teleport pulse & smooth scroll
      if (rawHref.startsWith('#')) {
        const targetSection = document.querySelector(rawHref);
        if (targetSection) {
          e.preventDefault();
          this.closeMobileMenu();
          this.pulseSectionTeleport(targetSection);
        }
        return;
      }

      // Internal multi-page route (index.html, about.html, projects.html, contact.html)
      const isPublicPage = /^(index|about|projects|contact)\.html(#.*)?$/i.test(rawHref);
      if (isPublicPage) {
        const [pagePart, hashPart] = rawHref.split('#');
        if (pagePart.toLowerCase() === this.currentPage.toLowerCase()) {
          if (hashPart) {
            const sec = document.getElementById(hashPart);
            if (sec) {
              e.preventDefault();
              this.closeMobileMenu();
              this.pulseSectionTeleport(sec);
            }
          } else {
            e.preventDefault();
            this.closeMobileMenu();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }

        e.preventDefault();
        this.closeMobileMenu();
        this.triggerTeleportNavigation(rawHref);
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        const scrollY = window.scrollY;
        if (header) {
          header.classList.toggle('is-scrolled', scrollY > 24);
        }
        if (backToTop) {
          backToTop.classList.toggle('is-visible', scrollY > 450);
        }
      },
      { passive: true }
    );

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  pulseSectionTeleport(targetSection) {
    const overlay = this.ensureTeleportOverlay();
    overlay.classList.add('is-exploding-quick');
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetSection.classList.remove('section-teleport-flash');
    void targetSection.offsetWidth;
    targetSection.classList.add('section-teleport-flash');
    setTimeout(() => {
      overlay.classList.remove('is-exploding-quick');
    }, 420);
  }

  closeMobileMenu() {
    this.isOpen = false;
    const navMenu = document.getElementById('navMenuList');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    if (navMenu) navMenu.classList.remove('is-open');
    if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
  }
}
const navigationController = new NavigationController();


/* === MODULE: js/scene-3d.js === */
/**
 * ==========================================================================
 * 3D SCENE ENGINE — AMBIENT 3D PARTICLE + TERMINAL CANVAS & HERO SCULPTURE
 * ==========================================================================
 * 1. Ambient3DBackground: Full-viewport 3D particle + floating tech glyphs +
 *    ambient code-typing terminal stream integrated into the background canvas.
 * 2. Hero3DScene: Interactive 3D Crystalline/Lattice/Orbital centerpiece.
 * 3. initCard3DTilt: 3D perspective card tilt with cursor specular glare.
 */
class Ambient3DBackground {
  constructor(canvasId = 'ambient3dBgCanvas') {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.codeStreams = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.width = 0;
    this.height = 0;
    this.rafId = null;
    this.reducedMotion = false;
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = this.canvasId;
      this.canvas.className = 'ambient-3d-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.resize();
    this.seedParticles();
    this.seedCodeStreams();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener(
      'mousemove',
      (e) => {
        this.mouseX = (e.clientX / Math.max(1, this.width) - 0.5) * 2;
        this.mouseY = (e.clientY / Math.max(1, this.height) - 0.5) * 2;
      },
      { passive: true }
    );

    if (this.reducedMotion) {
      this.drawFrame();
    } else {
      const loop = () => {
        if (!document.hidden) {
          this.update();
          this.drawFrame();
        }
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  seedParticles() {
    const glyphs = ['</>', '{ }', '01', 'λ', '::', '[]', 'NV', '◈'];
    const count = window.innerWidth < 768 ? 16 : 28;
    this.particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      z: 0.25 + Math.random() * 0.85,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      glyph: i % 3 === 0 ? glyphs[i % glyphs.length] : null,
      size: 2 + Math.random() * 2.5,
      accent: i % 4 === 0 ? '#1A75FF' : '#F28C28'
    }));
  }

  seedCodeStreams() {
    const snippets = [
      '> nexvora.engine.init({ mode: "3D-WebGL", fps: 60 })',
      '> fastapi.post("/v1/events/ingest") -> 202 Accepted',
      '> rag.hybridSearch({ index: "pgvector", topK: 6 })',
      '> wsHub.broadcast("room:nexvora", crdt.patch)',
      '> vercel.edge.route({ status: "optimal", region: "global" })',
      '> saksham.stack = ["React", "TypeScript", "Python", "FastAPI", "Node.js"]'
    ];

    this.codeStreams = [
      {
        x: 36,
        y: 120,
        text: snippets[0],
        charIndex: 0,
        snippetIdx: 0,
        snippets
      },
      {
        x: Math.max(320, this.width - 460),
        y: Math.max(300, this.height - 110),
        text: snippets[3],
        charIndex: 12,
        snippetIdx: 3,
        snippets
      }
    ];
  }

  update() {
    for (const p of this.particles) {
      p.x += p.vx * p.z;
      p.y += p.vy * p.z;

      if (p.x < -30) p.x = this.width + 30;
      if (p.x > this.width + 30) p.x = -30;
      if (p.y < -30) p.y = this.height + 30;
      if (p.y > this.height + 30) p.y = -30;
    }

    for (const stream of this.codeStreams) {
      stream.charIndex += 0.28;
      if (stream.charIndex > stream.text.length + 32) {
        stream.charIndex = 0;
        stream.snippetIdx = (stream.snippetIdx + 1) % stream.snippets.length;
        stream.text = stream.snippets[stream.snippetIdx];
      }
    }
  }

  drawFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, this.width, this.height);

    const parallaxX = this.mouseX * 16;
    const parallaxY = this.mouseY * 16;

    // 1. Connect nearby 3D particles with subtle geometric lines
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const x1 = p1.x + parallaxX * p1.z;
      const y1 = p1.y + parallaxY * p1.z;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const x2 = p2.x + parallaxX * p2.z;
        const y2 = p2.y + parallaxY * p2.z;
        const dist = Math.hypot(x1 - x2, y1 - y2);

        if (dist < 145) {
          const alpha = (1 - dist / 145) * (isDark ? 0.11 : 0.08);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = isDark
            ? `rgba(76, 201, 255, ${alpha})`
            : `rgba(22, 22, 26, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    // 2. Draw floating geometric nodes & tech glyphs
    for (const p of this.particles) {
      const px = p.x + parallaxX * p.z;
      const py = p.y + parallaxY * p.z;

      if (p.glyph) {
        ctx.font = `600 ${Math.round(9 + p.z * 3)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isDark
          ? `rgba(76, 201, 255, ${0.14 * p.z})`
          : `rgba(242, 140, 40, ${0.16 * p.z})`;
        ctx.fillText(p.glyph, px, py);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, p.size * p.z, 0, Math.PI * 2);
        ctx.fillStyle = p.accent === '#1A75FF'
          ? `rgba(26, 117, 255, ${isDark ? 0.28 : 0.2})`
          : `rgba(242, 140, 40, ${isDark ? 0.28 : 0.22})`;
        ctx.fill();
      }
    }

    // 3. Draw subtle ambient terminal code-typing streams on desktop/tablet
    if (this.width >= 768) {
      ctx.font = '500 11px "JetBrains Mono", monospace';
      this.codeStreams[1].x = Math.max(320, this.width - 450);
      this.codeStreams[1].y = Math.max(300, this.height - 80);

      for (const stream of this.codeStreams) {
        const visibleText = stream.text.slice(0, Math.floor(stream.charIndex));
        ctx.fillStyle = isDark
          ? 'rgba(184, 184, 196, 0.16)'
          : 'rgba(22, 22, 26, 0.14)';
        ctx.fillText(`${visibleText}█`, stream.x + parallaxX * 0.3, stream.y + parallaxY * 0.3);
      }
    }
  }
}
class Hero3DScene {
  constructor(canvasId = 'hero3dCanvas') {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.mode = 'crystalline';
    this.rotX = 0.35;
    this.rotY = 0.55;
    this.targetRotX = 0.35;
    this.targetRotY = 0.55;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isVisible = true;
    this.reducedMotion = false;
    this.rafId = null;
    this.time = 0;
    this.geometry = null;
  }

  init(initialMode = 'crystalline') {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mode = initialMode || 'crystalline';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.buildGeometry(this.mode);
    this.resize();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    this.bindPointerEvents();
    this.bindVisibilityObserver();

    if (this.reducedMotion) {
      this.renderFrame();
    } else {
      this.startLoop();
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    this.buildGeometry(this.mode);
    if (this.reducedMotion) this.renderFrame();
  }

  buildGeometry(mode) {
    const phi = (1 + Math.sqrt(5)) / 2;
    let vertices = [];
    let faces = [];
    let edges = [];

    if (mode === 'lattice') {
      const coords = [-1, 1];
      for (const x of coords) {
        for (const y of coords) {
          for (const z of coords) {
            vertices.push({ x: x * 0.95, y: y * 0.95, z: z * 0.95, ring: 'outer' });
            vertices.push({ x: x * 0.48, y: y * 0.48, z: z * 0.48, ring: 'inner' });
          }
        }
      }
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const dx = vertices[i].x - vertices[j].x;
          const dy = vertices[i].y - vertices[j].y;
          const dz = vertices[i].z - vertices[j].z;
          const dist = Math.hypot(dx, dy, dz);
          if (dist < 1.95 && dist > 0.4) {
            edges.push([i, j]);
          }
        }
      }
    } else {
      const rawV = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
      ];
      vertices = rawV.map(([x, y, z]) => {
        const len = Math.hypot(x, y, z);
        return { x: (x / len) * 1.25, y: (y / len) * 1.25, z: (z / len) * 1.25 };
      });

      faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
      ];

      const edgeSet = new Set();
      faces.forEach(([a, b, c]) => {
        [[a, b], [b, c], [c, a]].forEach(([u, v]) => {
          const key = u < v ? `${u}_${v}` : `${v}_${u}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push([u, v]);
          }
        });
      });
    }

    const techNodes = [
      { label: 'React · TS', angle: 0, radius: 1.75, yOffset: 0.28, color: '#F28C28' },
      { label: 'Python · FastAPI', angle: 1.25, radius: 1.8, yOffset: -0.32, color: '#1A75FF' },
      { label: 'Node.js · WS', angle: 2.5, radius: 1.72, yOffset: 0.18, color: '#0891B2' },
      { label: 'ERP · CRM', angle: 3.75, radius: 1.8, yOffset: -0.22, color: '#F28C28' },
      { label: 'AI Automation', angle: 5.0, radius: 1.75, yOffset: 0.3, color: '#1A75FF' }
    ];

    this.geometry = { vertices, faces, edges, techNodes };
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(260, rect.width);
    this.height = Math.max(260, rect.height);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.reducedMotion) this.renderFrame();
  }

  bindPointerEvents() {
    const wrapper = this.canvas.parentElement;

    wrapper.addEventListener(
      'mousemove',
      (e) => {
        const rect = wrapper.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        if (this.isDragging) {
          this.targetRotY += (e.clientX - this.lastMouseX) * 0.01;
          this.targetRotX += (e.clientY - this.lastMouseY) * 0.01;
          this.lastMouseX = e.clientX;
          this.lastMouseY = e.clientY;
        } else {
          this.targetRotX = ny * 0.45;
          this.targetRotY += nx * 0.008;
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    document.querySelectorAll('[data-sculpture-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-sculpture-mode]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.setMode(btn.getAttribute('data-sculpture-mode'));
      });
    });
  }

  bindVisibilityObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(this.canvas);
    }

    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
    });
  }

  rotatePoint(p, rx, ry) {
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = p.x * cosY - p.z * sinY;
    const z1 = p.z * cosY + p.x * sinY;

    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = z1 * cosX + p.y * sinX;

    return { x: x1, y: y2, z: z2 };
  }

  project(p3d) {
    const fov = Math.min(this.width, this.height) * 0.44;
    const viewerDist = 4.2;
    const scale = fov / (viewerDist - p3d.z);
    return {
      x: this.width / 2 + p3d.x * scale,
      y: this.height / 2 + p3d.y * scale,
      z: p3d.z,
      scale
    };
  }

  startLoop() {
    const tick = () => {
      if (this.isVisible && !this.reducedMotion) {
        this.time += 0.012;
        if (!this.isDragging) {
          this.targetRotY += 0.0045;
        }
        this.rotX += (this.targetRotX - this.rotX) * 0.08;
        this.rotY += (this.targetRotY - this.rotY) * 0.08;
        this.renderFrame();
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  renderFrame() {
    if (!this.ctx || !this.geometry) return;
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.34;

    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius * 1.25);
    grad.addColorStop(0, isDark ? 'rgba(242, 140, 40, 0.22)' : 'rgba(242, 140, 40, 0.16)');
    grad.addColorStop(0.6, isDark ? 'rgba(26, 117, 255, 0.1)' : 'rgba(26, 117, 255, 0.06)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotY * 0.25);
    ctx.scale(1, 0.42);
    ctx.strokeStyle = isDark ? 'rgba(76, 201, 255, 0.3)' : 'rgba(242, 140, 40, 0.32)';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const transformed = this.geometry.vertices.map((v) =>
      this.rotatePoint(v, this.rotX, this.rotY)
    );
    const projected = transformed.map((p) => this.project(p));

    if (this.geometry.faces.length > 0 && this.mode !== 'orbital') {
      const lightDir = { x: 0.45, y: -0.65, z: 0.6 };
      const sortedFaces = this.geometry.faces
        .map((indices) => {
          const [i0, i1, i2] = indices;
          const v0 = transformed[i0];
          const v1 = transformed[i1];
          const v2 = transformed[i2];
          const avgZ = (v0.z + v1.z + v2.z) / 3;

          const ux = v1.x - v0.x;
          const uy = v1.y - v0.y;
          const uz = v1.z - v0.z;
          const vx = v2.x - v0.x;
          const vy = v2.y - v0.y;
          const vz = v2.z - v0.z;
          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          const dot = Math.max(0, (nx * lightDir.x + ny * lightDir.y + nz * lightDir.z) / nLen);

          return { indices, avgZ, intensity: dot };
        })
        .sort((a, b) => a.avgZ - b.avgZ);

      sortedFaces.forEach(({ indices, intensity }) => {
        const [i0, i1, i2] = indices;
        const p0 = projected[i0];
        const p1 = projected[i1];
        const p2 = projected[i2];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        const alpha = 0.08 + intensity * 0.24;
        ctx.fillStyle = isDark
          ? `rgba(242, 140, 40, ${alpha})`
          : `rgba(242, 140, 40, ${alpha * 0.85})`;
        ctx.fill();
      });
    }

    this.geometry.edges.forEach(([a, b]) => {
      const p1 = projected[a];
      const p2 = projected[b];
      const depthAlpha = Math.max(0.15, Math.min(0.85, (p1.z + p2.z + 2.5) / 4));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = isDark
        ? `rgba(245, 245, 247, ${depthAlpha * 0.55})`
        : `rgba(22, 22, 26, ${depthAlpha * 0.48})`;
      ctx.lineWidth = 1.35;
      ctx.stroke();
    });

    projected.forEach((p) => {
      const r = Math.max(2, (p.z + 2) * 1.3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#F28C28';
      ctx.fill();
    });

    this.geometry.techNodes.forEach((node, idx) => {
      const orbitAngle = node.angle + this.time * 0.65 + this.rotY * 0.5;
      const point3D = {
        x: Math.cos(orbitAngle) * node.radius,
        y: node.yOffset + Math.sin(this.time + idx) * 0.14,
        z: Math.sin(orbitAngle) * node.radius
      };
      const rotated = this.rotatePoint(point3D, this.rotX * 0.4, 0);
      const proj = this.project(rotated);

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(node.label).width;
      const pillX = Math.min(this.width - textWidth - 18, Math.max(6, proj.x + 8));
      const pillY = Math.min(this.height - 24, Math.max(6, proj.y - 10));

      ctx.fillStyle = isDark ? 'rgba(22, 24, 31, 0.85)' : 'rgba(255, 253, 250, 0.88)';
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(22,22,26,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, textWidth + 12, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#F5F5F7' : '#16161A';
      ctx.fillText(node.label, pillX + 6, pillY + 14);
    });
  }
}
function initCard3DTilt() {
  if (window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) {
    return;
  }

  document.querySelectorAll('.card-3d').forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = 'true';

    card.addEventListener(
      'mousemove',
      (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;

        const rotateY = (x / rect.width - 0.5) * 6;
        const rotateX = (0.5 - y / rect.height) * 6;

        card.style.setProperty('--glare-x', `${pctX}%`);
        card.style.setProperty('--glare-y', `${pctY}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
      },
      { passive: true }
    );

    card.addEventListener(
      'mouseleave',
      () => {
        card.style.transform = '';
      },
      { passive: true }
    );
  });
}


/* === MODULE: js/animations.js === */
/**
 * ==========================================================================
 * OPENING SEQUENCE, FULL-PAGE LIVE CODING EXPLAINER & SCROLL STORYTELLING
 * ==========================================================================
 */

const INTRO_SEEN_KEY = 'nexvora_intro_seen_session';
const LIVE_CODE_SCENARIOS = [
  {
    id: 'fastapi',
    tabLabel: 'FastAPI · Distributed',
    fileName: 'pipeline_gateway.py',
    language: 'Python 3.12 // FastAPI',
    lines: [
      {
        code: '<span class="tok-kw">@app.post</span>(<span class="tok-str">"/v1/events/ingest"</span>, status_code=<span class="tok-typ">202</span>)',
        stepTitle: 'Step 01 // Non-Blocking Async API Gateway',
        stepExplain: 'Exposes a high-concurrency FastAPI endpoint that accepts distributed event payloads with HTTP 202 Accepted semantics.'
      },
      {
        code: '<span class="tok-kw">async def</span> <span class="tok-fn">ingest_event</span>(payload: <span class="tok-typ">EventEnvelope</span>, bus: <span class="tok-typ">RedisStream</span>):',
        stepTitle: 'Step 02 // Strict Pydantic Type Validation',
        stepExplain: 'Validates incoming JSON against a strict Pydantic schema before execution, rejecting malformed payloads at the edge.'
      },
      {
        code: '    dedup_key = <span class="tok-fn">f</span><span class="tok-str">"idemp:{payload.tenant_id}:{payload.event_id}"</span>',
        stepTitle: 'Step 03 // Deterministic Idempotency Key',
        stepExplain: 'Computes a cryptographic idempotency key per tenant and event ID so network retries never cause duplicate processing.'
      },
      {
        code: '    <span class="tok-kw">if not await</span> bus.<span class="tok-fn">acquire_lock</span>(dedup_key, ttl=<span class="tok-typ">3600</span>):',
        stepTitle: 'Step 04 // Atomic Distributed Lock Check',
        stepExplain: 'Verifies lock state in Redis in sub-millisecond time to guarantee exactly-once workflow scheduling across cluster nodes.'
      },
      {
        code: '        <span class="tok-kw">return</span> {<span class="tok-str">"status"</span>: <span class="tok-str">"deduplicated"</span>, <span class="tok-str">"id"</span>: payload.event_id}',
        stepTitle: 'Step 05 // Graceful Duplicate Short-Circuit',
        stepExplain: 'Safely acknowledges repeated webhook deliveries without re-triggering downstream database mutations.'
      },
      {
        code: '    tx_id = <span class="tok-kw">await</span> bus.<span class="tok-fn">xadd_dag_stream</span>(<span class="tok-str">"nexvora:jobs"</span>, payload.<span class="tok-fn">dict</span>())',
        stepTitle: 'Step 06 // Persistent DAG Event Stream Append',
        stepExplain: 'Appends the validated task to a durable Redis Stream consumer group for asynchronous worker execution.'
      },
      {
        code: '    <span class="tok-kw">return</span> {<span class="tok-str">"status"</span>: <span class="tok-str">"queued"</span>, <span class="tok-str">"stream_tx"</span>: tx_id}',
        stepTitle: 'Step 07 // Real-Time Telemetry Receipt',
        stepExplain: 'Returns the deterministic stream transaction ID to the client for live SSE status tracking.'
      }
    ]
  },
  {
    id: 'react_ts',
    tabLabel: 'React · TypeScript',
    fileName: 'useSpatialTelemetry.ts',
    language: 'TypeScript 5 // React',
    lines: [
      {
        code: '<span class="tok-kw">export function</span> <span class="tok-fn">useSpatialTelemetry</span>&lt;<span class="tok-typ">TFrame</span>&gt;(channel: <span class="tok-typ">string</span>) {',
        stepTitle: 'Step 01 // Generic Type-Safe React Hook',
        stepExplain: 'Defines a reusable generic TypeScript hook that enforces compile-time schema safety across real-time UI components.'
      },
      {
        code: '  <span class="tok-kw">const</span> [frame, setFrame] = <span class="tok-fn">useState</span>&lt;<span class="tok-typ">TFrame | null</span>&gt;(<span class="tok-kw">null</span>);',
        stepTitle: 'Step 02 // Reactive Telemetry State Buffer',
        stepExplain: 'Holds the current synchronized 3D telemetry frame for declarative rendering in React.'
      },
      {
        code: '  <span class="tok-kw">const</span> rafRef = <span class="tok-fn">useRef</span>&lt;<span class="tok-typ">number</span>&gt;(<span class="tok-typ">0</span>);',
        stepTitle: 'Step 03 // 60fps Frame Coalescing Reference',
        stepExplain: 'Tracks the active requestAnimationFrame handle so high-frequency socket packets never block the main UI thread.'
      },
      {
        code: '  <span class="tok-fn">useEffect</span>(() =&gt; {',
        stepTitle: 'Step 04 // Lifecycle-Managed Socket Subscription',
        stepExplain: 'Automatically opens and cleans up the multiplexed WebSocket subscription when the component mounts or unmounts.'
      },
      {
        code: '    <span class="tok-kw">return</span> socketHub.<span class="tok-fn">subscribe</span>(channel, (incoming: <span class="tok-typ">TFrame</span>) =&gt; {',
        stepTitle: 'Step 05 // Multiplexed Stream Listener',
        stepExplain: 'Listens to delta-compressed packets on the specified telemetry channel.'
      },
      {
        code: '      <span class="tok-fn">cancelAnimationFrame</span>(rafRef.current);',
        stepTitle: 'Step 06 // Backpressure & Jitter Prevention',
        stepExplain: 'Coalesces burst updates into a single display refresh cycle to maintain smooth 60fps 3D animations.'
      },
      {
        code: '      rafRef.current = <span class="tok-fn">requestAnimationFrame</span>(() =&gt; <span class="tok-fn">setFrame</span>(incoming));',
        stepTitle: 'Step 07 // Hardware-Synchronized State Commit',
        stepExplain: 'Commits the latest state aligned with the browser repaint boundary.'
      }
    ]
  },
  {
    id: 'ai_rag',
    tabLabel: 'AI · RAG Pipeline',
    fileName: 'rag_synthesizer.py',
    language: 'Python // Applied AI & pgvector',
    lines: [
      {
        code: '<span class="tok-kw">async def</span> <span class="tok-fn">grounded_rag_query</span>(query: <span class="tok-typ">str</span>, db: <span class="tok-typ">PgVectorSession</span>):',
        stepTitle: 'Step 01 // Grounded AI Synthesis Entrypoint',
        stepExplain: 'Orchestrates hybrid retrieval and citation-grounded generation to eliminate unverified hallucinations.'
      },
      {
        code: '    q_vec = <span class="tok-kw">await</span> embedder.<span class="tok-fn">encode_async</span>(query, normalize=<span class="tok-kw">True</span>)',
        stepTitle: 'Step 02 // Dense Vector Embedding Generation',
        stepExplain: 'Transforms the user query into a normalized high-dimensional semantic vector representation.'
      },
      {
        code: '    chunks = <span class="tok-kw">await</span> db.<span class="tok-fn">hybrid_rrf_search</span>(q_vec, query, top_k=<span class="tok-typ">6</span>)',
        stepTitle: 'Step 03 // Hybrid Vector + BM25 Rank Fusion',
        stepExplain: 'Combines pgvector cosine similarity with lexical keyword matching via Reciprocal Rank Fusion (RRF).'
      },
      {
        code: '    context = <span class="tok-fn">format_cited_blocks</span>(chunks, strict_schema=<span class="tok-kw">True</span>)',
        stepTitle: 'Step 04 // Verifiable Source Context Assembly',
        stepExplain: 'Packages retrieved technical segments with immutable document IDs and line-range metadata.'
      },
      {
        code: '    <span class="tok-kw">async for</span> token <span class="tok-kw">in</span> llm.<span class="tok-fn">stream_structured</span>(query, context):',
        stepTitle: 'Step 05 // Low-Latency Token Streaming',
        stepExplain: 'Streams schema-constrained tokens back to the frontend with inline source citations.'
      },
      {
        code: '        <span class="tok-kw">yield</span> token.<span class="tok-fn">to_sse_event</span>()',
        stepTitle: 'Step 06 // Server-Sent Event Delivery',
        stepExplain: 'Flushes each verified token over SSE for instant progressive rendering in the browser.'
      }
    ]
  },
  {
    id: 'node_ws',
    tabLabel: 'Node.js · WebSockets',
    fileName: 'state_broker.js',
    language: 'Node.js // Real-Time Hub',
    lines: [
      {
        code: 'wss.<span class="tok-fn">on</span>(<span class="tok-str">"connection"</span>, (socket, req) =&gt; {',
        stepTitle: 'Step 01 // Multiplexed WebSocket Handshake',
        stepExplain: 'Accepts upgraded bidirectional WebSocket connections on the Node.js event loop.'
      },
      {
        code: '  <span class="tok-kw">const</span> peer = <span class="tok-fn">authenticateJwtSocket</span>(req.headers.authorization);',
        stepTitle: 'Step 02 // Zero-Trust Connection Authentication',
        stepExplain: 'Verifies the client JWT signature before registering the peer in any room channel.'
      },
      {
        code: '  socket.<span class="tok-fn">on</span>(<span class="tok-str">"message"</span>, (raw) =&gt; {',
        stepTitle: 'Step 03 // High-Frequency Binary Frame Handler',
        stepExplain: 'Processes incoming state delta packets with minimal garbage-collection allocation.'
      },
      {
        code: '    <span class="tok-kw">const</span> patch = crdt.<span class="tok-fn">mergeStateDelta</span>(peer.roomId, raw);',
        stepTitle: 'Step 04 // Conflict-Free State Merging',
        stepExplain: 'Applies deterministic state merging so concurrent edits from multiple clients converge cleanly.'
      },
      {
        code: '    redisPub.<span class="tok-fn">publish</span>(<span class="tok-str">`room:${peer.roomId}`</span>, patch);',
        stepTitle: 'Step 05 // Horizontal Multi-Node Broadcast',
        stepExplain: 'Fan-outs the state delta across all Node.js cluster instances via Redis Pub/Sub.'
      },
      {
        code: '  });',
        stepTitle: 'Step 06 // Sub-Second Global Synchronization',
        stepExplain: 'Completes end-to-end distributed state propagation across connected browsers.'
      }
    ]
  }
];
class AnimationController {
  constructor() {
    this.specialtyTimer = null;
    this.specialtyIndex = 0;
    this.observer = null;
    this.activeScenarioIdx = 0;
    this.activeLineIdx = 0;
    this.codeTimer = null;
    this.isCodePaused = false;
  }

  initOpeningSequence(themeSettings = {}) {
    const overlay = document.getElementById('introOverlay');
    const skipBtn = document.getElementById('skipIntroBtn');
    if (!overlay) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disabledByAdmin = themeSettings.enable_opening_intro === false;

    const dismissIntro = () => {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 650);
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
      } catch {
        // Ignore storage error on restricted file:// origins
      }
    };

    // Expose globally so inline onclick always works even before modules finish
    window.__dismissPortfolioIntro = dismissIntro;

    if (prefersReduced || disabledByAdmin) {
      dismissIntro();
      return;
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', dismissIntro);
    }

    const escHandler = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        dismissIntro();
        window.removeEventListener('keydown', escHandler);
      }
    };
    window.addEventListener('keydown', escHandler);

    // Animate rapid live coding + explanation in the intro background while opening runs
    this.animateIntroBackgroundCoding();

    // Auto-transition smoothly into the main portfolio after 2.4 seconds
    setTimeout(() => {
      dismissIntro();
      window.removeEventListener('keydown', escHandler);
    }, 2400);
  }

  animateIntroBackgroundCoding() {
    const statusEl = document.getElementById('introLiveStatusText');
    if (!statusEl) return;

    const steps = [
      'Compiling FastAPI Async Gateway & Redis DAG Streams...',
      'Hydrating 60fps 3D Crystalline WebGL Projection Matrix...',
      'Binding Grounded AI RAG Vector Pipeline & RLS Policies...',
      'Launching NEXVORA 3D Portfolio Environment...'
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= steps.length) {
        clearInterval(interval);
        return;
      }
      statusEl.textContent = steps[idx];
    }, 520);
  }

  /**
   * Initializes the Full-Page Starting Background Live Coding Streams AND
   * the Interactive Live Coding & Code Explainer Workbench in the Hero section.
   */
  initLiveCodeExplainer() {
    const workbench = document.getElementById('heroLiveCodeWorkbench');
    if (!workbench) return;

    const tabsContainer = document.getElementById('liveCodeTabs');
    const pauseBtn = document.getElementById('liveCodePauseBtn');

    if (tabsContainer) {
      tabsContainer.innerHTML = LIVE_CODE_SCENARIOS.map(
        (sc, i) => `
          <button type="button"
                  class="live-code-tab ${i === this.activeScenarioIdx ? 'is-active' : ''}"
                  data-code-scenario="${i}">
            ${escapeHtml(sc.tabLabel)}
          </button>
        `
      ).join('');

      tabsContainer.querySelectorAll('[data-code-scenario]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeScenarioIdx = Number(btn.getAttribute('data-code-scenario')) || 0;
          this.activeLineIdx = 0;
          tabsContainer.querySelectorAll('[data-code-scenario]').forEach((b) =>
            b.classList.toggle('is-active', b === btn)
          );
          this.renderCodeWorkbenchStep();
        });
      });
    }

    if (pauseBtn && !pauseBtn.dataset.bound) {
      pauseBtn.dataset.bound = 'true';
      pauseBtn.addEventListener('click', () => {
        this.isCodePaused = !this.isCodePaused;
        pauseBtn.textContent = this.isCodePaused ? '▶ Resume Live Coding' : '⏸ Pause Walkthrough';
      });
    }

    this.renderCodeWorkbenchStep();

    if (this.codeTimer) clearInterval(this.codeTimer);
    this.codeTimer = setInterval(() => {
      if (document.hidden || this.isCodePaused) return;
      const currentScenario = LIVE_CODE_SCENARIOS[this.activeScenarioIdx];
      this.activeLineIdx++;
      if (this.activeLineIdx >= currentScenario.lines.length) {
        this.activeLineIdx = 0;
        this.activeScenarioIdx = (this.activeScenarioIdx + 1) % LIVE_CODE_SCENARIOS.length;
        if (tabsContainer) {
          tabsContainer.querySelectorAll('[data-code-scenario]').forEach((b, idx) =>
            b.classList.toggle('is-active', idx === this.activeScenarioIdx)
          );
        }
      }
      this.renderCodeWorkbenchStep();
    }, 2300);
  }

  renderCodeWorkbenchStep() {
    const scenario = LIVE_CODE_SCENARIOS[this.activeScenarioIdx] || LIVE_CODE_SCENARIOS[0];
    const currentStep = scenario.lines[this.activeLineIdx] || scenario.lines[0];

    const fileLabel = document.getElementById('liveCodeFileName');
    const editorEl = document.getElementById('liveCodeEditorPane');
    const stepBadge = document.getElementById('liveExplainerBadge');
    const stepTitle = document.getElementById('liveExplainerTitle');
    const stepDesc = document.getElementById('liveExplainerDesc');
    const stepCounter = document.getElementById('liveExplainerCounter');
    const bgLeft = document.getElementById('heroBgCodeLeft');
    const bgRight = document.getElementById('heroBgCodeRight');

    if (fileLabel) {
      fileLabel.textContent = `${scenario.fileName} — ${scenario.language}`;
    }

    if (editorEl) {
      editorEl.innerHTML = scenario.lines
        .map((line, idx) => {
          const isCurrent = idx === this.activeLineIdx;
          const isVisible = idx <= this.activeLineIdx;
          return `
            <div class="live-code-line ${isCurrent ? 'is-executing' : ''}"
                 style="opacity:${isVisible ? '1' : '0.32'};cursor:pointer;"
                 data-goto-line="${idx}">
              <span class="live-code-line__num">${idx + 1}</span>
              <span>${line.code}${isCurrent ? '<span class="typing-cursor"></span>' : ''}</span>
            </div>
          `;
        })
        .join('');

      editorEl.querySelectorAll('[data-goto-line]').forEach((row) => {
        row.addEventListener('click', () => {
          this.activeLineIdx = Number(row.getAttribute('data-goto-line')) || 0;
          this.renderCodeWorkbenchStep();
        });
      });
    }

    if (stepBadge) stepBadge.textContent = `LIVE EXECUTION WALKTHROUGH // ${scenario.language}`;
    if (stepTitle) stepTitle.textContent = currentStep.stepTitle;
    if (stepDesc) stepDesc.textContent = currentStep.stepExplain;
    if (stepCounter) {
      stepCounter.textContent = `Line ${this.activeLineIdx + 1} of ${scenario.lines.length} · Click any line or tab to inspect`;
    }

    // Also update the full-page background floating code streams in Hero
    if (bgLeft) {
      bgLeft.innerHTML = `
        <div style="color:var(--accent-primary);font-weight:700;margin-bottom:4px;">// ${escapeHtml(scenario.fileName)} (${escapeHtml(scenario.language)})</div>
        <div>${currentStep.code}</div>
        <div style="margin-top:6px;font-family:var(--font-sans);font-size:0.72rem;color:var(--text-primary);">
          <strong>Explaining:</strong> ${escapeHtml(currentStep.stepExplain)}
        </div>
      `;
    }
    if (bgRight) {
      const nextScenario = LIVE_CODE_SCENARIOS[(this.activeScenarioIdx + 1) % LIVE_CODE_SCENARIOS.length];
      const nextLine = nextScenario.lines[this.activeLineIdx % nextScenario.lines.length];
      bgRight.innerHTML = `
        <div style="color:var(--accent-secondary);font-weight:700;margin-bottom:4px;">// ${escapeHtml(nextScenario.fileName)}</div>
        <div>${nextLine.code}</div>
        <div style="margin-top:6px;font-family:var(--font-sans);font-size:0.72rem;color:var(--text-primary);">
          <strong>Architecture:</strong> ${escapeHtml(nextLine.stepTitle)}
        </div>
      `;
    }
  }

  initScrollReveals() {
    document.documentElement.classList.add('js-reveal-ready');
    const elements = document.querySelectorAll('.reveal:not(.is-revealed)');
    if (elements.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
      );
    }

    elements.forEach((el) => this.observer.observe(el));
  }

  startSpecialtyRotator(specialties = []) {
    if (this.specialtyTimer) {
      clearInterval(this.specialtyTimer);
    }

    const targetEl = document.getElementById('heroDynamicSpecialty');
    if (!targetEl) return;

    const list = Array.isArray(specialties) && specialties.length > 0
      ? specialties
      : ['Full Stack Systems', 'Distributed Architectures', 'AI Applications'];

    targetEl.textContent = list[0];
    if (list.length <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.specialtyIndex = 0;
    this.specialtyTimer = setInterval(() => {
      if (document.hidden) return;
      this.specialtyIndex = (this.specialtyIndex + 1) % list.length;
      targetEl.style.opacity = '0';
      setTimeout(() => {
        targetEl.textContent = list[this.specialtyIndex];
        targetEl.style.opacity = '1';
      }, 180);
    }, 3400);
  }
}
const animationController = new AnimationController();


/* === MODULE: js/skills.js === */
/**
 * ==========================================================================
 * INTERACTIVE 3D SKILL CONSTELLATION & COMPACT SKILL PILL/CHIP MATRIX
 * ==========================================================================
 * Keeps the rotating circular/orbit animation intact in the center and
 * renders the bottom skill badges as compact, neatly formatted pill/chip
 * templates across balanced rows.
 */
class SkillsController {
  constructor() {
    this.skills = [];
    this.activeCategory = 'All';
    this.selectedSkill = null;
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.rotAngle = 0;
    this.rafId = null;
  }

  render(skillsList = []) {
    this.skills = Array.isArray(skillsList) ? skillsList : [];
    if (this.skills.length > 0 && !this.selectedSkill) {
      this.selectedSkill = this.skills[0];
    } else if (this.selectedSkill) {
      const updated = this.skills.find((s) => s.id === this.selectedSkill.id);
      this.selectedSkill = updated || this.skills[0] || null;
    }

    this.renderCategoryFilters();
    this.renderSkillsPills();
    this.renderInspector(this.selectedSkill);
    this.initConstellationCanvas();
  }

  getCategories() {
    const defaultCats = [
      'Frontend Development',
      'Backend Development',
      'Programming Languages',
      'Databases',
      'APIs & Real-Time Communication',
      'AI & Automation',
      'DevOps & Deployment',
      'Development Tools'
    ];
    const dynamicCats = new Set(this.skills.map((s) => s.category).filter(Boolean));
    defaultCats.forEach((c) => dynamicCats.add(c));
    return ['All', ...Array.from(dynamicCats)];
  }

  renderCategoryFilters() {
    const filterContainer = document.getElementById('skillsCategoryFilters');
    if (!filterContainer) return;

    const categories = this.getCategories().filter(
      (cat) => cat === 'All' || this.skills.some((s) => s.category === cat)
    );

    filterContainer.innerHTML = categories
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-skill-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    filterContainer.querySelectorAll('[data-skill-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-skill-cat');
        this.renderCategoryFilters();
        this.renderSkillsPills();
        this.buildConstellationNodes();
      });
    });
  }

  getFilteredSkills() {
    if (this.activeCategory === 'All') return this.skills;
    return this.skills.filter((s) => s.category === this.activeCategory);
  }

  /**
   * Renders compact, balanced pill/chip templates across neat rows
   * instead of oversized cards.
   */
  renderSkillsPills() {
    const grid = document.getElementById('skillsGridContainer');
    if (!grid) return;

    const filtered = this.getFilteredSkills();
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state">No skills published in this category yet.</div>`;
      return;
    }

    grid.className = 'skills-pills-matrix';
    grid.innerHTML = filtered
      .map((skill) => {
        const isSelected = this.selectedSkill && this.selectedSkill.id === skill.id;
        return `
          <button type="button"
                  class="skill-chip-pill ${isSelected ? 'is-selected' : ''}"
                  aria-label="Inspect skill ${escapeHtml(skill.name)}"
                  data-skill-id="${escapeHtml(skill.id)}">
            <span class="skill-chip-pill__icon">${escapeHtml(skill.icon || skill.name.slice(0, 2).toUpperCase())}</span>
            <span class="skill-chip-pill__name">${escapeHtml(skill.name)}</span>
            ${
              skill.proficiency
                ? `<span class="skill-chip-pill__tag">${escapeHtml(skill.proficiency)}</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-skill-id]').forEach((pill) => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-skill-id');
        const found = this.skills.find((s) => s.id === id);
        if (found) {
          this.selectedSkill = found;
          this.renderInspector(found);
          this.renderSkillsPills();
          this.drawConstellationFrame();
        }
      });
    });
  }

  renderInspector(skill) {
    const inspector = document.getElementById('skillConstellationInspector');
    if (!inspector) return;

    if (!skill) {
      inspector.innerHTML = `<p style="color:var(--text-muted);">Select any node in the 3D orbit or click a skill pill below to inspect details.</p>`;
      return;
    }

    const related = Array.isArray(skill.related_projects) ? skill.related_projects : [];
    inspector.innerHTML = `
      <div style="min-width:0;">
        <span class="section-eyebrow" style="margin-bottom:0.5rem;">SELECTED NODE TELEMETRY</span>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.65rem;">
          <h3 style="font-size:1.3rem;overflow-wrap:break-word;">${escapeHtml(skill.name)}</h3>
          ${skill.proficiency ? `<span class="badge badge--accent">${escapeHtml(skill.proficiency)}</span>` : ''}
        </div>
        <p class="mono" style="font-size:0.74rem;color:var(--accent-primary);margin-bottom:0.65rem;overflow-wrap:break-word;">
          Domain // ${escapeHtml(skill.category)}
        </p>
        <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.6;overflow-wrap:break-word;">
          ${escapeHtml(skill.description || 'Core technology in Saksham Pandey’s NexVora engineering stack.')}
        </p>
      </div>
      <div style="min-width:0;">
        <span class="mono" style="font-size:0.68rem;text-transform:uppercase;color:var(--text-muted);display:block;margin-bottom:0.45rem;">
          Associated Architecture &amp; Projects
        </span>
        ${
          related.length > 0
            ? `<div class="tag-list">${related
                .map((r) => `<a href="projects.html" class="tech-tag" style="border-color:var(--border-accent);">${escapeHtml(r)}</a>`)
                .join('')}</div>`
            : `<span style="font-size:0.8rem;color:var(--text-muted);">Applied across NexVora full-stack architecture</span>`
        }
      </div>
    `;
  }

  initConstellationCanvas() {
    this.canvas = document.getElementById('skillConstellationCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    this.buildConstellationNodes();

    if (!this.canvas.dataset.bound) {
      this.canvas.dataset.bound = 'true';
      window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let closest = null;
        let minDist = 36;
        this.nodes.forEach((n) => {
          const d = Math.hypot(n.screenX - mx, n.screenY - my);
          if (d < minDist) {
            minDist = d;
            closest = n;
          }
        });

        if (closest) {
          this.selectedSkill = closest.skill;
          this.renderInspector(closest.skill);
          this.renderSkillsPills();
          this.drawConstellationFrame();
        }
      });

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        this.drawConstellationFrame();
      } else {
        const loop = () => {
          if (!document.hidden) {
            this.rotAngle += 0.0045;
            this.drawConstellationFrame();
          }
          this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
      }
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(260, rect.width);
    this.height = Math.max(260, rect.height);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  buildConstellationNodes() {
    const list = this.getFilteredSkills();
    const total = list.length || 1;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    this.nodes = list.map((skill, i) => {
      const y = total === 1 ? 0 : 1 - (i / (total - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      return {
        skill,
        x: Math.cos(theta) * radius,
        y: y * 0.78,
        z: Math.sin(theta) * radius,
        screenX: 0,
        screenY: 0,
        scale: 1
      };
    });
  }

  drawConstellationFrame() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const sphereRadius = Math.min(this.width, this.height) * 0.35;

    // Draw subtle circular orbital tracks in the center
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(26, 117, 255, 0.16)' : 'rgba(26, 117, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const cosA = Math.cos(this.rotAngle);
    const sinA = Math.sin(this.rotAngle);

    this.nodes.forEach((node) => {
      const rx = node.x * cosA - node.z * sinA;
      const rz = node.z * cosA + node.x * sinA;
      const perspective = 2.8 / (2.8 - rz * 0.85);
      node.screenX = cx + rx * sphereRadius * perspective;
      node.screenY = cy + node.y * sphereRadius * perspective;
      node.depth = rz;
      node.scale = perspective;
    });

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const sameCategory = n1.skill.category === n2.skill.category;
        const dist = Math.hypot(n1.screenX - n2.screenX, n1.screenY - n2.screenY);
        if (sameCategory || dist < sphereRadius * 0.82) {
          ctx.beginPath();
          ctx.moveTo(n1.screenX, n1.screenY);
          ctx.lineTo(n2.screenX, n2.screenY);
          ctx.strokeStyle = sameCategory
            ? 'rgba(242, 140, 40, 0.36)'
            : isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(22,22,26,0.08)';
          ctx.lineWidth = sameCategory ? 1.4 : 0.9;
          ctx.stroke();
        }
      }
    }

    const sorted = [...this.nodes].sort((a, b) => a.depth - b.depth);
    sorted.forEach((node) => {
      const isSelected = this.selectedSkill && this.selectedSkill.id === node.skill.id;
      const r = (isSelected ? 8.5 : 5.5) * node.scale;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(242, 140, 40, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#F28C28' : isDark ? '#4CC9FF' : '#16161A';
      ctx.fill();

      ctx.font = `${isSelected ? '700' : '600'} 11px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = isSelected
        ? '#F28C28'
        : isDark
        ? 'rgba(245,245,247,0.88)'
        : 'rgba(22,22,26,0.88)';
      ctx.fillText(node.skill.name, node.screenX + r + 5, node.screenY + 3.5);
    });
  }
}
const skillsController = new SkillsController();


/* === MODULE: js/projects.js === */
/**
 * ==========================================================================
 * 3D PROJECTS SHOWCASE, FILTERING, SEARCH & CASE STUDY MODAL
 * ==========================================================================
 */
class ProjectsController {
  constructor() {
    this.projects = [];
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.currentModalIndex = -1;
    this.releaseFocusTrap = null;
    this.boundEvents = false;
  }

  render(projectsList = []) {
    this.projects = Array.isArray(projectsList) ? projectsList : [];
    this.renderFilters();
    this.renderGrid();
    this.bindEvents();
  }

  getCategories() {
    const cats = new Set(this.projects.map((p) => p.category).filter(Boolean));
    return ['All', 'Featured', ...Array.from(cats)];
  }

  renderFilters() {
    const container = document.getElementById('projectCategoryFilters');
    if (!container) return;

    const categories = this.getCategories();
    container.innerHTML = categories
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-project-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('[data-project-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-project-cat');
        this.renderFilters();
        this.renderGrid();
      });
    });
  }

  getFilteredProjects() {
    return this.projects.filter((proj) => {
      const matchesCat =
        this.activeCategory === 'All' ||
        (this.activeCategory === 'Featured' && proj.featured) ||
        proj.category === this.activeCategory;

      if (!matchesCat) return false;
      if (!this.searchQuery) return true;

      const q = this.searchQuery.toLowerCase();
      const haystack = [
        proj.title,
        proj.summary,
        proj.description,
        proj.category,
        ...(Array.isArray(proj.tech_stack) ? proj.tech_stack : [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  renderGrid() {
    const grid = document.getElementById('projectsGridContainer');
    if (!grid) return;

    const filtered = this.getFilteredProjects();
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3 style="font-size:1.2rem;margin-bottom:0.5rem;">No matching projects found</h3>
          <p style="margin-bottom:1rem;">Try clearing your search filter or selecting another architecture category.</p>
          <button type="button" class="btn btn--secondary btn--sm" id="resetProjectFiltersBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetProjectFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.activeCategory = 'All';
          this.searchQuery = '';
          const searchInput = document.getElementById('projectSearchInput');
          if (searchInput) searchInput.value = '';
          this.renderFilters();
          this.renderGrid();
        });
      }
      return;
    }

    grid.innerHTML = filtered
      .map((proj) => {
        const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
        const cover = sanitizeUrl(proj.cover_image || 'assets/images/project-nexvora-mesh.svg');
        return `
          <article class="card-3d project-card" data-project-id="${escapeHtml(proj.id)}">
            <div class="project-card__media">
              <div class="project-card__badges">
                <span class="badge">${escapeHtml(proj.category || 'Engineering')}</span>
                ${proj.featured ? `<span class="badge badge--accent">★ Featured</span>` : ''}
              </div>
              <img src="${escapeHtml(cover)}"
                   alt="${escapeHtml(proj.title)} architectural preview"
                   class="project-card__img"
                   loading="lazy" />
            </div>
            <div class="project-card__body">
              <h3 class="project-card__title">${escapeHtml(proj.title)}</h3>
              <p class="project-card__summary">${escapeHtml(proj.summary)}</p>
              <div class="tag-list">
                ${stack.slice(0, 6).map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
              <div class="project-card__footer">
                <button type="button"
                        class="btn btn--primary btn--sm"
                        data-open-case-study="${escapeHtml(proj.id)}">
                  Case Study &amp; Architecture
                </button>
                <div style="display:flex;gap:0.4rem;">
                  ${
                    proj.github_url
                      ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn--secondary btn--sm"
                            aria-label="GitHub Repository for ${escapeHtml(proj.title)}">Repo</a>`
                      : ''
                  }
                  ${
                    proj.live_url
                      ? `<a href="${escapeHtml(sanitizeUrl(proj.live_url))}"
                            target="${proj.live_url.startsWith('#') ? '_self' : '_blank'}"
                            rel="noopener noreferrer"
                            class="btn btn--secondary btn--sm"
                            aria-label="Live Demo for ${escapeHtml(proj.title)}">Live ↗</a>`
                      : ''
                  }
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-open-case-study]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-case-study');
        this.openCaseStudyModal(id);
      });
    });

    initCard3DTilt();
  }

  bindEvents() {
    if (this.boundEvents) return;
    this.boundEvents = true;

    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        debounce((e) => {
          this.searchQuery = e.target.value.trim();
          this.renderGrid();
        }, 150)
      );
    }

    const modalBackdrop = document.getElementById('projectCaseStudyModal');
    const closeBtn = document.getElementById('closeProjectModalBtn');
    const prevBtn = document.getElementById('prevProjectModalBtn');
    const nextBtn = document.getElementById('nextProjectModalBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeModal();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateModal(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateModal(1));
    }
  }

  openCaseStudyModal(projectId) {
    const list = this.getFilteredProjects();
    const index = list.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    this.currentModalIndex = index;
    this.populateModal(list[index], index, list.length);

    const modal = document.getElementById('projectCaseStudyModal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (this.releaseFocusTrap) this.releaseFocusTrap();
    this.releaseFocusTrap = trapFocus(modal, () => this.closeModal());

    const closeBtn = document.getElementById('closeProjectModalBtn');
    if (closeBtn) closeBtn.focus();
  }

  navigateModal(delta) {
    const list = this.getFilteredProjects();
    if (list.length === 0) return;
    this.currentModalIndex = (this.currentModalIndex + delta + list.length) % list.length;
    this.populateModal(list[this.currentModalIndex], this.currentModalIndex, list.length);
  }

  populateModal(proj, index, total) {
    const titleEl = document.getElementById('modalProjectTitle');
    const bodyEl = document.getElementById('modalProjectBody');
    const counterEl = document.getElementById('modalProjectCounter');

    if (titleEl) titleEl.textContent = proj.title;
    if (counterEl) counterEl.textContent = `Project ${index + 1} of ${total}`;
    if (!bodyEl) return;

    const features = Array.isArray(proj.key_features) ? proj.key_features : [];
    const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
    const screenshots = Array.isArray(proj.screenshots) && proj.screenshots.length > 0
      ? proj.screenshots
      : [proj.cover_image || 'assets/images/project-nexvora-mesh.svg'];

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div style="border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--border-subtle);background:var(--bg-secondary);">
          <img id="modalActiveScreenshot"
               src="${escapeHtml(sanitizeUrl(screenshots[0]))}"
               alt="${escapeHtml(proj.title)} screenshot"
               style="width:100%;max-height:360px;object-fit:cover;" />
        </div>

        ${
          screenshots.length > 1
            ? `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                ${screenshots
                  .map(
                    (shot, i) => `
                  <button type="button"
                          class="btn btn--secondary btn--sm"
                          data-shot-url="${escapeHtml(sanitizeUrl(shot))}">
                    View Visual ${i + 1}
                  </button>`
                  )
                  .join('')}
               </div>`
            : ''
        }

        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
          <div class="tag-list">
            <span class="badge badge--accent">${escapeHtml(proj.category || 'Systems')}</span>
            ${stack.map((s) => `<span class="tech-tag">${escapeHtml(s)}</span>`).join('')}
          </div>
          <div style="display:flex;gap:0.75rem;">
            ${
              proj.github_url
                ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">GitHub Repository ↗</a>`
                : ''
            }
            ${
              proj.live_url
                ? `<a href="${escapeHtml(sanitizeUrl(proj.live_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">Launch Live Demo ↗</a>`
                : ''
            }
          </div>
        </div>

        <div>
          <h4 style="margin-bottom:0.5rem;">Architecture Overview</h4>
          <p>${escapeHtml(proj.description)}</p>
          ${proj.case_study ? `<p style="margin-top:0.5rem;">${escapeHtml(proj.case_study)}</p>` : ''}
        </div>

        ${
          features.length > 0
            ? `<div>
                <h4 style="margin-bottom:0.5rem;">Key Engineering Capabilities</h4>
                <ul class="timeline-item__highlights">
                  ${features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
                </ul>
              </div>`
            : ''
        }

        <div class="form-row">
          <div style="background:var(--bg-secondary);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem;margin-bottom:0.4rem;color:var(--accent-primary);">Technical Challenges</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.technical_challenges || 'Designed for concurrency and clean modular boundaries.')}</p>
          </div>
          <div style="background:var(--bg-secondary);padding:1.25rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem;margin-bottom:0.4rem;color:var(--accent-primary);">Solutions &amp; Tradeoffs</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.solutions_tradeoffs || 'Balanced latency, reliability, and maintainability.')}</p>
          </div>
        </div>

        <div class="form-row">
          <div>
            <h4 style="font-size:0.95rem;margin-bottom:0.35rem;">My Contribution</h4>
            <p style="font-size:0.88rem;">${escapeHtml(proj.my_contribution || 'End-to-end architecture and implementation.')}</p>
          </div>
          ${
            proj.measurable_outcomes
              ? `<div>
                  <h4 style="font-size:0.95rem;margin-bottom:0.35rem;">Outcomes &amp; Verification</h4>
                  <p style="font-size:0.88rem;">${escapeHtml(proj.measurable_outcomes)}</p>
                </div>`
              : ''
          }
        </div>
      </div>
    `;

    bodyEl.querySelectorAll('[data-shot-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const img = document.getElementById('modalActiveScreenshot');
        if (img) img.src = btn.getAttribute('data-shot-url');
      });
    });
  }

  closeModal() {
    const modal = document.getElementById('projectCaseStudyModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }
}
const projectsController = new ProjectsController();


/* === MODULE: js/resumes.js === */
/**
 * ==========================================================================
 * MULTIPLE RESUMES & CV MANAGEMENT HUB — PREVIEW & DOWNLOAD CONTROLLER
 * ==========================================================================
 */
class ResumesController {
  constructor() {
    this.resumes = [];
    this.activeCategory = 'All';
    this.releaseFocusTrap = null;
    this.boundModalEvents = false;
  }

  render(resumesList = []) {
    // Strictly show only published resumes on public site
    this.resumes = (Array.isArray(resumesList) ? resumesList : []).filter(
      (r) => r.published !== false
    );

    this.updateHeroFeaturedButton();
    this.renderCategoryFilters();
    this.renderResumesGrid();
    this.bindModalEvents();
  }

  updateHeroFeaturedButton() {
    const heroResumeBtn = document.getElementById('heroFeaturedResumeBtn');
    if (!heroResumeBtn) return;

    const featured = this.resumes.find((r) => r.featured) || this.resumes[0];
    if (!featured) {
      heroResumeBtn.style.display = 'none';
      return;
    }

    heroResumeBtn.style.display = 'inline-flex';
    heroResumeBtn.onclick = (e) => {
      e.preventDefault();
      this.triggerDownload(featured);
    };
  }

  renderCategoryFilters() {
    const container = document.getElementById('resumeCategoryFilters');
    if (!container) return;

    const cats = ['All', ...new Set(this.resumes.map((r) => r.category).filter(Boolean))];
    container.innerHTML = cats
      .map(
        (cat) => `
        <button type="button"
                class="filter-pill ${this.activeCategory === cat ? 'is-active' : ''}"
                data-resume-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('[data-resume-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-resume-cat');
        this.renderCategoryFilters();
        this.renderResumesGrid();
      });
    });
  }

  renderResumesGrid() {
    const grid = document.getElementById('resumesGridContainer');
    if (!grid) return;

    const filtered =
      this.activeCategory === 'All'
        ? this.resumes
        : this.resumes.filter((r) => r.category === this.activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No published resumes in this category yet. Manage resume versions in the Admin Dashboard.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((res) => {
        return `
          <article class="card-3d resume-card ${res.featured ? 'resume-card--featured' : ''}">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.85rem;">
                <span class="badge">${escapeHtml(res.category || 'Targeted CV')}</span>
                <div style="display:flex;gap:0.4rem;align-items:center;">
                  ${res.featured ? `<span class="badge badge--accent">★ Featured CV</span>` : ''}
                  <span class="mono" style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(res.version || 'v1.0')}</span>
                </div>
              </div>
              <h3 style="font-size:1.25rem;margin-bottom:0.35rem;">${escapeHtml(res.title)}</h3>
              <p class="mono" style="font-size:0.78rem;color:var(--accent-primary);margin-bottom:0.75rem;">
                Target Role: ${escapeHtml(res.target_role || res.category)}
              </p>
              <p style="font-size:0.9rem;color:var(--text-secondary);">
                ${escapeHtml(res.description || '')}
              </p>
            </div>

            <div>
              <div class="resume-card__preview-sheet" style="margin-bottom:1rem;">
                <div>
                  <span class="mono" style="font-size:0.72rem;color:var(--text-primary);display:block;font-weight:600;">
                    PDF // ${escapeHtml(res.file_name || 'Saksham_Pandey_Resume.pdf')}
                  </span>
                  <span style="font-size:0.75rem;color:var(--text-muted);">
                    Updated ${escapeHtml(formatDate(res.updated_at))} · ${escapeHtml(res.file_size || 'PDF')}
                  </span>
                </div>
                <span class="badge" title="Total downloads">↓ ${Number(res.download_count) || 0}</span>
              </div>

              <div class="resume-card__actions">
                <button type="button"
                        class="btn btn--primary btn--sm"
                        data-download-resume="${escapeHtml(res.id)}">
                  Download PDF ↓
                </button>
                <button type="button"
                        class="btn btn--secondary btn--sm"
                        data-preview-resume="${escapeHtml(res.id)}">
                  Preview in Browser
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-download-resume]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = this.resumes.find((r) => r.id === btn.getAttribute('data-download-resume'));
        if (target) this.triggerDownload(target);
      });
    });

    grid.querySelectorAll('[data-preview-resume]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = this.resumes.find((r) => r.id === btn.getAttribute('data-preview-resume'));
        if (target) this.openPreviewModal(target);
      });
    });

    initCard3DTilt();
  }

  async triggerDownload(resume) {
    try {
      const resolvedUrl = await storageService.resolveFileUrl(resume.file_url);
      const safeDownloadName =
        resume.file_name || `Saksham_Pandey_${slugify(resume.target_role || resume.title)}.pdf`;

      const link = document.createElement('a');
      link.href = resolvedUrl;
      link.download = safeDownloadName.endsWith('.pdf') ? safeDownloadName : `${safeDownloadName}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();

      await repository.incrementResumeDownload(resume.id);
      this.renderResumesGrid();
      showToast(`Downloading ${safeDownloadName}`, 'success');
    } catch (err) {
      showToast(`Unable to download PDF: ${err.message}`, 'error');
    }
  }

  async openPreviewModal(resume) {
    const modal = document.getElementById('resumePreviewModal');
    const titleEl = document.getElementById('modalResumeTitle');
    const frameContainer = document.getElementById('modalResumeFrameContainer');
    const downloadBtn = document.getElementById('modalResumeDownloadBtn');

    if (!modal || !frameContainer) return;

    const resolvedUrl = await storageService.resolveFileUrl(resume.file_url);
    if (titleEl) {
      titleEl.textContent = `${resume.title} (${resume.version || 'v1.0'})`;
    }

    frameContainer.innerHTML = `
      <iframe src="${escapeHtml(resolvedUrl)}"
              title="${escapeHtml(resume.title)} PDF Preview"
              style="width:100%;height:70vh;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);background:#FFFFFF;">
      </iframe>
    `;

    if (downloadBtn) {
      downloadBtn.onclick = () => this.triggerDownload(resume);
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (this.releaseFocusTrap) this.releaseFocusTrap();
    this.releaseFocusTrap = trapFocus(modal, () => this.closePreviewModal());
  }

  closePreviewModal() {
    const modal = document.getElementById('resumePreviewModal');
    const frameContainer = document.getElementById('modalResumeFrameContainer');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (frameContainer) frameContainer.innerHTML = '';
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }

  bindModalEvents() {
    if (this.boundModalEvents) return;
    this.boundModalEvents = true;

    const modal = document.getElementById('resumePreviewModal');
    const closeBtn = document.getElementById('closeResumeModalBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePreviewModal());
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closePreviewModal();
      });
    }
  }
}
const resumesController = new ResumesController();


/* === MODULE: js/contact.js === */
/**
 * ==========================================================================
 * CONTACT & OFFICIAL WHATSAPP (wa.me) INTEGRATION CONTROLLER
 * ==========================================================================
 */
class ContactController {
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
const contactController = new ContactController();


/* === MODULE: js/app.js === */
/**
 * ==========================================================================
 * MAIN PUBLIC PORTFOLIO ORCHESTRATOR — SAKSHAM PANDEY | NEXVORA TECHNOLOGIES
 * ==========================================================================
 * Supports multi-page architecture (index.html, about.html, projects.html,
 * contact.html) as well as unified single-page sections, with ambient 3D
 * particle + terminal canvas, rotating circular skill orbit, compact skill
 * pills, and real-time synchronization.
 */











class PortfolioApp {
  constructor() {
    this.ambientBg = new Ambient3DBackground('ambient3dBgCanvas');
    this.heroScene = new Hero3DScene('hero3dCanvas');
    this.activeTimelineTab = 'all';
    this.activeAchievementTab = 'all';
  }

  async init() {
    await repository.init();
    const data = repository.getPublicData();

    themeController.init(data.theme_settings);
    this.ambientBg.init();
    animationController.initOpeningSequence(data.theme_settings);
    animationController.initLiveCodeExplainer();
    this.renderSyncBanner();
    this.renderAll(data);
    this.heroScene.init(data.hero?.sculpture_mode || 'crystalline');

    // Subscribe to real-time updates from the Admin CMS
    repository.subscribe((updatedPublicData) => {
      themeController.init(updatedPublicData.theme_settings);
      this.renderSyncBanner();
      this.renderAll(updatedPublicData);
    });
  }

  renderSyncBanner() {
    const banner = document.getElementById('syncStatusBanner');
    if (!banner) return;

    banner.innerHTML = `
      <span class="sync-banner__dot" style="background:var(--status-success);box-shadow:0 0 8px var(--status-success);"></span>
      <span><strong>NexVora Technologies:</strong> Empowering the Future Through Technology · Ranchi, India · Available Worldwide</span>
    `;
  }

  renderAll(data) {
    this.applySeoMeta(data.seo_settings, data.profile);
    navigationController.render(data.navigation_settings, data.profile);
    this.renderHero(data.profile, data.hero);
    this.renderAbout(data.profile, data.about);
    this.renderAgencyServices(data.about);
    skillsController.render(data.skills);
    this.renderTimeline(data.experiences, data.education);
    projectsController.render(data.projects);
    this.renderFeaturedProjectsPreview(data.projects);
    this.renderAchievements(data.achievements, data.certifications);
    resumesController.render(data.resumes);
    contactController.render(
      data.contact_settings,
      data.whatsapp_settings,
      data.social_links,
      data.profile
    );
    this.renderFooter(data.profile, data.site_settings, data.social_links, data.navigation_settings);

    animationController.initScrollReveals();
    initCard3DTilt();
  }

  applySeoMeta(seo = {}, profile = {}) {
    const page = navigationController.detectCurrentPage();
    const baseTitle =
      seo.site_title ||
      `${profile.full_name || 'Saksham Pandey'} | ${profile.brand_name || 'NexVora Technologies'}`;

    if (page === 'about.html') {
      document.title = `About & Agency Services — ${baseTitle}`;
    } else if (page === 'projects.html') {
      document.title = `Projects, Case Studies & Resumes — ${baseTitle}`;
    } else if (page === 'contact.html') {
      document.title = `Contact & Direct WhatsApp — ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    const setMeta = (selector, attr, value) => {
      if (!value) return;
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', seo.meta_description || profile.short_bio);
    setMeta('meta[property="og:title"]', 'content', seo.og_title || seo.site_title);
    setMeta('meta[property="og:description"]', 'content', seo.og_description || seo.meta_description);
    setMeta('meta[property="og:image"]', 'content', seo.og_image);
  }

  renderHero(profile = {}, hero = {}) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };

    setText('heroEyebrow', hero.eyebrow || `${profile.brand_name || 'NEXVORA TECHNOLOGIES'} // STUDIO`);
    setText('heroTitlePrefix', hero.title_prefix || 'Engineering Dimensional,');
    setText('heroTitleHighlight', hero.title_highlight || 'High-Throughput');
    setText('heroTitleSuffix', hero.title_suffix || 'Digital Systems.');
    setText('heroHeadlineText', `${profile.full_name || 'Saksham Pandey'} — ${profile.headline || ''}`);
    setText('heroSubtitleText', hero.subtitle || profile.short_bio || '');
    setText('heroMetaLocation', profile.location || 'Ranchi, Jharkhand, India');
    setText('heroMetaBrand', profile.brand_name || 'NEXVORA TECHNOLOGIES');
    setText('heroMetaRelocation', profile.relocation_preference || 'Global Remote & India');

    setText('spatialTopLabel', hero.telemetry_top_label || 'NEXVORA STUDIO');
    setText('spatialTopValue', hero.telemetry_top_value || 'AI · Web · ERP · CRM');
    setText('spatialBottomLabel', hero.telemetry_bottom_label || 'PRIMARY STACK');
    setText('spatialBottomValue', hero.telemetry_bottom_value || 'TS · Python · FastAPI · Node');

    const profileImg = document.getElementById('heroProfileImage');
    if (profileImg && profile.avatar_url) {
      profileImg.src = sanitizeUrl(profile.avatar_url);
    }

    const availBadge = document.getElementById('heroAvailabilityBadge');
    const availText = document.getElementById('heroAvailabilityText');
    if (availBadge) {
      availBadge.style.display = profile.show_availability === false ? 'none' : 'inline-flex';
    }
    if (availText) {
      availText.textContent = profile.availability_text || 'Available for Opportunities & Client Projects';
    }

    const primaryCta = document.getElementById('heroPrimaryCta');
    if (primaryCta) {
      primaryCta.textContent = hero.primary_cta_label || 'Explore Projects';
      primaryCta.setAttribute('href', hero.primary_cta_target || 'projects.html');
    }

    const secondaryCta = document.getElementById('heroSecondaryCta');
    if (secondaryCta) {
      secondaryCta.textContent = hero.secondary_cta_label || 'View Resumes & CV';
      secondaryCta.setAttribute('href', hero.secondary_cta_target || 'projects.html#resumes');
    }

    animationController.startSpecialtyRotator(hero.specialties);
  }

  renderAbout(profile = {}, about = {}) {
    const narrativeEl = document.getElementById('aboutNarrativeContent');
    if (narrativeEl) {
      const blocks = [
        { label: 'Founder & Engineering Overview', text: about.introduction },
        { label: 'Technical Architecture & Interests', text: about.technical_interests },
        { label: 'Core Engineering Strengths', text: about.professional_strengths },
        { label: 'Working Philosophy', text: about.working_style },
        {
          label: 'Current Focus & NexVora Vision',
          text: `${about.current_focus || ''} ${about.career_goals || ''}`.trim()
        }
      ].filter((b) => b.text);

      narrativeEl.innerHTML = blocks
        .map(
          (b) => `
          <div style="margin-bottom:1.35rem;min-width:0;">
            <span class="mono" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent-primary);display:block;margin-bottom:0.25rem;overflow-wrap:break-word;">
              // ${escapeHtml(b.label)}
            </span>
            <p style="color:var(--text-secondary);margin:0;overflow-wrap:break-word;">${escapeHtml(b.text)}</p>
          </div>
        `
        )
        .join('');
    }

    const pillarsEl = document.getElementById('aboutPillarsContainer');
    if (pillarsEl && Array.isArray(about.pillars)) {
      pillarsEl.innerHTML = about.pillars
        .map(
          (p, i) => `
          <article class="card-3d pillar-card">
            <div class="pillar-card__icon">${escapeHtml(p.code || `0${i + 1}`)}</div>
            <div style="min-width:0;">
              <h3 class="pillar-card__title">${escapeHtml(p.title)}</h3>
              <p class="pillar-card__desc">${escapeHtml(p.description)}</p>
            </div>
          </article>
        `
        )
        .join('');
    }

    const aboutProfileImg = document.getElementById('aboutProfileImage');
    if (aboutProfileImg && profile.avatar_url) {
      aboutProfileImg.src = sanitizeUrl(profile.avatar_url);
    }
  }

  renderAgencyServices(about = {}) {
    const grid = document.getElementById('agencyServicesGrid');
    if (!grid) return;

    const services = Array.isArray(about.agency_services)
      ? about.agency_services
      : [
          {
            code: 'NV-01',
            title: 'AI Automation & Intelligent Agents',
            description: 'Custom LLM workflows, RAG knowledge pipelines, and automated business processes.'
          },
          {
            code: 'NV-02',
            title: 'Mobile & Web Application Engineering',
            description: 'Responsive, high-performance web platforms and cross-platform mobile applications.'
          },
          {
            code: 'NV-03',
            title: 'ERP, CRM & Management Software',
            description: 'Tailored enterprise resource planning, customer management, and real-time analytics dashboards.'
          },
          {
            code: 'NV-04',
            title: 'UI/UX Design & Digital Transformation',
            description: '3D interactive web experiences, design systems, and end-to-end cloud modernization.'
          }
        ];

    grid.innerHTML = services
      .map(
        (srv) => `
        <article class="card-3d service-agency-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <span class="badge badge--accent">${escapeHtml(srv.code)}</span>
            <span class="mono" style="font-size:0.72rem;color:var(--text-muted);">NEXVORA SOLUTIONS</span>
          </div>
          <h3 style="font-size:1.18rem;margin-bottom:0.5rem;overflow-wrap:break-word;">${escapeHtml(srv.title)}</h3>
          <p style="font-size:0.92rem;color:var(--text-secondary);margin-bottom:1.1rem;overflow-wrap:break-word;">${escapeHtml(srv.description)}</p>
          <a href="contact.html" class="btn btn--ghost btn--sm" style="padding-left:0;color:var(--accent-primary);">
            Discuss Solution →
          </a>
        </article>
      `
      )
      .join('');
  }

  renderFeaturedProjectsPreview(projects = []) {
    const previewGrid = document.getElementById('homeFeaturedProjectsGrid');
    if (!previewGrid) return;

    const featured = projects.filter((p) => p.featured).slice(0, 6);
    const list = featured.length > 0 ? featured : projects.slice(0, 6);

    previewGrid.innerHTML = list
      .map((proj) => {
        const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
        const cover = sanitizeUrl(proj.cover_image || 'assets/images/project-nexvora-mesh.svg');
        return `
          <article class="card-3d project-card">
            <div class="project-card__media">
              <div class="project-card__badges">
                <span class="badge">${escapeHtml(proj.category || 'Engineering')}</span>
                ${proj.featured ? `<span class="badge badge--accent">★ Featured</span>` : ''}
              </div>
              <img src="${escapeHtml(cover)}"
                   alt="${escapeHtml(proj.title)} architectural preview"
                   class="project-card__img"
                   loading="lazy" />
            </div>
            <div class="project-card__body">
              <h3 class="project-card__title">${escapeHtml(proj.title)}</h3>
              <p class="project-card__summary">${escapeHtml(proj.summary)}</p>
              <div class="tag-list">
                ${stack.slice(0, 5).map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
              <div class="project-card__footer">
                <a href="projects.html" class="btn btn--primary btn--sm">
                  Full Case Study →
                </a>
                ${
                  proj.github_url
                    ? `<a href="${escapeHtml(sanitizeUrl(proj.github_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">GitHub ↗</a>`
                    : ''
                }
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  renderTimeline(experiences = [], education = []) {
    const tabsContainer = document.getElementById('timelineFilterTabs');
    const listContainer = document.getElementById('timelineListContainer');
    if (!listContainer) return;

    const combined = [
      ...experiences.map((e) => ({ ...e, _group: 'experience' })),
      ...education.map((e) => ({ ...e, _group: 'education' }))
    ];

    const renderItems = () => {
      const filtered =
        this.activeTimelineTab === 'all'
          ? combined
          : combined.filter((item) => item._group === this.activeTimelineTab);

      if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">No timeline entries published in this view.</div>`;
        return;
      }

      listContainer.innerHTML = filtered
        .map((item) => {
          const start = formatDate(item.start_date);
          const end = item.is_current || !item.end_date ? 'Present' : formatDate(item.end_date);
          const highlights = Array.isArray(item.highlights) ? item.highlights : [];
          const techs = Array.isArray(item.technologies) ? item.technologies : [];

          return `
            <article class="card-3d timeline-item">
              <div class="timeline-item__header">
                <div style="min-width:0;">
                  <span class="badge" style="margin-bottom:0.4rem;">${escapeHtml(item.type || (item._group === 'education' ? 'Education' : 'Experience'))}</span>
                  <h3 class="timeline-item__role">${escapeHtml(item.title)}</h3>
                  <p class="timeline-item__org">
                    ${escapeHtml(item.organization)}
                    ${item.location ? `<span style="color:var(--text-muted);font-weight:400;"> · ${escapeHtml(item.location)}</span>` : ''}
                  </p>
                </div>
                <span class="timeline-item__dates">${escapeHtml(start)} — ${escapeHtml(end)}</span>
              </div>

              ${item.description ? `<p style="font-size:0.94rem;overflow-wrap:break-word;">${escapeHtml(item.description)}</p>` : ''}

              ${
                highlights.length > 0
                  ? `<ul class="timeline-item__highlights">
                      ${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
                     </ul>`
                  : ''
              }

              ${
                techs.length > 0
                  ? `<div class="tag-list" style="margin-top:1rem;">
                      ${techs.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
                     </div>`
                  : ''
              }

              ${
                item.external_link
                  ? `<div style="margin-top:0.85rem;">
                      <a href="${escapeHtml(sanitizeUrl(item.external_link))}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost btn--sm">
                        Verify / External Reference ↗
                      </a>
                     </div>`
                  : ''
              }
            </article>
          `;
        })
        .join('');

      initCard3DTilt();
    };

    if (tabsContainer && !tabsContainer.dataset.bound) {
      tabsContainer.dataset.bound = 'true';
      tabsContainer.querySelectorAll('[data-timeline-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeTimelineTab = btn.getAttribute('data-timeline-tab');
          tabsContainer.querySelectorAll('[data-timeline-tab]').forEach((b) =>
            b.classList.toggle('is-active', b === btn)
          );
          renderItems();
        });
      });
    }

    renderItems();
  }

  renderAchievements(achievements = [], certifications = []) {
    const grid = document.getElementById('achievementsGridContainer');
    const tabs = document.getElementById('achievementsFilterTabs');
    if (!grid) return;

    const allItems = [
      ...achievements.map((a) => ({ ...a, _kind: 'achievement' })),
      ...certifications.map((c) => ({ ...c, _kind: 'certification' }))
    ];

    const renderCards = () => {
      const filtered =
        this.activeAchievementTab === 'all'
          ? allItems
          : allItems.filter((x) => x._kind === this.activeAchievementTab);

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No published records in this category.</div>`;
        return;
      }

      grid.innerHTML = filtered
        .map(
          (item) => `
          <article class="card-3d resume-card">
            <div style="min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                <span class="badge badge--accent">${escapeHtml(item.category || (item._kind === 'certification' ? 'Certification' : 'Achievement'))}</span>
                <span class="mono" style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(item.date || '')}</span>
              </div>
              <h3 style="font-size:1.15rem;margin-bottom:0.35rem;overflow-wrap:break-word;">${escapeHtml(item.title)}</h3>
              <p class="mono" style="font-size:0.76rem;color:var(--accent-primary);margin-bottom:0.65rem;overflow-wrap:break-word;">
                Issuer // ${escapeHtml(item.issuer || 'Verified')}
              </p>
              <p style="font-size:0.9rem;color:var(--text-secondary);overflow-wrap:break-word;">
                ${escapeHtml(item.description || '')}
              </p>
            </div>
            ${
              item.credential_url
                ? `<div>
                    <a href="${escapeHtml(sanitizeUrl(item.credential_url))}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm">
                      Verify Credential ↗
                    </a>
                   </div>`
                : ''
            }
          </article>
        `
        )
        .join('');

      initCard3DTilt();
    };

    if (tabs && !tabs.dataset.bound) {
      tabs.dataset.bound = 'true';
      tabs.querySelectorAll('[data-ach-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeAchievementTab = btn.getAttribute('data-ach-tab');
          tabs.querySelectorAll('[data-ach-tab]').forEach((b) =>
            b.classList.toggle('is-active', b === btn)
          );
          renderCards();
        });
      });
    }

    renderCards();
  }

  renderFooter(profile = {}, siteSettings = {}, socialLinks = [], navSettings = {}) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };

    setText('footerBrandName', profile.full_name || 'Saksham Pandey');
    setText('footerCompanySub', profile.brand_name || 'NEXVORA TECHNOLOGIES');
    setText('footerTagline', siteSettings.footer_tagline || profile.short_bio || '');
    setText('footerAttribution', siteSettings.footer_attribution || 'Designed and engineered by Saksham Pandey · NexVora Technologies.');
    setText('footerPrivacyNotice', siteSettings.privacy_notice || '');
    setText('footerYear', String(new Date().getFullYear()));
    setText('footerCopyrightHolder', siteSettings.copyright_holder || 'Saksham Pandey · NEXVORA TECHNOLOGIES');

    const footerNav = document.getElementById('footerNavLinks');
    if (footerNav) {
      const links = [
        { label: 'Home & 3D Studio', href: 'index.html' },
        { label: 'About & Agency Services', href: 'about.html' },
        { label: 'Projects & Case Studies', href: 'projects.html' },
        { label: 'Resumes & CV Hub', href: 'projects.html#resumes' },
        { label: 'Contact & WhatsApp', href: 'contact.html' }
      ];
      footerNav.innerHTML = links
        .map(
          (item) =>
            `<li><a href="${escapeHtml(item.href)}" style="color:var(--text-secondary);font-size:0.9rem;">${escapeHtml(item.label)}</a></li>`
        )
        .join('');
    }

    const footerSocials = document.getElementById('footerSocialLinks');
    if (footerSocials && Array.isArray(socialLinks)) {
      footerSocials.innerHTML = socialLinks
        .map(
          (s) =>
            `<li><a href="${escapeHtml(sanitizeUrl(s.url))}" target="_blank" rel="noopener noreferrer" style="color:var(--text-secondary);font-size:0.9rem;overflow-wrap:break-word;">${escapeHtml(s.platform)} ↗</a></li>`
        )
        .join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.init();
});

})();
