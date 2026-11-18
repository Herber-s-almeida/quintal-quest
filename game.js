'use strict';
// ================= QUINTAL QUEST =================
const MAXHP = 8;
const GOD = { on: false }; let CHK = null;
const W = 640, H = 360, T = 16, ROWS = 26, BASE = 3;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---------- utils ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
const store = {
  get(k, d) { try { const v = localStorage.getItem('qq_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('qq_' + k, JSON.stringify(v)); } catch (e) { } }
};

// ---------- images ----------
const IMG = {};
let loaded = 0; const names = Object.keys(ASSETS).filter(k => !k.endsWith('json'));
names.forEach(k => { const im = new Image(); im.onload = () => { loaded++; if (loaded === names.length) boot(); }; im.src = ASSETS[k]; IMG[k] = im; });
const ANT = ASSETS.antjson;
const flipCache = new Map();
function flipped(img) {
  if (flipCache.has(img)) return flipCache.get(img);
  const [c, x] = mkCanvas(img.width, img.height); x.translate(img.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0); flipCache.set(img, c); return c;
}
function tinted(img, color) {
  const [c, x] = mkCanvas(img.width, img.height); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); return c;
}

// ---------- pixel sprite builder ----------
function pix(w, h, fn, outline = '#1a1226', wrap = false) {
  const d = new Array(w * h).fill(0);
  const g = {
    w, h,
    p(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (wrap) { x = ((x % w) + w) % w; y = ((y % h) + h) % h; } if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = c; },
    rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) this.p(x + i, y + j, c); },
    ell(cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) { const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.p(x, y, c); } },
    line(x0, y0, x1, y1, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0 || 1; for (let i = 0; i <= n; i++) this.p(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c); },
    get(x, y) { return d[y * w + x]; }
  };
  fn(g);
  const out = d.slice();
  if (outline) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[y * w + x]) continue;
    const n = (x > 0 && d[y * w + x - 1]) || (x < w - 1 && d[y * w + x + 1]) || (y > 0 && d[(y - 1) * w + x]) || (y < h - 1 && d[(y + 1) * w + x]);
    if (n) out[y * w + x] = outline;
  }
  const [c, x] = mkCanvas(w, h);
  for (let i = 0; i < out.length; i++) if (out[i]) { x.fillStyle = out[i]; x.fillRect(i % w, (i / w) | 0, 1, 1); }
  return c;
}

// ---------- bitmap font ----------
const GL = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001', I: '01110 00100 00100 00100 00100 00100 01110',
  J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 10001 11001 10101 10011 10001 10001', O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110', 2: '01110 10001 00001 00010 00100 01000 11111',
  3: '11111 00010 00100 00010 00001 10001 01110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100', '!': '00100 00100 00100 00100 00100 00000 00100', '?': '01110 10001 00001 00010 00100 00000 00100',
  '.': '00000 00000 00000 00000 00000 01100 01100', ',': '00000 00000 00000 00000 01100 00100 01000', ':': '00000 01100 01100 00000 01100 01100 00000',
  '-': '00000 00000 00000 11111 00000 00000 00000', '+': '00000 00100 00100 11111 00100 00100 00000', '/': '00001 00010 00010 00100 01000 01000 10000',
  '×': '00000 00000 10001 01010 00100 01010 10001', "'": '00100 00100 01000 00000 00000 00000 00000', ' ': '00000 00000 00000 00000 00000 00000 00000',
  '•': '00000 00000 01110 01110 01110 00000 00000', '(': '00010 00100 01000 01000 01000 00100 00010', ')': '01000 00100 00010 00010 00010 00100 01000',
  '◀': '00010 00110 01110 11110 01110 00110 00010', '▶': '01000 01100 01110 01111 01110 01100 01000',
  '↑': '00100 01110 10101 00100 00100 00100 00100',
  '♥': '00000 01010 11111 11111 01110 00100 00000', '★': '00100 00100 11111 01110 01110 11011 00000'
};
const ACC = { '́': [[2, -1], [3, -2]], '̀': [[2, -2], [3, -1]], '̂': [[2, -2], [1, -1], [3, -1]], '̃': [[1, -2], [2, -2], [4, -2], [0, -1], [3, -1]], '̧': [[2, 7], [1, 8]] };
const glyphs = {}; for (const k in GL) glyphs[k] = GL[k].split(' ').map(r => [...r].map(c => c === '1'));
const fontCache = new Map();
function textCanvas(str, color) {
  const key = str + '|' + color; if (fontCache.has(key)) return fontCache.get(key);
  const chars = []; const s = str.toUpperCase().normalize('NFD');
  for (const ch of s) { if (ACC[ch] && chars.length) chars[chars.length - 1].acc = ch; else chars.push({ ch }); }
  const w = chars.length * 6 + 2, h = 13;
  const [c, x] = mkCanvas(w, h);
  const plot = (col) => { x.fillStyle = col; chars.forEach((o, i) => { const g = glyphs[o.ch] || glyphs['?']; const ox = i * 6 + 1, oy = 3; for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r][q]) x.fillRect(ox + q, oy + r, 1, 1); if (o.acc) ACC[o.acc].forEach(([q, r]) => x.fillRect(ox + q, oy + r, 1, 1)); }); };
  plot(color);
  // outline
  const [c2, x2] = mkCanvas(w, h);
  const sh = tinted(c, '#160f22');
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) x2.drawImage(sh, dx, dy);
  x2.drawImage(c, 0, 0);
  fontCache.set(key, c2); return c2;
}
function text(str, x, y, { s = 1, color = '#fff', align = 'left', alpha = 1 } = {}) {
  const c = textCanvas(String(str), color);
  const w = c.width * s; let dx = x; if (align === 'center') dx = x - w / 2; else if (align === 'right') dx = x - w;
  ctx.globalAlpha = alpha; ctx.drawImage(c, Math.round(dx), Math.round(y - 3 * s), w, c.height * s); ctx.globalAlpha = 1;
}

// ---------- audio ----------
const AU = { ac: null, muted: store.get('muted', false) };
function audioInit() {
  if (AU.ac) { if (AU.ac.state === 'suspended') AU.ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ac = AU.ac = new AC();
  AU.master = ac.createGain(); AU.master.gain.value = AU.muted ? 0 : 0.55; AU.master.connect(ac.destination);
  AU.sfx = ac.createGain(); AU.sfx.gain.value = 0.9; AU.sfx.connect(AU.master);
  AU.mus = ac.createGain(); AU.mus.gain.value = 0.22; AU.mus.connect(AU.master);
  const len = ac.sampleRate; const b = ac.createBuffer(1, len, ac.sampleRate); const dd = b.getChannelData(0); for (let i = 0; i < len; i++) dd[i] = Math.random() * 2 - 1; AU.noise = b;
  musicTick();
}
function toggleGod() { GOD.on = !GOD.on; const b = document.getElementById('bgod'); if (b) b.classList.toggle('on', GOD.on); if (state === 'play' && G) { if (GOD.on) P.hp = MAXHP; floatText(GOD.on ? 'GODMODE LIGADO' : 'GODMODE DESLIGADO', P.x, P.y - 60, '#ffe45a', 2); } }
function setMute(m) { AU.muted = m; store.set('muted', m); if (AU.master) AU.master.gain.value = m ? 0 : 0.55; }
function tone({ type = 'square', f = 440, f2 = null, t = .1, v = .2, at = .004, d = 0, out = null, when = null }) {
  const ac = AU.ac; if (!ac) return; const t0 = (when ?? ac.currentTime) + d;
  const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + t);
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + at); g.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
  o.connect(g); g.connect(out || AU.sfx); o.start(t0); o.stop(t0 + t + .02);
}
function noise({ t = .1, v = .2, f = 1000, f2 = null, q = 1, type = 'bandpass', d = 0, out = null, when = null }) {
  const ac = AU.ac; if (!ac) return; const t0 = (when ?? ac.currentTime) + d;
  const s = ac.createBufferSource(); s.buffer = AU.noise; const fl = ac.createBiquadFilter(); fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t0);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + t);
  const g = ac.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
  s.connect(fl); fl.connect(g); g.connect(out || AU.sfx); s.start(t0, Math.random() * .5); s.stop(t0 + t + .02);
}
const SFX = {
  jump() { tone({ f: 260, f2: 720, t: .13, v: .13 }); },
  land() { noise({ f: 500, type: 'lowpass', t: .07, v: .22 }); },
  punch() { noise({ f: 2400, f2: 500, t: .1, v: .22, q: 2 }); },
  hit() { tone({ f: 240, f2: 70, t: .12, v: .3 }); noise({ f: 2500, t: .06, v: .25 }); },
  kill() { tone({ f: 240, f2: 70, t: .12, v: .28 }); tone({ type: 'triangle', f: 700, f2: 1500, t: .14, v: .25, d: .03 }); noise({ f: 3000, t: .08, v: .2 }); },
  stomp() { tone({ f: 180, f2: 620, t: .14, v: .25 }); },
  sugar(n) { const f = 880 * Math.pow(2, Math.min(n, 14) / 12); tone({ type: 'square', f, t: .07, v: .1 }); tone({ type: 'sine', f: f * 1.5, t: .12, v: .14, d: .035 }); },
  hurt() { tone({ type: 'sawtooth', f: 420, f2: 90, t: .32, v: .22 }); },
  dash() { noise({ f: 3500, f2: 700, t: .16, v: .25, q: 1.5 }); tone({ type: 'sine', f: 700, f2: 300, t: .12, v: .12 }); },
  combo(n) { [0, 4, 7, 12].forEach((s, i) => tone({ type: 'square', f: 523 * Math.pow(2, (s + Math.min(n, 12)) / 12), t: .1, v: .12, d: i * .045 })); },
  splash() { noise({ f: 1400, f2: 180, type: 'lowpass', t: .35, v: .3 }); },
  flag() { tone({ type: 'square', f: 300, f2: 1200, t: .7, v: .1 }); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'square', f, t: .14, v: .14, d: i * .09 })); [523, 659, 784].forEach(f => tone({ type: 'triangle', f: f * 2, t: .7, v: .1, d: .38 })); tone({ type: 'square', f: 1047, t: .6, v: .12, d: .38 }); },
  tick() { tone({ type: 'square', f: 1300, t: .03, v: .07 }); },
  star(i) { tone({ type: 'triangle', f: 880 * Math.pow(2, i * 4 / 12), f2: 1760 * Math.pow(2, i * 4 / 12), t: .2, v: .22 }); noise({ f: 6000, t: .15, v: .1, type: 'highpass' }); },
  step() { noise({ f: 900, type: 'lowpass', t: .04, v: .12 }); },
  select() { tone({ f: 660, t: .06, v: .14 }); tone({ f: 990, t: .1, v: .14, d: .06 }); },
  pop() { tone({ type: 'sine', f: 500, f2: 1200, t: .09, v: .2 }); },
  boom() { tone({ type: 'sine', f: 120, f2: 30, t: .45, v: .7 }); noise({ f: 600, f2: 80, type: 'lowpass', t: .5, v: .5 }); },
  roar() { tone({ type: 'sawtooth', f: 160, f2: 90, t: .5, v: .2 }); tone({ type: 'square', f: 240, f2: 120, t: .45, v: .12, d: .05 }); noise({ f: 900, t: .4, v: .2 }); },
  bossHit() { tone({ f: 300, f2: 90, t: .15, v: .3 }); noise({ f: 3000, t: .08, v: .3 }); tone({ type: 'triangle', f: 900, f2: 400, t: .1, v: .15 }); },
  djump() { tone({ f: 500, f2: 1100, t: .12, v: .12 }); tone({ type: 'triangle', f: 900, f2: 1600, t: .1, v: .1, d: .03 }); },
  heal() { [0, 4, 7, 12, 16].forEach((st, i) => tone({ type: 'triangle', f: 660 * Math.pow(2, st / 12), t: .18, v: .18, d: i * .07 })); tone({ type: 'sine', f: 1320, t: .5, v: .1, d: .35 }); },
  powerup() { [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((st, i) => tone({ type: 'square', f: 523 * Math.pow(2, st / 12), t: .08, v: .12, d: i * .05 })); noise({ f: 6000, t: .4, v: .1, type: 'highpass', d: .1 }); },
  spring() { tone({ type: 'square', f: 200, f2: 900, t: .2, v: .14 }); }
};

// ---------- music ----------
const SONGS = {
  map: { bpm: 112, root: 55, prog: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], arp: [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 2, 1, 0, -1], kick: [0, 8], hat: 4 },
  formigueiro: { bpm: 140, root: 52, prog: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], arp: [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 3, 4, 3], kick: [0, 6, 8, 14], hat: 2 },
  areia: { bpm: 150, root: 57, prog: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], arp: [0, 2, 1, 3, 0, 2, 1, 3, 4, 3, 2, 1, 2, 1, 0, 1], kick: [0, 4, 8, 12], hat: 2 },
  pantano: { bpm: 132, root: 50, prog: [[0, 3, 7], [3, 7, 10], [-2, 2, 5], [-4, 0, 3]], arp: [0, -1, 2, 1, -1, 2, 3, -1, 0, -1, 2, 1, 3, 2, 1, -1], kick: [0, 10], hat: 2 },
  gramado: { bpm: 160, root: 55, prog: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [5, 9, 12]], arp: [0, 1, 2, 4, 3, 2, 1, 2, 0, 1, 2, 4, 5, 4, 3, 2], kick: [0, 6, 8, 12], hat: 2 },
  cozinha: { bpm: 156, root: 55, prog: [[0, 4, 7], [5, 9, 12], [2, 5, 9], [7, 11, 14]], arp: [0, 2, 4, 2, 1, 2, 4, 5, 0, 2, 4, 2, 3, 2, 1, 2], kick: [0, 6, 8, 12], hat: 2 },
  banheiro: { bpm: 128, root: 60, prog: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], arp: [0, 1, 2, 4, 2, 1, 0, -1, 0, 1, 2, 4, 5, 4, 2, -1], kick: [0, 8], hat: 4 },
  esgoto: { bpm: 138, root: 48, prog: [[0, 3, 7], [-2, 1, 5], [-4, 0, 3], [-5, -2, 2]], arp: [0, -1, 1, 2, -1, 1, 0, -1, 0, -1, 1, 2, 3, 2, 1, -1], kick: [0, 3, 8, 11], hat: 2 },
  parede: { bpm: 150, root: 53, prog: [[0, 4, 7], [2, 5, 9], [-1, 2, 7], [0, 4, 9]], arp: [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 4, 3, 2, 1], kick: [0, 7, 8, 12], hat: 2 },
  boss: { bpm: 172, root: 50, prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 2, 5]], arp: [0, 3, 1, 3, 2, 3, 1, 3, 0, 3, 1, 3, 4, 3, 2, 1], kick: [0, 3, 6, 8, 11, 14], hat: 1 },
  clear: null
};
const MUS = { song: null, step: 0, next: 0 };
function playSong(name) { MUS.song = SONGS[name] || null; MUS.step = 0; if (AU.ac) MUS.next = AU.ac.currentTime + .05; }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function musicTick() {
  setInterval(() => {
    const ac = AU.ac; if (!ac || !MUS.song || paused) return;
    const S = MUS.song; const dt = 60 / S.bpm / 4;
    if (MUS.next < ac.currentTime) MUS.next = ac.currentTime + .02;
    while (MUS.next < ac.currentTime + .12) {
      const st = MUS.step % 16, bar = Math.floor(MUS.step / 16) % 4, ch = S.prog[bar], w = MUS.next;
      if (st % 2 === 0) tone({ type: 'triangle', f: mtof(S.root - 12 + ch[0] + (st % 4 === 2 ? 12 : 0)), t: dt * 1.8, v: .5, out: AU.mus, when: w });
      const a = S.arp[st]; if (a >= 0) { const n = ch[a % 3] + 12 * Math.floor(a / 3); tone({ type: 'square', f: mtof(S.root + 12 + n), t: dt * .9, v: .16, out: AU.mus, when: w }); }
      if (S.kick.includes(st)) tone({ type: 'sine', f: 150, f2: 40, t: .16, v: .9, out: AU.mus, when: w });
      if (st === 4 || st === 12) noise({ f: 1800, t: .12, v: .45, out: AU.mus, when: w });
      if (st % S.hat === 0) noise({ f: 8000, type: 'highpass', t: .03, v: .18, out: AU.mus, when: w });
      MUS.next += dt; MUS.step++;
    }
  }, 25);
}

// ---------- input ----------
const K = {}; const KP = {};
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', Space: 'jump', KeyZ: 'jump', KeyK: 'jump', KeyX: 'punch', KeyJ: 'punch', ShiftLeft: 'dash', ShiftRight: 'dash', KeyC: 'dash', KeyL: 'dash', ArrowDown: 'down', KeyS: 'down', Enter: 'jump', Escape: 'pause', KeyP: 'pause', KeyM: 'mute', KeyG: 'god' };
function press(k) { if (!K[k]) KP[k] = true; K[k] = true; audioInit(); }
function release(k) { K[k] = false; }
addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (k) { e.preventDefault(); if (!e.repeat) press(k); } });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) release(k); });
const isTouch = ('ontouchstart' in window) || matchMedia('(pointer:coarse)').matches;
function showTouch() { document.body.classList.add('touch'); document.getElementById('touch').style.display = 'block'; }
if (isTouch) showTouch();
addEventListener('touchstart', () => { if (!document.body.classList.contains('touch')) showTouch(); }, { once: true });
{ const bs = document.getElementById('bsel'), sp = document.getElementById('selp');
  if (bs && sp) { bs.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit();
      sp.innerHTML = ''; LEVELS.forEach((d, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + ' • ' + (NODES[i] ? NODES[i].name : d.id); b.onclick = ev => { ev.stopPropagation(); sp.classList.remove('on'); CHK = null; paused = false; prog.unlocked = Math.max(prog.unlocked, LEVELS.length + 1); store.set('prog', prog); startWipe(() => loadLevel(i)); }; sp.appendChild(b); });
      const c = document.createElement('button'); c.className = 'x'; c.textContent = 'FECHAR'; c.onclick = ev => { ev.stopPropagation(); sp.classList.remove('on'); }; sp.appendChild(c); sp.classList.add('on'); });
    sp.addEventListener('pointerdown', e => e.stopPropagation()); } }
{ const gb = document.getElementById('bgod'); if (gb) gb.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); toggleGod(); }); }
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function toggleFullscreen() {
  const doc = document.documentElement;
  const isFS = document.fullscreenElement || document.webkitFullscreenElement;
  const req = doc.requestFullscreen || doc.webkitRequestFullscreen;
  if (!req) {
    alert('📱 No iPhone / iOS:\n\nA Apple bloqueia o botão de tela cheia no navegador.\nPara jogar em tela cheia total sem nenhuma barra:\n\n1. Toque no botão Compartilhar (quadrado com seta)\n2. Selecione "Adicionar à Tela de Início"\n3. Abra pelo ícone na tela do seu iPhone!');
    return;
  }
  if (!isFS) {
    req.call(doc).catch(() => {});
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document).catch(() => {});
  }
}
{ const fb = document.getElementById('bfs');
  if (fb) {
    const upd = () => { const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement); fb.textContent = isFS ? '✕ TELA' : '⛶ CHEIA'; fb.classList.toggle('on', isFS); };
    fb.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); toggleFullscreen(); });
    document.addEventListener('fullscreenchange', upd); document.addEventListener('webkitfullscreenchange', upd);
  }
}
document.querySelectorAll('.tb').forEach(b => {
  const k = b.dataset.k;
  const on = e => {
    e.preventDefault(); e.stopPropagation();
    b.classList.add('on'); press(k);
    if (navigator.vibrate && k !== 'left' && k !== 'right') try { navigator.vibrate(8); } catch (_) {}
  };
  const off = e => {
    e.preventDefault(); e.stopPropagation();
    b.classList.remove('on'); release(k);
  };
  b.addEventListener('touchstart', on, { passive: false });
  b.addEventListener('touchend', off, { passive: false });
  b.addEventListener('touchcancel', off, { passive: false });
  b.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') on(e); });
  b.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') off(e); });
});
// ---- analog stick (fixed anchor per touch, native TouchEvent for iOS, no drifting center) ----
const STK = { id: null, ax: 0, ay: 0, mag: 0 };
(() => {
  const zone = document.getElementById('stick'), base = document.getElementById('sbase'), knob = document.getElementById('sknob');
  if (!zone) return;
  let ox = 0, oy = 0;
  const R = 32, DZ = 0.16;
  const home = () => {
    base.style.left = ''; base.style.top = ''; knob.style.left = '50%'; knob.style.top = '50%'; base.classList.remove('on');
    STK.id = null; STK.ax = 0; STK.ay = 0; STK.mag = 0;
    release('left'); release('right'); release('down'); release('sup');
  };
  const setDir = (ax, ay) => {
    if (ax < -0.18) { if (!K.left) press('left'); if (K.right) release('right'); }
    else if (ax > 0.18) { if (!K.right) press('right'); if (K.left) release('left'); }
    else { if (K.left) release('left'); if (K.right) release('right'); }
    if (ay > 0.35) { if (!K.down) press('down'); } else { if (K.down) release('down'); }
    if (ay < -0.35) { if (!K.sup) press('sup'); } else { if (K.sup) release('sup'); }
  };
  const upd = (clientX, clientY) => {
    const dx = clientX - ox, dy = clientY - oy;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(R, dist);
    const ang = dist > 0 ? Math.atan2(dy, dx) : 0;
    const kx = Math.cos(ang) * clampedDist, ky = Math.sin(ang) * clampedDist;
    knob.style.left = (36 + kx) + 'px'; knob.style.top = (36 + ky) + 'px';
    const norm = clampedDist / R;
    const mag = norm < DZ ? 0 : (norm - DZ) / (1 - DZ);
    STK.mag = mag; STK.ax = (dist > 0 ? (dx / dist) : 0) * mag; STK.ay = (dist > 0 ? (dy / dist) : 0) * mag;
    setDir(STK.ax, STK.ay);
  };
  const onTouchStart = e => {
    e.preventDefault(); if (STK.id !== null) return;
    const t = e.changedTouches[0]; STK.id = t.identifier;
    const rect = zone.getBoundingClientRect();
    ox = t.clientX; oy = t.clientY;
    base.style.left = (ox - rect.left) + 'px'; base.style.top = (oy - rect.top) + 'px';
    base.classList.add('on'); upd(ox, oy); audioInit();
  };
  const onTouchMove = e => {
    if (STK.id === null) return; e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === STK.id) { upd(t.clientX, t.clientY); break; }
    }
  };
  const onTouchEnd = e => {
    if (STK.id === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === STK.id) { home(); break; }
    }
  };
  zone.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('touchcancel', home, { passive: false });

  zone.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    e.preventDefault(); STK.id = 9999;
    const rect = zone.getBoundingClientRect();
    ox = e.clientX; oy = e.clientY;
    base.style.left = (ox - rect.left) + 'px'; base.style.top = (oy - rect.top) + 'px';
    base.classList.add('on'); upd(ox, oy); audioInit();
  });
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || STK.id !== 9999) return;
    upd(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', e => {
    if (STK.id === 9999) home();
  });
})();
cv.addEventListener('pointerdown', e => { audioInit(); KP.tap = true; const r = cv.getBoundingClientRect(); KP.tapX = (e.clientX - r.left) / r.width * W; KP.tapY = (e.clientY - r.top) / r.height * H; });
function resize() {
  cv.style.width = '100%'; cv.style.height = '100%';
}
addEventListener('resize', resize); resize();

// ---------- sprites ----------
const SPR = {};
function buildSprites() {
  const OL = '#1a1226';
  SPR.sugar = pix(10, 10, g => { g.rect(1, 1, 8, 8, '#ffffff'); g.rect(6, 2, 2, 7, '#d6e6f8'); g.rect(1, 7, 8, 2, '#c4d8f0'); g.p(2, 2, '#fff8d0'); g.p(3, 2, '#fff8d0'); g.p(2, 3, '#fff8d0'); }, '#3a4870');
  SPR.heart = pix(11, 10, g => { g.ell(3.5, 3.5, 2.6, 2.6, '#ff3b5c'); g.ell(7.5, 3.5, 2.6, 2.6, '#ff3b5c'); for (let y = 4; y < 9; y++) g.rect(1 + (y - 4), y, 9 - 2 * (y - 4), 1, '#ff3b5c'); g.p(3, 2, '#ffd0d8'); g.p(2, 3, '#ffd0d8'); }, OL);
  SPR.heartE = pix(11, 10, g => { g.ell(3.5, 3.5, 2.6, 2.6, '#4a3050'); g.ell(7.5, 3.5, 2.6, 2.6, '#4a3050'); for (let y = 4; y < 9; y++) g.rect(1 + (y - 4), y, 9 - 2 * (y - 4), 1, '#4a3050'); }, OL);
  SPR.star = pix(15, 15, g => { const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([7.5 + Math.cos(a) * r, 7.8 + Math.sin(a) * r]); } for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) { let ins = false; for (let i = 0, j = 9; i < 10; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > y + .5) !== (yj > y + .5)) && (x + .5 < (xj - xi) * (y + .5 - yi) / (yj - yi) + xi)) ins = !ins; } if (ins) g.p(x, y, y < 7 ? '#ffe45a' : '#ffb52a'); } g.p(6, 4, '#fffbe0'); g.p(6, 5, '#fffbe0'); }, OL);
  SPR.starE = tinted(SPR.star, '#3a2c48');
  SPR.baby = pix(14, 14, g => {
    g.ell(7, 7, 5, 5, '#ffe45a'); g.ell(7, 7, 3, 3, '#fff48a');
    g.p(5, 5, '#1a1020'); g.p(9, 5, '#1a1020'); g.p(5, 6, '#ffffff'); g.p(9, 6, '#ffffff');
    g.line(7, 3, 5, 1, '#ffc420'); g.line(7, 3, 9, 1, '#ffc420'); g.p(7, 8, '#ff9020');
  }, OL);
  SPR.spring = pix(16, 12, g => {
    g.ell(8, 4, 7, 4, '#ff5a36'); g.ell(8, 3, 5, 2, '#ff8a60');
    g.p(5, 3, '#ffffff'); g.p(11, 3, '#ffffff'); g.rect(6, 7, 4, 4, '#e0e0e0'); g.rect(5, 10, 6, 2, '#808080');
  }, OL);
  // enemies (2 frames each)
  SPR.beetle = [0, 1].map(f => pix(34, 24, g => {
    const L = '#1e2a26'; for (let i = 0; i < 3; i++) { const lx = 11 + i * 6, o = ((i + f) % 2) ? 2 : -1; g.line(lx, 16, lx + o, 21, L); g.p(lx + o + 1, 21, L); }
    g.ell(16, 12, 12, 7.5, '#2f7a54'); g.ell(16, 15.5, 11, 3.5, '#1f5238'); g.ell(13, 8.5, 7, 3, '#4fae7a'); g.p(10, 7, '#d8ffe4'); g.p(11, 7, '#d8ffe4');
    g.line(5, 12, 27, 12, '#1f5238');
    g.ell(28.5, 14, 4, 3.6, '#1b3a2c'); g.p(30, 13, '#ffffff'); g.line(30, 11, 32, 7, '#1b3a2c'); g.p(33, 7 + f, '#1b3a2c');
  }, OL));
  SPR.lady = [0, 1].map(f => pix(26, 22, g => {
    if (f === 0) { g.ell(9, 5, 7, 3.2, '#d6ecff'); g.ell(14, 4, 5, 2.4, '#eef8ff'); } else { g.ell(8, 9, 7, 2.6, '#d6ecff'); }
    g.ell(12, 13, 9, 7, '#e0282e'); g.ell(9, 10, 4, 2.5, '#ff7060'); g.p(8, 9, '#ffe0d8');
    g.ell(9, 15, 1.7, 1.7, '#1a1418'); g.ell(15, 10.5, 1.7, 1.7, '#1a1418'); g.ell(15, 17, 1.5, 1.5, '#1a1418'); g.ell(5.5, 11.5, 1.3, 1.3, '#1a1418');
    g.ell(20.5, 14, 4, 3.6, '#1a1418'); g.p(21, 13, '#fff'); g.p(23, 13, '#fff'); g.line(9, 20, 8, 21, '#1a1418'); g.line(14, 20, 15, 21, '#1a1418');
  }, OL));
  SPR.spider = [0, 1].map(f => pix(32, 26, g => {
    const L = '#1c1028'; for (let i = 0; i < 4; i++) { const yy = 9 + i * 3.4, o = ((i + f) % 2) ? 1 : -1; g.line(12, 13, 5, yy - 3 + o, L); g.line(5, yy - 3 + o, 1, yy + 4 + o, L); g.line(20, 13, 27, yy - 3 - o, L); g.line(27, yy - 3 - o, 31, yy + 4 - o, L); }
    g.ell(16, 9, 8, 7, '#43296a'); g.ell(13, 6, 3.5, 2.2, '#7a58aa'); g.p(12, 5, '#d8c8ff'); g.rect(15, 4, 2, 7, '#e85a8a'); g.rect(14, 6, 4, 2, '#e85a8a');
    g.ell(16, 17, 5.5, 4.5, '#2c1a44'); g.p(14, 17, '#ff5050'); g.p(18, 17, '#ff5050'); g.p(15, 18, '#ffb0b0'); g.p(17, 18, '#ffb0b0'); g.p(14, 21, '#c8b8e0'); g.p(18, 21, '#c8b8e0');
  }, OL));
  SPR.scorp = [0, 1].map(f => pix(44, 28, g => {
    const L = '#5a2c10'; for (let i = 0; i < 4; i++) { const lx = 15 + i * 4, o = ((i + f) % 2) ? 2 : -1; g.line(lx, 21, lx + o, 26, L); }
    const tl = f ? 0 : 1;
    [[11, 20, 3.2], [7, 16, 3.2], [6, 11, 3], [8, 6.5, 3], [12.5 + tl, 4.5, 2.6]].forEach(([x, y, r], i) => g.ell(x, y, r, r, i % 2 ? '#d88a36' : '#c8742a'));
    g.ell(17 + tl, 6, 2, 2, '#4a1e0a'); g.p(19 + tl, 7, '#4a1e0a'); g.p(20 + tl, 8, '#2a1006');
    g.ell(23, 20, 10, 4.5, '#d07a2c'); g.ell(21, 18.5, 7, 1.8, '#f0a050'); g.ell(33, 19.5, 5, 4, '#b8641e'); g.p(35, 18, '#1a0e08'); g.p(34, 18, '#fff');
    g.line(35, 21, 38, 18 - f, '#b8641e'); g.ell(40, 16 - f, 3.2, 2.6, '#c8742a'); g.p(42, 18 - f, '#c8742a'); g.p(42, 15 - f, '#f0a050');
  }, OL));
  SPR.hopper = [0, 1].map(f => pix(40, 28, g => {
    const L = '#2a4a10';
    // back leg (big, folded or extended)
    if (f === 0) { g.line(14, 17, 22, 9, '#5a9a1e'); g.line(15, 17, 23, 10, '#5a9a1e'); g.line(22, 9, 12, 25, '#3a6a12'); g.p(11, 26, L); g.p(12, 26, L); }
    else { g.line(14, 17, 8, 12, '#5a9a1e'); g.line(15, 18, 9, 13, '#5a9a1e'); g.line(8, 12, 3, 26, '#3a6a12'); g.p(2, 26, L); }
    g.line(26, 20, 25, 26, L); g.line(30, 20, 32, 26, L);
    g.ell(19, 17, 12, 4.5, '#7cc82a'); g.ell(17, 15, 9, 2, '#b4ec5a'); for (let i = 10; i < 28; i += 3) g.p(i, 20, '#4a8a18');
    g.ell(16, 13, 10, 2.6, '#5a9a1e'); g.line(7, 13, 24, 12, '#3a7a14');
    g.ell(32, 15, 5, 5, '#8ad83a'); g.ell(31, 13, 2.5, 1.5, '#c8f080');
    g.ell(34, 14, 2.2, 2.4, '#ffffff'); g.p(35, 14, '#1a1020'); g.p(35, 13, '#1a1020'); g.line(32, 12, 36, 13, '#1a1020');
    g.line(35, 19, 37, 20, '#3a6a12'); g.line(34, 10, 38, 3, L); g.line(35, 10, 39, 5 + f, L);
  }, OL));
  SPR.ladyC = [0, 1].map(f => pix(28, 24, g => {
    if (f === 0) { g.ell(9, 5, 7, 3.2, '#ffd6d6'); g.ell(15, 4, 5, 2.4, '#fff0f0'); } else { g.ell(8, 9, 7, 2.6, '#ffd6d6'); }
    g.ell(12, 14, 10, 7.5, '#a8101a'); g.ell(9, 11, 4.5, 2.5, '#e8343a'); g.p(8, 10, '#ffd0c8');
    g.ell(9, 16, 2, 2, '#140c10'); g.ell(15, 11, 1.8, 1.8, '#140c10'); g.ell(15, 18, 1.8, 1.8, '#140c10'); g.ell(5, 12, 1.4, 1.4, '#140c10');
    g.ell(22, 15, 5, 4.4, '#140c10'); g.line(20, 12, 24, 13, '#ff2a2a'); g.p(23, 14, '#ffe040'); g.p(24, 14, '#ffe040');
    g.p(25, 18, '#ffffff'); g.p(23, 18, '#ffffff'); g.p(25, 19, '#ffffff'); g.p(26, 17, '#7a0a10');
    g.line(9, 21, 8, 23, '#140c10'); g.line(14, 21, 15, 23, '#140c10');
  }, OL));
  const K = 3;
  const bossF = (pose) => pix(41 * K + 4, 29 * K + 4, g => {
    const E = (x, y, rx, ry, c) => g.ell(x * K + 2, y * K + 2, rx * K, ry * K, c);
    const TL = (x0, y0, x1, y1, r, c) => { const n = 40; for (let i = 0; i <= n; i++) { const t = i / n; g.ell((x0 + (x1 - x0) * t) * K + 2, (y0 + (y1 - y0) * t) * K + 2, r * K, r * K, c); } };
    const dy = pose === 'crouch' ? 1.5 : 0;
    TL(25, 20 + dy, 23.5, 26.5, .45, '#3a6a12'); TL(29, 20 + dy, 30.5, 26.5, .45, '#3a6a12');
    if (pose === 'air') { TL(14, 17, 6, 12, 2, '#4e8c1a'); TL(14, 16.5, 7, 11.5, 1.1, '#7cc82a'); TL(6, 12, 1, 25, .7, '#3a6a12'); for (let i = 0; i < 5; i++) E(5 - i * .9, 14 + i * 2.2, .35, .35, '#c8e880'); }
    else { const kx = pose === 'crouch' ? 21 : 22, ky = pose === 'crouch' ? 10 : 7.5; TL(14, 17 + dy, kx, ky, 2, '#4e8c1a'); TL(14.5, 16.5 + dy, kx, ky + .3, 1.1, '#7cc82a'); for (let i = 1; i < 4; i++) TL(14 + i * 2, 17 + dy - i * 2.3, 15 + i * 2, 16 + dy - i * 2.3, .25, '#3a7a14'); TL(kx, ky, 12, 26, .7, '#3a6a12'); for (let i = 0; i < 5; i++) E(kx - 1 - i * 1.8, ky + 3 + i * 3.2, .35, .35, '#c8e880'); }
    E(17, 17 + dy, 11.5, 4.6, '#7cc82a'); E(17, 19.6 + dy, 10.5, 2, '#5aa020'); E(15, 15 + dy, 8, 1.6, '#b4ec5a');
    for (let x = 8; x < 27; x += 2.4) TL(x, 14.5 + dy, x - .3, 21 + dy, .18, '#4a8a18');
    E(16, 12.8 + dy, 11.5, 2.9, '#4e8c1a'); E(14, 12 + dy, 8.5, 1.3, '#8ac840'); TL(5, 13 + dy, 26, 12 + dy, .2, '#3a6a12'); TL(8, 14 + dy, 24, 13.4 + dy, .15, '#6aaa2a');
    E(27, 15 + dy, 4.8, 4.8, '#6ab826'); E(26, 13 + dy, 2.5, 1.5, '#9ae04a');
    E(32.5, 15 + dy, 5.2, 5.6, '#8ad83a'); E(31.5, 12.5 + dy, 2.6, 1.6, '#c8f080');
    E(34.5, 13.5 + dy, 2.5, 2.7, '#fff6b0'); E(35.2, 13.8 + dy, 1.1, 1.4, '#1a1020'); E(34.8, 13 + dy, .4, .4, '#ffffff');
    TL(31.5, 10.6 + dy, 37, 12.2 + dy, .55, '#1a1020');
    E(36.4, 19 + dy, 1.6, 1.3, '#3a6a12'); E(37.2, 19.5 + dy, .45, .5, '#ffffff'); TL(33, 20 + dy, 37, 21 + dy, .3, '#2a4a10');
    TL(34, 10 + dy, 39.5, 1, .3, '#2a4a10'); TL(35.5, 10.2 + dy, 40.5, 3.5, .3, '#2a4a10');
  }, OL);
  const scorpF = (pose, claw) => pix(62 * K + 4, 34 * K + 4, g => {
    const E = (x, y, rx, ry, c) => g.ell(x * K + 2, y * K + 2, rx * K, ry * K, c);
    const TL = (x0, y0, x1, y1, r, c) => { const n = 40; for (let i = 0; i <= n; i++) { const t = i / n; g.ell((x0 + (x1 - x0) * t) * K + 2, (y0 + (y1 - y0) * t) * K + 2, r * K, r * K, c); } };
    for (let i = 0; i < 4; i++) { const lx = 17 + i * 4.2; TL(lx, 23, lx - 2, 27, .5, '#7a3a14'); TL(lx - 2, 27, lx + (i % 2 ? 1 : -1), 30.5, .45, '#5a2c10'); }
    const tails = { idle: [[14, 21, 3.4], [10, 17, 3.3], [8, 12, 3.1], [10, 7.5, 3], [15, 4.8, 2.8]], raise: [[14, 21, 3.4], [11, 15.5, 3.3], [12, 10, 3.1], [16.5, 5, 3], [22.5, 2.8, 2.8]], strike: [[14, 21, 3.4], [15, 15, 3.3], [21, 10, 3.1], [29, 7, 3], [38, 8, 2.9], [46, 12, 2.8], [51, 18, 2.6]] };
    const tl = tails[pose];
    tl.forEach(([x, y, r], i) => { E(x, y, r, r, i % 2 ? '#d88a36' : '#c8742a'); E(x - r * .3, y - r * .4, r * .45, r * .3, '#f0b060'); });
    const last = tl[tl.length - 1];
    if (pose === 'strike') { TL(last[0], last[1], 56, 25, 1.4, '#5a2410'); TL(56, 25, 57, 31, .6, '#2a1006'); E(54, 23, .6, .6, '#ffb070'); }
    else { const sx = last[0] + 4, sy = last[1] + .5; E(sx, sy, 2.2, 2, '#5a2410'); TL(sx + 1.5, sy + .5, sx + 4, sy + 2.5, .5, '#2a1006'); E(sx - .6, sy - .8, .5, .5, '#ffb070'); }
    E(25, 22, 11.5, 5.2, '#c8742a'); E(25, 24.5, 10.5, 2.2, '#9a5420'); E(23, 20, 8.5, 1.8, '#f0a050');
    for (let x = 16; x < 34; x += 3) TL(x, 18.5, x + .4, 25.5, .2, '#8a4418');
    E(36.5, 21.5, 5.8, 4.8, '#b8641e'); E(35.5, 19.5, 3, 1.4, '#e0904a');
    E(39.5, 19.6, .9, .9, '#ffe040'); E(39.8, 19.6, .45, .55, '#1a0e08'); TL(38, 18, 41.5, 18.8, .35, '#1a0e08');
    TL(39, 23, 44, 21.5, 1.1, '#b8641e'); TL(44, 21.5, 47, 19, 1, '#c8742a');
    E(49.5, 18, 3.8, 3, '#c8742a'); E(48.5, 17, 1.8, 1, '#f0b060');
    const o = claw ? 1.6 : 0;
    E(53, 16.5 - o, 2.4, 1.2, '#b8641e'); E(53, 19.6 + o, 2.4, 1.1, '#9a5420');
    TL(39, 24, 43, 25, .8, '#9a5420'); E(45, 25, 2, 1.4, '#9a5420');
  }, OL);
  SPR.sboss = {}; SPR.sbossW = {};
  ['idle', 'raise', 'strike'].forEach(p => [0, 1].forEach(c => { const k = p + c; SPR.sboss[k] = scorpF(p, c); SPR.sbossW[k] = tinted(SPR.sboss[k], '#ffffff'); }));
  const frogF = (pose, KK) => pix(Math.round(54 * KK + 4), Math.round(32 * KK + 4), g => {
    const ox = 6, E = (x, y, rx, ry, c) => g.ell((x + ox) * KK + 2, y * KK + 2, rx * KK, ry * KK, c);
    const TL = (x0, y0, x1, y1, r, c) => { const n = 30; for (let i = 0; i <= n; i++) { const t = i / n; g.ell((x0 + ox + (x1 - x0) * t) * KK + 2, (y0 + (y1 - y0) * t) * KK + 2, r * KK, r * KK, c); } };
    if (pose === 'jump') { E(10, 17, 7, 4, '#3f8f26'); E(9, 15.5, 4, 1.6, '#6ac83a'); TL(5, 18, -1, 25, 1.3, '#3f8f26'); E(-2, 27, 3, 1.5, '#2f7a1e'); }
    else { E(12, 21, 8, 6, '#3f8f26'); E(10, 19, 4, 2, '#6ac83a'); E(18, 28.5, 8, 2, '#2f7a1e'); E(25.5, 29, 1.6, 1, '#2f7a1e'); }
    if (KK >= 5) { [10, 14.5, 19, 23.5, 28].forEach((sx, i) => { const by = 18 - 10 * Math.sqrt(Math.max(0, 1 - ((sx - 24) / 15) ** 2)) + 1.2; const hgt = i === 2 || i === 3 ? 6 : 4.6; for (let j = 0; j <= 10; j++) { const u = j / 10; E(sx - u * 1.2, by - u * hgt, 1.5 * (1 - u) + .25, .45, u > .65 ? '#f4ecd0' : '#8a3aa0'); } }); }
    E(24, 18, 15, 10, '#56b236'); E(28, 23, 11, 5, '#e8f0a0'); E(20, 12, 7, 2.5, '#7ad84a');
    E(18, 15, 2.6, 1.8, '#2f7a1e'); E(25, 12.5, 2, 1.4, '#2f7a1e'); E(13, 18, 1.8, 1.3, '#2f7a1e'); E(21, 20, 1.5, 1.1, '#2f7a1e');
    E(33, 14, 9, 7, '#56b236');
    E(26, 8, 3.6, 3.6, '#4aa22e'); E(31, 7, 4.6, 4.6, '#56b236'); E(32, 6.5, 3.1, 3.1, '#ffe040'); TL(30.6, 6.6, 33.4, 6.6, .55, '#111111'); E(31.3, 5.4, .6, .6, '#ffffff');
    if (pose === 'open') { E(37, 19, 6.5, 4, '#1e4a14'); E(37, 19.3, 5.8, 3.4, '#5a0a14'); E(37, 20.6, 4, 1.8, '#ff7aa0'); }
    else { TL(29, 18, 41, 16.4, .35, '#1e4a14'); E(36, 17.3, 2, 1.1, '#8ad85a'); }
    E(40, 12.5, .6, .5, '#1e4a14');
    TL(33, 24, 35, 29, 1.2, '#3f8f26'); E(37, 29.5, 2.2, 1, '#2f7a1e');
  }, OL);
  SPR.frog = { sit: frogF('sit', 3), jump: frogF('jump', 3), open: frogF('open', 3) };
  SPR.frogW = { sit: tinted(SPR.frog.sit, '#fff'), jump: tinted(SPR.frog.jump, '#fff'), open: tinted(SPR.frog.open, '#fff') };
  SPR.bfrog = { sit: frogF('sit', 6), jump: frogF('jump', 6), open: frogF('open', 6) };
  SPR.bfrogW = { sit: tinted(SPR.bfrog.sit, '#fff'), jump: tinted(SPR.bfrog.jump, '#fff'), open: tinted(SPR.bfrog.open, '#fff') };
  SPR.stick = [0, 1].map(f => pix(56, 30, g => {
    const C = '#8a6a3a', D = '#5e4626', Lg = '#6e5230';
    [14, 24, 34].forEach((x, i) => { const o = ((i + f) % 2) ? 3 : -2; g.line(x, 14, x - 3 + o, 5, Lg); g.line(x - 3 + o, 5, x - 7 + o, 27, Lg); });
    g.line(44, 13, 49, 6, Lg); g.line(49, 6, 53, 22, Lg);
    g.line(4, 15, 46, 12, C); g.line(4, 16, 46, 13, C); g.line(8, 14, 40, 12, '#a8885a'); g.ell(48, 12, 2.6, 2.1, C); g.p(49, 11, '#1a1020'); g.line(50, 11, 54, 3, D); g.line(49, 10, 51, 2, D); g.line(1, 17, 4, 15, C); g.p(22, 11, '#7a9a3a'); g.p(30, 11, '#7a9a3a');
  }, OL));
  SPR.fly = [0, 1].map(f => pix(34, 30, g => {
    if (f === 0) { g.ell(11, 9, 9, 8, '#ff8a2a'); g.ell(11, 9, 5.5, 4.5, '#ffb84a'); g.ell(8, 6, 1.6, 1.6, '#ffffff'); g.ell(13, 11, 1.4, 1.4, '#2a1a10'); g.ell(12, 20, 7, 5.5, '#ff6a2a'); g.ell(12, 20, 3.5, 2.6, '#ffd060'); g.ell(6, 3, 1, 1, '#2a1a10'); }
    else { g.ell(15, 9, 4, 8.5, '#ff8a2a'); g.ell(15, 9, 2, 5, '#ffb84a'); g.ell(14, 19, 3.5, 5, '#ff6a2a'); }
    g.line(18, 6, 18, 23, '#2a1a10'); g.line(19, 6, 19, 23, '#3a2a1a'); g.ell(19.5, 5, 2, 2, '#2a1a10'); g.line(20, 4, 25, 0, '#2a1a10'); g.line(19, 4, 22, 0, '#2a1a10'); g.p(21, 5, '#ffffff');
  }, OL));
  SPR.cater = [0, 1].map(f => pix(44, 22, g => {
    for (let i = 0; i < 6; i++) { const x = 6 + i * 5.4, arch = f && i > 1 && i < 5 ? -3 : 0, y = 15 + arch; g.ell(x, y, 3.8, 3.8, i % 2 ? '#6ac82a' : '#56a820'); g.p(x, y - 1, '#ffe040'); g.line(x - 1, y - 4, x - 2, y - 7, '#ff7a2a'); g.line(x + 1, y - 4, x + 2, y - 7, '#ff5a2a'); }
    g.ell(39, 14, 4.6, 4.6, '#3a7a14'); g.p(41, 13, '#ffffff'); g.p(42, 13, '#1a1020'); g.line(40, 9, 42, 6, '#2a4a10'); g.line(38, 9, 38, 6, '#2a4a10');
  }, OL));
  const moscaF = (f, king) => pix(king ? 40 : 24, king ? 38 : 20, g => {
    const k = king ? 1.6 : 1, E = (x, y, rx, ry, c) => g.ell(x * k, y * k + (king ? 8 : 0), rx * k, ry * k, c);
    if (f === 0) { E(9, 4, 6, 3.2, '#d8e8f8'); E(13, 3.5, 4.5, 2.5, '#eef6ff'); } else { E(8, 9, 6, 2.4, '#d8e8f8'); }
    E(9, 11, 6.5, 4.5, '#3a3a4a'); E(7.5, 9.5, 3, 1.6, '#6a6a80'); for (let i = 0; i < 3; i++) E(5 + i * 3, 12, .5, 2.6, '#22222e');
    E(16.5, 10, 4, 4, '#2a2a38'); E(18, 8.6, 2.3, 2.6, '#c81e2a'); E(17.6, 7.8, .7, .7, '#ff9a9a');
    g.line(8 * k, (14.5 * k) + (king ? 8 : 0), 7 * k, (17.5 * k) + (king ? 8 : 0), '#1a1020'); g.line(12 * k, (14.5 * k) + (king ? 8 : 0), 13 * k, (17.5 * k) + (king ? 8 : 0), '#1a1020');
    if (king) { g.rect(20, 2, 15, 6, '#ffd040'); g.p(20, 0, '#ffd040'); g.p(20, 1, '#ffd040'); g.rect(26, 0, 3, 2, '#ffd040'); g.p(34, 0, '#ffd040'); g.p(34, 1, '#ffd040'); g.p(23, 4, '#ff3b5c'); g.p(27, 4, '#4ad8ff'); g.p(31, 4, '#7cf05a'); g.rect(20, 7, 15, 1, '#c89020'); }
  }, OL);
  SPR.mosca = [moscaF(0), moscaF(1)]; SPR.moscaK = [moscaF(0, true), moscaF(1, true)];
  const sHead = (open) => pix(48, 32, g => {
    g.ell(6, 16, 4.5, 9, '#1a1a1a');
    if (!open) { g.ell(21, 16, 16, 10, '#5ab030'); g.ell(19, 12, 11, 5, '#7ad848'); g.ell(25, 21, 13, 4, '#d8f080'); g.ell(29, 10, 4, 4, '#ffe040'); g.line(29, 7, 29, 13, '#1a1020'); g.line(23, 5, 34, 8, '#2a5a14'); g.line(24, 6, 34, 9, '#2a5a14'); g.p(41, 13, '#1a1020'); g.line(26, 19, 43, 16, '#2a5a14'); g.ell(15, 11, 1.5, 1.2, '#2a5a14'); g.ell(11, 15, 1.4, 1.2, '#2a5a14'); }
    else { g.ell(23, 26, 13, 4.5, '#d8f080'); g.ell(21, 12, 16, 8.5, '#5ab030'); g.ell(19, 8.5, 11, 4, '#7ad848'); g.ell(31, 19.5, 11, 4.6, '#5a0a20'); g.line(28, 20, 43, 21, '#ff3b5c'); g.line(38, 15, 38, 21, '#ffffff'); g.line(39, 15, 39, 20, '#ffffff'); g.line(32, 15, 32, 19, '#ffffff'); g.ell(29, 7, 4, 4, '#ffe040'); g.line(29, 4, 29, 10, '#1a1020'); g.line(23, 3, 34, 6, '#2a5a14'); g.line(24, 4, 34, 7, '#2a5a14'); g.p(41, 10, '#1a1020'); }
  }, OL);
  SPR.shead = { c: sHead(false), o: sHead(true) }; SPR.sheadW = { c: tinted(SPR.shead.c, '#fff'), o: tinted(SPR.shead.o, '#fff') };
  SPR.snakeM = [0, 1].map(f => pix(34, 16, g => {
    for (let i = 0; i < 7; i++) { const x = 3 + i * 3.6, y = 10 + Math.sin(i * 1.1 + f * 1.6) * 2.2; g.ell(x, y, 2.6 + i * .15, 2.6 + i * .15, i % 2 ? '#1a1a1a' : '#6ad030'); }
    g.ell(29, 8.5, 4.2, 3.4, '#5ab030'); g.p(30, 7, '#ffe040'); g.p(31, 7, '#1a1020'); if (f) { g.line(33, 9, 34, 9, '#ff3b5c'); }
  }, OL));
  SPR.roach = [0, 1].map(f => pix(30, 14, g => {
    for (let i = 0; i < 3; i++) { const lx = 9 + i * 5, o = ((i + f) % 2) ? 2 : -2; g.line(lx, 9, lx + o, 13, '#2a160a'); }
    g.ell(13, 7, 10, 4.6, '#6a3416'); g.ell(11, 5.4, 7, 1.8, '#b0703a'); g.line(13, 3, 13, 11, '#4a220c'); g.ell(24.5, 8, 3.2, 2.8, '#3a1c0a'); g.p(26, 7, '#ffffff');
    g.line(26, 6, 29, 0, '#3a1c0a'); g.line(27, 7, 29, 2 + f, '#3a1c0a'); g.line(2, 6, 0, 4, '#4a220c');
  }, OL));
  SPR.roachB = [0, 1].map(f => pix(40, 20, g => {
    for (let i = 0; i < 3; i++) { const lx = 12 + i * 7, o = ((i + f) % 2) ? 3 : -2; g.line(lx, 13, lx + o, 19, '#1a1006'); g.p(lx + o + 1, 19, '#1a1006'); }
    g.ell(17, 10, 14, 6.5, '#3a2610'); g.ell(14, 7.5, 9, 2.4, '#6a4a22'); g.line(17, 4, 17, 16, '#22160a');
    g.ell(9, 9, 2, 1.6, '#8ac030'); g.ell(21, 12, 2.2, 1.6, '#8ac030'); g.ell(14, 13, 1.4, 1, '#b0e040');
    g.ell(33, 11, 4.4, 4, '#2a1a0a'); g.p(35, 9, '#ff3020'); g.p(34, 9, '#ff3020'); g.line(35, 14, 36, 18, '#a8d840'); g.p(36, 19, '#c8f060');
    g.line(35, 8, 39, 0, '#2a1a0a'); g.line(36, 9, 39, 3 + f, '#2a1a0a');
  }, OL));
  SPR.rat = [0, 1].map(f => pix(50, 28, g => {
    g.line(2, 12, 6, 18, '#e090a0'); g.line(6, 18, 12, 20, '#e090a0'); g.line(1, 11, 2, 12, '#e090a0');
    [16, 22, 30, 35].forEach((lx, i) => { const o = ((i + f) % 2) ? 2 : -2; g.line(lx, 20, lx + o, 26, '#5a5060'); g.line(lx + o, 26, lx + o + 2, 26, '#e090a0'); });
    g.ell(25, 16, 14, 7.5, '#7a7088'); g.ell(23, 12.5, 10, 3, '#9a90a8'); g.ell(26, 20, 10, 3, '#5e566c');
    g.ell(40, 15, 7, 5.5, '#7a7088'); g.ell(47, 17, 2.4, 2, '#7a7088'); g.p(49, 17, '#ff8aa0');
    g.ell(37, 8.5, 3.2, 3.4, '#7a7088'); g.ell(37, 8.5, 1.8, 2, '#ff9ab0'); g.p(43, 13, '#ff2020'); g.line(41, 11, 44, 12, '#2a2030'); g.rect(45, 20, 2, 3, '#fff8e0');
  }, OL));
  SPR.flea = [0, 1].map(f => pix(12, 11, g => { g.ell(5.5, 5, 4.2, 3.6, '#6a2a14'); g.ell(4.5, 3.8, 2, 1.2, '#a85a30'); g.p(9, 4, '#ffffff'); g.line(4, 8, f ? 1 : 2, 10, '#3a1608'); g.line(7, 8, f ? 9 : 10, 10, '#3a1608'); }, OL));
  SPR.fleaW = tinted(SPR.flea[0], '#ffffff');
  { const KR = 3;
    const ratB = (arms) => pix(46 * KR + 4, 40 * KR + 4, g => {
      const E = (x, y, rx, ry, c) => g.ell(x * KR + 2, y * KR + 2, rx * KR, ry * KR, c);
      const TL = (x0, y0, x1, y1, r, c) => { for (let i = 0; i <= 30; i++) { const t = i / 30; g.ell((x0 + (x1 - x0) * t) * KR + 2, (y0 + (y1 - y0) * t) * KR + 2, r * KR, r * KR, c); } };
      TL(8, 34, 2, 26, .7, '#d07890'); TL(2, 26, 4, 16, .6, '#d07890');
      TL(17, 33, 15, 39, 1.6, '#5a5060'); TL(27, 33, 29, 39, 1.6, '#5a5060'); E(14, 39, 3, 1.2, '#e090a0'); E(30, 39, 3, 1.2, '#e090a0');
      E(22, 26, 11, 10, '#6e6480'); E(23, 28, 7, 7, '#a89cb8'); E(19, 20, 6, 3, '#8a80a0');
      if (arms) { TL(14, 20, 9, 7, 1.7, '#6e6480'); TL(30, 20, 35, 7, 1.7, '#6e6480'); E(9, 6, 2, 2, '#e090a0'); E(35, 6, 2, 2, '#e090a0'); }
      else { TL(14, 21, 12, 30, 1.7, '#6e6480'); TL(31, 21, 37, 27, 1.7, '#6e6480'); E(12, 31, 2, 1.8, '#e090a0'); E(38, 27, 2, 1.8, '#e090a0'); }
      E(26, 13, 9, 7.5, '#6e6480'); E(35, 15, 5, 3.6, '#6e6480'); E(40, 15.5, 1.8, 1.5, '#ff7a90');
      E(20, 6, 4.2, 4.6, '#6e6480'); E(20, 6, 2.6, 3, '#ff9ab0'); E(30, 5.5, 3.6, 4, '#6e6480'); E(30, 5.5, 2.2, 2.6, '#ff9ab0');
      E(30, 11.5, 1.9, 1.7, '#ffe8e8'); E(30.5, 11.8, .9, .9, '#ff1010'); TL(27, 9, 33, 10.2, .45, '#2a2030');
      TL(31, 18.6, 38, 17.6, .3, '#2a2030'); g.rect(36 * KR, 18.5 * KR, 2 * KR, 3 * KR, '#fff4c8'); g.rect(38.5 * KR, 18.5 * KR, 1.6 * KR, 2.6 * KR, '#fff4c8');
      TL(22, 26, 24, 29, .2, '#5a5068'); TL(19, 24, 21, 27, .2, '#5a5068');
      TL(38, 14, 44, 12, .15, '#2a2030'); TL(38, 15.5, 44, 16, .15, '#2a2030');
    }, OL);
    SPR.ratB = { s: ratB(false), u: ratB(true) }; SPR.ratBW = { s: tinted(SPR.ratB.s, '#fff'), u: tinted(SPR.ratB.u, '#fff') };
    SPR.poop = pix(32 * KR + 4, 28 * KR + 4, g => {
      const E = (x, y, rx, ry, c) => g.ell(x * KR + 2, y * KR + 2, rx * KR, ry * KR, c);
      E(16, 23, 15, 5, '#5a3414'); E(16, 21.5, 14, 4, '#7a4a1e'); E(16, 16, 11, 4.4, '#6a3e18'); E(16, 14.6, 10, 3.4, '#8a5826'); E(16, 9.6, 7.5, 3.6, '#6a3e18'); E(16, 8.4, 6.6, 2.8, '#8a5826'); E(17.5, 4.5, 3.2, 2.6, '#7a4a1e'); E(19.5, 2.2, 1.6, 1.4, '#8a5826');
      E(12, 13.4, 3, 1, '#b07a40'); E(13, 7.6, 2.4, .8, '#b07a40'); E(10, 20, 3, .9, '#a06a34');
      [[7, 21.5], [22, 22], [25, 15.5], [9, 15], [19, 9.5], [14, 4.8], [26, 21], [5, 23]].forEach(([x, y]) => { E(x, y, 1.3, 1, '#ffd040'); E(x - .3, y - .3, .5, .4, '#fff2a0'); });
    }, OL);
  }
  SPR.boss = { stand: bossF('stand'), crouch: bossF('crouch'), air: bossF('air') };
  SPR.bossW = { stand: tinted(SPR.boss.stand, '#ffffff'), crouch: tinted(SPR.boss.crouch, '#ffffff'), air: tinted(SPR.boss.air, '#ffffff') };
  { const sc = .34, cw = Math.round(ANT.cw * sc), ch = Math.round(ANT.ch * sc), n = IMG.ant.width / ANT.cw;
    const [c, x] = mkCanvas(cw * n, ch); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    for (let i = 0; i < n; i++) x.drawImage(IMG.ant, i * ANT.cw, 0, ANT.cw, ANT.ch, i * cw, 0, cw, ch);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(40,12,40,0.18)'; x.fillRect(0, 0, c.width, ch);
    SPR.mini = { img: c, cw, ch }; }
  { const [c, x] = mkCanvas(ANT.cw, ANT.ch); const fi = ANT.anims.hurt[0]; x.drawImage(IMG.ant, fi * ANT.cw, 0, ANT.cw, ANT.ch, 0, 0, ANT.cw, ANT.ch);
    const apron = pix(14, 12, g => { g.ell(7, 6, 5.5, 5, '#ffffff'); g.ell(6, 4.5, 3, 2, '#ffffff'); g.rect(6, 3, 2, 6, '#ff3b5c'); g.rect(4, 5, 6, 2, '#ff3b5c'); }, '#1a1226');
    const cap = pix(16, 9, g => { g.rect(2, 3, 12, 5, '#ffffff'); g.rect(4, 1, 8, 3, '#ffffff'); g.rect(7, 2, 2, 5, '#ff3b5c'); g.rect(5, 3, 6, 2, '#ff3b5c'); g.rect(2, 7, 12, 1, '#d8e0f0'); }, '#1a1226');
    x.drawImage(apron, 27, 36); x.drawImage(cap, 24, 15); SPR.nurse = c; }
  SPR.station = pix(46, 66, g => {
    g.rect(21, 16, 4, 50, '#9a6a3a'); g.rect(21, 16, 1, 50, '#c8955a');
    g.rect(9, 22, 28, 20, '#f4f0e6'); g.rect(9, 40, 28, 2, '#d8d0c0'); g.rect(20, 25, 6, 14, '#ff3b5c'); g.rect(16, 29, 14, 6, '#ff3b5c'); g.rect(21, 26, 1, 4, '#ff9aa8');
    g.ell(23, 12, 22, 8, '#3a9a2a'); g.ell(23, 10, 19, 5.5, '#6ac83a'); g.ell(16, 8, 7, 2, '#a8e870'); g.line(4, 13, 42, 13, '#2a7a1a');
    for (let i = 0; i < 5; i++) g.ell(8 + i * 7.5, 18, 2, 3, '#2f8a22');
  }, '#1a1226');
  SPR.heartH = (() => { const [c, x] = mkCanvas(11, 10); x.drawImage(SPR.heartE, 0, 0); x.drawImage(SPR.heart, 0, 0, 6, 10, 0, 0, 6, 10); return c; })();
  const termF = (sol, f) => pix(sol ? 24 : 18, sol ? 30 : 24, g => {
    const cx = sol ? 12 : 9, L = '#3a2414';
    const ys = sol ? [14, 18, 22] : [11, 14, 17];
    ys.forEach((y, i) => { const o = ((i + f) % 2) ? 2 : -1; g.line(cx - 2, y, cx - 7, y + o - 1, L); g.line(cx - 7, y + o - 1, cx - 8, y + o + 2, L); g.line(cx + 2, y, cx + 7, y - o - 1, L); g.line(cx + 7, y - o - 1, cx + 8, y - o + 2, L); });
    if (sol) { g.ell(cx, 22, 5, 6.5, '#f4e6c8'); g.ell(cx - 1.5, 20, 2, 2.5, '#fffaf0'); for (let y = 18; y < 28; y += 3) g.line(cx - 4, y, cx + 4, y, '#d8c4a0'); g.ell(cx, 14, 3.2, 2.6, '#e8d4b0'); g.ell(cx, 8, 6, 5.5, '#b4561c'); g.ell(cx - 2, 6, 2, 1.5, '#e08a4a'); g.line(cx - 3, 3, cx - 6, -1, '#2a1006'); g.line(cx + 3, 3, cx + 6, -1, '#2a1006'); g.line(cx - 4, 3, cx - 4, 0, '#2a1006'); g.line(cx + 4, 3, cx + 4, 0, '#2a1006'); g.line(cx - 6, 7, cx - 10, 4, L); g.line(cx + 6, 7, cx + 10, 4, L); }
    else { g.ell(cx, 17, 4, 5.5, '#f4e6c8'); g.ell(cx - 1.2, 15.5, 1.6, 2, '#fffaf0'); for (let y = 14; y < 22; y += 2.5) g.line(cx - 3, y, cx + 3, y, '#dccaa8'); g.ell(cx, 10.5, 2.6, 2.2, '#e8d4b0'); g.ell(cx, 6, 3.6, 3.2, '#d07a32'); g.p(cx - 1, 3, '#2a1006'); g.p(cx + 1, 3, '#2a1006'); g.p(cx - 2, 2, '#2a1006'); g.p(cx + 2, 2, '#2a1006'); g.line(cx - 3, 5, cx - 6, 1 + f, L); g.line(cx + 3, 5, cx + 6, 1 + f, L); }
  }, OL);
  SPR.term = { worker: [termF(false, 0), termF(false, 1)], soldier: [termF(true, 0), termF(true, 1)] };
  SPR.termW = { worker: tinted(SPR.term.worker[0], '#ffffff'), soldier: tinted(SPR.term.soldier[0], '#ffffff') };
  // props
  const prop = {};
  prop.pebble = pix(10, 6, g => { g.ell(5, 3.5, 4, 2.5, '#8a8a9a'); g.ell(4, 2.5, 2, 1, '#b8b8c8'); }, OL);
  prop.sprout = pix(9, 9, g => { g.line(4, 8, 4, 4, '#3a8a2a'); g.ell(2.5, 3, 2.2, 1.4, '#6ac83a'); g.ell(6.5, 3, 2.2, 1.4, '#6ac83a'); g.p(2, 2, '#b8f080'); }, OL);
  prop.clover = pix(11, 11, g => { g.line(5, 10, 5, 5, '#3a8a2a'); g.ell(3, 3.5, 2.4, 2.4, '#5ab83a'); g.ell(7.5, 3.5, 2.4, 2.4, '#5ab83a'); g.ell(5.2, 6, 2.4, 2, '#4aa830'); g.p(3, 2, '#a8e888'); }, OL);
  prop.mushR = pix(12, 12, g => { g.rect(5, 6, 3, 5, '#f0e0c8'); g.ell(6, 5, 5.5, 3.5, '#e8402a'); g.rect(1, 5, 11, 2, '#c02a1a'); g.p(4, 3, '#fff'); g.p(8, 4, '#fff'); g.p(6, 2, '#fff'); }, OL);
  prop.mushP = pix(12, 12, g => { g.rect(5, 6, 3, 5, '#e8d8f0'); g.ell(6, 5, 5.5, 3.5, '#9a5ad0'); g.rect(1, 5, 11, 2, '#6a3aa0'); g.p(4, 3, '#e0c8ff'); }, OL);
  prop.mushB = pix(12, 12, g => { g.rect(5, 6, 3, 5, '#f0e0c8'); g.ell(6, 5, 5.5, 3.5, '#a0603a'); g.rect(1, 5, 11, 2, '#704020'); g.p(4, 3, '#e8b890'); }, OL);
  prop.grass = pix(9, 9, g => { g.line(2, 8, 1, 2, '#4a9a2a'); g.line(4, 8, 4, 0, '#6ac83a'); g.line(6, 8, 8, 3, '#4a9a2a'); }, null);
  prop.cap = pix(14, 8, g => { g.rect(1, 2, 12, 5, '#6ab02a'); g.rect(1, 1, 12, 2, '#8ad84a'); for (let i = 1; i < 13; i += 2) g.p(i, 7, '#4a8a1a'); }, OL);
  prop.lego = pix(16, 10, g => { g.rect(1, 3, 14, 6, '#2a6ae0'); g.rect(2, 1, 3, 2, '#2a6ae0'); g.rect(6, 1, 3, 2, '#2a6ae0'); g.rect(10, 1, 3, 2, '#2a6ae0'); g.rect(1, 3, 14, 1, '#6aa0ff'); }, OL);
  prop.egg = pix(9, 11, g => { g.ell(4.5, 6, 3.6, 4.6, '#fff0d0'); g.ell(3.5, 4.5, 1.2, 1.6, '#ffffff'); }, OL);
  prop.lotus = pix(12, 8, g => { g.ell(6, 5, 5, 2.5, '#ff9ac8'); g.ell(6, 3, 2, 3, '#ffc0dc'); g.ell(3, 4, 1.5, 2.5, '#ff7ab0'); g.ell(9, 4, 1.5, 2.5, '#ff7ab0'); g.p(6, 4, '#ffe060'); }, OL);
  prop.reed = pix(7, 22, g => { g.line(3, 21, 3, 6, '#5a8a2a'); g.ell(3.5, 5, 2, 4.5, '#8a4a22'); g.p(3, 2, '#b06a3a'); }, OL);
  prop.crumb = pix(8, 6, g => { g.ell(4, 3.5, 3.4, 2.4, '#e8b860'); g.p(3, 2, '#fff0c0'); }, '#6a3a16');
  prop.cheese = pix(10, 8, g => { g.rect(1, 2, 8, 5, '#ffd040'); g.p(3, 4, '#d8a020'); g.p(6, 3, '#d8a020'); g.rect(1, 2, 8, 1, '#fff090'); }, '#6a4a10');
  prop.drop = pix(6, 7, g => { g.ell(3, 4.4, 2.2, 2.2, '#bfe8ff'); g.p(3, 1, '#bfe8ff'); g.p(2, 3, '#ffffff'); }, '#4a6a9a');
  prop.slimep = pix(10, 6, g => { g.ell(5, 4, 4.4, 1.8, '#8ac030'); g.p(3, 3, '#c8f060'); }, '#2a3a10');
  SPR.prop = prop;
}

// ---------- themes / tiles ----------
const THEMES = {
  formigueiro: { name: 'FORMIGUEIRO', song: 'formigueiro', top: ['#e8902a', '#ffbe50', '#b0601a'], dirt: ['#a24c22', '#c46630', '#6a2a16'], plat: 'root', props: ['pebble', 'mushP', 'sprout', 'egg', 'pebble'], silh: '#1e0c18', tint: 'rgba(40,10,30,0.25)' },
  areia: { name: 'CAIXA DE AREIA', song: 'areia', top: ['#f0a830', '#ffd468', '#c07a1a'], dirt: ['#c4722a', '#dc8c3c', '#8a4a1a'], plat: 'stick', props: ['pebble', 'cap', 'lego', 'pebble', 'grass'], silh: '#3a2410', tint: 'rgba(255,190,120,0.08)' },
  pantano: { name: 'POÇA DE LAMA', song: 'pantano', top: ['#94c41e', '#c8ec48', '#5a8a12'], dirt: ['#7a3e1e', '#9a5228', '#4a2412'], plat: 'lily', props: ['mushR', 'clover', 'reed', 'pebble', 'grass'], silh: '#0e1c1c', tint: 'rgba(20,40,60,0.18)', water: true },
  mesa: { name: 'MESA DA COZINHA', tex: 'tex_mesa', flat: true, song: 'cozinha', top: ['#c8783a', '#eaa462', '#8a4a1e'], dirt: ['#9a5a2a', '#b06a34', '#6a3a16'], plat: 'stick', props: ['crumb', 'crumb', 'cheese', 'crumb'], silh: '#2a140a' },
  piso: { name: 'CHÃO DA COZINHA', tex: 'tex_piso', flat: true, song: 'cozinha', top: ['#e8dcd8', '#fff4f0', '#a898a8'], dirt: ['#b0a8c0', '#c4bcd4', '#8a82a0'], plat: 'stick', props: ['crumb', 'crumb', 'pebble'], silh: '#2a2030' },
  banheiro: { name: 'BANHEIRO', tex: 'tex_bath', flat: true, song: 'banheiro', top: ['#c0d0f8', '#eaf0ff', '#8898c8'], dirt: ['#8a90c8', '#a0a8dc', '#5a6098'], plat: 'stick', props: ['drop', 'drop'], silh: '#20203a', water: true, wc: ['rgba(150,200,255,0.5)', 'rgba(180,220,255,0.45)', 'rgba(255,255,255,0.8)'], bonus: true },
  esgoto: { name: 'ESGOTO', tex: 'tex_sewer', song: 'esgoto', top: ['#6a8a2a', '#9ac040', '#3a5a14'], dirt: ['#5a4a3a', '#6e5c48', '#3a2e24'], plat: 'stick', props: ['slimep', 'pebble', 'slimep'], silh: '#0a1006', water: true, wc: ['rgba(60,90,20,0.65)', 'rgba(90,130,30,0.55)', 'rgba(190,230,90,0.7)'] },
  parede: { name: 'PAREDE DA CASA', song: 'parede', silh: '#2a1a10' },
  gramado: { name: 'GRAMADO', song: 'gramado', top: ['#8cc81e', '#c4ee42', '#4e8a10'], dirt: ['#7a4424', '#9a5a30', '#4e2814'], plat: 'leaf', props: ['mushB', 'clover', 'sprout', 'grass', 'mushR'], silh: '#081812', tint: 'rgba(10,30,40,0.2)' }
};
function buildTheme(th) {
  const [dc, dl, dd] = th.dirt, [tc, tl, td] = th.top;
  const r = rng(th.name.length * 977 + 13);
  th.dirtTex = pix(64, 64, g => {
    g.rect(0, 0, 64, 64, dc);
    for (let i = 0; i < 26; i++) { const x = r() * 64, y = r() * 64, rr = 3 + r() * 4; g.ell(x + 1, y + 1.5, rr, rr * .8, dd); g.ell(x, y, rr, rr * .8, dl); g.ell(x - rr * .3, y - rr * .3, rr * .45, rr * .3, dc); }
    for (let i = 0; i < 60; i++) g.p(r() * 64, r() * 64, i % 2 ? dd : dl);
    for (let i = 0; i < 3; i++) { let x = r() * 64, y = r() * 64; for (let k = 0; k < 18; k++) { g.p(x, y, dd); g.p(x + 1, y, '#3a1a0c'); x += r() * 2 - .6; y += r() * 1.6 - .2; } }
  }, null, true);
  th.topTex = pix(64, 14, g => {
    for (let x = 0; x < 64; x++) {
      const h = 4 + Math.round(Math.sin(x * .7) * 1 + r() * 1.5);
      for (let y = 0; y < h; y++) g.p(x, y + 2, y === 0 ? tl : (y === h - 1 ? td : tc));
      if (r() < .18) { const dh = 2 + Math.floor(r() * 5); for (let y = h; y < h + dh; y++) g.p(x, y + 2, y === h + dh - 1 ? td : tc); }
      if (r() < .5) g.p(x, 1, tc); if (r() < .3) g.p(x, 2, tl);
    }
  }, null, true);
  if (th.flat) th.topTex = pix(64, 14, g => { for (let x = 0; x < 64; x++) { g.p(x, 2, tl); g.p(x, 3, tl); g.p(x, 4, tc); g.p(x, 5, tc); g.p(x, 6, td); if (x % 16 === 0) { g.p(x, 4, td); g.p(x, 5, td); } } }, null, true);
  if (th.tex && IMG[th.tex]) th.dirtTex = IMG[th.tex];
}

// ---------- levels ----------
function makeLevel(theme, len, build) {
  const grid = Array.from({ length: ROWS }, () => new Uint8Array(len));
  const L = {
    theme, len, grid, enemies: [], sugar: [], nurses: [], flag: null, start: { x: 8, h: 3 }, deco: [],
    springs: [], checkpoints: [], babies: [], crumbs: [], switches: [], secrets: [],
    ground(x0, x1, h) { h += BASE; for (let x = x0; x < x1; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; },
    block(x0, w, hb, hh) { hb += BASE; for (let x = x0; x < x0 + w; x++) for (let y = ROWS - hb - hh; y < ROWS - hb; y++) grid[y][x] = 1; },
    plat(x0, h, w) { h += BASE; for (let x = x0; x < x0 + w; x++) grid[ROWS - h][x] = 2; },
    e(type, x, h, o = {}) { h += BASE; if (o.top !== undefined) o.top += BASE * T; this.enemies.push({ type, x: x * T + T / 2, y: (ROWS - h) * T, ...o }); },
    s(x, h, n = 1, arc = 0) { h += BASE; for (let i = 0; i < n; i++) { const a = n > 1 ? Math.sin(i / (n - 1) * Math.PI) * arc : 0; this.sugar.push({ x: (x + i) * T + T / 2, y: (ROWS - h) * T - a * T + 4 }); } },
    n(x, h) { h += BASE; this.nurses.push({ x: x * T + 8, y: (ROWS - h) * T, used: false, t: 0 }); },
    f(x, h) { h += BASE; this.flag = { x: x * T + 8, y: (ROWS - h) * T }; },
    spring(x, h, power = 570) { h += BASE; this.springs.push({ x: x * T + 8, y: (ROWS - h) * T, power, squish: 0 }); },
    cp(x, h) { h += BASE; this.checkpoints.push({ x: x * T + 8, y: (ROWS - h) * T, active: false }); },
    baby(x, h) { h += BASE; this.babies.push({ x: x * T + 8, y: (ROWS - h) * T - 8, got: false, bob: Math.random() * 6 }); },
    crumb(x, h, w = 3) { h += BASE; this.crumbs.push({ x: x * T, y: (ROWS - h) * T, w: w * T, shake: 0, dead: false, resp: 0 }); },
    secret(x0, w, hb, hh) { hb += BASE; for (let xx = x0; xx < x0 + w; xx++) for (let yy = ROWS - hb - hh; yy < ROWS - hb; yy++) grid[yy][xx] = 1; this.secrets.push({ x0, w, hb, hh, hp: 3, broken: false, x: x0 * T + (w * T) / 2, y: (ROWS - hb - hh / 2) * T }); },
    sw(id, x, h, gx, gh, gw, ghh) { h += BASE; gh += BASE; for (let xx = gx; xx < gx + gw; xx++) for (let yy = ROWS - gh - ghh; yy < ROWS - gh; yy++) grid[yy][xx] = 1; this.switches.push({ id, x: x * T + 8, y: (ROWS - h) * T - 8, on: false, timer: 0, gx, gh, gw, ghh }); }
  };
  build(L);
  return L;
}
const LEVELS = [
  { id: 'formigueiro', sub: '1', mk: () => makeLevel('formigueiro', 540, L => {
    // Ato 1 (0 - 170): Galerias de Entrada e Primeiros Saltos
    L.ground(0, 32, 3); L.s(6, 5, 5); L.e('beetle', 16, 3); L.plat(18, 6, 4); L.s(18, 8, 4);
    L.spring(28, 3, 580); L.plat(26, 8, 6); L.s(27, 10, 4);
    L.ground(34, 58, 4); L.s(36, 6, 4, 1); L.e('hopper', 44, 4); L.e('beetle', 52, 4); L.s(45, 6, 6);
    L.secret(60, 4, 3, 4); L.baby(62, 5); L.s(60, 5, 4);
    L.ground(66, 96, 3); L.e('beetle', 75, 3); L.e('hopper', 88, 3); L.s(70, 5, 6);
    L.crumb(98, 4, 3); L.crumb(104, 5, 3); L.crumb(110, 4, 3); L.s(98, 7, 14, 2);
    L.ground(116, 172, 4); L.e('beetle', 126, 4); L.e('hopper', 140, 4); L.plat(135, 7, 4); L.s(135, 9, 4);
    L.spring(155, 4, 590); L.plat(158, 9, 4); L.s(158, 11, 4);
    L.cp(172, 4);

    // Ato 2 (175 - 360): Jardim dos Fungos e Caverna de Cristais
    L.ground(175, 220, 3); L.s(178, 5, 6); L.e('beetle', 190, 3); L.plat(185, 6, 4); L.plat(195, 8, 4); L.s(195, 10, 4);
    L.e('hopper', 205, 3); L.e('beetle', 214, 3);
    L.sw('f1', 222, 4, 245, 3, 2, 6);
    L.ground(220, 245, 3); L.s(224, 5, 5);
    L.ground(247, 310, 3); L.baby(250, 5); L.s(248, 5, 8);
    L.e('beetle', 265, 3); L.spring(275, 3, 580); L.plat(278, 8, 4); L.s(278, 10, 4);
    L.plat(288, 9, 3); L.plat(295, 11, 3); L.baby(296, 12); L.e('hopper', 290, 3);
    L.crumb(312, 5, 3); L.crumb(318, 6, 3); L.crumb(324, 5, 3); L.s(312, 8, 14, 2);
    L.ground(330, 365, 4); L.e('beetle', 342, 4); L.e('hopper', 352, 4); L.s(335, 6, 6);
    L.n(358, 4); L.cp(362, 4);

    // Ato 3 (365 - 470): Gauntlet de Alta Velocidade e Plataformas Móveis
    L.ground(365, 395, 3); L.s(368, 5, 6); L.e('beetle', 380, 3);
    L.spring(392, 3, 620); L.crumb(398, 7, 3); L.crumb(406, 9, 3); L.s(398, 11, 12, 2);
    L.baby(418, 11); L.plat(416, 9, 4);
    L.ground(422, 470, 3); L.e('hopper', 432, 3); L.e('beetle', 445, 3); L.e('hopper', 458, 3); L.s(426, 5, 12);

    // Chefe e Bandeira (470 - 540)
    L.ground(470, 540, 3); L.s(472, 5, 4);
    L.boss = { x: 510, h: 3, arenaL: 472, arenaR: 540 };
    L.f(534, 3);
  }) },

  { id: 'areia', sub: '2', mk: () => makeLevel('areia', 580, L => {
    // Ato 1 (0 - 185): Dunas e Baldinhos de Praia
    L.ground(0, 30, 3); L.s(6, 5, 6); L.e('ladyC', 18, 7); L.e('scorp', 26, 3);
    L.spring(32, 3, 580); L.plat(35, 7, 4); L.s(35, 9, 4);
    L.ground(40, 75, 4); L.s(42, 6, 6); L.e('ant', 54, 4); L.e('scorp', 66, 4);
    L.plat(78, 6, 3); L.plat(86, 9, 3); L.plat(94, 11, 3); L.baby(95, 12); L.s(80, 8, 16, 2);
    L.ground(80, 118, 3); L.e('ladyC', 92, 7); L.e('ant', 105, 3); L.s(100, 5, 6);
    L.crumb(120, 4, 3); L.crumb(126, 5, 3); L.crumb(132, 4, 3); L.s(120, 7, 14, 2);
    L.ground(138, 185, 4); L.e('scorp', 150, 4); L.e('ant', 165, 4); L.e('ladyC', 175, 8); L.s(142, 6, 8);
    L.cp(184, 4);

    // Ato 2 (185 - 380): O Castelo de Areia Proibido
    L.ground(185, 235, 3); L.block(195, 3, 3, 4); L.plat(200, 7, 4); L.block(206, 3, 3, 5);
    L.s(198, 9, 5); L.e('scorp', 216, 3);
    L.secret(225, 4, 3, 4); L.s(226, 5, 4);
    L.ground(235, 265, 4); L.e('ant', 246, 4); L.e('lady', 255, 9, { amp: 30 });
    L.sw('s1', 260, 4, 280, 3, 2, 6);
    L.ground(265, 310, 3); L.baby(284, 6); L.s(282, 5, 8);
    L.e('scorp', 295, 3); L.e('ant', 305, 3);
    L.plat(315, 6, 3); L.plat(325, 8, 3); L.plat(335, 10, 3); L.baby(336, 11);
    L.ground(320, 375, 3); L.e('ladyC', 345, 8); L.e('scorp', 360, 3); L.s(340, 5, 8);
    L.n(372, 3); L.cp(376, 3);

    // Ato 3 (380 - 510): Deserto de Areia Movediça
    L.crumb(386, 4, 3); L.crumb(394, 5, 3); L.crumb(402, 6, 3); L.crumb(410, 5, 3); L.s(386, 8, 16, 2);
    L.ground(418, 460, 3); L.e('scorp', 428, 3); L.e('ant', 442, 3); L.e('ladyC', 452, 7);
    L.spring(458, 3, 620); L.plat(464, 9, 4); L.baby(466, 11); L.s(464, 11, 4);
    L.ground(468, 510, 4); L.e('scorp', 480, 4); L.e('ant', 495, 4); L.s(472, 6, 8);

    // Chefe e Bandeira (510 - 580)
    L.ground(510, 580, 3); L.s(512, 5, 4);
    L.boss = { kind: 'scorp', x: 550, h: 3, arenaL: 512, arenaR: 580 };
    L.f(572, 3);
  }) },

  { id: 'pantano', sub: '3', mk: () => makeLevel('pantano', 620, L => {
    // Ato 1 (0 - 200): O Manguezal Aberto
    L.ground(0, 32, 4); L.s(6, 6, 6); L.e('frog', 18, 4); L.e('mosca', 28, 8);
    L.plat(35, 4, 3); L.plat(42, 5, 3); L.plat(49, 4, 3); L.s(35, 6, 16, 1.5);
    L.ground(55, 90, 4); L.e('frog', 68, 4); L.e('mosca', 78, 8); L.s(60, 6, 6);
    L.spring(88, 4, 580); L.plat(92, 8, 4); L.baby(94, 10); L.s(92, 10, 4);
    L.ground(98, 140, 4); L.e('frog', 110, 4); L.e('frog', 128, 4); L.s(102, 6, 8);
    L.crumb(144, 4, 3); L.crumb(151, 5, 3); L.crumb(158, 4, 3); L.s(144, 7, 16, 2);
    L.ground(164, 202, 5); L.e('frog', 178, 5); L.e('mosca', 190, 9); L.s(170, 7, 6);
    L.cp(200, 5);

    // Ato 2 (205 - 400): A Caverna das Flores Carnívoras
    L.ground(205, 255, 4); L.e('frog', 222, 4); L.e('mosca', 238, 9); L.s(210, 6, 8);
    L.sw('p1', 250, 5, 275, 3, 2, 6);
    L.ground(255, 320, 4); L.baby(278, 6); L.s(276, 6, 8);
    L.e('frog', 290, 4); L.e('mosca', 305, 9);
    L.secret(325, 4, 3, 4); L.s(326, 5, 4);
    L.plat(335, 6, 3); L.plat(345, 8, 3); L.plat(355, 10, 3); L.baby(356, 11);
    L.ground(340, 395, 4); L.e('frog', 362, 4); L.e('frog', 380, 4); L.s(365, 6, 6);
    L.n(392, 4); L.cp(396, 4);

    // Ato 3 (400 - 540): Correnteza Rápida
    L.plat(402, 4, 3); L.crumb(410, 5, 3); L.plat(418, 4, 3); L.crumb(426, 6, 3); L.plat(434, 4, 3);
    L.s(402, 7, 24, 2);
    L.ground(442, 480, 4); L.e('frog', 455, 4); L.e('mosca', 470, 8);
    L.spring(478, 4, 620); L.plat(484, 9, 4); L.baby(486, 11); L.s(484, 11, 4);
    L.ground(490, 540, 4); L.e('frog', 506, 4); L.e('mosca', 522, 9); L.s(496, 6, 8);

    // Chefe e Bandeira (540 - 620)
    L.ground(540, 620, 4); L.s(542, 6, 4);
    L.boss = { kind: 'frog', x: 585, h: 4, arenaL: 542, arenaR: 620 };
    L.f(612, 4);
  }) },

  { id: 'gramado', sub: '4', mk: () => makeLevel('gramado', 640, L => {
    // Ato 1 (0 - 210): A Selva de Capim
    L.ground(0, 35, 3); L.s(6, 5, 6); L.e('cater', 16, 3); L.e('fly', 24, 8);
    L.spring(32, 3, 580); L.plat(36, 7, 4); L.s(36, 9, 4);
    L.ground(42, 85, 4); L.e('stick', 52, 4); L.e('spider', 64, 0, { top: 20, range: 200 }); L.s(48, 6, 6);
    L.plat(88, 7, 3); L.plat(96, 9, 3); L.plat(104, 11, 3); L.baby(105, 12); L.s(88, 10, 16, 2);
    L.ground(95, 140, 3); L.e('hopper', 110, 3); L.e('cater', 125, 3); L.s(105, 5, 6);
    L.crumb(144, 4, 3); L.crumb(152, 5, 3); L.crumb(160, 4, 3); L.s(144, 7, 16, 2);
    L.ground(168, 210, 4); L.e('snakeM', 180, 4); L.e('stick', 194, 4); L.e('fly', 202, 9); L.s(172, 6, 8);
    L.cp(208, 4);

    // Ato 2 (210 - 425): O Bosque das Teias
    L.ground(210, 260, 3); L.e('cater', 224, 3); L.e('spider', 240, 0, { top: 10, range: 140 }); L.s(215, 5, 8);
    L.secret(265, 4, 3, 4); L.baby(268, 5); L.s(266, 5, 4);
    L.ground(260, 320, 3); L.e('stick', 285, 3); L.e('snakeM', 305, 3);
    L.sw('g1', 315, 4, 340, 3, 2, 6);
    L.ground(320, 380, 3); L.s(342, 5, 8); L.e('hopper', 355, 3); L.e('cater', 370, 3);
    L.plat(382, 6, 3); L.plat(390, 8, 3); L.plat(398, 10, 3); L.baby(399, 11);
    L.ground(380, 425, 4); L.e('stick', 396, 4); L.e('fly', 412, 9); L.s(388, 6, 6);
    L.n(418, 4); L.cp(422, 4);

    // Ato 3 (425 - 560): Trilha Aérea
    L.crumb(428, 5, 3); L.crumb(436, 7, 3); L.spring(444, 3, 620); L.plat(450, 10, 4);
    L.s(428, 8, 20, 2); L.baby(466, 12);
    L.ground(460, 560, 3); L.e('hopper', 478, 3); L.e('cater', 496, 3); L.e('stick', 518, 3); L.e('snakeM', 542, 3);
    L.s(470, 5, 14);

    // Chefe e Bandeira (560 - 640)
    L.ground(560, 640, 3); L.s(562, 5, 4);
    L.boss = { kind: 'snake', x: 610, h: 3, arenaL: 565, arenaR: 640 };
    L.f(632, 3);
  }) }
];

LEVELS.push({ id: 'parede', sub: '5', vertical: true, mk: () => buildVertLevel() });

LEVELS.push({ id: 'cozinha', sub: '6', mk: () => makeLevel('mesa', 680, L => {
  L.theme2 = 'piso'; L.split = 260; L.dog = true; L.haz = [];
  const GY = h => (ROWS - h - BASE) * T;
  const spike = (x, w, h) => L.haz.push({ k: 'spike', x0: x * T, x1: (x + w) * T, y: GY(h) });
  L.haz.push({ k: 'honey', x0: 45 * T, x1: 52 * T, y: GY(9) }, { k: 'honey', x0: 110 * T, x1: 118 * T, y: GY(9) });
  spike(75, 3, 9); spike(140, 3, 9); spike(210, 3, 9);

  // Ato 1 (0 - 260): Banquete na Mesa
  L.ground(0, 260, 9); L.s(6, 11, 4); L.e('roach', 20, 9); L.block(30, 3, 9, 2); L.s(30, 13, 4);
  L.e('mosca', 40, 14); L.e('roach', 60, 9); L.plat(70, 12, 4); L.s(70, 14, 4);
  L.spring(88, 9, 580); L.plat(92, 13, 4); L.s(92, 15, 4);
  L.e('roach', 125, 9); L.e('mosca', 135, 14); L.baby(145, 12);
  L.block(160, 4, 9, 3); L.s(160, 14, 4); L.e('roach', 180, 9);
  L.plat(195, 12, 4); L.plat(205, 14, 4); L.s(205, 16, 4);
  L.e('roach', 230, 9); L.e('mosca', 245, 14);

  // Ato 2 (260 - 480): Chão da Cozinha
  L.ground(260, 680, 3);
  L.haz.push({ k: 'bowl', x: 285 * T, y: GY(3) });
  spike(310, 3, 3); spike(370, 3, 3); spike(430, 3, 3);
  L.haz.push({ k: 'pend', x: 340 * T, y: GY(3) - 300, len: 250, amp: .75, sp: 1.6, ph: 0 });
  L.haz.push({ k: 'ball', x0: 300 * T, x1: 420 * T, y: GY(3), every: 3.4, sp: 165 });
  L.cp(290, 3);
  L.s(292, 5, 8); L.e('roach', 305, 3); L.plat(318, 6, 4); L.s(318, 8, 4);
  L.sw('k1', 345, 4, 370, 3, 2, 6);
  L.baby(375, 6); L.s(372, 5, 8);
  L.e('roach', 390, 3); L.e('mosca', 405, 8); L.plat(415, 6, 3); L.plat(425, 8, 3); L.s(425, 10, 3);
  L.e('roach', 445, 3); L.baby(450, 10);
  L.n(475, 3); L.cp(480, 3);

  // Ato 3 (485 - 600): Sob os Móveis
  L.haz.push({ k: 'pend', x: 510 * T, y: GY(3) - 300, len: 250, amp: .75, sp: 1.6, ph: 1 });
  L.haz.push({ k: 'ball', x0: 490 * T, x1: 580 * T, y: GY(3), every: 3.2, sp: 175 });
  spike(525, 3, 3); spike(560, 3, 3);
  L.e('roach', 495, 3); L.e('mosca', 515, 9); L.plat(530, 6, 4); L.s(530, 8, 4);
  L.baby(550, 8); L.e('roach', 570, 3); L.s(565, 5, 8);

  // Chefe e Bandeira (600 - 680)
  L.boss = { kind: 'flea', x: 645, h: 3, arenaL: 605, arenaR: 680 };
  L.f(672, 3);
}) });

LEVELS.push({ id: 'banheiro', sub: '7', mk: () => makeLevel('banheiro', 560, L => {
  const Y = h => (ROWS - h - BASE) * T; L.movers = [];
  const bub = (x, h, o = {}) => L.movers.push({ kind: 'bub', x: x * T + 8, y0: Y(h) - 20, r: 14, ph: Math.random() * 6, ...o });
  const sw = (id, x, h) => L.movers.push({ kind: 'sw', id, x: x * T + 8, y0: Y(h) - 20, r: 15, ph: 0, amp: 3 });
  const foam = (by, x0, x1, h, dur) => L.movers.push({ kind: 'foam', by, x0: x0 * T, x1: x1 * T, y0: Y(h), y: Y(h), dur, on: false, left: 0 });

  // Ato 1 (0 - 180): A Pia de Porcelana
  L.ground(0, 20, 3); L.s(4, 5, 8);
  bub(24, 4); bub(28, 5); bub(32, 4); L.s(24, 8, 10, 1.5);
  L.ground(36, 50, 3); sw('a', 44, 6); foam('a', 50, 70, 3, 5); L.s(52, 5, 14);
  L.ground(70, 90, 3);
  L.movers.push({ kind: 'stream', x: 95 * T, y: Y(1), top: Y(10), rise: 55, every: 1.1, cd: 0 });
  L.movers.push({ kind: 'stream', x: 105 * T, y: Y(1), top: Y(11), rise: 60, every: 1.3, cd: .6 });
  L.s(94, 9, 14, 1.5); L.baby(108, 12);
  L.ground(115, 140, 4); L.s(118, 6, 8);
  bub(145, 5, { amp: 18, sp: 1.2 }); bub(152, 7, { amp: 22, sp: 1 }); bub(160, 5, { amp: 18, sp: 1.4 });
  L.s(144, 10, 18, 2);
  L.ground(168, 185, 3); L.cp(180, 3);

  // Ato 2 (185 - 365): A Banheira e o Labirinto de Espuma
  L.ground(185, 210, 4); L.s(188, 6, 6);
  sw('b', 205, 7); foam('b', 210, 230, 4, 4.5); L.s(212, 6, 14);
  L.ground(230, 255, 3); sw('c', 250, 6); foam('c', 255, 280, 4, 4.5);
  L.s(256, 6, 18); L.baby(278, 8);
  L.ground(280, 310, 4); sw('d', 305, 7); foam('d', 310, 340, 5, 5);
  L.s(312, 7, 20, 1.5);
  L.ground(340, 370, 3); L.s(344, 5, 8); L.cp(365, 3);

  // Ato 3 (370 - 500): O Chuveiro e Correntes Rápidas
  bub(378, 5, { amp: 20, sp: 1.5 }); bub(386, 7, { amp: 24, sp: 1.2 }); bub(394, 9, { amp: 22, sp: 1.4 });
  L.s(376, 11, 20, 2); L.baby(396, 12);
  L.ground(404, 430, 3); L.s(408, 5, 8);
  L.movers.push({ kind: 'stream', x: 438 * T, y: Y(1), top: Y(12), rise: 65, every: 1.0, cd: 0 });
  L.movers.push({ kind: 'stream', x: 448 * T, y: Y(1), top: Y(12), rise: 65, every: 1.0, cd: .5 });
  L.s(436, 11, 14, 1.5);
  bub(460, 6, { amp: 18, sp: 1.3 }); bub(470, 7, { amp: 20, sp: 1.1 }); bub(480, 6, { amp: 18, sp: 1.4 });
  L.s(460, 9, 22, 2);

  // Chegada no Ralo (500 - 560)
  L.ground(495, 560, 3); L.s(500, 5, 20);
  L.f(548, 3);
}) });

LEVELS.push({ id: 'esgoto', sub: '8', mk: () => makeLevel('esgoto', 660, L => {
  // Ato 1 (0 - 210): Os Canos Principais
  L.ground(0, 35, 3); L.s(5, 5, 6); L.e('roachB', 16, 3); L.e('rat', 28, 3);
  L.plat(35, 4, 3); L.ground(40, 75, 4); L.e('rat', 50, 4); L.e('roachB', 64, 4); L.s(44, 6, 8);
  L.spring(76, 4, 580); L.plat(80, 8, 4); L.baby(82, 10); L.s(80, 10, 4);
  L.ground(86, 135, 3); L.e('roachB', 100, 3); L.e('rat', 118, 3); L.s(92, 5, 8);
  L.crumb(140, 4, 3); L.crumb(148, 5, 3); L.crumb(156, 4, 3); L.s(140, 7, 18, 2);
  L.ground(164, 210, 4); L.e('rat', 180, 4); L.e('roachB', 196, 4); L.s(170, 6, 8);
  L.cp(205, 4);

  // Ato 2 (210 - 430): Estação de Triagem e Lodo Tóxico
  L.ground(210, 260, 3); L.e('roachB', 228, 3); L.e('rat', 246, 3); L.s(216, 5, 8);
  L.sw('es1', 255, 4, 280, 3, 2, 6);
  L.ground(260, 320, 3); L.s(282, 5, 8);
  L.secret(330, 4, 3, 4); L.baby(333, 5); L.s(331, 5, 4);
  L.ground(320, 380, 3); L.e('rat', 345, 3); L.e('roachB', 365, 3);
  L.plat(385, 6, 3); L.plat(395, 8, 3); L.plat(405, 10, 3); L.baby(406, 11);
  L.ground(380, 430, 4); L.e('rat', 400, 4); L.e('roachB', 418, 4); L.s(390, 6, 8);
  L.n(422, 4); L.cp(426, 4);

  // Ato 3 (430 - 580): Fortaleza dos Roedores
  L.crumb(432, 5, 3); L.crumb(440, 7, 3); L.spring(448, 3, 620); L.plat(454, 10, 4);
  L.s(432, 8, 22, 2); L.baby(472, 12);
  L.ground(462, 580, 3); L.e('rat', 480, 3); L.e('roachB', 505, 3); L.e('rat', 530, 3); L.e('roachB', 555, 3);
  L.s(470, 5, 16);

  // Chefe e Grande Bandeira Final (580 - 660)
  L.ground(580, 660, 3); L.s(582, 5, 4);
  L.boss = { kind: 'rat', x: 630, h: 3, arenaL: 585, arenaR: 660 };
  L.f(652, 3);
}) });
function layersFor(id) {
  switch (id) {
    case 'formigueiro': return [{ img: 'anthill', sp: .22, y: 0 }, { tint: 'rgba(28,8,36,0.42)' }];
    case 'areia': return [{ img: 'sky_day', sp: 0, y: 0 }, { img: 'castle', sp: .12, y: 10 }, { img: 'ball', sp: .25, y: 30 }, { img: 'sand_fg', sp: .45, y: 40 }, { tint: 'rgba(255,200,140,0.10)' }];
    case 'pantano': return [{ img: 'swamp', sp: .22, y: 0 }, { tint: 'rgba(10,30,50,0.25)' }, { img: 'mist', sp: .4, y: 70, a: .3 }];
    case 'cozinha': return [{ img: 'kmesa2', sp: .05, y: 0, zone: 'a' }, { img: 'kfloor3', sp: .04, y: -282, zone: 'b', dog: true }, { tint: 'rgba(40,20,30,0.18)' }];
    case 'banheiro': return [{ img: 'bath', sp: .15, y: 0 }, { tint: 'rgba(30,30,80,0.12)' }];
    case 'esgoto': return [{ img: 'sewer', sp: .15, y: 0 }, { tint: 'rgba(10,25,0,0.28)' }];
    case 'gramado': return [{ img: 'forest', sp: .18, y: 0 }, { tint: 'rgba(5,20,30,0.3)' }, { img: 'mist', sp: .35, y: 80, a: .45 }, { img: 'fg_garden1', sp: .55, y: 10, a: .8 }];
  }
}

// ---------- game state ----------
let state = 'title', paused = false;
let G = null; // current level runtime
const P = {}; // player
const prog = store.get('prog', { unlocked: 1, stars: [0, 0, 0, 0, 0] });
let mapState = { node: Math.min(prog.unlocked, LEVELS.length) - 1, walking: null, t: 0 };
let fx = { shake: 0, stop: 0, flash: 0 };
const parts = [], floats = [], ghosts = [];
let wipe = { t: 1, dir: 0, cb: null, x: W / 2, y: H / 2 };
let gtime = 0;

function startWipe(cb, x = W / 2, y = H / 2) { wipe = { t: 1, dir: -1, cb, x, y }; }

// ---------- level runtime ----------
function loadLevel(i) {
  const def = LEVELS[i]; if (def.vertical) { loadVertical(i); return; } const L = def.mk(); const th = THEMES[L.theme];
  if (!th.dirtTex) buildTheme(th);
  G = { i, def, L, th, camX: 0, camY: ROWS * T - H, time: 0, sugar: 0, sugarTotal: L.sugar.length, kills: 0, enemiesTotal: L.enemies.length, score: 0, maxCombo: 0, chain: 0, chainT: 0, layers: layersFor(def.id), clear: null, intro: 1.6, deadT: 0 };
  G.boss = L.boss ? makeBoss(L.boss) : null; G.flagHidden = !!L.boss; G.flagPop = 1; G.waves = []; G.bossBanner = 0;
  G.springs = (L.springs || []).map(sp => ({ ...sp, squish: 0 }));
  G.checkpoints = (L.checkpoints || []).map(cp => ({ ...cp, active: false }));
  G.babies = (L.babies || []).map(b => ({ ...b, got: false, bob: Math.random() * 6 }));
  G.crumbs = (L.crumbs || []).map(c => ({ ...c, shake: 0, dead: false, resp: 0 }));
  G.switches = (L.switches || []).map(sw => ({ ...sw, on: false, timer: 0 }));
  G.secrets = (L.secrets || []).map(sec => ({ ...sec, hp: 3, broken: false }));
  G.babiesGot = 0;
  if (CHK && CHK.i === i) {
    for (const cp of G.checkpoints) if (cp.x <= CHK.x + 16) cp.active = true;
  }
  if (G.boss) G.enemiesTotal++;
  G.nurses = L.nurses.map(n => ({ ...n })); G.sugarMeter = 0;
  G.dogP = L.dog ? { t: 3, steps: [] } : null; if (L.split) L.splitX = L.split * T; G.haz = L.haz ? L.haz.map(h => ({ ...h, balls: [], t: 0, cd: 0 })) : null; G.movers = L.movers ? L.movers.map(m => ({ ...m, y: m.y0 })) : null; G.silh2 = null; G.zoneB = false; G.loose = null; G.clouds = null;
  G.bgAnts = def.id === 'formigueiro' ? makeBgAnts(L.len) : null;
  G.sugarList = L.sugar.map(s => ({ ...s, got: false, vx: 0, vy: 0, mag: false, bob: Math.random() * 6 }));
  G.enemies = L.enemies.map(makeEnemy);
  G.tiles = renderTiles(L, th);
  Object.assign(P, { x: L.start.x * T + 8, y: (ROWS - L.start.h - BASE) * T, vx: 0, vy: 0, dir: 1, ground: false, coyote: 0, buf: 0, dashT: 0, dashCD: 0, airDash: true, punchT: -1, punchId: 0, hurtT: 0, inv: 0, hp: MAXHP, jumps: 1, flip: 0, boost: 0, anim: 'idle', at: 0, sx: 1, sy: 1, combo: 0, comboT: 0, dust: 0, safe: null, dashHit: new Set(), wasGround: false, ctrl: true });
  P.safe = { x: P.x, y: P.y };
  parts.length = floats.length = ghosts.length = 0;
  state = 'play'; playSong(th.song);
  if (CHK && CHK.i === i) { P.x = CHK.x; P.y = CHK.y; P.safe = { x: P.x, y: P.y }; G.fallDone = true; G.camX = clamp(P.x - W / 2, 0, L.len * T - W); G.intro = 0; } else CHK = null;
}
function solidAt(tx, ty) { if (tx < 0 || tx >= G.L.len) return tx < 0 ? 1 : 0; if (ty < 0 || ty >= ROWS) return 0; return G.L.grid[ty][tx]; }
function renderTiles(L, th0) {
  const th2 = L.theme2 ? THEMES[L.theme2] : null; if (th2 && !th2.dirtTex) buildTheme(th2);
  const TH = tx => (th2 && tx >= L.split) ? th2 : th0; let th = th0;
  const [c, x] = mkCanvas(L.len * T, ROWS * T);
  const r = rng(L.len * 31 + 7);
  const g = L.grid;
  // one-way platforms first pass collects runs
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < L.len; tx++) {
    if (g[ty][tx] !== 1) continue; th = TH(tx);
    const px = tx * T, py = ty * T;
    x.drawImage(th.dirtTex, px % 64, py % 64, T, T, px, py, T, T);
    const up = ty > 0 && g[ty - 1][tx] === 1, lf = tx > 0 && g[ty][tx - 1] === 1, rt = tx < L.len - 1 && g[ty][tx + 1] === 1;
    if (!lf) { x.fillStyle = th.dirt[2]; x.fillRect(px, py, 2, T); x.fillStyle = '#1a1020'; x.fillRect(px, py, 1, T); }
    if (!rt) { x.fillStyle = th.dirt[2]; x.fillRect(px + T - 2, py, 2, T); x.fillStyle = '#1a1020'; x.fillRect(px + T - 1, py, 1, T); }
  }
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < L.len; tx++) {
    if (g[ty][tx] !== 1 || (ty > 0 && g[ty - 1][tx] === 1)) continue; th = TH(tx);
    const px = tx * T, py = ty * T;
    x.fillStyle = '#1a1020'; x.fillRect(px - (g[ty][tx - 1] === 1 ? 0 : 1), py - 3, T + (g[ty][tx - 1] === 1 ? 0 : 1) + (g[ty][tx + 1] === 1 ? 0 : 1), 1);
    x.drawImage(th.topTex, px % 64, 0, T, 14, px, py - 3, T, 14);
    if (!(g[ty][tx - 1] === 1)) { x.drawImage(th.topTex, (px + 20) % 64, 0, 2, 10, px - 2, py - 2, 2, 10); }
    if (!(g[ty][tx + 1] === 1)) { x.drawImage(th.topTex, (px + 30) % 64, 0, 2, 10, px + T, py - 2, 2, 10); }
    // props
    if (r() < .28 && ty > 1) { const k = th.props[Math.floor(r() * th.props.length)]; const im = SPR.prop[k]; x.drawImage(im, px + Math.floor(r() * (T - im.width / 2)), py - im.height + 2); }
  }
  // one-way platforms
  for (let ty = 0; ty < ROWS; ty++) { let tx = 0; while (tx < L.len) { if (g[ty][tx] === 2) { let e = tx; while (e < L.len && g[ty][e] === 2) e++; drawPlat(x, TH(tx), tx * T, ty * T, (e - tx) * T); tx = e; } else tx++; } }
  return c;
}
function drawPlat(x, th, px, py, w) {
  const O = '#1a1020';
  if (th.plat === 'lily') {
    const cx = px + w / 2;
    x.fillStyle = O; ell(x, cx, py + 5, w / 2 + 3, 6); x.fillStyle = '#2f7a2a'; ell(x, cx, py + 5, w / 2 + 2, 5); x.fillStyle = '#5ab83a'; ell(x, cx, py + 4, w / 2 + 1, 4); x.fillStyle = '#8ad85a'; ell(x, cx - w / 6, py + 3, w / 4, 1.5);
    x.fillStyle = '#2f7a2a'; x.fillRect(cx + w / 5, py + 2, 2, 5);
  } else if (th.plat === 'leaf') {
    x.fillStyle = O; ell(x, px + w / 2, py + 4, w / 2 + 3, 5.5); x.fillStyle = '#3a9a2a'; ell(x, px + w / 2, py + 4, w / 2 + 2, 4.5); x.fillStyle = '#6ac83a'; ell(x, px + w / 2, py + 3, w / 2, 2.5);
    x.fillStyle = '#2a7a1a'; x.fillRect(px - 2, py + 4, w + 4, 1); for (let i = 6; i < w; i += 8) { x.fillRect(px + i, py + 2, 1, 2); x.fillRect(px + i + 1, py + 5, 1, 2); }
  } else {
    const col = th.plat === 'stick' ? ['#e8c088', '#c8955a', '#fff0c8'] : ['#9a5a2a', '#6a3a1a', '#c88848'];
    x.fillStyle = O; x.fillRect(px - 1, py - 1, w + 2, 9); x.fillStyle = col[0]; x.fillRect(px, py, w, 7); x.fillStyle = col[1]; x.fillRect(px, py + 5, w, 2); x.fillStyle = col[2]; x.fillRect(px + 1, py + 1, w - 2, 1);
    x.fillStyle = col[1]; for (let i = 7; i < w - 2; i += 11) x.fillRect(px + i, py + 2, 3, 1);
    x.fillStyle = O; x.fillRect(px - 2, py, 1, 7); x.fillRect(px + w + 1, py, 1, 7);
  }
}
function ell(x, cx, cy, rx, ry) { x.beginPath(); x.ellipse(Math.round(cx), Math.round(cy), Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2); x.fill(); }

// ---------- enemies ----------
function makeEnemy(o) {
  const e = { ...o, vx: 0, vy: 0, dir: -1, hp: 1, flash: 0, dead: false, t: Math.random() * 10, w: 20, h: 14, hitBy: -1, kb: 0, ox: o.x, oy: o.y, state: 'walk', st: 0 };
  switch (e.type) {
    case 'ant': e.w = 16; e.h = 34; e.speed = 28; e.score = 100; break;
    case 'beetle': e.w = 26; e.h = 18; e.speed = 22; e.hp = 2; e.score = 200; break;
    case 'frog': e.w = 100; e.h = 62; e.hp = 3; e.score = 300; e.state = 'sit'; e.st = rnd(.8, 1.6); e.air = false; e.tongue = 0; break;
    case 'stick': e.w = 44; e.h = 26; e.speed = 34; e.hp = 2; e.score = 200; e.awake = false; break;
    case 'cater': e.w = 36; e.h = 16; e.speed = 16; e.hp = 2; e.score = 180; break;
    case 'snakeM': e.w = 28; e.h = 12; e.speed = 42; e.hp = 1; e.score = 100; break;
    case 'roach': e.w = 26; e.h = 12; e.speed = 52; e.hp = 1; e.score = 100; break;
    case 'roachB': e.w = 50; e.h = 24; e.speed = 40; e.hp = 2; e.score = 200; break;
    case 'rat': e.w = 46; e.h = 24; e.speed = 34; e.hp = 3; e.score = 260; break;
    case 'mosca': e.w = 20; e.h = 16; e.score = 120; e.fly = true; e.amp = o.amp || 16; e.state = 'hover'; break;
    case 'fly': e.w = 24; e.h = 22; e.score = 160; e.fly = true; break;
    case 'scorp': e.w = 36; e.h = 27; e.speed = 20; e.hp = 2; e.score = 250; break;
    case 'lady': e.w = 20; e.h = 16; e.score = 150; e.fly = true; e.amp = o.amp || 24; break;
    case 'hopper': e.w = 26; e.h = 18; e.score = 150; e.st = rnd(.4, 1.2); e.air = false; break;
    case 'ladyC': e.w = 22; e.h = 18; e.score = 200; e.fly = true; e.amp = o.amp || 20; e.state = 'hover'; break;
    case 'spider': e.w = 20; e.h = 18; e.score = 150; e.fly = true; e.y = o.top + 20; break;
  }
  return e;
}
function enemyBox(e) { return { l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y }; }
function updateEnemy(e, dt) {
  e.t += dt; if (e.flash > 0) e.flash -= dt;
  if (e.dead) { e.vy += 900 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.rot += dt * 14 * Math.sign(e.vx || 1); return; }
  if (e.kb > 0) { e.kb -= dt; }
  if (e.type === 'lady') { e.x = e.ox + Math.sin(e.t * .85) * 40; e.y = e.oy + Math.sin(e.t * 1.7) * e.amp * .5; e.dir = Math.cos(e.t * .85) > 0 ? 1 : -1; return; }
  if (e.type === 'ladyC' || e.type === 'mosca') {
    const dx = P.x - e.x, dy = (P.y - 20) - e.y;
    if (e.state === 'hover') { e.hx = (e.hx ?? 0) + dt; e.x = e.ox + Math.sin(e.t * 1.1) * 30; e.y = e.oy + Math.sin(e.t * 2.2) * e.amp * .4; e.dir = dx > 0 ? 1 : -1; if (Math.abs(dx) < 150 && Math.abs(dy) < 140 && e.hx > 2 && G.deadT <= 0) { e.state = 'aim'; e.st = .75; } }
    else if (e.state === 'aim') { e.st -= dt; e.dir = dx > 0 ? 1 : -1; if (e.st <= 0) { const d = Math.hypot(dx, dy) || 1; e.vx = dx / d * 145; e.vy = dy / d * 145; e.state = 'dive'; e.st = 1.1; SFX.dash(); } }
    else if (e.state === 'dive') { e.st -= dt; e.x += e.vx * dt; e.y += e.vy * dt; if (e.st <= 0 || solidAt(Math.floor(e.x / T), Math.floor(e.y / T)) === 1) { e.state = 'back'; } }
    else if (e.state === 'back') { const bx = e.ox - e.x, by = e.oy - e.y, d = Math.hypot(bx, by); if (d < 4) { e.state = 'hover'; e.hx = 0; e.t = 0; } else { e.x += bx / d * 65 * dt; e.y += by / d * 65 * dt; e.dir = bx > 0 ? 1 : -1; } }
    return;
  }
  if (e.type === 'fly') {
    const dx = P.x - e.ox, dy = (P.y - 50) - e.oy;
    if (Math.abs(dx) < 220 && Math.abs(dy) < 180 && G.deadT <= 0) { e.ox += clamp(dx, -28 * dt, 28 * dt); e.oy += clamp(dy, -22 * dt, 22 * dt); }
    e.x = e.ox + Math.sin(e.t * .8) * 55; e.y = e.oy + Math.sin(e.t * 1.6) * 20; e.dir = Math.cos(e.t * .8) > 0 ? 1 : -1; return;
  }
  if (e.type === 'frog') {
    const dx = P.x - e.x;
    e.vy = Math.min(e.vy + 1300 * dt, 600); if (e.kb > 0) { e.kb -= dt; e.vx *= .9; }
    if (!e.air && e.kb <= 0) {
      if (e.state === 'sit') { e.vx = 0; e.dir = dx > 0 ? 1 : -1; e.st -= dt;
        if (e.st <= 0) { if (Math.abs(dx) < 165 && Math.abs(P.y - e.y) < 70 && G.deadT <= 0) { e.state = 'wind'; e.st = .55; }
          else if (Math.abs(dx) < 340) { const tx = e.x + e.dir * 110; if (solidAt(Math.floor(tx / T), Math.floor((e.y + 2) / T)) === 1 && solidAt(Math.floor((tx + e.dir * 45) / T), Math.floor((e.y + 2) / T)) === 1) { e.vx = e.dir * 115; e.vy = -390; e.air = true; SFX.spring(); } e.st = rnd(1.1, 1.9); } else e.st = 1; } }
      else if (e.state === 'wind') { e.st -= dt; if (e.st <= 0) { e.state = 'tongue'; e.st = .65; SFX.dash(); } }
      else if (e.state === 'tongue') { e.st -= dt; const k = e.st > .5 ? (.65 - e.st) / .15 : e.st > .28 ? 1 : e.st / .28; e.tongue = clamp(k, 0, 1) * 130;
        const tx0 = e.x + e.dir * 50, tx1 = tx0 + e.dir * e.tongue, ty = e.y - 30, l = Math.min(tx0, tx1), r = Math.max(tx0, tx1);
        if (P.x + 8 > l && P.x - 8 < r && P.y > ty - 4 && P.y - 36 < ty + 4) hurtPlayer(e.x);
        if (e.st <= 0) { e.state = 'sit'; e.st = rnd(1, 1.6); e.tongue = 0; } }
    }
    let nx = e.x + e.vx * dt; if (solidAt(Math.floor((nx + Math.sign(e.vx || 1) * e.w / 2) / T), Math.floor((e.y - 10) / T)) === 1) { e.vx = 0; nx = e.x; }
    e.x = nx; const py = e.y; e.y += e.vy * dt; const ty = Math.floor(e.y / T), tx = Math.floor(e.x / T);
    if (e.vy >= 0 && solidAt(tx, ty) && py <= ty * T + 1) { e.y = ty * T; e.vy = 0; if (e.air) { e.air = false; dust(e.x - 20, e.y, 3); dust(e.x + 20, e.y, 3); } }
    if (e.y > ROWS * T + 40) e.dead = true;
    return;
  }
  if (e.type === 'hopper') {
    if (e.kb > 0) { e.vx *= .9; }
    e.vy = Math.min(e.vy + 1200 * dt, 500);
    if (!e.air && e.kb <= 0) { e.vx = 0; e.st -= dt; if (P.x < e.x - 4) e.dir = -1; else if (P.x > e.x + 4) e.dir = 1; if (e.st <= 0) { const near = Math.abs(P.x - e.x) < 260; e.vx = e.dir * (near ? 90 : 50); e.vy = near ? -380 : -250; e.air = true; e.st = rnd(.7, 1.3); } }
    let nx = e.x + e.vx * dt; if (solidAt(Math.floor((nx + e.dir * e.w / 2) / T), Math.floor((e.y - 8) / T)) === 1) { e.vx = 0; nx = e.x; }
    e.x = nx; const py = e.y; e.y += e.vy * dt;
    const ty = Math.floor(e.y / T), tx = Math.floor(e.x / T);
    if (e.vy >= 0 && solidAt(tx, ty) && py <= ty * T + 1) { e.y = ty * T; e.vy = 0; if (e.air) { e.air = false; dust(e.x, e.y, 2); } }
    if (e.y > ROWS * T + 40) e.dead = true;
    return;
  }
  if (e.type === 'spider') { const k = .5 - .5 * Math.cos(e.t * 1); e.y = e.top + 20 + k * e.range; return; }
  // walkers
  let sp = e.speed;
  if (e.type === 'stick' && !e.awake) { sp = 0; if (Math.abs(P.x - e.x) < 140 && Math.abs(P.y - e.y) < 80) { e.awake = true; e.dir = P.x > e.x ? 1 : -1; floatText('!', e.x, e.y - 34, '#ff3b5c', 2); } }
  if (e.type === 'scorp' || e.type === 'rat') {
    const dx = P.x - e.x;
    if (e.state === 'walk' && Math.abs(dx) < 130 && Math.abs(P.y - e.y) < 30 && Math.sign(dx) === e.dir) { e.state = 'wind'; e.st = .6; }
    if (e.state === 'wind') { sp = 0; e.st -= dt; if (e.st <= 0) { e.state = 'charge'; e.st = .9; } }
    else if (e.state === 'charge') { sp = 100; e.st -= dt; if (e.st <= 0) { e.state = 'rest'; e.st = .6; } }
    else if (e.state === 'rest') { sp = 0; e.st -= dt; if (e.st <= 0) e.state = 'walk'; }
  }
  if (e.kb > 0) sp = 0;
  e.vx = e.kb > 0 ? e.vx * .9 : sp * e.dir;
  e.vy = Math.min(e.vy + 1400 * dt, 500);
  const nx = e.x + e.vx * dt;
  const front = Math.floor((nx + e.dir * e.w / 2) / T), feetRow = Math.floor((e.y + 2) / T), midRow = Math.floor((e.y - 6) / T);
  const wall = solidAt(front, midRow) === 1, noFloor = !solidAt(front, feetRow);
  if ((wall || noFloor) && e.kb <= 0) { e.dir *= -1; if (e.state === 'charge') { e.state = 'rest'; e.st = .5; } } else e.x = nx;
  e.y += e.vy * dt;
  const ty = Math.floor(e.y / T), tx = Math.floor(e.x / T);
  if (solidAt(tx, ty) && e.vy >= 0) { e.y = ty * T; e.vy = 0; }
  if (e.y > ROWS * T + 40) e.dead = true;
}
function damageEnemy(e, dmg, dirx, kind) {
  if (e.dead) return; if (e.type === 'stick') e.awake = true; if (e.type === 'frog') { e.state = 'sit'; e.tongue = 0; e.st = Math.max(e.st, .6); }
  e.hp -= dmg; e.flash = .12;
  const cx = e.x, cy = e.y - e.h / 2;
  hitSpark(cx, cy, kind === 'stomp' ? '#fff6a0' : '#ffffff');
  P.combo++; P.comboT = 1.6; G.maxCombo = Math.max(G.maxCombo, P.combo);
  if (P.combo >= 2) floatText('COMBO ' + P.combo + '!', cx, cy - 20, '#7ff0ff', 1 + Math.min(P.combo, 8) * .08);
  if (e.hp <= 0) {
    e.dead = true; e.vx = dirx * 160; e.vy = -320; e.rot = 0;
    G.kills++; const pts = e.score * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 8, '#ffe45a');
    SFX.kill(); fx.stop = .085; fx.shake = Math.max(fx.shake, 4);
    burst(cx, cy, 14, ['#ffe45a', '#ffffff', '#ff8a3a'], 220);
    ring(cx, cy, '#ffffff');
    // drop sugar
    const n = 1;
    for (let i = 0; i < n; i++) G.sugarList.push({ x: cx, y: cy, got: false, vx: rnd(-90, 90), vy: rnd(-260, -160), mag: true, drop: true, bob: 0, delay: .25 });
  } else {
    e.kb = .25; e.vx = dirx * 200; SFX.hit(); fx.stop = .05; fx.shake = Math.max(fx.shake, 2.5);
    burst(cx, cy, 6, ['#ffffff', '#ffe45a'], 160);
  }
}

// ---------- boss ----------
function makeBoss(b) { const scorp = b.kind === 'scorp', frog = b.kind === 'frog', snake = b.kind === 'snake', flea = b.kind === 'flea', ratk = b.kind === 'rat'; return { kind: b.kind || 'hopper', bx: b.x * T + 8, hx: 70, hy: 18, name: ratk ? 'RATO GIGANTE' : flea ? 'ONDA DE PULGAS' : snake ? 'COBRA VENENOSA' : frog ? 'SAPO GIGANTE' : scorp ? 'ESCORPIÃO GIGANTE' : 'GAFANHOTO INVASOR', nameCol: ratk ? '#9ae040' : flea ? '#ff9a6a' : snake ? '#b4ff5a' : frog ? '#7cf05a' : scorp ? '#ffb060' : '#b4ec5a', pat: ratk ? ['slam', 'throw', 'fart', 'surf', 'slam', 'throw', 'fart'] : flea ? ['roll', 'hop', 'scatter', 'roll', 'hop'] : snake ? ['strike', 'spit', 'leap', 'summon', 'strike', 'leap', 'spit'] : frog ? ['tongue', 'leap', 'inhale', 'tongue', 'leap', 'tongue'] : ['sting', 'charge', 'sting', 'burrow'], pi: 0, dig: 0, mark: null, x: b.x * T + 8, y: (ROWS - b.h - BASE) * T, floorY: (ROWS - b.h - BASE) * T, vx: 0, vy: 0, dir: -1, hp: ratk ? 18 : flea ? 16 : snake ? 17 : frog ? 18 : scorp ? 16 : 14, max: ratk ? 18 : flea ? 16 : snake ? 17 : frog ? 18 : scorp ? 16 : 14, state: 'sleep', st: 0, flash: 0, inv: 0, ground: true, w: ratk ? 70 : flea ? 110 : snake ? 35 : frog ? 230 : scorp ? 100 : 84, h: ratk ? 100 : flea ? 46 : snake ? 23 : frog ? 140 : scorp ? 38 : 40, t: 0, sx: 1, sy: 1, arenaL: b.arenaL * T, arenaR: b.arenaR * T, active: false, hitBy: -1 }; }
function hitBoss(dir, stomp, dmg = 1) {
  const B = G.boss; if (B.inv > 0) return false;
  B.hp -= dmg; if (dmg > 1) floatText('CRÍTICO!', B.x, B.y - 80, '#ff8a3a', 2); B.inv = .3; B.flash = .14; B.sx = 1.15; B.sy = .88;
  const cx = B.x, cy = B.y - B.h / 2;
  P.combo++; P.comboT = 1.6; G.maxCombo = Math.max(G.maxCombo, P.combo);
  const pts = 100 * dmg * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 30, '#ffe45a');
  if (P.combo >= 2) floatText('COMBO ' + P.combo + '!', cx, cy - 46, '#7ff0ff', 1 + Math.min(P.combo, 8) * .08);
  SFX.bossHit(); fx.stop = .07; fx.shake = Math.max(fx.shake, 5); hitSpark(cx, cy, '#ffffff'); burst(cx, cy, 10, ['#b4ec5a', '#ffffff', '#ffe45a'], 220); ring(cx, cy, '#ffffff');
  if (B.kind === 'snake' && !B.halfDone && B.hp > 0 && B.hp <= B.max * .5) { B.halfDone = true; B.healPending = true; }
  if (B.hp <= 0) {
    B.state = 'dying'; B.st = 1.8; B.vx = 0; B.mark = null; fx.stop = .3; SFX.roar(); G.kills++; G.score += 3000; floatText('+3000', cx, cy - 60, '#ffe45a', 3); G.waves.length = 0; playSong(null);
  } else if (B.kind === 'hopper' && (B.state === 'idle' || B.state === 'land')) { B.st = Math.min(B.st, .25); }
  return true;
}
function updateBoss(dt) {
  const B = G.boss; B.t += dt; B.flash -= dt; B.inv -= dt;
  B.sx = lerp(B.sx, 1, Math.min(1, dt * 10)); B.sy = lerp(B.sy, 1, Math.min(1, dt * 10));
  for (let i = G.waves.length - 1; i >= 0; i--) { const w = G.waves[i]; w.x += w.dir * w.sp * dt; w.life -= dt; if (Math.random() < .5) parts.push({ x: w.x, y: w.y - 2, vx: rnd(-20, 20), vy: rnd(-80, -30), life: .3, max: .3, c: 'rgba(240,210,160,.8)', sz: 3, g: 200, k: 'puff' }); if (w.life <= 0 || w.x < B.arenaL + 4 || w.x > B.arenaR - 4) G.waves.splice(i, 1); }
  if (B.state === 'dead') return;
  if (B.state === 'sleep') { if (P.x > B.arenaL + 11 * T && G.deadT <= 0) { B.active = true; SFX.roar(); fx.shake = 8; G.bossBanner = 2.4; playSong('boss'); if (B.kind === 'scorp') { B.state = 'warn'; B.st = .7; B.dig = 1; } else if (B.kind === 'frog') { startFrogCut(B); } else if (B.kind === 'flea') { startFleaCut(B); } else if (B.kind === 'rat') { startRatCut(B); } else if (B.kind === 'snake') { B.state = 'intro'; B.st = 1.6; noise({ f: 4500, type: 'highpass', t: .9, v: .25 }); } else { B.state = 'intro'; B.st = 1.8; B.vy = -300; B.ground = false; } } else return; }
  if (B.kind === 'scorp') { updateScorp(B, dt); return; }
  if (B.kind === 'frog') { updateFrog(B, dt); return; }
  if (B.kind === 'snake') { updateSnake(B, dt); return; }
  if (B.kind === 'flea') { updateFlea(B, dt); return; }
  if (B.kind === 'rat') { updateRat(B, dt); return; }
  const enr = B.hp <= B.max * .4, dx = P.x - B.x;
  const face = () => { B.dir = dx > 0 ? 1 : -1; };
  if (!B.ground) B.vy += 1500 * dt;
  B.x += B.vx * dt; B.y += B.vy * dt;
  const minX = B.arenaL + 50, maxX = B.arenaR - 50; let wall = false;
  if (B.x < minX) { B.x = minX; wall = true; } if (B.x > maxX) { B.x = maxX; wall = true; }
  if (!B.ground && B.vy >= 0 && B.y >= B.floorY) {
    B.y = B.floorY; B.vy = 0; B.ground = true; B.vx = 0;
    if (B.state !== 'dying') {
      SFX.boom(); fx.shake = 9; B.sx = 1.3; B.sy = .7; dust(B.x - 30, B.y, 8, 1); dust(B.x + 30, B.y, 8, -1);
      const sp = enr ? 190 : 150; G.waves.push({ x: B.x - 44, y: B.floorY, dir: -1, sp, life: 1.6 }, { x: B.x + 44, y: B.floorY, dir: 1, sp, life: 1.6 });
      if (B.state === 'hop') { B.state = 'land'; B.st = enr ? .5 : .8; }
    }
  }
  switch (B.state) {
    case 'intro': B.st -= dt; face(); if (B.st <= 0 && B.ground) { B.state = 'idle'; B.st = .5; } break;
    case 'idle': B.vx = 0; face(); B.st -= dt; if (B.st <= 0) { if (Math.random() < (Math.abs(dx) > 170 ? .75 : .45)) { B.state = 'crouch'; B.st = enr ? .45 : .65; } else { B.state = 'wind'; B.st = enr ? .6 : .85; SFX.roar(); } } break;
    case 'crouch': face(); B.st -= dt; if (B.st <= 0) { B.vy = enr ? -680 : -620; B.vx = clamp(dx / 1.05, -250, 250); B.ground = false; B.state = 'hop'; SFX.spring(); B.sx = .8; B.sy = 1.25; dust(B.x, B.y, 8); } break;
    case 'hop': break;
    case 'land': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .15; } break;
    case 'wind': B.st -= dt; if (B.st <= 0) { B.state = 'kick'; B.vx = B.dir * (enr ? 320 : 250); B.st = 1.2; SFX.dash(); } break;
    case 'kick': B.st -= dt; if (Math.random() < .6) dust(B.x - B.dir * 30, B.y, 1, B.dir); if (wall || B.st <= 0) { B.state = 'skid'; B.st = .45; if (wall) { fx.shake = 6; SFX.boom(); } } break;
    case 'skid': B.vx *= Math.pow(.02, dt); B.st -= dt; if (B.st <= 0) { B.vx = 0; B.state = 'idle'; B.st = enr ? .5 : .8; } break;
    case 'dying': bossDie(B, dt);
      break;
  }
}
function bossDie(B, dt) {
B.st -= dt; B.flash = (B.t * 12 % 1) < .5 ? .1 : 0; fx.shake = 4;
      if (Math.random() < dt * 9) { const ex = B.x + rnd(-40, 40), ey = B.y - rnd(5, 45); burst(ex, ey, 10, ['#ffe45a', '#ffffff', '#ff8a3a', '#b4ec5a'], 200); ring(ex, ey, '#fff'); SFX.hit(); }
      if (B.st <= 0) {
        B.state = 'dead'; SFX.kill(); SFX.boom(); fx.flash = .3; fx.shake = 10;
        burst(B.x, B.y - 25, 40, ['#ffe45a', '#ffffff', '#ff8a3a', '#b4ec5a'], 320); confetti(B.x, B.y - 40, 60);
        for (let i = 0; i < 12; i++) G.sugarList.push({ x: B.x, y: B.y - 30, got: false, vx: rnd(-220, 220), vy: rnd(-420, -200), mag: true, drop: true, bob: 0, delay: .5 });
        G.flagHidden = false; G.flagPop = 0; setTimeout(() => { SFX.combo(7); }, 350);
        if (G.bgAnts) G.bgAnts.forEach((a, i) => { a.cheer = true; a.vy = -rnd(60, 140); if (i % 2 === 0) a.x = G.camX * .5 + rnd(30, W - 30); });
        playSong(G.th.song);
      }
}
function updateScorp(B, dt) {
  const enr = B.hp <= B.max * .5, dx = P.x - B.x, F = B.floorY, REACH = 96;
  const face = () => { B.dir = dx > 0 ? 1 : -1; };
  if (!B.ground) B.vy += 1500 * dt;
  B.x += B.vx * dt; B.y += B.vy * dt;
  const minX = B.arenaL + 60, maxX = B.arenaR - 60; let wall = false;
  if (B.x < minX) { B.x = minX; wall = true; } if (B.x > maxX) { B.x = maxX; wall = true; }
  if (!B.ground && B.vy >= 0 && B.y >= F) { B.y = F; B.vy = 0; B.ground = true; B.vx = 0; SFX.boom(); fx.shake = 6; B.sx = 1.25; B.sy = .75; dust(B.x - 40, F, 8, 1); dust(B.x + 40, F, 8, -1); if (B.state === 'erupt') { B.state = 'idle'; B.st = enr ? .5 : .8; } }
  const sand = (x, n, sp = 220) => { for (let i = 0; i < n; i++) parts.push({ x: x + rnd(-10, 10), y: F - 2, vx: rnd(-sp, sp) * .6, vy: rnd(-sp * 1.6, -sp * .5), life: rnd(.4, .8), max: .8, c: ['#f0c070', '#d89a40', '#ffe0a0'][i % 3], sz: rnd(2, 4), g: 700, k: 'sq' }); };
  const tipX = () => B.x + B.dir * REACH;
  switch (B.state) {
    case 'idle': face(); B.st -= dt; B.vx = Math.abs(dx) > 260 ? B.dir * 50 : 0;
      if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length]; B.vx = 0;
        if (a === 'sting') { B.state = 'aim'; B.st = enr ? .8 : 1.1; B.mark = { x: tipX(), lock: false }; SFX.roar(); }
        else if (a === 'charge') { B.state = 'snip'; B.st = enr ? .6 : .85; }
        else { B.state = 'dig'; B.st = .7; SFX.splash(); } }
      break;
    case 'aim': { face(); B.st -= dt; const m = B.mark; m.x += clamp(P.x - m.x, -280 * dt, 280 * dt); const want = clamp(m.x - B.dir * REACH, minX, maxX); B.vx = clamp((want - B.x) * 4, -150, 150); m.x = clamp(m.x, B.x + (B.dir > 0 ? 40 : -REACH - 30), B.x + (B.dir > 0 ? REACH + 30 : -40));
      if (B.st <= 0) { B.state = 'lock'; B.st = enr ? .3 : .42; m.lock = true; B.vx = 0; SFX.tick(); } break; }
    case 'lock': B.st -= dt; B.vx = 0; if (B.st <= 0) { B.state = 'strike'; B.st = .14; } break;
    case 'strike': B.st -= dt; if (B.st <= 0) { const tx = tipX(); B.mark = null; SFX.boom(); SFX.hit(); fx.shake = 9; sand(tx, 22, 260); ring(tx, F - 6, '#ffe0a0');
        if (Math.abs(P.x - tx) < 26 && P.y > F - 40) hurtPlayer(tx);
        if (enr) G.waves.push({ x: tx - 20, y: F, dir: -1, sp: 170, life: 1.5 }, { x: tx + 20, y: F, dir: 1, sp: 170, life: 1.5 });
        B.state = 'stuck'; B.st = enr ? 1.5 : 1.9; floatText('PRESO!', tx, F - 60, '#7cf05a', 2); } break;
    case 'stuck': B.st -= dt; if (Math.random() < dt * 8) sand(tipX(), 2, 80); if (B.st <= 0) { B.state = 'pull'; B.st = .35; sand(tipX(), 14, 200); SFX.splash(); } break;
    case 'pull': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .35 : .6; } break;
    case 'snip': face(); B.st -= dt; if (Math.floor(B.st * 10) !== Math.floor((B.st + dt) * 10)) SFX.tick(); if (B.st <= 0) { B.state = 'charge'; B.vx = B.dir * (enr ? 360 : 290); B.st = 2.2; SFX.dash(); } break;
    case 'charge': B.st -= dt; if (Math.random() < .7) dust(B.x - B.dir * 40, F, 1, B.dir);
      if (wall) { B.state = 'dizzy'; B.st = enr ? 1.4 : 1.8; B.vx = 0; fx.shake = 10; SFX.boom(); sand(B.x + B.dir * 60, 20, 240); floatText('TONTO!', B.x, F - 90, '#7cf05a', 2); }
      else if (B.st <= 0) { B.state = 'idle'; B.vx = 0; B.st = .5; } break;
    case 'dizzy': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .4; } break;
    case 'dig': B.st -= dt; B.dig = Math.min(1, 1 - B.st / .7); B.vx = 0; if (Math.random() < .8) sand(B.x + rnd(-40, 40), 1, 120); if (B.st <= 0) { B.state = 'under'; B.st = enr ? 1.5 : 1.9; B.dig = 1; } break;
    case 'under': B.st -= dt; B.vx = clamp((P.x - B.x) * 3, -(enr ? 210 : 170), enr ? 210 : 170); fx.shake = Math.max(fx.shake, 1.2); if (Math.random() < .9) sand(B.x + rnd(-8, 8), 1, 90); if (Math.random() < dt * 6) SFX.step();
      if (B.st <= 0) { B.state = 'warn'; B.st = enr ? .45 : .6; B.vx = 0; } break;
    case 'warn': B.st -= dt; B.vx = 0; sand(B.x, 2, 160); if (B.st <= 0) {
        B.state = 'erupt'; B.dig = 0; B.y = F - 2; B.vy = -620; B.ground = false; SFX.boom(); SFX.roar(); fx.shake = 10; sand(B.x, 40, 320); ring(B.x, F - 10, '#ffe0a0');
        if (Math.abs(P.x - B.x) < 60 && P.y > F - 90) hurtPlayer(B.x, 2);
        if (enr) G.waves.push({ x: B.x - 50, y: F, dir: -1, sp: 190, life: 1.5 }, { x: B.x + 50, y: F, dir: 1, sp: 190, life: 1.5 });
        if (!B.introDone) { B.introDone = true; B.st = 0; } } break;
    case 'erupt': face(); break;
    case 'dying': bossDie(B, dt); break;
  }
}
const SS = .88;
const SNAKE_SPIKES = [[.1, .2], [.32, .42], [.66, .74]];
const isSpike = t => SNAKE_SPIKES.some(([a, b]) => t >= a && t <= b);
function snakeSegs(B) {
  const F = B.floorY, tailX = B.bx - B.dir * 150 * SS, hxp = B.x - B.dir * 14 * SS, hyc = B.y - 12 * SS, out = [], N = Math.max(22, Math.round((Math.abs(hxp - tailX) + Math.abs(hyc - F)) / 7));
  for (let i = 0; i <= N; i++) { const t = i / N; let x, y;
    if (t < .6) { const u = t / .6; x = lerp(tailX, B.bx, u); y = F - 6 - Math.abs(Math.sin(u * 5 + B.t * 4)) * 2.5 - (B.jy || 0); }
    else { const u = (t - .6) / .4, e = u * u * (3 - 2 * u); x = lerp(B.bx, hxp, u); y = lerp(F - 7 - (B.jy || 0), hyc, e); }
    out.push({ x, y, r: (4 + 6 * Math.min(1, t * 1.3)) * SS, t }); }
  return out;
}
function updateSnake(B, dt) {
  const enr = !!B.raged, F = B.floorY; B.proj = B.proj || []; B.pud = B.pud || [];
  if (B.healPending && !['leap', 'strike', 'dying', 'dead'].includes(B.state)) { B.healPending = false; B.state = 'healw'; B.st = .9; B.jy = 0; }
  const hg = B.healGlob;
  if (hg) { hg.t += dt;
    if (!hg.landed) { hg.vy += 900 * dt; hg.x += hg.vx * dt; hg.y += hg.vy * dt; hg.x = clamp(hg.x, B.arenaL + 20, B.arenaR - 20); if (Math.random() < .7) parts.push({ x: hg.x, y: hg.y, vx: 0, vy: 0, life: .35, max: .35, c: '#ff9ad8', sz: 2, g: 0, k: 'sq' }); if (hg.y >= F - 3) { hg.y = F - 3; hg.landed = true; SFX.splash(); for (let k = 0; k < 12; k++) parts.push({ x: hg.x, y: F - 2, vx: rnd(-90, 90), vy: rnd(-200, -60), life: .5, max: .5, c: '#ffb0e0', sz: 2, g: 700, k: 'sq' }); } }
    else if (Math.random() < dt * 6) parts.push({ x: hg.x + rnd(-14, 14), y: F - 4, vx: 0, vy: -40, life: .6, max: .6, c: '#ffd0f0', sz: 2, g: -20, k: 'star' });
    if (Math.abs(P.x - hg.x) < 20 && P.y > hg.y - 14 && P.y - 36 < hg.y + 6 && G.deadT <= 0) {
      const h0 = P.hp; P.hp = Math.min(MAXHP, P.hp + 4); B.healGlob = null; SFX.heal(); floatText('+2 ♥  VENENO DE CURA!', P.x, P.y - 60, '#ff9ad8', 2);
      for (let i = 0; i < Math.max(1, P.hp - h0); i++) floats.push({ s: '♥', x: P.x + rnd(-14, 14), y: P.y - 40 - i * 6, c: '#ff3b5c', t: -i * .08, sc: 2 });
      for (let i = 0; i < 14; i++) parts.push({ x: P.x + rnd(-12, 12), y: P.y - rnd(0, 40), vx: rnd(-20, 20), vy: rnd(-90, -40), life: .8, max: .8, c: i % 2 ? '#ff8ad0' : '#ffffff', sz: 2, g: -40, k: 'star' }); } }
  for (let i = B.proj.length - 1; i >= 0; i--) { const q = B.proj[i]; q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (Math.random() < .6) parts.push({ x: q.x, y: q.y, vx: 0, vy: 0, life: .3, max: .3, c: '#b4ff5a', sz: 2, g: 0, k: 'sq' });
    if (Math.abs(P.x - q.x) < 12 && q.y > P.y - 38 && q.y < P.y + 2) { hurtPlayer(q.x); B.proj.splice(i, 1); continue; }
    if (q.y >= F - 2) { B.pud.push({ x: q.x, life: 3.2 }); SFX.splash(); for (let k = 0; k < 10; k++) parts.push({ x: q.x, y: F - 2, vx: rnd(-90, 90), vy: rnd(-200, -60), life: .4, max: .4, c: '#9ae040', sz: 2, g: 700, k: 'sq' }); B.proj.splice(i, 1); } }
  for (let i = B.pud.length - 1; i >= 0; i--) { const u = B.pud[i]; u.life -= dt; if (Math.random() < dt * 4) parts.push({ x: u.x + rnd(-14, 14), y: F - 3, vx: 0, vy: -30, life: .5, max: .5, c: '#c8ff70', sz: 2, g: -20, k: 'puff' }); if (Math.abs(P.x - u.x) < 18 && P.y > F - 6) hurtPlayer(u.x); if (u.life <= 0) B.pud.splice(i, 1); }
  const face = () => { B.dir = P.x > B.bx ? 1 : -1; };
  let thx = 70, thy = 60, sp = 8;
  switch (B.state) {
    case 'intro': B.st -= dt; face(); thy = 60; sp = 3; if (B.st <= 0) { B.state = 'idle'; B.st = .8; } break;
    case 'idle': { face(); const want = P.x - B.dir * 150; B.bx += clamp(want - B.bx, -(enr ? 85 : 60) * dt, (enr ? 85 : 60) * dt); B.st -= dt;
      if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length];
        if (a === 'strike') { B.state = 'coil'; B.st = enr ? .5 : .75; noise({ f: 4500, type: 'highpass', t: .5, v: .2 }); }
        else if (a === 'spit') { B.state = 'spitw'; B.st = .6; }
        else if (a === 'leap') { B.state = 'leapw'; B.st = enr ? .5 : .7; noise({ f: 4500, type: 'highpass', t: .4, v: .2 }); }
        else { B.state = 'summon'; B.st = .9; noise({ f: 4000, type: 'highpass', t: .9, v: .25 }); } } break; }
    case 'healw': face(); thx = 50; thy = 95; B.st -= dt; if (Math.random() < .5) parts.push({ x: B.x, y: B.y - 10, vx: rnd(-40, 40), vy: rnd(-60, -20), life: .4, max: .4, c: '#ff9ad8', sz: 2, g: 0, k: 'star' });
      if (B.st <= 0) { const hx = B.x + B.dir * 16; B.healGlob = { x: hx, y: B.y - 16, vx: clamp((P.x - hx) / 1.1, -320, 320), vy: -430, landed: false, t: 0 }; tone({ type: 'triangle', f: 500, f2: 900, t: .3, v: .2 }); B.state = 'healspit'; B.st = .9; } break;
    case 'healspit': thx = 55; thy = 70; B.st -= dt; if (B.st <= 0) { B.raged = true; B.state = 'idle'; B.st = .5; SFX.roar(); fx.shake = 10; fx.flash = .15; floatText('FURIOSA!', B.x, B.y - 50, '#ff3b5c', 3); } break;
    case 'leapw': face(); thx = 40; thy = 30; B.st -= dt; B.jy = -Math.sin(B.t * 40) * 1.5; if (B.st <= 0) { B.jy = 0; B.state = 'leap'; B.jt = 0; B.jdur = enr ? 1.25 : 1.4; B.jx0 = B.bx; B.jx1 = clamp(P.x - B.dir * 40 * SS, B.arenaL + 60, B.arenaR - 60); SFX.spring(); dust(B.bx, F, 10); } break;
    case 'leap': { thx = 75; thy = 45; B.jt += dt; const u = Math.min(1, B.jt / B.jdur); B.bx = lerp(B.jx0, B.jx1, u); B.jy = Math.sin(u * Math.PI) * 140; sp = 12;
      if (u >= 1) { B.jy = 0; B.state = 'land'; B.st = enr ? .45 : .7; SFX.boom(); fx.shake = 9; dust(B.bx - 50, F, 10, 1); dust(B.bx + 50, F, 10, -1); ring(B.bx, F - 6, '#ffffff');
        const spd = enr ? 210 : 165; G.waves.push({ x: B.bx - 60, y: F, dir: -1, sp: spd, life: 1.6 }, { x: B.bx + 60, y: F, dir: 1, sp: spd, life: 1.6 });
        if (Math.abs(P.x - B.bx) < 55 && P.y > F - 40) hurtPlayer(B.bx); } break; }
    case 'land': thx = 55; thy = 35; B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .4; } break;
    case 'coil': thx = 30; thy = 88; B.st -= dt; if (B.st <= 0) { B.state = 'strike'; B.st = .22; SFX.dash(); } break;
    case 'strike': thx = 245; thy = 14; sp = 26; B.st -= dt; if (B.st <= 0) { B.state = 'stun'; B.st = enr ? 1.1 : 1.45; SFX.boom(); fx.shake = 5; dust(B.x, F, 8); floatText('ATORDOADA!', B.x, F - 60, '#7cf05a', 2); } break;
    case 'stun': thx = 245; thy = 13; B.st -= dt; if (B.st <= 0) { B.state = 'retract'; B.st = .35; } break;
    case 'retract': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .4 : .7; } break;
    case 'spitw': thx = 55; thy = 78; B.st -= dt; if (B.st <= 0) { const n = enr ? 5 : 3, hx = B.x + B.dir * 20, d = P.x - hx; for (let k = 0; k < n; k++) { const f = .5 + .9 * k / (n - 1); B.proj.push({ x: hx, y: B.y - 16, vx: clamp(d * f / .9, -430, 430) || B.dir * 120, vy: -400 }); } tone({ type: 'sawtooth', f: 300, f2: 120, t: .2, v: .2 }); B.state = 'spit'; B.st = .55; } break;
    case 'spit': thx = 55; thy = 70; B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break;
    case 'summon': thx = 55; thy = 95; B.st -= dt; if (B.st <= 0) { const alive = G.enemies.filter(e => e.type === 'snakeM' && !e.dead).length, n = enr ? 3 : 2;
        for (let k = 0; k < n && alive + k < 4; k++) { const x = k % 2 ? G.camX + 30 : G.camX + W - 30; const e = makeEnemy({ type: 'snakeM', x, y: F }); e.dir = x < P.x ? 1 : -1; G.enemies.push(e); G.enemiesTotal++; for (let j = 0; j < 10; j++) parts.push({ x, y: F - 4, vx: rnd(-80, 80), vy: rnd(-200, -60), life: .5, max: .5, c: '#4ab83a', sz: 3, g: 600, k: 'sq' }); }
        floatText('CRIAS!', B.x, B.y - 60, '#b4ff5a', 2); B.state = 'idle'; B.st = .6; } break;
    case 'dying': if (!B.cleaned) { B.cleaned = true; B.healGlob = null; B.proj.length = 0; B.pud.length = 0; G.enemies.forEach(e => { if (e.type === 'snakeM' && !e.dead) { e.dead = true; e.vx = rnd(-120, 120); e.vy = -250; e.rot = 0; } }); } bossDie(B, dt); break;
  }
  B.hx = lerp(B.hx, thx * SS, Math.min(1, dt * sp)); B.hy = lerp(B.hy, thy * SS, Math.min(1, dt * sp));
  B.bx = clamp(B.bx, B.arenaL + 60, B.arenaR - 60);
  B.x = B.bx + B.dir * B.hx; B.y = F - B.hy + 14 * SS - (B.jy || 0);
  if (B.state !== 'dying' && B.state !== 'dead' && G.deadT <= 0) for (const g of snakeSegs(B)) { if (!isSpike(g.t) || g.t > (B.state === 'stun' || B.state === 'retract' ? .45 : .85)) continue; if (Math.abs(P.x - g.x) < g.r + 7 && P.y > g.y - g.r - 8 && P.y - 34 < g.y + g.r) { hurtPlayer(g.x); break; } }
}
function drawSnake(B, cx, cy) {
  if (B.state === 'dead') return; const F = B.floorY - cy;
  for (const u of B.pud || []) { const a = clamp(u.life, 0, 1); ctx.globalAlpha = .75 * a; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(u.x - cx, F, 21, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8ad830'; ctx.beginPath(); ctx.ellipse(u.x - cx, F, 19, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#d8ff90'; ctx.fillRect(u.x - cx - 8, F - 2, 6, 1); ctx.globalAlpha = 1; }
  if (B.state === 'sleep') { B.x = B.bx + B.dir * B.hx * SS; B.y = B.floorY - B.hy * SS + 14 * SS; }
  const wht = B.flash > 0, segs = snakeSegs(B);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(B.bx - cx - B.dir * 53, F, 97 * (1 - (B.jy || 0) / 300), 4, 0, 0, 7); ctx.fill();
  segs.forEach((g, i) => { const x = Math.round(g.x - cx), y = Math.round(g.y - cy), r = Math.round(g.r); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x, y, r + 1, 0, 7); ctx.fill(); ctx.fillStyle = wht ? '#ffffff' : (['#1a1a1a', '#6ad030', '#ffd040'][Math.floor(i * 18 / segs.length) % 3]); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); if (!wht && r > 4) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 2, y - r + 1, 3, 2); } });
  segs.forEach((g, i) => { if (!isSpike(g.t)) return; const x = Math.round(g.x - cx), y = Math.round(g.y - cy), r = Math.round(g.r), h = Math.round((9 + r * .7) * SS);
    ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.moveTo(x - 5, y - r + 2); ctx.lineTo(x + 5, y - r + 2); ctx.lineTo(x, y - r - h - 2); ctx.fill();
    ctx.fillStyle = wht ? '#ffffff' : '#8a3aa0'; ctx.beginPath(); ctx.moveTo(x - 4, y - r + 2); ctx.lineTo(x + 4, y - r + 2); ctx.lineTo(x, y - r - h); ctx.fill();
    ctx.fillStyle = wht ? '#ffffff' : '#f4ecd0'; ctx.beginPath(); ctx.moveTo(x - 1.5, y - r - h * .45); ctx.lineTo(x + 1.5, y - r - h * .45); ctx.lineTo(x, y - r - h); ctx.fill(); });
  const open = ['healw', 'healspit', 'spitw', 'spit', 'summon', 'strike', 'stun', 'coil'].includes(B.state);
  const img = (wht ? SPR.sheadW : SPR.shead)[open ? 'o' : 'c']; let hx = Math.round(B.x - cx), hy = Math.round(B.y - cy - 13 * SS);
  if (B.state === 'coil' || B.state === 'summon' || B.state === 'dying') hx += Math.round(Math.sin(gtime * 70) * 2);
  ctx.save(); ctx.translate(hx, hy); ctx.scale(B.dir * SS, SS); ctx.drawImage(img, -24, -16); ctx.restore();
  if (!open && B.state !== 'sleep' && (gtime % 1.2) < .25) { const tx = hx + B.dir * 18, ty = hy + 2; ctx.fillStyle = '#ff3b5c'; ctx.fillRect(Math.min(tx, tx + B.dir * 10), ty, 10, 1); ctx.fillRect(tx + B.dir * 10, ty - 2, 1, 2); ctx.fillRect(tx + B.dir * 10, ty + 1, 1, 2); }
  if (B.healGlob) { const q = B.healGlob, x = Math.round(q.x - cx), y = Math.round(q.y - cy), b = Math.sin(gtime * 6) * 1.5;
    if (q.landed) { ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(x, F, 21, 5.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff7ac8'; ctx.beginPath(); ctx.ellipse(x, F, 19, 4.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd0f0'; ctx.fillRect(x - 9, F - 2, 7, 1); ctx.drawImage(SPR.heart, x - 5, F - 24 + b, 11, 10); }
    else { ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#ff7ac8'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd8f2'; ctx.fillRect(x - 3, y - 3, 3, 3); } }
  if (B.state === 'healw') text('?', B.x - cx, B.y - cy - 46, { s: 3, color: '#ff9ad8', align: 'center' });
  for (const q of B.proj || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#9ae040'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ffb0'; ctx.fillRect(x - 2, y - 2, 2, 2); }
  if (B.state === 'coil' || B.state === 'leapw') text('!', hx, hy - 30, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'stun') { for (let i = 0; i < 3; i++) { const a = gtime * 6 + i * 2.1; text('★', hx + Math.cos(a) * 18, hy - 20 + Math.sin(a) * 5, { color: '#ffe45a' }); } if (Math.floor(gtime * 6) % 2) text('BATA!', hx, hy - 40, { s: 2, color: '#7cf05a', align: 'center' }); }
  if (B.state === 'sleep' && Math.abs(P.x - B.bx) < 460) { const z = (gtime % 1.5) / 1.5; text('Z', hx + 20 + z * 10, hy - 30 - z * 20, { s: 1 + Math.round(z), alpha: 1 - z }); }
}
// ---- dog (kitchen) ----
function drawPaw(x, y, s = 1) {
  const im = IMG.dpaw, w = im.width * s, h = im.height * s;
  ctx.drawImage(im, 0, 0, im.width, 24, Math.round(x - w / 2), Math.round(y - h - 700 * s), Math.round(w), Math.round(700 * s + 2));
  ctx.drawImage(im, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
}
function updatePaws(dt) {
  const D = G.dogP; if (!D) return; const L = G.L, F = (ROWS - 3 - BASE) * T;
  const active = P.x > L.splitX && G.fallDone && !(G.boss && G.boss.active) && P.x < G.boss.arenaL - 40 && !G.clear && G.deadT <= 0;
  if (active) { D.t -= dt; if (D.t <= 0 && D.steps.length === 0) { D.t = rnd(5.5, 7.5); const dir = Math.random() < .5 ? 1 : -1, x0 = G.camX + (dir > 0 ? 60 : W - 60); SFX.boom(); floatText('AU!', G.camX + W / 2, G.camY + 70, '#ffe45a', 3);
      for (let i = 0; i < 4; i++) D.steps.push({ x: x0 + dir * i * 150 + rnd(-20, 20), t: -i * .6, ph: 'wait' }); } }
  for (let i = D.steps.length - 1; i >= 0; i--) { const s = D.steps[i]; s.t += dt;
    if (s.ph === 'wait' && s.t >= 0) { s.ph = 'warn'; s.t = 0; SFX.tick(); }
    else if (s.ph === 'warn' && s.t >= .85) { s.ph = 'down'; s.t = 0; }
    else if (s.ph === 'down' && s.t >= .12 && !s.hit) { s.hit = true; SFX.boom(); fx.shake = Math.max(fx.shake, 7); dust(s.x - 40, F, 6, 1); dust(s.x + 40, F, 6, -1);
      if (Math.abs(P.x - s.x) < 50 && P.y > F - 30) { hurtPlayer(s.x, 2); P.vy = -360; }
      for (const e of G.enemies) if (!e.dead && !e.fly && Math.abs(e.x - s.x) < 50 && e.y > F - 20) damageEnemy(e, 99, Math.sign(e.x - s.x) || 1, 'paw'); }
    else if (s.ph === 'down' && s.t >= .6) { s.ph = 'up'; s.t = 0; }
    else if (s.ph === 'up' && s.t >= .35) D.steps.splice(i, 1); }
}
function drawPaws(cx, cy) {
  const D = G.dogP; if (!D) return; const F = (ROWS - 3 - BASE) * T - cy;
  for (const s of D.steps) { const x = s.x - cx; if (s.ph === 'wait') continue;
    if (s.ph === 'warn') { const k = s.t / .85; ctx.fillStyle = `rgba(0,0,0,${.15 + .3 * k})`; ctx.beginPath(); ctx.ellipse(x, F, 20 + 32 * k, 5 + 4 * k, 0, 0, 7); ctx.fill(); if (Math.floor(gtime * 12) % 2) text('!', x, F - 40, { s: 2, color: '#ff3b5c', align: 'center' }); drawPaw(x, F - 300 + 120 * k * k); }
    else if (s.ph === 'down') { const k = Math.min(1, s.t / .12); drawPaw(x, lerp(F - 180, F + 2, k)); }
    else { const k = s.t / .35; drawPaw(x, F + 2 - 340 * k * k); } }
}
function drawDogHead(x, y, s, look, open) {
  const M = ASSETS.dogpartsjson; if (open === undefined) open = .05 + Math.abs(Math.sin(gtime * 8)) * .06;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(-s, s); ctx.translate(-240, -165);
  const jx = M.djaw[0], jy = M.djaw[1] - 30;
  ctx.save(); ctx.translate(jx + 12, jy + 16); ctx.rotate(open); ctx.translate(-(jx + 12), -(jy + 16));
  ctx.drawImage(IMG.dtongue, Math.round(M.dtongue[0] - 70), Math.round(M.dtongue[1] - 70 + Math.sin(gtime * 10) * 3));
  ctx.drawImage(IMG.djaw, Math.round(jx), Math.round(jy));
  ctx.restore();
  ctx.drawImage(IMG.dhead, Math.round(M.dhead[0]), Math.round(M.dhead[1]));
  ctx.restore();
}
function drawDogBG(cx, cy) {
  const B = G.boss; if (!B || B.kind !== 'flea' || !B.dog) return;
  const F = B.floorY - cy, k = B.dog; const x = B.arenaR - cx - 150, y = F - 120 + (1 - k) * 340 + Math.sin(gtime * 2) * 4 + (B.scratch ? Math.sin(gtime * 50) * 6 : 0);
  drawDogHead(x, y, .9, 0, B.state === 'cut' && B.cphase === 1 ? .35 : undefined);
}
// ---- table fall cutscene ----
function updateHaz(dt) {
  for (const h of G.haz) { h.t = (h.t || 0) + dt;
    if (h.k === 'ball') { h.cd -= dt; const near = P.x > h.x0 - 120 && P.x < h.x1; if (near && h.cd <= 0) { h.cd = h.every; h.balls.push({ x: Math.min(h.x1, G.camX + W + 40), y: h.y, vx: -h.sp, rot: 0, by: 0, bv: 0 }); }
      for (let i = h.balls.length - 1; i >= 0; i--) { const b = h.balls[i]; b.x += b.vx * dt; b.rot += b.vx * dt / 22; b.bv += 900 * dt; b.by += b.bv * dt; if (b.by > 0) { b.by = 0; b.bv = -Math.abs(b.bv) * .45; } if (b.x < h.x0 - 60 || b.x < G.camX - 80) h.balls.splice(i, 1); } }
  }
}
function hazards(dt) {
  P.slow = false;
  for (const h of G.haz) {
    if (h.k === 'spike') { if (P.x + 6 > h.x0 && P.x - 6 < h.x1 && P.y > h.y - 12 && P.y - 30 < h.y) { if (!GOD.on && P.inv <= 0) { hurtPlayer(P.x - (P.vx || 1)); P.vy = -420; floatText('AI! TACHINHA!', P.x, P.y - 50, '#ff3b5c'); } } }
    else if (h.k === 'honey') { if (P.ground && P.x > h.x0 && P.x < h.x1 && Math.abs(P.y - h.y) < 4) { P.slow = true; if (Math.random() < .2) parts.push({ x: P.x + rnd(-6, 6), y: P.y - 2, vx: 0, vy: -20, life: .4, max: .4, c: '#ffc830', sz: 2, g: 60, k: 'sq' }); } }
    else if (h.k === 'pend') { const a = Math.sin(h.t * h.sp + h.ph) * h.amp, bx = h.x + Math.sin(a) * h.len, by = h.y + Math.cos(a) * h.len; if (Math.hypot(P.x - bx, (P.y - 18) - by) < 26) hurtPlayer(bx); }
    else if (h.k === 'ball') for (const b of h.balls) { const bx = b.x, by = h.y - 22 + b.by; if (Math.abs(P.x - bx) < 26 && P.y > by - 22 && P.y - 34 < by + 20) { if (P.vy > 40 && P.y < by - 6) { P.vy = K.jump ? -620 : -480; P.jumps = 1; SFX.stomp(); ring(P.x, P.y, '#e8ff70'); } else hurtPlayer(bx); } }
  }
}
function drawHazBack(cx, cy) {
  for (const h of G.haz) {
    if (h.k === 'bowl') { const b = IMG.kbowl; ctx.drawImage(b, Math.round(h.x - cx - b.width / 2), Math.round(h.y - cy - b.height + 6)); }
    if (h.k === 'honey') { const x0 = h.x0 - cx, x1 = h.x1 - cx, y = h.y - cy; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, y + 1, (x1 - x0) / 2 + 3, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#f0a818'; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2 + 1, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffe070'; ctx.fillRect(x0 + 8, y - 3, (x1 - x0) * .4, 2); ctx.fillStyle = '#f0a818'; for (let i = 0; i < 3; i++) { const dx = x0 + 10 + i * (x1 - x0 - 20) / 2, dl = 6 + Math.sin(gtime * 2 + i) * 3; ctx.fillRect(dx, y + 3, 3, dl); }
      if (Math.abs(P.x - (h.x0 + h.x1) / 2) < 140 && !G.honeyHint) text('MEL GRUDENTO', (x0 + x1) / 2, y - 26, { color: '#ffe070', align: 'center' }); }
    if (h.k === 'spike') { const x0 = Math.round(h.x0 - cx), x1 = Math.round(h.x1 - cx), y = Math.round(h.y - cy); ctx.fillStyle = '#4a4a58'; ctx.fillRect(x0, y - 3, x1 - x0, 3);
      for (let x = x0; x < x1 - 2; x += 8) { ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.moveTo(x - 1, y - 2); ctx.lineTo(x + 4, y - 15); ctx.lineTo(x + 9, y - 2); ctx.fill(); ctx.fillStyle = '#c8d0e0'; ctx.beginPath(); ctx.moveTo(x + 1, y - 3); ctx.lineTo(x + 4, y - 13); ctx.lineTo(x + 7, y - 3); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3, y - 10, 1, 5); } }
  }
}
function drawHazFront(cx, cy) {
  for (const h of G.haz) {
    if (h.k === 'pend') { const a = Math.sin(h.t * h.sp + h.ph) * h.amp, px = h.x - cx, py = h.y - cy, bx = px + Math.sin(a) * h.len, by = py + Math.cos(a) * h.len;
      ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke(); ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.sin(a) * h.len * .55, py + Math.cos(a) * h.len * .55); ctx.stroke(); ctx.strokeStyle = '#b8c0d0'; ctx.beginPath(); ctx.moveTo(px + Math.sin(a) * h.len * .55, py + Math.cos(a) * h.len * .55); ctx.lineTo(bx, by); ctx.stroke();
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-a); ctx.fillStyle = '#1a1020'; ctx.fillRect(-20, -6, 40, 38); ctx.fillStyle = '#c8d0e0'; ctx.fillRect(-18, -4, 36, 34); ctx.fillStyle = '#1a1020'; for (let i = -12; i <= 8; i += 10) ctx.fillRect(i, 2, 4, 22); ctx.fillStyle = '#ffffff'; ctx.fillRect(-16, -3, 3, 30); ctx.restore(); }
    if (h.k === 'ball') for (const b of h.balls) { const im = IMG.tball; ctx.save(); ctx.translate(Math.round(b.x - cx), Math.round(h.y - cy - 22 + b.by)); ctx.rotate(b.rot); ctx.drawImage(im, -22, -22); ctx.restore(); }
  }
}
function updateFall(dt) {
  const L = G.L, tableY = (ROWS - 9 - BASE) * T, edge = L.split * T;
  if (!G.fall && !G.fallDone && P.x > edge - 4.5 * T && G.deadT <= 0) {
    G.fall = { t: 0, ph: 0, dx: edge + 4 * T, dy: tableY + 260, sc: 1, tilt: 0 };
    P.ctrl = false; P.inv = 99; P.dashT = 0; P.punchT = -1;
    playSong(null);
  }
  const F = G.fall; if (!F) return;
  F.t += dt; const t = F.t;
  if (F.ph < 3) { P.vx = 0; P.dir = 1; }
  if (F.ph === 0) { F.dy = lerp(F.dy, tableY - 20, Math.min(1, dt * 3)); if (t > 1.3) { F.ph = 1; F.t2 = 0; } }
  else if (F.ph === 1) { F.t2 += dt; F.tilt = Math.sin(F.t2 * 6) * .08; F.dy = tableY - 20 + Math.sin(F.t2 * 10) * 4;
    if (F.t2 > .2 && !F.sn) { F.sn = 1; floatText('SNIF SNIF', F.dx - 60, tableY - 150, '#ffffff', 2); noise({ f: 1500, t: .5, v: .15 }); }
    if (F.t2 > 1.2 && !F.ex) { F.ex = 1; floatText('!!', P.x, P.y - 54, '#ff3b5c', 3); SFX.tick(); P.vy = -180; P.ground = false; }
    if (F.t2 > 1.7) { F.ph = 2; F.t2 = 0; SFX.roar(); fx.shake = 10; floatText('AU!', F.dx - 40, tableY - 170, '#ffe45a', 4); } }
  else if (F.ph === 2) { F.t2 += dt; F.tilt = 0; F.dy = tableY - 20 - Math.sin(Math.min(1, F.t2 / .5) * Math.PI) * 10;
    if (F.t2 > .6) { const k = Math.min(1, (F.t2 - .6) / .2); F.dx = lerp(edge + 4 * T, edge + 1 * T, k); F.sc = 1 + .15 * k; }
    if (F.t2 > .8 && F.ph === 2) { F.ph = 4; SFX.boom(); fx.shake = 9; ring(P.x + 10, P.y - 18, '#ffffff'); tone({ type: 'square', f: 900, f2: 200, t: 1.6, v: .12 }); G.fallScene = { t: 0, fy: 0, vy: -470, sx: 190, D: 1500, cam: -170, landed: false, lt: 0 }; P.scream = true; parts.length = 0; } }
  else if (F.ph === 3) { F.t2 = (F.t2 || 0) + dt; P.vx = 215; P.inv = 99; F.dy += 260 * dt; F.sc = lerp(F.sc, 1, dt * 4); F.dx = lerp(F.dx, edge + 4 * T, dt * 2);
    if (Math.random() < .3) parts.push({ x: P.x + rnd(-8, 8), y: P.y - 30, vx: 0, vy: -40, life: .4, max: .4, c: '#d8f0ff', sz: 2, g: 0, k: 'sq' });
    if (P.ground && P.x > edge + 8) { P.scream = false; P.vx = 0; G.fall = null; G.fallDone = true; P.ctrl = true; P.inv = 1.2; SFX.land(); dust(P.x, P.y, 10); fx.shake = 7; P.sx = 1.4; P.sy = .65;
      floatText('AI!', P.x, P.y - 56, '#ffffff', 2); CHK = { i: G.i, x: P.x, y: P.y }; G.intro = 1.6; playSong(G.th.song); } }
}
function updateFallScene(dt) {
  const S = G.fallScene; S.t += dt;
  if (!S.landed) { S.vy = Math.min(S.vy + 1150 * dt, 760); S.fy += S.vy * dt; S.sx = Math.min(360, S.sx + 75 * dt);
    if (Math.random() < .5) parts.push({ x: S.sx + rnd(-8, 8), y: S.fy - 30, vx: 0, vy: -60, life: .4, max: .4, c: '#d8f0ff', sz: 2, g: 0, k: 'sq' });
    if (S.fy >= S.D) { S.fy = S.D; S.landed = true; S.lt = 0; P.scream = false; SFX.land(); SFX.boom(); fx.shake = 12; for (let i = 0; i < 14; i++) parts.push({ x: S.sx + rnd(-14, 14), y: S.D - 2, vx: rnd(-90, 90), vy: rnd(-90, -20), life: .6, max: .6, c: 'rgba(240,225,200,0.85)', sz: rnd(2, 4), g: -30, k: 'puff' }); floatText('AI!', S.sx, S.D - 60, '#ffffff', 3); } }
  else { S.lt += dt; if (S.lt > 1) finishFall(); }
  S.cam = lerp(S.cam, clamp(S.fy - 175, -170, S.D - 270), Math.min(1, dt * 7));
}
function finishFall() {
  const L = G.L, edge = L.split * T; G.fallScene = null; G.fall = null; G.fallDone = true; P.scream = false;
  P.x = edge + 6 * T; P.y = (ROWS - 3 - BASE) * T; P.vx = 0; P.vy = 0; P.ground = true; P.ctrl = true; P.inv = 1.2; P.dir = 1;
  G.camX = Math.max(edge, clamp(P.x - W / 2, 0, L.len * T - W)); G.camY = ROWS * T - H; parts.length = 0;
  CHK = { i: G.i, x: P.x, y: P.y }; G.intro = 1.6; playSong(G.th.song);
}
function tileImg(img, x, y, w, h, ax, ay) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const iw = img.width, ih = img.height;
  const sx = ax + Math.floor((x - ax) / iw) * iw, sy = ay + Math.floor((y - ay) / ih) * ih;
  for (let yy = sy; yy < y + h; yy += ih) for (let xx = sx; xx < x + w; xx += iw) ctx.drawImage(img, Math.round(xx), Math.round(yy));
  ctx.restore();
}
function drawFallScene() {
  const S = G.fallScene, sh = fx.shake > .2 ? fx.shake : 0, cam = S.cam + rnd(-sh, sh), ox = rnd(-sh, sh);
  const bg = IMG.kfall, k = clamp((cam + 170) / (S.D - 100), 0, 1); ctx.drawImage(bg, Math.round(-213 + ox * .3), Math.round(-k * (bg.height - H)));
  ctx.fillStyle = 'rgba(30,10,30,0.22)'; ctx.fillRect(0, 0, W, H);
  const ty = -cam, O = '#1a1020';
  // leg + apron + top
  ctx.fillStyle = O; ctx.fillRect(196 + ox, ty + 40, 46, S.D - 40 + 4); tileImg(IMG.tex_mesa, 198 + ox, ty + 40, 42, S.D - 40, 0, ty); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(228 + ox, ty + 40, 12, S.D - 40); ctx.fillStyle = 'rgba(255,220,160,.25)'; ctx.fillRect(200 + ox, ty + 40, 4, S.D - 40);
  ctx.fillStyle = O; ctx.fillRect(-10 + ox, ty + 18, 272, 30); ctx.fillStyle = '#6a3416'; ctx.fillRect(-10 + ox, ty + 20, 270, 26); ctx.fillStyle = '#8a4a22'; ctx.fillRect(-10 + ox, ty + 20, 270, 4);
  ctx.fillStyle = O; ctx.fillRect(-10 + ox, ty - 4, 276, 26); tileImg(IMG.tex_mesa, -10 + ox, ty - 2, 274, 22, 0, ty); ctx.fillStyle = 'rgba(255,230,180,.45)'; ctx.fillRect(-10 + ox, ty - 2, 274, 2);
  // floor
  const fy = S.D - cam; if (fy < H + 10) { ctx.fillStyle = O; ctx.fillRect(0, fy - 2, W, 3); tileImg(IMG.tex_piso, 0, fy, W, H, 0, fy); const b = IMG.kbowl; ctx.drawImage(b, 440 + ox, Math.round(fy - b.height + 6)); }
  // speed lines
  if (!S.landed && S.vy > 250) { ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 14; i++) { const x = (i * 137 + 40) % W, y = ((i * 211 - S.fy * 1.6) % (H + 80) + H + 80) % (H + 80) - 40; ctx.fillRect(x, y, 2, 30 + (i % 3) * 12); } }
  // ant
  if (!S.landed) { const ox2 = P.x, oy2 = P.y; P.x = S.sx; P.y = S.fy - cam; drawScream(0, 0); P.x = ox2; P.y = oy2; }
  else { const sq = S.lt < .25 ? .6 + S.lt * 1.6 : 1; drawAnt(ANT.anims.hurt[S.lt < .5 ? 3 : 1], S.sx, S.fy - cam, 1, { sx: 2 - sq, sy: sq }); if (S.lt > .25) for (let i = 0; i < 3; i++) { const a = gtime * 6 + i * 2.1; text('★', S.sx + Math.cos(a) * 14, S.fy - cam - 46 + Math.sin(a) * 4, { color: '#ffe45a', align: 'center' }); } }
  drawParts(0, cam);
  drawHUD();
  if (fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${fx.flash * 2})`; ctx.fillRect(0, 0, W, H); }
}
function drawFallDog(cx, cy) {
  const F = G.fall, im = IMG.dfront; if (!F) return;
  const w = im.width * F.sc, h = im.height * F.sc;
  ctx.save(); ctx.translate(Math.round(F.dx - cx), Math.round(F.dy - cy)); ctx.rotate(F.tilt || 0); ctx.drawImage(im, Math.round(-w / 2), Math.round(-h / 2), Math.round(w), Math.round(h)); ctx.restore();
}
function drawScream(cx, cy) {
  const x = Math.round(P.x - cx), y = Math.round(P.y - cy), wob = Math.sin(gtime * 25) * .15;
  ctx.save(); ctx.translate(x, y - 24); ctx.rotate(wob); ctx.translate(-x, -(y - 24));
  for (const sgn of [-1, 1]) { const ax = x + sgn * 7, ay = y - 27, hx = x + sgn * (13 + Math.sin(gtime * 30 + sgn) * 2), hy = y - 47;
    ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = '#3a3c8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(hx, hy, 3.5, 0, 7); ctx.fill(); ctx.fillStyle = '#4a4ca0'; ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, 7); ctx.fill(); }
  drawAnt(ANT.anims.hurt[1], x, y, 1, {});
  ctx.restore();
  ctx.fillStyle = '#d8f0ff'; ctx.fillRect(x + 12, y - 44 + Math.round((gtime * 30) % 6), 2, 3); ctx.fillRect(x - 14, y - 40 + Math.round((gtime * 30 + 3) % 6), 2, 3);
  text('AAAAH!', x + Math.round(Math.sin(gtime * 40) * 1.5), y - 66, { s: 2, color: '#ffffff', align: 'center' });
}
function fleaBlob(B) { const n = Math.round(10 + 30 * Math.max(0, B.hp) / B.max), arr = []; for (let i = 0; i < n; i++) { const a = (i * 2.399) % 6.283, r = Math.sqrt((i + .5) / n); arr.push([Math.cos(a) * r, -Math.abs(Math.sin(a)) * r * (0.6 + .4 * ((i * 7) % 5) / 5), i]); } return arr; }
function startFleaCut(B) {
  B.state = 'cut'; B.ct = 0; B.dog = 0; B.cphase = 0; B.form = 0; P.ctrl = false; P.vx = 0; P.inv = 99; P.dashT = 0; P.punchT = -1; G.cutFleas = [];
  B.x = B.arenaR - 260; B.y = B.floorY; B.dir = -1;
}
function updateFleaCut(B, dt) {
  B.ct += dt; const t = B.ct, F = B.floorY; P.vx = 0;
  B.dog = Math.min(1, t / 1.2);
  if (B.cphase === 0 && t > 1.3) { B.cphase = 1; SFX.roar(); fx.shake = 10; floatText('AU! AU!', B.arenaR - 300, F - 260, '#ffe45a', 4); }
  if (B.cphase === 1 && t > 2.2) { B.cphase = 2; B.scratch = true; floatText('*COÇA COÇA*', B.arenaR - 200, F - 300, '#ffffff', 2); }
  if (B.cphase === 2) { if (Math.random() < dt * 30 && G.cutFleas.length < 40) G.cutFleas.push({ x: B.arenaR - 120 + rnd(-80, 60), y: F - 220 + rnd(-60, 60), vx: rnd(-300, -120), vy: rnd(-300, -100), done: false }); if (t > 4) { B.cphase = 3; B.scratch = false; } }
  for (const f of G.cutFleas) { if (f.done) continue; f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; const tx = B.x + rnd(-40, 40); if (f.y >= F - 8) { f.done = true; B.form = Math.min(1, B.form + 1 / 40); SFX.pop(); } }
  if (B.cphase === 3 && t > 4.6) { B.cphase = 4; B.form = 1; G.cutFleas = null; G.bossBanner = 2.4; SFX.roar(); fx.shake = 8; B.state = 'idle'; B.st = 1; P.ctrl = true; P.inv = 1; }
}
function updateFlea(B, dt) {
  if (B.state === 'cut') { updateFleaCut(B, dt); return; }
  const enr = B.hp <= B.max * .5, F = B.floorY, minX = B.arenaL + 70, maxX = B.arenaR - 70; G.loose = G.loose || [];
  const face = () => { B.dir = P.x > B.x ? 1 : -1; };
  if (!B.ground) { B.vy += 1500 * dt; B.y += B.vy * dt; B.x += B.vx * dt; if (B.y >= F) { B.y = F; B.vy = 0; B.ground = true; B.vx = 0; if (B.state === 'hop') { SFX.boom(); fx.shake = 8; B.sx = 1.3; B.sy = .7; dust(B.x - 40, F, 8, 1); dust(B.x + 40, F, 8, -1); const sp = enr ? 200 : 160; G.waves.push({ x: B.x - 50, y: F, dir: -1, sp, life: 1.5 }, { x: B.x + 50, y: F, dir: 1, sp, life: 1.5 }); B.state = 'tired'; B.st = enr ? 1.1 : 1.5; floatText('CANSOU!', B.x, F - 60, '#7cf05a', 2); } } }
  B.x = clamp(B.x, minX, maxX);
  for (let i = G.loose.length - 1; i >= 0; i--) { const f = G.loose[i]; f.t += dt;
    if (f.dead) { f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.y > F + 60) G.loose.splice(i, 1); continue; }
    if (f.back) { const dx = B.x - f.x, dy = (F - 20) - f.y, d = Math.hypot(dx, dy); f.x += dx / d * 340 * dt; f.y += dy / d * 340 * dt; if (d < 14) G.loose.splice(i, 1); continue; }
    f.vy += 1100 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.y >= F) { f.y = F; f.vy = -rnd(260, 420); f.vx = clamp((P.x - f.x) * 1.2, -170, 170) + rnd(-40, 40); }
    f.x = clamp(f.x, B.arenaL + 10, B.arenaR - 10);
    if (Math.abs(P.x - f.x) < 12 && f.y > P.y - 36 && f.y < P.y + 4 && G.deadT <= 0) { const atk = P.dashT > 0 || P.boost > 0 || (P.vy > 60 && f.y > P.y - 8); if (atk) { f.dead = true; f.vx = rnd(-100, 100); f.vy = -260; B.hp -= 1; B.flash = .1; SFX.kill(); burst(f.x, f.y, 6, ['#ffe45a', '#fff'], 160); floatText('+50', f.x, f.y - 10, '#ffe45a'); G.score += 50; if (P.vy > 60) P.vy = -380; if (B.hp <= 0) { B.hp = 1; } } else hurtPlayer(f.x); }
  }
  const pf = P.punchT >= 0 ? Math.floor(P.punchT / .28 * 8) : -1;
  if (pf >= 2 && pf <= 5) for (const f of G.loose) { if (f.dead || f.back || f.hit === P.punchId) continue; if (Math.abs(f.x - (P.x + P.dir * 18)) < 22 && f.y > P.y - 40 && f.y < P.y + 2) { f.hit = P.punchId; f.dead = true; f.vx = P.dir * 160; f.vy = -260; B.hp -= 1; B.flash = .1; SFX.kill(); burst(f.x, f.y, 6, ['#ffe45a', '#fff'], 160); G.score += 50; if (B.hp <= 0) B.hp = 1; } }
  switch (B.state) {
    case 'intro': case 'idle': face(); B.st -= dt; B.x += clamp(P.x - B.x, -40 * dt, 40 * dt); if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length];
      if (a === 'roll') { B.state = 'rollw'; B.st = enr ? .5 : .75; SFX.roar(); } else if (a === 'hop') { B.state = 'hopw'; B.st = .55; } else { B.state = 'scatter'; B.st = enr ? 4 : 3.5; const n = enr ? 9 : 7; for (let k = 0; k < n; k++) G.loose.push({ x: B.x + rnd(-40, 40), y: F - rnd(10, 40), vx: rnd(-200, 200), vy: -rnd(300, 500), t: 0 }); SFX.pop(); floatText('ESPALHOU!', B.x, F - 70, '#ff9a6a', 2); } } break;
    case 'rollw': face(); B.st -= dt; if (B.st <= 0) { B.state = 'roll'; B.vx = B.dir * (enr ? 270 : 220); } break;
    case 'roll': B.x += B.vx * dt; if (Math.random() < .6) dust(B.x - B.dir * 40, F, 1, B.dir); if (B.x <= minX || B.x >= maxX) { B.state = 'tired'; B.st = enr ? 1.1 : 1.5; fx.shake = 6; SFX.boom(); floatText('CANSOU!', B.x, F - 60, '#7cf05a', 2); } break;
    case 'hopw': face(); B.st -= dt; if (B.st <= 0) { B.state = 'hop'; B.ground = false; const tt = .95; B.vy = -1500 * tt / 2; B.vx = clamp((P.x - B.x) / tt, -320, 320); SFX.spring(); } break;
    case 'hop': break;
    case 'tired': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .4 : .7; } break;
    case 'scatter': B.st -= dt; if (B.st <= 0) { B.state = 'regroup'; B.st = 1.1; G.loose.forEach(f => { if (!f.dead) f.back = true; }); } break;
    case 'regroup': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .5; G.loose = G.loose.filter(f => f.dead); } break;
    case 'dying': if (!B.cleaned) { B.cleaned = true; G.loose.forEach(f => { f.dead = true; f.vy = -200; }); B.whimper = 1; } B.dog = Math.max(0, B.dog - dt * .5); bossDie(B, dt); break;
  }
}
function drawFlea(B, cx, cy) {
  if (B.state === 'dead') return; const F = B.floorY - cy;
  if (G.cutFleas) for (const f of G.cutFleas) if (!f.done) ctx.drawImage(SPR.flea[Math.floor(gtime * 20) % 2], Math.round(f.x - cx - 6), Math.round(f.y - cy - 6));
  for (const f of G.loose || []) ctx.drawImage(SPR.flea[Math.floor(gtime * 16 + f.x) % 2], Math.round(f.x - cx - 6), Math.round(f.y - cy - 10));
  if (B.state === 'scatter' || B.state === 'sleep') return;
  const form = B.state === 'cut' ? B.form : B.state === 'regroup' ? .4 + .6 * (1 - B.st / 1.1) : 1; if (form <= 0) return;
  const bsc = (.55 + .45 * Math.max(0, B.hp) / B.max), w = B.w * bsc / 2, h = B.h * bsc * 1.15;
  const x = B.x - cx, y = B.y - cy;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, F, w + 6, 6, 0, 0, 7); ctx.fill();
  const pts = fleaBlob(B), n = Math.ceil(pts.length * form); const tremble = B.state === 'rollw' || B.state === 'hopw' ? 2 : 1;
  for (let i = 0; i < n; i++) { const [u, v, k] = pts[i]; const jx = Math.sin(gtime * 9 + k) * tremble * 1.5, jy = Math.abs(Math.sin(gtime * 11 + k * 1.7)) * (B.state === 'roll' ? 6 : 3);
    const im = B.flash > 0 ? SPR.fleaW : SPR.flea[Math.floor(gtime * 14 + k) % 2]; ctx.save(); ctx.translate(Math.round(x + u * w * B.sx + jx), Math.round(y + v * h * B.sy - jy - 4)); ctx.scale(B.state === 'roll' ? B.dir : (k % 2 ? 1 : -1), 1); ctx.drawImage(im, -6, -6); ctx.restore(); }
  if (B.state === 'rollw' || B.state === 'hopw') text('!', x, y - h - 20, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'tired') { for (let i = 0; i < 3; i++) { const a = gtime * 5 + i * 2.1; text('★', x + Math.cos(a) * 26, y - h - 10 + Math.sin(a) * 5, { color: '#ffe45a' }); } if (Math.floor(gtime * 6) % 2) text('BATA!', x, y - h - 30, { s: 2, color: '#7cf05a', align: 'center' }); }
  if (B.state === 'scatter') text('PISE NAS PULGAS!', x, F - 90, { color: '#ffe45a', align: 'center' });
}
// ---- rat boss (sewer) ----
function startRatCut(B) {
  B.state = 'cut'; B.ct = 0; B.cphase = 0; P.ctrl = false; P.vx = 0; P.inv = 99; P.dashT = 0; P.punchT = -1;
  B.tx = B.arenaR - 200; B.x = B.arenaR + 260; B.y = B.floorY; B.dir = -1; B.onPoop = true; G.clouds = []; B.proj = [];
}
function updateRatCut(B, dt) {
  B.ct += dt; const t = B.ct, F = B.floorY; P.vx = 0;
  if (B.cphase === 0) { B.x = lerp(B.arenaR + 260, B.tx, Math.min(1, t / 1.8)); if (Math.random() < .8) parts.push({ x: B.x + 50, y: F - 4, vx: rnd(40, 160), vy: rnd(-160, -40), life: .5, max: .5, c: ['#7a9a2a', '#b0d040', '#5a7020'][Math.floor(Math.random() * 3)], sz: 3, g: 600, k: 'sq' }); if (t > 1.9) { B.cphase = 1; SFX.splash(); fx.shake = 6; floatText('HEHEHE...', B.x, F - 150, '#9ae040', 2); } }
  if (B.cphase === 1 && t > 3) { B.cphase = 2; B.onPoop = false; B.squat = true; floatText('*PRRRT*', B.x - 30, F - 90, '#9ae040', 3); tone({ type: 'sawtooth', f: 80, f2: 50, t: .7, v: .35 }); noise({ f: 300, type: 'lowpass', t: .7, v: .4 }); G.clouds.push({ x: B.x + 20, y: F - 30, r: 0, life: 1.8, harmless: true }); }
  if (B.cphase === 2 && t > 4.3) { B.cphase = 3; B.squat = false; G.bossBanner = 2.4; SFX.roar(); fx.shake = 8; B.state = 'idle'; B.st = .8; P.ctrl = true; P.inv = 1; }
}
function updateRat(B, dt) {
  const F = B.floorY; G.clouds = G.clouds || []; B.proj = B.proj || [];
  for (let i = G.clouds.length - 1; i >= 0; i--) { const c = G.clouds[i]; c.life -= dt; c.r = Math.min(c.max || 95, c.r + 260 * dt); if (Math.random() < .7) parts.push({ x: c.x + rnd(-c.r, c.r), y: c.y + rnd(-c.r * .6, c.r * .4), vx: rnd(-20, 20), vy: rnd(-40, -10), life: .7, max: .7, c: ['rgba(150,210,60,.6)', 'rgba(110,170,40,.5)'][i % 2], sz: rnd(3, 6), g: -10, k: 'puff' });
    if (!c.harmless && Math.hypot(P.x - c.x, (P.y - 18) - c.y) < c.r * .85) hurtPlayer(c.x); if (c.life <= 0) G.clouds.splice(i, 1); }
  for (let i = B.proj.length - 1; i >= 0; i--) { const q = B.proj[i]; q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot = (q.rot || 0) + dt * 10;
    if (Math.abs(P.x - q.x) < 14 && q.y > P.y - 38 && q.y < P.y + 4) { hurtPlayer(q.x); B.proj.splice(i, 1); continue; }
    if (q.y >= F - 4) { SFX.splash(); for (let k = 0; k < 10; k++) parts.push({ x: q.x, y: F - 3, vx: rnd(-110, 110), vy: rnd(-220, -60), life: .5, max: .5, c: k % 3 ? '#7a4a1e' : '#ffd040', sz: 3, g: 700, k: 'sq' }); B.proj.splice(i, 1); } }
  if (B.state === 'cut') { updateRatCut(B, dt); return; }
  if (B.state !== 'dying' && B.state !== 'dead' && Math.random() < dt * 8) parts.push({ x: B.x + rnd(-40, 40), y: B.y - rnd(20, 100), vx: rnd(-15, 15), vy: rnd(-50, -20), life: .9, max: .9, c: 'rgba(160,220,70,.55)', sz: rnd(3, 5), g: -10, k: 'puff' });
  const enr = B.hp <= B.max * .5, minX = B.arenaL + 60, maxX = B.arenaR - 60, face = () => { B.dir = P.x > B.x ? 1 : -1; };
  if (!B.ground) { B.vy += 1500 * dt; B.y += B.vy * dt; B.x = clamp(B.x + B.vx * dt, minX, maxX); if (B.y >= F) { B.y = F; B.vy = 0; B.ground = true; B.vx = 0;
      if (B.state === 'slam') { SFX.boom(); SFX.splash(); fx.shake = 11; B.sx = 1.25; B.sy = .75; for (let k = 0; k < 20; k++) parts.push({ x: B.x + B.dir * 30 + rnd(-30, 30), y: F - 4, vx: rnd(-200, 200), vy: rnd(-350, -100), life: .6, max: .6, c: k % 3 ? '#7a4a1e' : '#ffd040', sz: 3, g: 800, k: 'sq' });
        const sp = enr ? 210 : 170; G.waves.push({ x: B.x - 70, y: F, dir: -1, sp, life: 1.6 }, { x: B.x + 70, y: F, dir: 1, sp, life: 1.6 }); if (Math.abs(P.x - (B.x + B.dir * 30)) < 60 && P.y > F - 60) hurtPlayer(B.x, 2);
        B.state = 'stuckP'; B.st = enr ? 1.3 : 1.7; floatText('COCÔ PRESO!', B.x, F - 130, '#7cf05a', 2); } } }
  else B.x = clamp(B.x, minX, maxX);
  switch (B.state) {
    case 'idle': face(); B.st -= dt; B.x += clamp(P.x - B.x, -45 * dt, 45 * dt); if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length];
      if (a === 'slam') { B.state = 'slamw'; B.st = enr ? .5 : .7; SFX.roar(); } else if (a === 'throw') { B.state = 'throww'; B.st = .5; } else if (a === 'fart') { B.state = 'fartw'; B.st = enr ? .6 : .85; } else { B.state = 'surfw'; B.st = .6; B.onPoop = true; } } break;
    case 'slamw': face(); B.st -= dt; if (B.st <= 0) { B.state = 'slam'; B.ground = false; const tt = .8; B.vy = -1500 * tt / 2; B.vx = clamp((P.x - B.dir * 30 - B.x) / tt, -300, 300); SFX.spring(); } break;
    case 'slam': break;
    case 'stuckP': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .4 : .7; } break;
    case 'throww': face(); B.st -= dt; if (B.st <= 0) { const n = enr ? 4 : 3, hx = B.x + B.dir * 30, d = P.x - hx; for (let k = 0; k < n; k++) { const f = .55 + .8 * k / Math.max(1, n - 1); B.proj.push({ x: hx, y: F - 110, vx: clamp(d * f / 1, -420, 420) || B.dir * 120, vy: -380 }); } SFX.dash(); B.state = 'throw'; B.st = .5; } break;
    case 'throw': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break;
    case 'fartw': B.st -= dt; B.squat = true; if (B.st <= 0) { B.squat = false; G.clouds.push({ x: B.x - B.dir * 10, y: F - 40, r: 10, max: enr ? 120 : 100, life: enr ? 2.6 : 2.2 }); tone({ type: 'sawtooth', f: 90, f2: 45, t: .8, v: .4 }); noise({ f: 260, type: 'lowpass', t: .8, v: .5 }); fx.shake = 6; floatText('PUUUM!', B.x, F - 150, '#9ae040', 3); B.state = 'relief'; B.st = 1.2; } break;
    case 'relief': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break;
    case 'surfw': face(); B.st -= dt; if (B.st <= 0) { B.state = 'surf'; B.vx = B.dir * (enr ? 330 : 270); SFX.dash(); } break;
    case 'surf': B.x += B.vx * dt; if (Math.random() < .8) parts.push({ x: B.x - B.dir * 40, y: F - 4, vx: -B.dir * rnd(40, 140), vy: rnd(-140, -40), life: .4, max: .4, c: '#7a9a2a', sz: 3, g: 600, k: 'sq' }); if (B.x <= minX || B.x >= maxX) { B.onPoop = false; B.state = 'idle'; B.st = .6; fx.shake = 5; SFX.boom(); } break;
    case 'dying': if (!B.cleaned) { B.cleaned = true; B.proj.length = 0; G.clouds.length = 0; } bossDie(B, dt); break;
  }
}
function drawRat(B, cx, cy) {
  if (B.state === 'dead' || B.state === 'sleep') return; const F = B.floorY - cy;
  for (const c of G.clouds || []) { const a = clamp(c.life, 0, 1) * .45; ctx.fillStyle = `rgba(140,200,50,${a})`; for (let k = 0; k < 5; k++) { const ang = gtime * 1.5 + k * 1.26; ctx.beginPath(); ctx.arc(c.x - cx + Math.cos(ang) * c.r * .35, c.y - cy + Math.sin(ang) * c.r * .2, c.r * .6, 0, 7); ctx.fill(); } }
  let x = Math.round(B.x - cx), y = Math.round(B.y - cy); if (B.state === 'slamw' || B.state === 'fartw' || B.state === 'dying') x += Math.round(Math.sin(gtime * 70) * 2);
  ctx.strokeStyle = `rgba(150,220,60,${.35 + Math.sin(gtime * 4) * .12})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 60, 80 + Math.sin(gtime * 3) * 5, 74 + Math.cos(gtime * 3.4) * 5, 0, 0, 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,230,70,.6)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { const sx = x - 30 + k * 30, ph = gtime * 3 + k; ctx.beginPath(); for (let j = 0; j < 6; j++) { const yy = y - 140 - j * 6 - (gtime * 20 % 12); const xx = sx + Math.sin(ph + j) * 4; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, F, 70 * (B.ground ? 1 : .7), 6, 0, 0, 7); ctx.fill();
  const W_ = B.flash > 0, up = B.state === 'slamw' || B.state === 'slam' || B.state === 'throww';
  const rat = (W_ ? SPR.ratBW : SPR.ratB)[up ? 'u' : 's'], pp = SPR.poop;
  const sq = B.squat ? .85 : 1;
  if (B.onPoop) { ctx.save(); ctx.translate(x, y); ctx.scale(B.dir, 1); ctx.drawImage(pp, -pp.width / 2, -pp.height + 4); ctx.drawImage(rat, -rat.width / 2, -pp.height - rat.height + 26); ctx.restore(); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(B.dir * B.sx, B.sy * sq); ctx.drawImage(rat, -rat.width / 2 - 10, -rat.height + 2);
  if (up) ctx.drawImage(pp, -pp.width / 2 - 10, -rat.height - pp.height + 40);
  else if (B.state === 'stuckP' || B.state === 'slam') ctx.drawImage(pp, 10, -pp.height + 6);
  else { ctx.save(); ctx.scale(.55, .55); ctx.drawImage(pp, 40, -pp.height - 60); ctx.restore(); }
  ctx.restore();
  for (const q of B.proj || []) { const qx = Math.round(q.x - cx), qy = Math.round(q.y - cy); ctx.save(); ctx.translate(qx, qy); ctx.rotate(q.rot || 0); ctx.scale(.28, .28); ctx.drawImage(pp, -pp.width / 2, -pp.height / 2); ctx.restore(); }
  if (B.state === 'slamw' || B.state === 'fartw' || B.state === 'surfw') text('!', x, y - 190, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'stuckP' || B.state === 'relief') { if (Math.floor(gtime * 6) % 2) text('BATA!', x, y - 170, { s: 2, color: '#7cf05a', align: 'center' }); if (B.state === 'relief') text('AHHH...', x + B.dir * 50, y - 140, { color: '#ffffff', align: 'center' }); }
}
// ---- bath bubbles (bonus) ----
function updateBath(dt) {
  const M = G.movers; if (!M) return;
  for (const m of M) {
    m.t = (m.t || 0) + dt;
    if (m.kind === 'bub' || m.kind === 'sw') { if (m.popped) { m.resp -= dt; if (m.resp <= 0 && (m.kind !== 'sw' || !m.lock)) { m.popped = false; m.grow = 0; } continue; } m.grow = Math.min(1, (m.grow ?? 1) + dt * 3);
      if (m.rise) { m.y -= m.rise * dt; if (m.y < m.top) { m.popped = true; m.resp = .01; m.y = m.y0; sparkle(m.x, m.top, '#ffffff'); } } else m.y = m.y0 + Math.sin(m.t * (m.sp || 1.6) + m.ph) * (m.amp || 6);
      const pf = P.punchT >= 0 ? Math.floor(P.punchT / .28 * 8) : -1;
      if (m.kind === 'sw' && pf >= 2 && pf <= 5 && Math.abs(P.x + P.dir * 18 - m.x) < 26 && Math.abs(P.y - 20 - m.y) < 26) popBub(m, false); }
    if (m.kind === 'foam' && m.on) { m.left -= dt; if (m.left <= 0) { m.on = false; SFX.pop(); for (const o of M) if (o.kind === 'sw' && o.id === m.by) o.lock = false; } }
    if (m.kind === 'stream') { m.cd -= dt; if (m.cd <= 0) { m.cd = m.every; M.push({ kind: 'bub', x: m.x + rnd(-6, 6), y0: m.y, y: m.y, top: m.top, rise: m.rise, r: 14, once: true, grow: 0 }); } }
  }
  for (let i = M.length - 1; i >= 0; i--) if (M[i].once && M[i].popped) M.splice(i, 1);
}
function popBub(m, bounce) {
  m.popped = true; m.resp = m.kind === 'sw' ? 99 : 2.2; SFX.pop(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; parts.push({ x: m.x + Math.cos(a) * m.r, y: m.y + Math.sin(a) * m.r, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, life: .35, max: .35, c: '#e8f4ff', sz: 2, g: 0, k: 'sq' }); }
  if (bounce) { P.vy = K.jump || K.up ? -620 : -540; P.jumps = 1; P.airDash = true; P.ground = false; P.sx = .7; P.sy = 1.35; G.score += 20; }
  if (m.kind === 'sw') { m.lock = true; SFX.powerup(); fx.flash = .1; let n = 0; for (const o of G.movers) if (o.kind === 'foam' && o.by === m.id) { o.on = true; o.left = o.dur; o.spawnT = 0; n++; } floatText('ESPUMA! CORRA!', m.x, m.y - 30, '#ffe45a', 2); }
}
function moverCollide(prevB) {
  const M = G.movers;
  if (M && G.deadT <= 0) {
    for (const m of M) {
      if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped && P.vy > 0) { const top = m.y - m.r * (m.grow ?? 1); if (Math.abs(P.x - m.x) < m.r + 7 && prevB <= top + 8 && P.y >= top - 2) { P.y = top; popBub(m, true); return; } }
      if (m.kind === 'foam' && m.on && P.vy >= 0 && P.x > m.x0 - 4 && P.x < m.x1 + 4 && prevB <= m.y + 2 && P.y >= m.y) { P.y = m.y; P.vy = 0; P.ground = true; }
    }
  }
  if (G.crumbs && G.deadT <= 0) {
    for (const c of G.crumbs) {
      if (!c.dead && P.vy >= 0 && P.x >= c.x - 4 && P.x <= c.x + c.w + 4 && prevB <= c.y + 2 && P.y >= c.y) {
        P.y = c.y; P.vy = 0; P.ground = true;
      }
    }
  }
}
function updateLevelGimmicks(dt) {
  if (G.deadT > 0) return;
  // springs
  if (G.springs) {
    for (const s of G.springs) {
      if (s.squish > 0) s.squish -= dt;
      if (Math.abs(P.x - s.x) < 18 && P.y >= s.y - 14 && P.y <= s.y + 10 && P.vy >= 0) {
        P.vy = -s.power; P.ground = false; P.airDash = true; P.jumps = 1; P.sx = 0.65; P.sy = 1.45;
        s.squish = 0.3; SFX.spring(); ring(s.x, s.y - 4, '#ff8ae0'); dust(s.x, s.y, 6);
      }
    }
  }
  // checkpoints
  if (G.checkpoints) {
    for (const cp of G.checkpoints) {
      if (!cp.active && Math.abs(P.x - cp.x) < 22 && Math.abs(P.y - cp.y) < 34) {
        cp.active = true; CHK = { i: G.i, x: cp.x, y: cp.y }; P.hp = Math.min(MAXHP, P.hp + 2);
        SFX.heal(); floatText('CHECKPOINT!', cp.x, cp.y - 40, '#ffe45a', 2); confettiSmall(cp.x, cp.y - 25);
      }
    }
  }
  // baby ants
  if (G.babies) {
    for (const b of G.babies) {
      if (b.got) continue;
      if (Math.abs(P.x - b.x) < 20 && Math.abs(P.y - 16 - b.y) < 24) {
        b.got = true; G.babiesGot = (G.babiesGot || 0) + 1; G.score += 500;
        SFX.fanfare(); floatText('BEBÊ RESGATADO! (' + G.babiesGot + '/3)', b.x, b.y - 28, '#ffe45a', 2);
        confetti(b.x, b.y - 16, 25);
      }
    }
  }
  // crumbs
  if (G.crumbs) {
    for (const c of G.crumbs) {
      if (c.dead) { c.resp -= dt; if (c.resp <= 0) { c.dead = false; c.shake = 0; } continue; }
      const onTop = P.ground && P.x >= c.x - 4 && P.x <= c.x + c.w + 4 && Math.abs(P.y - c.y) < 6;
      if (onTop) {
        c.shake += dt;
        if (c.shake > 0.65) {
          c.dead = true; c.resp = 3.0; SFX.land();
          for (let i = 0; i < 8; i++) parts.push({ x: c.x + rnd(0, c.w), y: c.y, vx: rnd(-30, 30), vy: rnd(20, 100), life: 0.5, max: 0.5, c: '#a27040', sz: 2, g: 300, k: 'sq' });
        }
      } else if (c.shake > 0) c.shake = Math.max(0, c.shake - dt * 0.5);
    }
  }
  // switches
  if (G.switches) {
    for (const sw of G.switches) {
      if (sw.timer > 0) {
        sw.timer -= dt;
        if (sw.timer <= 0) {
          sw.on = false;
          for (let xx = sw.gx; xx < sw.gx + sw.gw; xx++) for (let yy = ROWS - sw.gh - sw.ghh; yy < ROWS - sw.gh; yy++) G.L.grid[yy][xx] = 1;
          SFX.tick();
        }
      }
      const pf = P.punchT >= 0 ? Math.floor(P.punchT / .28 * 8) : -1;
      if (!sw.on && pf >= 1 && pf <= 5 && Math.abs(P.x + P.dir * 16 - sw.x) < 22 && Math.abs(P.y - 18 - sw.y) < 22) {
        sw.on = true; sw.timer = 7.0;
        for (let xx = sw.gx; xx < sw.gx + sw.gw; xx++) for (let yy = ROWS - sw.gh - sw.ghh; yy < ROWS - sw.gh; yy++) G.L.grid[yy][xx] = 0;
        SFX.powerup(); fx.flash = .1; floatText('PORTÃO ABERTO! (7s)', sw.x, sw.y - 24, '#7ff0ff', 2);
      }
    }
  }
  // secrets
  if (G.secrets) {
    const pBox = { l: P.x + (P.dir > 0 ? 0 : -26), r: P.x + (P.dir > 0 ? 26 : 0), t: P.y - 32, b: P.y };
    for (const s of G.secrets) {
      if (s.broken) continue;
      const sx0 = s.x0 * T, sx1 = (s.x0 + s.w) * T, sy0 = (ROWS - s.hb - s.hh) * T, sy1 = (ROWS - s.hb) * T;
      const hit = pBox.r > sx0 && pBox.l < sx1 && pBox.b > sy0 && pBox.t < sy1;
      if (hit && (P.punchT >= 0 || P.boost > 0) && (s.hitId !== P.punchId || P.boost > 0)) {
        s.hitId = P.punchId; s.hp -= P.boost > 0 ? 3 : 1;
        SFX.hit(); fx.shake = 3; hitSpark(P.x + P.dir * 14, P.y - 18, '#ffe45a');
        for (let i = 0; i < 6; i++) parts.push({ x: rnd(sx0, sx1), y: rnd(sy0, sy1), vx: rnd(-60, 60), vy: rnd(-100, -20), life: .4, max: .4, c: '#a26630', sz: 2, g: 300, k: 'sq' });
        if (s.hp <= 0) {
          s.broken = true;
          for (let xx = s.x0; xx < s.x0 + s.w; xx++) for (let yy = ROWS - s.hb - s.hh; yy < ROWS - s.hb; yy++) G.L.grid[yy][xx] = 0;
          SFX.boom(); fx.shake = 6; floatText('SEGREDO!', s.x, sy0 - 12, '#ffe45a', 2); confettiSmall(s.x, sy0);
        }
      }
    }
  }
}
function drawBath(cx, cy) {
  const M = G.movers; if (!M) return;
  for (const m of M) {
    if (m.kind === 'foam') { const x0 = m.x0 - cx, x1 = m.x1 - cx, y = m.y - cy; if (!m.on) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([4, 4]); ctx.strokeRect(x0, y, x1 - x0, 6); ctx.setLineDash([]); continue; }
      if (m.left < 1.5 && Math.floor(gtime * 10) % 2) continue; const im = IMG.foam; for (let xx = x0 - 8; xx < x1; xx += im.width - 18) ctx.drawImage(im, Math.round(xx), Math.round(y - 10));
      const k = m.left / m.dur; ctx.fillStyle = '#1a1020'; ctx.fillRect(x0, y - 22, x1 - x0, 4); ctx.fillStyle = k > .3 ? '#7ff0ff' : '#ff3b5c'; ctx.fillRect(x0 + 1, y - 21, (x1 - x0 - 2) * k, 2); }
    if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped) { const x = m.x - cx, y = m.y - cy, r = Math.max(4, m.r * (m.grow ?? 1)); const gold = m.kind === 'sw';
      ctx.fillStyle = gold ? 'rgba(255,220,90,.35)' : 'rgba(200,230,255,.28)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.strokeStyle = gold ? '#ffd040' : 'rgba(240,250,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,140,220,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r - 3, 2.2, 3.6); ctx.stroke(); ctx.strokeStyle = 'rgba(120,230,255,.6)'; ctx.beginPath(); ctx.arc(x, y, r - 3, 5.4, 6.2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - r * .45), Math.round(y - r * .55), 4, 3); ctx.fillRect(Math.round(x - r * .2), Math.round(y - r * .7), 2, 2);
      if (gold) { text('!', x, y - 4, { color: '#ffd040', align: 'center' }); } }
  }
}
function startFrogCut(B) {
  B.state = 'cut'; B.ct = 0; B.fake = true; B.name = 'REI DAS MOSCAS'; B.nameCol = '#c8d0ff'; B.hidden = true; B.cphase = 0;
  P.ctrl = false; P.vx = 0; P.inv = 99; P.dashT = 0; P.punchT = -1;
  const fx0 = B.arenaR - 130, cx = Math.max(P.x + 140, fx0 - 190), F = B.floorY, fl = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; fl.push({ x: B.arenaR + rnd(20, 200), y: F - rnd(40, 260), hx: cx + Math.cos(a) * rnd(55, 110), hy: F - 140 + Math.sin(a) * rnd(35, 70), ph: rnd(0, 6), king: false, eaten: false, t: 0 }); }
  fl.push({ x: cx, y: G.camY - 60, hx: cx, hy: F - 150, ph: 0, king: true, eaten: false, t: 0 });
  G.cutFlies = fl; B.x = fx0; B.y = F + 260; B.dir = -1;
  noise({ f: 2500, t: 1.5, v: .08, q: 8 });
}
function updateFrogCut(B, dt) {
  B.ct += dt; const t = B.ct, F = B.floorY; P.vx = 0;
  for (const f of G.cutFlies) {
    if (f.eaten) continue; f.t += dt;
    if (!f.suck) { const wx = f.hx + Math.sin(f.t * 3 + f.ph) * (f.king ? 6 : 14), wy = f.hy + Math.cos(f.t * 4.3 + f.ph) * (f.king ? 5 : 10); f.x = lerp(f.x, wx, Math.min(1, dt * (f.king ? 2.2 : 3))); f.y = lerp(f.y, wy, Math.min(1, dt * (f.king ? 2.2 : 3))); }
    else { const mx = B.x + B.dir * 100, my = B.y - 75; f.x = lerp(f.x, mx, Math.min(1, dt * 9)); f.y = lerp(f.y, my, Math.min(1, dt * 9)); if (Math.hypot(f.x - mx, f.y - my) < 12) { f.eaten = true; SFX.pop(); sparkle(mx, my, '#ffffff'); } }
    if (Math.random() < dt * 3) noise({ f: 2200 + Math.random() * 800, t: .08, v: .02, q: 10 });
  }
  const K = G.cutFlies.find(f => f.king);
  if (B.cphase === 0 && t > .7) { B.cphase = 1; G.bossBanner = 2.2; SFX.roar(); }
  if (B.cphase === 1 && t > 2.6) { B.cphase = 2; floatText('BZZZ! EU SOU O CHEFE!', K.x, K.y - 34, '#c8d0ff', 2); SFX.tick(); }
  if (B.cphase === 2 && t > 3.9) { B.cphase = 3; B.hidden = false; B.vy = -1050; B.ground = false; SFX.splash(); SFX.spring(); for (let i = 0; i < 30; i++) parts.push({ x: B.x + rnd(-60, 60), y: F, vx: rnd(-200, 200), vy: rnd(-500, -150), life: .8, max: .8, c: ['#bfe8ff', '#6a4a2a', '#9ac0c0'][i % 3], sz: rnd(2, 5), g: 800, k: 'sq' }); }
  if (B.cphase === 3) { B.vy += 1600 * dt; B.y += B.vy * dt; if (B.vy > 0 && B.y >= F) { B.y = F; B.vy = 0; B.ground = true; B.cphase = 4; B.ct2 = 0; SFX.boom(); fx.shake = 12; B.sx = 1.3; B.sy = .7; dust(B.x - 80, F, 10, 1); dust(B.x + 80, F, 10, -1); floatText('?!', K.x, K.y - 30, '#ffe45a', 3); } }
  if (B.cphase === 4) { B.ct2 += dt; if (B.ct2 > .5) { B.cphase = 5; B.ct2 = 0; B.mouth = true; SFX.dash(); noise({ f: 900, t: .7, v: .2 }); G.cutFlies.forEach((f, i) => setTimeout(() => f.suck = true, i * 25)); } }
  if (B.cphase === 5) { B.ct2 += dt; if (G.cutFlies.every(f => f.eaten) || B.ct2 > 1.6) { G.cutFlies.forEach(f => f.eaten = true); B.cphase = 6; B.ct2 = 0; B.mouth = false; SFX.boom(); floatText('GULP!', B.x + B.dir * 60, B.y - 170, '#7cf05a', 4); B.sx = 1.25; B.sy = 1.3; fx.shake = 6; } }
  if (B.cphase === 6) { B.ct2 += dt; B.sx = lerp(B.sx, 1, dt * 2); B.sy = lerp(B.sy, 1, dt * 2); if (B.ct2 > .9 && !B.burp) { B.burp = true; floatText('*ARROTO*', B.x + B.dir * 90, B.y - 120, '#ffffff', 2); tone({ type: 'sawtooth', f: 90, f2: 60, t: .4, v: .25 }); }
    if (B.ct2 > 1.8) { B.fake = false; B.name = 'SAPO GIGANTE'; B.nameCol = '#7cf05a'; G.bossBanner = 2.4; SFX.roar(); fx.shake = 8; B.state = 'intro'; B.st = 1.4; P.ctrl = true; P.inv = 1; G.cutFlies = null; } }
}
function updateFrog(B, dt) {
  if (B.state === 'cut') { updateFrogCut(B, dt); return; }
  const enr = B.hp <= B.max * .5, dx = P.x - B.x, F = B.floorY;
  const face = () => { B.dir = dx > 0 ? 1 : -1; };
  if (!B.ground && B.state !== 'air') B.vy += 1600 * dt;
  if (B.state !== 'air') { B.x += B.vx * dt; B.y += B.vy * dt; }
  const minX = B.arenaL + 130, maxX = B.arenaR - 130; B.x = clamp(B.x, minX, maxX);
  const mud = (x, n, sp = 240) => { for (let i = 0; i < n; i++) parts.push({ x: x + rnd(-20, 20), y: F - 2, vx: rnd(-sp, sp) * .7, vy: rnd(-sp * 1.6, -sp * .4), life: rnd(.4, .8), max: .8, c: ['#6a4a2a', '#8a6a3a', '#4a6a6a', '#9ac0c0'][i % 4], sz: rnd(2, 5), g: 800, k: 'sq' }); };
  if (!B.ground && B.vy >= 0 && B.y >= F && B.state !== 'air') {
    B.y = F; B.vy = 0; B.ground = true; B.vx = 0;
    if (B.state === 'slam') { SFX.boom(); SFX.boom(); fx.shake = 12; B.sx = 1.35; B.sy = .65; mud(B.x - 80, 20); mud(B.x + 80, 20); ring(B.x, F - 10, '#ffffff');
      const sp = enr ? 230 : 180; G.waves.push({ x: B.x - 125, y: F, dir: -1, sp, life: 1.8 }, { x: B.x + 125, y: F, dir: 1, sp, life: 1.8 });
      if (Math.abs(P.x - B.x) < 88 && P.y > F - 120) hurtPlayer(B.x, 2);
      B.state = 'dazed'; B.st = enr ? 1.3 : 1.7; floatText('TONTO!', B.x, F - 150, '#7cf05a', 2); }
    else { SFX.land(); fx.shake = 4; }
  }
  switch (B.state) {
    case 'intro': B.st -= dt; face(); B.sy = 1 + Math.sin(B.t * 20) * .05; if (B.st <= 0) { B.state = 'idle'; B.st = .6; } break;
    case 'idle': face(); B.st -= dt; if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length];
      if (a === 'tongue') { B.state = 'twind'; B.st = enr ? .55 : .8; B.tH = Math.random() < .55 ? 'low' : 'high'; SFX.roar(); }
      else if (a === 'leap') { B.state = 'lwind'; B.st = .5; }
      else { B.state = 'inhale'; B.st = enr ? 2.6 : 2.2; } } break;
    case 'twind': face(); B.st -= dt; if (B.st <= 0) { B.state = 'tongue'; B.st = .85; B.tl = 0; SFX.dash(); } break;
    case 'tongue': { B.st -= dt; const k = B.st > .65 ? (.85 - B.st) / .2 : B.st > .32 ? 1 : B.st / .32; B.tl = clamp(k, 0, 1) * 440;
      const mx = B.x + B.dir * 100, ty = B.tH === 'low' ? F - 14 : F - 58, tx = mx + B.dir * B.tl, l = Math.min(mx, tx), r = Math.max(mx, tx);
      if (P.x + 8 > l && P.x - 8 < r && P.y > ty - 5 && P.y - 34 < ty + 5) hurtPlayer(tx);
      if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .35 : .6; B.tl = 0; } break; }
    case 'lwind': face(); B.st -= dt; if (B.st <= 0) { B.state = 'leapUp'; B.vy = -1150; B.ground = false; SFX.spring(); mud(B.x, 16); B.sx = .8; B.sy = 1.3; } break;
    case 'leapUp': if (B.y < G.camY - 140 || B.vy > -60) { B.state = 'air'; B.st = enr ? 1.15 : 1.4; B.airMax = B.st; } break;
    case 'air': B.st -= dt; if (B.st > .5) B.x = clamp(B.x + clamp(P.x - B.x, -(enr ? 150 : 120) * dt, (enr ? 150 : 120) * dt), minX, maxX); else if (!B.locked) { B.locked = true; SFX.tick(); } if (B.st <= 0) { B.locked = false; B.state = 'slam'; B.y = F - 420; B.vy = 1300; B.ground = false; } break;
    case 'slam': break;
    case 'dazed': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .4; } break;
    case 'inhale': { B.st -= dt; const mouth = B.x + B.dir * 104, front = Math.sign(P.x - B.x) === B.dir;
      if (Math.random() < .9) { const px = mouth + B.dir * rnd(60, 400); parts.push({ x: px, y: F - rnd(10, 110), vx: -B.dir * 320, vy: 0, life: .7, max: .7, c: 'rgba(220,240,255,.7)', k: 'line', g: 0 }); }
      if (Math.random() < dt * 8) noise({ f: 1200, t: .15, v: .08 });
      if (front && Math.abs(P.x - mouth) < 430 && G.deadT <= 0) { P.x -= B.dir * (enr ? 120 : 95) * dt; }
      if (front && Math.abs(P.x - mouth) < 34 && P.y > F - 80 && P.inv <= 0) { hurtPlayer(B.x, 2); P.vx = B.dir * 380; P.vy = -420; floatText('CUSPIU!', P.x, P.y - 60, '#ff3b5c', 2); B.state = 'chew'; B.st = .8; SFX.pop(); }
      if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break; }
    case 'chew': B.st -= dt; B.sy = 1 + Math.sin(B.t * 30) * .06; if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break;
    case 'dying': bossDie(B, dt); break;
  }
}
function drawFrogBoss(B, cx, cy) {
  if (G.cutFlies) for (const f of G.cutFlies) { if (f.eaten) continue; const im = (f.king ? SPR.moscaK : SPR.mosca)[Math.floor(gtime * 30) % 2]; ctx.save(); ctx.translate(Math.round(f.x - cx), Math.round(f.y - cy)); ctx.scale(f.x > P.x ? -1 : 1, 1); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore(); }
  if (B.state === 'cut' && B.hidden) return;
  if (B.state === 'sleep') return;
  const F = B.floorY - cy; let x = Math.round(B.x - cx), y = Math.round(B.y - cy);
  if (B.state === 'air' || B.state === 'slam' || B.state === 'leapUp') { const k = B.state === 'air' ? 1 - B.st / (B.airMax || 1.4) : 1; if (B.locked || B.state === 'slam') { const bl = Math.floor(gtime * 16) % 2; ctx.strokeStyle = bl ? '#ff3b5c' : '#ffe45a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, F, 90, 12, 0, 0, 7); ctx.stroke(); text('FUJA!', x, F - 70, { s: 2, color: '#ffe45a', align: 'center' }); } ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, F, 40 + 90 * clamp(k, 0, 1), 9, 0, 0, 7); ctx.fill(); if (B.state === 'air' && Math.floor(gtime * 10) % 2) text('!', x, F - 40, { s: 3, color: '#ff3b5c', align: 'center' }); if (B.state === 'air') return; }
  else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, F, 125, 9, 0, 0, 7); ctx.fill(); }
  if (B.state === 'twind') { const ty = (B.tH === 'low' ? B.floorY - 14 : B.floorY - 58) - cy; if (Math.floor(gtime * 12) % 2) { ctx.fillStyle = 'rgba(255,90,140,.35)'; for (let i = 0; i < 440; i += 16) ctx.fillRect(x + B.dir * (100 + i) - 4, ty - 1, 8, 2); } text(B.tH === 'low' ? 'PULE!' : 'FIQUE NO CHÃO!', x + B.dir * 200, ty - 20, { s: 2, color: '#ff8ac0', align: 'center' }); }
  if (B.state === 'tongue' && B.tl > 0) { const mx = x + B.dir * 100, my = y - 75, ty = (B.tH === 'low' ? B.floorY - 14 : B.floorY - 58) - cy, tx = mx + B.dir * B.tl; ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + B.dir * 30, ty); ctx.lineTo(tx, ty); ctx.stroke(); ctx.strokeStyle = '#ff7aa0'; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(tx, ty, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#ff5a8a'; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#ffb0c8'; ctx.fillRect(tx - 4, ty - 5, 3, 3); }
  const pose = (!B.ground) ? 'jump' : (B.mouth || ['twind', 'tongue', 'inhale', 'chew'].includes(B.state)) ? 'open' : 'sit';
  const img = (B.flash > 0 ? SPR.bfrogW : SPR.bfrog)[pose];
  if (B.state === 'twind' || B.state === 'lwind' || B.state === 'dying') x += Math.round(Math.sin(gtime * 70) * 2);
  if (B.state === 'sleep') { y += Math.round(Math.sin(gtime * 2) * 1); }
  ctx.save(); ctx.translate(x, y); ctx.scale(B.dir * B.sx, B.sy); ctx.drawImage(img, -182, -179); ctx.restore();
  if (B.state === 'sleep' && Math.abs(P.x - B.x) < 460) { const z = (gtime % 1.5) / 1.5; text('Z', x + 50 + z * 14, y - 190 - z * 24, { s: 2 + Math.round(z), alpha: 1 - z }); }
  if (B.state === 'dazed') { for (let i = 0; i < 4; i++) { const a = gtime * 5 + i * 1.6; text('★', x + B.dir * 60 + Math.cos(a) * 34, y - 190 + Math.sin(a) * 8, { color: '#ffe45a' }); } if (Math.floor(gtime * 6) % 2) text('BATA!', x, y - 215, { s: 2, color: '#7cf05a', align: 'center' }); }
  if (B.state === 'inhale') text('SUCÇÃO!', x + B.dir * 160, y - 170, { s: 2, color: '#bfefff', align: 'center' });
}
function drawScorp(B, cx, cy) {
  const F = B.floorY - cy; let x = Math.round(B.x - cx), y = Math.round(B.y - cy);
  if (B.mark) { const mx = Math.round(B.mark.x - cx), bl = B.mark.lock ? Math.floor(gtime * 20) % 2 : 1; if (bl) { ctx.strokeStyle = '#ff3b5c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(mx, F - 1, 16, 5, 0, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,59,92,.3)'; ctx.beginPath(); ctx.ellipse(mx, F - 1, 12, 3.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff3b5c'; ctx.fillRect(mx - 1, F - 10, 2, 6); } }
  if (B.state === 'under' || B.state === 'warn' || (B.state === 'sleep')) {
    ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(x, F, 30, 7, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#e0a850'; ctx.beginPath(); ctx.ellipse(x, F, 28, 6, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#f8d080'; ctx.fillRect(x - 12, F - 5, 10, 2);
    if (B.state === 'sleep') { const im = SPR.sboss.idle0; ctx.save(); ctx.beginPath(); ctx.rect(x - 80, F - 120, 160, 114); ctx.clip(); ctx.drawImage(im, x - 70, F - 30 + Math.round(Math.sin(gtime * 2) * 2)); ctx.restore(); const z = (gtime % 1.5) / 1.5; if (Math.abs(P.x - B.x) < 420) text('Z', x + 30 + z * 10, F - 40 - z * 20, { s: 1 + Math.round(z), alpha: 1 - z }); }
    if (B.state === 'warn' && Math.floor(gtime * 16) % 2) text('!', x, F - 40, { s: 3, color: '#ff3b5c', align: 'center' });
    return;
  }
  let pose = 'idle'; if (B.state === 'aim' || B.state === 'lock') pose = 'raise'; else if (B.state === 'stuck' || B.state === 'pull' || (B.state === 'strike' && B.st < .07)) pose = 'strike';
  const claw = (B.state === 'snip' || B.state === 'charge') ? Math.floor(gtime * 12) % 2 : (B.state === 'dizzy' ? 1 : 0);
  const key = pose + claw; const img = (B.flash > 0 ? SPR.sbossW : SPR.sboss)[key];
  if (B.state === 'snip' || B.state === 'lock' || B.state === 'dying') x += Math.round(Math.sin(gtime * 70) * 2);
  if (B.state === 'stuck') x += Math.round(Math.sin(gtime * 30) * 1);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(Math.round(B.x - cx), F, 50 * (B.ground ? 1 : .7), 5, 0, 0, 7); ctx.fill();
  ctx.save();
  if (B.state === 'dig') { ctx.beginPath(); ctx.rect(0, 0, W, F); ctx.clip(); y += Math.round(B.dig * 100); }
  ctx.translate(x, y); ctx.scale(B.dir * B.sx, B.sy); ctx.drawImage(img, -77, -92); ctx.restore();
  if (B.state === 'aim' || B.state === 'lock') { const tx = x + B.dir * 6, ty = y - 98; ctx.fillStyle = 'rgba(255,80,80,.5)'; ctx.beginPath(); ctx.arc(tx, ty, 6 + Math.sin(gtime * 30) * 2, 0, 7); ctx.fill(); }
  if (B.state === 'snip') text('!', x + B.dir * 40, y - 70, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'dizzy') for (let i = 0; i < 3; i++) { const a = gtime * 5 + i * 2.1; text('★', x + B.dir * 36 + Math.cos(a) * 18, y - 62 + Math.sin(a) * 5, { color: '#ffe45a' }); }
  if ((B.state === 'stuck' || B.state === 'dizzy') && Math.floor(gtime * 6) % 2) text('BATA!', x, y - 108, { color: '#7cf05a', align: 'center' });
}
function drawBoss(cx, cy) {
  if (G.boss.kind === 'scorp') { if (G.boss.state !== 'dead') drawScorp(G.boss, cx, cy); return; }
  if (G.boss.kind === 'frog') { if (G.boss.state !== 'dead') drawFrogBoss(G.boss, cx, cy); return; }
  if (G.boss.kind === 'snake') { drawSnake(G.boss, cx, cy); return; }
  if (G.boss.kind === 'flea') { drawFlea(G.boss, cx, cy); return; }
  if (G.boss.kind === 'rat') { drawRat(G.boss, cx, cy); return; }
  const B = G.boss; if (B.state === 'dead') return;
  let pose = 'stand'; if (!B.ground || B.state === 'kick') pose = 'air'; else if (B.state === 'crouch' || B.state === 'wind' || B.state === 'land') pose = 'crouch';
  const img = B.flash > 0 ? SPR.bossW[pose] : SPR.boss[pose];
  let x = Math.round(B.x - cx), y = Math.round(B.y - cy);
  if (B.state === 'wind' || B.state === 'dying') x += Math.round(Math.sin(gtime * 70) * 2);
  if (B.state === 'sleep') y += Math.round(Math.sin(gtime * 2) * 1);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(Math.round(B.x - cx), Math.round(B.floorY - cy), 40 * (B.ground ? 1 : .7), 5, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.scale(B.dir * B.sx, B.sy); ctx.drawImage(img, -Math.round(img.width / 2), -84); ctx.restore();
  if (B.state === 'wind') text('!', x + B.dir * 30, y - 96, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'sleep' && Math.abs(P.x - B.x) < 420) { const z = (gtime % 1.5) / 1.5; text('Z', x + 40 + z * 10, y - 90 - z * 20, { s: 1 + Math.round(z), color: '#ffffff', alpha: 1 - z }); }
}
// ---------- background ants ----------
function makeBgAnts(len) { const a = [], span = len * T * .5 + W; for (let i = 0; i < 38; i++) a.push({ x: Math.random() * span, y: rnd(228, 254), dir: Math.random() < .5 ? -1 : 1, mode: Math.random() < .6 ? 'run' : 'cower', t: Math.random() * 5, sp: rnd(45, 95), vy: 0, jy: 0, cheer: false }); a.sort((p, q) => p.y - q.y); return a; }
function updateBgAnts(dt) {
  const B = G.boss; const fight = B && B.active && B.state !== 'dead';
  for (const a of G.bgAnts) {
    a.t += dt;
    if (a.jy < 0 || a.vy < 0) { a.vy += 520 * dt; a.jy += a.vy * dt; if (a.jy >= 0) { a.jy = 0; a.vy = a.cheer ? -rnd(80, 150) : 0; } }
    if (a.cheer) { if (a.jy === 0 && a.vy === 0) a.vy = -rnd(80, 150); continue; }
    if (fight) { const sx = a.x - G.camX * .5, bx = B.x - G.camX; if (Math.abs(sx - bx) < 110) { a.mode = 'run'; a.dir = sx < bx ? -1 : 1; a.sp = 120; } else if (sx > -10 && sx < W + 10 && a.mode === 'run' && Math.random() < dt * 2) a.mode = 'cower'; }
    if (B && B.landT) { }
    if (a.mode === 'run') { a.x += a.dir * a.sp * dt; if (Math.random() < dt * .7) a.dir *= -1; if (Math.random() < dt * .35 && a.jy === 0) a.vy = -rnd(70, 110), a.jy = -.1; if (Math.random() < dt * .15 && !fight) a.mode = 'cower'; }
    else if (Math.random() < dt * .2) { a.mode = 'run'; a.sp = rnd(45, 95); }
  }
}
function drawBgAnts(cx, cy) {
  const M = SPR.mini, A = ANT.anims;
  for (const a of G.bgAnts) {
    let x = Math.round(a.x - cx * .5), y = Math.round(a.y - (cy - 56) * .3 + a.jy);
    if (x < -20 || x > W + 20) continue;
    let fi, dir = a.dir;
    if (a.cheer) fi = a.jy < 0 ? A.hurt[1] : A.hurt[0];
    else if (a.mode === 'run') fi = a.jy < 0 ? A.run[3] : A.run[Math.floor(a.t * 22) % 8];
    else { fi = A.hurt[Math.floor(a.t * 3) % 2 ? 1 : 4]; x += Math.round(Math.sin(a.t * 60)); }
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.drawImage(M.img, fi * M.cw, 0, M.cw, M.ch, -M.cw / 2, -M.ch, M.cw, M.ch); ctx.restore();
    if (!a.cheer && (a.mode === 'cower' ? (a.t % 1.2) < .6 : (a.t % 2) < .5)) { ctx.fillStyle = '#d8f0ff'; ctx.fillRect(x + dir * 5, y - M.ch - 2 + Math.round((a.t * 8) % 3), 1, 2); ctx.fillRect(x - dir * 3, y - M.ch - 1 + Math.round((a.t * 8 + 1) % 3), 1, 2); }
    if (a.cheer && a.jy < -4) { ctx.fillStyle = '#ffe45a'; ctx.fillRect(x, y - M.ch - 4, 1, 1); }
  }
}

// ---------- vertical level (Parede da Casa) ----------
const VC = { L: 110, R: 530 };
function buildVertLevel() {
  const L = { len: 120, vertical: true, worldH: 8000, groundY: 7960, sillY: 250, slick: [], nests: [], termites: [], sugar: [], decor: [], flag: null, babies: [] };
  const S = (x, y, n = 1, dx = 0, dy = -28) => { for (let i = 0; i < n; i++) L.sugar.push({ x: x + dx * i, y: y + dy * i }); };
  const wk = (x, y) => L.termites.push({ type: 'worker', x, y }), sd = (x, y) => L.termites.push({ type: 'soldier', x, y });
  const ns = (x, y, k) => L.nests.push({ x, y, k }), sl = (x0, x1, y0, y1) => L.slick.push({ x0, x1, y0, y1 });
  const bb = (x, y) => L.babies.push({ x, y, got: false, bob: Math.random() * 6 });

  // Andar 1 (7960 -> 5400)
  S(320, 7840, 4); wk(250, 7700); wk(420, 7640);
  ns(220, 7480, 0); sd(430, 7400); S(400, 7550, 3);
  sl(110, 430, 7230, 7280); S(482, 7305, 4);
  wk(200, 7120); wk(330, 7060); wk(460, 7120); ns(420, 7000, 1);
  sl(110, 530, 6820, 6870); S(320, 6800, 3);
  sd(200, 6700); sd(440, 6600); ns(180, 6650, 2);
  bb(180, 6200); S(180, 6260, 4);
  sl(110, 320, 6480, 6520); sl(320, 530, 6390, 6430); S(420, 6510, 3);

  // Andar 2 (5400 -> 2800)
  wk(250, 5300); wk(380, 5270); wk(470, 5220); ns(300, 5250, 3); S(320, 5360, 3);
  sl(110, 530, 5020, 5070); S(320, 5000, 3);
  sd(220, 4880); sd(420, 4820); wk(330, 4920); ns(450, 4760, 1);
  sl(110, 400, 4520, 4570); S(470, 4550, 4);
  bb(450, 4100); S(450, 4160, 4);
  wk(220, 4300); wk(380, 4200); ns(200, 4050, 2);
  sl(240, 530, 3820, 3870); S(180, 3850, 4);
  sd(280, 3600); sd(430, 3500); ns(320, 3400, 0);

  // Andar 3 (2800 -> 250)
  wk(200, 2700); wk(440, 2650); S(320, 2700, 4);
  sl(110, 530, 2420, 2470); S(320, 2400, 3);
  sd(250, 2200); sd(400, 2150); ns(220, 2080, 3);
  bb(200, 1500); S(200, 1560, 4);
  sl(110, 350, 1800, 1850); sl(300, 530, 1600, 1650); S(320, 1700, 4);
  wk(260, 1300); wk(420, 1250); ns(340, 1150, 1);
  sl(110, 530, 950, 1000); S(320, 900, 4);
  sd(220, 750); sd(440, 700); S(320, 600, 4);

  const r = rng(77);
  for (let i = 0; i < 90; i++) L.decor.push({ x: VC.L + 20 + r() * 380, y: 320 + r() * 7500, k: 4 + Math.floor(r() * 7) });
  L.flag = { x: 470, y: L.sillY };
  return L;
}
function loadVertical(i) {
  const def = LEVELS[i]; const L = def.mk(); const th = THEMES[def.id];
  G = { i, def, L, th, vertical: true, camX: 0, camY: L.worldH - H, time: 0, sugar: 0, sugarTotal: L.sugar.length, kills: 0, enemiesTotal: L.termites.length + L.nests.length, score: 0, maxCombo: 0, chain: 0, chainT: 0, clear: null, intro: 1.6, deadT: 0, boss: null, flagHidden: false, flagPop: 1, waves: [], bossBanner: 0, nurses: [], sugarMeter: 0, bgAnts: null, enemies: [], layers: [] };
  G.sugarList = L.sugar.map(s => ({ ...s, got: false, vx: 0, vy: 0, mag: false, bob: Math.random() * 6 }));
  G.terms = L.termites.map(makeTermite);
  G.nests = L.nests.map(n => ({ ...n, hp: 3, sealed: false, spawnT: rnd(1, 3), alive: 0, flash: 0, hitBy: -1 }));
  Object.assign(P, { x: 40, y: L.groundY, vx: 0, vy: 0, dir: 1, ground: true, coyote: 0, buf: 0, dashT: 0, dashCD: 0, airDash: true, punchT: -1, punchId: 0, hurtT: 0, inv: 0, hp: MAXHP, jumps: 1, flip: 0, boost: 0, anim: 'idle', at: 0, sx: 1, sy: 1, combo: 0, comboT: 0, dust: 0, dashHit: new Set(), ctrl: true, climb: false, onSill: false, floor: L.groundY, leapT: 0, leapCD: 0, lvx: 0, lvy: 0, cdist: 0, pdir: 1, ddir: 1 });
  P.safe = { x: P.x, y: P.y };
  parts.length = floats.length = ghosts.length = 0;
  state = 'play'; playSong(th.song);
}
function makeTermite(o) { const sol = o.type === 'soldier'; return { ...o, ang: sol ? Math.PI / 2 : Math.random() * 6.28, sp: sol ? 30 : 32, hp: sol ? 2 : 1, t: Math.random() * 5, flash: 0, dead: false, state: 'crawl', st: 0, hitBy: -1, kb: 0, kvx: 0, kvy: 0, r: sol ? 17 : 12, score: sol ? 250 : 120, a: 1 }; }
function termDamage(e, dmg, dirx) {
  if (e.dead) return; e.hp -= dmg; e.flash = .12; const cx = e.x, cy = e.y;
  hitSpark(cx, cy, '#ffffff'); P.combo++; P.comboT = 1.6; G.maxCombo = Math.max(G.maxCombo, P.combo);
  if (P.combo >= 2) floatText('COMBO ' + P.combo + '!', cx, cy - 20, '#7ff0ff', 1 + Math.min(P.combo, 8) * .08);
  if (e.hp <= 0) { e.dead = true; e.vx = dirx * 120; e.vy = -160; e.rot = 0; G.kills++; const pts = e.score * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 8, '#ffe45a'); SFX.kill(); fx.stop = .07; fx.shake = Math.max(fx.shake, 3); burst(cx, cy, 12, ['#ffe45a', '#ffffff', '#f4e6c8'], 200); ring(cx, cy, '#ffffff'); if (Math.random() < .6) G.sugarList.push({ x: cx, y: cy, got: false, vx: 0, vy: 0, mag: true, bob: 0 }); }
  else { e.kb = .25; e.kvx = dirx * 160; e.kvy = 0; SFX.hit(); fx.stop = .05; fx.shake = Math.max(fx.shake, 2); }
}
function updateTermite(e, dt) {
  e.t += dt; e.flash -= dt;
  if (e.dead) { e.vy += 700 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.rot += dt * 12; e.a -= dt * 1.5; return; }
  if (Math.abs(e.y - (G.camY + H / 2)) > H) return;
  if (e.kb > 0) { e.kb -= dt; e.x += e.kvx * dt; e.kvx *= .9; e.x = clamp(e.x, VC.L + 10, VC.R - 10); return; }
  const dx = P.x - e.x, dy = (P.y - 22) - e.y, d = Math.hypot(dx, dy), toP = Math.atan2(dx, -dy);
  const turn = (target, rate) => { let df = ((target - e.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI; e.ang += clamp(df, -rate * dt, rate * dt); };
  let sp = e.sp;
  if (e.type === 'worker') { if (d < 210 && G.deadT <= 0) turn(toP, 1.3); else e.ang += Math.sin(e.t * .9) * dt * 1.2; }
  else {
    if (e.state === 'crawl') { if (Math.abs(Math.sin(e.ang)) < .5) e.ang = Math.PI / 2; if (d < 135 && G.deadT <= 0) { e.state = 'wind'; e.st = .7; SFX.tick(); } }
    else if (e.state === 'wind') { sp = 0; turn(toP, 6); e.st -= dt; if (e.st <= 0) { e.state = 'charge'; e.st = .55; e.ang = toP; } }
    else if (e.state === 'charge') { sp = 135; e.st -= dt; if (e.st <= 0) { e.state = 'rest'; e.st = 1.1; } }
    else { sp = 0; e.st -= dt; if (e.st <= 0) { e.state = 'crawl'; e.ang = Math.random() < .5 ? Math.PI / 2 : -Math.PI / 2; } }
  }
  e.x += Math.sin(e.ang) * sp * dt; e.y -= Math.cos(e.ang) * sp * dt;
  if (e.x < VC.L + 10 || e.x > VC.R - 10) { e.ang = -e.ang; e.x = clamp(e.x, VC.L + 10, VC.R - 10); }
  if (e.y < G.L.sillY + 40 || e.y > G.L.groundY - 20) { e.ang = Math.PI - e.ang; e.y = clamp(e.y, G.L.sillY + 40, G.L.groundY - 20); }
}
const climbFrame = () => { const A = ASSETS.antclimbjson; if (P.punchT >= 0) { const k = Math.min(3, Math.floor(P.punchT / .26 * 4)); return A.punch[(P.pdir > 0 ? 0 : 4) + k]; } if (P.leapT > 0) return A.climb[2]; return A.climb[Math.floor(P.cdist / 6) % 8]; };
function updateVert(dt) {
  const L = G.L, cl = VC.L, cr = VC.R;
  const left = K.left && P.ctrl, right = K.right && P.ctrl, up = (K.up || K.sup) && P.ctrl, down = K.down && P.ctrl;
  P.inv -= dt; P.hurtT -= dt; P.dashCD -= dt; P.leapCD -= dt;
  if (P.boost > 0) { P.boost -= dt; if (Math.random() < .7) parts.push({ x: P.x + rnd(-10, 10), y: P.y - rnd(4, 40), vx: rnd(-20, 20), vy: rnd(-60, -10), life: .4, max: .4, c: ['#ffe45a', '#ffffff', '#ff8ae0', '#7ff0ff'][Math.floor(Math.random() * 4)], sz: 2, g: 0, k: 'star' }); if (P.boost <= 0) floatText('FIM DO TURBO', P.x, P.y - 56, '#c8c8d8'); }
  const mx = (right ? 1 : 0) - (left ? 1 : 0), my = (down ? 1 : 0) - (up ? 1 : 0);
  if (mx && P.punchT < 0) { P.pdir = mx; P.dir = mx; }
  if (KP.punch && P.ctrl && (P.punchT < 0 || P.punchT > .17) && P.hurtT <= 0) { P.punchT = 0; P.punchId++; SFX.punch(); }
  if (P.punchT >= 0) { P.punchT += dt; if (P.punchT > .26) P.punchT = -1; }
  const bm = P.boost > 0 ? 1.5 : 1;
  if (!P.climb) {
    const max = 178 * bm; if (mx && P.hurtT <= 0) { P.vx += mx * 1900 * dt; P.vx = clamp(P.vx, -max, max); } else { const fr = 2200 * dt; P.vx = Math.abs(P.vx) <= fr ? 0 : P.vx - Math.sign(P.vx) * fr; }
    if (P.ground && KP.jump && P.ctrl) { P.vy = -505; P.ground = false; SFX.jump(); P.sx = .7; P.sy = 1.35; dust(P.x, P.y, 4); }
    P.vy = Math.min(P.vy + 1500 * dt, 560); P.x += P.vx * dt; P.y += P.vy * dt;
    if (P.y >= P.floor) { if (!P.ground && P.vy > 260) { SFX.land(); dust(P.x, P.y, 6); P.sx = 1.3; P.sy = .72; } P.y = P.floor; P.vy = 0; P.ground = true; } else P.ground = false;
    P.x = P.onSill ? clamp(P.x, cl - 10, cr + 10) : clamp(P.x, 8, W - 8);
    if (!P.onSill && P.ctrl && P.x > cl + 8 && P.x < cr - 8 && (up || (!P.ground && P.y < L.groundY - 24))) { P.climb = true; P.vx = 0; P.vy = 0; P.ground = false; SFX.step(); if (!G.climbHint) { G.climbHint = 1; floatText('ESCALANDO!', P.x, P.y - 60, '#7cf05a'); } }
    let a = 'idle'; if (P.hurtT > 0) a = 'hurt'; else if (P.punchT >= 0) a = 'punch'; else if (!P.ground) a = P.vy < 0 ? 'jump' : 'fall'; else if (Math.abs(P.vx) > 120) a = 'run'; else if (Math.abs(P.vx) > 10) a = 'walk';
    if (G.clear && G.clear.phase >= 1) a = 'win';
    if (a !== P.anim) { P.anim = a; P.at = 0; } P.at += dt;
    if (P.ground && Math.abs(P.vx) > 150) { P.dust -= dt; if (P.dust <= 0) { P.dust = .12; dust(P.x - P.dir * 6, P.y, 1, P.dir); } }
  } else {
    const amag = STK.id !== null ? clamp(STK.mag / .55, .35, 1) : 1;
    let vx = mx * 92 * bm * amag, vy = my * 84 * bm * amag;
    if (P.punchT >= 0) { vx *= .3; vy *= .3; }
    const hy = P.y - 22;
    const inSlick = L.slick.some(z => P.x > z.x0 && P.x < z.x1 && hy > z.y0 && hy < z.y1);
    if (inSlick && P.leapT <= 0 && P.dashT <= 0) { if (vy < 0) vy = 0; vy += 75; if (!G.slickHint) { G.slickHint = 1; floatText('TINTA FRESCA! SALTE!', P.x, P.y - 64, '#7ff0ff', 2); } if (Math.random() < dt * 10) parts.push({ x: P.x + rnd(-6, 6), y: P.y - 4, vx: 0, vy: 60, life: .4, max: .4, c: '#d8f0ff', sz: 2, g: 200, k: 'sq' }); }
    if (KP.jump && P.ctrl && P.leapCD <= 0 && P.hurtT <= 0) { let dx = mx, dy = my; if (!dx && !dy) dy = -1; const d = Math.hypot(dx, dy); P.lvx = dx / d * 340 * bm; P.lvy = dy / d * 340 * bm; P.leapT = .22; P.leapCD = .3; SFX.djump(); ring(P.x, P.y - 20, '#bfefff'); P.sx = .8; P.sy = 1.25; P.dashHit.clear(); }
    if (KP.dash && P.ctrl && P.dashCD <= 0 && P.hurtT <= 0) { P.dashT = .15; P.dashCD = .35; P.ddir = mx || P.pdir; SFX.dash(); P.dashHit.clear(); P.sx = 1.3; P.sy = .8; }
    if (P.leapT > 0) { P.leapT -= dt; vx = P.lvx; vy = P.lvy; ghosts.push({ x: P.x, y: P.y, f: climbFrame(), dir: 1, a: .5, climb: true }); }
    else if (P.dashT > 0) { P.dashT -= dt; vx = P.ddir * 330; vy = 0; ghosts.push({ x: P.x, y: P.y, f: climbFrame(), dir: 1, a: .5, climb: true }); }
    if (P.hurtT > 0) { vx = P.vx; P.vx *= Math.pow(.02, dt); vy = 25; }
    P.x = clamp(P.x + vx * dt, cl + 10, cr - 10); P.y += vy * dt;
    if (vx || vy) P.cdist += Math.hypot(vx, vy) * dt;
    if (P.y >= L.groundY) { P.y = L.groundY; if (my > 0) { P.climb = false; P.ground = true; P.vy = 0; } }
    if (P.y - 34 <= L.sillY) { P.climb = false; P.onSill = true; P.floor = L.sillY; P.y = L.sillY - 2; P.vy = -260; P.vx = P.pdir * 60; P.ground = false; SFX.spring(); floatText('CHEGOU NA JANELA!', P.x, P.y - 70, '#ffe45a', 2); confettiSmall(P.x, P.y - 20); }
  }
  P.sx = lerp(P.sx, 1, Math.min(1, dt * 14)); P.sy = lerp(P.sy, 1, Math.min(1, dt * 14));
  if (P.combo > 0) { if (!P.climb || P.leapT <= 0) P.comboT -= dt * .6; if (P.comboT <= 0) { if (P.combo >= 2) { const b = P.combo * P.combo * 25; G.score += b; floatText('COMBO ×' + P.combo + '  +' + b, P.x, P.y - 58, '#ff8ae0', 2); SFX.combo(P.combo); confettiSmall(P.x, P.y - 40); } P.combo = 0; } }
  for (const e of G.terms) updateTermite(e, dt);
  if (G.clear || G.deadT > 0) return;
  // nests
  for (const n of G.nests) {
    n.flash -= dt; if (n.sealed) continue;
    if (Math.abs(n.y - (G.camY + H / 2)) < H * .7) { n.spawnT -= dt; const alive = G.terms.filter(e => !e.dead && e.nest === n).length;
      if (n.spawnT <= 0 && alive < 2) { n.spawnT = 4.5; const e = makeTermite({ type: 'worker', x: n.x, y: n.y }); e.nest = n; e.ang = Math.random() * 6.28; G.terms.push(e); G.enemiesTotal++; for (let i = 0; i < 8; i++) parts.push({ x: n.x + rnd(-8, 8), y: n.y + rnd(-6, 6), vx: rnd(-60, 60), vy: rnd(-60, 20), life: .4, max: .4, c: '#c8a080', sz: 2, g: 200, k: 'sq' }); } }
  }
  // attacks
  const hy = P.y - 22;
  const pf = P.punchT >= 0 ? Math.floor(P.punchT / .26 * 4) : -1;
  const hb = (pf >= 1 && pf <= 2) ? { l: P.pdir > 0 ? P.x : P.x - 36, r: P.pdir > 0 ? P.x + 36 : P.x, t: P.y - 44, b: P.y - 6 } : null;
  const atk = P.leapT > 0 || P.dashT > 0 || P.boost > 0;
  for (const e of G.terms) {
    if (e.dead) continue;
    if (hb && e.hitBy !== P.punchId && e.x + e.r > hb.l && e.x - e.r < hb.r && e.y + e.r > hb.t && e.y - e.r < hb.b) { e.hitBy = P.punchId; termDamage(e, 1, P.pdir); continue; }
    const d = Math.hypot(e.x - P.x, e.y - hy);
    if (d < e.r + 11) { if (atk) { if (!P.dashHit.has(e)) { P.dashHit.add(e); termDamage(e, P.boost > 0 ? 9 : 1, Math.sign(e.x - P.x) || 1); } } else if (e.kb <= 0) { hurtPlayer(e.x); P.vx = (P.x < e.x ? -1 : 1) * 160; } }
  }
  for (const n of G.nests) {
    if (n.sealed) continue;
    if (hb && n.hitBy !== P.punchId && n.x + 18 > hb.l && n.x - 18 < hb.r && n.y + 14 > hb.t && n.y - 14 < hb.b) {
      n.hitBy = P.punchId; n.hp--; n.flash = .15; SFX.bossHit(); fx.stop = .05; fx.shake = 3; burst(n.x, n.y, 10, ['#c8a080', '#ffffff', '#8a5a3a'], 180);
      if (n.hp <= 0) { n.sealed = true; G.kills++; G.score += 500; floatText('NINHO LACRADO! +500', n.x, n.y - 24, '#7cf05a', 2); SFX.kill(); SFX.combo(4); ring(n.x, n.y, '#7cf05a'); confettiSmall(n.x, n.y); }
      else floatText(String(n.hp), n.x, n.y - 20, '#ffffff', 2);
    }
  }
  // sugar
  for (const s of G.sugarList) {
    if (s.got) continue; const dx = P.x - s.x, dy = hy - s.y, d2 = dx * dx + dy * dy;
    if (d2 < 55 * 55 || s.mag) { const d = Math.sqrt(d2) || 1; s.x += dx / d * 300 * dt; s.y += dy / d * 300 * dt; s.mag = true; }
    if (d2 < 16 * 16) { s.got = true; G.sugar++; G.score += 10; addSugarMeter(); G.chain = G.chainT > 0 ? G.chain + 1 : 0; G.chainT = .7; SFX.sugar(G.chain); sparkle(s.x, s.y); }
  }
  G.chainT -= dt;
  if (P.onSill && Math.abs(P.x - L.flag.x) < 16 && !G.clear) startClear();
}
function drawTermite(e, cx, cy) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy); if (y < -40 || y > H + 40) return;
  const fr = SPR.term[e.type][Math.floor(e.t * (e.state === 'charge' ? 16 : 8)) % 2]; const img = e.flash > 0 ? (SPR.termW[e.type]) : fr;
  ctx.save(); ctx.globalAlpha = clamp(e.a, 0, 1); ctx.translate(x + (e.state === 'wind' ? Math.round(Math.sin(gtime * 60)) : 0), y); ctx.rotate(e.dead ? e.rot : e.ang); ctx.scale(1.5, 1.5); ctx.drawImage(img, -Math.round(img.width / 2), -Math.round(img.height / 2)); ctx.restore();
  if (e.state === 'wind' && !e.dead) text('!', x, y - 24, { s: 2, color: '#ff3b5c', align: 'center' });
}
function drawVert() {
  const L = G.L, sh = fx.shake > .2 ? fx.shake : 0;
  const cx = Math.round(rnd(-sh, sh)), cy = Math.round(G.camY + rnd(-sh, sh));
  // background (blurred far wall) vertical parallax
  { const img = IMG.wallbg, h = img.height, fl = SPR.wallbgF || (SPR.wallbgF = (() => { const [c, x] = mkCanvas(img.width, h); x.translate(0, h); x.scale(1, -1); x.drawImage(img, 0, 0); return c; })());
    const off = cy * .3; let k0 = Math.floor(off / h); for (let k = k0; k * h - off < H; k++) ctx.drawImage(((k % 2) + 2) % 2 ? fl : img, 0, Math.round(k * h - off)); }
  ctx.fillStyle = 'rgba(60,30,20,0.18)'; ctx.fillRect(0, 0, W, H);
  // window above sill
  const sy = L.sillY - cy;
  if (sy > -10) {
    const wx0 = VC.L - 6, wx1 = VC.R + 6, top = Math.max(-10, 30 - cy);
    ctx.fillStyle = '#1a1020'; ctx.fillRect(wx0 - 3, top - 3, wx1 - wx0 + 6, sy - top + 3); ctx.fillStyle = '#f0e6d4'; ctx.fillRect(wx0, top, wx1 - wx0, sy - top);
    ctx.fillStyle = '#1a1020'; ctx.fillRect(wx0 + 14, top + 14, wx1 - wx0 - 28, sy - top - 20);
    const g = ctx.createLinearGradient(0, top, 0, sy); g.addColorStop(0, '#bfe6ff'); g.addColorStop(1, '#6aaee0'); ctx.fillStyle = g; ctx.fillRect(wx0 + 16, top + 16, wx1 - wx0 - 32, sy - top - 24);
    ctx.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); const bx = wx0 + 60 + i * 120; ctx.moveTo(bx, sy - 10); ctx.lineTo(bx + 30, sy - 10); ctx.lineTo(bx + 90, top + 16); ctx.lineTo(bx + 60, top + 16); ctx.fill(); }
    ctx.fillStyle = '#f0e6d4'; ctx.fillRect((wx0 + wx1) / 2 - 4, top + 14, 8, sy - top - 20); ctx.fillStyle = '#1a1020'; ctx.fillRect((wx0 + wx1) / 2 - 5, top + 14, 1, sy - top - 20); ctx.fillRect((wx0 + wx1) / 2 + 4, top + 14, 1, sy - top - 20);
  }
  // wall column
  { const img = IMG.wall, h = img.height, fl = SPR.wallF || (SPR.wallF = (() => { const [c, x] = mkCanvas(img.width, h); x.translate(0, h); x.scale(1, -1); x.drawImage(img, 0, 0); return c; })());
    const y0 = Math.max(L.sillY, cy), y1 = Math.min(L.groundY + 40, cy + H);
    ctx.save(); ctx.beginPath(); ctx.rect(VC.L, y0 - cy, VC.R - VC.L, y1 - y0); ctx.clip();
    for (let k = Math.floor(y0 / h); k * h < y1; k++) ctx.drawImage(k % 2 ? fl : img, VC.L, Math.round(k * h - cy));
    ctx.restore();
    ctx.fillStyle = 'rgba(40,20,10,.35)'; ctx.fillRect(VC.L, y0 - cy, 10, y1 - y0); ctx.fillRect(VC.R - 10, y0 - cy, 10, y1 - y0);
    ctx.fillStyle = '#1a1020'; ctx.fillRect(VC.L - 2, y0 - cy, 2, y1 - y0); ctx.fillRect(VC.R, y0 - cy, 2, y1 - y0);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(VC.R + 2, y0 - cy, 8, y1 - y0);
    const py = L.groundY - 40 - cy; if (py < H) { ctx.fillStyle = '#1a1020'; ctx.fillRect(VC.L - 4, py - 2, VC.R - VC.L + 8, 44); ctx.fillStyle = '#8a4a2a'; ctx.fillRect(VC.L - 2, py, VC.R - VC.L + 4, 42); ctx.fillStyle = '#a8603a'; ctx.fillRect(VC.L - 2, py, VC.R - VC.L + 4, 4); }
  }
  // decor cracks + slick
  const CR = ASSETS.cracksjson;
  for (const d of L.decor) { const r = CR[d.k], y = d.y - cy; if (y < -60 || y > H + 60) continue; ctx.globalAlpha = .55; ctx.drawImage(IMG.cracks, r[0], r[1], r[2], r[3], Math.round(d.x - r[2] / 2), Math.round(y - r[3] / 2), r[2], r[3]); ctx.globalAlpha = 1; }
  for (const z of L.slick) { const y0 = z.y0 - cy, y1 = z.y1 - cy; if (y1 < -20 || y0 > H + 20) continue; ctx.fillStyle = 'rgba(90,190,255,.45)'; ctx.fillRect(z.x0, y0, z.x1 - z.x0, y1 - y0); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let x = z.x0 + 8; x < z.x1 - 10; x += 26) { ctx.fillRect(x, y0 + 6, 10, 2); ctx.fillRect(x + 4, y0 + 12, 2, 2); } ctx.fillStyle = 'rgba(150,215,255,.5)'; for (let x = z.x0 + 12; x < z.x1; x += 31) { const dl = 6 + ((x * 7) % 13) + Math.sin(gtime * 2 + x) * 2; ctx.fillRect(x, y1, 3, dl); ctx.fillRect(x - 1, y1 + dl, 5, 3); } ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(z.x0, y0, z.x1 - z.x0, 2); }
  for (const n of G.nests) { const r = CR[n.k], y = n.y - cy; if (y < -80 || y > H + 80) continue; const sc = .9; ctx.globalAlpha = n.sealed ? .5 : 1; ctx.drawImage(IMG.cracks, r[0], r[1], r[2], r[3], Math.round(n.x - r[2] * sc / 2), Math.round(y - r[3] * sc / 2), Math.round(r[2] * sc), Math.round(r[3] * sc)); ctx.globalAlpha = 1;
    if (n.sealed) { ctx.fillStyle = '#e8d8c0'; ctx.beginPath(); ctx.ellipse(n.x, y, 14, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c8b090'; ctx.fillRect(n.x - 8, y - 1, 16, 2); }
    else { ctx.fillStyle = n.flash > 0 ? '#ffffff' : '#1a0c08'; ctx.beginPath(); ctx.ellipse(n.x, y, 9, 6, 0, 0, 7); ctx.fill(); if (Math.floor(gtime * 2 + n.x) % 3) { ctx.fillStyle = '#ffd040'; ctx.fillRect(n.x - 4, y - 1, 2, 2); ctx.fillRect(n.x + 2, y - 1, 2, 2); } } }
  // sill + grass
  ctx.drawImage(IMG.sill, Math.round((VC.L + VC.R) / 2 - IMG.sill.width / 2), Math.round(sy - 6));
  { const gy = L.groundY - 152 - cy; if (gy < H) { drawLayerH(IMG.grass, gy); } }
  if (!G.flagHidden) drawFlag(L.flag.x - cx, L.flag.y - cy);
  // hint
  if (!P.climb && !P.onSill && !G.climbHint) { const b = Math.sin(gtime * 5) * 3; text(isTouch ? '↑ ANALÓGICO PARA CIMA: ESCALAR' : '↑ SEGURE PARA ESCALAR', 320, L.groundY - 110 - cy + b, { color: '#ffe45a', align: 'center' }); }
  // sugar
  for (const s of G.sugarList) { if (s.got) continue; const x = s.x - cx, y = s.y - cy + Math.sin(gtime * 4 + s.bob) * 2; if (y < -10 || y > H + 10) continue; ctx.drawImage(SPR.sugar, Math.round(x - 5), Math.round(y - 5)); }
  for (const e of G.terms) drawTermite(e, cx, cy);
  for (const g of ghosts) { if (g.climb) drawAntImg(IMG.antclimb, g.f, g.x - cx, g.y - cy, 1, g.a * .5, 1, 1); else drawAnt(g.f, g.x - cx, g.y - cy, g.dir, { alpha: g.a * .6, white: true }); }
  const blink = P.inv > 0 && G.deadT <= 0 && Math.floor(gtime * 20) % 2 === 0;
  if (!blink) {
    if (P.climb) { const f = climbFrame(); drawAntImg(IMG.antclimb, f, P.x - cx, P.y - cy, 1, 1, P.sx, P.sy); if (P.boost > 0) { SPR.climbGold = SPR.climbGold || tinted(IMG.antclimb, '#ffe45a'); drawAntImg(SPR.climbGold, f, P.x - cx, P.y - cy, 1, .45 + Math.sin(gtime * 20) * .15, P.sx, P.sy); }
      if (P.punchT >= 0 && Math.floor(P.punchT / .26 * 4) === 2) { ctx.fillStyle = '#ffe45a'; const ix = P.x - cx + P.pdir * 30, iy = P.y - cy - 30; ctx.fillRect(ix, iy - 6, 2, 4); ctx.fillRect(ix + P.pdir * 4, iy - 1, 4, 2); ctx.fillRect(ix, iy + 4, 2, 4); } }
    else { drawAnt(playerFrame(), P.x - cx, P.y - cy, P.dir, { sx: P.sx, sy: P.sy }); if (P.boost > 0) { SPR.antGold = SPR.antGold || tinted(IMG.ant, '#ffe45a'); drawAntImg(SPR.antGold, playerFrame(), P.x - cx, P.y - cy, P.dir, .5, P.sx, P.sy); } }
  }
  drawParts(cx, cy);
  // height meter
  { const t = clamp(1 - (P.y - L.sillY) / (L.groundY - L.sillY), 0, 1); const mx = W - 18, my0 = 70, my1 = H - 60; ctx.fillStyle = '#1a1020'; ctx.fillRect(mx - 3, my0 - 3, 8, my1 - my0 + 6); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(mx - 1, my0, 4, my1 - my0); ctx.fillStyle = '#7cf05a'; ctx.fillRect(mx - 1, my1 - (my1 - my0) * t, 4, (my1 - my0) * t); ctx.drawImage(SPR.prop.sprout, mx - 4, my1 - (my1 - my0) * t - 6); text('🏁'.length ? 'JANELA' : '', mx + 3, my0 - 12, { align: 'right', color: '#ffe45a' }); }
  drawHUD();
  if (G.intro > 0) drawIntro();
  if (G.clear) drawClear();
  if (fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${fx.flash * 2})`; ctx.fillRect(0, 0, W, H); }
  if (paused) { ctx.fillStyle = 'rgba(10,6,20,0.65)'; ctx.fillRect(0, 0, W, H); text('PAUSA', W / 2, 140, { s: 4, color: '#ffe45a', align: 'center' }); }
}
function drawLayerH(img, y) { const w = img.width, fl = flipped(img); for (let k = 0; k * w < W; k++) ctx.drawImage(k % 2 ? fl : img, k * w, Math.round(y)); }

// ---------- particles ----------
function burst(x, y, n, cols, sp = 150, grav = 500) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = rnd(.3, 1) * sp; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rnd(.3, .6), max: .6, c: cols[i % cols.length], sz: Math.random() < .3 ? 3 : 2, g: grav, k: 'sq' }); } }
function dust(x, y, n = 4, dir = 0) { for (let i = 0; i < n; i++) parts.push({ x: x + rnd(-6, 6), y: y - 2, vx: rnd(-40, 40) - dir * 40, vy: rnd(-50, -10), life: rnd(.25, .45), max: .45, c: 'rgba(240,225,200,0.8)', sz: rnd(2, 4), g: -30, k: 'puff' }); }
function ring(x, y, c) { parts.push({ x, y, vx: 0, vy: 0, life: .25, max: .25, c, k: 'ring', g: 0 }); }
function hitSpark(x, y, c) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.random() * .4; parts.push({ x, y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: .14, max: .14, c, k: 'line', g: 0 }); } }
function confetti(x, y, n) { const cols = ['#ff3b5c', '#ffe45a', '#4ad8ff', '#7cf05a', '#ff8ae0', '#ffffff']; for (let i = 0; i < n; i++) parts.push({ x, y, vx: rnd(-220, 220), vy: rnd(-420, -150), life: rnd(1.2, 2.2), max: 2.2, c: cols[i % cols.length], k: 'conf', g: 380, rot: rnd(0, 6), vr: rnd(-12, 12), drag: true }); }
function sparkle(x, y, c = '#fff6c0') { for (let i = 0; i < 5; i++) parts.push({ x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-60, 60), vy: rnd(-90, -20), life: rnd(.25, .5), max: .5, c, sz: 2, g: 120, k: 'star' }); }
function floatText(s, x, y, c = '#fff', sc = 1) { floats.push({ s, x, y, c, t: 0, sc }); }
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } p.vy += p.g * dt; if (p.drag) { p.vx *= .985; p.vy = Math.min(p.vy, 90); } p.x += p.vx * dt; p.y += p.vy * dt; if (p.rot !== undefined) p.rot += p.vr * dt; }
  for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; f.y -= 30 * dt; if (f.t > .9) floats.splice(i, 1); }
  for (let i = ghosts.length - 1; i >= 0; i--) { ghosts[i].a -= dt * 3.5; if (ghosts[i].a <= 0) ghosts.splice(i, 1); }
}
function drawParts(cx, cy) {
  for (const p of parts) {
    const a = clamp(p.life / p.max, 0, 1); const x = p.x - cx, y = p.y - cy;
    ctx.globalAlpha = p.k === 'conf' ? Math.min(1, a * 3) : a;
    ctx.fillStyle = p.c; ctx.strokeStyle = p.c;
    if (p.k === 'sq' || p.k === 'puff') { const s = p.k === 'puff' ? p.sz * (1.5 - a * .5) : p.sz; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s)); }
    else if (p.k === 'ring') { ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6 + (1 - a) * 22, 0, Math.PI * 2); ctx.stroke(); }
    else if (p.k === 'line') { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * .03, y - p.vy * .03); ctx.stroke(); }
    else if (p.k === 'conf') { const w = Math.abs(Math.cos(p.rot)) * 4 + 1; ctx.fillRect(Math.round(x - w / 2), Math.round(y - 2), Math.round(w), 3); }
    else if (p.k === 'star') { ctx.fillRect(Math.round(x), Math.round(y - 1), 1, 3); ctx.fillRect(Math.round(x - 1), Math.round(y), 3, 1); }
  }
  ctx.globalAlpha = 1;
  for (const f of floats) { const s = f.t < .12 ? lerp(.5, 1.3, f.t / .12) * f.sc : f.sc; text(f.s, f.x - cx, f.y - cy, { s: Math.max(1, Math.round(s)), color: f.c, align: 'center', alpha: f.t > .6 ? 1 - (f.t - .6) / .3 : 1 }); }
}

// ---------- player ----------
const PW = 16, PH = 36;
function boxHits(l, t, r, b, oneWayFromY = null) {
  const tx0 = Math.floor(l / T), tx1 = Math.floor((r - .01) / T), ty0 = Math.floor(t / T), ty1 = Math.floor((b - .01) / T);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { const s = solidAt(tx, ty); if (s === 1) return { tx, ty }; if (s === 2 && oneWayFromY !== null && oneWayFromY <= ty * T + .5 && b > ty * T) return { tx, ty }; }
  return null;
}
function hurtPlayer(fromX, dmg = 1) {
  if (GOD.on) return;
  if (P.inv > 0 || G.clear || P.boost > 0) return;
  P.hp -= dmg; P.inv = 1.3; P.hurtT = .4; P.vx = (P.x < fromX ? -1 : 1) * 180; P.vy = -260; P.dashT = 0; P.punchT = -1; P.combo = 0; P.comboT = 0;
  SFX.hurt(); fx.shake = 6; fx.stop = .1; fx.flash = .15; burst(P.x, P.y - 18, 10, ['#ff3b5c', '#ffffff'], 180);
  if (P.hp <= 0) { G.deadT = 1.2; P.ctrl = false; playSong(null); }
}
function updatePlayer(dt) {
  P.lock = (P.lock || 0) - dt; P.fallCD = (P.fallCD || 0) - dt;
  if (isTouch && STK.id === null) { K.left = false; K.right = false; K.down = false; K.sup = false; }
  const ctl = P.ctrl && P.lock <= 0;
  const left = K.left && ctl, right = K.right && ctl;
  const wantJump = (KP.jump || KP.up) && ctl, wantPunch = KP.punch && P.ctrl, wantDash = KP.dash && P.ctrl;
  if (wantJump) P.buf = .15; else P.buf -= dt;
  P.inv -= dt; P.hurtT -= dt; P.dashCD -= dt;
  if (P.boost > 0) { P.boost -= dt; if (Math.random() < .7) parts.push({ x: P.x + rnd(-10, 10), y: P.y - rnd(4, 40), vx: rnd(-20, 20), vy: rnd(-60, -10), life: .4, max: .4, c: ['#ffe45a', '#ffffff', '#ff8ae0', '#7ff0ff'][Math.floor(Math.random() * 4)], sz: 2, g: 0, k: 'star' }); if (Math.abs(P.vx) > 100 && Math.random() < .5) ghosts.push({ x: P.x, y: P.y, f: playerFrame(), dir: P.dir, a: .5, gold: true }); if (P.boost <= 0) floatText('FIM DO TURBO', P.x, P.y - 56, '#c8c8d8'); }
  let mx = (right ? 1 : 0) - (left ? 1 : 0);
  const amag = STK.id !== null ? clamp(Math.abs(STK.ax) / .55, .35, 1) : 1;
  if (mx && P.punchT < 0 && P.dashT <= 0) P.dir = mx;
  // dash
  if (wantDash && P.dashCD <= 0 && (P.ground || P.airDash) && P.hurtT <= 0) {
    P.dashT = .17; P.dashCD = .32; if (!P.ground) P.airDash = false; P.vx = (mx || P.dir) * 360; P.dir = mx || P.dir; P.vy = 0; P.punchT = -1; P.dashHit.clear(); SFX.dash(); P.sx = 1.35; P.sy = .75; dust(P.x, P.y, 5, P.dir);
  }
  if (P.dashT > 0) {
    P.dashT -= dt; P.vy = 0; if (Math.random() < .9) ghosts.push({ x: P.x, y: P.y, f: ANT.anims.run[3], dir: P.dir, a: .6 });
    if (P.dashT <= 0) P.vx = P.dir * 190;
  } else {
    const bm = P.boost > 0 ? 1.5 : 1; const acc = (P.ground ? 2100 : 1800) * bm, max = 195 * bm * (.45 + .55 * amag) * (P.slow ? .42 : 1);
    if (P.hurtT > 0) { } else if (mx) { const rev = Math.sign(P.vx) === -mx; if (rev && P.ground) P.vx = mx * Math.min(80, Math.abs(P.vx) * .4); else if (rev) P.vx = P.vx * Math.pow(.02, dt) + mx * acc * 2 * dt; else if (Math.abs(P.vx) < max) P.vx = mx * Math.min(max, Math.abs(P.vx) + acc * dt); else P.vx = Math.sign(P.vx) * Math.max(max, Math.abs(P.vx) - 900 * dt); }
    else { const fr = (P.ground ? 2200 : 500) * dt; P.vx = Math.abs(P.vx) <= fr ? 0 : P.vx - Math.sign(P.vx) * fr; }
    // gravity
    let gr = 1500; if (P.punchT >= 0 && !P.ground && P.vy > 0) gr = 500;
    if (!K.jump && !K.up && P.vy < -120 && (P.airT || 0) > .09) gr = 2700;
    P.vy = Math.min(P.vy + gr * dt, 560);
  }
  // jump
  if (P.ground) { P.coyote = .12; P.jumps = 1; P.airT = 0; } else { P.airT = (P.airT || 0) + dt; P.coyote -= dt; }
  if (P.flip > 0) P.flip -= dt;
  if (P.buf > 0 && P.coyote > 0 && P.hurtT <= 0) {
    P.vy = P.slow ? -400 : -505; P.coyote = 0; P.buf = 0; P.ground = false; P.sx = .7; P.sy = 1.35; SFX.jump(); dust(P.x, P.y, 5);
    if (P.dashT > 0) { P.dashT = 0; P.vx = P.dir * 230; }
  } else if (P.buf > 0 && P.jumps > 0 && !P.ground && P.hurtT <= 0 && G.deadT <= 0) {
    P.jumps--; P.buf = 0; P.vy = -460; P.dashT = 0; P.flip = .32; if (mx) { P.vx = mx * Math.max(Math.abs(P.vx), 150); P.dir = mx; }
    SFX.djump(); ring(P.x, P.y, '#bfefff'); for (let i = 0; i < 6; i++) parts.push({ x: P.x + rnd(-6, 6), y: P.y, vx: rnd(-80, 80), vy: rnd(20, 90), life: .3, max: .3, c: '#ffffff', sz: 2, g: 0, k: 'sq' });
  }
  // punch
  if (wantPunch && (P.punchT < 0 || P.punchT > .17) && P.hurtT <= 0) {
    P.punchT = 0; P.punchId++; SFX.punch(); if (!P.ground && P.vy > 40) P.vy = 40;
    if (P.dashT > 0) P.dashT = 0;
  }
  if (P.punchT >= 0) { P.punchT += dt; if (P.punchT > .28) P.punchT = -1; }
  // move X
  let nx = P.x + P.vx * dt;
  if (boxHits(nx - PW / 2, P.y - PH, nx + PW / 2, P.y - .5)) { const hit = boxHits(nx - PW / 2, P.y - PH, nx + PW / 2, P.y - .5); nx = P.vx > 0 ? hit.tx * T - PW / 2 - .01 : (hit.tx + 1) * T + PW / 2 + .01; P.vx = 0; if (P.dashT > 0) { P.dashT = 0; } }
  P.x = clamp(nx, PW / 2, G.L.len * T - PW / 2);
  // move Y
  const prevB = P.y; let ny = P.y + P.vy * dt; const was = P.ground; P.ground = false;
  if (P.vy >= 0) {
    const hit = boxHits(P.x - PW / 2 + 1, prevB - 2, P.x + PW / 2 - 1, ny, prevB);
    if (hit) { ny = hit.ty * T; P.vy = 0; P.ground = true; }
  } else {
    const hit = boxHits(P.x - PW / 2 + 1, ny - PH, P.x + PW / 2 - 1, ny - PH + 4);
    if (hit) { ny = (hit.ty + 1) * T + PH; P.vy = 30; }
  }
  P.y = ny;
  moverCollide(prevB);
  updateLevelGimmicks(dt);
  if (P.ground && !was) { P.airDash = true; if (P.wasVy > 260) { SFX.land(); dust(P.x, P.y, 6); P.sx = 1.3; P.sy = .72; } }
  P.wasVy = P.vy > 0 ? P.vy : P.wasVy; if (P.ground) P.wasVy = 0;
  if (!P.ground && P.vy > 0) P.wasVy = P.vy;
  // safe spot
  if (P.ground && P.inv <= 0 && P.hurtT <= 0 && P.dashT <= 0) { const row = Math.floor((P.y + 2) / T); const ok = [-22, -10, 10, 22].every(o => solidAt(Math.floor((P.x + o) / T), row) === 1); if (ok) P.safe = { x: P.x, y: P.y }; }
  // fall / water
  const waterY = (ROWS - BASE - 1.3) * T;
  if ((G.th.water && P.y > waterY + 10) || P.y > ROWS * T + 60) {
    if (G.th.water) { SFX.splash(); for (let i = 0; i < 16; i++) parts.push({ x: P.x + rnd(-8, 8), y: waterY, vx: rnd(-80, 80), vy: rnd(-260, -80), life: .6, max: .6, c: '#bfe8ff', sz: 2, g: 700, k: 'sq' }); }
    if (G.deadT <= 0) {
      if (P.fallCD <= 0 && !G.th.bonus && !GOD.on) { P.inv = 0; const bst = P.boost; P.boost = 0; hurtPlayer(P.x, 2); P.boost = bst; P.fallCD = 1.5; }
      if (P.hp > 0) { P.x = P.safe.x; P.y = P.safe.y - 2; P.vx = 0; P.vy = 0; P.inv = 1.6; P.hurtT = 0; P.dashT = 0; P.punchT = -1; P.lock = .5; P.buf = 0; P.dir = P.safe.dir || P.dir; P.combo = 0; for (let i = 0; i < 10; i++) parts.push({ x: P.x + rnd(-8, 8), y: P.y - rnd(0, 36), vx: rnd(-30, 30), vy: rnd(-80, -20), life: .5, max: .5, c: '#ffffff', sz: 2, g: 0, k: 'star' }); }
      else { P.vy = 0; P.y = Math.min(P.y, (G.th.water ? waterY + 14 : ROWS * T + 60)); }
    } else { P.vy = 0; P.vx = 0; }
  }
  // dust when running
  if (P.ground && Math.abs(P.vx) > 150) { P.dust -= dt; if (P.dust <= 0) { P.dust = .12; dust(P.x - P.dir * 6, P.y, 1, P.dir); } }
  // squash recover
  P.sx = lerp(P.sx, 1, Math.min(1, dt * 14)); P.sy = lerp(P.sy, 1, Math.min(1, dt * 14));
  // combo bank
  if (P.combo > 0) {
    if (P.ground) P.comboT -= dt;
    if (P.comboT <= 0) { if (P.combo >= 2) { const b = P.combo * P.combo * 25; G.score += b; floatText('COMBO ×' + P.combo + '  +' + b, P.x, P.y - 58, '#ff8ae0', 2); SFX.combo(P.combo); confettiSmall(P.x, P.y - 40); } P.combo = 0; }
  }
  // anim
  let a = 'idle';
  if (G.deadT > 0 || P.hurtT > 0) a = 'hurt'; else if (P.punchT >= 0) a = 'punch'; else if (P.dashT > 0) a = 'dash'; else if (!P.ground) a = P.vy < 0 ? 'jump' : 'fall'; else if (Math.abs(P.vx) > 120) a = 'run'; else if (Math.abs(P.vx) > 10) a = 'walk';
  if (a !== P.anim) { P.anim = a; P.at = 0; } P.at += dt;
}
function confettiSmall(x, y) { const cols = ['#ff3b5c', '#ffe45a', '#4ad8ff', '#7cf05a', '#ff8ae0']; for (let i = 0; i < 18; i++) parts.push({ x, y, vx: rnd(-150, 150), vy: rnd(-260, -80), life: rnd(.8, 1.3), max: 1.3, c: cols[i % 5], k: 'conf', g: 380, rot: rnd(0, 6), vr: rnd(-12, 12), drag: true }); }
function playerFrame() {
  const A = ANT.anims;
  switch (P.anim) {
    case 'idle': return A.hurt[0];
    case 'walk': return A.walk[Math.floor(P.at * 13) % 8];
    case 'run': return A.run[Math.floor(P.at * 17) % 8];
    case 'jump': return A.run[3];
    case 'fall': return A.run[1];
    case 'dash': return A.run[3];
    case 'punch': return A.punch[Math.min(7, Math.floor(P.punchT / .28 * 8))];
    case 'hurt': return A.hurt[1 + Math.floor(P.at * 10) % 3];
    case 'win': return A.hurt[1];
  }
  return A.hurt[0];
}
function drawAnt(fi, x, y, dir, { sx = 1, sy = 1, red = false, alpha = 1, white = false } = {}) {
  const cw = ANT.cw, ch = ANT.ch; const src = white ? antWhite : IMG.ant;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(dir * sx, sy);
  ctx.drawImage(src, fi * cw, red ? ch : 0, cw, ch, -cw / 2, -ch, cw, ch); ctx.restore();
}
let antWhite = null;
function drawAntImg(src, fi, x, y, dir, alpha, sx, sy) { const cw = ANT.cw, ch = ANT.ch; ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(dir * sx, sy); ctx.drawImage(src, fi * cw, 0, cw, ch, -cw / 2, -ch, cw, ch); ctx.restore(); }

// ---------- interactions ----------
function interactions(dt) {
  const pl = P.x - PW / 2, pr = P.x + PW / 2, pt = P.y - PH, pb = P.y;
  // punch hitbox
  const pf = P.punchT >= 0 ? Math.floor(P.punchT / .28 * 8) : -1;
  const punchActive = pf >= 2 && pf <= 5;
  const hb = punchActive ? { l: P.dir > 0 ? P.x : P.x - 34, r: P.dir > 0 ? P.x + 34 : P.x, t: P.y - 32, b: P.y - 6 } : null;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const b = enemyBox(e);
    if (e.x < G.camX - 80 || e.x > G.camX + W + 80) continue;
    if (hb && e.hitBy !== P.punchId && hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t) {
      e.hitBy = P.punchId; damageEnemy(e, 1, P.dir, 'punch');
      if (!P.ground) { P.vy = -270; P.airDash = true; } else P.vx -= P.dir * 40;
      continue;
    }
    if (pl < b.r && pr > b.l && pt < b.b && pb > b.t) {
      if (P.boost > 0) { damageEnemy(e, 99, Math.sign(e.x - P.x) || 1, 'boost'); continue; }
      if (P.dashT > 0) { if (!P.dashHit.has(e)) { P.dashHit.add(e); damageEnemy(e, 1, P.dir, 'dash'); } continue; }
      const stomp = P.vy > 40 && (P.y - P.vy * dt) <= b.t + 8;
      if (stomp && (e.type === 'scorp' || e.type === 'cater')) { hurtPlayer(e.x); P.vy = -380; P.inv > 1 && floatText(e.type === 'scorp' ? 'AI! FERRÃO!' : 'AI! PELOS!', P.x, P.y - 50, '#ff3b5c'); continue; }
      if (stomp) { damageEnemy(e, 1, Math.sign(e.x - P.x) || 1, 'stomp'); P.vy = K.jump ? -520 : -380; P.airDash = true; P.jumps = 1; P.sx = .7; P.sy = 1.35; SFX.stomp(); ring(P.x, P.y, '#fff6a0'); e.hitBy = -2; continue; }
      if (e.kb <= 0) hurtPlayer(e.x);
    }
  }
  const B = G.boss;
  if (B && B.active && B.state !== 'dead' && B.state !== 'dying' && !['dig', 'under', 'warn', 'air', 'leapUp', 'cut', 'scatter', 'regroup'].includes(B.state)) {
    const sc = B.kind === 'scorp', open = (sc && (B.state === 'stuck' || B.state === 'dizzy')) || (B.kind === 'frog' && B.state === 'dazed') || (B.kind === 'snake' && B.state === 'stun') || (B.kind === 'flea' && B.state === 'tired') || (B.kind === 'rat' && (B.state === 'stuckP' || B.state === 'relief')), dmg = open ? 2 : 1;
    const bx = B.x + (sc ? B.dir * 10 : 0), bsc = B.kind === 'flea' ? (.55 + .45 * B.hp / B.max) : 1;
    const b = { l: bx - B.w * bsc / 2, r: bx + B.w * bsc / 2, t: B.y - B.h * bsc, b: B.y };
    let done = false;
    if (sc && (B.state === 'stuck' || B.state === 'pull' || B.state === 'strike')) {
      const tx = B.x + B.dir * 96, sb = { l: tx - 14, r: tx + 14, t: B.floorY - 34, b: B.floorY };
      if (hb && B.hitBy !== P.punchId && hb.l < sb.r && hb.r > sb.l && hb.t < sb.b && hb.b > sb.t) { B.hitBy = P.punchId; hitBoss(P.dir, false, B.state === 'stuck' ? 2 : 1); done = true; }
      else if (pl < sb.r && pr > sb.l && pt < sb.b && pb > sb.t) { if (P.dashT > 0 && !P.dashHit.has(B)) { P.dashHit.add(B); hitBoss(P.dir, false, B.state === 'stuck' ? 2 : 1); } else if (B.state === 'strike') hurtPlayer(tx); done = true; }
    }
    if (!done && hb && B.hitBy !== P.punchId && hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t) { B.hitBy = P.punchId; if (hitBoss(P.dir, false, dmg) && !P.ground) { P.vy = -300; P.airDash = true; } }
    else if (!done && pl < b.r && pr > b.l && pt < b.b && pb > b.t) {
      if (P.boost > 0) { hitBoss(Math.sign(B.x - P.x) || 1, false, dmg); }
      else if (P.dashT > 0) { if (!P.dashHit.has(B)) { P.dashHit.add(B); hitBoss(P.dir, false, dmg); P.dashT = 0; P.vx = -P.dir * 200; P.vy = -250; } }
      else if (P.vy > 40 && (P.y - P.vy * dt) <= b.t + 14) {
        if ((sc || B.kind === 'frog') && !open) { hurtPlayer(B.x); P.vy = -420; floatText('AI! ESPINHOS!', P.x, P.y - 50, '#ff3b5c'); }
        else { hitBoss(Math.sign(B.x - P.x) || 1, true, dmg); P.vy = K.jump ? -600 : -500; P.airDash = true; P.jumps = 1; P.sx = .7; P.sy = 1.35; SFX.stomp(); ring(P.x, P.y, '#fff6a0'); }
      }
      else if (!open) hurtPlayer(B.x);
    }
  }
  for (let i = G.waves.length - 1; i >= 0; i--) { const w = G.waves[i]; if (Math.abs(P.x - w.x) < 12 && P.y > w.y - 16 && P.y <= w.y + 2) hurtPlayer(w.x); }
  // sugar
  for (const s of G.sugarList) {
    if (s.got) continue;
    if (s.drop) { s.delay -= dt; s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; const ty = Math.floor(s.y / T), tx = Math.floor(s.x / T); if (s.vy > 0 && solidAt(tx, ty)) { s.y = ty * T; s.vy = -s.vy * .4; s.vx *= .7; } }
    const dx = P.x - s.x, dy = (P.y - 18) - s.y, d2 = dx * dx + dy * dy;
    if ((s.mag && (!s.drop || s.delay <= 0)) || d2 < 50 * 50) { if (d2 < 60 * 60 || s.mag) { const d = Math.sqrt(d2) || 1; const sp = s.drop && s.delay <= 0 ? 420 : 300; if (d2 < 60 * 60 || s.drop) { s.x += dx / d * sp * dt; s.y += dy / d * sp * dt; s.mag = true; } } }
    if (d2 < 16 * 16) {
      s.got = true; G.sugar++; G.score += 10; addSugarMeter();
      G.chain = G.chainT > 0 ? G.chain + 1 : 0; G.chainT = .7; SFX.sugar(G.chain); sparkle(s.x, s.y);
    }
  }
  G.chainT -= dt;
  for (const n of G.nurses) {
    n.t += dt;
    if (!n.used && Math.abs(P.x - n.x) < 26 && Math.abs(P.y - n.y) < 30) {
      if (P.hp < MAXHP) { n.used = true; n.hop = .6; const h0 = P.hp; P.hp = MAXHP; P.inv = Math.max(P.inv, .5); SFX.heal(); floatText('CURADO!', n.x, n.y - 64, '#7cf05a', 2);
        for (let i = 0; i < MAXHP - h0; i++) floats.push({ s: '♥', x: P.x + rnd(-14, 14), y: P.y - 40 - i * 6, c: '#ff3b5c', t: -i * .08, sc: 2 });
        for (let i = 0; i < 14; i++) parts.push({ x: P.x + rnd(-12, 12), y: P.y - rnd(0, 40), vx: rnd(-20, 20), vy: rnd(-90, -40), life: rnd(.5, .9), max: .9, c: i % 2 ? '#ff8aa8' : '#ffffff', sz: 2, g: -40, k: 'star' }); }
      else if (!n.full) { n.full = 1.2; floatText('VIDA CHEIA!', n.x, n.y - 64, '#ffffff'); }
    }
    if (n.full > 0) n.full -= dt; else if (Math.abs(P.x - n.x) > 60) n.full = 0;
    if (n.hop > 0) n.hop -= dt;
  }
  // flag
  if (G.L.flag && !G.flagHidden && !G.clear && Math.abs(P.x - G.L.flag.x) < 14 && P.y <= G.L.flag.y + 2 && P.y > G.L.flag.y - 120) startClear();
}

function addSugarMeter() {
  G.sugarMeter++;
  if (G.sugarMeter >= 10) { G.sugarMeter = 0; P.boost = 5; SFX.powerup(); fx.flash = .18; fx.shake = 3; floatText('TURBO!', P.x, P.y - 60, '#ffe45a', 3); confettiSmall(P.x, P.y - 30); ring(P.x, P.y - 20, '#ffe45a'); }
}
// ---------- clear sequence ----------
function startClear() {
  CHK = null;
  const time = G.time; if (G.def.id === 'banheiro') { floatText('GLUB GLUB! PARA O ESGOTO!', P.x, P.y - 60, '#7ff0ff', 2); SFX.splash(); }
  G.clear = { t: 0, flagY: 0, phase: 0, tally: 0, stars: 0, shown: [0, 0, 0, 0], time };
  P.ctrl = false; P.vx = 0; P.dashT = 0; P.punchT = -1; P.combo > 1 && (G.score += P.combo * P.combo * 25); P.combo = 0;
  SFX.flag(); playSong(null); fx.shake = 3;
  const sR = G.sugar / Math.max(1, G.sugarTotal), kR = G.enemiesTotal ? G.kills / G.enemiesTotal : 1;
  let stars = 1; if (sR >= .6 || kR >= .7) stars = 2; if (sR >= .85 && kR >= .8) stars = 3;
  G.clear.stars = stars;
  const timeBonus = Math.max(0, Math.round((G.L.len * .42 - time) * 20));
  G.clear.rows = [['AÇÚCAR', G.sugar + '/' + G.sugarTotal], ['BEBÊS SALVOS', (G.babiesGot || 0) + '/3'], ['INIMIGOS', G.kills + '/' + G.enemiesTotal], ['COMBO MÁXIMO', '×' + G.maxCombo], ['TEMPO', fmtTime(time) + (timeBonus ? '  +' + timeBonus : '')]];
  G.score += timeBonus;
  const i = G.i; prog.stars[i] = Math.max(prog.stars[i] || 0, stars); const first = prog.unlocked <= i + 1; if (first) prog.unlocked = Math.min(LEVELS.length + 1, i + 2); store.set('prog', prog);
  G.clear.advance = first && i < LEVELS.length - 1;
  const best = store.get('best', [0, 0, 0, 0]); best[i] = Math.max(best[i] || 0, G.score); store.set('best', best);
}
const fmtTime = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
function updateClear(dt) {
  const C = G.clear; C.t += dt;
  // player hop + flag rise
  const f = G.L.flag;
  if (C.t < .9) { C.flagY = Math.min(1, C.t / .8); if (Math.random() < .5) sparkle(f.x + 6, f.y - 20 - C.flagY * 70, '#ffe45a'); }
  if (C.phase === 0 && C.t > .85) { C.phase = 1; SFX.fanfare(); confetti(f.x, f.y - 90, 70); confetti(P.x, P.y - 40, 40); fx.shake = 5; fx.flash = .25; ring(f.x, f.y - 90, '#ffe45a'); }
  if (C.phase >= 1) { P.anim = 'win'; if (P.ground && C.t % .6 < dt) { P.vy = -330; P.ground = false; P.sx = .75; P.sy = 1.3; } }
  if (C.phase === 1 && C.t > 1.5) { C.phase = 2; C.rt = 0; }
  if (C.phase === 2) { C.rt += dt; const n = Math.min(4, Math.floor(C.rt / .22) + 1); for (let i = 0; i < n; i++) if (!C.shown[i]) { C.shown[i] = 1; SFX.tick(); SFX.pop(); } if (C.rt > 1.0) { C.phase = 3; C.st = 0; C.starShown = 0; } }
  if (C.phase === 3) { C.st += dt; const n = Math.min(C.stars, Math.floor(C.st / .28)); while (C.starShown < n) { SFX.star(C.starShown); fx.shake = 3; burstScreen(W / 2 - 44 + C.starShown * 44, 248); C.starShown++; } if (C.st > C.stars * .28 + .4) C.phase = 4; }
  if (C.phase === 4 && (KP.jump || KP.tap || KP.punch)) { SFX.select(); C.phase = 5; startWipe(() => { gotoMap(G.clear.advance); }, P.x - G.camX, P.y - 20 - G.camY); }
  if ((C.phase === 2 || C.phase === 3) && (KP.jump || KP.tap)) { C.phase = 4; C.shown = [1, 1, 1, 1]; while (C.starShown < C.stars) { SFX.star(C.starShown); C.starShown++; } }
}
const screenParts = [];
function burstScreen(x, y) { const cols = ['#ffe45a', '#ffffff', '#ffb52a']; for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2, s = rnd(60, 200); screenParts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .6, c: cols[i % 3] }); } }

// ---------- update play ----------
function updatePlay(dt) {
  if (KP.pause) { paused = !paused; }
  if (paused) return;
  if (G.intro > 0) G.intro -= dt;
  if (fx.stop > 0) { fx.stop -= dt; return; }
  if (!G.clear && G.deadT <= 0) G.time += dt;
  if (G.vertical) {
    updateVert(dt); if (G.clear) updateClear(dt);
    if (G.deadT > 0) { G.deadT -= dt; if (G.deadT <= 0) startWipe(() => loadLevel(G.i), P.x - G.camX, P.y - 20 - G.camY); }
    G.camX = 0; G.camY = clamp(lerp(G.camY, P.y - H * .58, Math.min(1, dt * 6)), 0, G.L.worldH - H); return;
  }
  if (G.def.id === 'cozinha') updateFall(dt);
  if (G.fallScene) { updateFallScene(dt); return; }
  updatePlayer(dt);
  for (const e of G.enemies) updateEnemy(e, dt);
  if (G.boss) updateBoss(dt);
  if (G.dogP) updatePaws(dt);
  if (G.haz) updateHaz(dt);
  if (G.movers) updateBath(dt);
  if (G.bgAnts) updateBgAnts(dt);
  if (G.bossBanner > 0) G.bossBanner -= dt;
  if (G.flagPop < 1) G.flagPop = Math.min(1, G.flagPop + dt * 1.6);
  if (!G.clear && G.deadT <= 0) { interactions(dt); if (G.haz) hazards(dt); }
  else if (G.clear) { // still collect sugar & physics
    for (const s of G.sugarList) if (!s.got && s.drop) { s.got = true; G.sugar++; }
  }
  if (G.clear) updateClear(dt);
  if (G.deadT > 0) { G.deadT -= dt; if (G.deadT <= 0) startWipe(() => loadLevel(G.i), P.x - G.camX, P.y - 20 - G.camY); }
  // camera
  const look = P.dir * 50 + P.vx * .15;
  let tx = clamp(P.x - W / 2 + look, 0, G.L.len * T - W);
  if (G.L.split && G.fallDone) { tx = Math.max(tx, G.L.splitX); if (P.x < G.L.splitX + 10) { P.x = G.L.splitX + 10; if (P.vx < 0) P.vx = 0; } }
  if (G.boss && G.boss.active && G.boss.state !== 'dead') { tx = clamp(clamp(tx, G.boss.arenaL, Math.max(G.boss.arenaL, G.boss.arenaR - W)), 0, G.L.len * T - W); if (P.x < G.boss.arenaL + 10) { P.x = G.boss.arenaL + 10; if (P.vx < 0) P.vx = 0; } }
  G.camX = lerp(G.camX, tx, Math.min(1, dt * 6));
  G.camY = clamp(lerp(G.camY, P.y - H * .62, dt * 4), 0, ROWS * T - H);
}

// ---------- draw play ----------
function drawLayer(img, x, y, alpha = 1) {
  const w = img.width; const fl = flipped(img);
  let ox = -(((x % (2 * w)) + 2 * w) % (2 * w));
  ctx.globalAlpha = alpha;
  for (let k = 0; ox + k * w < W; k++) ctx.drawImage(k % 2 ? fl : img, Math.round(ox + k * w), Math.round(y));
  ctx.globalAlpha = 1;
}
function drawPlay() {
  if (G.fallScene) { drawFallScene(); return; }
  if (G.vertical) { drawVert(); return; }
  const sh = fx.shake > .2 ? fx.shake : 0;
  const cx = Math.round(G.camX + rnd(-sh, sh)), cy = Math.round(G.camY + rnd(-sh, sh));
  // background
  for (const l of G.layers) {
    if (l.tint) { ctx.fillStyle = l.tint; ctx.fillRect(0, 0, W, H); continue; }
    let la = l.a ?? 1; if (l.zone) { const k = G.fallDone ? 1 : 0; if (l.zone === 'b' ? !k : k) continue; }
    drawLayer(IMG[l.img], cx * l.sp, l.y - (l.sp < .1 ? 0 : cy * l.sp * .5), la);
    if (l.dog) drawDogBG(cx, cy);
  }
  if (G.bgAnts) drawBgAnts(cx, cy);
  // water back
  const th = G.th;
  if (th.water) { const wy = (ROWS - BASE - 1.3) * T - cy; ctx.fillStyle = th.wc ? th.wc[0] : 'rgba(40,90,110,0.55)'; ctx.fillRect(0, wy, W, H - wy); }
  // tiles
  if (G.fall) drawFallDog(cx, cy);
  const hideFloor = !!G.L.split; if (hideFloor) { ctx.save(); ctx.beginPath(); if (G.fallDone) ctx.rect(Math.max(0, G.L.splitX - cx), 0, W, H); else ctx.rect(0, 0, Math.max(0, G.L.splitX - cx), H); ctx.clip(); }
  ctx.drawImage(G.tiles, cx, cy, W, H, 0, 0, W, H);
  if (G.haz) drawHazBack(cx, cy);
  // flag
  if (G.L.flag && !G.flagHidden) { const fy = G.L.flag.y - cy; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, fy); ctx.clip(); const e = 1 - Math.pow(1 - G.flagPop, 3); drawFlag(G.L.flag.x - cx, fy + (1 - e) * 130); ctx.restore(); }
  // sugar
  for (const s of G.sugarList) { if (s.got) continue; const x = s.x - cx, y = s.y - cy + (s.drop ? 0 : Math.sin(gtime * 4 + s.bob) * 2); if (x < -10 || x > W + 10) continue; ctx.drawImage(SPR.sugar, Math.round(x - 5), Math.round(y - 5)); if (((gtime * 2 + s.bob) % 3) < .15) { ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(x + 2), Math.round(y - 7), 1, 3); ctx.fillRect(Math.round(x + 1), Math.round(y - 6), 3, 1); } }
  // enemies
  for (const n of G.nurses) { const x = Math.round(n.x - cx), y = Math.round(n.y - cy); if (x < -60 || x > W + 60) continue;
    ctx.drawImage(SPR.station, x - 34, y - 66); const hop = n.hop > 0 ? -Math.abs(Math.sin(n.hop * 16)) * 6 : 0; const bob = Math.round(Math.sin(n.t * 3) * .6);
    ctx.save(); ctx.translate(x + 10, y + hop); ctx.scale(P.x < n.x ? -1 : 1, 1 + bob * .02); ctx.drawImage(SPR.nurse, -ANT.cw / 2, -ANT.ch); ctx.restore();
    if (!n.used) { const b = Math.sin(gtime * 4) * 2; ctx.drawImage(SPR.heart, x + 4, y - 84 + b, 11, 10); text('+', x - 4, y - 80 + b, { color: '#7cf05a' }); } }
  if (G.movers) drawBath(cx, cy);
  // checkpoints
  if (G.checkpoints) {
    for (const cp of G.checkpoints) {
      const x = Math.round(cp.x - cx), y = Math.round(cp.y - cy);
      if (x < -30 || x > W + 30) continue;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 2, y - 28, 5, 28);
      ctx.fillStyle = '#9a6030'; ctx.fillRect(x - 1, y - 27, 3, 27);
      const fCol = cp.active ? '#3b9eff' : '#605568';
      const bCol = cp.active ? '#7fd0ff' : '#887d90';
      const wave = cp.active ? Math.sin(gtime * 6) * 3 : 0;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 2, y - 26, 12, 9);
      ctx.fillStyle = fCol; ctx.fillRect(x + 2, y - 25, 10, 7);
      ctx.fillStyle = bCol; ctx.fillRect(x + 3, y - 24 + wave * 0.3, 4, 3);
    }
  }
  // springs
  if (G.springs) {
    for (const sp of G.springs) {
      const x = Math.round(sp.x - cx), y = Math.round(sp.y - cy);
      if (x < -30 || x > W + 30) continue;
      const sq = sp.squish > 0 ? (sp.squish / .3) : 0;
      const sh = 10 * (1 - sq * .6);
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 7, y - sh - 2, 14, sh + 2);
      ctx.fillStyle = '#f09020'; ctx.fillRect(x - 6, y - sh - 1, 12, sh);
      ctx.fillStyle = '#ffe050'; ctx.fillRect(x - 4, y - sh, 8, 2);
      ctx.fillRect(x - 2, y - sh / 2, 4, 2);
    }
  }
  // baby ants
  if (G.babies) {
    for (const b of G.babies) {
      if (b.got) continue;
      const x = Math.round(b.x - cx), y = Math.round(b.y - cy + Math.sin(gtime * 4 + b.bob) * 3);
      if (x < -30 || x > W + 30) continue;
      ctx.fillStyle = 'rgba(255,230,90,.3)'; ctx.beginPath(); ctx.arc(x, y - 8, 11, 0, 7); ctx.fill();
      ctx.drawImage(SPR.baby, x - 7, y - 14);
    }
  }
  // crumbs
  if (G.crumbs) {
    for (const c of G.crumbs) {
      if (c.dead) continue;
      const x0 = Math.round(c.x - cx), y = Math.round(c.y - cy);
      if (x0 + c.w < -10 || x0 > W + 10) continue;
      const shk = c.shake > 0 ? (Math.random() * 2 - 1) : 0;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x0 - 1, y - 1 + shk, c.w + 2, 6);
      ctx.fillStyle = c.shake > .4 ? '#d08040' : '#8a9a40'; ctx.fillRect(x0, y + shk, c.w, 4);
      ctx.fillStyle = '#4a5020'; for (let xx = x0 + 4; xx < x0 + c.w - 2; xx += 8) ctx.fillRect(xx, y + 1 + shk, 2, 2);
    }
  }
  // switches and gates
  if (G.switches) {
    for (const sw of G.switches) {
      const x = Math.round(sw.x - cx), y = Math.round(sw.y - cy);
      if (x > -30 && x < W + 30) {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 6, y - 14, 12, 14);
        ctx.fillStyle = sw.on ? '#7ff0ff' : '#ff4a7a'; ctx.fillRect(x - 4, y - 12, 8, 10);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 10, 4, 3);
      }
      if (!sw.on) {
        const gx = Math.round(sw.gx * T - cx), gy = Math.round((ROWS - sw.gh - sw.ghh) * T - cy), gw = sw.gw * T, gh = sw.ghh * T;
        if (gx + gw > -10 && gx < W + 10) {
          ctx.fillStyle = '#1a1020'; ctx.fillRect(gx - 1, gy - 1, gw + 2, gh + 2);
          ctx.fillStyle = '#8a5028'; ctx.fillRect(gx, gy, gw, gh);
          ctx.fillStyle = '#c48040'; for (let yy = gy + 4; yy < gy + gh - 4; yy += 8) ctx.fillRect(gx + 2, yy, gw - 4, 2);
        }
      }
    }
  }
  for (const e of G.enemies) drawEnemy(e, cx, cy);
  if (G.boss) drawBoss(cx, cy);
  for (const w of G.waves) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy); const a = clamp(w.life * 2, 0, 1); ctx.globalAlpha = a; ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 6, y - 13, 12, 13); ctx.fillStyle = '#ffe8b0'; ctx.fillRect(x - 5, y - 12, 10, 12); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3 + w.dir, y - 15, 6, 4); ctx.fillStyle = '#e8b060'; ctx.fillRect(x - 5, y - 4, 10, 4); ctx.globalAlpha = 1; }
  // ghosts
  for (const g of ghosts) { if (g.gold) { if (!SPR.antGold) SPR.antGold = tinted(IMG.ant, '#ffe45a'); drawAntImg(SPR.antGold, g.f, g.x - cx, g.y - cy, g.dir, g.a * .5, 1, 1); } else drawAnt(g.f, g.x - cx, g.y - cy, g.dir, { alpha: g.a * .6, white: true }); }
  // player
  const blink = P.inv > 0 && G.deadT <= 0 && Math.floor(gtime * 20) % 2 === 0;
  if (!blink && P.scream) drawScream(cx, cy); else if (!blink) {
    if (P.flip > 0) { const a = (1 - P.flip / .32) * Math.PI * 2 * P.dir; ctx.save(); ctx.translate(Math.round(P.x - cx), Math.round(P.y - cy - 24)); ctx.rotate(a); drawAnt(ANT.anims.run[3], 0, 24, P.dir); ctx.restore(); }
    else drawAnt(playerFrame(), P.x - cx, P.y - cy, P.dir, { sx: P.sx, sy: P.sy });
    if (P.boost > 0 && (P.boost > 1.2 || Math.floor(gtime * 12) % 2)) { if (!SPR.antGold) SPR.antGold = tinted(IMG.ant, '#ffe45a'); const pulse = .5 + Math.sin(gtime * 20) * .15; if (P.flip <= 0) drawAntImg(SPR.antGold, playerFrame(), P.x - cx, P.y - cy, P.dir, pulse, P.sx, P.sy); }
  }
  // water front
  if (th.water) { const wy = (ROWS - BASE - 1.3) * T - cy; ctx.fillStyle = th.wc ? th.wc[1] : 'rgba(60,140,160,0.45)'; ctx.fillRect(0, wy + 3, W, H - wy); ctx.fillStyle = th.wc ? th.wc[2] : 'rgba(210,245,255,0.7)'; for (let x = 0; x < W; x += 8) { const yy = wy + Math.round(Math.sin((x + cx) * .08 + gtime * 3) * 1.5); ctx.fillRect(x, yy, 5, 1); } }
  if (G.haz) drawHazFront(cx, cy);
  if (G.dogP) drawPaws(cx, cy);
  drawParts(cx, cy);
  if (hideFloor) ctx.restore();
  // foreground silhouette
  if (!G.silh) G.silh = tinted(IMG.silh, th.silh);
  if (G.L.theme2 && !G.silh2) G.silh2 = tinted(IMG.silh, THEMES[G.L.theme2].silh);
  if (G.silh2 && !G.zoneB && P.x > G.L.splitX) { G.zoneB = true; G.silh = G.silh2; G.th = THEMES[G.L.theme2]; }
  drawLayer(G.silh, cx * 1.3, H - 28, .9);
  // HUD
  drawHUD();
  if (G.intro > 0) drawIntro();
  if (G.clear) drawClear();
  if (fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${fx.flash * 2})`; ctx.fillRect(0, 0, W, H); }
  if (paused) { ctx.fillStyle = 'rgba(10,6,20,0.65)'; ctx.fillRect(0, 0, W, H); text('PAUSA', W / 2, 140, { s: 4, color: '#ffe45a', align: 'center' }); text(isTouch ? 'TOQUE EM ❚❚ PARA CONTINUAR' : 'ESC PARA CONTINUAR  •  M SOM', W / 2, 190, { s: 1, align: 'center' }); }
}
function drawFlag(x, y) {
  if (G && G.def && G.def.id === 'banheiro') { const im = IMG.grate; ctx.save(); ctx.translate(x, y + 2); if (G.clear) ctx.rotate(Math.sin(gtime * 30) * .02); ctx.drawImage(im, -im.width / 2, -6); ctx.restore(); if (!G.clear) text('RALO', x, y - 30 + Math.sin(gtime * 5) * 2, { color: '#7ff0ff', align: 'center' }); return; }
  const C = G.clear; const k = C ? C.flagY : 0;
  ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 2, y - 104, 5, 104); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 1, y - 103, 3, 103); ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 103, 1, 103);
  ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x + .5, y - 106, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.arc(x + .5, y - 106, 3, 0, 7); ctx.fill();
  const fy = y - 22 - k * 74;
  for (let i = 0; i < 26; i++) { const wv = Math.round(Math.sin(gtime * 8 - i * .4) * 2 * (i / 26)); ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 2 + i, fy - 1 + wv, 1, 20 - i * .5 + 2); ctx.fillStyle = i < 3 ? '#c81e3a' : (C && C.phase >= 1 ? '#7cf05a' : '#ff3b5c'); ctx.fillRect(x + 2 + i, fy + wv, 1, Math.max(1, 18 - i * .5)); }
  // base mound
  ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 6, y - 4, 13, 4); ctx.fillStyle = '#8a6a4a'; ctx.fillRect(x - 5, y - 3, 11, 3);
  if (!C) { const bb = Math.sin(gtime * 5) * 2; text('META', x + 1, y - 124 + bb, { color: '#ffe45a', align: 'center' }); }
}
function drawEnemy(e, cx, cy) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy);
  if (x < -60 || x > W + 60) return;
  const white = e.flash > 0;
  if (e.type === 'ant') {
    const f = ANT.anims.walk[Math.floor(e.t * (e.kb > 0 ? 0 : 10)) % 8];
    ctx.save(); if (e.dead) { ctx.translate(x, y - 20); ctx.rotate(e.rot); ctx.translate(-x, -(y - 20)); }
    drawAnt(e.dead ? ANT.anims.hurt[3] : f, x, y, e.dir, { red: !white, white });
    ctx.restore(); return;
  }
  if (e.type === 'frog') {
    const pose = e.air ? 'jump' : (e.state === 'wind' || e.state === 'tongue') ? 'open' : 'sit'; const img = (white ? SPR.frogW : SPR.frog)[pose];
    if (e.tongue > 0 && !e.dead) { const mx = x + e.dir * 50, my = y - 30, tx = mx + e.dir * e.tongue; ctx.fillStyle = '#1a1020'; ctx.fillRect(Math.min(mx, tx), my - 3, Math.abs(tx - mx), 6); ctx.fillStyle = '#ff7aa0'; ctx.fillRect(Math.min(mx, tx), my - 2, Math.abs(tx - mx), 4); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(tx, my, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#ff5a8a'; ctx.beginPath(); ctx.arc(tx, my, 5, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x + (e.state === 'wind' ? Math.round(Math.sin(gtime * 60)) : 0), y); if (e.dead) ctx.rotate(e.rot); ctx.scale(e.dir, 1); ctx.drawImage(img, -92, -91); ctx.restore();
    if (e.state === 'wind' && !e.dead) text('!', x, y - 100, { s: 2, color: '#ff3b5c', align: 'center' });
    return;
  }
  if (e.type === 'spider') { ctx.fillStyle = 'rgba(230,230,255,0.7)'; ctx.fillRect(x, e.top - cy, 1, y - (e.top - cy) - 14); }
  const fi = e.type === 'stick' && !e.awake ? 0 : e.type === 'hopper' ? (e.air ? 1 : 0) : Math.floor(e.t * (e.type === 'mosca' ? 30 : e.type === 'lady' || e.type === 'ladyC' ? (e.state === 'dive' ? 24 : 14) : 8)) % 2;
  const fr = SPR[e.type][fi];
  let img = fr; if (white) { e._w = e._w || {}; img = e._w[fr.width + '_' + (fr === SPR[e.type][0])] ||= tinted(fr, '#ffffff'); }
  ctx.save(); ctx.translate(x, y);
  if (e.dead) { ctx.rotate(e.rot); }
  const flip = (e.type === 'spider') ? 1 : -e.dir * -1;
  { const es = e.type === 'scorp' ? 1.1 : e.type === 'roachB' ? 1.3 : 1; ctx.scale((e.type === 'spider' ? 1 : (e.dir > 0 ? 1 : -1)) * es, es); }
  if (e.type === 'scorp' && e.state === 'wind') ctx.translate(Math.round(Math.sin(gtime * 60) * 1), 0);
  if (e.type === 'mosca' && !e.dead) ctx.translate(Math.round(Math.sin(gtime * 47 + e.ox) * 1.5), Math.round(Math.cos(gtime * 53 + e.ox) * 1.5));
  if ((e.type === 'ladyC' || e.type === 'mosca') && e.state === 'aim' && !e.dead) ctx.translate(Math.round(Math.sin(gtime * 70)), 0);
  const oy = e.type === 'mosca' || e.type === 'lady' || e.type === 'ladyC' || e.type === 'spider' || e.type === 'fly' ? -img.height + 2 : -img.height + 1;
  ctx.drawImage(img, -Math.round(img.width / 2), oy);
  ctx.restore();
  if ((e.type === 'ladyC' || e.type === 'mosca') && e.state === 'aim' && !e.dead) text('!', x, y - 30, { s: 2, color: '#ff3b5c', align: 'center' });
  if (e.type === 'rat' && e.state === 'wind' && !e.dead) text('!', x, y - 34, { s: 2, color: '#ff3b5c', align: 'center' });
  if (e.type === 'scorp' && e.state === 'wind' && !e.dead) text('!', x, y - 34, { s: 2, color: '#ff3b5c', align: 'center' });
}
function drawHUD() {
  if (GOD.on) text('GOD', 12, 30, { color: '#ffe45a' });
  for (let i = 0; i < MAXHP / 2; i++) { const v = P.hp - i * 2; const low = P.hp <= 2 && Math.floor(gtime * 4) % 2; ctx.drawImage(v >= 2 ? SPR.heart : v === 1 ? SPR.heartH : SPR.heartE, 10 + i * 14, 10 + (low && v > 0 ? -1 : 0), 11, 10); }
  ctx.drawImage(SPR.sugar, 70, 10); text('×' + G.sugar, 83, 14);
  ctx.drawImage(SPR.baby, 120, 8); text((G.babiesGot || 0) + '/3', 137, 14, { color: '#ffe45a' });
  { const bx = 70, by = 23, w = 50; ctx.fillStyle = '#1a1020'; ctx.fillRect(bx - 1, by - 1, w + 2, 6); if (P.boost > 0) { ctx.fillStyle = ['#ffe45a', '#ff8ae0', '#7ff0ff'][Math.floor(gtime * 10) % 3]; ctx.fillRect(bx, by, w * P.boost / 5, 4); text('TURBO', bx + w + 6, by + 2, { color: '#ffe45a' }); } else { ctx.fillStyle = '#3a2c48'; ctx.fillRect(bx, by, w, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, by, w * G.sugarMeter / 10, 4); for (let i = 1; i < 10; i++) { ctx.fillStyle = '#1a1020'; ctx.fillRect(bx + i * 5, by, 1, 4); } } }
  text(String(G.score).padStart(6, '0'), W - (isTouch ? 58 : 10), 14, { align: 'right', color: '#ffe45a' });
  text(G.def.sub + ' • ' + G.th.name, W / 2, 14, { align: 'center', alpha: .85 });
  const BB = G.boss; const bossBar = BB && BB.active && BB.state !== 'dead';
  if (bossBar) { text(BB.name, W / 2, 32, { align: 'center', color: BB.nameCol }); ctx.fillStyle = '#1a1020'; ctx.fillRect(W / 2 - 102, 42, 204, 9); ctx.fillStyle = '#4a1020'; ctx.fillRect(W / 2 - 100, 44, 200, 5); BB.shownHp = lerp(BB.shownHp ?? BB.hp, BB.hp, .15); ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 2 - 100, 44, 200 * BB.shownHp / BB.max, 5); ctx.fillStyle = BB.hp <= BB.max * .4 ? '#ff7a2a' : '#7cf05a'; ctx.fillRect(W / 2 - 100, 44, 200 * Math.max(0, BB.hp) / BB.max, 5); }
  if (bossBar) ctx.translate(0, 30);
  if (P.combo >= 2) { const pop = 1 + Math.max(0, .3 - (1.6 - P.comboT)) * 2; text('COMBO', W / 2, 34, { align: 'center', color: '#7ff0ff' }); text('×' + P.combo, W / 2, 46, { s: Math.round(2 * pop) || 2, align: 'center', color: '#ff8ae0' }); const w = 40 * clamp(P.comboT / 1.6, 0, 1); ctx.fillStyle = '#1a1020'; ctx.fillRect(W / 2 - 21, 66, 42, 4); ctx.fillStyle = '#7ff0ff'; ctx.fillRect(W / 2 - 20, 67, w, 2); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (G.bossBanner > 0) { const t = 2.4 - G.bossBanner; const k = t < .25 ? t / .25 : G.bossBanner < .3 ? G.bossBanner / .3 : 1; ctx.fillStyle = `rgba(60,10,20,${.6 * k})`; ctx.fillRect(0, 120, W, 90); text('MINI-CHEFE!', W / 2, 138, { s: 2, align: 'center', color: '#ff3b5c', alpha: k }); text(G.boss.name, W / 2 + (1 - k) * 200, 168, { s: 3, align: 'center', color: G.boss.nameCol, alpha: k }); text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'rat' ? 'DICA: FUJA DO PUM VERDE! BATA QUANDO O COCÔ PRENDER' : G.boss.kind === 'flea' ? 'DICA: PULE A ONDA! BATA QUANDO ELA CANSAR' : G.boss.kind === 'snake' ? 'DICA: BATA NA CABEÇA DEPOIS DO BOTE! SÓ OS ESPINHOS E O VENENO DOEM' : G.boss.kind === 'frog' ? 'DICA: PULE A LÍNGUA BAIXA E FUJA DA SUCÇÃO!' : G.boss.kind === 'scorp' ? 'DICA: PISAR NAS COSTAS DÓI! USE SOCO E DASH' : 'DICA: PULE AS ONDAS DE CHOQUE', W / 2, 196, { align: 'center', alpha: k }); }
}

function drawIntro() {
  const t = 1.6 - G.intro; const ease = t < .3 ? t / .3 : t > 1.3 ? 1 - (t - 1.3) / .3 : 1;
  ctx.fillStyle = `rgba(10,6,20,${.55 * ease})`; ctx.fillRect(0, 130, W, 80);
  const xo = (1 - ease) * (t < .3 ? -300 : 300);
  text('FASE ' + G.def.sub, W / 2 + xo, 146, { s: 2, align: 'center', color: '#ffe45a' });
  text(G.th.name, W / 2 + xo, 172, { s: 3, align: 'center' });
}
function drawClear() {
  const C = G.clear;
  if (C.phase >= 1) {
    const t = C.t - .85; const s = t < .25 ? lerp(.2, 1.15, t / .25) : t < .4 ? lerp(1.15, 1, (t - .25) / .15) : 1;
    ctx.fillStyle = `rgba(10,6,20,${Math.min(.6, t * 2)})`; ctx.fillRect(0, 0, W, H);
    const sc = Math.max(1, Math.round(4 * s));
    text('FASE COMPLETA!', W / 2, 54 + Math.sin(gtime * 4) * 2, { s: sc, align: 'center', color: '#ffe45a' });
  }
  if (C.phase >= 2) {
    C.rows.forEach((r, i) => { if (!C.shown[i]) return; const y = 112 + i * 24; text(r[0], W / 2 - 130, y, { s: 2, color: '#ffffff' }); text(r[1], W / 2 + 130, y, { s: 2, align: 'right', color: '#7ff0ff' }); });
    text('PONTOS  ' + G.score, W / 2, 212, { s: 2, align: 'center', color: '#ffe45a' });
  }
  if (C.phase >= 3) {
    for (let i = 0; i < 3; i++) { const on = i < (C.starShown || 0); const x = W / 2 - 44 + i * 44, y = 248; ctx.drawImage(on ? SPR.star : SPR.starE, x - 15, y - 15, 30, 30); }
  }
  for (let i = screenParts.length - 1; i >= 0; i--) { const p = screenParts[i]; p.life -= 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 4; if (p.life <= 0) { screenParts.splice(i, 1); continue; } ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
  if (C.phase >= 4 && Math.floor(gtime * 2.5) % 2 === 0) text(isTouch ? 'TOQUE PARA CONTINUAR' : 'APERTE PULO PARA CONTINUAR', W / 2, 300, { s: 1, align: 'center' });
}

// ---------- MAP ----------
const NODES = [
  { x: 112, y: 286, name: 'FORMIGUEIRO' }, { x: 248, y: 196, name: 'CAIXA DE AREIA' }, { x: 408, y: 262, name: 'POÇA DE LAMA' }, { x: 540, y: 150, name: 'GRAMADO' }, { x: 330, y: 98, name: 'PAREDE DA CASA' }, { x: 160, y: 40, name: 'COZINHA' }, { x: 420, y: 40, name: 'BANHEIRO' }, { x: 596, y: 318, name: 'ESGOTO' }
];
const PATHS = [[[112, 286], [150, 230], [200, 210], [248, 196]], [[248, 196], [310, 190], [360, 290], [408, 262]], [[408, 262], [470, 230], [470, 170], [540, 150]], [[540, 150], [500, 105], [400, 125], [330, 98]], [[330, 98], [290, 80], [200, 70], [160, 40]], [[160, 40], [230, 62], [350, 62], [420, 40]], [[420, 40], [520, 120], [630, 220], [596, 318]]];
function bez(p, t) { const [a, b, c, d] = p; const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; }
let mapCanvas = null;
function buildMap() {
  const [c, x] = mkCanvas(W, H); const r = rng(42);
  // lawn
  x.fillStyle = '#5aa83a'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 40) { x.fillStyle = (i / 40) % 2 ? '#62b240' : '#56a236'; x.fillRect(i, 70, 40, H); }
  for (let i = 0; i < 1400; i++) { x.fillStyle = r() < .5 ? '#4a9a2e' : '#7ac84e'; x.fillRect(Math.floor(r() * W), 70 + Math.floor(r() * (H - 70)), 1, 2); }
  // house
  x.fillStyle = '#e8d8c0'; x.fillRect(60, 0, 380, 56); x.fillStyle = '#c8b090'; x.fillRect(60, 50, 380, 6);
  for (let i = 0; i < 5; i++) { x.fillStyle = '#1a1020'; x.fillRect(84 + i * 72, 12, 34, 26); x.fillStyle = '#7ac8f0'; x.fillRect(86 + i * 72, 14, 30, 22); x.fillStyle = '#b8e8ff'; x.fillRect(86 + i * 72, 14, 30, 4); x.fillStyle = '#1a1020'; x.fillRect(100 + i * 72, 14, 2, 22); }
  x.fillStyle = '#9a6a3a'; x.fillRect(250, 22, 30, 34); x.fillStyle = '#7a4a22'; x.fillRect(254, 26, 22, 30); x.fillStyle = '#ffd040'; x.fillRect(270, 40, 3, 3);
  x.fillStyle = '#b84a2a'; x.fillRect(50, 0, 400, 6);
  // patio
  x.fillStyle = '#b8a890'; x.fillRect(200, 56, 130, 14); for (let i = 200; i < 330; i += 13) { x.fillStyle = '#a09078'; x.fillRect(i, 56, 1, 14); }
  // fence right
  for (let i = 460; i < W; i += 14) { x.fillStyle = '#1a1020'; x.fillRect(i, 4, 10, 58); x.fillStyle = '#e8c890'; x.fillRect(i + 1, 5, 8, 56); x.fillStyle = '#c8a070'; x.fillRect(i + 1, 50, 8, 11); }
  x.fillStyle = '#c8a070'; x.fillRect(460, 20, 180, 4); x.fillRect(460, 44, 180, 4);
  // tree shadow + tree
  x.fillStyle = 'rgba(20,60,20,0.35)'; x.beginPath(); x.ellipse(30, 120, 70, 40, 0, 0, 7); x.fill();
  [[20, 90, 60, '#2e7a2a'], [50, 70, 40, '#3a9a32'], [5, 70, 30, '#3a9a32'], [35, 80, 22, '#5ac84a']].forEach(([a, b, rr, col]) => { x.fillStyle = col; x.beginPath(); x.arc(a, b, rr, 0, 7); x.fill(); });
  // anthill (node 1)
  x.fillStyle = 'rgba(40,20,10,0.3)'; x.beginPath(); x.ellipse(116, 300, 60, 22, 0, 0, 7); x.fill();
  x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(112, 290, 48, 24, 0, 0, 7); x.fill();
  x.fillStyle = '#b8642a'; x.beginPath(); x.ellipse(112, 289, 46, 22, 0, 0, 7); x.fill(); x.fillStyle = '#d8843a'; x.beginPath(); x.ellipse(106, 283, 30, 13, 0, 0, 7); x.fill();
  for (let i = 0; i < 60; i++) { x.fillStyle = r() < .5 ? '#9a4e1e' : '#f0a050'; const a = r() * 7, d = r(); x.fillRect(Math.round(112 + Math.cos(a) * 44 * d), Math.round(289 + Math.sin(a) * 20 * d), 2, 2); }
  x.fillStyle = '#2a1008'; x.beginPath(); x.ellipse(112, 282, 7, 4, 0, 0, 7); x.fill();
  // sandbox (node 2)
  x.fillStyle = 'rgba(20,40,10,0.35)'; x.fillRect(196, 156, 116, 82);
  x.fillStyle = '#1a1020'; x.fillRect(188, 148, 116, 82); x.fillStyle = '#a06a3a'; x.fillRect(189, 149, 114, 80); x.fillStyle = '#f0c070'; x.fillRect(197, 157, 98, 64);
  for (let i = 0; i < 300; i++) { x.fillStyle = r() < .5 ? '#e0a850' : '#ffd890'; x.fillRect(197 + Math.floor(r() * 98), 157 + Math.floor(r() * 64), 1, 1); }
  x.fillStyle = '#c8955a'; x.fillRect(189, 149, 114, 2); x.fillStyle = '#e83a2a'; x.fillRect(272, 166, 12, 10); x.fillStyle = '#ffd040'; x.fillRect(274, 164, 8, 2); x.fillStyle = '#8a4ad0'; x.fillRect(210, 200, 3, 14); x.fillRect(207, 212, 9, 5);
  x.fillStyle = '#d89a50'; x.fillRect(218, 168, 20, 12); x.fillRect(222, 162, 4, 6); x.fillRect(230, 162, 4, 6);
  // mud puddle (node 3)
  x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(408, 266, 62, 30, .1, 0, 7); x.fill();
  x.fillStyle = '#6a4a2a'; x.beginPath(); x.ellipse(408, 266, 60, 28, .1, 0, 7); x.fill(); x.fillStyle = '#4a6a6a'; x.beginPath(); x.ellipse(404, 264, 46, 19, .1, 0, 7); x.fill();
  x.fillStyle = '#7aa0a0'; x.fillRect(380, 258, 18, 2); x.fillRect(410, 270, 14, 2); x.fillStyle = '#5ab83a'; x.beginPath(); x.ellipse(430, 258, 7, 4, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(386, 272, 6, 3, 0, 0, 7); x.fill();
  for (let i = 0; i < 6; i++) { x.fillStyle = '#4a7a2a'; x.fillRect(352 + i * 3, 236 - (i % 3) * 4, 2, 18 + (i % 3) * 4); } x.fillStyle = '#8a4a22'; x.fillRect(355, 230, 3, 8);
  // tall grass forest (node 4)
  for (let i = 0; i < 90; i++) { const gx = 480 + r() * 160, gy = 90 + r() * 120, hh = 14 + r() * 20; x.fillStyle = '#1a1020'; x.fillRect(Math.floor(gx) - 1, Math.floor(gy - hh), 4, hh); x.fillStyle = r() < .5 ? '#2e8a2a' : '#4ab83a'; x.fillRect(Math.floor(gx), Math.floor(gy - hh), 2, hh); }
  [[600, 210], [500, 220], [620, 110]].forEach(([a, b]) => { x.fillStyle = '#1a1020'; x.fillRect(a - 1, b - 8, 4, 9); x.fillStyle = '#f0e0c8'; x.fillRect(a, b - 7, 2, 7); x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(a + 1, b - 9, 7, 4, 0, 0, 7); x.fill(); x.fillStyle = '#e8402a'; x.beginPath(); x.ellipse(a + 1, b - 9, 6, 3, 0, 0, 7); x.fill(); });
  // flowers
  for (let i = 0; i < 40; i++) { const fx_ = r() * W, fy = 80 + r() * 270; x.fillStyle = ['#fff', '#ffe45a', '#ff8ac8'][i % 3]; x.fillRect(Math.floor(fx_), Math.floor(fy), 2, 2); }
  // ball on lawn
  x.fillStyle = '#1a1020'; x.beginPath(); x.arc(300, 320, 13, 0, 7); x.fill(); ['#ff3b5c', '#ffd040', '#3a7ae0'].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.moveTo(300, 320); x.arc(300, 320, 12, i * 2.1, i * 2.1 + 2.1); x.fill(); });
  x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(596, 322, 22, 11, 0, 0, 7); x.fill(); x.fillStyle = '#6a6a78'; x.beginPath(); x.ellipse(596, 321, 20, 9, 0, 0, 7); x.fill(); x.fillStyle = '#4a4a58'; for (let i = -12; i <= 12; i += 6) x.fillRect(596 + i - 1, 316, 2, 10);
  mapCanvas = c;
}
function gotoMap(advance) {
  CHK = null;
  state = 'map'; playSong('map');
  const cur = G ? G.i : mapState.node;
  mapState = { node: cur, walking: null, t: 0, appear: 0 };
  if (advance && cur < LEVELS.length - 1) { mapState.walking = { from: cur, t: -0.6 }; }
  if (!G && prog.unlocked > LEVELS.length) mapState.node = LEVELS.length - 1;
  G = null;
}
function updateMap(dt) {
  mapState.t += dt;
  const M = mapState;
  if (M.walking) {
    M.walking.t += dt;
    if (M.walking.t > 0) { if (Math.floor(M.walking.t * 6) !== Math.floor((M.walking.t - dt) * 6)) SFX.step(); }
    if (M.walking.t >= 1.6) { M.node = M.walking.from + 1; M.walking = null; SFX.select(); confettiMap(NODES[M.node].x, NODES[M.node].y - 20); }
    return;
  }
  const maxNode = Math.min(prog.unlocked, LEVELS.length) - 1;
  if (KP.right || (KP.tap && KP.tapX > NODES[M.node].x + 40)) { if (M.node < maxNode) { M.walking = { from: M.node, t: 0.6, fast: true }; } }
  if (KP.left || (KP.tap && KP.tapX < NODES[M.node].x - 40)) { if (M.node > 0) { M.back = { from: M.node, t: 0 }; M.node--; SFX.step(); } }
  const tapNode = KP.tap && Math.hypot(KP.tapX - NODES[M.node].x, KP.tapY - NODES[M.node].y) < 50;
  if (KP.jump || KP.punch || tapNode || (KP.tap && KP.tapY > 320)) { SFX.select(); const n = M.node; startWipe(() => loadLevel(n), NODES[n].x, NODES[n].y); }
}
const mapParts = [];
function confettiMap(x, y) { const cols = ['#ff3b5c', '#ffe45a', '#4ad8ff', '#7cf05a', '#ff8ae0', '#ffffff']; for (let i = 0; i < 40; i++) mapParts.push({ x, y, vx: rnd(-150, 150), vy: rnd(-250, -60), life: rnd(.8, 1.5), c: cols[i % 6], rot: rnd(0, 6) }); }
function drawMap(dt) {
  if (!mapCanvas) buildMap();
  ctx.drawImage(mapCanvas, 0, 0);
  const M = mapState; const maxNode = Math.min(prog.unlocked, LEVELS.length) - 1;
  // paths
  PATHS.forEach((p, i) => { const open = i < maxNode || (M.walking && M.walking.from === i); for (let t = 0; t <= 1; t += .05) { const [x, y] = bez(p, t); ctx.fillStyle = '#1a1020'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); ctx.fillStyle = open ? '#f0d8a0' : '#8a9a7a'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); } });
  // nodes
  NODES.forEach((n, i) => {
    const open = i <= maxNode; const cur = i === M.node && !M.walking; const pulse = cur ? Math.sin(gtime * 6) * 2 : 0;
    ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(n.x, n.y, 11 + pulse, 0, 7); ctx.fill();
    ctx.fillStyle = open ? (prog.stars[i] ? '#7cf05a' : '#ff3b5c') : '#6a6a7a'; ctx.beginPath(); ctx.arc(n.x, n.y, 9 + pulse, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(n.x - 4, n.y - 6, 4, 2);
    text(String(i + 1), n.x + 1, n.y - 1, { align: 'center' });
    for (let s = 0; s < 3; s++) ctx.drawImage(s < (prog.stars[i] || 0) ? SPR.star : SPR.starE, n.x - 20 + s * 13, n.y + 12, 13, 13);
    if (!open) text('?', n.x + 1, n.y - 22, { color: '#c8c8d8', align: 'center' });
  });
  // ant icon
  let ax, ay, dir = 1, walking = false;
  if (M.walking && M.walking.t > 0) { const t = clamp(M.walking.t / 1.6, 0, 1); const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; [ax, ay] = bez(PATHS[M.walking.from], e); const [bx] = bez(PATHS[M.walking.from], Math.min(1, e + .02)); dir = bx >= ax ? 1 : -1; walking = true; }
  else { const n = NODES[M.walking ? M.walking.from : M.node]; ax = n.x; ay = n.y; }
  const hop = walking ? Math.abs(Math.sin(gtime * 12)) * 4 : Math.abs(Math.sin(gtime * 3)) * 2;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(ax, ay - 2, 9, 3, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(ax, ay - 4 - hop); ctx.scale(.75, .75); drawAnt(walking ? ANT.anims.walk[Math.floor(gtime * 14) % 8] : ANT.anims.hurt[0], 0, 0, dir); ctx.restore();
  for (let i = mapParts.length - 1; i >= 0; i--) { const p = mapParts[i]; p.life -= dt; p.vy += 380 * dt; p.vy = Math.min(p.vy, 80); p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 10; if (p.life <= 0) { mapParts.splice(i, 1); continue; } ctx.fillStyle = p.c; const w = Math.abs(Math.cos(p.rot)) * 4 + 1; ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(w), 3); }
  // panel
  const n = NODES[M.walking ? Math.min(LEVELS.length - 1, M.walking.from + (M.walking.t > .8 ? 1 : 0)) : M.node];
  ctx.fillStyle = 'rgba(16,10,30,0.82)'; ctx.fillRect(0, H - 40, W, 40); ctx.fillStyle = '#ffe45a'; ctx.fillRect(0, H - 40, W, 2);
  text('O QUINTAL', 12, H - 26, { color: '#7ff0ff' });
  text(n.name, W / 2, H - 28, { s: 2, align: 'center', color: '#ffe45a' });
  if (!M.walking && Math.floor(gtime * 2.5) % 2 === 0) text(isTouch ? 'TOQUE NA FASE PARA JOGAR' : 'PULO: JOGAR  •  ◀ ▶: ESCOLHER', W / 2, H - 10, { align: 'center' });
  const best = store.get('best', [0, 0, 0, 0])[NODES.indexOf(n)] || 0; if (best) text('RECORDE ' + best, W - 12, H - 26, { align: 'right', color: '#ffffff' });
  if (prog.unlocked > LEVELS.length && !M.walking) text('QUINTAL CONQUISTADO! ★', W / 2, 128, { s: 2, align: 'center', color: '#ffe45a' });
}

// ---------- TITLE ----------
function drawTitle() {
  drawLayer(IMG.forest, gtime * 12, 0); ctx.fillStyle = 'rgba(10,20,30,0.35)'; ctx.fillRect(0, 0, W, H);
  if (!SPR.silhT) SPR.silhT = tinted(IMG.silh, '#081812');
  drawLayer(SPR.silhT, gtime * 50, H - 70);
  const b = Math.sin(gtime * 3) * 3;
  text('QUINTAL', W / 2, 70 + b, { s: 6, align: 'center', color: '#ffe45a' });
  text('QUEST', W / 2, 122 + b, { s: 6, align: 'center', color: '#7cf05a' });
  text('A AVENTURA DA FORMIGUINHA', W / 2, 172, { s: 1, align: 'center', color: '#ffffff' });
  const ax = W / 2 + Math.sin(gtime * 1.2) * 120; const dir = Math.cos(gtime * 1.2) > 0 ? 1 : -1;
  drawAnt(ANT.anims.run[Math.floor(gtime * 16) % 8], ax, 262, dir);
  if (Math.floor(gtime * 2.5) % 2 === 0) text(isTouch ? 'TOQUE PARA COMEÇAR' : 'APERTE ESPAÇO PARA COMEÇAR', W / 2, 290, { s: 2, align: 'center' });
  text(isTouch ? '' : 'SETAS: MOVER   ESPAÇO/Z: PULO   X: SOCO   SHIFT/C: DASH', W / 2, 330, { align: 'center', color: '#c8e8ff' });
  text('SOM: ' + (AU.muted ? 'DESLIGADO' : 'LIGADO') + (isTouch ? '' : ' (M)'), W - 10, 14, { align: 'right', color: '#c8e8ff' });
}

// ---------- main loop ----------
function boot() {
  buildSprites(); antWhite = tinted(IMG.ant, '#ffffff');
  requestAnimationFrame(loop);
}
let last = 0;
function loop(ts) {
  const dt = Math.min(.033, (ts - last) / 1000 || 0); last = ts; gtime += dt;
  if (KP.mute) setMute(!AU.muted);
  if (KP.god) toggleGod();
  if (fx.shake > 0) fx.shake = Math.max(0, fx.shake - dt * 20); if (fx.flash > 0) fx.flash -= dt;
  const busy = wipe.dir !== 0;
  if (!busy) {
    if (state === 'title') { if (KP.jump || KP.tap || KP.punch) { SFX.select(); if (KP.tap && KP.tapX > W - 120 && KP.tapY < 30) setMute(!AU.muted); else startWipe(() => gotoMap(false)); } }
    else if (state === 'map') updateMap(dt);
  }
  if (state === 'play' && G) { if (!busy || wipe.dir > 0) updatePlay(busy ? dt * .3 : dt); updateParts(dt); }
  // draw
  ctx.clearRect(0, 0, W, H);
  if (state === 'title') drawTitle(); else if (state === 'map') drawMap(dt); else if (state === 'play' && G) drawPlay();
  // wipe
  if (wipe.dir !== 0) {
    wipe.t += wipe.dir * dt * 2.6;
    if (wipe.dir < 0 && wipe.t <= 0) { wipe.t = 0; const cb = wipe.cb; wipe.dir = 1; wipe.x = W / 2; wipe.y = H / 2; cb && cb(); if (state === 'play' && G) { wipe.x = P.x - G.camX; wipe.y = P.y - 20 - G.camY; } else if (state === 'map') { const n = NODES[mapState.node]; wipe.x = n.x; wipe.y = n.y; } }
    if (wipe.dir > 0 && wipe.t >= 1) { wipe.t = 1; wipe.dir = 0; }
  }
  if (wipe.t < 1) { const r = Math.pow(wipe.t, 1.6) * 760; ctx.fillStyle = '#0b0a14'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(wipe.x, wipe.y, Math.max(0, r), 0, Math.PI * 2, true); ctx.fill('evenodd'); }
  for (const k in KP) delete KP[k];
  requestAnimationFrame(loop);
}
