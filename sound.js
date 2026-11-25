/* Sound: the soundtrack starts as soon as the browser allows (on load if permitted, otherwise on the first click or key press), plus quiet interface sounds. */
window.SOUND = (function () {
  'use strict';
  const btn = document.getElementById('snd');
  const label = btn.querySelector('.snd-label');
  const cfg = window.CONFIG || {};
  const audio = new Audio();
  audio.src = cfg.trackUrl || 'aura.mp3';
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  const TARGET = 0.75;
  let on = false, muted = false, ctx = null, sfx = null, fadeRaf = 0;

  function fadeTo(v, ms) {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, t0 = performance.now();
    return new Promise(res => {
      const f = now => {
        const t = Math.min(1, (now - t0) / ms);
        try { audio.volume = Math.max(0, Math.min(1, from + (v - from) * t)); } catch (e) {}
        if (t < 1) fadeRaf = requestAnimationFrame(f); else res();
      };
      fadeRaf = requestAnimationFrame(f);
    });
  }
  function render() {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Sound on. Turn off sound' : 'Sound off. Turn on sound');
    label.textContent = on ? 'Sound on' : 'Sound off';
    btn.classList.toggle('hint', !on && !muted);
  }
  function ensureCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    sfx = ctx.createGain(); sfx.gain.value = 0.8; sfx.connect(ctx.destination);
  }
  async function play() {
    if (on || muted) return on;
    try {
      await audio.play();
      on = true;
      fadeTo(TARGET, 2600);
    } catch (e) { on = false; }
    render();
    return on;
  }
  function pause() {
    on = false;
    render();
    fadeTo(0, 600).then(() => { if (!on) audio.pause(); });
  }
  function toggle() {
    ensureCtx();
    if (on) { muted = true; pause(); }
    else { muted = false; play(); }
  }
  btn.addEventListener('click', toggle);

  // Try to start on load; browsers that block audible autoplay start it on the first gesture instead.
  const gesture = e => {
    if (e.target && e.target.closest && e.target.closest('#snd')) return;
    ensureCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (!on && !muted) play().then(ok => { if (ok) off(); });
  };
  const EVENTS = ['pointerdown', 'keydown', 'touchend'];
  const off = () => EVENTS.forEach(ev => window.removeEventListener(ev, gesture, true));
  EVENTS.forEach(ev => window.addEventListener(ev, gesture, true));
  play().then(ok => { if (ok) off(); });

  function blip(freq, dur, gain) {
    if (!on || !ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(sfx);
    o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    start: play,
    isOn: () => on,
    tick() { blip(1320, 0.09, 0.02); },
    chime() { blip(880, 1.4, 0.025); setTimeout(() => blip(1318.5, 1.6, 0.018), 90); },
    whoosh(dur) {
      if (!on || !ctx) return;
      dur = dur || 1.8;
      const t = ctx.currentTime, len = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = b; bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(260, t);
      bp.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.55);
      bp.frequency.exponentialRampToValueAtTime(500, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04, t + dur * 0.5); g.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(bp).connect(g).connect(sfx);
      s.start(t); s.stop(t + dur);
    },
    swell() {}
  };
})();
