/* Shared interactive layer: custom cursor, matrix rain, toasts, konami code. */
window.FX = (function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- cursor ---------- */
  let ring, dot, glow;
  if (fine) {
    glow = document.createElement("div");
    glow.className = "cursor-glow";
    ring = document.createElement("div");
    ring.className = "cursor-ring";
    dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.append(glow, ring, dot);

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my, gx = mx, gy = my;

    addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const t = e.target;
      const hot = t.closest && t.closest("a, button, .side, .chip, .win, .tile, .btn, [data-hot]");
      ring.classList.toggle("hot", !!hot);
    });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      gx += (mx - gx) * 0.07;
      gy += (my - gy) * 0.07;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- toast ---------- */
  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
  let toastT;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("on"), 2600);
  }

  /* ---------- matrix rain ---------- */
  const mc = document.createElement("canvas");
  mc.id = "matrix";
  document.body.appendChild(mc);
  const mctx = mc.getContext("2d");
  let cols = [], running = false, raf = 0;
  const GLYPHS = "アカサタナハマヤラワ0123456789ABCDEF{}[]<>/\\$#*+=";

  function sizeMatrix() {
    mc.width = innerWidth;
    mc.height = innerHeight;
    cols = new Array(Math.ceil(mc.width / 16)).fill(0).map(() => Math.random() * -60);
  }
  sizeMatrix();
  addEventListener("resize", sizeMatrix);

  function drawMatrix() {
    mctx.fillStyle = "rgba(3,6,8,0.09)";
    mctx.fillRect(0, 0, mc.width, mc.height);
    mctx.font = "15px 'JetBrains Mono', monospace";
    for (let i = 0; i < cols.length; i++) {
      const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      const y = cols[i] * 16;
      mctx.fillStyle = Math.random() > 0.97 ? "#dffff0" : "rgba(87,255,176,0.85)";
      mctx.fillText(ch, i * 16, y);
      cols[i] = y > mc.height && Math.random() > 0.975 ? 0 : cols[i] + 1;
    }
    raf = requestAnimationFrame(drawMatrix);
  }

  function matrix(on) {
    if (on === undefined) on = !running;
    if (on === running) return running;
    running = on;
    if (on) {
      mctx.clearRect(0, 0, mc.width, mc.height);
      mc.classList.add("on");
      drawMatrix();
    } else {
      mc.classList.remove("on");
      cancelAnimationFrame(raf);
      setTimeout(() => mctx.clearRect(0, 0, mc.width, mc.height), 500);
    }
    return running;
  }

  /* ---------- konami ---------- */
  const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let pos = 0;
  addEventListener("keydown", (e) => {
    pos = e.key.toLowerCase() === SEQ[pos].toLowerCase() ? pos + 1 : 0;
    if (pos === SEQ.length) {
      pos = 0;
      matrix(true);
      say("cheat code accepted — wake up, neo. (press M to stop)");
    }
    if (e.key.toLowerCase() === "m" && running && !/input|textarea/i.test(document.activeElement.tagName)) {
      matrix(false);
    }
  });

  /* ---------- 3D tilt helper ---------- */
  function tilt(el, strength = 10) {
    if (reduce || !fine) return;
    el.style.transformStyle = "preserve-3d";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateZ(8px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  }

  return { say, matrix, tilt, reduce, fine };
})();
