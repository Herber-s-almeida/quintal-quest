p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    assert a in s, a[:70]; s=s.replace(a,b,cnt)
# --- generalize level count
R("stars: [0, 0, 0, 0] });\nlet mapState = { node: Math.min(prog.unlocked, 4) - 1,","stars: [0, 0, 0, 0, 0] });\nlet mapState = { node: Math.min(prog.unlocked, LEVELS.length) - 1,")
R("if (first) prog.unlocked = Math.min(5, i + 2);","if (first) prog.unlocked = Math.min(LEVELS.length + 1, i + 2);")
R("G.clear.advance = first && i < 3;","G.clear.advance = first && i < LEVELS.length - 1;")
R("if (!G && prog.unlocked > 4) mapState.node = 3;","if (!G && prog.unlocked > LEVELS.length) mapState.node = LEVELS.length - 1;")
R("  const maxNode = Math.min(prog.unlocked, 4) - 1;\n  if (KP.right","  const maxNode = Math.min(prog.unlocked, LEVELS.length) - 1;\n  if (KP.right")
R("const M = mapState; const maxNode = Math.min(prog.unlocked, 4) - 1;","const M = mapState; const maxNode = Math.min(prog.unlocked, LEVELS.length) - 1;")
R("Math.min(3, M.walking.from + (M.walking.t > .8 ? 1 : 0))","Math.min(LEVELS.length - 1, M.walking.from + (M.walking.t > .8 ? 1 : 0))")
R("if (prog.unlocked > 4 && !M.walking) text('QUINTAL CONQUISTADO! ★', W / 2, 84,","if (prog.unlocked > LEVELS.length && !M.walking) text('QUINTAL CONQUISTADO! ★', W / 2, 128,")
R("if (advance && cur < 3) {","if (advance && cur < LEVELS.length - 1) {")
R("{ x: 540, y: 150, name: 'GRAMADO' }\n];","{ x: 540, y: 150, name: 'GRAMADO' }, { x: 330, y: 98, name: 'PAREDE DA CASA' }\n];")
R("[[408, 262], [470, 230], [470, 170], [540, 150]]];","[[408, 262], [470, 230], [470, 170], [540, 150]], [[540, 150], [500, 105], [400, 125], [330, 98]]];")
R("const names = Object.keys(ASSETS).filter(k => k !== 'antjson');","const names = Object.keys(ASSETS).filter(k => !k.endsWith('json'));")
# --- input: up key + stick up
R("ArrowUp: 'jump', KeyW: 'jump',","ArrowUp: 'up', KeyW: 'up',")
R("const d = STK.ay > .6; if (d && !K.down) press('down'); if (!d && K.down) release('down'); };","const d = STK.ay > .4; if (d && !K.down) press('down'); if (!d && K.down) release('down'); const u = STK.ay < -.4; if (u && !K.sup) press('sup'); if (!u && K.sup) release('sup'); };")
R("const wantJump = KP.jump && P.ctrl,","const wantJump = (KP.jump || KP.up) && P.ctrl,")
R("if (!K.jump && P.vy < -120) gr = 3400;","if (!K.jump && !K.up && P.vy < -120) gr = 3400;")
# --- themes, songs, level
R("  gramado: { name: 'GRAMADO',","  parede: { name: 'PAREDE DA CASA', song: 'parede', silh: '#2a1a10' },\n  gramado: { name: 'GRAMADO',")
R("  boss: { bpm: 172,","  parede: { bpm: 150, root: 53, prog: [[0, 4, 7], [2, 5, 9], [-1, 2, 7], [0, 4, 9]], arp: [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 4, 3, 2, 1], kick: [0, 7, 8, 12], hat: 2 },\n  boss: { bpm: 172,")
a=s.index("// parallax layer configs per level")
s=s[:a]+"LEVELS.push({ id: 'parede', sub: '5', vertical: true, mk: () => buildVertLevel() });\n"+s[a:]
# --- loadLevel hook
R("function loadLevel(i) {\n  const def = LEVELS[i];","function loadLevel(i) {\n  const def = LEVELS[i]; if (def.vertical) { loadVertical(i); return; }")
# --- updatePlay hook
R("  if (!G.clear && G.deadT <= 0) G.time += dt;\n","""  if (!G.clear && G.deadT <= 0) G.time += dt;
  if (G.vertical) {
    updateVert(dt); if (G.clear) updateClear(dt);
    if (G.deadT > 0) { G.deadT -= dt; if (G.deadT <= 0) startWipe(() => loadLevel(G.i), P.x - G.camX, P.y - 20 - G.camY); }
    G.camX = 0; G.camY = clamp(lerp(G.camY, P.y - H * .58, Math.min(1, dt * 6)), 0, G.L.worldH - H); return;
  }
""")
R("function drawPlay() {\n","function drawPlay() {\n  if (G.vertical) { drawVert(); return; }\n")
# --- vertical module
mod=r"""// ---------- vertical level (Parede da Casa) ----------
const VC = { L: 110, R: 530 };
function buildVertLevel() {
  const L = { len: 120, vertical: true, worldH: 2600, groundY: 2560, sillY: 250, slick: [], nests: [], termites: [], sugar: [], decor: [], flag: null };
  const S = (x, y, n = 1, dx = 0, dy = -28) => { for (let i = 0; i < n; i++) L.sugar.push({ x: x + dx * i, y: y + dy * i }); };
  const wk = (x, y) => L.termites.push({ type: 'worker', x, y }), sd = (x, y) => L.termites.push({ type: 'soldier', x, y });
  const ns = (x, y, k) => L.nests.push({ x, y, k }), sl = (x0, x1, y0, y1) => L.slick.push({ x0, x1, y0, y1 });
  S(320, 2440, 3); wk(250, 2300); wk(420, 2240);
  ns(220, 2080, 0); sd(430, 2000); S(400, 2150, 2);
  sl(110, 430, 1830, 1880); S(482, 1905, 3);
  wk(200, 1720); wk(330, 1660); wk(460, 1720); ns(420, 1600, 1); S(240, 1640, 3, 20, -20);
  sl(110, 530, 1420, 1470); S(320, 1400, 2);
  sd(200, 1300); sd(440, 1200); ns(180, 1250, 2); S(330, 1330, 2);
  sl(110, 320, 1080, 1120); sl(320, 530, 990, 1030); S(420, 1110, 2); S(220, 1010, 2);
  wk(250, 900); wk(380, 870); wk(470, 820); wk(170, 780); ns(300, 850, 3); ns(460, 760, 1); S(320, 960, 2);
  sl(110, 530, 620, 670); S(320, 600, 2);
  sd(220, 480); sd(420, 420); wk(330, 520); wk(190, 380); S(320, 450, 3);
  const r = rng(77); for (let i = 0; i < 34; i++) L.decor.push({ x: VC.L + 20 + r() * 380, y: 320 + r() * 2150, k: 4 + Math.floor(r() * 7) });
  L.flag = { x: 470, y: L.sillY };
  return L;
}
function loadVertical(i) {
  const def = LEVELS[i]; const L = def.mk(); const th = THEMES[def.id];
  G = { i, def, L, th, vertical: true, camX: 0, camY: L.worldH - H, time: 0, sugar: 0, sugarTotal: L.sugar.length, kills: 0, enemiesTotal: L.termites.length + L.nests.length, score: 0, maxCombo: 0, chain: 0, chainT: 0, clear: null, intro: 1.6, deadT: 0, boss: null, flagHidden: false, flagPop: 1, waves: [], bossBanner: 0, nurses: [], sugarMeter: 0, bgAnts: null, enemies: [], layers: [] };
  G.sugarList = L.sugar.map(s => ({ ...s, got: false, vx: 0, vy: 0, mag: false, bob: Math.random() * 6 }));
  G.terms = L.termites.map(makeTermite);
  G.nests = L.nests.map(n => ({ ...n, hp: 3, sealed: false, spawnT: rnd(1, 3), alive: 0, flash: 0, hitBy: -1 }));
  Object.assign(P, { x: 40, y: L.groundY, vx: 0, vy: 0, dir: 1, ground: true, coyote: 0, buf: 0, dashT: 0, dashCD: 0, airDash: true, punchT: -1, punchId: 0, hurtT: 0, inv: 0, hp: 6, jumps: 1, flip: 0, boost: 0, anim: 'idle', at: 0, sx: 1, sy: 1, combo: 0, comboT: 0, dust: 0, dashHit: new Set(), ctrl: true, climb: false, onSill: false, floor: L.groundY, leapT: 0, leapCD: 0, lvx: 0, lvy: 0, cdist: 0, pdir: 1, ddir: 1 });
  P.safe = { x: P.x, y: P.y };
  parts.length = floats.length = ghosts.length = 0;
  state = 'play'; playSong(th.song);
}
function makeTermite(o) { const sol = o.type === 'soldier'; return { ...o, ang: sol ? Math.PI / 2 : Math.random() * 6.28, sp: sol ? 30 : 32, hp: sol ? 2 : 1, t: Math.random() * 5, flash: 0, dead: false, state: 'crawl', st: 0, hitBy: -1, kb: 0, kvx: 0, kvy: 0, r: sol ? 12 : 8, score: sol ? 250 : 120, a: 1 }; }
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
    const amag = STK.id !== null ? clamp(Math.hypot(STK.ax, STK.ay) * 1.3, .35, 1) : 1;
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
  ctx.save(); ctx.globalAlpha = clamp(e.a, 0, 1); ctx.translate(x + (e.state === 'wind' ? Math.round(Math.sin(gtime * 60)) : 0), y); ctx.rotate(e.dead ? e.rot : e.ang); ctx.drawImage(img, -Math.round(img.width / 2), -Math.round(img.height / 2)); ctx.restore();
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
  for (const z of L.slick) { const y0 = z.y0 - cy, y1 = z.y1 - cy; if (y1 < -20 || y0 > H + 20) continue; ctx.fillStyle = 'rgba(150,215,255,.42)'; ctx.fillRect(z.x0, y0, z.x1 - z.x0, y1 - y0); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let x = z.x0 + 8; x < z.x1 - 10; x += 26) { ctx.fillRect(x, y0 + 6, 10, 2); ctx.fillRect(x + 4, y0 + 12, 2, 2); } ctx.fillStyle = 'rgba(150,215,255,.5)'; for (let x = z.x0 + 12; x < z.x1; x += 31) { const dl = 6 + ((x * 7) % 13) + Math.sin(gtime * 2 + x) * 2; ctx.fillRect(x, y1, 3, dl); ctx.fillRect(x - 1, y1 + dl, 5, 3); } ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(z.x0, y0, z.x1 - z.x0, 2); }
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

// ---------- particles ----------"""
s=s.replace("// ---------- particles ----------",mod,1)
# termite sprites
R("  // props\n  const prop = {};","""  const termF = (sol, f) => pix(sol ? 24 : 18, sol ? 30 : 24, g => {
    const cx = sol ? 12 : 9, L = '#3a2414';
    const ys = sol ? [14, 18, 22] : [11, 14, 17];
    ys.forEach((y, i) => { const o = ((i + f) % 2) ? 2 : -1; g.line(cx - 2, y, cx - 7, y + o - 1, L); g.line(cx - 7, y + o - 1, cx - 8, y + o + 2, L); g.line(cx + 2, y, cx + 7, y - o - 1, L); g.line(cx + 7, y - o - 1, cx + 8, y - o + 2, L); });
    if (sol) { g.ell(cx, 22, 5, 6.5, '#f4e6c8'); g.ell(cx - 1.5, 20, 2, 2.5, '#fffaf0'); for (let y = 18; y < 28; y += 3) g.line(cx - 4, y, cx + 4, y, '#d8c4a0'); g.ell(cx, 14, 3.2, 2.6, '#e8d4b0'); g.ell(cx, 8, 6, 5.5, '#b4561c'); g.ell(cx - 2, 6, 2, 1.5, '#e08a4a'); g.line(cx - 3, 3, cx - 6, -1, '#2a1006'); g.line(cx + 3, 3, cx + 6, -1, '#2a1006'); g.line(cx - 4, 3, cx - 4, 0, '#2a1006'); g.line(cx + 4, 3, cx + 4, 0, '#2a1006'); g.line(cx - 6, 7, cx - 10, 4, L); g.line(cx + 6, 7, cx + 10, 4, L); }
    else { g.ell(cx, 17, 4, 5.5, '#f4e6c8'); g.ell(cx - 1.2, 15.5, 1.6, 2, '#fffaf0'); for (let y = 14; y < 22; y += 2.5) g.line(cx - 3, y, cx + 3, y, '#dccaa8'); g.ell(cx, 10.5, 2.6, 2.2, '#e8d4b0'); g.ell(cx, 6, 3.6, 3.2, '#d07a32'); g.p(cx - 1, 3, '#2a1006'); g.p(cx + 1, 3, '#2a1006'); g.p(cx - 2, 2, '#2a1006'); g.p(cx + 2, 2, '#2a1006'); g.line(cx - 3, 5, cx - 6, 1 + f, L); g.line(cx + 3, 5, cx + 6, 1 + f, L); }
  }, OL);
  SPR.term = { worker: [termF(false, 0), termF(false, 1)], soldier: [termF(true, 0), termF(true, 1)] };
  SPR.termW = { worker: tinted(SPR.term.worker[0], '#ffffff'), soldier: tinted(SPR.term.soldier[0], '#ffffff') };
  // props
  const prop = {};""")
open(p,'w').write(s)
