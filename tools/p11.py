p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,c=1):
    global s; assert a in s, a[:80]; s=s.replace(a,b,c)
# themes
R("  mesa: { name: 'MESA DA COZINHA', song: 'cozinha',","  mesa: { name: 'MESA DA COZINHA', tex: 'tex_mesa', flat: true, song: 'cozinha',")
R("  piso: { name: 'COZINHA', song: 'cozinha', top: ['#d8d0e0', '#f6f0fa', '#a8a0b8'],","  piso: { name: 'CHÃO DA COZINHA', tex: 'tex_piso', flat: true, song: 'cozinha', top: ['#e8dcd8', '#fff4f0', '#a898a8'],")
R("  banheiro: { name: 'BANHEIRO', song: 'banheiro',","  banheiro: { name: 'BANHEIRO', tex: 'tex_bath', flat: true, song: 'banheiro',")
R("  esgoto: { name: 'ESGOTO', song: 'esgoto',","  esgoto: { name: 'ESGOTO', tex: 'tex_sewer', song: 'esgoto',")
R("      if (r() < .5) g.p(x, 1, tc); if (r() < .3) g.p(x, 2, tl);\n    }\n  }, null, true);\n}",
  "      if (r() < .5) g.p(x, 1, tc); if (r() < .3) g.p(x, 2, tl);\n    }\n  }, null, true);\n  if (th.flat) th.topTex = pix(64, 14, g => { for (let x = 0; x < 64; x++) { g.p(x, 2, tl); g.p(x, 3, tl); g.p(x, 4, tc); g.p(x, 5, tc); g.p(x, 6, td); if (x % 16 === 0) { g.p(x, 4, td); g.p(x, 5, td); } } }, null, true);\n  if (th.tex && IMG[th.tex]) th.dirtTex = IMG[th.tex];\n}")
# paw sprite
a=s.index("function drawPaw(x, y, s = 1) {"); b=s.index("function updatePaws(dt) {")
s=s[:a]+"""function drawPaw(x, y, s = 1) {
  const im = IMG.dpaw, w = im.width * s, h = im.height * s;
  ctx.drawImage(im, 0, 0, im.width, 24, Math.round(x - w / 2), Math.round(y - h - 700 * s), Math.round(w), Math.round(700 * s + 2));
  ctx.drawImage(im, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
}
"""+s[b:]
# dog side head with layered jaw
a=s.index("function drawDogHead(x, y, s, look) {"); b=s.index("function drawDogBG(cx, cy) {")
s=s[:a]+"""function drawDogHead(x, y, s, look, open) {
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
"""+s[b:]
R("  drawDogHead(x, y, 1, clamp((P.x - (B.arenaR - 200)) / 300, -1, 1));","  drawDogHead(x, y, 1.15, 0, B.state === 'cut' && B.cphase === 1 ? .35 : undefined);")
# paws only after fall
R("const active = P.x > L.splitX &&","const active = P.x > L.splitX && G.fallDone &&")
# checkpoint
R("const GOD = { on: false };","const GOD = { on: false }; let CHK = null;")
R("  state = 'play'; playSong(th.song);\n}\nfunction solidAt","  state = 'play'; playSong(th.song);\n  if (CHK && CHK.i === i) { P.x = CHK.x; P.y = CHK.y; P.safe = { x: P.x, y: P.y }; G.fallDone = true; G.camX = clamp(P.x - W / 2, 0, L.len * T - W); G.intro = 0; } else CHK = null;\n}\nfunction solidAt")
R("function gotoMap(advance) {","function gotoMap(advance) {\n  CHK = null;")
R("function startClear() {\n","function startClear() {\n  CHK = null;\n")
# hooks
R("  updatePlayer(dt);\n","  if (G.def.id === 'cozinha') updateFall(dt);\n  updatePlayer(dt);\n")
R("  ctx.drawImage(G.tiles, cx, cy, W, H, 0, 0, W, H);","  if (G.fall) drawFallDog(cx, cy);\n  ctx.drawImage(G.tiles, cx, cy, W, H, 0, 0, W, H);")
R("  if (!blink) {\n    if (P.flip > 0)","  if (!blink && P.scream) drawScream(cx, cy); else if (!blink) {\n    if (P.flip > 0)")
# fall code
R("function fleaBlob(B) {",r"""// ---- table fall cutscene ----
function updateFall(dt) {
  const L = G.L, tableY = (ROWS - 9 - BASE) * T, edge = L.split * T;
  if (!G.fall && !G.fallDone && P.x > edge - 4.5 * T && G.deadT <= 0) {
    G.fall = { t: 0, ph: P.y > tableY + 20 ? 3 : 0, dx: edge + 4 * T, dy: tableY + 260, sc: 1, tilt: 0 };
    P.ctrl = false; P.inv = 99; P.dashT = 0; P.punchT = -1; if (G.fall.ph === 3) { P.scream = true; }
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
    if (F.t2 > .8 && F.ph === 2) { F.ph = 3; F.t2 = 0; P.scream = true; P.vy = -600; P.ground = false; P.lock = 0; SFX.boom(); fx.shake = 9; fx.stop = .08; ring(P.x + 10, P.y - 18, '#ffffff'); hitSpark(P.x + 10, P.y - 18, '#ffffff'); tone({ type: 'square', f: 900, f2: 300, t: .9, v: .12 }); } }
  else if (F.ph === 3) { F.t2 = (F.t2 || 0) + dt; P.vx = 215; P.inv = 99; F.dy += 260 * dt; F.sc = lerp(F.sc, 1, dt * 4); F.dx = lerp(F.dx, edge + 4 * T, dt * 2);
    if (Math.random() < .3) parts.push({ x: P.x + rnd(-8, 8), y: P.y - 30, vx: 0, vy: -40, life: .4, max: .4, c: '#d8f0ff', sz: 2, g: 0, k: 'sq' });
    if (P.ground && P.x > edge + 8) { P.scream = false; P.vx = 0; G.fall = null; G.fallDone = true; P.ctrl = true; P.inv = 1.2; SFX.land(); dust(P.x, P.y, 10); fx.shake = 7; P.sx = 1.4; P.sy = .65;
      floatText('AI!', P.x, P.y - 56, '#ffffff', 2); CHK = { i: G.i, x: P.x, y: P.y }; G.intro = 1.6; playSong(G.th.song); } }
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
function fleaBlob(B) {""")
# level tweak: remove sugar at the edge
R("L.e('roach', 92, 9); L.s(94, 11, 4);","L.e('roach', 88, 9);")
open(p,'w').write(s)
