p='/home/claude/game/game.js'; s=open(p).read()
def R(a,b,c=1):
    global s; assert a in s, a[:80]; s=s.replace(a,b,c)

# ================= SPRITES
R("  SPR.boss = { stand:",r"""  SPR.roach = [0, 1].map(f => pix(30, 14, g => {
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
  SPR.boss = { stand:""")
R("  SPR.prop = prop;","  prop.crumb = pix(8, 6, g => { g.ell(4, 3.5, 3.4, 2.4, '#e8b860'); g.p(3, 2, '#fff0c0'); }, '#6a3a16');\n  prop.cheese = pix(10, 8, g => { g.rect(1, 2, 8, 5, '#ffd040'); g.p(3, 4, '#d8a020'); g.p(6, 3, '#d8a020'); g.rect(1, 2, 8, 1, '#fff090'); }, '#6a4a10');\n  prop.drop = pix(6, 7, g => { g.ell(3, 4.4, 2.2, 2.2, '#bfe8ff'); g.p(3, 1, '#bfe8ff'); g.p(2, 3, '#ffffff'); }, '#4a6a9a');\n  prop.slimep = pix(10, 6, g => { g.ell(5, 4, 4.4, 1.8, '#8ac030'); g.p(3, 3, '#c8f060'); }, '#2a3a10');\n  SPR.prop = prop;")

# ================= THEMES / SONGS
R("  parede: { name: 'PAREDE DA CASA',","""  mesa: { name: 'MESA DA COZINHA', song: 'cozinha', top: ['#c8783a', '#eaa462', '#8a4a1e'], dirt: ['#9a5a2a', '#b06a34', '#6a3a16'], plat: 'stick', props: ['crumb', 'crumb', 'cheese', 'crumb'], silh: '#2a140a' },
  piso: { name: 'COZINHA', song: 'cozinha', top: ['#d8d0e0', '#f6f0fa', '#a8a0b8'], dirt: ['#b0a8c0', '#c4bcd4', '#8a82a0'], plat: 'stick', props: ['crumb', 'crumb', 'pebble'], silh: '#2a2030' },
  banheiro: { name: 'BANHEIRO', song: 'banheiro', top: ['#c0d0f8', '#eaf0ff', '#8898c8'], dirt: ['#8a90c8', '#a0a8dc', '#5a6098'], plat: 'stick', props: ['drop', 'drop'], silh: '#20203a', water: true, wc: ['rgba(150,200,255,0.5)', 'rgba(180,220,255,0.45)', 'rgba(255,255,255,0.8)'], bonus: true },
  esgoto: { name: 'ESGOTO', song: 'esgoto', top: ['#6a8a2a', '#9ac040', '#3a5a14'], dirt: ['#5a4a3a', '#6e5c48', '#3a2e24'], plat: 'stick', props: ['slimep', 'pebble', 'slimep'], silh: '#0a1006', water: true, wc: ['rgba(60,90,20,0.65)', 'rgba(90,130,30,0.55)', 'rgba(190,230,90,0.7)'] },
  parede: { name: 'PAREDE DA CASA',""")
R("  parede: { bpm: 150,","""  cozinha: { bpm: 156, root: 55, prog: [[0, 4, 7], [5, 9, 12], [2, 5, 9], [7, 11, 14]], arp: [0, 2, 4, 2, 1, 2, 4, 5, 0, 2, 4, 2, 3, 2, 1, 2], kick: [0, 6, 8, 12], hat: 2 },
  banheiro: { bpm: 128, root: 60, prog: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], arp: [0, 1, 2, 4, 2, 1, 0, -1, 0, 1, 2, 4, 5, 4, 2, -1], kick: [0, 8], hat: 4 },
  esgoto: { bpm: 138, root: 48, prog: [[0, 3, 7], [-2, 1, 5], [-4, 0, 3], [-5, -2, 2]], arp: [0, -1, 1, 2, -1, 1, 0, -1, 0, -1, 1, 2, 3, 2, 1, -1], kick: [0, 3, 8, 11], hat: 2 },
  parede: { bpm: 150,""")
# water colors
R("if (th.water) { const wy = (ROWS - BASE - 1.3) * T - cy; ctx.fillStyle = 'rgba(40,90,110,0.55)';","if (th.water) { const wy = (ROWS - BASE - 1.3) * T - cy; ctx.fillStyle = th.wc ? th.wc[0] : 'rgba(40,90,110,0.55)';")
R("ctx.fillStyle = 'rgba(60,140,160,0.45)'; ctx.fillRect(0, wy + 3, W, H - wy); ctx.fillStyle = 'rgba(210,245,255,0.7)';","ctx.fillStyle = th.wc ? th.wc[1] : 'rgba(60,140,160,0.45)'; ctx.fillRect(0, wy + 3, W, H - wy); ctx.fillStyle = th.wc ? th.wc[2] : 'rgba(210,245,255,0.7)';")
# tiles per zone
R("function renderTiles(L, th) {\n  const [c, x] = mkCanvas(L.len * T, ROWS * T);","function renderTiles(L, th0) {\n  const th2 = L.theme2 ? THEMES[L.theme2] : null; if (th2 && !th2.dirtTex) buildTheme(th2);\n  const TH = tx => (th2 && tx >= L.split) ? th2 : th0; let th = th0;\n  const [c, x] = mkCanvas(L.len * T, ROWS * T);")
R("    if (g[ty][tx] !== 1) continue;\n    const px = tx * T, py = ty * T;\n    x.drawImage(th.dirtTex,","    if (g[ty][tx] !== 1) continue; th = TH(tx);\n    const px = tx * T, py = ty * T;\n    x.drawImage(th.dirtTex,")
R("    if (g[ty][tx] !== 1 || (ty > 0 && g[ty - 1][tx] === 1)) continue;\n    const px = tx * T, py = ty * T;","    if (g[ty][tx] !== 1 || (ty > 0 && g[ty - 1][tx] === 1)) continue; th = TH(tx);\n    const px = tx * T, py = ty * T;")
R("drawPlat(x, th, tx * T, ty * T, (e - tx) * T);","drawPlat(x, TH(tx), tx * T, ty * T, (e - tx) * T);")
# layers zones
R("    if (l.tint) { ctx.fillStyle = l.tint; ctx.fillRect(0, 0, W, H); continue; }\n    drawLayer(IMG[l.img], cx * l.sp, l.y - cy * l.sp * .5, l.a ?? 1);",
  "    if (l.tint) { ctx.fillStyle = l.tint; ctx.fillRect(0, 0, W, H); continue; }\n    let la = l.a ?? 1; if (l.zone) { const k = clamp((cx + W / 2 - G.L.split * T) / 260 + .5, 0, 1); if (l.zone === 'b') la *= k; else if (k >= 1) continue; if (la <= 0) continue; }\n    drawLayer(IMG[l.img], cx * l.sp, l.y - cy * l.sp * .5, la);\n    if (l.dog) drawDogBG(cx, cy);")
R("    case 'gramado': return [","    case 'cozinha': return [{ img: 'kmesa', sp: .15, y: 0, zone: 'a' }, { img: 'kpiso', sp: .15, y: 0, zone: 'b', dog: true }, { tint: 'rgba(40,20,10,0.14)' }];\n    case 'banheiro': return [{ img: 'bath', sp: .15, y: 0 }, { tint: 'rgba(30,30,80,0.12)' }];\n    case 'esgoto': return [{ img: 'sewer', sp: .15, y: 0 }, { tint: 'rgba(10,25,0,0.28)' }];\n    case 'gramado': return [")
# silhouette per zone
R("  if (!G.silh) G.silh = tinted(IMG.silh, th.silh);","  if (!G.silh) G.silh = tinted(IMG.silh, th.silh);\n  if (G.L.theme2 && !G.silh2) G.silh2 = tinted(IMG.silh, THEMES[G.L.theme2].silh);\n  if (G.silh2 && P.x > G.L.split * T) { const sv = G.silh; G.silh = G.silh2; G.silh2 = sv; G.L.split = 1e9; }")

# ================= ENEMIES
R("    case 'mosca':","    case 'roach': e.w = 26; e.h = 12; e.speed = 52; e.hp = 1; e.score = 100; break;\n    case 'roachB': e.w = 50; e.h = 24; e.speed = 40; e.hp = 2; e.score = 200; break;\n    case 'rat': e.w = 46; e.h = 24; e.speed = 34; e.hp = 3; e.score = 260; break;\n    case 'mosca':")
R("  if (e.type === 'scorp') {","  if (e.type === 'scorp' || e.type === 'rat') {")
R("ctx.scale((e.type === 'spider' ? 1 : (e.dir > 0 ? 1 : -1)) * (e.type === 'scorp' ? 1.1 : 1), e.type === 'scorp' ? 1.1 : 1);","{ const es = e.type === 'scorp' ? 1.1 : e.type === 'roachB' ? 1.3 : 1; ctx.scale((e.type === 'spider' ? 1 : (e.dir > 0 ? 1 : -1)) * es, es); }")
R("  if (e.type === 'scorp' && e.state === 'wind' && !e.dead) text(","  if (e.type === 'rat' && e.state === 'wind' && !e.dead) text('!', x, y - 34, { s: 2, color: '#ff3b5c', align: 'center' });\n  if (e.type === 'scorp' && e.state === 'wind' && !e.dead) text(")

# ================= BOSSES registry
R("const scorp = b.kind === 'scorp', frog = b.kind === 'frog', snake = b.kind === 'snake'; return { kind: b.kind || 'hopper', bx: b.x * T + 8, hx: 70, hy: 18, name: snake ?",
  "const scorp = b.kind === 'scorp', frog = b.kind === 'frog', snake = b.kind === 'snake', flea = b.kind === 'flea', ratk = b.kind === 'rat'; return { kind: b.kind || 'hopper', bx: b.x * T + 8, hx: 70, hy: 18, name: ratk ? 'RATO GIGANTE' : flea ? 'ONDA DE PULGAS' : snake ?")
R("nameCol: snake ? '#b4ff5a' :","nameCol: ratk ? '#9ae040' : flea ? '#ff9a6a' : snake ? '#b4ff5a' :")
R("pat: snake ? [","pat: ratk ? ['slam', 'throw', 'fart', 'surf', 'slam', 'throw', 'fart'] : flea ? ['roll', 'hop', 'scatter', 'roll', 'hop'] : snake ? [")
R("hp: snake ? 17 : frog","hp: ratk ? 18 : flea ? 16 : snake ? 17 : frog")
R("max: snake ? 17 : frog","max: ratk ? 18 : flea ? 16 : snake ? 17 : frog")
R("w: snake ? 35 : frog","w: ratk ? 70 : flea ? 110 : snake ? 35 : frog")
R("h: snake ? 23 : frog","h: ratk ? 100 : flea ? 46 : snake ? 23 : frog")
R("} else if (B.kind === 'snake') {","} else if (B.kind === 'flea') { startFleaCut(B); } else if (B.kind === 'rat') { startRatCut(B); } else if (B.kind === 'snake') {")
R("  if (B.kind === 'snake') { updateSnake(B, dt); return; }","  if (B.kind === 'snake') { updateSnake(B, dt); return; }\n  if (B.kind === 'flea') { updateFlea(B, dt); return; }\n  if (B.kind === 'rat') { updateRat(B, dt); return; }")
R("  if (G.boss.kind === 'snake') { drawSnake(G.boss, cx, cy); return; }","  if (G.boss.kind === 'snake') { drawSnake(G.boss, cx, cy); return; }\n  if (G.boss.kind === 'flea') { drawFlea(G.boss, cx, cy); return; }\n  if (G.boss.kind === 'rat') { drawRat(G.boss, cx, cy); return; }")
R("!['dig', 'under', 'warn', 'air', 'leapUp', 'cut'].includes(B.state)","!['dig', 'under', 'warn', 'air', 'leapUp', 'cut', 'scatter', 'regroup'].includes(B.state)")
R("|| (B.kind === 'snake' && B.state === 'stun'), dmg = open ? 2 : 1;","|| (B.kind === 'snake' && B.state === 'stun') || (B.kind === 'flea' && B.state === 'tired') || (B.kind === 'rat' && (B.state === 'stuckP' || B.state === 'relief')), dmg = open ? 2 : 1;")
R("text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'snake' ?","text(G.boss.fake ? 'PREPARE-SE!' : G.boss.kind === 'rat' ? 'DICA: FUJA DO PUM VERDE! BATA QUANDO O COCÔ PRENDER' : G.boss.kind === 'flea' ? 'DICA: PULE A ONDA! BATA QUANDO ELA CANSAR' : G.boss.kind === 'snake' ?")
R("    const bx = B.x + (sc ? B.dir * 10 : 0);\n    const b = { l: bx - B.w / 2, r: bx + B.w / 2, t: B.y - B.h, b: B.y };",
  "    const bx = B.x + (sc ? B.dir * 10 : 0), bsc = B.kind === 'flea' ? (.55 + .45 * B.hp / B.max) : 1;\n    const b = { l: bx - B.w * bsc / 2, r: bx + B.w * bsc / 2, t: B.y - B.h * bsc, b: B.y };")

# ================= BOSS CODE
R("function startFrogCut(B) {",r"""// ---- dog (kitchen) ----
function drawPaw(x, y, s = 1) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s);
  ctx.fillStyle = '#1a1020'; ctx.fillRect(-36, -600, 72, 590); ctx.fillStyle = '#b8783a'; ctx.fillRect(-33, -600, 66, 590); ctx.fillStyle = '#d8985a'; ctx.fillRect(-25, -600, 16, 590);
  ctx.fillStyle = '#9a6028'; for (let i = -560; i < -20; i += 22) { ctx.fillRect(14, i, 12, 3); ctx.fillRect(-20, i + 11, 10, 3); }
  ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(0, -18, 52, 24, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c88848'; ctx.beginPath(); ctx.ellipse(0, -19, 49, 21, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e8a868'; ctx.beginPath(); ctx.ellipse(-8, -26, 30, 8, 0, 0, 7); ctx.fill();
  for (let i = 0; i < 4; i++) { const tx = -36 + i * 24; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(tx, -6, 13, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c88848'; ctx.beginPath(); ctx.ellipse(tx, -7, 11, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#f0ece0'; ctx.fillRect(tx - 2, 0, 4, 6); }
  ctx.restore();
}
function updatePaws(dt) {
  const D = G.dogP; if (!D) return; const L = G.L, F = (ROWS - 3 - BASE) * T;
  const active = P.x > L.splitX && !(G.boss && G.boss.active) && P.x < G.boss.arenaL - 40 && !G.clear && G.deadT <= 0;
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
function drawDogHead(x, y, s, look) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s);
  const O = '#1a1020', C1 = '#c88848', C2 = '#a8682c', C3 = '#ecc898';
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(40, -60, 58, 120, -.2, 0, 7); ctx.fill(); ctx.fillStyle = '#8a5020'; ctx.beginPath(); ctx.ellipse(40, -60, 54, 116, -.2, 0, 7); ctx.fill();
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(0, 0, 150, 140, 0, 0, 7); ctx.fill(); ctx.fillStyle = C1; ctx.beginPath(); ctx.ellipse(0, 0, 146, 136, 0, 0, 7); ctx.fill();
  ctx.fillStyle = C2; ctx.beginPath(); ctx.ellipse(30, -60, 90, 60, 0, 0, 7); ctx.fill();
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(-130, 40, 100, 70, 0, 0, 7); ctx.fill(); ctx.fillStyle = C3; ctx.beginPath(); ctx.ellipse(-130, 40, 96, 66, 0, 0, 7); ctx.fill();
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(-205, 10, 34, 26, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2a1a18'; ctx.beginPath(); ctx.ellipse(-205, 10, 30, 22, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#6a5a58'; ctx.fillRect(-218, 0, 12, 5);
  if (G.dogPant !== false) { const t = Math.sin(gtime * 10) * 8; ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(-120, 112 + t, 32, 52 + t, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff7a90'; ctx.beginPath(); ctx.ellipse(-120, 110 + t, 28, 48 + t, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#d85a70'; ctx.fillRect(-122, 80, 4, 50 + t); }
  ctx.fillStyle = O; ctx.fillRect(-200, 90, 150, 6);
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(-60, -40, 30, 32, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-60, -40, 26, 28, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.ellipse(-60 + look * 10, -36, 15, 17, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-64 + look * 10, -46, 6, 6);
  ctx.fillStyle = O; ctx.fillRect(-92, -78, 60, 6);
  ctx.restore();
}
function drawDogBG(cx, cy) {
  const B = G.boss; if (!B || B.kind !== 'flea' || !B.dog) return;
  const F = B.floorY - cy, k = B.dog; const x = B.arenaR - cx - 80, y = F - 150 + (1 - k) * 340 + Math.sin(gtime * 2) * 4 + (B.scratch ? Math.sin(gtime * 50) * 6 : 0);
  drawDogHead(x, y, 1, clamp((P.x - (B.arenaR - 200)) / 300, -1, 1));
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
  const M = G.movers; if (!M || G.deadT > 0) return;
  for (const m of M) {
    if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped && P.vy > 0) { const top = m.y - m.r * (m.grow ?? 1); if (Math.abs(P.x - m.x) < m.r + 7 && prevB <= top + 8 && P.y >= top - 2) { P.y = top; popBub(m, true); return; } }
    if (m.kind === 'foam' && m.on && P.vy >= 0 && P.x > m.x0 - 4 && P.x < m.x1 + 4 && prevB <= m.y + 2 && P.y >= m.y) { P.y = m.y; P.vy = 0; P.ground = true; }
  }
}
function drawBath(cx, cy) {
  const M = G.movers; if (!M) return;
  for (const m of M) {
    if (m.kind === 'foam') { const x0 = m.x0 - cx, x1 = m.x1 - cx, y = m.y - cy; if (!m.on) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([4, 4]); ctx.strokeRect(x0, y, x1 - x0, 6); ctx.setLineDash([]); continue; }
      if (m.left < 1.5 && Math.floor(gtime * 10) % 2) continue; const im = IMG.foam; for (let xx = x0 - 8; xx < x1; xx += im.width - 18) ctx.drawImage(im, Math.round(xx), Math.round(y - 10));
      const k = m.left / m.dur; ctx.fillStyle = '#1a1020'; ctx.fillRect(x0, y - 22, x1 - x0, 4); ctx.fillStyle = k > .3 ? '#7ff0ff' : '#ff3b5c'; ctx.fillRect(x0 + 1, y - 21, (x1 - x0 - 2) * k, 2); }
    if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped) { const x = m.x - cx, y = m.y - cy, r = m.r * (m.grow ?? 1); const gold = m.kind === 'sw';
      ctx.fillStyle = gold ? 'rgba(255,220,90,.35)' : 'rgba(200,230,255,.28)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      ctx.strokeStyle = gold ? '#ffd040' : 'rgba(240,250,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,140,220,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r - 3, 2.2, 3.6); ctx.stroke(); ctx.strokeStyle = 'rgba(120,230,255,.6)'; ctx.beginPath(); ctx.arc(x, y, r - 3, 5.4, 6.2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x - r * .45), Math.round(y - r * .55), 4, 3); ctx.fillRect(Math.round(x - r * .2), Math.round(y - r * .7), 2, 2);
      if (gold) { text('!', x, y - 4, { color: '#ffd040', align: 'center' }); } }
  }
}
function startFrogCut(B) {""")

# hook boss camera etc: updatePlay hooks
R("  if (G.boss) updateBoss(dt);","  if (G.boss) updateBoss(dt);\n  if (G.dogP) updatePaws(dt);\n  if (G.movers) updateBath(dt);")
R("  P.y = ny;\n","  P.y = ny;\n  if (G.movers) moverCollide(prevB);\n",)
# draw hooks
R("  for (const e of G.enemies) drawEnemy(e, cx, cy);\n  if (G.boss) drawBoss(cx, cy);","  if (G.movers) drawBath(cx, cy);\n  for (const e of G.enemies) drawEnemy(e, cx, cy);\n  if (G.boss) drawBoss(cx, cy);")
R("  drawParts(cx, cy);\n  // foreground silhouette","  if (G.dogP) drawPaws(cx, cy);\n  drawParts(cx, cy);\n  // foreground silhouette")
# loadLevel init
R("  G.nurses = L.nurses.map(n => ({ ...n })); G.sugarMeter = 0;","  G.nurses = L.nurses.map(n => ({ ...n })); G.sugarMeter = 0;\n  G.dogP = L.dog ? { t: 3, steps: [] } : null; if (L.split) L.splitX = L.split * T; G.movers = L.movers ? L.movers.map(m => ({ ...m, y: m.y0 })) : null; G.silh2 = null; G.loose = null; G.clouds = null;")
# falls: no damage in bonus
R("if (P.fallCD <= 0) { P.inv = 0; const bst = P.boost;","if (P.fallCD <= 0 && !G.th.bonus) { P.inv = 0; const bst = P.boost;")
# stars for bonus
R("const sR = G.sugar / Math.max(1, G.sugarTotal), kR = G.kills / Math.max(1, G.enemiesTotal);","const sR = G.sugar / Math.max(1, G.sugarTotal), kR = G.enemiesTotal ? G.kills / G.enemiesTotal : 1;")
# drain: bath flag draw & clear msg
R("function drawFlag(x, y) {","function drawFlag(x, y) {\n  if (G && G.def && G.def.id === 'banheiro') { const im = IMG.grate; ctx.save(); ctx.translate(x, y + 2); if (G.clear) ctx.rotate(Math.sin(gtime * 30) * .02); ctx.drawImage(im, -im.width / 2, -6); ctx.restore(); if (!G.clear) text('RALO', x, y - 30 + Math.sin(gtime * 5) * 2, { color: '#7ff0ff', align: 'center' }); return; }")
R("function startClear() {\n  const time = G.time;","function startClear() {\n  const time = G.time; if (G.def.id === 'banheiro') { floatText('GLUB GLUB! PARA O ESGOTO!', P.x, P.y - 60, '#7ff0ff', 2); SFX.splash(); }")

# ================= LEVELS
a=s.index("// parallax layer configs per level")
s=s[:a]+r"""LEVELS.push({ id: 'cozinha', sub: '6', mk: () => makeLevel('mesa', 222, L => {
  L.theme2 = 'piso'; L.split = 100; L.dog = true;
  L.ground(0, 100, 9); L.s(6, 11, 3); L.e('roach', 14, 9); L.block(20, 3, 9, 2); L.s(20, 13, 3); L.e('mosca', 26, 14); L.e('roach', 32, 9);
  L.plat(36, 12, 4); L.s(36, 14, 4); L.block(44, 4, 9, 3); L.s(44, 14, 4); L.e('roach', 52, 9); L.e('mosca', 58, 13); L.plat(62, 12, 3); L.plat(67, 14, 3); L.s(67, 16, 3);
  L.e('roach', 74, 9); L.block(80, 2, 9, 2); L.e('mosca', 86, 14); L.e('roach', 92, 9); L.s(94, 11, 4);
  L.ground(100, 222, 3); L.s(101, 7, 4, 2); L.e('roach', 110, 3); L.plat(115, 6, 4); L.s(115, 8, 4); L.e('mosca', 120, 8); L.e('roach', 130, 3); L.plat(136, 6, 3); L.plat(141, 8, 3); L.s(141, 10, 3);
  L.e('roach', 150, 3); L.e('mosca', 156, 9); L.plat(160, 6, 4); L.s(160, 8, 4); L.e('roach', 168, 3); L.n(176, 3);
  L.boss = { kind: 'flea', x: 205, h: 3, arenaL: 180, arenaR: 222 }; L.f(216, 3);
}) });
LEVELS.push({ id: 'banheiro', sub: '7', mk: () => makeLevel('banheiro', 160, L => {
  const Y = h => (ROWS - h - BASE) * T; L.movers = [];
  const bub = (x, h, o = {}) => L.movers.push({ kind: 'bub', x: x * T + 8, y0: Y(h) - 20, r: 14, ph: Math.random() * 6, ...o });
  const sw = (id, x, h) => L.movers.push({ kind: 'sw', id, x: x * T + 8, y0: Y(h) - 20, r: 15, ph: 0, amp: 3 });
  const foam = (by, x0, x1, h, dur) => L.movers.push({ kind: 'foam', by, x0: x0 * T, x1: x1 * T, y0: Y(h), y: Y(h), dur, on: false, left: 0 });
  L.ground(0, 14, 3); L.s(4, 5, 6); bub(16, 4); bub(19, 5); bub(22, 4); L.s(16, 8, 7, 1.5);
  L.ground(24, 32, 3); sw('a', 30, 6); foam('a', 32, 46, 3, 5); L.s(33, 5, 12);
  L.ground(46, 56, 3); L.movers.push({ kind: 'stream', x: 59 * T, y: Y(1), top: Y(10), rise: 55, every: 1.1, cd: 0 }); L.movers.push({ kind: 'stream', x: 65 * T, y: Y(1), top: Y(11), rise: 60, every: 1.3, cd: .6 }); L.s(58, 9, 8, 1);
  L.ground(70, 80, 7); L.s(71, 9, 4); sw('b', 79, 10); foam('b', 80, 88, 6, 4); sw('c', 89, 10); foam('c', 89, 101, 6, 4.5); L.s(81, 8, 6); L.s(90, 8, 10);
  L.ground(101, 112, 3); L.s(103, 5, 6);
  bub(114, 5, { amp: 18, sp: 1.2 }); bub(118, 7, { amp: 22, sp: 1 }); bub(122, 5, { amp: 18, sp: 1.4 }); bub(126, 8, { amp: 24, sp: .9 }); L.s(114, 10, 13, 2);
  L.ground(130, 160, 3); L.s(132, 5, 8); L.f(150, 3);
}) });
LEVELS.push({ id: 'esgoto', sub: '8', mk: () => makeLevel('esgoto', 180, L => {
  L.ground(0, 20, 3); L.s(5, 5, 4); L.e('roachB', 13, 3);
  L.plat(21, 4, 3); L.ground(26, 44, 4); L.e('rat', 33, 4); L.e('roachB', 40, 4); L.s(28, 6, 4);
  L.plat(46, 4, 3); L.plat(51, 5, 3); L.s(46, 6, 3); L.s(51, 7, 3);
  L.ground(56, 74, 3); L.e('rat', 62, 3); L.e('roachB', 70, 3); L.s(58, 5, 4);
  L.ground(74, 80, 6); L.e('roachB', 77, 6); L.ground(80, 100, 3); L.e('roachB', 86, 3); L.e('rat', 94, 3); L.s(82, 5, 5);
  L.plat(102, 4, 3); L.plat(107, 5, 3); L.s(102, 6, 3); L.s(107, 7, 3);
  L.ground(112, 128, 4); L.e('rat', 118, 4); L.e('roachB', 124, 4); L.s(114, 6, 4);
  L.ground(128, 180, 3); L.n(132, 3); L.s(130, 5, 3);
  L.boss = { kind: 'rat', x: 165, h: 3, arenaL: 136, arenaR: 178 }; L.f(172, 3);
}) });
"""+s[a:]
R("    case 'cozinha': return [{ img: 'kmesa'","    case 'cozinha': return [{ img: 'kmesa'")
# map nodes
R("{ x: 330, y: 98, name: 'PAREDE DA CASA' }\n];","{ x: 330, y: 98, name: 'PAREDE DA CASA' }, { x: 160, y: 40, name: 'COZINHA' }, { x: 420, y: 40, name: 'BANHEIRO' }, { x: 596, y: 318, name: 'ESGOTO' }\n];")
R("[[540, 150], [500, 105], [400, 125], [330, 98]]];","[[540, 150], [500, 105], [400, 125], [330, 98]], [[330, 98], [290, 80], [200, 70], [160, 40]], [[160, 40], [230, 62], [350, 62], [420, 40]], [[420, 40], [520, 120], [630, 220], [596, 318]]];")
R("  mapCanvas = c;","  x.fillStyle = '#1a1020'; x.beginPath(); x.ellipse(596, 322, 22, 11, 0, 0, 7); x.fill(); x.fillStyle = '#6a6a78'; x.beginPath(); x.ellipse(596, 321, 20, 9, 0, 0, 7); x.fill(); x.fillStyle = '#4a4a58'; for (let i = -12; i <= 12; i += 6) x.fillRect(596 + i - 1, 316, 2, 10);\n  mapCanvas = c;")
open(p,'w').write(s)
