/* The question put to the machine, and the swarm of agents that builds every part of the page as it comes into view. */
(function () {
  'use strict';
  const A = window.ATHARVA, U = window.UNIVERSE, SND = window.SOUND;
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const root = document.documentElement;
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWARM = root.classList.contains('swarm');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const COLORS = ['#4D6A47', '#9E5236', '#42586A', '#A97E2C', '#6B5E4A', '#5C7A6E', '#8A6A3C'];
  const ROLES = ['layout', 'type', 'copy', 'draw', 'data', 'grid', 'style', 'links', 'motion'];

  /* ---------- content ---------- */
  const plates = $('#plates');
  A.PLATES.forEach(p => {
    const el = document.createElement('article');
    el.className = 'plate';
    el.setAttribute('data-unit', p.title);
    el.innerHTML =
      '<div class="plate-body">' +
        '<h3 class="blk" data-k="words">' + esc(p.title) + '</h3>' +
        '<ul class="plate-tech blk">' + p.tech.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<p class="blk">' + esc(p.desc) + '</p>' +
        '<ul class="plate-points">' + p.points.map(t => '<li class="blk">' + esc(t) + '</li>').join('') + '</ul>' +
        '<div class="plate-links">' + p.open.map(id => { const d = A.DIMS.find(x => x.id === id); return '<button class="trace blk" data-k="pop" type="button" data-open="' + id + '"><i>\u25C6</i> ' + esc(d.short) + '</button>'; }).join('') + '</div>' +
      '</div>' +
      '<figure class="plate-fig blk" data-k="fig">' + p.svg + '</figure>';
    plates.appendChild(el);
  });
  const inst = $('#instrumentList');
  A.INSTRUMENTS.forEach(g => {
    const el = document.createElement('div');
    el.className = 'inst';
    el.innerHTML = '<h3 class="blk" data-k="words">' + esc(g.h) + '</h3><ul class="blk">' + g.items.map(it => '<li>' + (it[1] ? '<button type="button" data-open="' + it[1] + '">' + esc(it[0]) + '</button>' : esc(it[0])) + '</li>').join('') + '</ul>';
    inst.appendChild(el);
  });
  const cfg = window.CONFIG || {};
  const links = [];
  if (cfg.email) links.push('<li>' + esc(cfg.email) + '</li>');
  if (cfg.linkedin) links.push('<li><a href="' + esc(cfg.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a></li>');
  if (cfg.github) links.push('<li><a href="' + esc(cfg.github) + '" target="_blank" rel="noopener">GitHub</a></li>');
  if (cfg.resume) links.push('<li><a href="' + esc(cfg.resume) + '" target="_blank" rel="noopener">R\u00E9sum\u00E9</a></li>');
  $('#contact').innerHTML = links.length ? links.join('') : '<li class="todo">Email, LinkedIn and GitHub appear here once they are set in CONFIG at the top of the page.</li>';
  (function bits() {
    let s = '';
    for (let r = 0; r < 40; r++) { let l = ''; for (let c = 0; c < 160; c++) l += Math.random() < 0.5 ? '0' : '1'; s += l + '\n'; }
    $('#bandBits').textContent = s;
  })();

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { U.enter(o.getAttribute('data-open')); return; }
    if (e.target.closest('[data-enter]')) U.enter();
  });

  /* ---------- prepare blocks ---------- */
  function splitWords(el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) splitWords(node);
    });
  }
  $$('[data-k="words"]').forEach(splitWords);
  const svgOf = el => (el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg'));
  $$('[data-k="fig"]').forEach(el => {
    const svg = svgOf(el);
    Array.from(svg.children).forEach(c => {
      if (c.tagName.toLowerCase() === 'defs') return;
      if (c.classList.contains('draw')) {
        const L = c.getTotalLength ? c.getTotalLength() : 0;
        c._len = L;
        if (SWARM) { c.style.strokeDasharray = L; c.style.strokeDashoffset = L; }
      } else c.classList.add('fadein');
    });
  });
  if (RM) $$('.pks').forEach(g => g.remove());

  function finishAll() {
    $$('.blk').forEach(el => el.classList.add('on', 'done'));
    $$('.w').forEach(w => w.classList.add('in'));
    $$('.fadein').forEach(f => f.classList.add('on'));
    $$('.draw').forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  }
  function finishUnit(unit) {
    unit.querySelectorAll('.blk').forEach(el => el.classList.add('on', 'done'));
    unit.querySelectorAll('.w').forEach(w => w.classList.add('in'));
    unit.querySelectorAll('.fadein').forEach(f => f.classList.add('on'));
    unit.querySelectorAll('.draw').forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  }

  /* ---------- agents ---------- */
  const layer = $('#cursors');
  let SEQ = 0, ACTIVE = 0;
  const D = el => { const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }; };
  const tw = (dur, fn) => new Promise(res => {
    const t0 = performance.now();
    const f = now => { const t = Math.min(1, (now - t0) / dur); fn(ease(t), t); if (t < 1) requestAnimationFrame(f); else res(); };
    requestAnimationFrame(f);
  });
  const ARROW = c => '<svg viewBox="0 0 22 26"><path d="M3 2.5 L3 21 L7.8 16.6 L11.2 23.8 L14.4 22.4 L11 15.3 L17.6 15.3 Z" fill="' + c + '" stroke="#F5F0E5" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  class Agent {
    constructor(x, y) {
      this.id = ++SEQ;
      this.c = COLORS[this.id % COLORS.length];
      this.role = ROLES[(this.id * 4) % ROLES.length];
      this.side = this.id % 2 ? 1 : -1;
      this.el = document.createElement('div');
      this.el.className = 'cur';
      this.el.style.setProperty('--c', this.c);
      this.el.innerHTML = ARROW(this.c) + '<div class="tag"><b>' + String(this.id).padStart(2, '0') + '</b>' + this.role + '</div>';
      layer.appendChild(this.el);
      this.place(x, y);
      ACTIVE++;
      requestAnimationFrame(() => this.el.classList.add('on'));
    }
    place(x, y) { this.x = x; this.y = y; this.el.style.transform = 'translate(' + (x - 2.3).toFixed(1) + 'px,' + (y - 2).toFixed(1) + 'px)'; }
    move(x, y, dur) {
      const sx = this.x, sy = this.y, dx = x - sx, dy = y - sy, dist = Math.hypot(dx, dy);
      dur = dur || clamp(dist * 0.5, 180, 620);
      this.side *= -1;
      const cx = sx + dx / 2 - dy * 0.14 * this.side, cy = sy + dy / 2 + dx * 0.14 * this.side;
      return tw(dur, e => { const m = 1 - e; this.place(m * m * sx + 2 * m * e * cx + e * e * x, m * m * sy + 2 * m * e * cy + e * e * y); });
    }
    click() {
      const r = document.createElement('div');
      r.className = 'rip'; r.style.setProperty('--c', this.c);
      r.style.left = this.x + 'px'; r.style.top = this.y + 'px';
      layer.appendChild(r);
      setTimeout(() => r.remove(), 650);
    }
    async exit() {
      const toRight = this.x - window.scrollX > window.innerWidth / 2;
      await this.move(window.scrollX + (toRight ? window.innerWidth + 40 : -40), this.y + (Math.random() - 0.5) * 140, 520);
      this.el.remove();
      ACTIVE--;
      status();
    }
  }

  /* ---------- jobs ---------- */
  function wire(ag, r, dur) {
    const f = document.createElement('div');
    f.className = 'wf';
    f.style.setProperty('--c', ag.c);
    Object.assign(f.style, { left: r.x + 'px', top: r.y + 'px', width: '0px', height: '0px' });
    const s = document.createElement('span');
    f.appendChild(s);
    layer.appendChild(f);
    return tw(dur, e => {
      const w = r.w * e, h = r.h * e;
      f.style.width = w + 'px'; f.style.height = h + 'px';
      s.textContent = Math.round(w) + ' \u00D7 ' + Math.round(h);
      ag.place(r.x + w, r.y + h);
    }).then(() => f);
  }
  const unwire = f => { f.classList.add('out'); setTimeout(() => f.remove(), 460); };

  async function drawPath(ag, p, fig) {
    fig.classList.add('on');
    const L = p._len || 0;
    if (!L || !p.getScreenCTM()) { p.style.strokeDashoffset = '0'; return; }
    const pt = l => { const q = p.getPointAtLength(l).matrixTransform(p.getScreenCTM()); return [q.x + window.scrollX, q.y + window.scrollY]; };
    const s = pt(0);
    await ag.move(s[0], s[1]);
    await tw(clamp(L * 1.1, 140, 420), e => {
      p.style.strokeDashoffset = (L * (1 - e)).toFixed(1);
      const q = pt(L * e);
      ag.place(q[0], q[1]);
    });
    p.style.strokeDashoffset = '0';
  }

  async function job(ag, j) {
    const el = j.el;
    if (j.k === 'path') return drawPath(ag, el, j.fig);
    if (j.k === 'fade') {
      const r = D(el);
      await ag.move(r.x + r.w / 2, r.y + r.h / 2);
      ag.click();
      el.classList.add('on');
      return sleep(90);
    }
    const r = D(el);
    if (j.k === 'pop') {
      await ag.move(r.x + r.w / 2, r.y + r.h / 2);
      ag.click();
      el.classList.add('on');
      el.animate([{ transform: 'translateY(10px) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      await sleep(160);
      el.classList.add('done');
      return;
    }
    await ag.move(r.x, r.y);
    const f = await wire(ag, r, clamp((r.w + r.h) * 0.4, 160, 420));
    if (j.k === 'frame') {
      el.classList.add('on');
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380 });
      unwire(f);
      return;
    }
    el.classList.add('on');
    if (j.k === 'words') {
      const ws = Array.from(el.querySelectorAll('.w'));
      for (const w of ws) {
        w.classList.add('in');
        const wr = D(w);
        ag.place(wr.x + wr.w + 3, wr.y + wr.h * 0.6);
        await sleep(ws.length > 10 ? 36 : 52);
      }
    } else {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      const lines = Math.max(1, Math.round(r.h / lh));
      el.style.clipPath = 'inset(0 0 100% 0)';
      await tw(clamp(lines * 180, 240, 900), e => {
        el.style.clipPath = 'inset(0 0 ' + ((1 - e) * 100).toFixed(2) + '% 0)';
        const p = (e * lines) % 1;
        ag.place(r.x + r.w * Math.min(1, p * 1.05), r.y + r.h * e);
      });
      el.style.clipPath = '';
    }
    el.classList.add('done');
    unwire(f);
  }

  function jobsFor(unit) {
    const out = [];
    unit.querySelectorAll('.blk').forEach(el => {
      if (el.classList.contains('on')) return;
      const k = el.getAttribute('data-k') || 'scan';
      if (k === 'fig') {
        out.push({ k: 'frame', el });
        const svg = svgOf(el);
        svg.querySelectorAll(':scope > .draw').forEach(p => out.push({ k: 'path', el: p, fig: el }));
        svg.querySelectorAll(':scope > .fadein').forEach(x => out.push({ k: 'fade', el: x }));
      } else out.push({ k, el });
    });
    return out;
  }

  /* ---------- status line in the header ---------- */
  const st = $('#swarmSt'), stText = st.querySelector('span');
  const busy = new Map();
  let lastMsg = 'swarm idle';
  function status() {
    if (busy.size) {
      const [name, p] = Array.from(busy.entries()).pop();
      st.classList.add('busy');
      stText.textContent = ACTIVE + ' agents \u00B7 building ' + name + ' \u00B7 ' + p[0] + '/' + p[1];
    } else {
      st.classList.remove('busy');
      stText.textContent = lastMsg;
    }
  }

  /* ---------- building a unit ---------- */
  const built = new WeakSet();
  function edgePoint(i) {
    const right = i % 2 === 1;
    return [window.scrollX + (right ? window.innerWidth + 30 : -30), window.scrollY + window.innerHeight * (0.15 + 0.7 * Math.random())];
  }
  async function buildUnit(unit, origin) {
    if (built.has(unit)) return;
    built.add(unit);
    const js = jobsFor(unit);
    if (!js.length) return;
    const name = unit.getAttribute('data-unit') || 'section';
    const want = clamp(Math.ceil(js.length / 2.2), 3, 12);
    const n = Math.max(2, Math.min(want, 32 - ACTIVE));
    const t0 = performance.now();
    let next = 0, done = 0;
    busy.set(name, [0, js.length]);
    const crew = [];
    for (let i = 0; i < n; i++) { const o = origin ? origin(i) : edgePoint(i); crew.push(new Agent(o[0], o[1])); }
    status();
    await Promise.all(crew.map(async (ag, i) => {
      await sleep(i * 60);
      while (next < js.length) {
        const j = js[next++];
        try { await job(ag, j); }
        catch (e) { j.el.classList && j.el.classList.add('on', 'done'); }
        done++;
        busy.set(name, [done, js.length]);
        status();
      }
      await ag.exit();
    }));
    finishUnit(unit);
    busy.delete(name);
    lastMsg = n + ' agents built ' + name + ' in ' + ((performance.now() - t0) / 1000).toFixed(1) + 's';
    status();
  }

  function observe() {
    const units = $$('[data-unit]').filter(u => u.id !== 'top');
    if (!('IntersectionObserver' in window)) { units.forEach(finishUnit); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        buildUnit(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    units.forEach(u => io.observe(u));
  }

  /* ---------- the question ---------- */
  let skipped = false, openingDone = false;
  const skipHooks = [];
  const tlog = $('#tlog');
  function log(html) {
    const li = document.createElement('li');
    li.innerHTML = html;
    tlog.appendChild(li);
    requestAnimationFrame(() => li.classList.add('on'));
  }
  async function opening() {
    const spans = $$('#prompt [data-t]');
    await sleep(600);
    for (const s of spans) {
      for (const ch of s.getAttribute('data-t')) {
        if (skipped) return;
        s.textContent += ch;
        await sleep(ch === ' ' ? 40 : 52 + Math.random() * 46);
      }
    }
    if (skipped) return;
    $('#askRow').classList.add('on');
    await new Promise(res => {
      let done = false;
      const go = () => { if (done) return; done = true; window.removeEventListener('keydown', kd); res(); };
      const kd = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      window.addEventListener('keydown', kd);
      $('#send').addEventListener('click', go, { once: true });
      setTimeout(go, 7000);
      skipHooks.push(go);
    });
    if (skipped) return;
    SND.start();
    $('#askRow').classList.remove('on');
    $('#pcaret').classList.add('off');
    const lines = [
      'parsing question',
      'resolving identity \u00B7 <b>1 match</b>',
      '<b>Atharva Takle</b> \u00B7 AI engineer \u00B7 India',
      'dispatching <b>agents</b> to build the answer'
    ];
    for (const l of lines) { log(l); await sleep(520); if (skipped) return; }
    await sleep(300);
    const qx = $$('#prompt .qx');
    qx.forEach(s => { s.style.maxWidth = s.offsetWidth + 'px'; });
    void document.body.offsetWidth;
    qx.forEach(s => { s.classList.add('gone'); s.style.maxWidth = '0px'; });
    tlog.style.transition = 'opacity .6s';
    tlog.style.opacity = '0';
    await sleep(1050);
    if (skipped) return;

    const qn = $('#prompt .qn'), r = qn.getBoundingClientRect();
    const bar = $('#bar'), bt = $('#barTitle');
    bar.classList.add('show');
    bt.style.opacity = '0';
    const tr = bt.getBoundingClientRect();
    const ghost = qn.cloneNode(true);
    ghost.className = 'prompt';
    Object.assign(ghost.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', margin: '0', zIndex: 65, transformOrigin: '0 0', pointerEvents: 'none', whiteSpace: 'pre', minHeight: '0', lineHeight: r.height + 'px', height: r.height + 'px' });
    document.body.appendChild(ghost);
    qn.style.visibility = 'hidden';
    const s = parseFloat(getComputedStyle(bt).fontSize) / parseFloat(getComputedStyle(qn).fontSize);
    const dx = tr.left - r.left, dy = (tr.top + tr.height / 2) - (r.top + r.height * s / 2);
    ghost.animate([{ transform: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }], { duration: 1150, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' });
    $('#opening').classList.add('gone');
    await sleep(1100);
    bt.style.transition = 'opacity .35s';
    bt.style.opacity = '1';
    await sleep(320);
    ghost.remove();
    endOpening();
  }
  function endOpening() {
    if (openingDone) return;
    openingDone = true;
    $('#opening').classList.add('gone');
    $('#bar').classList.add('show');
    $('#barTitle').style.opacity = '1';
    root.classList.remove('locked');
    const sk = $('#skip');
    sk.style.opacity = '0';
    setTimeout(() => { sk.hidden = true; }, 500);
    const hero = $('#top');
    if (skipped) { built.add(hero); finishUnit(hero); }
    else {
      const bt = $('#barTitle').getBoundingClientRect();
      buildUnit(hero, () => [bt.left + bt.width * (0.2 + Math.random() * 0.6) + window.scrollX, bt.top + bt.height / 2 + window.scrollY]);
    }
    setTimeout(observe, skipped ? 100 : 900);
  }
  $('#skip').addEventListener('click', () => {
    skipped = true;
    skipHooks.forEach(f => f());
    endOpening();
  });

  /* ---------- start ---------- */
  if (!SWARM) {
    root.classList.add('reduced');
    $('#opening').hidden = true;
    $('#skip').hidden = true;
    $('#bar').classList.add('show');
    finishAll();
  } else {
    const safety = setTimeout(() => { skipped = true; skipHooks.forEach(f => f()); endOpening(); }, 40000);
    opening().then(() => clearTimeout(safety)).catch(() => { skipped = true; endOpening(); });
  }
})();
