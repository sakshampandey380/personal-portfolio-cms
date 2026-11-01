/**
 * ==========================================================================
 * OPENING SEQUENCE, FULL-PAGE LIVE CODING EXPLAINER & SCROLL STORYTELLING
 * ==========================================================================
 */

import { escapeHtml } from './utils.js';

const INTRO_SEEN_KEY = 'nexvora_intro_seen_session';

export const LIVE_CODE_SCENARIOS = [
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

export class AnimationController {
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

export const animationController = new AnimationController();
