p='game.js'; s=open(p).read()
rep=[
# sprites: nurse, station, half heart
("  // props\n  const prop = {};","""  { const [c, x] = mkCanvas(ANT.cw, ANT.ch); const fi = ANT.anims.hurt[0]; x.drawImage(IMG.ant, fi * ANT.cw, 0, ANT.cw, ANT.ch, 0, 0, ANT.cw, ANT.ch);
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
  // props
  const prop = {};"""),
# sfx
("  spring() {","  djump() { tone({ f: 500, f2: 1100, t: .12, v: .12 }); tone({ type: 'triangle', f: 900, f2: 1600, t: .1, v: .1, d: .03 }); },\n  heal() { [0, 4, 7, 12, 16].forEach((st, i) => tone({ type: 'triangle', f: 660 * Math.pow(2, st / 12), t: .18, v: .18, d: i * .07 })); tone({ type: 'sine', f: 1320, t: .5, v: .1, d: .35 }); },\n  powerup() { [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((st, i) => tone({ type: 'square', f: 523 * Math.pow(2, st / 12), t: .08, v: .12, d: i * .05 })); noise({ f: 6000, t: .4, v: .1, type: 'highpass', d: .1 }); },\n  spring() {"),
# makeLevel nurse
("    f(x, h) { h += BASE; this.flag","    n(x, h) { h += BASE; this.nurses.push({ x: x * T + 8, y: (ROWS - h) * T, used: false, t: 0 }); },\n    f(x, h) { h += BASE; this.flag"),
("theme, len, grid, enemies: [], sugar: [],","theme, len, grid, enemies: [], sugar: [], nurses: [],"),
# player init hp, jumps, boost
("hurtT: 0, inv: 0, hp: 3,","hurtT: 0, inv: 0, hp: 6, jumps: 1, flip: 0, boost: 0,"),
("  G.bgAnts = def.id ===","  G.nurses = L.nurses.map(n => ({ ...n })); G.sugarMeter = 0;\n  G.bgAnts = def.id ==="),
# hurt half
("function hurtPlayer(fromX) {\n  if (P.inv > 0 || G.clear) return;\n  P.hp--;","function hurtPlayer(fromX, dmg = 1) {\n  if (P.inv > 0 || G.clear || P.boost > 0) return;\n  P.hp -= dmg;"),
("P.inv = 0; hurtPlayer(P.x); if (P.hp > 0)","P.inv = 0; const bst = P.boost; P.boost = 0; hurtPlayer(P.x, 2); P.boost = bst; if (P.hp > 0)"),
# movement air control + boost speed
("    const acc = P.ground ? 1900 : 1300, max = 178;\n    if (P.hurtT > 0) { } else if (mx) { P.vx += mx * acc * dt;","    const bm = P.boost > 0 ? 1.5 : 1; const acc = (P.ground ? 1900 : 1700) * bm, max = 178 * bm;\n    if (P.hurtT > 0) { } else if (mx) { const rev = Math.sign(P.vx) === -mx; P.vx += mx * acc * (rev ? (P.ground ? 1.6 : 2.4) : 1) * dt;"),
# jump + double jump
("  if (P.ground) P.coyote = .09; else P.coyote -= dt;","  if (P.ground) { P.coyote = .09; P.jumps = 1; } else P.coyote -= dt;\n  if (P.flip > 0) P.flip -= dt;"),
("    if (P.dashT > 0) { P.dashT = 0; P.vx = P.dir * 230; }\n  }","    if (P.dashT > 0) { P.dashT = 0; P.vx = P.dir * 230; }\n  } else if (P.buf > 0 && P.jumps > 0 && !P.ground && P.hurtT <= 0 && G.deadT <= 0) {\n    P.jumps--; P.buf = 0; P.vy = -460; P.dashT = 0; P.flip = .32; if (mx) { P.vx = mx * Math.max(Math.abs(P.vx), 150); P.dir = mx; }\n    SFX.djump(); ring(P.x, P.y, '#bfefff'); for (let i = 0; i < 6; i++) parts.push({ x: P.x + rnd(-6, 6), y: P.y, vx: rnd(-80, 80), vy: rnd(20, 90), life: .3, max: .3, c: '#ffffff', sz: 2, g: 0, k: 'sq' });\n  }"),
# stomp refresh jump
("P.vy = K.jump ? -520 : -380; P.airDash = true;","P.vy = K.jump ? -520 : -380; P.airDash = true; P.jumps = 1;"),
("hitBoss(Math.sign(B.x - P.x) || 1, true); P.vy = K.jump ? -600 : -500; P.airDash = true;","hitBoss(Math.sign(B.x - P.x) || 1, true); P.vy = K.jump ? -600 : -500; P.airDash = true; P.jumps = 1;"),
# boost: enemy contact kills
("      if (P.dashT > 0) { if (!P.dashHit.has(e)) { P.dashHit.add(e); damageEnemy(e, 1, P.dir, 'dash'); } continue; }","      if (P.boost > 0) { damageEnemy(e, 99, Math.sign(e.x - P.x) || 1, 'boost'); continue; }\n      if (P.dashT > 0) { if (!P.dashHit.has(e)) { P.dashHit.add(e); damageEnemy(e, 1, P.dir, 'dash'); } continue; }"),
("      if (P.dashT > 0) { if (!P.dashHit.has(B)) {","      if (P.boost > 0) { hitBoss(Math.sign(B.x - P.x) || 1); }\n      else if (P.dashT > 0) { if (!P.dashHit.has(B)) {"),
# sugar meter
("      s.got = true; G.sugar++; G.score += 10;","      s.got = true; G.sugar++; G.score += 10; addSugarMeter();"),
]
for a,b in rep:
    assert a in s, a[:60]; s=s.replace(a,b,1)
# nurses + boost update in interactions (before flag)
s=s.replace("  G.chainT -= dt;\n","""  G.chainT -= dt;
  for (const n of G.nurses) {
    n.t += dt;
    if (!n.used && Math.abs(P.x - n.x) < 26 && Math.abs(P.y - n.y) < 30) {
      if (P.hp < 6) { n.used = true; n.hop = .6; const h0 = P.hp; P.hp = 6; P.inv = Math.max(P.inv, .5); SFX.heal(); floatText('CURADO!', n.x, n.y - 64, '#7cf05a', 2);
        for (let i = 0; i < 6 - h0; i++) floats.push({ s: '♥', x: P.x + rnd(-14, 14), y: P.y - 40 - i * 6, c: '#ff3b5c', t: -i * .08, sc: 2 });
        for (let i = 0; i < 14; i++) parts.push({ x: P.x + rnd(-12, 12), y: P.y - rnd(0, 40), vx: rnd(-20, 20), vy: rnd(-90, -40), life: rnd(.5, .9), max: .9, c: i % 2 ? '#ff8aa8' : '#ffffff', sz: 2, g: -40, k: 'star' }); }
      else if (!n.full) { n.full = 1.2; floatText('VIDA CHEIA!', n.x, n.y - 64, '#ffffff'); }
    }
    if (n.full > 0) n.full -= dt; else if (Math.abs(P.x - n.x) > 60) n.full = 0;
    if (n.hop > 0) n.hop -= dt;
  }
""",1)
# boost tick in updatePlayer start
s=s.replace("  P.inv -= dt; P.hurtT -= dt; P.dashCD -= dt;","  P.inv -= dt; P.hurtT -= dt; P.dashCD -= dt;\n  if (P.boost > 0) { P.boost -= dt; if (Math.random() < .7) parts.push({ x: P.x + rnd(-10, 10), y: P.y - rnd(4, 40), vx: rnd(-20, 20), vy: rnd(-60, -10), life: .4, max: .4, c: ['#ffe45a', '#ffffff', '#ff8ae0', '#7ff0ff'][Math.floor(Math.random() * 4)], sz: 2, g: 0, k: 'star' }); if (Math.abs(P.vx) > 100 && Math.random() < .5) ghosts.push({ x: P.x, y: P.y, f: playerFrame(), dir: P.dir, a: .5, gold: true }); if (P.boost <= 0) floatText('FIM DO TURBO', P.x, P.y - 56, '#c8c8d8'); }",1)
# addSugarMeter function
s=s.replace("// ---------- clear sequence ----------","""function addSugarMeter() {
  G.sugarMeter++;
  if (G.sugarMeter >= 10) { G.sugarMeter = 0; P.boost = 5; SFX.powerup(); fx.flash = .18; fx.shake = 3; floatText('TURBO!', P.x, P.y - 60, '#ffe45a', 3); confettiSmall(P.x, P.y - 30); ring(P.x, P.y - 20, '#ffe45a'); }
}
// ---------- clear sequence ----------""",1)
# draw nurses (before enemies)
s=s.replace("  for (const e of G.enemies) drawEnemy(e, cx, cy);","""  for (const n of G.nurses) { const x = Math.round(n.x - cx), y = Math.round(n.y - cy); if (x < -60 || x > W + 60) continue;
    ctx.drawImage(SPR.station, x - 34, y - 66); const hop = n.hop > 0 ? -Math.abs(Math.sin(n.hop * 16)) * 6 : 0; const bob = Math.round(Math.sin(n.t * 3) * .6);
    ctx.save(); ctx.translate(x + 10, y + hop); ctx.scale(P.x < n.x ? -1 : 1, 1 + bob * .02); ctx.drawImage(SPR.nurse, -ANT.cw / 2, -ANT.ch); ctx.restore();
    if (!n.used) { const b = Math.sin(gtime * 4) * 2; ctx.drawImage(SPR.heart, x + 4, y - 84 + b, 11, 10); text('+', x - 4, y - 80 + b, { color: '#7cf05a' }); } }
  for (const e of G.enemies) drawEnemy(e, cx, cy);""",1)
# player draw: flip rotation + boost glow; ghosts gold
s=s.replace("  if (!blink) drawAnt(playerFrame(), P.x - cx, P.y - cy, P.dir, { sx: P.sx, sy: P.sy });","""  if (!blink) {
    if (P.flip > 0) { const a = (1 - P.flip / .32) * Math.PI * 2 * P.dir; ctx.save(); ctx.translate(Math.round(P.x - cx), Math.round(P.y - cy - 24)); ctx.rotate(a); drawAnt(ANT.anims.run[3], 0, 24, P.dir); ctx.restore(); }
    else drawAnt(playerFrame(), P.x - cx, P.y - cy, P.dir, { sx: P.sx, sy: P.sy });
    if (P.boost > 0 && (P.boost > 1.2 || Math.floor(gtime * 12) % 2)) { if (!SPR.antGold) SPR.antGold = tinted(IMG.ant, '#ffe45a'); const pulse = .35 + Math.sin(gtime * 20) * .15; ctx.globalCompositeOperation = 'lighter'; drawAntImg(SPR.antGold, P.flip > 0 ? ANT.anims.run[3] : playerFrame(), P.x - cx, P.y - cy, P.dir, pulse, P.sx, P.sy); ctx.globalCompositeOperation = 'source-over'; }
  }""",1)
s=s.replace("  for (const g of ghosts) { drawAnt(g.f, g.x - cx, g.y - cy, g.dir, { alpha: g.a * .6, white: true }); }","  for (const g of ghosts) { if (g.gold) { if (!SPR.antGold) SPR.antGold = tinted(IMG.ant, '#ffe45a'); drawAntImg(SPR.antGold, g.f, g.x - cx, g.y - cy, g.dir, g.a * .5, 1, 1); } else drawAnt(g.f, g.x - cx, g.y - cy, g.dir, { alpha: g.a * .6, white: true }); }",1)
s=s.replace("let antWhite = null;","let antWhite = null;\nfunction drawAntImg(src, fi, x, y, dir, alpha, sx, sy) { const cw = ANT.cw, ch = ANT.ch; ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y)); ctx.scale(dir * sx, sy); ctx.drawImage(src, fi * cw, 0, cw, ch, -cw / 2, -ch, cw, ch); ctx.restore(); }",1)
# HUD hearts + meter
old="  for (let i = 0; i < 3; i++) ctx.drawImage(i < P.hp ? SPR.heart : SPR.heartE, 10 + i * 14, 10, 11, 10);\n  ctx.drawImage(SPR.sugar, 56, 10); text('×' + G.sugar, 69, 14);"
assert old in s
s=s.replace(old,"""  for (let i = 0; i < 3; i++) { const v = P.hp - i * 2; const low = P.hp <= 2 && Math.floor(gtime * 4) % 2; ctx.drawImage(v >= 2 ? SPR.heart : v === 1 ? SPR.heartH : SPR.heartE, 10 + i * 14, 10 + (low && v > 0 ? -1 : 0), 11, 10); }
  ctx.drawImage(SPR.sugar, 56, 10); text('×' + G.sugar, 69, 14);
  { const bx = 56, by = 23, w = 50; ctx.fillStyle = '#1a1020'; ctx.fillRect(bx - 1, by - 1, w + 2, 6); if (P.boost > 0) { ctx.fillStyle = ['#ffe45a', '#ff8ae0', '#7ff0ff'][Math.floor(gtime * 10) % 3]; ctx.fillRect(bx, by, w * P.boost / 5, 4); text('TURBO', bx + w + 6, by + 2, { color: '#ffe45a' }); } else { ctx.fillStyle = '#3a2c48'; ctx.fillRect(bx, by, w, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(bx, by, w * G.sugarMeter / 10, 4); for (let i = 1; i < 10; i++) { ctx.fillStyle = '#1a1020'; ctx.fillRect(bx + i * 5, by, 1, 4); } } }""",1)
# place nurses in levels
lv=[("L.boss = { x: 140","L.n(57, 3); L.n(107, 3); L.boss = { x: 140"),
    ("L.ground(130, 136, 5); L.s(130, 7, 6);","L.ground(130, 136, 5); L.s(130, 7, 6); L.n(72, 6); L.n(133, 5);"),
    ("L.ground(66, 78, 5); L.e('ant', 71, 5);","L.ground(66, 78, 5); L.e('ant', 73, 5); L.n(68, 5); L.n(123, 7);"),
    ("L.ground(59, 75, 3); L.e('scorp', 66, 3);","L.ground(59, 75, 3); L.e('scorp', 68, 3); L.n(61, 3); L.n(125, 5); L.n(161, 3);")]
for a,b in lv:
    assert a in s, a; s=s.replace(a,b,1)
open(p,'w').write(s)
