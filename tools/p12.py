p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,c=1):
    global s; assert a in s, a[:80]; s=s.replace(a,b,c)
# ---- parallax: new bgs, very slow, no blending
R("    case 'cozinha': return [{ img: 'kmesa', sp: .15, y: 0, zone: 'a' }, { img: 'kpiso', sp: .15, y: 0, zone: 'b', dog: true }, { tint: 'rgba(40,20,10,0.14)' }];",
  "    case 'cozinha': return [{ img: 'kmesa2', sp: .05, y: 0, zone: 'a' }, { img: 'kfloor2', sp: .04, y: 0, zone: 'b', dog: true }, { tint: 'rgba(40,20,30,0.18)' }];")
R("let la = l.a ?? 1; if (l.zone) { const k = clamp((cx + W / 2 - G.L.splitX) / 260 + .5, 0, 1); if (l.zone === 'b') la *= k; else if (k >= 1) continue; if (la <= 0) continue; }",
  "let la = l.a ?? 1; if (l.zone) { const k = G.fallDone ? 1 : 0; if (l.zone === 'b' ? !k : k) continue; }")
R("    drawLayer(IMG[l.img], cx * l.sp, l.y - cy * l.sp * .5, la);","    drawLayer(IMG[l.img], cx * l.sp, l.y - (l.sp < .1 ? 0 : cy * l.sp * .5), la);")
# ---- fall: start big fall scene instead of short fling
R("    G.fall = { t: 0, ph: P.y > tableY + 20 ? 3 : 0,","    G.fall = { t: 0, ph: 0,")
R("    P.ctrl = false; P.inv = 99; P.dashT = 0; P.punchT = -1; if (G.fall.ph === 3) { P.scream = true; }","    P.ctrl = false; P.inv = 99; P.dashT = 0; P.punchT = -1;")
R("    if (F.t2 > .8 && F.ph === 2) { F.ph = 3; F.t2 = 0; P.scream = true; P.vy = -600; P.ground = false; P.lock = 0; SFX.boom(); fx.shake = 9; fx.stop = .08; ring(P.x + 10, P.y - 18, '#ffffff'); hitSpark(P.x + 10, P.y - 18, '#ffffff'); tone({ type: 'square', f: 900, f2: 300, t: .9, v: .12 }); } }",
  "    if (F.t2 > .8 && F.ph === 2) { F.ph = 4; SFX.boom(); fx.shake = 9; ring(P.x + 10, P.y - 18, '#ffffff'); tone({ type: 'square', f: 900, f2: 200, t: 1.6, v: .12 }); G.fallScene = { t: 0, fy: 0, vy: -470, sx: 190, D: 1500, cam: -170, landed: false, lt: 0 }; P.scream = true; parts.length = 0; } }")
R("function drawFallDog(cx, cy) {",r"""function updateFallScene(dt) {
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
  G.camX = clamp(P.x - W / 2, 0, L.len * T - W); G.camY = ROWS * T - H; parts.length = 0;
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
function drawFallDog(cx, cy) {""")
R("  if (G.def.id === 'cozinha') updateFall(dt);\n","  if (G.def.id === 'cozinha') updateFall(dt);\n  if (G.fallScene) { updateFallScene(dt); return; }\n")
R("function drawPlay() {\n","function drawPlay() {\n  if (G.fallScene) { drawFallScene(); return; }\n")
# ---- hazards
R("function updateFall(dt) {",r"""function updateHaz(dt) {
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
function updateFall(dt) {""")
R("  if (G.dogP) updatePaws(dt);","  if (G.dogP) updatePaws(dt);\n  if (G.haz) updateHaz(dt);")
R("  if (!G.clear && G.deadT <= 0) interactions(dt);","  if (!G.clear && G.deadT <= 0) { interactions(dt); if (G.haz) hazards(dt); }")
R("  if (G.fall) drawFallDog(cx, cy);\n  ctx.drawImage(G.tiles, cx, cy, W, H, 0, 0, W, H);","  if (G.fall) drawFallDog(cx, cy);\n  ctx.drawImage(G.tiles, cx, cy, W, H, 0, 0, W, H);\n  if (G.haz) drawHazBack(cx, cy);")
R("  if (G.dogP) drawPaws(cx, cy);\n","  if (G.haz) drawHazFront(cx, cy);\n  if (G.dogP) drawPaws(cx, cy);\n")
R("G.movers = L.movers ?","G.haz = L.haz ? L.haz.map(h => ({ ...h, balls: [], t: 0, cd: 0 })) : null; G.movers = L.movers ?")
# slow
R("max = 195 * bm * (.45 + .55 * amag);","max = 195 * bm * (.45 + .55 * amag) * (P.slow ? .42 : 1);")
R("    P.vy = -505; P.coyote = 0;","    P.vy = P.slow ? -400 : -505; P.coyote = 0;")
# level hazards
R("  L.theme2 = 'piso'; L.split = 100; L.dog = true;","""  L.theme2 = 'piso'; L.split = 100; L.dog = true; L.haz = [];
  const GY = h => (ROWS - h - BASE) * T;
  const spike = (x, w, h) => L.haz.push({ k: 'spike', x0: x * T, x1: (x + w) * T, y: GY(h) });
  L.haz.push({ k: 'honey', x0: 37 * T, x1: 42 * T, y: GY(9) }, { k: 'honey', x0: 70 * T, x1: 74 * T, y: GY(9) });
  spike(58, 2, 9); spike(83, 2, 9);
  L.haz.push({ k: 'bowl', x: 113 * T, y: GY(3) });
  spike(123, 3, 3); spike(153, 2, 3); spike(164, 3, 3);
  L.haz.push({ k: 'pend', x: 146 * T, y: GY(3) - 300, len: 250, amp: .75, sp: 1.6, ph: 0 });
  L.haz.push({ k: 'ball', x0: 128 * T, x1: 176 * T, y: GY(3), every: 3.4, sp: 165 });""")
open(p,'w').write(s)

# ---- level select button
p='/home/claude/game/shell.html'; h=open(p).read()
h=h.replace('<div id="bgod">GOD</div>','<div id="bgod">GOD</div>\n<div id="bsel">FASES</div>\n<div id="selp"></div>')
h=h.replace('#bgod.on{','#bsel{position:fixed;left:calc(50% + 46px);bottom:calc(env(safe-area-inset-bottom) + 6px);padding:5px 12px;border-radius:8px;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.4);color:#fff;font:bold 12px system-ui,sans-serif;z-index:5;cursor:pointer;touch-action:none;user-select:none}\n#bgod{transform:translateX(calc(-50% - 40px))!important}\n#selp{position:fixed;inset:0;background:rgba(10,6,20,.88);display:none;z-index:20;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;padding:30px;align-content:center}\n#selp.on{display:flex}\n#selp button{font:bold 15px system-ui,sans-serif;padding:12px 16px;border-radius:10px;border:2px solid #ffe45a;background:#2a1c40;color:#fff;min-width:150px}\n#selp button.x{border-color:#888;background:#333}\n#bgod.on{')
open(p,'w').write(h)
p='/home/claude/game/game.js'; s=open(p).read()
s=s.replace("{ const gb = document.getElementById('bgod');","""{ const bs = document.getElementById('bsel'), sp = document.getElementById('selp');
  if (bs && sp) { bs.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit();
      sp.innerHTML = ''; LEVELS.forEach((d, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + ' • ' + (NODES[i] ? NODES[i].name : d.id); b.onclick = ev => { ev.stopPropagation(); sp.classList.remove('on'); CHK = null; paused = false; prog.unlocked = Math.max(prog.unlocked, LEVELS.length + 1); store.set('prog', prog); startWipe(() => loadLevel(i)); }; sp.appendChild(b); });
      const c = document.createElement('button'); c.className = 'x'; c.textContent = 'FECHAR'; c.onclick = ev => { ev.stopPropagation(); sp.classList.remove('on'); }; sp.appendChild(c); sp.classList.add('on'); });
    sp.addEventListener('pointerdown', e => e.stopPropagation()); } }
{ const gb = document.getElementById('bgod');""",1)
open(p,'w').write(s)
