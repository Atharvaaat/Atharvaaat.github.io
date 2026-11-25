/* The threshold (binary rain that condenses into nodes), the 3D universe, and the dimension rooms. */
window.UNIVERSE = (function () {
  'use strict';
  const A = window.ATHARVA, V = window.ATHARVA_VIZ, SND = window.SOUND;
  const $ = s => document.querySelector(s);
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NIGHT = 0x181A16, BONE = 0xE9E2D2;
  const uni = $('#uni'), cv = $('#uniCanvas'), lblLayer = $('#uniLabels'), thr = $('#thr');
  const dim = $('#dim'), dimBody = $('#dimBody'), rel = $('#rel');
  const byId = {};
  A.DIMS.forEach((d, i) => { byId[d.id] = d; d.index = i + 1; });
  const POS = {
    agentic: [0, 3, 0], a2a: [-4.5, 7.5, 5.5], llm: [6.5, 5, 2],
    rag: [11.5, 0, -4], embed: [16, -3.5, 1.5], vector: [16.5, 2.5, -8],
    ray: [-8.5, -1, -5], k8s: [-13.5, -4.5, 0.5], distributed: [-18, 0.5, -3],
    gateway: [2, -2.5, 9], apisix: [-3.5, -5.5, 13.5], auth: [7.5, -4.5, 12.5], keycloak: [3.5, -8.5, 17.5], fga: [11.5, -7, 15.5],
    python: [5, -8, -7]
  };
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const rgba = (h, a) => { const c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };

  let built = false, raf = 0, W = 0, H = 0;
  let renderer, scene, camera, raycaster, ndc, comet;
  const NODES = {}, hits = [], EDGES = [];
  let pulseGeo, pulses = [];
  const OVER = { phi: 1.12, r: 50, target: null };
  let cur, goal;
  const st = { on: false, view: 'overview', current: null, hover: null, busy: false, travel: null, lastInteract: 0, viz: null, returnFocus: null };

  /* ---------- scene ---------- */
  function build() {
    if (built) return;
    built = true;
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(NIGHT, 1);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(NIGHT, 0.0125);
    camera = new THREE.PerspectiveCamera(46, 1, 0.1, 500);
    raycaster = new THREE.Raycaster();
    ndc = new THREE.Vector2();
    OVER.target = new THREE.Vector3(1.2, -1.5, 3.5);
    cur = { theta: 0.5, phi: OVER.phi, r: OVER.r, target: OVER.target.clone() };
    goal = { theta: 0.5, phi: OVER.phi, r: OVER.r, target: OVER.target.clone() };

    const grid = new THREE.PolarGridHelper(54, 24, 9, 128, 0x6E6B60, 0x34352E);
    grid.position.set(1, -15, 3.5);
    grid.material.transparent = true; grid.material.opacity = 0.32;
    scene.add(grid);

    const dotTex = (function () {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const glyphTex = ['0', '1'].map(ch => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d');
      g.fillStyle = '#E9E2D2'; g.font = '500 44px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(ch, 32, 34);
      return new THREE.CanvasTexture(c);
    });
    for (let i = 0; i < 150; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTex[i % 2], transparent: true, opacity: 0.06 + Math.random() * 0.06, depthWrite: false }));
      const r = 36 + Math.random() * 40, th = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 50;
      sp.position.set(Math.cos(th) * r, y, Math.sin(th) * r);
      sp.scale.setScalar(1.1 + Math.random() * 0.8);
      scene.add(sp);
    }

    const GEO = {
      icosa: () => new THREE.IcosahedronGeometry(1.35, 0),
      octa: () => new THREE.OctahedronGeometry(1.45, 0),
      dodeca: () => new THREE.DodecahedronGeometry(1.3, 0),
      tetra: () => new THREE.TetrahedronGeometry(1.55, 0),
      box: () => new THREE.BoxGeometry(1.8, 1.8, 1.8),
      torus: () => new THREE.TorusGeometry(1.15, 0.38, 5, 10),
      knot: () => new THREE.TorusKnotGeometry(0.85, 0.22, 40, 4, 2, 3),
      hept: () => new THREE.CylinderGeometry(1.25, 1.25, 1.3, 7),
      gate: () => new THREE.CylinderGeometry(0.9, 1.5, 1.8, 4, 1, true)
    };
    A.DIMS.forEach(d => {
      const c = A.CLUSTERS[d.cluster];
      const pos = new THREE.Vector3().fromArray(POS[d.id]);
      const g = new THREE.Group(); g.position.copy(pos);
      const geo = (GEO[d.shape] || GEO.icosa)();
      const shellMat = new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.5 });
      const shell = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), shellMat);
      shell.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.color), transparent: true, opacity: 1 });
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), coreMat);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(c.color), transparent: true, opacity: 0.35, depthWrite: false }));
      glow.scale.setScalar(2.4);
      const ringPts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; ringPts.push(new THREE.Vector3(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0)); }
      const ringMat = new THREE.LineBasicMaterial({ color: new THREE.Color(c.color), transparent: true, opacity: 0 });
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), ringMat);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.id = d.id;
      g.add(shell, core, glow, ring, hit);
      scene.add(g);
      hits.push(hit);
      const lbl = document.createElement('button');
      lbl.type = 'button'; lbl.className = 'lbl'; lbl.tabIndex = -1;
      lbl.innerHTML = '<span class="lbl-t">' + esc(d.short) + '</span><span class="lbl-k">' + esc(d.kicker) + '</span>';
      lbl.setAttribute('aria-label', d.title + '. ' + d.kicker);
      lbl.addEventListener('click', () => select(d.id));
      lbl.addEventListener('mouseenter', () => setHover(d.id));
      lbl.addEventListener('mouseleave', () => setHover(null));
      lbl.addEventListener('focus', () => setHover(d.id));
      lbl.addEventListener('blur', () => setHover(null));
      lblLayer.appendChild(lbl);
      NODES[d.id] = { d, pos, g, shell, shellMat, core, coreMat, glow, ring, ringMat, lbl, em: 1, spin: 0.002 + Math.random() * 0.003, color: c.color };
    });

    A.EDGES.forEach(([a, b, text]) => {
      const pa = NODES[a].pos, pb = NODES[b].pos;
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      mid.y += pa.distanceTo(pb) * 0.16;
      const curve = new THREE.QuadraticBezierCurve3(pa.clone(), mid, pb.clone());
      const mat = new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.15 });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(56)), mat);
      scene.add(line);
      EDGES.push({ a, b, text, curve, mat, line, op: 0.15 });
    });

    const n = EDGES.length * 2;
    pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    EDGES.forEach((e, i) => [0, 1].forEach(k => pulses.push({ e, t: Math.random(), v: (0.05 + Math.random() * 0.06) * (k ? -1 : 1) })));
    const pts = new THREE.Points(pulseGeo, new THREE.PointsMaterial({ size: 0.42, map: dotTex, color: 0xE8D2A0, transparent: true, opacity: 0.8, depthWrite: false }));
    scene.add(pts);
    comet = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xF3E6C8, transparent: true, opacity: 0, depthWrite: false }));
    comet.scale.setScalar(1.3);
    scene.add(comet);

    bindPointer();
    buildHud();
    window.addEventListener('resize', resize);
    resize();
  }

  function resize() {
    if (!renderer) return;
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W < 700 ? 60 : 46;
    camera.updateProjectionMatrix();
    OVER.r = W < 700 ? 62 : 50;
  }
  function placeCamera() {
    const t = cur.target, sp = Math.sin(cur.phi);
    camera.position.set(t.x + cur.r * sp * Math.sin(cur.theta), t.y + cur.r * Math.cos(cur.phi), t.z + cur.r * sp * Math.cos(cur.theta));
    camera.lookAt(t);
  }
  function toScreen(v) {
    const p = v.clone().project(camera);
    return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, z: p.z };
  }
  function neighbours(id) {
    const s = new Set([id]);
    EDGES.forEach(e => { if (e.a === id) s.add(e.b); if (e.b === id) s.add(e.a); });
    return s;
  }

  /* ---------- loop ---------- */
  let last = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (st.view === 'overview' && !st.busy && !dragging && now - st.lastInteract > 3500) goal.theta += dt * 0.035;
    const k = 1 - Math.pow(0.0015, dt);
    cur.theta += (goal.theta - cur.theta) * k;
    cur.phi += (goal.phi - cur.phi) * k;
    cur.r += (goal.r - cur.r) * k;
    cur.target.lerp(goal.target, k);
    placeCamera();

    const focus = st.hover || (st.view !== 'overview' ? st.current : null);
    const nb = focus ? neighbours(focus) : null;
    Object.values(NODES).forEach(n => {
      const target = !nb ? 1 : nb.has(n.d.id) ? 1 : 0.22;
      n.em += (target - n.em) * Math.min(1, dt * 6);
      n.shell.rotation.y += n.spin * (focus === n.d.id ? 3 : 1);
      n.shell.rotation.x += n.spin * 0.4;
      n.shellMat.opacity = 0.5 * n.em + (focus === n.d.id ? 0.35 : 0);
      n.coreMat.opacity = 0.25 + 0.75 * n.em;
      n.glow.material.opacity = 0.32 * n.em + (focus === n.d.id ? 0.25 : 0);
      n.ring.quaternion.copy(camera.quaternion);
      const rt = focus === n.d.id ? 0.8 : 0;
      n.ringMat.opacity += (rt - n.ringMat.opacity) * Math.min(1, dt * 8);
      const sc = 1 + (focus === n.d.id ? 0.08 * Math.sin(now / 400) + 0.1 : 0);
      n.g.scale.setScalar(sc);
    });
    EDGES.forEach(e => {
      const isT = st.travel === e;
      const touch = focus && (e.a === focus || e.b === focus);
      const target = isT ? 0.9 : touch ? 0.6 : nb ? 0.05 : 0.15;
      e.op += (target - e.op) * Math.min(1, dt * 6);
      e.mat.opacity = e.op;
      e.mat.color.set(isT || touch ? (NODES[focus] ? NODES[focus].color : '#E9E2D2') : '#E9E2D2');
    });
    const arr = pulseGeo.attributes.position.array;
    pulses.forEach((p, i) => {
      p.t = (p.t + p.v * dt + 1) % 1;
      const v = p.e.curve.getPoint(p.t);
      arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z;
    });
    pulseGeo.attributes.position.needsUpdate = true;

    Object.values(NODES).forEach(n => {
      const p = toScreen(n.pos);
      if (p.z > 1 || p.x < -100 || p.x > W + 100) { n.lbl.style.opacity = 0; n.lbl.style.pointerEvents = 'none'; return; }
      const dist = camera.position.distanceTo(n.pos);
      const fade = clamp(1.35 - dist / 85, 0.4, 1);
      n.lbl.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + (p.y + 20).toFixed(1) + 'px) translate(-50%,0)';
      n.lbl.style.opacity = (fade * (0.3 + 0.7 * n.em)).toFixed(2);
      n.lbl.style.pointerEvents = st.view === 'overview' ? 'auto' : 'none';
      n.lbl.classList.toggle('hov', st.hover === n.d.id);
    });
    renderer.render(scene, camera);
  }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  /* ---------- pointer ---------- */
  let dragging = false, down = null;
  const pointers = new Map();
  function pick(e) {
    const r = cv.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hits, false)[0];
    return hit ? hit.object.userData.id : null;
  }
  function setHover(id) {
    if (st.hover === id) return;
    st.hover = id;
    cv.classList.toggle('point', !!id);
    if (id) SND.tick();
  }
  function bindPointer() {
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY, moved: 0 };
      dragging = true; cv.classList.add('grab');
      st.lastInteract = performance.now();
    });
    cv.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) {
        if (st.view === 'overview' && !st.busy && e.pointerType === 'mouse') setHover(pick(e));
        return;
      }
      const prev = pointers.get(e.pointerId);
      if (pointers.size === 2) {
        const other = [...pointers.entries()].find(([k]) => k !== e.pointerId)[1];
        const d0 = Math.hypot(prev.x - other.x, prev.y - other.y), d1 = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        if (d0 > 0 && st.view === 'overview') goal.r = clamp(goal.r * d0 / d1, 14, 90);
        if (down) down.moved += 20;
      } else if (st.view === 'overview' && !st.busy) {
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        goal.theta -= dx * 0.0055;
        goal.phi = clamp(goal.phi - dy * 0.0045, 0.3, 1.5);
        if (down) down.moved += Math.abs(dx) + Math.abs(dy);
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      st.lastInteract = performance.now();
    });
    const up = e => {
      pointers.delete(e.pointerId);
      if (!pointers.size) { dragging = false; cv.classList.remove('grab'); }
      if (down && down.moved < 7 && e.type === 'pointerup') {
        const id = pick(e);
        if (id) select(id);
      }
      if (!pointers.size) down = null;
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { if (!pointers.size) setHover(null); });
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      if (st.view !== 'overview') return;
      goal.r = clamp(goal.r * (1 + e.deltaY * 0.0011), 14, 90);
      st.lastInteract = performance.now();
    }, { passive: false });
  }

  /* ---------- HUD ---------- */
  function buildHud() {
    const legend = $('#legend');
    Object.values(A.CLUSTERS).forEach(c => {
      const li = document.createElement('li');
      li.style.setProperty('--c', c.color);
      li.innerHTML = '<i></i>' + esc(c.name);
      legend.appendChild(li);
    });
    const idx = $('#uIndex'), ib = $('#uIndexBtn');
    Object.keys(A.CLUSTERS).forEach(k => {
      const c = A.CLUSTERS[k];
      const h = document.createElement('h4'); h.style.setProperty('--c', c.color); h.textContent = c.name; idx.appendChild(h);
      A.DIMS.filter(d => d.cluster === k).forEach(d => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = d.title;
        b.addEventListener('click', () => { idx.hidden = true; ib.setAttribute('aria-expanded', 'false'); select(d.id); });
        idx.appendChild(b);
      });
    });
    ib.addEventListener('click', () => { idx.hidden = !idx.hidden; ib.setAttribute('aria-expanded', String(!idx.hidden)); });
    $('#uBack').addEventListener('click', exit);
    $('#dimClose').addEventListener('click', closeDim);
    document.addEventListener('keydown', e => {
      if (!st.on) return;
      if (e.key === 'Escape') {
        if (st.view === 'dim' && !st.busy) closeDim();
        else if (!idx.hidden) { idx.hidden = true; ib.setAttribute('aria-expanded', 'false'); }
      }
    });
    if (window.matchMedia('(hover: none)').matches) $('#uHelp').textContent = 'Drag to turn \u00B7 Pinch to zoom \u00B7 Tap a name to enter';
  }

  /* ---------- camera moves ---------- */
  function animate(dur, fn) {
    return new Promise(res => {
      if (RM) { fn(1); return res(); }
      const t0 = performance.now();
      (function f(now) {
        const t = Math.min(1, (now - t0) / dur);
        fn(t);
        if (t < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  function flyTo(id, dur) {
    const n = NODES[id];
    const fromT = goal.target.clone(), fromR = goal.r, fromP = goal.phi, fromTh = goal.theta;
    const toR = W < 700 ? 15 : 11;
    let dTh = Math.atan2(n.pos.x - OVER.target.x, n.pos.z - OVER.target.z);
    while (dTh - fromTh > Math.PI) dTh -= Math.PI * 2;
    while (dTh - fromTh < -Math.PI) dTh += Math.PI * 2;
    const toTh = fromTh + (dTh - fromTh) * 0.35;
    return animate(dur || 1500, t => {
      const e = ease(t);
      goal.target.lerpVectors(fromT, n.pos, e);
      goal.r = fromR + (toR - fromR) * e;
      goal.phi = fromP + (1.02 - fromP) * e;
      goal.theta = fromTh + (toTh - fromTh) * e;
    });
  }
  function overview(dur) {
    const fromT = goal.target.clone(), fromR = goal.r, fromP = goal.phi;
    return animate(dur || 1400, t => {
      const e = ease(t);
      goal.target.lerpVectors(fromT, OVER.target, e);
      goal.r = fromR + (OVER.r - fromR) * e;
      goal.phi = fromP + (OVER.phi - fromP) * e;
    });
  }

  /* ---------- dimension rooms ---------- */
  function renderDim(d) {
    const c = A.CLUSTERS[d.cluster];
    dim.style.setProperty('--acc', c.color);
    dim.style.setProperty('--acc-soft', rgba(c.color, 0.16));
    dim.style.setProperty('--ground-a', rgba(c.ground, 0.975));
    dim.style.setProperty('--ground-solid', c.ground);
    dim.style.setProperty('--panel', c.panel);
    dim.style.setProperty('--panel-2', c.panel2);
    const links = A.EDGES.filter(e => e[0] === d.id || e[1] === d.id).map(e => ({ id: e[0] === d.id ? e[1] : e[0], text: e[2] }));
    dimBody.innerHTML =
      '<header class="dim-head">' +
        '<p class="dim-eye"><span>' + esc(c.name) + '</span><span>Dimension ' + d.index + ' of ' + A.DIMS.length + '</span></p>' +
        '<h2 class="dim-title" id="dimTitle" tabindex="-1">' + esc(d.title) + '</h2>' +
        '<p class="dim-kick">' + esc(d.kicker) + '</p>' +
      '</header>' +
      '<div class="dim-grid">' +
        '<div class="dim-viz" id="dimViz"></div>' +
        '<div class="dim-text">' +
          '<section><h3>What it is</h3><p>' + esc(d.what) + '</p></section>' +
          '<section><h3>Why it exists</h3><p>' + esc(d.why) + '</p></section>' +
          '<section><h3>How it works</h3><ol>' + d.how.map(h => '<li>' + esc(h) + '</li>').join('') + '</ol></section>' +
          '<section><h3>How I use it</h3><p>' + esc(d.used) + '</p></section>' +
          '<section><h3>' + (d.built ? 'What I built with it' : 'Where it fits') + '</h3><p>' + esc(d.built || d.fits) + '</p></section>' +
          '<section><h3>Connected dimensions</h3><ul class="dim-links">' + links.map(l => {
            const t = byId[l.id], tc = A.CLUSTERS[t.cluster];
            return '<li><button type="button" data-go="' + l.id + '" style="--c:' + tc.color + '"><b><i>\u25C6</i>' + esc(t.title) + ' <span aria-hidden="true">\u2192</span></b><span>' + esc(l.text) + '</span></button></li>';
          }).join('') + '</ul></section>' +
        '</div>' +
      '</div>';
    dimBody.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => travel(d.id, b.getAttribute('data-go'))));
    if (st.viz) st.viz.destroy();
    st.viz = V.mount(document.getElementById('dimViz'), d);
  }
  function showDim(id) {
    const d = byId[id];
    st.current = id; st.view = 'dim';
    renderDim(d);
    dim.hidden = false;
    dim.querySelector('.dim-scroll').scrollTop = 0;
    uni.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(() => requestAnimationFrame(() => dim.classList.add('open')));
    SND.chime();
    setTimeout(() => { const t = document.getElementById('dimTitle'); if (t) t.focus({ preventScroll: true }); }, 80);
  }
  function hideDim() {
    return new Promise(res => {
      dim.classList.remove('open');
      setTimeout(() => {
        dim.hidden = true;
        if (st.viz) { st.viz.destroy(); st.viz = null; }
        res();
      }, RM ? 0 : 520);
    });
  }
  async function select(id) {
    if (!st.on || st.busy || !byId[id]) return;
    if (st.view === 'dim') {
      if (id === st.current) return;
      const linked = EDGES.some(e => (e.a === st.current && e.b === id) || (e.b === st.current && e.a === id));
      if (linked) return travel(st.current, id);
      st.busy = true;
      await hideDim();
      st.view = 'flying';
      SND.whoosh(1.4);
      await flyTo(id, 1400);
      st.busy = false;
      showDim(id);
      return;
    }
    st.busy = true; st.view = 'flying'; st.current = id;
    setHover(null);
    SND.whoosh(1.5);
    await flyTo(id, 1500);
    st.busy = false;
    showDim(id);
  }
  async function closeDim() {
    if (st.busy || st.view !== 'dim') return;
    st.busy = true;
    await hideDim();
    st.view = 'overview';
    const was = st.current;
    st.current = null;
    await overview(1300);
    st.busy = false;
    const n = NODES[was];
    if (n) n.lbl.focus({ preventScroll: true });
  }
  async function travel(a, b) {
    if (st.busy) return;
    const e = EDGES.find(x => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (!e) return select(b);
    st.busy = true;
    await hideDim();
    st.view = 'flying';
    const forward = e.a === a;
    document.getElementById('relPath').textContent = byId[a].short + '  \u2192  ' + byId[b].short;
    document.getElementById('relText').textContent = e.text;
    rel.classList.add('on');
    st.travel = e; st.current = b;
    SND.whoosh(2.4);
    const fromR = goal.r;
    comet.material.opacity = 0.95;
    await animate(2600, t => {
      const k = ease(t), u = forward ? k : 1 - k;
      goal.target.copy(e.curve.getPoint(u));
      goal.r = fromR + Math.sin(Math.PI * k) * 9;
      const ck = Math.min(1, k + 0.1);
      comet.position.copy(e.curve.getPoint(forward ? ck : 1 - ck));
    });
    comet.material.opacity = 0;
    await new Promise(r => setTimeout(r, RM ? 0 : 900));
    rel.classList.remove('on');
    st.travel = null;
    st.busy = false;
    showDim(b);
  }

  /* ---------- threshold ---------- */
  function threshold(targets, links) {
    return new Promise(resolve => {
      const ctx = thr.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = window.innerHeight;
      thr.width = w * dpr; thr.height = h * dpr;
      thr.hidden = false; thr.style.opacity = '1';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const colW = w < 700 ? 20 : 17, rowH = 19;
      const cols = [];
      for (let i = 0; i < Math.ceil(w / colW); i++) cols.push({ x: i * colW + colW / 2, start: (i / Math.ceil(w / colW)) * 700 + Math.random() * 280, speed: 0.75 + Math.random() * 0.9, len: 7 + Math.floor(Math.random() * 16), off: Math.random() * 400, seed: Math.random() * 1000 });
      const ink = [34, 35, 30], bone = [233, 226, 210];
      const mix = (a, b, t) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';
      const cc = A.DIMS.map(d => hexRgb(A.CLUSTERS[d.cluster].color));
      let parts = null;
      const arrivals = targets.map(() => 0);
      const t0 = performance.now();
      let resolved = false;
      const RAIN = 1700, CONV = 1500, LINES = 900;
      function f(now) {
        const t = now - t0;
        ctx.clearRect(0, 0, w, h);
        const a = clamp((t - 100) / 1300, 0, 1), ae = ease(a);
        ctx.fillStyle = 'rgba(24,26,22,' + ae + ')';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '500 14px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const rainAlpha = t < RAIN ? 1 : clamp(1 - (t - RAIN) / 400, 0, 1);
        if (rainAlpha > 0) {
          const col = mix(ink, bone, ae);
          cols.forEach((c, ci) => {
            if (t < c.start) return;
            const head = ((t - c.start) * c.speed + c.off) % (h + c.len * rowH + 40);
            for (let k = 0; k < c.len; k++) {
              const y = head - k * rowH;
              if (y < -rowH || y > h + rowH) continue;
              const ch = ((Math.floor(t / 110) + k * 7 + ci * 3 + Math.floor(c.seed)) % 2) ? '1' : '0';
              ctx.globalAlpha = rainAlpha * (1 - k / c.len) * (k === 0 ? 1 : 0.75);
              ctx.fillStyle = k === 0 ? (ae > 0.5 ? '#D7A853' : '#4D6A47') : col;
              ctx.fillText(ch, c.x, y);
            }
          });
          ctx.globalAlpha = 1;
        }
        if (t >= RAIN && !parts) {
          parts = [];
          cols.forEach((c, ci) => {
            if (t < c.start) return;
            const head = ((t - c.start) * c.speed + c.off) % (h + c.len * rowH + 40);
            for (let k = 0; k < c.len; k += 2) {
              const y = head - k * rowH;
              if (y < 0 || y > h) continue;
              parts.push({ x: c.x, y, ch: (k + ci) % 2 ? '1' : '0' });
            }
          });
          parts.sort(() => Math.random() - 0.5);
          parts = parts.slice(0, w < 700 ? 420 : 900);
          parts.forEach((p, i) => {
            p.ti = i % targets.length;
            const tg = targets[p.ti];
            const ang = Math.random() * Math.PI * 2, rr = Math.random() * 7;
            p.tx = tg.x + Math.cos(ang) * rr; p.ty = tg.y + Math.sin(ang) * rr;
            p.cx = (p.x + p.tx) / 2 + (Math.random() - 0.5) * 260; p.cy = (p.y + p.ty) / 2 + (Math.random() - 0.5) * 260;
            p.delay = Math.random() * 420; p.dur = 850 + Math.random() * 500; p.done = false;
          });
        }
        if (parts) {
          parts.forEach(p => {
            const u = clamp((t - RAIN - p.delay) / p.dur, 0, 1), e = ease(u), m = 1 - e;
            const x = m * m * p.x + 2 * m * e * p.cx + e * e * p.tx, y = m * m * p.y + 2 * m * e * p.cy + e * e * p.ty;
            const c = cc[p.ti];
            if (u < 0.82) {
              ctx.globalAlpha = 0.9;
              ctx.fillStyle = mix(bone, c, e);
              ctx.font = '500 ' + (14 - 9 * e).toFixed(1) + 'px "IBM Plex Mono", monospace';
              ctx.fillText(p.ch, x, y);
            } else if (u < 1) {
              ctx.globalAlpha = 1 - (u - 0.82) / 0.18;
              ctx.fillStyle = 'rgb(' + c.join(',') + ')';
              ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
            } else if (!p.done) { p.done = true; arrivals[p.ti]++; }
          });
          ctx.globalAlpha = 1;
          const per = parts.length / targets.length;
          if (t > RAIN + CONV * 0.6) {
            const lt = clamp((t - RAIN - CONV * 0.6) / LINES, 0, 1);
            ctx.strokeStyle = 'rgba(233,226,210,' + (0.22 * Math.min(1, lt * 2)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            links.forEach(([i, j]) => {
              const p = targets[i], q = targets[j];
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (q.x - p.x) * ease(lt), p.y + (q.y - p.y) * ease(lt)); ctx.stroke();
            });
          }
          targets.forEach((tg, i) => {
            const fr = clamp(arrivals[i] / per, 0, 1);
            if (fr <= 0) return;
            const c = cc[i];
            const g = ctx.createRadialGradient(tg.x, tg.y, 0, tg.x, tg.y, 18 * fr + 4);
            g.addColorStop(0, 'rgba(' + c.join(',') + ',.55)'); g.addColorStop(1, 'rgba(' + c.join(',') + ',0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(tg.x, tg.y, 18 * fr + 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(' + c.join(',') + ')';
            ctx.beginPath(); ctx.arc(tg.x, tg.y, 2 + 3 * fr, 0, Math.PI * 2); ctx.fill();
          });
        }
        if (!resolved && t > RAIN + CONV + 300) { resolved = true; resolve(); }
        if (t < RAIN + CONV + LINES + 1400) requestAnimationFrame(f);
        else { thr.hidden = true; ctx.clearRect(0, 0, w, h); }
      }
      requestAnimationFrame(f);
    });
  }

  /* ---------- enter / exit ---------- */
  async function enter(targetId) {
    if (st.on) { if (targetId) select(targetId); return; }
    if (typeof THREE === 'undefined') { alertNoGL(); return; }
    try { build(); } catch (err) { alertNoGL(); return; }
    st.on = true; st.busy = true;
    st.returnFocus = document.activeElement;
    document.documentElement.classList.add('locked');
    resize();
    cur.theta = goal.theta = 0.5; cur.phi = goal.phi = OVER.phi; cur.r = goal.r = OVER.r;
    cur.target.copy(OVER.target); goal.target.copy(OVER.target);
    placeCamera();
    camera.updateMatrixWorld();
    const ids = A.DIMS.map(d => d.id);
    const targets = ids.map(id => toScreen(NODES[id].pos));
    const links = EDGES.map(e => [ids.indexOf(e.a), ids.indexOf(e.b)]);
    SND.swell();
    if (!RM) await threshold(targets, links);
    document.body.classList.add('night');
    uni.classList.add('on');
    uni.setAttribute('aria-hidden', 'false');
    Object.values(NODES).forEach(n => { n.lbl.tabIndex = 0; });
    start();
    if (!RM) {
      thr.style.opacity = '0';
      await new Promise(r => setTimeout(r, 900));
    }
    st.busy = false;
    st.lastInteract = performance.now();
    $('#uBack').focus({ preventScroll: true });
    if (targetId) setTimeout(() => select(targetId), RM ? 0 : 500);
  }
  async function exit() {
    if (st.busy) return;
    if (st.view === 'dim') { await hideDim(); }
    st.view = 'overview'; st.current = null;
    uni.classList.remove('on');
    uni.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('night');
    Object.values(NODES).forEach(n => { n.lbl.tabIndex = -1; });
    setTimeout(() => {
      stop();
      st.on = false;
      document.documentElement.classList.remove('locked');
      if (st.returnFocus && st.returnFocus.focus) st.returnFocus.focus({ preventScroll: true });
    }, RM ? 0 : 1000);
  }
  function alertNoGL() {
    const n = $('#bandBits');
    const p = document.createElement('p');
    p.className = 'band-p';
    p.style.cssText = 'grid-column:1/-1;color:#D7A853';
    p.textContent = 'This browser could not start 3D graphics, so the universe cannot open here.';
    const g = $('#threshold .sec-grid');
    if (g && !g.querySelector('.nogl')) { p.classList.add('nogl'); g.appendChild(p); }
    void n;
  }

  return { enter, exit, select };
})();
