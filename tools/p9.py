p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,c=1):
    global s; assert a in s, a[:70]; s=s.replace(a,b,c)
# frog spines (big only)
R("E(24, 18, 15, 10, '#56b236'); E(28, 23, 11, 5, '#e8f0a0'); E(20, 12, 7, 2.5, '#7ad84a');",
  "if (KK >= 5) { [10, 14.5, 19, 23.5, 28].forEach((sx, i) => { const by = 18 - 10 * Math.sqrt(Math.max(0, 1 - ((sx - 24) / 15) ** 2)) + 1.2; const hgt = i === 2 || i === 3 ? 6 : 4.6; for (let j = 0; j <= 10; j++) { const u = j / 10; E(sx - u * 1.2, by - u * hgt, 1.5 * (1 - u) + .25, .45, u > .65 ? '#f4ecd0' : '#8a3aa0'); } }); }\n    E(24, 18, 15, 10, '#56b236'); E(28, 23, 11, 5, '#e8f0a0'); E(20, 12, 7, 2.5, '#7ad84a');")
R("if (sc && !open) { hurtPlayer(B.x);","if ((sc || B.kind === 'frog') && !open) { hurtPlayer(B.x);")
# snake sprites
R("  SPR.boss = { stand:","""  const sHead = (open) => pix(48, 32, g => {
    g.ell(6, 16, 4.5, 9, '#1a1a1a');
    if (!open) { g.ell(21, 16, 16, 10, '#5ab030'); g.ell(19, 12, 11, 5, '#7ad848'); g.ell(25, 21, 13, 4, '#d8f080'); g.ell(29, 10, 4, 4, '#ffe040'); g.line(29, 7, 29, 13, '#1a1020'); g.line(23, 5, 34, 8, '#2a5a14'); g.line(24, 6, 34, 9, '#2a5a14'); g.p(41, 13, '#1a1020'); g.line(26, 19, 43, 16, '#2a5a14'); g.ell(15, 11, 1.5, 1.2, '#2a5a14'); g.ell(11, 15, 1.4, 1.2, '#2a5a14'); }
    else { g.ell(23, 26, 13, 4.5, '#d8f080'); g.ell(21, 12, 16, 8.5, '#5ab030'); g.ell(19, 8.5, 11, 4, '#7ad848'); g.ell(31, 19.5, 11, 4.6, '#5a0a20'); g.line(28, 20, 43, 21, '#ff3b5c'); g.line(38, 15, 38, 21, '#ffffff'); g.line(39, 15, 39, 20, '#ffffff'); g.line(32, 15, 32, 19, '#ffffff'); g.ell(29, 7, 4, 4, '#ffe040'); g.line(29, 4, 29, 10, '#1a1020'); g.line(23, 3, 34, 6, '#2a5a14'); g.line(24, 4, 34, 7, '#2a5a14'); g.p(41, 10, '#1a1020'); }
  }, OL);
  SPR.shead = { c: sHead(false), o: sHead(true) }; SPR.sheadW = { c: tinted(SPR.shead.c, '#fff'), o: tinted(SPR.shead.o, '#fff') };
  SPR.snakeM = [0, 1].map(f => pix(34, 16, g => {
    for (let i = 0; i < 7; i++) { const x = 3 + i * 3.6, y = 10 + Math.sin(i * 1.1 + f * 1.6) * 2.2; g.ell(x, y, 2.6 + i * .15, 2.6 + i * .15, i % 2 ? '#1a1a1a' : '#6ad030'); }
    g.ell(29, 8.5, 4.2, 3.4, '#5ab030'); g.p(30, 7, '#ffe040'); g.p(31, 7, '#1a1020'); if (f) { g.line(33, 9, 34, 9, '#ff3b5c'); }
  }, OL));
  SPR.boss = { stand:""")
# minion enemy
R("    case 'mosca':","    case 'snakeM': e.w = 28; e.h = 12; e.speed = 42; e.hp = 1; e.score = 100; break;\n    case 'mosca':")
# makeBoss
R("const scorp = b.kind === 'scorp', frog = b.kind === 'frog'; return { kind: b.kind || 'hopper', name: frog ?","const scorp = b.kind === 'scorp', frog = b.kind === 'frog', snake = b.kind === 'snake'; return { kind: b.kind || 'hopper', bx: b.x * T + 8, hx: 70, hy: 18, name: snake ? 'COBRA VENENOSA' : frog ?")
R("nameCol: frog ? '#7cf05a' :","nameCol: snake ? '#b4ff5a' : frog ? '#7cf05a' :")
R("pat: frog ? ['tongue',","pat: snake ? ['strike', 'spit', 'summon', 'strike', 'spit', 'strike'] : frog ? ['tongue',")
R("hp: frog ? 18 : scorp ? 16 : 14, max: frog ? 18 :","hp: snake ? 20 : frog ? 18 : scorp ? 16 : 14, max: snake ? 20 : frog ? 18 :")
R("w: frog ? 230 : scorp ? 100 : 84, h: frog ? 140 :","w: snake ? 40 : frog ? 230 : scorp ? 100 : 84, h: snake ? 26 : frog ? 140 :")
R("} else if (B.kind === 'frog') { startFrogCut(B); } else {","} else if (B.kind === 'frog') { startFrogCut(B); } else if (B.kind === 'snake') { B.state = 'intro'; B.st = 1.6; noise({ f: 4500, type: 'highpass', t: .9, v: .25 }); } else {")
R("  if (B.kind === 'frog') { updateFrog(B, dt); return; }","  if (B.kind === 'frog') { updateFrog(B, dt); return; }\n  if (B.kind === 'snake') { updateSnake(B, dt); return; }")
R("  if (G.boss.kind === 'frog') { if (G.boss.state !== 'dead') drawFrogBoss(G.boss, cx, cy); return; }","  if (G.boss.kind === 'frog') { if (G.boss.state !== 'dead') drawFrogBoss(G.boss, cx, cy); return; }\n  if (G.boss.kind === 'snake') { drawSnake(G.boss, cx, cy); return; }")
R("|| (B.kind === 'frog' && B.state === 'dazed'), dmg = open ? 2 : 1;","|| (B.kind === 'frog' && B.state === 'dazed') || (B.kind === 'snake' && B.state === 'stun'), dmg = open ? 2 : 1;")
R("text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'frog' ?","text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'snake' ? 'DICA: BATA NA CABEÇA DEPOIS DO BOTE! CORPO E VENENO DOEM' : G.boss.kind === 'frog' ?")
R("function startFrogCut(B) {",r"""function snakeSegs(B) {
  const F = B.floorY, tailX = B.bx - B.dir * 150, hxp = B.x - B.dir * 14, hyc = B.y - 12, out = [], N = 18;
  for (let i = 0; i <= N; i++) { const t = i / N; let x, y;
    if (t < .6) { const u = t / .6; x = lerp(tailX, B.bx, u); y = F - 7 - Math.abs(Math.sin(u * 5 + B.t * 4)) * 3; }
    else { const u = (t - .6) / .4, e = u * u * (3 - 2 * u); x = lerp(B.bx, hxp, u); y = lerp(F - 8, hyc, e); }
    out.push({ x, y, r: 4 + 6 * Math.min(1, t * 1.3), t }); }
  return out;
}
function updateSnake(B, dt) {
  const enr = B.hp <= B.max * .5, F = B.floorY; B.proj = B.proj || []; B.pud = B.pud || [];
  for (let i = B.proj.length - 1; i >= 0; i--) { const q = B.proj[i]; q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (Math.random() < .6) parts.push({ x: q.x, y: q.y, vx: 0, vy: 0, life: .3, max: .3, c: '#b4ff5a', sz: 2, g: 0, k: 'sq' });
    if (Math.abs(P.x - q.x) < 12 && q.y > P.y - 38 && q.y < P.y + 2) { hurtPlayer(q.x); B.proj.splice(i, 1); continue; }
    if (q.y >= F - 2) { B.pud.push({ x: q.x, life: 3.2 }); SFX.splash(); for (let k = 0; k < 10; k++) parts.push({ x: q.x, y: F - 2, vx: rnd(-90, 90), vy: rnd(-200, -60), life: .4, max: .4, c: '#9ae040', sz: 2, g: 700, k: 'sq' }); B.proj.splice(i, 1); } }
  for (let i = B.pud.length - 1; i >= 0; i--) { const u = B.pud[i]; u.life -= dt; if (Math.random() < dt * 4) parts.push({ x: u.x + rnd(-14, 14), y: F - 3, vx: 0, vy: -30, life: .5, max: .5, c: '#c8ff70', sz: 2, g: -20, k: 'puff' }); if (Math.abs(P.x - u.x) < 18 && P.y > F - 6) hurtPlayer(u.x); if (u.life <= 0) B.pud.splice(i, 1); }
  const face = () => { B.dir = P.x > B.bx ? 1 : -1; };
  let thx = 70, thy = 60, sp = 8;
  switch (B.state) {
    case 'intro': B.st -= dt; face(); thy = 60; sp = 3; if (B.st <= 0) { B.state = 'idle'; B.st = .8; } break;
    case 'idle': { face(); const want = P.x - B.dir * 175; B.bx += clamp(want - B.bx, -(enr ? 85 : 60) * dt, (enr ? 85 : 60) * dt); B.st -= dt;
      if (B.st <= 0) { const a = B.pat[B.pi++ % B.pat.length];
        if (a === 'strike') { B.state = 'coil'; B.st = enr ? .5 : .75; noise({ f: 4500, type: 'highpass', t: .5, v: .2 }); }
        else if (a === 'spit') { B.state = 'spitw'; B.st = .6; }
        else { B.state = 'summon'; B.st = .9; noise({ f: 4000, type: 'highpass', t: .9, v: .25 }); } } break; }
    case 'coil': thx = 30; thy = 88; B.st -= dt; if (B.st <= 0) { B.state = 'strike'; B.st = .22; SFX.dash(); } break;
    case 'strike': thx = 245; thy = 14; sp = 26; B.st -= dt; if (B.st <= 0) { B.state = 'stun'; B.st = enr ? 1.1 : 1.45; SFX.boom(); fx.shake = 5; dust(B.x, F, 8); floatText('ATORDOADA!', B.x, F - 60, '#7cf05a', 2); } break;
    case 'stun': thx = 245; thy = 13; B.st -= dt; if (B.st <= 0) { B.state = 'retract'; B.st = .35; } break;
    case 'retract': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = enr ? .4 : .7; } break;
    case 'spitw': thx = 55; thy = 78; B.st -= dt; if (B.st <= 0) { const n = enr ? 5 : 3, hx = B.x + B.dir * 20, d = P.x - hx; for (let k = 0; k < n; k++) { const f = .5 + .9 * k / (n - 1); B.proj.push({ x: hx, y: B.y - 16, vx: clamp(d * f / .9, -430, 430) || B.dir * 120, vy: -400 }); } tone({ type: 'sawtooth', f: 300, f2: 120, t: .2, v: .2 }); B.state = 'spit'; B.st = .55; } break;
    case 'spit': thx = 55; thy = 70; B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .5; } break;
    case 'summon': thx = 55; thy = 95; B.st -= dt; if (B.st <= 0) { const alive = G.enemies.filter(e => e.type === 'snakeM' && !e.dead).length, n = enr ? 3 : 2;
        for (let k = 0; k < n && alive + k < 4; k++) { const x = k % 2 ? G.camX + 30 : G.camX + W - 30; const e = makeEnemy({ type: 'snakeM', x, y: F }); e.dir = x < P.x ? 1 : -1; G.enemies.push(e); G.enemiesTotal++; for (let j = 0; j < 10; j++) parts.push({ x, y: F - 4, vx: rnd(-80, 80), vy: rnd(-200, -60), life: .5, max: .5, c: '#4ab83a', sz: 3, g: 600, k: 'sq' }); }
        floatText('CRIAS!', B.x, B.y - 60, '#b4ff5a', 2); B.state = 'idle'; B.st = .6; } break;
    case 'dying': if (!B.cleaned) { B.cleaned = true; B.proj.length = 0; B.pud.length = 0; G.enemies.forEach(e => { if (e.type === 'snakeM' && !e.dead) { e.dead = true; e.vx = rnd(-120, 120); e.vy = -250; e.rot = 0; } }); } bossDie(B, dt); break;
  }
  B.hx = lerp(B.hx, thx, Math.min(1, dt * sp)); B.hy = lerp(B.hy, thy, Math.min(1, dt * sp));
  B.bx = clamp(B.bx, B.arenaL + 60, B.arenaR - 60);
  B.x = B.bx + B.dir * B.hx; B.y = F - B.hy + 14;
  if (B.state !== 'dying' && B.state !== 'dead' && G.deadT <= 0) for (const g of snakeSegs(B)) { if (g.t > .85) continue; if (Math.abs(P.x - g.x) < g.r + 7 && P.y > g.y - g.r && P.y - 34 < g.y + g.r) { hurtPlayer(g.x); break; } }
}
function drawSnake(B, cx, cy) {
  if (B.state === 'dead') return; const F = B.floorY - cy;
  for (const u of B.pud || []) { const a = clamp(u.life, 0, 1); ctx.globalAlpha = .75 * a; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(u.x - cx, F, 21, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8ad830'; ctx.beginPath(); ctx.ellipse(u.x - cx, F, 19, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#d8ff90'; ctx.fillRect(u.x - cx - 8, F - 2, 6, 1); ctx.globalAlpha = 1; }
  if (B.state === 'sleep') { B.x = B.bx + B.dir * B.hx; B.y = B.floorY - B.hy + 14; }
  const wht = B.flash > 0, segs = snakeSegs(B);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(B.bx - cx - B.dir * 60, F, 110, 5, 0, 0, 7); ctx.fill();
  segs.forEach((g, i) => { const x = Math.round(g.x - cx), y = Math.round(g.y - cy), r = Math.round(g.r); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x, y, r + 1, 0, 7); ctx.fill(); ctx.fillStyle = wht ? '#ffffff' : (i % 3 === 0 ? '#1a1a1a' : i % 3 === 1 ? '#6ad030' : '#ffd040'); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); if (!wht && r > 4) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x - 2, y - r + 1, 3, 2); } });
  const open = ['spitw', 'spit', 'summon', 'strike', 'stun', 'coil'].includes(B.state);
  const img = (wht ? SPR.sheadW : SPR.shead)[open ? 'o' : 'c']; let hx = Math.round(B.x - cx), hy = Math.round(B.y - cy - 13);
  if (B.state === 'coil' || B.state === 'summon' || B.state === 'dying') hx += Math.round(Math.sin(gtime * 70) * 2);
  ctx.save(); ctx.translate(hx, hy); ctx.scale(B.dir, 1); ctx.drawImage(img, -24, -16); ctx.restore();
  if (!open && B.state !== 'sleep' && (gtime % 1.2) < .25) { const tx = hx + B.dir * 22, ty = hy + 3; ctx.fillStyle = '#ff3b5c'; ctx.fillRect(Math.min(tx, tx + B.dir * 10), ty, 10, 1); ctx.fillRect(tx + B.dir * 10, ty - 2, 1, 2); ctx.fillRect(tx + B.dir * 10, ty + 1, 1, 2); }
  for (const q of B.proj || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#9ae040'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ffb0'; ctx.fillRect(x - 2, y - 2, 2, 2); }
  if (B.state === 'coil') text('!', hx, hy - 30, { s: 3, color: '#ff3b5c', align: 'center' });
  if (B.state === 'stun') { for (let i = 0; i < 3; i++) { const a = gtime * 6 + i * 2.1; text('★', hx + Math.cos(a) * 18, hy - 20 + Math.sin(a) * 5, { color: '#ffe45a' }); } if (Math.floor(gtime * 6) % 2) text('BATA!', hx, hy - 40, { s: 2, color: '#7cf05a', align: 'center' }); }
  if (B.state === 'sleep' && Math.abs(P.x - B.bx) < 460) { const z = (gtime % 1.5) / 1.5; text('Z', hx + 20 + z * 10, hy - 30 - z * 20, { s: 1 + Math.round(z), alpha: 1 - z }); }
}
function startFrogCut(B) {""")
# level 4 end
R("makeLevel('gramado', 182,","makeLevel('gramado', 202,")
R("L.ground(158, 182, 3); L.e('fly', 163, 8); L.e('cater', 167, 3); L.e('hopper', 171, 3); L.s(160, 5, 6);\n    L.f(175, 3);",
  "L.ground(158, 202, 3); L.e('fly', 163, 8); L.e('snakeM', 166, 3); L.s(160, 5, 6); L.n(169, 3);\n    L.boss = { kind: 'snake', x: 192, h: 3, arenaL: 172, arenaR: 202 };\n    L.f(197, 3);")
R("L.ground(86, 100, 4); L.e('stick', 91, 4); L.e('hopper', 97, 4);","L.ground(86, 100, 4); L.e('stick', 91, 4); L.e('snakeM', 97, 4);")
open(p,'w').write(s)
