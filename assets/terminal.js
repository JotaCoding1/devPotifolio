(function () {
  const log = document.getElementById("bootlog");
  const boot = document.getElementById("boot");
  const desktop = document.getElementById("desktop");

  const lines = [
    { t: "root@joao:~# ", c: "user", d: 260, nl: false },
    { t: "ssh joao@portfolio.local", c: "", d: 520, type: true },
    { t: "", d: 220 },
    { t: "[ OK ] Establishing secure channel ...", c: "dim", d: 220 },
    { t: "[ OK ] Handshake: ed25519 SHA256:9f3a...c21b", c: "dim", d: 180 },
    { t: "Logging in to the system", c: "ok", d: 420, dots: true },
    { t: "", d: 160 },
    { t: "[ OK ] mounting /dev/creativity", c: "dim", d: 130 },
    { t: "[ OK ] loading kernel modules: java, spring, react, postgres", c: "dim", d: 130 },
    { t: "[warn] coffee reserves at 12%", c: "warn", d: 160 },
    { t: "[ OK ] starting window manager ...", c: "dim", d: 220 },
    { t: "", d: 140 },
    { t: "Welcome, visitor. Session granted.", c: "ok", d: 420 },
    { t: "launching workspace", c: "user", d: 500, dots: true },
  ];

  let i = 0;

  function span(cls, text) {
    const s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  }

  function typeText(text, cls, done) {
    const el = span(cls, "");
    log.appendChild(el);
    let k = 0;
    const iv = setInterval(() => {
      el.textContent += text[k++];
      log.scrollTop = log.scrollHeight;
      if (k >= text.length) {
        clearInterval(iv);
        log.appendChild(document.createTextNode("\n"));
        done();
      }
    }, 38);
  }

  function dotsThen(el, done) {
    let n = 0;
    const iv = setInterval(() => {
      el.textContent += ".";
      if (++n === 3) {
        clearInterval(iv);
        log.appendChild(document.createTextNode("\n"));
        done();
      }
    }, 200);
  }

  const bar = document.getElementById("bootbar");

  function next() {
    if (bar) bar.style.width = Math.round((i / lines.length) * 100) + "%";
    if (i >= lines.length) return finish();
    const l = lines[i++];
    if (l.type) return typeText(l.t, l.c, () => setTimeout(next, l.d));

    const el = span(l.c, l.t);
    log.appendChild(el);
    if (l.dots) return dotsThen(el, () => setTimeout(next, l.d));
    if (l.nl !== false) log.appendChild(document.createTextNode("\n"));
    log.scrollTop = log.scrollHeight;
    setTimeout(next, l.d);
  }

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (bar) bar.style.width = "100%";
    setTimeout(() => {
      boot.classList.add("done");
      desktop.classList.add("on");
      setTimeout(() => {
        boot.style.display = "none";
        if (window.FX) window.FX.say("press T for an interactive shell · M for matrix rain");
      }, 800);
    }, 500);
  }


  // skip boot
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") finish();
  });
  boot.addEventListener("click", finish);

  setTimeout(next, 400);

  // clock
  const clock = document.getElementById("clock");
  function tick() {
    const d = new Date();
    clock.textContent = d.toTimeString().slice(0, 8);
  }
  tick();
  setInterval(tick, 1000);

  // live scrolling code in background windows
  const feeds = [
    [
      "<span class='hl'>$ nmap -sS -T4 10.0.0.0/24</span>",
      "Starting Nmap 7.94 ( https://nmap.org )",
      "Host is up (0.00042s latency).",
      "PORT     STATE SERVICE",
      "22/tcp   open  ssh",
      "443/tcp  open  <span class='c'>https</span>",
      "8080/tcp open  <span class='c'>http-proxy</span>",
    ],
    [
      "<span class='v'>const</span> stack = [",
      "  <span class='hl'>'java'</span>,",
      "  <span class='hl'>'spring-boot'</span>,",
      "  <span class='hl'>'react'</span>,",
      "  <span class='hl'>'postgres'</span>,",
      "];",
      "<span class='c'>ship</span>(stack).<span class='c'>then</span>(learn);",
    ],
    [
      "<span class='hl'>$ htop</span>",
      "cpu  [|||||||||     45%]",
      "mem  [||||||||||||  71%]",
      "swap [||             4%]",
      " PID USER   CPU  COMMAND",
      "1337 joao  22.4  <span class='c'>spring-boot</span>",
      "2048 joao  11.1  <span class='v'>postgres</span>",
    ],
    [
      "<span class='hl'>$ git log --oneline</span>",
      "<span class='c'>a91f3c2</span> feat: jpa persistence layer",
      "<span class='c'>77b0e1d</span> feat: study manager (tauri + sqlite)",
      "<span class='c'>3ce9a04</span> fix: auth race condition",
      "<span class='c'>0b12f8e</span> chore: ship it",
    ],
  ];

  document.querySelectorAll(".win pre").forEach((pre, idx) => {
    const feed = feeds[idx % feeds.length];
    let n = 0;
    setInterval(() => {
      pre.innerHTML += feed[n % feed.length] + "\n";
      n++;
      const rows = pre.innerHTML.split("\n");
      if (rows.length > 12) pre.innerHTML = rows.slice(rows.length - 12).join("\n");
    }, 900 + idx * 260);
  });
})();
