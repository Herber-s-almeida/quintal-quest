p='game.js'; s=open(p).read()
rep=[
("  // props\n  const prop = {};","""  const K = 3;
  const bossF = (pose) => pix(41 * K + 4, 29 * K + 4, g => {
    const E = (x, y, rx, ry, c) => g.ell(x * K + 2, y * K + 2, rx * K, ry * K, c);
    const TL = (x0, y0, x1, y1, r, c) => { const n = 40; for (let i = 0; i <= n; i++) { const t = i / n; g.ell((x0 + (x1 - x0) * t) * K + 2, (y0 + (y1 - y0) * t) * K + 2, r * K, r * K, c); } };
    const dy = pose === 'crouch' ? 1.5 : 0;
    TL(25, 20 + dy, 23.5, 26.5, .45, '#3a6a12'); TL(29, 20 + dy, 30.5, 26.5, .45, '#3a6a12');
    if (pose === 'air') { TL(14, 17, 6, 12, 2, '#4e8c1a'); TL(14, 16.5, 7, 11.5, 1.1, '#7cc82a'); TL(6, 12, 1, 25, .7, '#3a6a12'); for (let i = 0; i < 5; i++) E(5 - i * .9, 14 + i * 2.2, .35, .35, '#c8e880'); }
    else { const kx = pose === 'crouch' ? 21 : 22, ky = pose === 'crouch' ? 10 : 7.5; TL(14, 17 + dy, kx, ky, 2, '#4e8c1a'); TL(14.5, 16.5 + dy, kx, ky + .3, 1.1, '#7cc82a'); for (let i = 1; i < 4; i++) TL(14 + i * 2, 17 + dy - i * 2.3, 15 + i * 2, 16 + dy - i * 2.3, .25, '#3a7a14'); TL(kx, ky, 12, 26, .7, '#3a6a12'); for (let i = 0; i < 5; i++) E(kx - 1 - i * 1.8, ky + 3 + i * 3.2, .35, .35, '#c8e880'); }
    E(17, 17 + dy, 11.5, 4.6, '#7cc82a'); E(17, 19.6 + dy, 10.5, 2, '#5aa020'); E(15, 15 + dy, 8, 1.6, '#b4ec5a');
    for (let x = 8; x < 27; x += 2.4) TL(x, 14.5 + dy, x - .3, 21 + dy, .18, '#4a8a18');
    E(16, 12.8 + dy, 11.5, 2.9, '#4e8c1a'); E(14, 12 + dy, 8.5, 1.3, '#8ac840'); TL(5, 13 + dy, 26, 12 + dy, .2, '#3a6a12'); TL(8, 14 + dy, 24, 13.4 + dy, .15, '#6aaa2a');
    E(27, 15 + dy, 4.8, 4.8, '#6ab826'); E(26, 13 + dy, 2.5, 1.5, '#9ae04a');
    E(32.5, 15 + dy, 5.2, 5.6, '#8ad83a'); E(31.5, 12.5 + dy, 2.6, 1.6, '#c8f080');
    E(34.5, 13.5 + dy, 2.5, 2.7, '#fff6b0'); E(35.2, 13.8 + dy, 1.1, 1.4, '#1a1020'); E(34.8, 13 + dy, .4, .4, '#ffffff');
    TL(31.5, 10.6 + dy, 37, 12.2 + dy, .55, '#1a1020');
    E(36.4, 19 + dy, 1.6, 1.3, '#3a6a12'); E(37.2, 19.5 + dy, .45, .5, '#ffffff'); TL(33, 20 + dy, 37, 21 + dy, .3, '#2a4a10');
    TL(34, 10 + dy, 39.5, 1, .3, '#2a4a10'); TL(35.5, 10.2 + dy, 40.5, 3.5, .3, '#2a4a10');
  }, OL);
  SPR.boss = { stand: bossF('stand'), crouch: bossF('crouch'), air: bossF('air') };
  SPR.bossW = { stand: tinted(SPR.boss.stand, '#ffffff'), crouch: tinted(SPR.boss.crouch, '#ffffff'), air: tinted(SPR.boss.air, '#ffffff') };
  { const sc = .34, cw = Math.round(ANT.cw * sc), ch = Math.round(ANT.ch * sc), n = IMG.ant.width / ANT.cw;
    const [c, x] = mkCanvas(cw * n, ch); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    for (let i = 0; i < n; i++) x.drawImage(IMG.ant, i * ANT.cw, 0, ANT.cw, ANT.ch, i * cw, 0, cw, ch);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(40,12,40,0.38)'; x.fillRect(0, 0, c.width, ch);
    SPR.mini = { img: c, cw, ch }; }
  // props
  const prop = {};"""),
("  clear: null\n};","  boss: { bpm: 172, root: 50, prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 2, 5]], arp: [0, 3, 1, 3, 2, 3, 1, 3, 0, 3, 1, 3, 4, 3, 2, 1], kick: [0, 3, 6, 8, 11, 14], hat: 1 },\n  clear: null\n};"),
("  spring() {","  boom() { tone({ type: 'sine', f: 120, f2: 30, t: .45, v: .7 }); noise({ f: 600, f2: 80, type: 'lowpass', t: .5, v: .5 }); },\n  roar() { tone({ type: 'sawtooth', f: 160, f2: 90, t: .5, v: .2 }); tone({ type: 'square', f: 240, f2: 120, t: .45, v: .12, d: .05 }); noise({ f: 900, t: .4, v: .2 }); },\n  bossHit() { tone({ f: 300, f2: 90, t: .15, v: .3 }); noise({ f: 3000, t: .08, v: .3 }); tone({ type: 'triangle', f: 900, f2: 400, t: .1, v: .15 }); },\n  spring() {"),
]
for a,b in rep:
    assert a in s, a[:60]; s=s.replace(a,b,1)
a=s.index("{ id: 'formigueiro'"); b=s.index("{ id: 'areia'")
s=s[:a]+"""{ id: 'formigueiro', sub: '1', mk: () => makeLevel('formigueiro', 150, L => {
    L.ground(0, 22, 3); L.s(6, 5, 4); L.e('ladyC', 15, 6); L.plat(17, 6, 4); L.s(17, 8, 4);
    L.ground(25, 40, 3); L.s(22, 6, 3, 1); L.e('ladyC', 31, 7); L.e('ladyC', 37, 9); L.s(31, 5, 5);
    L.ground(40, 52, 5); L.s(41, 7, 3); L.e('ladyC', 46, 10);
    L.ground(52, 60, 3); L.s(60, 6, 4, 1.5); L.ground(64, 90, 3); L.e('ladyC', 70, 6); L.e('ladyC', 84, 7);
    L.plat(72, 6, 3); L.plat(77, 9, 3); L.s(77, 11, 3); L.s(72, 8, 3); L.e('ladyC', 78, 13);
    L.ground(90, 104, 6); L.e('ladyC', 97, 10); L.s(92, 8, 8);
    L.ground(104, 112, 3); L.s(112, 6, 4, 1.5); L.ground(116, 150, 3); L.s(117, 5, 3);
    L.boss = { x: 140, h: 3, arenaL: 110, arenaR: 150 };
    L.f(145, 3);
  }) },
  """+s[b:]
open(p,'w').write(s)
