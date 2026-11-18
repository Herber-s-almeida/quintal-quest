p='game.js'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    assert a in s, a[:70]; s=s.replace(a,b,cnt)
# --- sprites
R("  SPR.boss = { stand:","""  const scorpF = (pose, claw) => pix(62 * K + 4, 34 * K + 4, g => {
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
  SPR.boss = { stand:""")
# --- makeBoss
R("function makeBoss(b) { return { x:","function makeBoss(b) { const scorp = b.kind === 'scorp'; return { kind: b.kind || 'hopper', name: scorp ? 'ESCORPIÃO GIGANTE' : 'GAFANHOTO INVASOR', nameCol: scorp ? '#ffb060' : '#b4ec5a', pat: ['sting', 'charge', 'sting', 'burrow'], pi: 0, dig: 0, mark: null, x:")
R("hp: 14, max: 14, state: 'sleep',","hp: scorp ? 16 : 14, max: scorp ? 16 : 14, state: 'sleep',")
R("w: 84, h: 40, t: 0, sx: 1,","w: scorp ? 100 : 84, h: scorp ? 38 : 40, t: 0, sx: 1,")
# --- hitBoss dmg
R("function hitBoss(dir, stomp) {\n  const B = G.boss; if (B.inv > 0) return false;\n  B.hp--;","function hitBoss(dir, stomp, dmg = 1) {\n  const B = G.boss; if (B.inv > 0) return false;\n  B.hp -= dmg; if (dmg > 1) floatText('CRÍTICO!', B.x, B.y - 80, '#ff8a3a', 2);")
R("const pts = 100 * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 30, '#ffe45a');","const pts = 100 * dmg * Math.max(1, P.combo); G.score += pts; floatText('+' + pts, cx, cy - 30, '#ffe45a');")
R("B.state = 'dying'; B.st = 1.8; B.vx = 0; fx.stop = .3;","B.state = 'dying'; B.st = 1.8; B.vx = 0; B.mark = null; fx.stop = .3;")
R("} else if (B.state === 'idle' || B.state === 'land') { B.st = Math.min(B.st, .25); }","} else if (B.kind === 'hopper' && (B.state === 'idle' || B.state === 'land')) { B.st = Math.min(B.st, .25); }")
# --- trigger / dispatch
R("  if (B.state === 'sleep') { if (P.x > B.arenaL + 11 * T && G.deadT <= 0) { B.active = true; B.state = 'intro'; B.st = 1.8; SFX.roar(); fx.shake = 8; G.bossBanner = 2.4; playSong('boss'); B.vy = -300; B.ground = false; } else return; }",
"  if (B.state === 'sleep') { if (P.x > B.arenaL + 11 * T && G.deadT <= 0) { B.active = true; SFX.roar(); fx.shake = 8; G.bossBanner = 2.4; playSong('boss'); if (B.kind === 'scorp') { B.state = 'warn'; B.st = .7; B.dig = 1; } else { B.state = 'intro'; B.st = 1.8; B.vy = -300; B.ground = false; } } else return; }\n  if (B.kind === 'scorp') { updateScorp(B, dt); return; }")
# extract dying
a=s.index("    case 'dying': B.st -= dt; B.flash"); b=s.index("      break;\n  }\n}\nfunction drawBoss")
dying=s[a:b]
body=dying.replace("    case 'dying': ","",1)
s=s[:a]+"    case 'dying': bossDie(B, dt);\n"+s[b:]
s=s.replace("function drawBoss(cx, cy) {","function bossDie(B, dt) {\n"+body+"}\n"+r"""function updateScorp(B, dt) {
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
  if (G.boss.kind === 'scorp') { if (G.boss.state !== 'dead') drawScorp(G.boss, cx, cy); return; }""",1)
# --- interactions boss block rewrite
a=s.index("  const B = G.boss;\n  if (B && B.active && B.state !== 'dead' && B.state !== 'dying') {")
b=s.index("  for (let i = G.waves.length - 1; i >= 0; i--) { const w = G.waves[i]; if (Math.abs(P.x - w.x)")
s=s[:a]+"""  const B = G.boss;
  if (B && B.active && B.state !== 'dead' && B.state !== 'dying' && !['dig', 'under', 'warn'].includes(B.state)) {
    const sc = B.kind === 'scorp', open = sc && (B.state === 'stuck' || B.state === 'dizzy'), dmg = open ? 2 : 1;
    const bx = B.x + (sc ? B.dir * 10 : 0);
    const b = { l: bx - B.w / 2, r: bx + B.w / 2, t: B.y - B.h, b: B.y };
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
        if (sc && !open) { hurtPlayer(B.x); P.vy = -420; floatText('AI! ESPINHOS!', P.x, P.y - 50, '#ff3b5c'); }
        else { hitBoss(Math.sign(B.x - P.x) || 1, true, dmg); P.vy = K.jump ? -600 : -500; P.airDash = true; P.jumps = 1; P.sx = .7; P.sy = 1.35; SFX.stomp(); ring(P.x, P.y, '#fff6a0'); }
      }
      else if (!open) hurtPlayer(B.x);
    }
  }
"""+s[b:]
# --- small scorp stomp hurts
R("      if (stomp) { damageEnemy(e, 1,","      if (stomp && e.type === 'scorp') { hurtPlayer(e.x); P.vy = -380; P.inv > 1 && floatText('AI! FERRÃO!', P.x, P.y - 50, '#ff3b5c'); continue; }\n      if (stomp) { damageEnemy(e, 1,")
# --- HUD name
R("text('GAFANHOTO INVASOR', W / 2, 32, { align: 'center', color: '#b4ec5a' });","text(BB.name, W / 2, 32, { align: 'center', color: BB.nameCol });")
R("text('GAFANHOTO INVASOR', W / 2 + (1 - k) * 200, 168, { s: 3, align: 'center', color: '#b4ec5a', alpha: k });","text(G.boss.name, W / 2 + (1 - k) * 200, 168, { s: 3, align: 'center', color: G.boss.nameCol, alpha: k }); text(G.boss.kind === 'scorp' ? 'DICA: PISAR NAS COSTAS DÓI! USE SOCO E DASH' : 'DICA: PULE AS ONDAS DE CHOQUE', W / 2, 196, { align: 'center', alpha: k });")
# --- level 2 end + nurse placement
R("    L.ground(130, 136, 5); L.s(130, 7, 6); L.n(72, 6); L.ground(136, 162, 3); L.e('scorp', 145, 3); L.e('ant', 150, 3); L.s(140, 5, 4);\n    L.f(156, 3);",
  "    L.ground(130, 136, 5); L.s(130, 7, 6); L.n(133, 5); L.ground(136, 172, 3); L.s(138, 5, 3);\n    L.boss = { kind: 'scorp', x: 160, h: 3, arenaL: 132, arenaR: 172 };\n    L.f(166, 3);")
s=s.replace("makeLevel('areia', 162,","makeLevel('areia', 172,",1)
R("L.n(102, 4);","")
R("L.n(125, 5);","")
open(p,'w').write(s)
