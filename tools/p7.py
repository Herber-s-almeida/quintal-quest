p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    assert a in s, a[:70]; s=s.replace(a,b,cnt)
# ---------- sprites
R("  SPR.boss = { stand:","""  const frogF = (pose, KK) => pix(54 * KK + 4, 32 * KK + 4, g => {
    const ox = 6, E = (x, y, rx, ry, c) => g.ell((x + ox) * KK + 2, y * KK + 2, rx * KK, ry * KK, c);
    const TL = (x0, y0, x1, y1, r, c) => { const n = 30; for (let i = 0; i <= n; i++) { const t = i / n; g.ell((x0 + ox + (x1 - x0) * t) * KK + 2, (y0 + (y1 - y0) * t) * KK + 2, r * KK, r * KK, c); } };
    if (pose === 'jump') { E(10, 17, 7, 4, '#3f8f26'); E(9, 15.5, 4, 1.6, '#6ac83a'); TL(5, 18, -1, 25, 1.3, '#3f8f26'); E(-2, 27, 3, 1.5, '#2f7a1e'); }
    else { E(12, 21, 8, 6, '#3f8f26'); E(10, 19, 4, 2, '#6ac83a'); E(18, 28.5, 8, 2, '#2f7a1e'); E(25.5, 29, 1.6, 1, '#2f7a1e'); }
    E(24, 18, 15, 10, '#56b236'); E(28, 23, 11, 5, '#e8f0a0'); E(20, 12, 7, 2.5, '#7ad84a');
    E(18, 15, 2.6, 1.8, '#2f7a1e'); E(25, 12.5, 2, 1.4, '#2f7a1e'); E(13, 18, 1.8, 1.3, '#2f7a1e'); E(21, 20, 1.5, 1.1, '#2f7a1e');
    E(33, 14, 9, 7, '#56b236');
    E(26, 8, 3.6, 3.6, '#4aa22e'); E(31, 7, 4.6, 4.6, '#56b236'); E(32, 6.5, 3.1, 3.1, '#ffe040'); TL(30.6, 6.6, 33.4, 6.6, .55, '#111111'); E(31.3, 5.4, .6, .6, '#ffffff');
    if (pose === 'open') { E(37, 19, 6.5, 4, '#1e4a14'); E(37, 19.3, 5.8, 3.4, '#5a0a14'); E(37, 20.6, 4, 1.8, '#ff7aa0'); }
    else { TL(29, 18, 41, 16.4, .35, '#1e4a14'); E(36, 17.3, 2, 1.1, '#8ad85a'); }
    E(40, 12.5, .6, .5, '#1e4a14');
    TL(33, 24, 35, 29, 1.2, '#3f8f26'); E(37, 29.5, 2.2, 1, '#2f7a1e');
  }, OL);
  SPR.frog = { sit: frogF('sit', 2), jump: frogF('jump', 2), open: frogF('open', 2) };
  SPR.frogW = { sit: tinted(SPR.frog.sit, '#fff'), jump: tinted(SPR.frog.jump, '#fff'), open: tinted(SPR.frog.open, '#fff') };
  SPR.bfrog = { sit: frogF('sit', 4.6), jump: frogF('jump', 4.6), open: frogF('open', 4.6) };
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
  SPR.boss = { stand:""")
# ---------- makeEnemy
R("    case 'scorp': e.w = 32; e.h = 18;","    case 'frog': e.w = 72; e.h = 44; e.hp = 3; e.score = 300; e.state = 'sit'; e.st = rnd(.8, 1.6); e.air = false; e.tongue = 0; break;\n    case 'stick': e.w = 44; e.h = 26; e.speed = 34; e.hp = 2; e.score = 200; e.awake = false; break;\n    case 'cater': e.w = 36; e.h = 16; e.speed = 16; e.hp = 2; e.score = 180; break;\n    case 'fly': e.w = 24; e.h = 22; e.score = 160; e.fly = true; break;\n    case 'scorp': e.w = 36; e.h = 27;")
# ---------- updateEnemy branches
R("  if (e.type === 'hopper') {","""  if (e.type === 'fly') {
    const dx = P.x - e.ox, dy = (P.y - 50) - e.oy;
    if (Math.abs(dx) < 220 && Math.abs(dy) < 180 && G.deadT <= 0) { e.ox += clamp(dx, -28 * dt, 28 * dt); e.oy += clamp(dy, -22 * dt, 22 * dt); }
    e.x = e.ox + Math.sin(e.t * .8) * 55; e.y = e.oy + Math.sin(e.t * 1.6) * 20; e.dir = Math.cos(e.t * .8) > 0 ? 1 : -1; return;
  }
  if (e.type === 'frog') {
    const dx = P.x - e.x;
    e.vy = Math.min(e.vy + 1300 * dt, 600); if (e.kb > 0) { e.kb -= dt; e.vx *= .9; }
    if (!e.air && e.kb <= 0) {
      if (e.state === 'sit') { e.vx = 0; e.dir = dx > 0 ? 1 : -1; e.st -= dt;
        if (e.st <= 0) { if (Math.abs(dx) < 125 && Math.abs(P.y - e.y) < 60 && G.deadT <= 0) { e.state = 'wind'; e.st = .55; }
          else if (Math.abs(dx) < 340) { const tx = e.x + e.dir * 95; if (solidAt(Math.floor(tx / T), Math.floor((e.y + 2) / T)) === 1 && solidAt(Math.floor((tx + e.dir * 30) / T), Math.floor((e.y + 2) / T)) === 1) { e.vx = e.dir * 100; e.vy = -380; e.air = true; SFX.spring(); } e.st = rnd(1.1, 1.9); } else e.st = 1; } }
      else if (e.state === 'wind') { e.st -= dt; if (e.st <= 0) { e.state = 'tongue'; e.st = .65; SFX.dash(); } }
      else if (e.state === 'tongue') { e.st -= dt; const k = e.st > .5 ? (.65 - e.st) / .15 : e.st > .28 ? 1 : e.st / .28; e.tongue = clamp(k, 0, 1) * 110;
        const tx0 = e.x + e.dir * 32, tx1 = tx0 + e.dir * e.tongue, ty = e.y - 22, l = Math.min(tx0, tx1), r = Math.max(tx0, tx1);
        if (P.x + 8 > l && P.x - 8 < r && P.y > ty - 4 && P.y - 36 < ty + 4) hurtPlayer(e.x);
        if (e.st <= 0) { e.state = 'sit'; e.st = rnd(1, 1.6); e.tongue = 0; } }
    }
    let nx = e.x + e.vx * dt; if (solidAt(Math.floor((nx + Math.sign(e.vx || 1) * e.w / 2) / T), Math.floor((e.y - 10) / T)) === 1) { e.vx = 0; nx = e.x; }
    e.x = nx; const py = e.y; e.y += e.vy * dt; const ty = Math.floor(e.y / T), tx = Math.floor(e.x / T);
    if (e.vy >= 0 && solidAt(tx, ty) && py <= ty * T + 1) { e.y = ty * T; e.vy = 0; if (e.air) { e.air = false; dust(e.x - 20, e.y, 3); dust(e.x + 20, e.y, 3); } }
    if (e.y > ROWS * T + 40) e.dead = true;
    return;
  }
  if (e.type === 'hopper') {""")
R("  let sp = e.speed;\n  if (e.type === 'scorp') {","  let sp = e.speed;\n  if (e.type === 'stick' && !e.awake) { sp = 0; if (Math.abs(P.x - e.x) < 140 && Math.abs(P.y - e.y) < 80) { e.awake = true; e.dir = P.x > e.x ? 1 : -1; floatText('!', e.x, e.y - 34, '#ff3b5c', 2); } }\n  if (e.type === 'scorp') {")
R("function damageEnemy(e, dmg, dirx, kind) {\n  if (e.dead) return;","function damageEnemy(e, dmg, dirx, kind) {\n  if (e.dead) return; if (e.type === 'stick') e.awake = true; if (e.type === 'frog') { e.state = 'sit'; e.tongue = 0; e.st = Math.max(e.st, .6); }")
# stomp hurts on caterpillar too
R("      if (stomp && e.type === 'scorp') { hurtPlayer(e.x); P.vy = -380; P.inv > 1 && floatText('AI! FERRÃO!', P.x, P.y - 50, '#ff3b5c'); continue; }","      if (stomp && (e.type === 'scorp' || e.type === 'cater')) { hurtPlayer(e.x); P.vy = -380; P.inv > 1 && floatText(e.type === 'scorp' ? 'AI! FERRÃO!' : 'AI! PELOS!', P.x, P.y - 50, '#ff3b5c'); continue; }")
# ---------- drawEnemy
R("  if (e.type === 'spider') { ctx.fillStyle = 'rgba(230,230,255,0.7)';","""  if (e.type === 'frog') {
    const pose = e.air ? 'jump' : (e.state === 'wind' || e.state === 'tongue') ? 'open' : 'sit'; const img = (white ? SPR.frogW : SPR.frog)[pose];
    if (e.tongue > 0 && !e.dead) { const mx = x + e.dir * 32, my = y - 22, tx = mx + e.dir * e.tongue; ctx.fillStyle = '#1a1020'; ctx.fillRect(Math.min(mx, tx), my - 3, Math.abs(tx - mx), 6); ctx.fillStyle = '#ff7aa0'; ctx.fillRect(Math.min(mx, tx), my - 2, Math.abs(tx - mx), 4); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(tx, my, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#ff5a8a'; ctx.beginPath(); ctx.arc(tx, my, 5, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x + (e.state === 'wind' ? Math.round(Math.sin(gtime * 60)) : 0), y); if (e.dead) ctx.rotate(e.rot); ctx.scale(e.dir, 1); ctx.drawImage(img, -62, -61); ctx.restore();
    if (e.state === 'wind' && !e.dead) text('!', x, y - 70, { s: 2, color: '#ff3b5c', align: 'center' });
    return;
  }
  if (e.type === 'spider') { ctx.fillStyle = 'rgba(230,230,255,0.7)';""")
R("  const fi = e.type === 'hopper' ? (e.air ? 1 : 0) :","  const fi = e.type === 'stick' && !e.awake ? 0 : e.type === 'hopper' ? (e.air ? 1 : 0) :")
R("ctx.scale(e.type === 'spider' ? 1 : (e.dir > 0 ? 1 : -1), 1);","ctx.scale((e.type === 'spider' ? 1 : (e.dir > 0 ? 1 : -1)) * (e.type === 'scorp' ? 1.1 : 1), e.type === 'scorp' ? 1.1 : 1);")
R("  const oy = e.type === 'lady' || e.type === 'ladyC' || e.type === 'spider' ?","  const oy = e.type === 'lady' || e.type === 'ladyC' || e.type === 'spider' || e.type === 'fly' ?")
# ---------- boss frog
R("function makeBoss(b) { const scorp = b.kind === 'scorp'; return { kind: b.kind || 'hopper', name: scorp ? 'ESCORPIÃO GIGANTE' : 'GAFANHOTO INVASOR', nameCol: scorp ? '#ffb060' : '#b4ec5a', pat: ['sting', 'charge', 'sting', 'burrow'],",
  "function makeBoss(b) { const scorp = b.kind === 'scorp', frog = b.kind === 'frog'; return { kind: b.kind || 'hopper', name: frog ? 'SAPO GIGANTE' : scorp ? 'ESCORPIÃO GIGANTE' : 'GAFANHOTO INVASOR', nameCol: frog ? '#7cf05a' : scorp ? '#ffb060' : '#b4ec5a', pat: frog ? ['tongue', 'leap', 'inhale', 'tongue', 'leap', 'tongue'] : ['sting', 'charge', 'sting', 'burrow'],")
R("hp: scorp ? 16 : 14, max: scorp ? 16 : 14,","hp: frog ? 18 : scorp ? 16 : 14, max: frog ? 18 : scorp ? 16 : 14,")
R("w: scorp ? 100 : 84, h: scorp ? 38 : 40,","w: frog ? 180 : scorp ? 100 : 84, h: frog ? 100 : scorp ? 38 : 40,")
R("if (B.kind === 'scorp') { B.state = 'warn'; B.st = .7; B.dig = 1; } else {","if (B.kind === 'scorp') { B.state = 'warn'; B.st = .7; B.dig = 1; } else if (B.kind === 'frog') { B.state = 'intro'; B.st = 1.6; SFX.boom(); } else {")
R("  if (B.kind === 'scorp') { updateScorp(B, dt); return; }","  if (B.kind === 'scorp') { updateScorp(B, dt); return; }\n  if (B.kind === 'frog') { updateFrog(B, dt); return; }")
R("  if (G.boss.kind === 'scorp') { if (G.boss.state !== 'dead') drawScorp(G.boss, cx, cy); return; }","  if (G.boss.kind === 'scorp') { if (G.boss.state !== 'dead') drawScorp(G.boss, cx, cy); return; }\n  if (G.boss.kind === 'frog') { if (G.boss.state !== 'dead') drawFrogBoss(G.boss, cx, cy); return; }")
R("!['dig', 'under', 'warn'].includes(B.state)","!['dig', 'under', 'warn', 'air', 'leapUp'].includes(B.state)")
R("const sc = B.kind === 'scorp', open = sc && (B.state === 'stuck' || B.state === 'dizzy'), dmg = open ? 2 : 1;","const sc = B.kind === 'scorp', open = (sc && (B.state === 'stuck' || B.state === 'dizzy')) || (B.kind === 'frog' && B.state === 'dazed'), dmg = open ? 2 : 1;")
R("text(G.boss.kind === 'scorp' ? 'DICA: PISAR NAS COSTAS DÓI! USE SOCO E DASH' : 'DICA: PULE AS ONDAS DE CHOQUE',","text(G.boss.kind === 'frog' ? 'DICA: PULE A LÍNGUA BAIXA E FUJA DA SUCÇÃO!' : G.boss.kind === 'scorp' ? 'DICA: PISAR NAS COSTAS DÓI! USE SOCO E DASH' : 'DICA: PULE AS ONDAS DE CHOQUE',")
R("function drawScorp(B, cx, cy) {",r"""function updateFrog(B, dt) {
  const enr = B.hp <= B.max * .5, dx = P.x - B.x, F = B.floorY;
  const face = () => { B.dir = dx > 0 ? 1 : -1; };
  if (!B.ground && B.state !== 'air') B.vy += 1600 * dt;
  if (B.state !== 'air') { B.x += B.vx * dt; B.y += B.vy * dt; }
  const minX = B.arenaL + 100, maxX = B.arenaR - 100; B.x = clamp(B.x, minX, maxX);
  const mud = (x, n, sp = 240) => { for (let i = 0; i < n; i++) parts.push({ x: x + rnd(-20, 20), y: F - 2, vx: rnd(-sp, sp) * .7, vy: rnd(-sp * 1.6, -sp * .4), life: rnd(.4, .8), max: .8, c: ['#6a4a2a', '#8a6a3a', '#4a6a6a', '#9ac0c0'][i % 4], sz: rnd(2, 5), g: 800, k: 'sq' }); };
  if (!B.ground && B.vy >= 0 && B.y >= F && B.state !== 'air') {
    B.y = F; B.vy = 0; B.ground = true; B.vx = 0;
    if (B.state === 'slam') { SFX.boom(); SFX.boom(); fx.shake = 12; B.sx = 1.35; B.sy = .65; mud(B.x - 80, 20); mud(B.x + 80, 20); ring(B.x, F - 10, '#ffffff');
      const sp = enr ? 230 : 180; G.waves.push({ x: B.x - 100, y: F, dir: -1, sp, life: 1.8 }, { x: B.x + 100, y: F, dir: 1, sp, life: 1.8 });
      if (Math.abs(P.x - B.x) < 95 && P.y > F - 110) hurtPlayer(B.x, 2);
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
      const mx = B.x + B.dir * 78, ty = B.tH === 'low' ? F - 14 : F - 58, tx = mx + B.dir * B.tl, l = Math.min(mx, tx), r = Math.max(mx, tx);
      if (P.x + 8 > l && P.x - 8 < r && P.y > ty - 5 && P.y - 34 < ty + 5) hurtPlayer(tx);
      if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .35 : .6; B.tl = 0; } break; }
    case 'lwind': face(); B.st -= dt; if (B.st <= 0) { B.state = 'leapUp'; B.vy = -1150; B.ground = false; SFX.spring(); mud(B.x, 16); B.sx = .8; B.sy = 1.3; } break;
    case 'leapUp': if (B.y < G.camY - 220) { B.state = 'air'; B.st = enr ? .9 : 1.2; } break;
    case 'air': B.st -= dt; B.x = clamp(B.x + clamp(P.x - B.x, -280 * dt, 280 * dt), minX, maxX); if (B.st <= 0) { B.state = 'slam'; B.y = F - 420; B.vy = 1300; B.ground = false; } break;
    case 'slam': break;
    case 'dazed': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .4; } break;
    case 'inhale': { B.st -= dt; const mouth = B.x + B.dir * 80, front = Math.sign(P.x - B.x) === B.dir;
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
  const F = B.floorY - cy; let x = Math.round(B.x - cx), y = Math.round(B.y - cy);
  if (B.state === 'air' || B.state === 'slam' || B.state === 'leapUp') { const k = B.state === 'air' ? 1 - B.st / 1.2 : 1; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, F, 30 + 70 * clamp(k, 0, 1), 8, 0, 0, 7); ctx.fill(); if (B.state === 'air' && Math.floor(gtime * 10) % 2) text('!', x, F - 40, { s: 3, color: '#ff3b5c', align: 'center' }); if (B.state === 'air') return; }
  else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, F, 100, 8, 0, 0, 7); ctx.fill(); }
  if (B.state === 'twind') { const ty = (B.tH === 'low' ? B.floorY - 14 : B.floorY - 58) - cy; if (Math.floor(gtime * 12) % 2) { ctx.fillStyle = 'rgba(255,90,140,.35)'; for (let i = 0; i < 440; i += 16) ctx.fillRect(x + B.dir * (78 + i) - 4, ty - 1, 8, 2); } text(B.tH === 'low' ? 'PULE!' : 'FIQUE NO CHÃO!', x + B.dir * 200, ty - 20, { s: 2, color: '#ff8ac0', align: 'center' }); }
  if (B.state === 'tongue' && B.tl > 0) { const mx = x + B.dir * 78, my = y - 58, ty = (B.tH === 'low' ? B.floorY - 14 : B.floorY - 58) - cy, tx = mx + B.dir * B.tl; ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + B.dir * 30, ty); ctx.lineTo(tx, ty); ctx.stroke(); ctx.strokeStyle = '#ff7aa0'; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(tx, ty, 11, 0, 7); ctx.fill(); ctx.fillStyle = '#ff5a8a'; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#ffb0c8'; ctx.fillRect(tx - 4, ty - 5, 3, 3); }
  const pose = (!B.ground) ? 'jump' : (['twind', 'tongue', 'inhale', 'chew'].includes(B.state)) ? 'open' : 'sit';
  const img = (B.flash > 0 ? SPR.bfrogW : SPR.bfrog)[pose];
  if (B.state === 'twind' || B.state === 'lwind' || B.state === 'dying') x += Math.round(Math.sin(gtime * 70) * 2);
  if (B.state === 'sleep') { y += Math.round(Math.sin(gtime * 2) * 1); }
  ctx.save(); ctx.translate(x, y); ctx.scale(B.dir * B.sx, B.sy); ctx.drawImage(img, -140, -138); ctx.restore();
  if (B.state === 'sleep' && Math.abs(P.x - B.x) < 460) { const z = (gtime % 1.5) / 1.5; text('Z', x + 40 + z * 14, y - 150 - z * 24, { s: 2 + Math.round(z), alpha: 1 - z }); }
  if (B.state === 'dazed') { for (let i = 0; i < 4; i++) { const a = gtime * 5 + i * 1.6; text('★', x + B.dir * 50 + Math.cos(a) * 30, y - 150 + Math.sin(a) * 8, { color: '#ffe45a' }); } if (Math.floor(gtime * 6) % 2) text('BATA!', x, y - 175, { s: 2, color: '#7cf05a', align: 'center' }); }
  if (B.state === 'inhale') text('SUCÇÃO!', x + B.dir * 140, y - 140, { s: 2, color: '#bfefff', align: 'center' });
}
function drawScorp(B, cx, cy) {""")
# ---------- level 3 & 4
a=s.index("{ id: 'pantano'"); b=s.index("{ id: 'gramado'")
s=s[:a]+"""{ id: 'pantano', sub: '3', mk: () => makeLevel('pantano', 182, L => {
    L.ground(0, 18, 4); L.s(6, 6, 5); L.e('frog', 13, 4);
    L.plat(20, 3, 3); L.plat(25, 4, 3); L.plat(30, 3, 3); L.plat(35, 4, 3); L.s(20, 5, 3); L.s(30, 5, 3); L.s(25, 7, 3, 0);
    L.ground(40, 55, 4); L.e('frog', 48, 4); L.s(42, 6, 5);
    L.plat(57, 3, 3); L.plat(62, 4, 2); L.s(57, 6, 7, 1.5);
    L.ground(66, 78, 5); L.e('frog', 72, 5); L.plat(74, 8, 3); L.s(74, 10, 3);
    L.plat(80, 3, 3); L.plat(85, 5, 2); L.plat(89, 3, 3); L.plat(94, 4, 3); L.s(85, 7, 2); L.s(89, 5, 3); L.s(94, 6, 3);
    L.ground(100, 120, 4); L.e('frog', 106, 4); L.e('frog', 115, 4); L.s(102, 6, 4);
    L.ground(120, 126, 7); L.s(120, 9, 6);
    L.plat(128, 4, 3); L.plat(133, 5, 3); L.s(128, 6, 3); L.s(133, 7, 3);
    L.ground(137, 182, 4); L.n(139, 4); L.s(140, 6, 2);
    L.boss = { kind: 'frog', x: 170, h: 4, arenaL: 142, arenaR: 182 };
    L.f(176, 4);
  }) },
  """+s[b:]
rep4=[("L.e('ant', 12, 3); L.e('lady', 18, 8, { amp: 22 });","L.e('cater', 12, 3); L.e('fly', 18, 8);"),
("L.e('beetle', 33, 4); L.e('spider', 39, 0, { top: 20, range: 210 });","L.e('stick', 33, 4); L.e('spider', 39, 0, { top: 20, range: 210 });"),
("L.s(55, 9, 3); L.e('lady', 50, 14, { amp: 16 });","L.s(55, 9, 3); L.e('fly', 50, 13);"),
("L.e('scorp', 68, 3);  L.e('ant', 72, 3);","L.e('hopper', 66, 3); L.e('cater', 72, 3);"),
("L.e('beetle', 91, 4); L.e('beetle', 97, 4);","L.e('stick', 91, 4); L.e('hopper', 97, 4);"),
("L.e('scorp', 113, 3); L.e('lady', 116, 9, { amp: 24 }); L.e('ant', 120, 3);","L.e('stick', 113, 3); L.e('fly', 116, 9); L.e('cater', 120, 3);"),
("L.e('beetle', 150, 4); L.e('scorp', 155, 4);","L.e('hopper', 150, 4); L.e('stick', 155, 4);"),
("L.e('lady', 163, 8, { amp: 20 }); L.e('ant', 167, 3);","L.e('fly', 163, 8); L.e('cater', 167, 3); L.e('hopper', 171, 3);")]
for a_,b_ in rep4: R(a_,b_)
open(p,'w').write(s)
