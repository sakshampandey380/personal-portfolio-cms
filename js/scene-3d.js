/**
 * ==========================================================================
 * 3D SCENE ENGINE — AMBIENT 3D PARTICLE + TERMINAL CANVAS & HERO SCULPTURE
 * ==========================================================================
 * 1. Ambient3DBackground: Full-viewport 3D particle + floating tech glyphs +
 *    ambient code-typing terminal stream integrated into the background canvas.
 * 2. Hero3DScene: Interactive 3D Crystalline/Lattice/Orbital centerpiece.
 * 3. initCard3DTilt: 3D perspective card tilt with cursor specular glare.
 */

export class Ambient3DBackground {
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

export class Hero3DScene {
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

export function initCard3DTilt() {
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
