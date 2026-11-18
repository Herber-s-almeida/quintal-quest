p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,c=1):
    global s; assert a in s, a[:70]; s=s.replace(a,b,c)
R("  SPR.boss = { stand:","""  const moscaF = (f, king) => pix(king ? 40 : 24, king ? 38 : 20, g => {
    const k = king ? 1.6 : 1, E = (x, y, rx, ry, c) => g.ell(x * k, y * k + (king ? 8 : 0), rx * k, ry * k, c);
    if (f === 0) { E(9, 4, 6, 3.2, '#d8e8f8'); E(13, 3.5, 4.5, 2.5, '#eef6ff'); } else { E(8, 9, 6, 2.4, '#d8e8f8'); }
    E(9, 11, 6.5, 4.5, '#3a3a4a'); E(7.5, 9.5, 3, 1.6, '#6a6a80'); for (let i = 0; i < 3; i++) E(5 + i * 3, 12, .5, 2.6, '#22222e');
    E(16.5, 10, 4, 4, '#2a2a38'); E(18, 8.6, 2.3, 2.6, '#c81e2a'); E(17.6, 7.8, .7, .7, '#ff9a9a');
    g.line(8 * k, (14.5 * k) + (king ? 8 : 0), 7 * k, (17.5 * k) + (king ? 8 : 0), '#1a1020'); g.line(12 * k, (14.5 * k) + (king ? 8 : 0), 13 * k, (17.5 * k) + (king ? 8 : 0), '#1a1020');
    if (king) { g.rect(20, 2, 15, 6, '#ffd040'); g.p(20, 0, '#ffd040'); g.p(20, 1, '#ffd040'); g.rect(26, 0, 3, 2, '#ffd040'); g.p(34, 0, '#ffd040'); g.p(34, 1, '#ffd040'); g.p(23, 4, '#ff3b5c'); g.p(27, 4, '#4ad8ff'); g.p(31, 4, '#7cf05a'); g.rect(20, 7, 15, 1, '#c89020'); }
  }, OL);
  SPR.mosca = [moscaF(0), moscaF(1)]; SPR.moscaK = [moscaF(0, true), moscaF(1, true)];
  SPR.boss = { stand:""")
R("    case 'fly': e.w = 24;","    case 'mosca': e.w = 20; e.h = 16; e.score = 120; e.fly = true; e.amp = o.amp || 16; e.state = 'hover'; break;\n    case 'fly': e.w = 24;")
R("  if (e.type === 'ladyC') {","  if (e.type === 'ladyC' || e.type === 'mosca') {")
R("Math.floor(e.t * (e.type === 'lady' || e.type === 'ladyC' ?","Math.floor(e.t * (e.type === 'mosca' ? 30 : e.type === 'lady' || e.type === 'ladyC' ?")
R("  if (e.type === 'ladyC' && e.state === 'aim' && !e.dead) ctx.translate(","  if (e.type === 'mosca' && !e.dead) ctx.translate(Math.round(Math.sin(gtime * 47 + e.ox) * 1.5), Math.round(Math.cos(gtime * 53 + e.ox) * 1.5));\n  if ((e.type === 'ladyC' || e.type === 'mosca') && e.state === 'aim' && !e.dead) ctx.translate(")
R("  const oy = e.type === 'lady' || e.type === 'ladyC' ||","  const oy = e.type === 'mosca' || e.type === 'lady' || e.type === 'ladyC' ||")
R("  if (e.type === 'ladyC' && e.state === 'aim' && !e.dead) text('!',","  if ((e.type === 'ladyC' || e.type === 'mosca') && e.state === 'aim' && !e.dead) text('!',")
# level 3 moscas
R("L.s(20, 5, 3); L.s(30, 5, 3); L.s(25, 7, 3, 0);","L.s(20, 5, 3); L.s(30, 5, 3); L.s(25, 7, 3, 0); L.e('mosca', 28, 8);")
R("L.plat(57, 3, 3); L.plat(62, 4, 2); L.s(57, 6, 7, 1.5);","L.plat(57, 3, 3); L.plat(62, 4, 2); L.s(57, 6, 7, 1.5); L.e('mosca', 60, 8);")
R("L.s(85, 7, 2); L.s(89, 5, 3); L.s(94, 6, 3);\n    L.ground(100, 120, 4); L.e('frog', 106, 4);","L.s(85, 7, 2); L.s(89, 5, 3); L.s(94, 6, 3); L.e('mosca', 87, 9); L.e('mosca', 96, 8);\n    L.ground(100, 120, 4); L.e('frog', 106, 4);")
R("L.ground(120, 126, 7); L.s(120, 9, 6);\n    L.plat(128, 4, 3);","L.ground(120, 126, 7); L.s(120, 9, 6); L.e('mosca', 123, 11);\n    L.plat(128, 4, 3); L.e('mosca', 132, 8);")
# trigger -> cutscene
R("} else if (B.kind === 'frog') { B.state = 'intro'; B.st = 1.6; SFX.boom(); } else {","} else if (B.kind === 'frog') { startFrogCut(B); } else {")
R("!['dig', 'under', 'warn', 'air', 'leapUp'].includes(B.state)","!['dig', 'under', 'warn', 'air', 'leapUp', 'cut'].includes(B.state)")
R("text(G.boss.kind === 'frog' ? 'DICA:","text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'frog' ? 'DICA:")
R("function updateFrog(B, dt) {","""function startFrogCut(B) {
  B.state = 'cut'; B.ct = 0; B.fake = true; B.name = 'REI DAS MOSCAS'; B.nameCol = '#c8d0ff'; B.hidden = true; B.cphase = 0;
  P.ctrl = false; P.vx = 0; P.inv = 99; P.dashT = 0; P.punchT = -1;
  const cx = (B.arenaL + B.arenaR) / 2 + 40, F = B.floorY, fl = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; fl.push({ x: B.arenaR + rnd(20, 200), y: F - rnd(40, 260), hx: cx + Math.cos(a) * rnd(55, 110), hy: F - 140 + Math.sin(a) * rnd(35, 70), ph: rnd(0, 6), king: false, eaten: false, t: 0 }); }
  fl.push({ x: cx, y: G.camY - 60, hx: cx, hy: F - 150, ph: 0, king: true, eaten: false, t: 0 });
  G.cutFlies = fl; B.x = clamp(cx - 60, B.arenaL + 130, B.arenaR - 130); B.y = F + 260; B.dir = -1;
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
  if (B.state === 'cut') { updateFrogCut(B, dt); return; }""")
R("function drawFrogBoss(B, cx, cy) {","""function drawFrogBoss(B, cx, cy) {
  if (G.cutFlies) for (const f of G.cutFlies) { if (f.eaten) continue; const im = (f.king ? SPR.moscaK : SPR.mosca)[Math.floor(gtime * 30) % 2]; ctx.save(); ctx.translate(Math.round(f.x - cx), Math.round(f.y - cy)); ctx.scale(f.x > P.x ? -1 : 1, 1); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore(); }
  if (B.state === 'cut' && B.hidden) return;
  if (B.state === 'sleep') return;""")
R("const pose = (!B.ground) ? 'jump' : (['twind', 'tongue', 'inhale', 'chew'].includes(B.state)) ? 'open' : 'sit';","const pose = (!B.ground) ? 'jump' : (B.mouth || ['twind', 'tongue', 'inhale', 'chew'].includes(B.state)) ? 'open' : 'sit';")
# don't hide boss bar issues: hp shown full during fake. ok.
open(p,'w').write(s)
