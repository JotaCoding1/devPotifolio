(function () {
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  const panel = document.getElementById("panel");

  const PROJECTS = [
    {
      name: "Study Manager",
      kind: "Desktop application",
      desc: "Independently developed full-stack desktop application with a modular architecture: a React frontend integrated with a Rust backend through Tauri, and local relational data persistence in SQLite.",
      facts: [["Role", "Solo build"], ["Bridge", "React ↔ Rust via Tauri"], ["Data", "SQLite"]],
      tags: ["React", "TypeScript", "Tauri", "Rust", "SQLite"],
    },
    {
      name: "Security Tools",
      kind: "Cybersecurity",
      desc: "A growing set of tools focused on system analysis and cybersecurity, including a network packet analyzer and utilities for Windows behaviour analysis and network traffic monitoring.",
      facts: [["Role", "Solo build"], ["Focus", "System analysis"], ["Status", "In development"]],
      tags: ["Python", "C", "Shell"],
    },
    {
      name: "???",
      kind: "Coming soon",
      desc: "An open slot in the graph — reserved for whatever gets built next.",
      facts: [["Status", "Placeholder"]],
      tags: ["TBD"],
    },
    {
      name: "???",
      kind: "Coming soon",
      desc: "Another open slot, waiting for a project to fill it.",
      facts: [["Status", "Placeholder"]],
      tags: ["TBD"],
    },
  ];

  /* ---------------- tag filters ---------------- */
  const filtersEl = document.getElementById("filters");
  const allTags = [...new Set(PROJECTS.flatMap((p) => p.tags))].sort();
  let activeTags = new Set();

  function renderFilters() {
    filtersEl.innerHTML = allTags
      .map((t) => `<button data-tag="${t}" class="${activeTags.has(t) ? "active" : ""}">${t}</button>`)
      .join("");
  }
  renderFilters();

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (activeTags.has(tag)) activeTags.delete(tag);
    else activeTags.add(tag);
    renderFilters();
  });

  function matchesFilter(p) {
    if (activeTags.size === 0) return true;
    return p.tags.some((t) => activeTags.has(t));
  }

  let W, H, DPR;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
  }

  const nodes = [];
  const ambient = [];
  const edges = [];

  function layout() {
    nodes.length = 0;
    ambient.length = 0;
    edges.length = 0;

    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.33;

    // core node
    nodes.push({ core: true, x: cx, y: cy, r: 16, label: "joao.dev", a: 0, p: 0 });

    PROJECTS.forEach((p, i) => {
      const ang = (i / PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        project: p,
        idx: i + 1,
        bx: cx + Math.cos(ang) * R * (i % 2 ? 1.22 : 0.92),
        by: cy + Math.sin(ang) * R * (i % 2 ? 1.05 : 0.85),
        x: 0,
        y: 0,
        r: 9,
        ang,
        phase: Math.random() * Math.PI * 2,
        hover: 0,
      });
    });

    for (let i = 0; i < 90; i++) {
      ambient.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      });
    }

    for (let i = 1; i < nodes.length; i++) {
      edges.push({ a: 0, b: i, pulse: Math.random() });
      if (i < nodes.length - 1) edges.push({ a: i, b: i + 1, pulse: Math.random(), weak: true });
    }
    edges.push({ a: nodes.length - 1, b: 1, pulse: Math.random(), weak: true });
  }

  let mouse = { x: -999, y: -999 };
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    const hit = !!hitNode();
    canvas.style.cursor = hit ? "pointer" : "default";
    if (hit) canvas.dataset.hot = "";
    else delete canvas.dataset.hot;
  });

  function hitNode() {
    return nodes.find(
      (n) =>
        n.project &&
        matchesFilter(n.project) &&
        Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r + 16
    );
  }

  canvas.addEventListener("click", () => {
    const n = hitNode();
    if (n) open(n);
  });

  let currentIdx = null;

  function open(n) {
    const p = n.project;
    currentIdx = n.idx;
    panel.querySelector(".idx").textContent =
      "SYNAPSE " + String(n.idx).padStart(2, "0");
    panel.querySelector("h2").textContent = p.name;
    panel.querySelector(".kind").textContent = p.kind;
    panel.querySelector(".desc").textContent = p.desc;
    panel.querySelector("ul").innerHTML = p.facts
      .map((f) => `<li><b>${f[0]}</b> — ${f[1]}</li>`)
      .join("");
    panel.querySelector(".tags").innerHTML = p.tags
      .map((t) => `<span>${t}</span>`)
      .join("");
    panel.classList.add("open");
  }

  function openByOffset(dir) {
    if (currentIdx === null) return;
    const total = PROJECTS.length;
    const nextIdx = ((currentIdx - 1 + dir + total) % total) + 1;
    const n = nodes.find((n) => n.project && n.idx === nextIdx);
    if (n) open(n);
  }

  panel.querySelectorAll(".pn-btn").forEach((btn) =>
    btn.addEventListener("click", () => openByOffset(+btn.dataset.dir))
  );

  panel.querySelector(".close").addEventListener("click", () =>
    panel.classList.remove("open")
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") panel.classList.remove("open");
    if (panel.classList.contains("open") && e.key === "ArrowRight") openByOffset(1);
    if (panel.classList.contains("open") && e.key === "ArrowLeft") openByOffset(-1);
  });

  let t = 0;
  function frame() {
    t += 0.006;
    ctx.clearRect(0, 0, W, H);

    // ambient particle mesh
    ambient.forEach((a) => {
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
    });
    ctx.lineWidth = 1;
    for (let i = 0; i < ambient.length; i++) {
      for (let j = i + 1; j < ambient.length; j++) {
        const d = Math.hypot(ambient[i].x - ambient[j].x, ambient[i].y - ambient[j].y);
        if (d < 110) {
          ctx.strokeStyle = `rgba(120,160,255,${0.09 * (1 - d / 110)})`;
          ctx.beginPath();
          ctx.moveTo(ambient[i].x, ambient[i].y);
          ctx.lineTo(ambient[j].x, ambient[j].y);
          ctx.stroke();
        }
      }
    }

    // node positions
    nodes.forEach((n) => {
      if (n.core) {
        n.x = W / 2;
        n.y = H / 2;
        n.dim = 1;
        return;
      }
      n.x = n.bx + Math.sin(t * 1.6 + n.phase) * 16;
      n.y = n.by + Math.cos(t * 1.3 + n.phase) * 14;
      const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r + 26;
      n.hover += ((near ? 1 : 0) - n.hover) * 0.12;
      const target = matchesFilter(n.project) ? 1 : 0.14;
      n.dim = n.dim === undefined ? target : n.dim + (target - n.dim) * 0.1;
    });

    // edges + travelling pulses
    edges.forEach((e) => {
      const a = nodes[e.a];
      const b = nodes[e.b];
      const hov = Math.max(a.hover || 0, b.hover || 0);
      const dim = Math.min(a.dim ?? 1, b.dim ?? 1);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      const alpha = ((e.weak ? 0.1 : 0.26) + hov * 0.5) * dim;
      grad.addColorStop(0, `rgba(79,214,255,${alpha})`);
      grad.addColorStop(1, `rgba(168,119,255,${alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = e.weak ? 0.8 : 1.4 + hov;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      e.pulse = (e.pulse + (e.weak ? 0.002 : 0.004)) % 1;
      const px = a.x + (b.x - a.x) * e.pulse;
      const py = a.y + (b.y - a.y) * e.pulse;
      ctx.fillStyle = `rgba(180,240,255,${(0.5 + hov * 0.5) * dim})`;
      ctx.beginPath();
      ctx.arc(px, py, e.weak ? 1.4 : 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // nodes
    nodes.forEach((n) => {
      ctx.globalAlpha = n.core ? 1 : Math.max(0.14, n.dim ?? 1);
      const r = n.r + (n.hover || 0) * 5 + (n.core ? Math.sin(t * 3) * 1.5 : 0);
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
      const col = n.core ? "87,255,176" : "79,214,255";
      glow.addColorStop(0, `rgba(${col},${0.35 + (n.hover || 0) * 0.4})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = n.core ? "#57ffb0" : "#dff6ff";
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 0.42, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = n.core ? "rgba(87,255,176,.6)" : "rgba(168,119,255,.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.stroke();

      const label = n.core ? "joao.dev" : n.project.name;
      ctx.font = n.core ? "600 13px 'JetBrains Mono', monospace" : "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = n.core
        ? "rgba(87,255,176,.95)"
        : `rgba(230,240,255,${0.55 + (n.hover || 0) * 0.45})`;
      ctx.fillText(label, n.x, n.y + r + 18);
      if (!n.core) {
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(168,119,255,${0.4 + (n.hover || 0) * 0.6})`;
        ctx.fillText(n.project.kind, n.x, n.y + r + 33);
      }
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
})();
