/* Interactive fake-shell for the desktop, plus window dragging and parallax. */
(function () {
  const shell = document.getElementById("shell");
  const body = document.getElementById("shellbody");
  const input = document.getElementById("shellinput");
  const desktop = document.getElementById("desktop");

  /* ---------------- output helpers ---------------- */
  function out(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function typeOut(text, speed = 12) {
    const div = out("");
    let i = 0;
    const iv = setInterval(() => {
      div.textContent += text[i++];
      body.scrollTop = body.scrollHeight;
      if (i >= text.length) clearInterval(iv);
    }, speed);
  }

  /* ---------------- data ---------------- */
  const FILES = {
    "readme.md":
      "João — full-stack developer & 2nd-year Computer Science student.\nBuilds end-to-end web apps: Java/Spring Boot, React/TypeScript, PostgreSQL.\nStrong interest in cybersecurity, infrastructure and software engineering.",
    "stack.txt":
      "languages : java, python, c, typescript, rust\nbackend   : spring boot, spring security, jpa/hibernate, rest apis\nfrontend  : react, tailwind css\ndatabases : postgresql, sqlite, sql\nsecurity  : cybersecurity fundamentals, system analysis, linux, git/github",
    ".secret": "you found it. the konami code still works though. ↑↑↓↓←→←→ B A",
  };

  const PROJECTS = [
    ["Study Manager", "full-stack desktop app, modular architecture", "React · TypeScript · Tauri · Rust · SQLite"],
    ["Security Tools", "packet analyzer, Windows & network monitoring", "Python · C · Shell"],
    ["???", "next project slot — in progress", "TBD"],
    ["???", "open slot — nothing built here yet", "TBD"],
  ];

  const CMDS = {
    help() {
      out(
        `<span class="ok">available commands</span>\n` +
          [
            ["help", "this list"],
            ["whoami", "who is behind this machine"],
            ["ls", "list files in ~"],
            ["cat &lt;file&gt;", "read a file"],
            ["projects", "list every project"],
            ["skills", "technical skills, by category"],
            ["neofetch", "system information"],
            ["open projects|about", "navigate to a section"],
            ["matrix", "toggle the rain"],
            ["theme", "cycle accent colour"],
            ["sudo &lt;anything&gt;", "try it"],
            ["coffee", "refill reserves"],
            ["date / echo / clear", "the classics"],
          ]
            .map((c) => `  <span class="c">${c[0].padEnd(22, " ")}</span><span>${c[1]}</span>`)
            .join("\n")
      );
    },
    whoami() {
      typeOut(
        "joao — full-stack developer & 2nd-year CS student. I like owning a project end to end, from database schema to UI, with a growing focus on cybersecurity and infrastructure."
      );
    },
    ls() {
      out(
        Object.keys(FILES)
          .map((f) => `<span class="${f.startsWith(".") ? "v" : "c"}">${f}</span>`)
          .join("   ") + `   <span class="ok">projects/</span>  <span class="ok">about/</span>`
      );
    },
    cat(args) {
      const f = args[0];
      if (!f) return out(`<span class="e">cat: missing operand</span>`);
      if (!FILES[f]) return out(`<span class="e">cat: ${f}: No such file or directory</span>`);
      out(`<span class="wht">${FILES[f]}</span>`);
    },
    projects() {
      PROJECTS.forEach((p, i) =>
        out(
          `  <span class="v">${String(i + 1).padStart(2, "0")}</span>  <span class="ok">${p[0].padEnd(
            14
          )}</span><span>${p[1]}</span>\n      <span class="c">${p[2]}</span>`
        )
      );
      out(`\n<span class="w">tip:</span> run <span class="c">open projects</span> for the neural graph.`);
    },
    skills() {
      out(`<span class="ok">technical skills</span>`);
      [
        ["Languages", "Java, Python, C, TypeScript, Rust"],
        ["Backend", "Spring Boot, Spring Security, JPA/Hibernate, REST APIs"],
        ["Frontend", "React, Tailwind CSS"],
        ["Databases", "PostgreSQL, SQLite, SQL"],
        ["Security/Infra", "Cybersecurity fundamentals, system analysis, Linux, Git/GitHub"],
        ["Language", "English — Fluent (full bilingual education)"],
      ].forEach(([n, v], i) => {
        setTimeout(() => {
          out(`  <span class="c">${n.padEnd(16)}</span><span>${v}</span>`);
        }, i * 90);
      });
    },
    neofetch() {
      const art = [
        "   .--.    ",
        "  |o_o |   ",
        "  |:_/ |   ",
        " //   \\ \\  ",
        "(|     | ) ",
        "/'\\_   _/`\\",
        "\\___)=(___/",
      ];
      const info = [
        ["user", "joao@kali"],
        ["os", "PortfolioOS 3.0 (vanilla)"],
        ["kernel", "html5-css3-es2023"],
        ["shell", "joao-sh 1.0"],
        ["role", "full-stack dev · CS student"],
        ["stack", "java/spring · react/ts · postgres"],
        ["interest", "cybersecurity & infrastructure"],
        ["status", "2nd year, building things"],
      ];
      const lines = art.map(
        (a, i) =>
          `<span class="ok">${a}</span>  ` +
          (info[i] ? `<span class="v">${info[i][0].padEnd(8)}</span><span class="wht">${info[i][1]}</span>` : "")
      );
      out(lines.join("\n"));
    },
    open(args) {
      const t = (args[0] || "").toLowerCase();
      if (t === "projects") {
        out(`<span class="ok">→ entering the neural graph...</span>`);
        setTimeout(() => (location.href = "./projects.html"), 550);
      } else if (t === "about") {
        out(`<span class="ok">→ loading about me...</span>`);
        setTimeout(() => (location.href = "./about.html"), 550);
      } else out(`<span class="e">open: expected 'projects' or 'about'</span>`);
    },
    matrix() {
      const on = window.FX.matrix();
      out(`<span class="ok">matrix rain ${on ? "engaged" : "stopped"}.</span> press <span class="c">M</span> to toggle.`);
    },
    theme() {
      const themes = [
        ["#57ffb0", "#4fd6ff", "matrix green"],
        ["#a877ff", "#4fd6ff", "violet"],
        ["#ffb347", "#ff6b6b", "amber crt"],
        ["#4fd6ff", "#a877ff", "ice"],
      ];
      const n = (+(document.body.dataset.theme || 0) + 1) % themes.length;
      document.body.dataset.theme = n;
      const [a, b, name] = themes[n];
      document.documentElement.style.setProperty("--term", a);
      document.documentElement.style.setProperty("--cyan", b);
      out(`<span class="ok">theme → ${name}</span>`);
    },
    sudo(args) {
      out(
        `<span class="w">[sudo] password for visitor:</span> ********\n<span class="e">visitor is not in the sudoers file. This incident has been reported.</span>` +
          (args.length ? `\n<span class="v">(nice try with "${args.join(" ")}")</span>` : "")
      );
    },
    coffee() {
      let n = 12;
      const div = out("");
      const iv = setInterval(() => {
        n += 4;
        div.innerHTML = `<span class="w">coffee reserves</span> <span class="ok">${"█".repeat(
          Math.round(n / 4)
        )}</span><span class="v">${"░".repeat(25 - Math.round(n / 4))}</span> ${n}%`;
        if (n >= 100) {
          clearInterval(iv);
          out(`<span class="ok">productivity restored.</span>`);
        }
      }, 60);
    },
    date() {
      out(`<span class="wht">${new Date().toString()}</span>`);
    },
    echo(args) {
      out(`<span class="wht">${args.join(" ")}</span>`);
    },
    clear() {
      body.innerHTML = "";
    },
    exit() {
      close();
    },
    hack() {
      out(`<span class="w">initiating totally-legal penetration test...</span>`);
      const steps = [
        "bypassing mainframe",
        "reticulating splines",
        "downloading more RAM",
        "compiling the internet",
      ];
      steps.forEach((s, i) =>
        setTimeout(() => out(`<span class="c">[ ${i + 1}/4 ]</span> ${s} ... <span class="ok">done</span>`), 400 * (i + 1))
      );
      setTimeout(() => out(`<span class="ok">access granted. (it was a joke, relax)</span>`), 400 * 5);
    },
  };

  const ALIASES = { ll: "ls", man: "help", "?": "help", cls: "clear", about: "open about", quit: "exit" };

  /* ---------------- prompt loop ---------------- */
  function run(raw) {
    const line = raw.trim();
    out(`<span class="ok">joao@kali</span>:<span class="c">~</span>$ <span class="wht">${line.replace(/</g, "&lt;")}</span>`);
    if (!line) return;
    history.unshift(line);
    hIdx = -1;
    const expanded = ALIASES[line] || line;
    const [cmd, ...args] = expanded.split(/\s+/);
    const fn = CMDS[cmd] || CMDS[ALIASES[cmd]];
    if (fn) fn(args);
    else
      out(
        `<span class="e">joao-sh: command not found: ${cmd.replace(/</g, "&lt;")}</span>\ntry <span class="c">help</span>`
      );
  }

  let history = [];
  let hIdx = -1;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx < history.length - 1) input.value = history[++hIdx];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      input.value = hIdx > 0 ? history[--hIdx] : ((hIdx = -1), "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const p = input.value.trim();
      const m = Object.keys(CMDS).filter((c) => c.startsWith(p));
      if (m.length === 1) input.value = m[0] + " ";
      else if (m.length > 1) out(m.map((c) => `<span class="c">${c}</span>`).join("  "));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      CMDS.clear();
    }
    e.stopPropagation();
  });

  /* ---------------- open / close ---------------- */
  let booted = false;
  function open() {
    shell.classList.add("open");
    setTimeout(() => input.focus(), 120);
    if (!booted) {
      booted = true;
      out(`<span class="ok">joao-sh 1.0</span> — interactive session. type <span class="c">help</span> to begin.`);
      out(`<span class="v">hint: try neofetch, projects, skills, matrix, sudo rm -rf /</span>\n`);
    }
  }
  function close() {
    shell.classList.remove("open");
  }
  window.__shell = { open, close, toggle: () => (shell.classList.contains("open") ? close() : open()) };

  shell.querySelector(".x").addEventListener("click", close);
  shell.addEventListener("click", (e) => {
    if (e.target.closest(".sbar")) return;
    input.focus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.target === input) return;
    if (e.key === "`" || (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey)) {
      e.preventDefault();
      window.__shell.toggle();
    }
    if (e.key === "Escape") close();
  });

  /* ---------------- dock ---------------- */
  const shellDock = document.querySelector('[data-dock="shell"]');
  const matrixDock = document.querySelector('[data-dock="matrix"]');

  document.querySelectorAll("[data-dock]").forEach((b) => {
    b.addEventListener("click", () => {
      const a = b.dataset.dock;
      if (a === "shell") window.__shell.toggle();
      if (a === "matrix") window.FX.matrix();
      if (a === "theme") CMDS.theme();
      if (a === "projects") location.href = "./projects.html";
      if (a === "about") location.href = "./about.html";
    });
  });

  if (shellDock) new MutationObserver(() => shellDock.classList.toggle("active", shell.classList.contains("open")))
    .observe(shell, { attributes: true, attributeFilter: ["class"] });

  if (matrixDock) {
    const mc = document.getElementById("matrix");
    if (mc) new MutationObserver(() => matrixDock.classList.toggle("active", mc.classList.contains("on")))
      .observe(mc, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------------- dragging ---------------- */
  function draggable(el, handle) {
    let sx, sy, ox, oy, on = false;
    handle.addEventListener("mousedown", (e) => {
      const r = el.getBoundingClientRect();
      el.classList.add("dragged", "grabbed");
      handle.classList.add("grabbing");
      el.style.left = r.left + "px";
      el.style.top = r.top + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.transform = "none";
      sx = e.clientX;
      sy = e.clientY;
      ox = r.left;
      oy = r.top;
      on = true;
      e.preventDefault();
    });
    addEventListener("mousemove", (e) => {
      if (!on) return;
      el.style.left = Math.max(0, Math.min(innerWidth - 60, ox + e.clientX - sx)) + "px";
      el.style.top = Math.max(30, Math.min(innerHeight - 40, oy + e.clientY - sy)) + "px";
    });
    addEventListener("mouseup", () => {
      if (!on) return;
      on = false;
      handle.classList.remove("grabbing");
    });
  }

  draggable(shell, shell.querySelector(".sbar"));
  document.querySelectorAll(".win").forEach((w) => draggable(w, w.querySelector(".wbar")));

  /* ---------------- parallax + tilt ---------------- */
  if (window.FX.fine && !window.FX.reduce) {
    const card = document.querySelector(".card");
    window.FX.tilt(card, 8);

    const layers = [
      [document.querySelector(".w1"), 16],
      [document.querySelector(".w2"), 24],
      [document.querySelector(".w3"), 20],
      [document.querySelector(".w4"), 12],
    ];
    let tx = 0, ty = 0, cx2 = 0, cy2 = 0;
    desktop.addEventListener("mousemove", (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    });
    (function loop() {
      cx2 += (tx - cx2) * 0.06;
      cy2 += (ty - cy2) * 0.06;
      layers.forEach(([el, d]) => {
        if (!el || el.classList.contains("dragged")) return;
        el.style.marginLeft = -cx2 * d + "px";
        el.style.marginTop = -cy2 * d + "px";
      });
      requestAnimationFrame(loop);
    })();
  }
})();
