p='game.js'; s=open(p).read()
rep=[
# loadLevel init
("  G.sugarList = L.sugar.map(","""  G.boss = L.boss ? makeBoss(L.boss) : null; G.flagHidden = !!L.boss; G.flagPop = 1; G.waves = []; G.bossBanner = 0;
  if (G.boss) G.enemiesTotal++;
  G.bgAnts = def.id === 'formigueiro' ? makeBgAnts(L.len) : null;
  G.sugarList = L.sugar.map("""),
# flag trigger
("  if (G.L.flag && !G.clear && Math.abs","  if (G.L.flag && !G.flagHidden && !G.clear && Math.abs"),
# interactions: boss
("  // sugar\n  for (const s of G.sugarList) {","""  const B = G.boss;
  if (B && B.active && B.state !== 'dead' && B.state !== 'dying') {
    const b = { l: B.x - B.w / 2, r: B.x + B.w / 2, t: B.y - B.h, b: B.y };
    if (hb && B.hitBy !== P.punchId && hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t) { B.hitBy = P.punchId; if (hitBoss(P.dir) && !P.ground) { P.vy = -300; P.airDash = true; } }
    else if (pl < b.r && pr > b.l && pt < b.b && pb > b.t) {
      if (P.dashT > 0) { if (!P.dashHit.has(B)) { P.dashHit.add(B); hitBoss(P.dir); P.dashT = 0; P.vx = -P.dir * 200; P.vy = -250; } }
      else if (P.vy > 40 && (P.y - P.vy * dt) <= b.t + 14) { hitBoss(Math.sign(B.x - P.x) || 1, true); P.vy = K.jump ? -600 : -500; P.airDash = true; P.sx = .7; P.sy = 1.35; SFX.stomp(); ring(P.x, P.y, '#fff6a0'); }
      else hurtPlayer(B.x);
    }
  }
  for (let i = G.waves.length - 1; i >= 0; i--) { const w = G.waves[i]; if (Math.abs(P.x - w.x) < 12 && P.y > w.y - 16 && P.y <= w.y + 2) hurtPlayer(w.x); }
  // sugar
  for (const s of G.sugarList) {"""),
# updatePlay: boss update + trigger + bgants
("  for (const e of G.enemies) updateEnemy(e, dt);\n","  for (const e of G.enemies) updateEnemy(e, dt);\n  if (G.boss) updateBoss(dt);\n  if (G.bgAnts) updateBgAnts(dt);\n  if (G.bossBanner > 0) G.bossBanner -= dt;\n  if (G.flagPop < 1) G.flagPop = Math.min(1, G.flagPop + dt * 1.6);\n"),
# camera lock
("  const tx = clamp(P.x - W / 2 + look, 0, G.L.len * T - W);","  let tx = clamp(P.x - W / 2 + look, 0, G.L.len * T - W);\n  if (G.boss && G.boss.active && G.boss.state !== 'dead') { tx = clamp(G.boss.arenaL, 0, G.L.len * T - W); if (P.x < G.boss.arenaL + 10) { P.x = G.boss.arenaL + 10; if (P.vx < 0) P.vx = 0; } }"),
# draw: bg ants after layers
("  // water back\n  const th = G.th;","  if (G.bgAnts) drawBgAnts(cx, cy);\n  // water back\n  const th = G.th;"),
("  if (G.L.flag) drawFlag(G.L.flag.x - cx, G.L.flag.y - cy);","  if (G.L.flag && !G.flagHidden) { const fy = G.L.flag.y - cy; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, fy); ctx.clip(); const e = 1 - Math.pow(1 - G.flagPop, 3); drawFlag(G.L.flag.x - cx, fy + (1 - e) * 130); ctx.restore(); }"),
("  for (const e of G.enemies) drawEnemy(e, cx, cy);","  for (const e of G.enemies) drawEnemy(e, cx, cy);\n  if (G.boss) drawBoss(cx, cy);\n  for (const w of G.waves) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy); const a = clamp(w.life * 2, 0, 1); ctx.globalAlpha = a; ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 6, y - 13, 12, 13); ctx.fillStyle = '#ffe8b0'; ctx.fillRect(x - 5, y - 12, 10, 12); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 3 + w.dir, y - 15, 6, 4); ctx.fillStyle = '#e8b060'; ctx.fillRect(x - 5, y - 4, 10, 4); ctx.globalAlpha = 1; }"),
# HUD boss bar, combo shift
("  if (P.combo >= 2) { const pop","  const BB = G.boss; const bossBar = BB && BB.active && BB.state !== 'dead';\n  if (bossBar) { text('GAFANHOTO INVASOR', W / 2, 32, { align: 'center', color: '#b4ec5a' }); ctx.fillStyle = '#1a1020'; ctx.fillRect(W / 2 - 102, 42, 204, 9); ctx.fillStyle = '#4a1020'; ctx.fillRect(W / 2 - 100, 44, 200, 5); BB.shownHp = lerp(BB.shownHp ?? BB.hp, BB.hp, .15); ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 2 - 100, 44, 200 * BB.shownHp / BB.max, 5); ctx.fillStyle = BB.hp <= BB.max * .4 ? '#ff7a2a' : '#7cf05a'; ctx.fillRect(W / 2 - 100, 44, 200 * Math.max(0, BB.hp) / BB.max, 5); }\n  if (bossBar) ctx.translate(0, 30);\n  if (P.combo >= 2) { const pop"),
]
for a,b in rep:
    assert a in s, a[:60]; s=s.replace(a,b,1)
# reset translate after combo block in drawHUD: find end of drawHUD
i=s.index("function drawHUD() {"); j=s.index("\nfunction drawIntro()",i)
body=s[i:j]
body=body.rstrip()
assert body.endswith('}')
body=body[:-1]+"  ctx.setTransform(1, 0, 0, 1, 0, 0);\n  if (G.bossBanner > 0) { const t = 2.4 - G.bossBanner; const k = t < .25 ? t / .25 : G.bossBanner < .3 ? G.bossBanner / .3 : 1; ctx.fillStyle = `rgba(60,10,20,${.6 * k})`; ctx.fillRect(0, 120, W, 90); text('MINI-CHEFE!', W / 2, 138, { s: 2, align: 'center', color: '#ff3b5c', alpha: k }); text('GAFANHOTO INVASOR', W / 2 + (1 - k) * 200, 168, { s: 3, align: 'center', color: '#b4ec5a', alpha: k }); }\n}\n"
s=s[:i]+body+s[j:]
# boss functions
s=s.replace("// ---------- particles ----------","""// ---------- boss ----------
function makeBoss(b) { return { x: b.x * T + 8, y: (ROWS - b.h - BASE) * T, floorY: (ROWS - b.h - BASE) * T, vx: 0, vy: 0, dir: -1, hp: 14, max: 14, state: 'sleep', st: 0, flash: 0, inv: 0, ground: true, w: 84, h: 40, t: 0, sx: 1, sy: 1, arenaL: b.arenaL * T, arenaR: b.arenaR * T, active: false, hitBy: -1 }; }
function hitBoss(dir, stomp) {
  const B = G.boss; if (B.inv > 0) return false;
  B.hp--; B.inv = .3; B.flash = .14; B.sx = 1.15; B.sy = .88;
  const cx = B.x, cy = B.y - B.h / 2;
  P.combo++; P.comboT = 1.6; G.maxCombo = Math.max(G.maxCombo, P.combo);
  const pts = 100 * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 30, '#ffe45a');
  if (P.combo >= 2) floatText('COMBO ' + P.combo + '!', cx, cy - 46, '#7ff0ff', 1 + Math.min(P.combo, 8) * .08);
  SFX.bossHit(); fx.stop = .07; fx.shake = Math.max(fx.shake, 5); hitSpark(cx, cy, '#ffffff'); burst(cx, cy, 10, ['#b4ec5a', '#ffffff', '#ffe45a'], 220); ring(cx, cy, '#ffffff');
  if (B.hp <= 0) {
    B.state = 'dying'; B.st = 1.8; B.vx = 0; fx.stop = .3; SFX.roar(); G.kills++; G.score += 3000; floatText('+3000', cx, cy - 60, '#ffe45a', 3); G.waves.length = 0; playSong(null);
  } else if (B.state === 'idle' || B.state === 'land') { B.st = Math.min(B.st, .25); }
  return true;
}
function updateBoss(dt) {
  const B = G.boss; B.t += dt; B.flash -= dt; B.inv -= dt;
  B.sx = lerp(B.sx, 1, Math.min(1, dt * 10)); B.sy = lerp(B.sy, 1, Math.min(1, dt * 10));
  for (let i = G.waves.length - 1; i >= 0; i--) { const w = G.waves[i]; w.x += w.dir * w.sp * dt; w.life -= dt; if (Math.random() < .5) parts.push({ x: w.x, y: w.y - 2, vx: rnd(-20, 20), vy: rnd(-80, -30), life: .3, max: .3, c: 'rgba(240,210,160,.8)', sz: 3, g: 200, k: 'puff' }); if (w.life <= 0 || w.x < B.arenaL + 4 || w.x > B.arenaR - 4) G.waves.splice(i, 1); }
  if (B.state === 'dead') return;
  if (B.state === 'sleep') { if (P.x > B.arenaL + 11 * T && G.deadT <= 0) { B.active = true; B.state = 'intro'; B.st = 1.8; SFX.roar(); fx.shake = 8; G.bossBanner = 2.4; playSong('boss'); B.vy = -300; B.ground = false; } else return; }
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
      const sp = enr ? 280 : 220; G.waves.push({ x: B.x - 44, y: B.floorY, dir: -1, sp, life: 1.6 }, { x: B.x + 44, y: B.floorY, dir: 1, sp, life: 1.6 });
      if (B.state === 'hop') { B.state = 'land'; B.st = enr ? .35 : .6; }
    }
  }
  switch (B.state) {
    case 'intro': B.st -= dt; face(); if (B.st <= 0 && B.ground) { B.state = 'idle'; B.st = .5; } break;
    case 'idle': B.vx = 0; face(); B.st -= dt; if (B.st <= 0) { if (Math.random() < (Math.abs(dx) > 170 ? .75 : .45)) { B.state = 'crouch'; B.st = enr ? .3 : .45; } else { B.state = 'wind'; B.st = enr ? .4 : .6; SFX.roar(); } } break;
    case 'crouch': face(); B.st -= dt; if (B.st <= 0) { B.vy = enr ? -700 : -640; B.vx = clamp(dx / 1.0, -330, 330); B.ground = false; B.state = 'hop'; SFX.spring(); B.sx = .8; B.sy = 1.25; dust(B.x, B.y, 8); } break;
    case 'hop': break;
    case 'land': B.st -= dt; if (B.st <= 0) { B.state = 'idle'; B.st = .15; } break;
    case 'wind': B.st -= dt; if (B.st <= 0) { B.state = 'kick'; B.vx = B.dir * (enr ? 430 : 340); B.st = 1.2; SFX.dash(); } break;
    case 'kick': B.st -= dt; if (Math.random() < .6) dust(B.x - B.dir * 30, B.y, 1, B.dir); if (wall || B.st <= 0) { B.state = 'skid'; B.st = .45; if (wall) { fx.shake = 6; SFX.boom(); } } break;
    case 'skid': B.vx *= Math.pow(.02, dt); B.st -= dt; if (B.st <= 0) { B.vx = 0; B.state = 'idle'; B.st = enr ? .3 : .55; } break;
    case 'dying': B.st -= dt; B.flash = (B.t * 12 % 1) < .5 ? .1 : 0; fx.shake = 4;
      if (Math.random() < dt * 9) { const ex = B.x + rnd(-40, 40), ey = B.y - rnd(5, 45); burst(ex, ey, 10, ['#ffe45a', '#ffffff', '#ff8a3a', '#b4ec5a'], 200); ring(ex, ey, '#fff'); SFX.hit(); }
      if (B.st <= 0) {
        B.state = 'dead'; SFX.kill(); SFX.boom(); fx.flash = .3; fx.shake = 10;
        burst(B.x, B.y - 25, 40, ['#ffe45a', '#ffffff', '#ff8a3a', '#b4ec5a'], 320); confetti(B.x, B.y - 40, 60);
        for (let i = 0; i < 12; i++) G.sugarList.push({ x: B.x, y: B.y - 30, got: false, vx: rnd(-220, 220), vy: rnd(-420, -200), mag: true, drop: true, bob: 0, delay: .5 });
        G.flagHidden = false; G.flagPop = 0; setTimeout(() => { SFX.combo(7); }, 350);
        if (G.bgAnts) G.bgAnts.forEach(a => { a.cheer = true; a.vy = -rnd(60, 140); });
        playSong(G.th.song);
      }
      break;
  }
}
function drawBoss(cx, cy) {
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
    if (fight) { const sx = a.x - G.camX * .5, bx = B.x - G.camX; if (Math.abs(sx - bx) < 240) { a.mode = 'run'; a.dir = sx < bx ? -1 : 1; a.sp = 110; } }
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

// ---------- particles ----------""",1)
open(p,'w').write(s)
