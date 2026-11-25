/* Interactive diagrams for each dimension. A small flow engine plus five bespoke models. */
window.ATHARVA_VIZ = (function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let UID = 0;

  function S(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function T(parent, x, y, text, cls, anchor) {
    const t = S('text', { x: x, y: y, class: cls || 'vz-l', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = text;
    return t;
  }
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function Token() {
    const waiters = [];
    return {
      dead: false,
      kill() { this.dead = true; waiters.splice(0).forEach(f => f()); },
      wait(ms) {
        return new Promise(r => {
          if (this.dead) return r();
          const t = setTimeout(r, RM ? Math.min(ms, 600) : ms);
          waiters.push(() => { clearTimeout(t); r(); });
        });
      }
    };
  }
  function tween(token, dur, fn) {
    return new Promise(res => {
      if (RM) dur = 1;
      const t0 = performance.now();
      (function f(now) {
        if (token && token.dead) return res();
        const t = Math.min(1, (now - t0) / dur);
        fn(t);
        if (t < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function svgPoint(svg, e) {
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const m = svg.getScreenCTM();
    return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }

  /* ---------- shared frame ---------- */
  function frame(host, d, w, h, ground) {
    host.innerHTML = '';
    const box = H('div', 'vz');
    const stage = H('div', 'vz-stage');
    const svg = S('svg', { viewBox: '0 0 ' + w + ' ' + h, class: 'vz-svg', role: 'img', 'aria-label': d.title + ': interactive diagram' });
    stage.appendChild(svg);
    const ctr = H('div', 'vz-controls');
    const cap = H('div', 'vz-cap', '<span class="vz-n"></span><span class="vz-say" aria-live="polite"></span>');
    const info = H('div', 'vz-info');
    box.append(stage, ctr, cap, info);
    host.appendChild(box);
    const defs = S('defs', null, svg);
    const id = 'vz' + (++UID);
    groundLayer(svg, defs, w, h, ground || 'dots', id);
    const hatch = S('pattern', { id: id + 'h', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    S('rect', { width: 6, height: 6, fill: 'var(--acc-soft)' }, hatch);
    S('path', { d: 'M0 0V6', stroke: 'var(--acc)', 'stroke-opacity': '.45', 'stroke-width': 1.4 }, hatch);
    const sayEl = cap.querySelector('.vz-say'), nEl = cap.querySelector('.vz-n');
    const btns = [];
    return {
      box, svg, ctr, cap, info, defs, w, h, hatch: 'url(#' + id + 'h)',
      say(text, n) {
        sayEl.classList.remove('in');
        void sayEl.offsetWidth;
        sayEl.innerHTML = text;
        sayEl.classList.add('in');
        nEl.textContent = n || '';
      },
      btn(label, fn, group) {
        const b = H('button', 'vz-btn', label);
        b.type = 'button';
        b.addEventListener('click', () => {
          if (group !== false) { btns.forEach(x => { if (x._g) x.classList.remove('on'); }); b.classList.add('on'); }
          fn(b);
        });
        b._g = group !== false;
        ctr.appendChild(b);
        btns.push(b);
        return b;
      }
    };
  }
  function groundLayer(svg, defs, w, h, kind, id) {
    const pid = id + 'g';
    if (kind === 'dots') {
      const p = S('pattern', { id: pid, width: 18, height: 18, patternUnits: 'userSpaceOnUse' }, defs);
      S('circle', { cx: 9, cy: 9, r: 0.9, class: 'vz-gr', style: 'stroke:none' }, p);
    } else if (kind === 'blueprint') {
      const p = S('pattern', { id: pid, width: 96, height: 96, patternUnits: 'userSpaceOnUse' }, defs);
      for (let i = 0; i < 96; i += 24) S('path', { d: 'M' + i + ' 0V96M0 ' + i + 'H96', class: i === 0 ? 'vz-gr2' : 'vz-gr', fill: 'none', style: i === 0 ? '' : 'fill:none' }, p);
    } else if (kind === 'lines') {
      const p = S('pattern', { id: pid, width: 20, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
      S('path', { d: 'M0 19.5H20', class: 'vz-gr', style: 'fill:none' }, p);
    } else if (kind === 'iso') {
      const p = S('pattern', { id: pid, width: 40, height: 23.094, patternUnits: 'userSpaceOnUse' }, defs);
      S('path', { d: 'M0 0L40 23.094M40 0L0 23.094', class: 'vz-gr', style: 'fill:none' }, p);
    } else if (kind === 'rings') {
      [70, 140, 210, 280].forEach(r => S('circle', { cx: w / 2, cy: h / 2, r: r, class: 'vz-axis' }, svg));
      return;
    } else return;
    S('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#' + pid + ')' }, svg);
  }

  /* ---------- flow engine ---------- */
  function flow(host, d) {
    const s = d.viz;
    const F = frame(host, d, s.w, s.h, s.ground);
    const gL = S('g', null, F.svg), gN = S('g', null, F.svg), gX = S('g', null, F.svg), gM = S('g', null, F.svg);
    const N = {};
    let anyInfo = false;

    s.nodes.forEach(n0 => {
      const n = Object.assign({ w: 120, h: 46, shape: 'box' }, n0);
      if (n.shape === 'person') { n.bw = 44; n.bh = 58; n.cy = n.y + 4; }
      else if (n.shape === 'circle') { n.bw = n.bh = n.w; n.cy = n.y; }
      else { n.bw = n.w; n.bh = n.h; n.cy = n.y; }
      const g = S('g', { class: 'vz-node' + (n.info ? ' can' : '') }, gN);
      shape(g, n);
      if (n.shape === 'person') T(g, n.x, n.y + 34, n.label);
      else {
        const off = n.shape === 'cyl' ? 4 : 0;
        if (n.sub) { T(g, n.x, n.y - 3 + off, n.label); T(g, n.x, n.y + 13 + off, n.sub, 'vz-s'); }
        else T(g, n.x, n.y + 4 + off, n.label);
      }
      if (n.info) {
        anyInfo = true;
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', n.label + ': ' + n.info);
        const show = () => {
          F.info.innerHTML = '<b>' + esc(n.label) + '</b>' + esc(n.info);
          gN.querySelectorAll('.sel').forEach(x => x.classList.remove('sel'));
          g.classList.add('sel');
        };
        g.addEventListener('click', show);
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
      }
      n.g = g;
      N[n.id] = n;
    });
    if (anyInfo) F.info.textContent = 'Select a component to see what it does.';

    function shape(g, n) {
      const x = n.x, y = n.y, w = n.w, h = n.h;
      if (n.shape === 'circle') S('circle', { cx: x, cy: y, r: w / 2, class: 'sh' }, g);
      else if (n.shape === 'pill') S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, class: 'sh' }, g);
      else if (n.shape === 'cyl') {
        const ry = 7;
        S('path', { d: 'M' + (x - w / 2) + ' ' + (y - h / 2 + ry) + ' A' + w / 2 + ' ' + ry + ' 0 0 1 ' + (x + w / 2) + ' ' + (y - h / 2 + ry) + ' V' + (y + h / 2 - ry) + ' A' + w / 2 + ' ' + ry + ' 0 0 1 ' + (x - w / 2) + ' ' + (y + h / 2 - ry) + ' Z', class: 'sh' }, g);
        S('path', { d: 'M' + (x - w / 2) + ' ' + (y - h / 2 + ry) + ' A' + w / 2 + ' ' + ry + ' 0 0 0 ' + (x + w / 2) + ' ' + (y - h / 2 + ry), class: 'sh2' }, g);
      } else if (n.shape === 'stack') {
        [8, 4].forEach(o => S('rect', { x: x - w / 2 + o, y: y - h / 2 - o, width: w, height: h, rx: 2, class: 'sh ghost' }, g));
        S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 2, class: 'sh' }, g);
      } else if (n.shape === 'person') {
        S('circle', { cx: x, cy: y - 12, r: 8, class: 'sh' }, g);
        S('path', { d: 'M' + (x - 15) + ' ' + (y + 15) + ' Q' + (x - 14) + ' ' + (y - 1) + ' ' + x + ' ' + (y - 1) + ' Q' + (x + 14) + ' ' + (y - 1) + ' ' + (x + 15) + ' ' + (y + 15) + ' Z', class: 'sh' }, g);
      } else S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 3, class: 'sh' }, g);
    }
    function clip(n, dx, dy) {
      const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      let t;
      if (n.shape === 'circle') t = n.w / 2 + 3;
      else {
        const hw = n.bw / 2 + 3, hh = n.bh / 2 + 3;
        t = Math.min(Math.abs(ux) > 1e-6 ? hw / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? hh / Math.abs(uy) : 1e9);
      }
      return [n.x + ux * t, n.cy + uy * t];
    }
    function geom(a, b, bend) {
      const dx = b.x - a.x, dy = b.cy - a.cy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      if (!bend) return [clip(a, ux, uy), clip(b, -ux, -uy)];
      const cx = (a.x + b.x) / 2 - uy * bend, cy = (a.cy + b.cy) / 2 + ux * bend;
      const p0 = clip(a, cx - a.x, cy - a.cy), p1 = clip(b, cx - b.x, cy - b.cy);
      const out = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, m = 1 - t;
        out.push([m * m * p0[0] + 2 * m * t * cx + t * t * p1[0], m * m * p0[1] + 2 * m * t * cy + t * t * p1[1]]);
      }
      return out;
    }
    const LK = [];
    s.links.forEach(l => {
      const a = N[l.a], b = N[l.b];
      if (!a || !b) return;
      const pts = geom(a, b, l.bend || 0);
      S('path', { d: 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), class: 'vz-link' + (l.dash ? ' dash' : '') }, gL);
      if (l.label) {
        const m = pts.length > 2 ? pts[Math.floor(pts.length / 2)] : [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
        T(gL, m[0], m[1] - 6, l.label, 'vz-ll');
      }
      LK.push({ a: l.a, b: l.b, pts });
    });
    function linkPts(a, b) {
      for (const l of LK) {
        if (l.a === a && l.b === b) return l.pts;
        if (l.a === b && l.b === a) return l.pts.slice().reverse();
      }
      return null;
    }
    function along(pts) {
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const L = cum[cum.length - 1];
      return {
        L,
        at(dd) {
          if (dd <= 0) return pts[0];
          if (dd >= L) return pts[pts.length - 1];
          let i = 1;
          while (cum[i] < dd) i++;
          const t = (dd - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
        }
      };
    }
    function packet(cls) {
      const g = S('g', { class: 'vz-pk ' + (cls || '') }, gX);
      const k = s.packet;
      if (k === 'square') S('rect', { x: -5, y: -5, width: 10, height: 10, rx: 1 }, g);
      else if (k === 'diamond') S('path', { d: 'M0 -7L7 0L0 7L-7 0Z' }, g);
      else if (k === 'capsule') S('rect', { x: -9, y: -4.5, width: 18, height: 9, rx: 4.5 }, g);
      else S('circle', { r: 5.5 }, g);
      return g;
    }
    const place = (g, p) => g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
    function flash(id, ms) {
      const n = N[id];
      if (!n) return;
      n.g.classList.add('hot');
      clearTimeout(n._ft);
      n._ft = setTimeout(() => n.g.classList.remove('hot'), ms || 700);
    }
    function mark(id, good) {
      const n = N[id];
      if (!n) return;
      n.g.classList.remove('hot');
      n.g.classList.add(good ? 'good' : 'bad');
      const t = T(gM, n.x + n.bw / 2 + 2, n.cy - n.bh / 2 - 2, good ? '\u2713' : '\u2715', 'vz-mark ' + (good ? 'good' : 'bad'), 'start');
      setTimeout(() => { n.g.classList.remove('good', 'bad'); t.remove(); }, 2400);
    }
    async function goPath(ids, token, cls, speed) {
      const pk = packet(cls);
      let first = true;
      for (let i = 0; i < ids.length - 1; i++) {
        if (token.dead) break;
        const pts = linkPts(ids[i], ids[i + 1]);
        if (!pts) continue;
        const A = along(pts);
        if (first) { place(pk, A.at(0)); first = false; }
        await tween(token, Math.max(360, A.L / (speed || 0.3)), t => place(pk, A.at(A.L * ease(t))));
        if (!cls) flash(ids[i + 1]);
      }
      pk.classList.add('out');
      setTimeout(() => pk.remove(), 450);
    }

    let tok = null, running = false;
    function clearFx() {
      gX.innerHTML = '';
      gM.innerHTML = '';
      Object.values(N).forEach(n => n.g.classList.remove('hot', 'bad', 'good'));
    }
    async function run(sc) {
      if (tok) tok.kill();
      clearFx();
      const t = (tok = Token());
      running = true;
      const steps = sc.steps;
      for (let i = 0; i < steps.length; i++) {
        const st = steps[i];
        if (t.dead) return;
        const t0 = performance.now();
        if (st.say) F.say(esc(st.say), (i + 1) + ' / ' + steps.length);
        if (st.go) await goPath(st.go, t);
        if (st.par) await Promise.all(st.par.map(p => goPath(p, t)));
        if (t.dead) return;
        if (st.at) flash(st.at, 1400);
        if (st.fail) mark(st.fail, false);
        if (st.ok) mark(st.ok, true);
        const need = st.say ? clamp(st.say.length * 34, 1100, 3300) : 350;
        const el = performance.now() - t0;
        if (el < need) await t.wait(need - el);
      }
      if (t === tok) running = false;
    }

    const idle = Token();
    const iv = setInterval(() => {
      if (running || document.hidden || !LK.length || RM) return;
      const l = LK[Math.floor(Math.random() * LK.length)];
      goPath(Math.random() < 0.5 ? [l.a, l.b] : [l.b, l.a], idle, 'idle', 0.12);
    }, 1300);

    s.scenarios.forEach((sc, i) => {
      const b = F.btn(esc(sc.name), () => run(sc));
      if (i === 0) b.classList.add('on');
    });
    if (s.code) F.box.appendChild(H('pre', 'vz-code', esc(s.code)));
    const auto = setTimeout(() => run(s.scenarios[0]), 650);

    return { destroy() { clearTimeout(auto); if (tok) tok.kill(); idle.kill(); clearInterval(iv); } };
  }

  /* ---------- embeddings: a 2-D semantic map ---------- */
  function embed(host, d) {
    const W = 640, Hh = 440, cx = 320, cy = 220;
    const F = frame(host, d, W, Hh, 'rings');
    S('path', { d: 'M' + (cx - 220) + ' ' + cy + 'H' + (cx + 220) + 'M' + cx + ' ' + (cy - 215) + 'V' + (cy + 215), class: 'vz-axis' }, F.svg);
    const TOP = [
      { n: 'Deployment', a: 0, p: [['Roll back to the previous agent version', 6], ['Deploy v2 next to v1 under a new route', -4], ['Zero-downtime upgrade of a Ray cluster', 14], ['Scale replicas when traffic spikes', -18], ['Autoscale on ongoing requests', -27], ['Set CPU and memory per replica', 25], ['Pod restarted after an OOM kill', 34], ['Drain a node before maintenance', -36]] },
      { n: 'Permissions', a: 90, p: [['Only owners may delete an agent', 92], ['Check if a user may execute a model', 80], ['Team members can run shared agents', 103], ['Grant viewer access to a contractor', 70], ['Revoke an API key', 116], ['List the agents I can edit', 60], ['Map Keycloak groups to teams', 126]] },
      { n: 'Retrieval', a: 180, p: [['Cite the source page in the answer', 178], ['Split documents into overlapping chunks', 196], ['Embed the question with the same model', 207], ['Rerank the top results', 168], ['Filter results by access metadata', 152], ['Refresh the index when a document changes', 216], ['Nearest neighbours by cosine similarity', 226]] },
      { n: 'Agents', a: 270, p: [['Hand a task to an external agent', 262], ['Publish an Agent Card', 251], ['Orchestrator assigns subtasks', 279], ['Critic reviews the draft answer', 290], ['Agent calls a search tool', 240], ['Stop when the budget runs out', 301], ['Keep session memory between turns', 313]] }
    ];
    const pts = [];
    TOP.forEach((tp, ti) => {
      tp.p.forEach((pp, k) => {
        const r = 112 + ((k * 41 + ti * 17) % 66);
        const rad = pp[1] * Math.PI / 180;
        pts.push({ txt: pp[0], ang: pp[1], ti, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) });
      });
      const rad = tp.a * Math.PI / 180, R = tp.a === 90 || tp.a === 270 ? 200 : 214;
      const lx = cx + R * Math.cos(rad), ly = cy + R * Math.sin(rad) + 4;
      T(F.svg, lx, ly, tp.n, 'vz-tl', tp.a === 0 ? 'start' : tp.a === 180 ? 'end' : 'middle');
    });
    const gLines = S('g', null, F.svg), gPts = S('g', null, F.svg);
    pts.forEach(p => {
      const c = S('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 4.5, class: 'vz-pt t' + p.ti, tabindex: 0, role: 'button', 'aria-label': p.txt }, gPts);
      S('title', null, c).textContent = p.txt;
      p.el = c;
      const go = () => query(p.txt, p.ang, p);
      c.addEventListener('click', go);
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    S('circle', { cx: cx, cy: cy, r: 2.5, fill: 'var(--bone-3)' }, F.svg);
    const qm = S('g', { class: 'vz-q' }, F.svg);
    S('circle', { r: 8 }, qm);
    S('path', { d: 'M-14 0H-10M10 0H14M0 -14V-10M0 10V14' }, qm);
    let qx = cx, qy = cy, tok = Token();

    function query(txt, ang, from) {
      tok.kill(); tok = Token(); const t = tok;
      const rad = ang * Math.PI / 180;
      const nx = from ? from.x : cx + 160 * Math.cos(rad), ny = from ? from.y : cy + 160 * Math.sin(rad);
      const sx = qx, sy = qy;
      gLines.innerHTML = '';
      pts.forEach(p => p.el.classList.remove('top'));
      const scored = pts.filter(p => p !== from).map(p => ({ p, s: Math.cos((p.ang - ang) * Math.PI / 180) })).sort((a, b) => b.s - a.s).slice(0, 3);
      F.say('\u201C' + esc(txt) + '\u201D', 'query');
      tween(t, 600, k => {
        const e = ease(k);
        qx = sx + (nx - sx) * e; qy = sy + (ny - sy) * e;
        qm.setAttribute('transform', 'translate(' + qx.toFixed(1) + ' ' + qy.toFixed(1) + ')');
      }).then(() => {
        if (t.dead) return;
        S('path', { d: 'M' + cx + ' ' + cy + 'L' + nx.toFixed(1) + ' ' + ny.toFixed(1), class: 'vz-ray' }, gLines);
        scored.forEach((sc, i) => {
          const l = S('path', { d: 'M' + nx.toFixed(1) + ' ' + ny.toFixed(1) + 'L' + sc.p.x.toFixed(1) + ' ' + sc.p.y.toFixed(1), class: 'vz-nn' }, gLines);
          const L = Math.hypot(sc.p.x - nx, sc.p.y - ny);
          l.style.strokeDasharray = L; l.style.strokeDashoffset = L;
          setTimeout(() => {
            l.style.transition = 'stroke-dashoffset .6s ease';
            l.style.strokeDashoffset = 0;
            sc.p.el.classList.add('top');
          }, 120 + i * 160);
          const lab = T(gLines, sc.p.x + (sc.p.x >= cx ? 9 : -9), sc.p.y - 7, String(i + 1), 'vz-ll', sc.p.x >= cx ? 'start' : 'end');
          lab.style.fill = 'var(--acc)';
        });
      });
      F.info.innerHTML = '<ol class="vz-rank">' + scored.map((sc, i) => '<li data-n="' + (i + 1) + '"><span>' + esc(sc.p.txt) + '</span><b>' + sc.s.toFixed(3) + '</b></li>').join('') + '</ol>';
    }
    const Q = [
      ['How do I ship a new agent version safely?', 2],
      ['Who is allowed to remove this agent?', 95],
      ['Make sure answers point to their sources', 176],
      ['Let another team\u2019s agent take over a task', 258]
    ];
    Q.forEach((q, i) => { const b = F.btn(esc(q[0]), () => query(q[0], q[1], null)); if (i === 0) b.classList.add('on'); });
    F.box.appendChild(H('p', 'vz-note', 'A two-dimensional sketch. Real embeddings have hundreds of dimensions. Here, similarity is the cosine of the angle between two arrows from the centre. Select any point to search from it.'));
    const auto = setTimeout(() => query(Q[0][0], Q[0][1], null), 400);
    return { destroy() { clearTimeout(auto); tok.kill(); } };
  }

  /* ---------- vector index: a small working HNSW ---------- */
  function hnsw(host, d) {
    const W = 640, Hh = 430;
    const F = frame(host, d, W, Hh, 'none');
    const R = rng(11);
    const P = [];
    for (let i = 0; i < 56; i++) P.push([0.05 + R() * 0.9, 0.06 + R() * 0.88]);
    const layers = [P.map((_, i) => i), P.slice(0, 14).map((_, i) => i), [0, 1, 2, 3]];
    const K = [4, 3, 2];
    const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    const adj = layers.map((ids, li) => {
      const m = new Map(ids.map(i => [i, new Set()]));
      ids.forEach(i => {
        ids.filter(j => j !== i).sort((a, b) => dist2(P[i], P[a]) - dist2(P[i], P[b])).slice(0, K[li]).forEach(j => { m.get(i).add(j); m.get(j).add(i); });
      });
      return m;
    });
    const base = [326, 186, 46];
    const proj = (li, u, v) => [64 + u * 400 + v * 120, base[li] + v * 82];
    const gBase = S('g', null, F.svg), gFx = S('g', null, F.svg);
    [2, 1, 0].forEach(li => {
      const c = [proj(li, -0.03, -0.06), proj(li, 1.03, -0.06), proj(li, 1.03, 1.06), proj(li, -0.03, 1.06)];
      S('path', { d: 'M' + c.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z', class: 'hn-plane' }, gBase);
      T(gBase, 56, base[li] - 12, 'layer ' + li + ' \u00B7 ' + layers[li].length + ' points', 'vz-tl', 'start');
    });
    [1, 2].forEach(li => layers[li].forEach(i => {
      const a = proj(li, P[i][0], P[i][1]), b = proj(li - 1, P[i][0], P[i][1]);
      S('path', { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1), class: 'hn-v' }, gBase);
    }));
    [0, 1, 2].forEach(li => {
      const seen = new Set();
      adj[li].forEach((nbs, i) => nbs.forEach(j => {
        const key = Math.min(i, j) + '-' + Math.max(i, j);
        if (seen.has(key)) return;
        seen.add(key);
        const a = proj(li, P[i][0], P[i][1]), b = proj(li, P[j][0], P[j][1]);
        S('path', { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1), class: 'hn-e' }, gBase);
      }));
      layers[li].forEach(i => { const p = proj(li, P[i][0], P[i][1]); S('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: [2.6, 3.4, 4.4][li], class: 'hn-p' }, gBase); });
    });
    let tok = Token();

    async function search(q) {
      tok.kill(); tok = Token(); const t = tok;
      gFx.innerHTML = '';
      [0, 1, 2].forEach(li => {
        const p = proj(li, q[0], q[1]);
        const g = S('g', { class: 'vz-q', transform: 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')' }, gFx);
        S('circle', { r: 5 }, g);
        S('path', { d: 'M-10 0H-7M7 0H10M0 -10V-7M0 7V10' }, g);
      });
      let comps = 0;
      const dq = i => { comps++; return dist2(P[i], q); };
      let cur = 0, best = dq(0);
      const hops = [];
      for (let li = 2; li >= 0; li--) {
        for (;;) {
          let cand = cur;
          adj[li].get(cur).forEach(nb => { const dd = dq(nb); if (dd < best) { best = dd; cand = nb; } });
          if (cand === cur) break;
          hops.push({ li, a: cur, b: cand });
          cur = cand;
        }
        if (li > 0) hops.push({ li, drop: true, a: cur });
      }
      let exact = 0;
      P.forEach((p, i) => { if (dist2(p, q) < dist2(P[exact], q)) exact = i; });
      F.say('Entering at the top layer. Each hop moves to the neighbour closest to the query.', 'search');
      const pk = S('circle', { r: 6, class: 'vz-pk' }, gFx);
      const p0 = proj(2, P[0][0], P[0][1]);
      pk.setAttribute('cx', p0[0]); pk.setAttribute('cy', p0[1]);
      for (const h of hops) {
        if (t.dead) return;
        const a = proj(h.li, P[h.a][0], P[h.a][1]);
        const b = h.drop ? proj(h.li - 1, P[h.a][0], P[h.a][1]) : proj(h.li, P[h.b][0], P[h.b][1]);
        const line = S('path', { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + a[0].toFixed(1) + ' ' + a[1].toFixed(1), class: h.drop ? 'hn-drop' : 'hn-hop' }, gFx);
        gFx.appendChild(pk);
        await tween(t, h.drop ? 520 : 420, k => {
          const e = ease(k), x = a[0] + (b[0] - a[0]) * e, y = a[1] + (b[1] - a[1]) * e;
          pk.setAttribute('cx', x.toFixed(1)); pk.setAttribute('cy', y.toFixed(1));
          line.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + x.toFixed(1) + ' ' + y.toFixed(1));
        });
        if (h.drop) F.say('No closer neighbour on layer ' + h.li + '. Drop to layer ' + (h.li - 1) + ' at the same point.', 'search');
        await t.wait(140);
      }
      if (t.dead) return;
      const f = proj(0, P[cur][0], P[cur][1]);
      S('circle', { cx: f[0], cy: f[1], r: 10, class: 'hn-found' }, gFx);
      if (exact !== cur) { const e = proj(0, P[exact][0], P[exact][1]); S('circle', { cx: e[0], cy: e[1], r: 10, class: 'hn-exact' }, gFx); }
      F.say(exact === cur
        ? 'Found the nearest point with ' + comps + ' distance checks. A full scan needs 56, and finds the same point.'
        : 'Found a near point with ' + comps + ' distance checks. The full scan (56 checks) finds a slightly closer one, ringed in white. That gap is the \u201Capproximate\u201D in approximate nearest neighbour.', 'result');
    }
    F.btn('New random query', () => search([0.05 + Math.random() * 0.9, 0.05 + Math.random() * 0.9]), false);
    F.svg.style.cursor = 'crosshair';
    F.svg.addEventListener('click', e => {
      const p = svgPoint(F.svg, e);
      for (let li = 0; li < 3; li++) {
        const v = (p.y - base[li]) / 82, u = (p.x - 64 - v * 120) / 400;
        if (u >= 0 && u <= 1 && v >= 0 && v <= 1) { search([u, v]); return; }
      }
    });
    F.info.textContent = 'Click anywhere on a layer to place your own query.';
    const auto = setTimeout(() => search([0.78, 0.7]), 500);
    return { destroy() { clearTimeout(auto); tok.kill(); } };
  }

  /* ---------- Ray Serve: replicas, autoscaling, two versions ---------- */
  function ray(host, d) {
    const W = 680, Hh = 404;
    const F = frame(host, d, W, Hh, 'blueprint');
    const TARGET = 2, SVC = 0.35;
    S('rect', { x: 20, y: 166, width: 124, height: 72, class: 'ry-box' }, F.svg);
    T(F.svg, 82, 198, 'HTTP proxy');
    T(F.svg, 82, 214, 'routes by prefix', 'vz-s');
    const routeTxt = T(F.svg, 20, 262, '/summarizer \u2192 v1', 'vz-s', 'start');
    const routeTxt2 = T(F.svg, 20, 278, '', 'vz-s', 'start');
    S('rect', { x: 186, y: 16, width: 474, height: 54, class: 'ry-box' }, F.svg);
    T(F.svg, 202, 40, 'head node', 'vz-l', 'start');
    T(F.svg, 202, 56, 'Serve controller \u00B7 GCS', 'vz-s', 'start');
    const slots = [];
    for (let i = 0; i < 3; i++) {
      const y = 84 + i * 104;
      S('rect', { x: 186, y: y, width: 474, height: 94, class: 'ry-box', style: 'fill:transparent' }, F.svg);
      T(F.svg, 202, y + 24, 'worker-' + (i + 1), 'vz-l', 'start');
      T(F.svg, 202, y + 40, '4 CPU', 'vz-s', 'start');
      for (let j = 0; j < 4; j++) {
        const x = 296 + j * 90;
        S('rect', { x: x, y: y + 14, width: 78, height: 66, rx: 2, class: 'ry-slot' }, F.svg);
        slots.push({ i, j, x, y: y + 14, rep: null });
      }
    }
    const gRep = S('g', null, F.svg), gDots = S('g', null, F.svg);
    const st = { rps: 24, apps: { v1: 1 }, reps: [], seq: 0, cap: false };
    function freeSlot() {
      const free = slots.filter(s => !s.rep);
      if (!free.length) return null;
      const load = [0, 1, 2].map(i => slots.filter(s => s.i === i && s.rep).length);
      free.sort((a, b) => load[a.i] - load[b.i] || a.j - b.j);
      return free[0];
    }
    function addRep(ver) {
      const sl = freeSlot();
      if (!sl) return false;
      const g = S('g', { class: 'ry-rep starting ' + ver }, gRep);
      S('rect', { x: sl.x, y: sl.y, width: 78, height: 66, rx: 2, class: 'b' }, g);
      T(g, sl.x + 10, sl.y + 22, ver, 'vz-l', 'start');
      const stt = T(g, sl.x + 10, sl.y + 38, 'starting', 'vz-s', 'start');
      S('rect', { x: sl.x + 10, y: sl.y + 48, width: 58, height: 6, class: 'ry-bar' }, g);
      const fill = S('rect', { x: sl.x + 10, y: sl.y + 48, width: 0, height: 6, class: 'ry-fill' }, g);
      const r = { id: ++st.seq, ver, sl, g, stt, fill, state: 'starting' };
      sl.rep = r;
      st.reps.push(r);
      r.timer = setTimeout(() => { if (r.state === 'starting') { r.state = 'running'; g.classList.remove('starting'); stt.textContent = 'running'; } }, RM ? 10 : 1100);
      return true;
    }
    function removeRep(r) {
      r.state = 'leaving';
      r.g.classList.add('leaving');
      clearTimeout(r.timer);
      setTimeout(() => { r.g.remove(); r.sl.rep = null; st.reps = st.reps.filter(x => x !== r); }, 520);
    }
    function tick() {
      st.cap = false;
      Object.keys(st.apps).forEach(ver => {
        const share = st.apps[ver];
        const mine = st.reps.filter(r => r.ver === ver && r.state !== 'leaving');
        const ongoing = st.rps * share * SVC;
        const desired = share === 0 ? 0 : Math.max(1, Math.ceil(ongoing / TARGET));
        if (mine.length < desired) { if (!addRep(ver)) st.cap = true; }
        else if (mine.length > desired) {
          const run = mine.filter(r => r.state === 'running');
          if (run.length) removeRep(run[run.length - 1]);
        }
        const live = mine.filter(r => r.state === 'running').length || 1;
        const per = ongoing / live;
        mine.forEach(r => {
          r.fill.setAttribute('width', (58 * clamp(per / (TARGET * 1.5), 0, 1)).toFixed(1));
          r.fill.classList.toggle('hot', per > TARGET * 1.25);
        });
      });
      Object.keys(st.apps).forEach(ver => { if (st.apps[ver] === 0 && !st.reps.some(r => r.ver === ver)) delete st.apps[ver]; });
      const lines = Object.keys(st.apps).map(ver => {
        const n = st.reps.filter(r => r.ver === ver && r.state !== 'leaving').length;
        const per = n ? (st.rps * st.apps[ver] * SVC / n) : 0;
        return '<b>summarizer ' + ver + '</b>' + n + ' replica' + (n === 1 ? '' : 's') + ' \u00B7 ' + per.toFixed(1) + ' ongoing requests each (target ' + TARGET + ')';
      });
      F.info.innerHTML = lines.join('<br>') + (st.cap ? '<br><b style="color:var(--bad)">Cluster full.</b>All 12 CPUs are in use. On KubeRay, the Ray autoscaler would ask Kubernetes for another worker Pod.' : '');
    }
    const iv = setInterval(tick, RM ? 300 : 800);
    addRep('v1');

    let acc = 0, last = performance.now(), raf = 0, alive = true;
    function loop(now) {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - last); last = now;
      if (RM || document.hidden) return;
      acc += dt * Math.min(st.rps, 40) / 1000;
      while (acc >= 1) {
        acc -= 1;
        let ver = 'v1', rr = Math.random(), sum = 0;
        for (const k of Object.keys(st.apps)) { sum += st.apps[k]; if (rr <= sum) { ver = k; break; } }
        const cands = st.reps.filter(r => r.ver === ver && r.state === 'running');
        if (!cands.length) continue;
        const r = cands[Math.floor(Math.random() * cands.length)];
        const dot = S('circle', { r: 3, class: 'ry-dot ' + ver }, gDots);
        const sx = 146, sy = 202, ex = r.sl.x + 39, ey = r.sl.y + 33, mx = (sx + ex) / 2, my = Math.min(sy, ey) - 20;
        const t0 = now;
        (function f(n2) {
          const k = Math.min(1, (n2 - t0) / 560), m = 1 - k;
          dot.setAttribute('cx', (m * m * sx + 2 * m * k * mx + k * k * ex).toFixed(1));
          dot.setAttribute('cy', (m * m * sy + 2 * m * k * my + k * k * ey).toFixed(1));
          if (k < 1 && alive) requestAnimationFrame(f); else dot.remove();
        })(now);
      }
    }
    raf = requestAnimationFrame(loop);

    const range = H('label', 'vz-range', 'Traffic <input type="range" min="2" max="120" value="24" id="ryRange' + UID + '"> <span>24 req/s</span>');
    F.ctr.appendChild(range);
    const inp = range.querySelector('input'), out = range.querySelector('span');
    inp.addEventListener('input', () => {
      st.rps = +inp.value;
      out.textContent = st.rps + ' req/s';
      F.say('Traffic set to ' + st.rps + ' requests a second. The autoscaler aims for ' + TARGET + ' ongoing requests per replica and adds or removes replicas to get there.', 'autoscale');
    });
    let phase = 0;
    const vb = F.btn('Deploy v2 beside v1', () => {
      if (phase === 0) {
        st.apps = { v1: 0.8, v2: 0.2 };
        routeTxt2.textContent = '/summarizer/v2 \u2192 v2';
        F.say('v2 is deployed as a second Serve application under its own route. The gateway sends 20% of callers there; each version scales on its own.', 'versions');
        vb.textContent = 'Promote v2'; phase = 1;
      } else if (phase === 1) {
        st.apps = { v1: 0, v2: 1 };
        routeTxt.textContent = '/summarizer \u2192 v2';
        routeTxt2.textContent = '';
        F.say('All traffic moves to v2. v1 scales to zero and is removed once idle.', 'versions');
        vb.textContent = 'Reset to v1'; phase = 2;
      } else {
        st.reps.slice().forEach(r => removeRep(r));
        st.apps = { v1: 1 };
        routeTxt.textContent = '/summarizer \u2192 v1';
        F.say('Back to a single version.', 'versions');
        vb.textContent = 'Deploy v2 beside v1'; phase = 0;
      }
    }, false);
    F.btn('Crash a replica', () => {
      const run = st.reps.filter(r => r.state === 'running');
      if (!run.length) return;
      const r = run[Math.floor(Math.random() * run.length)];
      r.state = 'dead'; r.g.classList.add('dead'); r.stt.textContent = 'died';
      F.say('A replica dies. The Serve controller sees it and starts a replacement; meanwhile requests go to healthy replicas.', 'recovery');
      clearTimeout(r.timer);
      r.timer = setTimeout(() => {
        r.g.classList.remove('dead'); r.g.classList.add('starting'); r.state = 'starting'; r.stt.textContent = 'restarting';
        r.timer = setTimeout(() => { r.state = 'running'; r.g.classList.remove('starting'); r.stt.textContent = 'running'; }, 1100);
      }, 900);
    }, false);
    F.say('One deployment, one replica. Move the traffic slider and watch the autoscaler respond.', 'start');
    F.box.appendChild(H('pre', 'vz-code', esc('@serve.deployment(\n    ray_actor_options={"num_cpus": 1},\n    autoscaling_config={"min_replicas": 1, "max_replicas": 12,\n                        "target_ongoing_requests": 2},\n)\nclass Summarizer:\n    async def __call__(self, request):\n        ...\n\nserve.run(Summarizer.bind(), name="summarizer-v1", route_prefix="/summarizer")')));
    return { destroy() { alive = false; cancelAnimationFrame(raf); clearInterval(iv); st.reps.forEach(r => clearTimeout(r.timer)); } };
  }

  /* ---------- Kubernetes: reconcile loop on three nodes ---------- */
  function k8s(host, d) {
    const W = 680, Hh = 440;
    const F = frame(host, d, W, Hh, 'iso');
    S('rect', { x: 16, y: 12, width: 648, height: 64, class: 'k-cp' }, F.svg);
    T(F.svg, 28, 28, 'control plane', 'vz-tl', 'start');
    const cpb = {};
    [['api', 'kube-apiserver'], ['etcd', 'etcd'], ['sched', 'kube-scheduler'], ['ctrl', 'controller-manager']].forEach((c, i) => {
      const r = S('rect', { x: 28 + i * 158, y: 36, width: 148, height: 30, rx: 2, class: 'k-cpb' }, F.svg);
      T(F.svg, 28 + i * 158 + 74, 55, c[1], 'vz-s');
      cpb[c[0]] = r;
    });
    const hot = k => { cpb[k].classList.add('hot'); setTimeout(() => cpb[k].classList.remove('hot'), 500); };
    const nodes = [0, 1, 2].map(i => {
      const x = 16 + i * 220, y = 92;
      const r = S('rect', { x: x, y: y, width: 208, height: 262, rx: 2, class: 'k-node' }, F.svg);
      T(F.svg, x + 12, y + 20, 'node-' + (i + 1), 'vz-l', 'start');
      const sub = T(F.svg, x + 12, y + 35, '3.5 Gi allocatable', 'vz-s', 'start');
      S('rect', { x: x + 12, y: y + 244, width: 184, height: 6, class: 'ry-bar' }, F.svg);
      const mem = S('rect', { x: x + 12, y: y + 244, width: 0, height: 6, class: 'k-mem' }, F.svg);
      return { i, x, y, r, sub, mem, cordon: false };
    });
    T(F.svg, 16, 378, 'unscheduled', 'vz-tl', 'start');
    const gPods = S('g', null, F.svg);
    const st = { desired: 3, limit: '2Gi', pods: [], seq: 0, log: [] };
    const ALPHA = 'bcdfghjklmnpqrstvwxz2456789';
    const R = rng(4);
    const pname = () => 'summarizer-7d9f4-' + Array.from({ length: 5 }, () => ALPHA[Math.floor(R() * ALPHA.length)]).join('');
    function ev(type, reason, msg) {
      st.log.unshift({ type, reason, msg });
      st.log = st.log.slice(0, 5);
      F.info.innerHTML = '<ul class="vz-log">' + st.log.map(l => '<li class="' + (l.type === 'Warning' ? 'warn' : '') + '"><em>' + l.type + '</em><em>' + l.reason + '</em>' + esc(l.msg) + '</li>').join('') + '</ul>';
    }
    function mkPod() {
      const p = { id: ++st.seq, name: pname(), node: null, status: 'Pending', restarts: 0, warned: false };
      const g = S('g', { class: 'k-pod Pending' }, gPods);
      S('rect', { x: 0, y: 0, width: 184, height: 50, rx: 2 }, g);
      p.t1 = T(g, 10, 19, p.name, 'vz-s', 'start');
      p.t2 = T(g, 10, 37, 'Pending', 'vz-l', 'start');
      p.t3 = T(g, 174, 37, '', 'vz-s', 'end');
      S('rect', { x: 10, y: 44, width: 164, height: 2, class: 'ry-bar' }, g);
      p.memb = S('rect', { x: 10, y: 44, width: 0, height: 2, class: 'k-mem' }, g);
      p.g = g;
      st.pods.push(p);
      return p;
    }
    function setStatus(p, s) {
      p.status = s;
      p.g.setAttribute('class', 'k-pod ' + s);
      p.t2.textContent = s;
      p.t3.textContent = p.restarts ? 'restarts ' + p.restarts : '';
    }
    function layout() {
      const per = [[], [], []], pend = [];
      st.pods.forEach(p => { if (p.status === 'Terminating' && p.node == null) return; (p.node == null ? pend : per[p.node]).push(p); });
      per.forEach((list, i) => list.forEach((p, k) => { p.g.style.transform = 'translate(' + (nodes[i].x + 12) + 'px,' + (nodes[i].y + 48 + k * 60) + 'px)'; }));
      pend.forEach((p, k) => { p.g.style.transform = 'translate(' + (16 + k * 194) + 'px,386px)'; });
      nodes.forEach((n, i) => {
        const used = st.pods.filter(p => p.node === i && p.status !== 'Terminating').length;
        n.mem.setAttribute('width', (184 * used / 3.5).toFixed(1));
        n.r.classList.toggle('cordon', n.cordon);
        n.sub.textContent = n.cordon ? 'SchedulingDisabled' : used + ' of 3.5 Gi requested';
      });
      const ready = st.pods.filter(p => p.status === 'Running').length;
      statusLine.textContent = 'deployment/summarizer   READY ' + ready + '/' + st.desired + '   memory limit ' + st.limit;
    }
    const statusLine = T(F.svg, 664, 28, '', 'vz-s', 'end');
    function kill(p, reason) {
      setStatus(p, 'Terminating');
      ev('Normal', 'Killing', 'Stopping container in ' + p.name + (reason ? ' (' + reason + ')' : ''));
      setTimeout(() => { p.g.remove(); st.pods = st.pods.filter(x => x !== p); layout(); }, 800);
    }
    function reconcile() {
      const active = st.pods.filter(p => p.status !== 'Terminating');
      if (active.length < st.desired) {
        const p = mkPod();
        hot('ctrl'); hot('api');
        ev('Normal', 'SuccessfulCreate', 'ReplicaSet created pod: ' + p.name);
      } else if (active.length > st.desired) {
        const p = active[active.length - 1];
        hot('ctrl');
        kill(p, 'scale down');
      }
      st.pods.filter(p => p.status === 'Pending').forEach(p => {
        const cands = nodes.filter(n => !n.cordon && st.pods.filter(x => x.node === n.i && x.status !== 'Terminating').length < 3);
        if (!cands.length) {
          if (!p.warned) {
            const cord = nodes.filter(n => n.cordon).length;
            ev('Warning', 'FailedScheduling', '0/3 nodes are available: ' + (cord ? cord + ' node(s) were unschedulable, ' : '') + (3 - cord) + ' Insufficient memory.');
            p.warned = true;
          }
          return;
        }
        cands.sort((a, b) => st.pods.filter(x => x.node === a.i).length - st.pods.filter(x => x.node === b.i).length);
        const n = cands[0];
        p.node = n.i;
        hot('sched');
        setStatus(p, 'ContainerCreating');
        ev('Normal', 'Scheduled', 'Successfully assigned default/' + p.name + ' to node-' + (n.i + 1));
        setTimeout(() => { if (p.status === 'ContainerCreating') { setStatus(p, 'Running'); p.started = performance.now(); } }, RM ? 10 : 700);
      });
      const now = performance.now();
      st.pods.forEach(p => {
        if (p.status === 'Running') {
          const use = st.limit === '512Mi' ? Math.min(1, (now - p.started) / 1800) * 1.15 : 0.55;
          p.memb.setAttribute('width', (164 * Math.min(use, 1)).toFixed(1));
          p.memb.classList.toggle('over', use >= 1);
          if (st.limit === '512Mi' && now - p.started > 1800) {
            p.restarts++;
            setStatus(p, 'OOMKilled');
            ev('Warning', 'OOMKilled', p.name + ' exceeded its 512Mi memory limit and was killed');
            const back = p.restarts >= 2;
            setTimeout(() => {
              if (p.status !== 'OOMKilled') return;
              if (back) { setStatus(p, 'CrashLoopBackOff'); ev('Warning', 'BackOff', 'Back-off restarting failed container in ' + p.name); }
              setTimeout(() => { if (p.status === 'OOMKilled' || p.status === 'CrashLoopBackOff') { setStatus(p, 'Running'); p.started = performance.now(); } }, back ? 2400 : 600);
            }, 700);
          }
        }
      });
      layout();
    }
    const iv = setInterval(reconcile, RM ? 300 : 650);

    F.btn('Delete a pod', () => {
      const run = st.pods.filter(p => p.status === 'Running' || p.status === 'CrashLoopBackOff');
      if (!run.length) return;
      kill(run[Math.floor(Math.random() * run.length)], 'deleted');
      F.say('A pod is deleted. The ReplicaSet controller sees 2 of 3 and creates a replacement; the scheduler places it on a node with room.', 'reconcile');
    }, false);
    const drain = F.btn('Drain node-2', () => {
      const n = nodes[1];
      n.cordon = !n.cordon;
      if (n.cordon) {
        ev('Normal', 'NodeNotSchedulable', 'Node node-2 status is now: NodeNotSchedulable');
        st.pods.filter(p => p.node === 1 && p.status !== 'Terminating').forEach(p => kill(p, 'evicted'));
        F.say('node-2 is cordoned and its pods evicted, as before maintenance. Replacements land on node-1 and node-3.', 'drain');
        drain.textContent = 'Uncordon node-2';
      } else {
        ev('Normal', 'NodeSchedulable', 'Node node-2 status is now: NodeSchedulable');
        F.say('node-2 accepts pods again. Existing pods stay where they are; new ones may land there.', 'drain');
        drain.textContent = 'Drain node-2';
      }
      layout();
    }, false);
    F.btn('Replicas \u2212', () => { st.desired = Math.max(1, st.desired - 1); F.say('Desired replicas: ' + st.desired + '. The controller removes the extra pod.', 'scale'); layout(); }, false);
    F.btn('Replicas +', () => { st.desired = Math.min(9, st.desired + 1); F.say('Desired replicas: ' + st.desired + '. Each pod requests 1 Gi, so a node fits three. Past that, pods wait as Pending.', 'scale'); layout(); }, false);
    const lim = F.btn('Set memory limit 512Mi', () => {
      if (st.limit === '2Gi') {
        st.limit = '512Mi'; lim.textContent = 'Set memory limit 2Gi';
        F.say('The model needs more than 512Mi. Each container is OOM-killed, restarted, and after repeats enters CrashLoopBackOff.', 'limits');
      } else {
        st.limit = '2Gi'; lim.textContent = 'Set memory limit 512Mi';
        F.say('With a 2Gi limit the containers settle and stay Running.', 'limits');
      }
      layout();
    }, false);
    F.say('A Deployment wants three replicas of an agent. Change the world and watch the control loop put it back.', 'start');
    return { destroy() { clearInterval(iv); } };
  }

  /* ---------- Python: blocking vs asyncio timeline ---------- */
  function pyasync(host, d) {
    const W = 680, Hh = 292;
    const F = frame(host, d, W, Hh, 'lines');
    const IO = [1, 0.8, 1.25, 0.9, 1.1, 0.7];
    const segsFor = i => [['cpu', 20], ['io', 140 * IO[i]], ['cpu', 15], ['io', 90 * IO[i]], ['cpu', 10]];
    function schedule(mode, n) {
      const rows = [], loop = [];
      if (mode === 'sync') {
        let t = 0;
        for (let i = 0; i < n; i++) {
          rows.push([]);
          segsFor(i).forEach(([k, dur]) => {
            rows[i].push({ k, a: t, b: t + dur });
            loop.push({ i, k: k === 'cpu' ? 'cpu' : 'blk', a: t, b: t + dur });
            t += dur;
          });
        }
        return { rows, loop, total: t };
      }
      const q = [];
      for (let i = 0; i < n; i++) { rows.push([]); q.push({ i, idx: 0, ready: 0 }); }
      let t = 0, total = 0;
      for (;;) {
        const live = q.filter(c => c.idx < 5);
        if (!live.length) break;
        live.sort((a, b) => a.ready - b.ready || a.i - b.i);
        const c = live[0], segs = segsFor(c.i);
        const start = Math.max(t, c.ready), dur = segs[c.idx][1];
        rows[c.i].push({ k: 'cpu', a: start, b: start + dur });
        loop.push({ i: c.i, k: 'cpu', a: start, b: start + dur });
        t = start + dur;
        c.idx++;
        if (c.idx < 5) { const io = segs[c.idx][1]; rows[c.i].push({ k: 'io', a: t, b: t + io }); c.ready = t + io; c.idx++; }
        total = Math.max(total, t);
      }
      return { rows, loop, total };
    }
    let mode = 'async', n = 3, tok = Token();
    const g = S('g', null, F.svg);
    function draw() {
      tok.kill(); tok = Token(); const t = tok;
      g.innerHTML = '';
      const sch = schedule(mode, n), ref = schedule('sync', n).total;
      const x0 = 128, x1 = 656, k = (x1 - x0) / ref;
      const top = 30, rowH = 168 / n, loopY = top + n * rowH + 22;
      for (let ms = 0; ms <= ref; ms += 100) {
        const x = x0 + ms * k;
        S('path', { d: 'M' + x.toFixed(1) + ' ' + (top - 8) + 'V' + (loopY + 30), class: 'py-ax' }, g);
        T(g, x, loopY + 46, ms + ' ms', 'py-t');
      }
      const clipId = 'pyc' + (++UID);
      const cp = S('clipPath', { id: clipId }, F.defs);
      const cr = S('rect', { x: x0 - 2, y: 0, width: 0, height: Hh }, cp);
      const body = S('g', { 'clip-path': 'url(#' + clipId + ')' }, g);
      sch.rows.forEach((row, i) => {
        const y = top + i * rowH;
        T(g, 16, y + rowH / 2 + 4, 'request ' + (i + 1), 'vz-s', 'start');
        row.forEach(s => {
          const r = S('rect', { x: (x0 + s.a * k).toFixed(1), y: y + rowH * 0.22, width: Math.max(1.5, (s.b - s.a) * k).toFixed(1), height: (rowH * 0.56).toFixed(1), class: s.k === 'cpu' ? 'py-cpu' : 'py-io' }, body);
          if (s.k !== 'cpu') r.setAttribute('fill', F.hatch);
        });
      });
      T(g, 16, loopY + 16, mode === 'sync' ? 'worker' : 'event loop', 'vz-l', 'start');
      sch.loop.forEach(s => {
        const r = S('rect', { x: (x0 + s.a * k).toFixed(1), y: loopY, width: Math.max(1.5, (s.b - s.a) * k).toFixed(1), height: 24, class: s.k === 'cpu' ? 'py-cpu' : 'py-io' }, body);
        if (s.k === 'cpu') r.style.opacity = (0.55 + 0.45 * ((s.i % 3) / 2)).toFixed(2);
        else { r.setAttribute('fill', F.hatch); r.style.opacity = '.55'; }
      });
      const tx = x0 + sch.total * k;
      S('path', { d: 'M' + tx.toFixed(1) + ' ' + (top - 12) + 'V' + (loopY + 30), class: 'py-total' }, body);
      T(body, tx - 6, top - 14, Math.round(sch.total) + ' ms total', 'vz-l', 'end');
      const head = S('path', { d: 'M0 ' + (top - 8) + 'V' + (loopY + 30), class: 'py-head' }, g);
      tween(t, 2200, q => {
        const w = (sch.total * k + 70) * q;
        cr.setAttribute('width', w.toFixed(1));
        head.setAttribute('transform', 'translate(' + (x0 + Math.min(sch.total * k, w)).toFixed(1) + ' 0)');
      }).then(() => head.remove());
      F.say(mode === 'sync'
        ? 'Blocking calls: the worker sits idle through every wait. ' + n + ' requests take ' + Math.round(sch.total) + ' ms.'
        : 'asyncio: while one request waits on the model API, the loop runs another. The same ' + n + ' requests take ' + Math.round(sch.total) + ' ms on one thread.', mode);
    }
    const b1 = F.btn('asyncio', () => { mode = 'async'; draw(); });
    F.btn('Blocking calls', () => { mode = 'sync'; draw(); });
    b1.classList.add('on');
    const nb = F.btn('Six requests', () => { n = n === 3 ? 6 : 3; nb.textContent = n === 3 ? 'Six requests' : 'Three requests'; draw(); }, false);
    F.info.innerHTML = '<b>Solid</b>CPU time on the loop. <b>Hatched</b>waiting on I/O: a model API, a database, another service.';
    F.box.appendChild(H('pre', 'vz-code', esc('async def handle(request):\n    session = await sessions.get(request.session_id)   # waits on I/O\n    reply = await llm.chat(session.messages)           # waits on I/O\n    return render(reply)                               # CPU')));
    const auto = setTimeout(draw, 300);
    return { destroy() { clearTimeout(auto); tok.kill(); } };
  }

  const KINDS = { flow, embed, hnsw, ray, k8s, pyasync };
  return {
    mount(host, d) {
      const f = KINDS[d.viz.type];
      return f ? f(host, d) : { destroy() {} };
    }
  };
})();
