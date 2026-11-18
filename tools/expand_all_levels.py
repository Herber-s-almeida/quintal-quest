# encoding: utf-8
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'game.js.bak')
DST = os.path.join(ROOT, 'game.js')

with open(SRC, 'r', encoding='utf-8') as f:
    s = f.read()

# 1. SPRITES
spr_target = "SPR.starE = tinted(SPR.star, '#3a2c48');"
spr_rep = """SPR.starE = tinted(SPR.star, '#3a2c48');
  SPR.baby = pix(14, 14, g => {
    g.ell(7, 7, 5, 5, '#ffe45a'); g.ell(7, 7, 3, 3, '#fff48a');
    g.p(5, 5, '#1a1020'); g.p(9, 5, '#1a1020'); g.p(5, 6, '#ffffff'); g.p(9, 6, '#ffffff');
    g.line(7, 3, 5, 1, '#ffc420'); g.line(7, 3, 9, 1, '#ffc420'); g.p(7, 8, '#ff9020');
  }, OL);
  SPR.spring = pix(16, 12, g => {
    g.ell(8, 4, 7, 4, '#ff5a36'); g.ell(8, 3, 5, 2, '#ff8a60');
    g.p(5, 3, '#ffffff'); g.p(11, 3, '#ffffff'); g.rect(6, 7, 4, 4, '#e0e0e0'); g.rect(5, 10, 6, 2, '#808080');
  }, OL);"""
assert spr_target in s, "spr_target not found"
s = s.replace(spr_target, spr_rep, 1)

# 2. MAKE LEVEL HELPER
mk_target = """function makeLevel(theme, len, build) {
  const grid = Array.from({ length: ROWS }, () => new Uint8Array(len));
  const L = {
    theme, len, grid, enemies: [], sugar: [], nurses: [], flag: null, start: { x: 3, h: 3 }, deco: [],
    ground(x0, x1, h) { h += BASE; for (let x = x0; x < x1; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; },
    block(x0, w, hb, hh) { hb += BASE; for (let x = x0; x < x0 + w; x++) for (let y = ROWS - hb - hh; y < ROWS - hb; y++) grid[y][x] = 1; },
    plat(x0, h, w) { h += BASE; for (let x = x0; x < x0 + w; x++) grid[ROWS - h][x] = 2; },
    e(type, x, h, o = {}) { h += BASE; if (o.top !== undefined) o.top += BASE * T; this.enemies.push({ type, x: x * T + T / 2, y: (ROWS - h) * T, ...o }); },
    s(x, h, n = 1, arc = 0) { h += BASE; for (let i = 0; i < n; i++) { const a = n > 1 ? Math.sin(i / (n - 1) * Math.PI) * arc : 0; if ((this._sc = (this._sc || 0) + 1) % 3 !== 1) continue; this.sugar.push({ x: (x + i) * T + T / 2, y: (ROWS - h) * T - a * T + 4 }); } },
    n(x, h) { h += BASE; this.nurses.push({ x: x * T + 8, y: (ROWS - h) * T, used: false, t: 0 }); },
    f(x, h) { h += BASE; this.flag = { x: x * T + 8, y: (ROWS - h) * T }; },
  };
  build(L);
  return L;
}"""

mk_rep = """function makeLevel(theme, len, build) {
  const grid = Array.from({ length: ROWS }, () => new Uint8Array(len));
  const L = {
    theme, len, grid, enemies: [], sugar: [], nurses: [], flag: null, start: { x: 3, h: 3 }, deco: [],
    springs: [], checkpoints: [], babies: [], crumbs: [], switches: [], secrets: [],
    ground(x0, x1, h) { h += BASE; for (let x = x0; x < x1; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; },
    block(x0, w, hb, hh) { hb += BASE; for (let x = x0; x < x0 + w; x++) for (let y = ROWS - hb - hh; y < ROWS - hb; y++) grid[y][x] = 1; },
    plat(x0, h, w) { h += BASE; for (let x = x0; x < x0 + w; x++) grid[ROWS - h][x] = 2; },
    e(type, x, h, o = {}) { h += BASE; if (o.top !== undefined) o.top += BASE * T; this.enemies.push({ type, x: x * T + T / 2, y: (ROWS - h) * T, ...o }); },
    s(x, h, n = 1, arc = 0) { h += BASE; for (let i = 0; i < n; i++) { const a = n > 1 ? Math.sin(i / (n - 1) * Math.PI) * arc : 0; this.sugar.push({ x: (x + i) * T + T / 2, y: (ROWS - h) * T - a * T + 4 }); } },
    n(x, h) { h += BASE; this.nurses.push({ x: x * T + 8, y: (ROWS - h) * T, used: false, t: 0 }); },
    f(x, h) { h += BASE; this.flag = { x: x * T + 8, y: (ROWS - h) * T }; },
    spring(x, h, power = 570) { h += BASE; this.springs.push({ x: x * T + 8, y: (ROWS - h) * T, power, squish: 0 }); },
    cp(x, h) { h += BASE; this.checkpoints.push({ x: x * T + 8, y: (ROWS - h) * T, active: false }); },
    baby(x, h) { h += BASE; this.babies.push({ x: x * T + 8, y: (ROWS - h) * T - 8, got: false, bob: Math.random() * 6 }); },
    crumb(x, h, w = 3) { h += BASE; this.crumbs.push({ x: x * T, y: (ROWS - h) * T, w: w * T, shake: 0, dead: false, resp: 0 }); },
    secret(x0, w, hb, hh) { hb += BASE; for (let xx = x0; xx < x0 + w; xx++) for (let yy = ROWS - hb - hh; yy < ROWS - hb; yy++) grid[yy][xx] = 1; this.secrets.push({ x0, w, hb, hh, hp: 3, broken: false, x: x0 * T + (w * T) / 2, y: (ROWS - hb - hh / 2) * T }); },
    sw(id, x, h, gx, gh, gw, ghh) { h += BASE; gh += BASE; for (let xx = gx; xx < gx + gw; xx++) for (let yy = ROWS - gh - ghh; yy < ROWS - gh; yy++) grid[yy][xx] = 1; this.switches.push({ id, x: x * T + 8, y: (ROWS - h) * T - 8, on: false, timer: 0, gx, gh, gw, ghh }); }
  };
  build(L);
  return L;
}"""
assert mk_target in s, "mk_target not found"
s = s.replace(mk_target, mk_rep, 1)

# 3. RECONSTRUCT LEVELS
lvl_target = s[s.find("const LEVELS = ["):s.find("function layersFor(id) {")]

new_levels = """const LEVELS = [
  { id: 'formigueiro', sub: '1', mk: () => makeLevel('formigueiro', 540, L => {
    // Ato 1 (0 - 170): Galerias de Entrada e Primeiros Saltos
    L.ground(0, 32, 3); L.s(6, 5, 5); L.e('beetle', 16, 3); L.plat(18, 6, 4); L.s(18, 8, 4);
    L.spring(28, 3, 580); L.plat(26, 8, 6); L.s(27, 10, 4);
    L.ground(34, 58, 4); L.s(36, 6, 4, 1); L.e('hopper', 44, 4); L.e('beetle', 52, 4); L.s(45, 6, 6);
    L.secret(60, 4, 3, 4); L.baby(62, 5); L.s(60, 5, 4);
    L.ground(66, 96, 3); L.e('beetle', 75, 3); L.e('hopper', 88, 3); L.s(70, 5, 6);
    L.crumb(98, 4, 3); L.crumb(104, 5, 3); L.crumb(110, 4, 3); L.s(98, 7, 14, 2);
    L.ground(116, 172, 4); L.e('beetle', 126, 4); L.e('hopper', 140, 4); L.plat(135, 7, 4); L.s(135, 9, 4);
    L.spring(155, 4, 590); L.plat(158, 9, 4); L.s(158, 11, 4);
    L.cp(172, 4);

    // Ato 2 (175 - 360): Jardim dos Fungos e Caverna de Cristais
    L.ground(175, 220, 3); L.s(178, 5, 6); L.e('beetle', 190, 3); L.plat(185, 6, 4); L.plat(195, 8, 4); L.s(195, 10, 4);
    L.e('hopper', 205, 3); L.e('beetle', 214, 3);
    L.sw('f1', 222, 4, 245, 3, 2, 6);
    L.ground(220, 245, 3); L.s(224, 5, 5);
    L.ground(247, 310, 3); L.baby(250, 5); L.s(248, 5, 8);
    L.e('beetle', 265, 3); L.spring(275, 3, 580); L.plat(278, 8, 4); L.s(278, 10, 4);
    L.plat(288, 9, 3); L.plat(295, 11, 3); L.baby(296, 12); L.e('hopper', 290, 3);
    L.crumb(312, 5, 3); L.crumb(318, 6, 3); L.crumb(324, 5, 3); L.s(312, 8, 14, 2);
    L.ground(330, 365, 4); L.e('beetle', 342, 4); L.e('hopper', 352, 4); L.s(335, 6, 6);
    L.n(358, 4); L.cp(362, 4);

    // Ato 3 (365 - 470): Gauntlet de Alta Velocidade e Plataformas Móveis
    L.ground(365, 395, 3); L.s(368, 5, 6); L.e('beetle', 380, 3);
    L.spring(392, 3, 620); L.crumb(398, 7, 3); L.crumb(406, 9, 3); L.s(398, 11, 12, 2);
    L.baby(418, 11); L.plat(416, 9, 4);
    L.ground(422, 470, 3); L.e('hopper', 432, 3); L.e('beetle', 445, 3); L.e('hopper', 458, 3); L.s(426, 5, 12);

    // Chefe e Bandeira (470 - 540)
    L.ground(470, 540, 3); L.s(472, 5, 4);
    L.boss = { x: 510, h: 3, arenaL: 472, arenaR: 540 };
    L.f(534, 3);
  }) },

  { id: 'areia', sub: '2', mk: () => makeLevel('areia', 580, L => {
    // Ato 1 (0 - 185): Dunas e Baldinhos de Praia
    L.ground(0, 30, 3); L.s(6, 5, 6); L.e('ladyC', 18, 7); L.e('scorp', 26, 3);
    L.spring(32, 3, 580); L.plat(35, 7, 4); L.s(35, 9, 4);
    L.ground(40, 75, 4); L.s(42, 6, 6); L.e('ant', 54, 4); L.e('scorp', 66, 4);
    L.plat(78, 6, 3); L.plat(86, 9, 3); L.plat(94, 11, 3); L.baby(95, 12); L.s(80, 8, 16, 2);
    L.ground(80, 118, 3); L.e('ladyC', 92, 7); L.e('ant', 105, 3); L.s(100, 5, 6);
    L.crumb(120, 4, 3); L.crumb(126, 5, 3); L.crumb(132, 4, 3); L.s(120, 7, 14, 2);
    L.ground(138, 185, 4); L.e('scorp', 150, 4); L.e('ant', 165, 4); L.e('ladyC', 175, 8); L.s(142, 6, 8);
    L.cp(184, 4);

    // Ato 2 (185 - 380): O Castelo de Areia Proibido
    L.ground(185, 235, 3); L.block(195, 3, 3, 4); L.plat(200, 7, 4); L.block(206, 3, 3, 5);
    L.s(198, 9, 5); L.e('scorp', 216, 3);
    L.secret(225, 4, 3, 4); L.s(226, 5, 4);
    L.ground(235, 265, 4); L.e('ant', 246, 4); L.e('lady', 255, 9, { amp: 30 });
    L.sw('s1', 260, 4, 280, 3, 2, 6);
    L.ground(265, 310, 3); L.baby(284, 6); L.s(282, 5, 8);
    L.e('scorp', 295, 3); L.e('ant', 305, 3);
    L.plat(315, 6, 3); L.plat(325, 8, 3); L.plat(335, 10, 3); L.baby(336, 11);
    L.ground(320, 375, 3); L.e('ladyC', 345, 8); L.e('scorp', 360, 3); L.s(340, 5, 8);
    L.n(372, 3); L.cp(376, 3);

    // Ato 3 (380 - 510): Deserto de Areia Movediça
    L.crumb(386, 4, 3); L.crumb(394, 5, 3); L.crumb(402, 6, 3); L.crumb(410, 5, 3); L.s(386, 8, 16, 2);
    L.ground(418, 460, 3); L.e('scorp', 428, 3); L.e('ant', 442, 3); L.e('ladyC', 452, 7);
    L.spring(458, 3, 620); L.plat(464, 9, 4); L.baby(466, 11); L.s(464, 11, 4);
    L.ground(468, 510, 4); L.e('scorp', 480, 4); L.e('ant', 495, 4); L.s(472, 6, 8);

    // Chefe e Bandeira (510 - 580)
    L.ground(510, 580, 3); L.s(512, 5, 4);
    L.boss = { kind: 'scorp', x: 550, h: 3, arenaL: 512, arenaR: 580 };
    L.f(572, 3);
  }) },

  { id: 'pantano', sub: '3', mk: () => makeLevel('pantano', 620, L => {
    // Ato 1 (0 - 200): O Manguezal Aberto
    L.ground(0, 32, 4); L.s(6, 6, 6); L.e('frog', 18, 4); L.e('mosca', 28, 8);
    L.plat(35, 4, 3); L.plat(42, 5, 3); L.plat(49, 4, 3); L.s(35, 6, 16, 1.5);
    L.ground(55, 90, 4); L.e('frog', 68, 4); L.e('mosca', 78, 8); L.s(60, 6, 6);
    L.spring(88, 4, 580); L.plat(92, 8, 4); L.baby(94, 10); L.s(92, 10, 4);
    L.ground(98, 140, 4); L.e('frog', 110, 4); L.e('frog', 128, 4); L.s(102, 6, 8);
    L.crumb(144, 4, 3); L.crumb(151, 5, 3); L.crumb(158, 4, 3); L.s(144, 7, 16, 2);
    L.ground(164, 202, 5); L.e('frog', 178, 5); L.e('mosca', 190, 9); L.s(170, 7, 6);
    L.cp(200, 5);

    // Ato 2 (205 - 400): A Caverna das Flores Carnívoras
    L.ground(205, 255, 4); L.e('frog', 222, 4); L.e('mosca', 238, 9); L.s(210, 6, 8);
    L.sw('p1', 250, 5, 275, 3, 2, 6);
    L.ground(255, 320, 4); L.baby(278, 6); L.s(276, 6, 8);
    L.e('frog', 290, 4); L.e('mosca', 305, 9);
    L.secret(325, 4, 3, 4); L.s(326, 5, 4);
    L.plat(335, 6, 3); L.plat(345, 8, 3); L.plat(355, 10, 3); L.baby(356, 11);
    L.ground(340, 395, 4); L.e('frog', 362, 4); L.e('frog', 380, 4); L.s(365, 6, 6);
    L.n(392, 4); L.cp(396, 4);

    // Ato 3 (400 - 540): Correnteza Rápida
    L.plat(402, 4, 3); L.crumb(410, 5, 3); L.plat(418, 4, 3); L.crumb(426, 6, 3); L.plat(434, 4, 3);
    L.s(402, 7, 24, 2);
    L.ground(442, 480, 4); L.e('frog', 455, 4); L.e('mosca', 470, 8);
    L.spring(478, 4, 620); L.plat(484, 9, 4); L.baby(486, 11); L.s(484, 11, 4);
    L.ground(490, 540, 4); L.e('frog', 506, 4); L.e('mosca', 522, 9); L.s(496, 6, 8);

    // Chefe e Bandeira (540 - 620)
    L.ground(540, 620, 4); L.s(542, 6, 4);
    L.boss = { kind: 'frog', x: 585, h: 4, arenaL: 542, arenaR: 620 };
    L.f(612, 4);
  }) },

  { id: 'gramado', sub: '4', mk: () => makeLevel('gramado', 640, L => {
    // Ato 1 (0 - 210): A Selva de Capim
    L.ground(0, 35, 3); L.s(6, 5, 6); L.e('cater', 16, 3); L.e('fly', 24, 8);
    L.spring(32, 3, 580); L.plat(36, 7, 4); L.s(36, 9, 4);
    L.ground(42, 85, 4); L.e('stick', 52, 4); L.e('spider', 64, 0, { top: 20, range: 200 }); L.s(48, 6, 6);
    L.plat(88, 7, 3); L.plat(96, 9, 3); L.plat(104, 11, 3); L.baby(105, 12); L.s(88, 10, 16, 2);
    L.ground(95, 140, 3); L.e('hopper', 110, 3); L.e('cater', 125, 3); L.s(105, 5, 6);
    L.crumb(144, 4, 3); L.crumb(152, 5, 3); L.crumb(160, 4, 3); L.s(144, 7, 16, 2);
    L.ground(168, 210, 4); L.e('snakeM', 180, 4); L.e('stick', 194, 4); L.e('fly', 202, 9); L.s(172, 6, 8);
    L.cp(208, 4);

    // Ato 2 (210 - 425): O Bosque das Teias
    L.ground(210, 260, 3); L.e('cater', 224, 3); L.e('spider', 240, 0, { top: 10, range: 140 }); L.s(215, 5, 8);
    L.secret(265, 4, 3, 4); L.baby(268, 5); L.s(266, 5, 4);
    L.ground(260, 320, 3); L.e('stick', 285, 3); L.e('snakeM', 305, 3);
    L.sw('g1', 315, 4, 340, 3, 2, 6);
    L.ground(320, 380, 3); L.s(342, 5, 8); L.e('hopper', 355, 3); L.e('cater', 370, 3);
    L.plat(382, 6, 3); L.plat(390, 8, 3); L.plat(398, 10, 3); L.baby(399, 11);
    L.ground(380, 425, 4); L.e('stick', 396, 4); L.e('fly', 412, 9); L.s(388, 6, 6);
    L.n(418, 4); L.cp(422, 4);

    // Ato 3 (425 - 560): Trilha Aérea
    L.crumb(428, 5, 3); L.crumb(436, 7, 3); L.spring(444, 3, 620); L.plat(450, 10, 4);
    L.s(428, 8, 20, 2); L.baby(466, 12);
    L.ground(460, 560, 3); L.e('hopper', 478, 3); L.e('cater', 496, 3); L.e('stick', 518, 3); L.e('snakeM', 542, 3);
    L.s(470, 5, 14);

    // Chefe e Bandeira (560 - 640)
    L.ground(560, 640, 3); L.s(562, 5, 4);
    L.boss = { kind: 'snake', x: 610, h: 3, arenaL: 565, arenaR: 640 };
    L.f(632, 3);
  }) }
];

LEVELS.push({ id: 'parede', sub: '5', vertical: true, mk: () => buildVertLevel() });

LEVELS.push({ id: 'cozinha', sub: '6', mk: () => makeLevel('mesa', 680, L => {
  L.theme2 = 'piso'; L.split = 260; L.dog = true; L.haz = [];
  const GY = h => (ROWS - h - BASE) * T;
  const spike = (x, w, h) => L.haz.push({ k: 'spike', x0: x * T, x1: (x + w) * T, y: GY(h) });
  L.haz.push({ k: 'honey', x0: 45 * T, x1: 52 * T, y: GY(9) }, { k: 'honey', x0: 110 * T, x1: 118 * T, y: GY(9) });
  spike(75, 3, 9); spike(140, 3, 9); spike(210, 3, 9);

  // Ato 1 (0 - 260): Banquete na Mesa
  L.ground(0, 260, 9); L.s(6, 11, 4); L.e('roach', 20, 9); L.block(30, 3, 9, 2); L.s(30, 13, 4);
  L.e('mosca', 40, 14); L.e('roach', 60, 9); L.plat(70, 12, 4); L.s(70, 14, 4);
  L.spring(88, 9, 580); L.plat(92, 13, 4); L.s(92, 15, 4);
  L.e('roach', 125, 9); L.e('mosca', 135, 14); L.baby(145, 12);
  L.block(160, 4, 9, 3); L.s(160, 14, 4); L.e('roach', 180, 9);
  L.plat(195, 12, 4); L.plat(205, 14, 4); L.s(205, 16, 4);
  L.e('roach', 230, 9); L.e('mosca', 245, 14);

  // Ato 2 (260 - 480): Chão da Cozinha
  L.ground(260, 680, 3);
  L.haz.push({ k: 'bowl', x: 285 * T, y: GY(3) });
  spike(310, 3, 3); spike(370, 3, 3); spike(430, 3, 3);
  L.haz.push({ k: 'pend', x: 340 * T, y: GY(3) - 300, len: 250, amp: .75, sp: 1.6, ph: 0 });
  L.haz.push({ k: 'ball', x0: 300 * T, x1: 420 * T, y: GY(3), every: 3.4, sp: 165 });
  L.cp(290, 3);
  L.s(292, 5, 8); L.e('roach', 305, 3); L.plat(318, 6, 4); L.s(318, 8, 4);
  L.sw('k1', 345, 4, 370, 3, 2, 6);
  L.baby(375, 6); L.s(372, 5, 8);
  L.e('roach', 390, 3); L.e('mosca', 405, 8); L.plat(415, 6, 3); L.plat(425, 8, 3); L.s(425, 10, 3);
  L.e('roach', 445, 3); L.baby(450, 10);
  L.n(475, 3); L.cp(480, 3);

  // Ato 3 (485 - 600): Sob os Móveis
  L.haz.push({ k: 'pend', x: 510 * T, y: GY(3) - 300, len: 250, amp: .75, sp: 1.6, ph: 1 });
  L.haz.push({ k: 'ball', x0: 490 * T, x1: 580 * T, y: GY(3), every: 3.2, sp: 175 });
  spike(525, 3, 3); spike(560, 3, 3);
  L.e('roach', 495, 3); L.e('mosca', 515, 9); L.plat(530, 6, 4); L.s(530, 8, 4);
  L.baby(550, 8); L.e('roach', 570, 3); L.s(565, 5, 8);

  // Chefe e Bandeira (600 - 680)
  L.boss = { kind: 'flea', x: 645, h: 3, arenaL: 605, arenaR: 680 };
  L.f(672, 3);
}) });

LEVELS.push({ id: 'banheiro', sub: '7', mk: () => makeLevel('banheiro', 560, L => {
  const Y = h => (ROWS - h - BASE) * T; L.movers = [];
  const bub = (x, h, o = {}) => L.movers.push({ kind: 'bub', x: x * T + 8, y0: Y(h) - 20, r: 14, ph: Math.random() * 6, ...o });
  const sw = (id, x, h) => L.movers.push({ kind: 'sw', id, x: x * T + 8, y0: Y(h) - 20, r: 15, ph: 0, amp: 3 });
  const foam = (by, x0, x1, h, dur) => L.movers.push({ kind: 'foam', by, x0: x0 * T, x1: x1 * T, y0: Y(h), y: Y(h), dur, on: false, left: 0 });

  // Ato 1 (0 - 180): A Pia de Porcelana
  L.ground(0, 20, 3); L.s(4, 5, 8);
  bub(24, 4); bub(28, 5); bub(32, 4); L.s(24, 8, 10, 1.5);
  L.ground(36, 50, 3); sw('a', 44, 6); foam('a', 50, 70, 3, 5); L.s(52, 5, 14);
  L.ground(70, 90, 3);
  L.movers.push({ kind: 'stream', x: 95 * T, y: Y(1), top: Y(10), rise: 55, every: 1.1, cd: 0 });
  L.movers.push({ kind: 'stream', x: 105 * T, y: Y(1), top: Y(11), rise: 60, every: 1.3, cd: .6 });
  L.s(94, 9, 14, 1.5); L.baby(108, 12);
  L.ground(115, 140, 4); L.s(118, 6, 8);
  bub(145, 5, { amp: 18, sp: 1.2 }); bub(152, 7, { amp: 22, sp: 1 }); bub(160, 5, { amp: 18, sp: 1.4 });
  L.s(144, 10, 18, 2);
  L.ground(168, 185, 3); L.cp(180, 3);

  // Ato 2 (185 - 365): A Banheira e o Labirinto de Espuma
  L.ground(185, 210, 4); L.s(188, 6, 6);
  sw('b', 205, 7); foam('b', 210, 230, 4, 4.5); L.s(212, 6, 14);
  L.ground(230, 255, 3); sw('c', 250, 6); foam('c', 255, 280, 4, 4.5);
  L.s(256, 6, 18); L.baby(278, 8);
  L.ground(280, 310, 4); sw('d', 305, 7); foam('d', 310, 340, 5, 5);
  L.s(312, 7, 20, 1.5);
  L.ground(340, 370, 3); L.s(344, 5, 8); L.cp(365, 3);

  // Ato 3 (370 - 500): O Chuveiro e Correntes Rápidas
  bub(378, 5, { amp: 20, sp: 1.5 }); bub(386, 7, { amp: 24, sp: 1.2 }); bub(394, 9, { amp: 22, sp: 1.4 });
  L.s(376, 11, 20, 2); L.baby(396, 12);
  L.ground(404, 430, 3); L.s(408, 5, 8);
  L.movers.push({ kind: 'stream', x: 438 * T, y: Y(1), top: Y(12), rise: 65, every: 1.0, cd: 0 });
  L.movers.push({ kind: 'stream', x: 448 * T, y: Y(1), top: Y(12), rise: 65, every: 1.0, cd: .5 });
  L.s(436, 11, 14, 1.5);
  bub(460, 6, { amp: 18, sp: 1.3 }); bub(470, 7, { amp: 20, sp: 1.1 }); bub(480, 6, { amp: 18, sp: 1.4 });
  L.s(460, 9, 22, 2);

  // Chegada no Ralo (500 - 560)
  L.ground(495, 560, 3); L.s(500, 5, 20);
  L.f(548, 3);
}) });

LEVELS.push({ id: 'esgoto', sub: '8', mk: () => makeLevel('esgoto', 660, L => {
  // Ato 1 (0 - 210): Os Canos Principais
  L.ground(0, 35, 3); L.s(5, 5, 6); L.e('roachB', 16, 3); L.e('rat', 28, 3);
  L.plat(35, 4, 3); L.ground(40, 75, 4); L.e('rat', 50, 4); L.e('roachB', 64, 4); L.s(44, 6, 8);
  L.spring(76, 4, 580); L.plat(80, 8, 4); L.baby(82, 10); L.s(80, 10, 4);
  L.ground(86, 135, 3); L.e('roachB', 100, 3); L.e('rat', 118, 3); L.s(92, 5, 8);
  L.crumb(140, 4, 3); L.crumb(148, 5, 3); L.crumb(156, 4, 3); L.s(140, 7, 18, 2);
  L.ground(164, 210, 4); L.e('rat', 180, 4); L.e('roachB', 196, 4); L.s(170, 6, 8);
  L.cp(205, 4);

  // Ato 2 (210 - 430): Estação de Triagem e Lodo Tóxico
  L.ground(210, 260, 3); L.e('roachB', 228, 3); L.e('rat', 246, 3); L.s(216, 5, 8);
  L.sw('es1', 255, 4, 280, 3, 2, 6);
  L.ground(260, 320, 3); L.s(282, 5, 8);
  L.secret(330, 4, 3, 4); L.baby(333, 5); L.s(331, 5, 4);
  L.ground(320, 380, 3); L.e('rat', 345, 3); L.e('roachB', 365, 3);
  L.plat(385, 6, 3); L.plat(395, 8, 3); L.plat(405, 10, 3); L.baby(406, 11);
  L.ground(380, 430, 4); L.e('rat', 400, 4); L.e('roachB', 418, 4); L.s(390, 6, 8);
  L.n(422, 4); L.cp(426, 4);

  // Ato 3 (430 - 580): Fortaleza dos Roedores
  L.crumb(432, 5, 3); L.crumb(440, 7, 3); L.spring(448, 3, 620); L.plat(454, 10, 4);
  L.s(432, 8, 22, 2); L.baby(472, 12);
  L.ground(462, 580, 3); L.e('rat', 480, 3); L.e('roachB', 505, 3); L.e('rat', 530, 3); L.e('roachB', 555, 3);
  L.s(470, 5, 16);

  // Chefe e Grande Bandeira Final (580 - 660)
  L.ground(580, 660, 3); L.s(582, 5, 4);
  L.boss = { kind: 'rat', x: 630, h: 3, arenaL: 585, arenaR: 660 };
  L.f(652, 3);
}) });
"""

assert len(lvl_target) > 500, "lvl_target not found or too short"
s = s.replace(lvl_target, new_levels, 1)

# 4. LOAD LEVEL RUNTIME INITIALIZATION
load_target = """  G.boss = L.boss ? makeBoss(L.boss) : null; G.flagHidden = !!L.boss; G.flagPop = 1; G.waves = []; G.bossBanner = 0;"""
load_rep = """  G.boss = L.boss ? makeBoss(L.boss) : null; G.flagHidden = !!L.boss; G.flagPop = 1; G.waves = []; G.bossBanner = 0;
  G.springs = (L.springs || []).map(sp => ({ ...sp, squish: 0 }));
  G.checkpoints = (L.checkpoints || []).map(cp => ({ ...cp, active: false }));
  G.babies = (L.babies || []).map(b => ({ ...b, got: false, bob: Math.random() * 6 }));
  G.crumbs = (L.crumbs || []).map(c => ({ ...c, shake: 0, dead: false, resp: 0 }));
  G.switches = (L.switches || []).map(sw => ({ ...sw, on: false, timer: 0 }));
  G.secrets = (L.secrets || []).map(sec => ({ ...sec, hp: 3, broken: false }));
  G.babiesGot = 0;
  if (CHK && CHK.i === i) {
    for (const cp of G.checkpoints) if (cp.x <= CHK.x + 16) cp.active = true;
  }"""
assert load_target in s, "load_target not found"
s = s.replace(load_target, load_rep, 1)

# 5. EXPAND VERTICAL LEVEL (Parede da Casa)
vert_target = """function buildVertLevel() {
  const L = { len: 120, vertical: true, worldH: 2600, groundY: 2560, sillY: 250, slick: [], nests: [], termites: [], sugar: [], decor: [], flag: null };
  const S = (x, y, n = 1, dx = 0, dy = -28) => { for (let i = 0; i < n; i++) L.sugar.push({ x: x + dx * i, y: y + dy * i }); };
  const wk = (x, y) => L.termites.push({ type: 'worker', x, y }), sd = (x, y) => L.termites.push({ type: 'soldier', x, y });
  const ns = (x, y, k) => L.nests.push({ x, y, k }), sl = (x0, x1, y0, y1) => L.slick.push({ x0, x1, y0, y1 });
  S(320, 2440, 3); wk(250, 2300); wk(420, 2240);
  ns(220, 2080, 0); sd(430, 2000); S(400, 2150, 2);
  sl(110, 430, 1830, 1880); S(482, 1905, 3);
  wk(200, 1720); wk(330, 1660); wk(460, 1720); ns(420, 1600, 1); S(240, 1640, 3, 20, -20);
  sl(110, 530, 1420, 1470); S(320, 1400, 2);
  sd(200, 1300); sd(440, 1200); ns(180, 1250, 2); S(330, 1330, 2);
  sl(110, 320, 1080, 1120); sl(320, 530, 990, 1030); S(420, 1110, 2); S(220, 1010, 2);
  wk(250, 900); wk(380, 870); wk(470, 820); wk(170, 780); ns(300, 850, 3); ns(460, 760, 1); S(320, 960, 2);
  sl(110, 530, 620, 670); S(320, 600, 2);
  sd(220, 480); sd(420, 420); wk(330, 520); wk(190, 380); S(320, 450, 3);
  const r = rng(77); for (let i = 0; i < 34; i++) L.decor.push({ x: VC.L + 20 + r() * 380, y: 320 + r() * 2150, k: 4 + Math.floor(r() * 7) });
  L.flag = { x: 470, y: L.sillY };
  return L;
}"""

vert_rep = """function buildVertLevel() {
  const L = { len: 120, vertical: true, worldH: 8000, groundY: 7960, sillY: 250, slick: [], nests: [], termites: [], sugar: [], decor: [], flag: null, babies: [] };
  const S = (x, y, n = 1, dx = 0, dy = -28) => { for (let i = 0; i < n; i++) L.sugar.push({ x: x + dx * i, y: y + dy * i }); };
  const wk = (x, y) => L.termites.push({ type: 'worker', x, y }), sd = (x, y) => L.termites.push({ type: 'soldier', x, y });
  const ns = (x, y, k) => L.nests.push({ x, y, k }), sl = (x0, x1, y0, y1) => L.slick.push({ x0, x1, y0, y1 });
  const bb = (x, y) => L.babies.push({ x, y, got: false, bob: Math.random() * 6 });

  // Andar 1 (7960 -> 5400)
  S(320, 7840, 4); wk(250, 7700); wk(420, 7640);
  ns(220, 7480, 0); sd(430, 7400); S(400, 7550, 3);
  sl(110, 430, 7230, 7280); S(482, 7305, 4);
  wk(200, 7120); wk(330, 7060); wk(460, 7120); ns(420, 7000, 1);
  sl(110, 530, 6820, 6870); S(320, 6800, 3);
  sd(200, 6700); sd(440, 6600); ns(180, 6650, 2);
  bb(180, 6200); S(180, 6260, 4);
  sl(110, 320, 6480, 6520); sl(320, 530, 6390, 6430); S(420, 6510, 3);

  // Andar 2 (5400 -> 2800)
  wk(250, 5300); wk(380, 5270); wk(470, 5220); ns(300, 5250, 3); S(320, 5360, 3);
  sl(110, 530, 5020, 5070); S(320, 5000, 3);
  sd(220, 4880); sd(420, 4820); wk(330, 4920); ns(450, 4760, 1);
  sl(110, 400, 4520, 4570); S(470, 4550, 4);
  bb(450, 4100); S(450, 4160, 4);
  wk(220, 4300); wk(380, 4200); ns(200, 4050, 2);
  sl(240, 530, 3820, 3870); S(180, 3850, 4);
  sd(280, 3600); sd(430, 3500); ns(320, 3400, 0);

  // Andar 3 (2800 -> 250)
  wk(200, 2700); wk(440, 2650); S(320, 2700, 4);
  sl(110, 530, 2420, 2470); S(320, 2400, 3);
  sd(250, 2200); sd(400, 2150); ns(220, 2080, 3);
  bb(200, 1500); S(200, 1560, 4);
  sl(110, 350, 1800, 1850); sl(300, 530, 1600, 1650); S(320, 1700, 4);
  wk(260, 1300); wk(420, 1250); ns(340, 1150, 1);
  sl(110, 530, 950, 1000); S(320, 900, 4);
  sd(220, 750); sd(440, 700); S(320, 600, 4);

  const r = rng(77);
  for (let i = 0; i < 90; i++) L.decor.push({ x: VC.L + 20 + r() * 380, y: 320 + r() * 7500, k: 4 + Math.floor(r() * 7) });
  L.flag = { x: 470, y: L.sillY };
  return L;
}"""
assert vert_target in s, "vert_target not found"
s = s.replace(vert_target, vert_rep, 1)

# 6. INJECT updateLevelGimmicks AND MOVER COLLIDE EXTENSION
old_mover_collide = """function moverCollide(prevB) {
  const M = G.movers; if (!M || G.deadT > 0) return;
  for (const m of M) {
    if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped && P.vy > 0) { const top = m.y - m.r * (m.grow ?? 1); if (Math.abs(P.x - m.x) < m.r + 7 && prevB <= top + 8 && P.y >= top - 2) { P.y = top; popBub(m, true); return; } }
    if (m.kind === 'foam' && m.on && P.vy >= 0 && P.x > m.x0 - 4 && P.x < m.x1 + 4 && prevB <= m.y + 2 && P.y >= m.y) { P.y = m.y; P.vy = 0; P.ground = true; }
  }
}"""

new_mover_collide = """function moverCollide(prevB) {
  const M = G.movers;
  if (M && G.deadT <= 0) {
    for (const m of M) {
      if ((m.kind === 'bub' || m.kind === 'sw') && !m.popped && P.vy > 0) { const top = m.y - m.r * (m.grow ?? 1); if (Math.abs(P.x - m.x) < m.r + 7 && prevB <= top + 8 && P.y >= top - 2) { P.y = top; popBub(m, true); return; } }
      if (m.kind === 'foam' && m.on && P.vy >= 0 && P.x > m.x0 - 4 && P.x < m.x1 + 4 && prevB <= m.y + 2 && P.y >= m.y) { P.y = m.y; P.vy = 0; P.ground = true; }
    }
  }
  if (G.crumbs && G.deadT <= 0) {
    for (const c of G.crumbs) {
      if (!c.dead && P.vy >= 0 && P.x >= c.x - 4 && P.x <= c.x + c.w + 4 && prevB <= c.y + 2 && P.y >= c.y) {
        P.y = c.y; P.vy = 0; P.ground = true;
      }
    }
  }
}
function updateLevelGimmicks(dt) {
  if (G.deadT > 0) return;
  // springs
  if (G.springs) {
    for (const s of G.springs) {
      if (s.squish > 0) s.squish -= dt;
      if (Math.abs(P.x - s.x) < 18 && P.y >= s.y - 14 && P.y <= s.y + 10 && P.vy >= 0) {
        P.vy = -s.power; P.ground = false; P.airDash = true; P.jumps = 1; P.sx = 0.65; P.sy = 1.45;
        s.squish = 0.3; SFX.spring(); ring(s.x, s.y - 4, '#ff8ae0'); dust(s.x, s.y, 6);
      }
    }
  }
  // checkpoints
  if (G.checkpoints) {
    for (const cp of G.checkpoints) {
      if (!cp.active && Math.abs(P.x - cp.x) < 22 && Math.abs(P.y - cp.y) < 34) {
        cp.active = true; CHK = { i: G.i, x: cp.x, y: cp.y }; P.hp = Math.min(MAXHP, P.hp + 2);
        SFX.heal(); floatText('CHECKPOINT!', cp.x, cp.y - 40, '#ffe45a', 2); confettiSmall(cp.x, cp.y - 25);
      }
    }
  }
  // baby ants
  if (G.babies) {
    for (const b of G.babies) {
      if (b.got) continue;
      if (Math.abs(P.x - b.x) < 20 && Math.abs(P.y - 16 - b.y) < 24) {
        b.got = true; G.babiesGot = (G.babiesGot || 0) + 1; G.score += 500;
        SFX.fanfare(); floatText('BEBÊ RESGATADO! (' + G.babiesGot + '/3)', b.x, b.y - 28, '#ffe45a', 2);
        confetti(b.x, b.y - 16, 25);
      }
    }
  }
  // crumbs
  if (G.crumbs) {
    for (const c of G.crumbs) {
      if (c.dead) { c.resp -= dt; if (c.resp <= 0) { c.dead = false; c.shake = 0; } continue; }
      const onTop = P.ground && P.x >= c.x - 4 && P.x <= c.x + c.w + 4 && Math.abs(P.y - c.y) < 6;
      if (onTop) {
        c.shake += dt;
        if (c.shake > 0.65) {
          c.dead = true; c.resp = 3.0; SFX.land();
          for (let i = 0; i < 8; i++) parts.push({ x: c.x + rnd(0, c.w), y: c.y, vx: rnd(-30, 30), vy: rnd(20, 100), life: 0.5, max: 0.5, c: '#a27040', sz: 2, g: 300, k: 'sq' });
        }
      } else if (c.shake > 0) c.shake = Math.max(0, c.shake - dt * 0.5);
    }
  }
  // switches
  if (G.switches) {
    for (const sw of G.switches) {
      if (sw.timer > 0) {
        sw.timer -= dt;
        if (sw.timer <= 0) {
          sw.on = false;
          for (let xx = sw.gx; xx < sw.gx + sw.gw; xx++) for (let yy = ROWS - sw.gh - sw.ghh; yy < ROWS - sw.gh; yy++) G.L.grid[yy][xx] = 1;
          SFX.tick();
        }
      }
      const pf = P.punchT >= 0 ? Math.floor(P.punchT / .28 * 8) : -1;
      if (!sw.on && pf >= 1 && pf <= 5 && Math.abs(P.x + P.dir * 16 - sw.x) < 22 && Math.abs(P.y - 18 - sw.y) < 22) {
        sw.on = true; sw.timer = 7.0;
        for (let xx = sw.gx; xx < sw.gx + sw.gw; xx++) for (let yy = ROWS - sw.gh - sw.ghh; yy < ROWS - sw.gh; yy++) G.L.grid[yy][xx] = 0;
        SFX.powerup(); fx.flash = .1; floatText('PORTÃO ABERTO! (7s)', sw.x, sw.y - 24, '#7ff0ff', 2);
      }
    }
  }
  // secrets
  if (G.secrets) {
    const pBox = { l: P.x + (P.dir > 0 ? 0 : -26), r: P.x + (P.dir > 0 ? 26 : 0), t: P.y - 32, b: P.y };
    for (const s of G.secrets) {
      if (s.broken) continue;
      const sx0 = s.x0 * T, sx1 = (s.x0 + s.w) * T, sy0 = (ROWS - s.hb - s.hh) * T, sy1 = (ROWS - s.hb) * T;
      const hit = pBox.r > sx0 && pBox.l < sx1 && pBox.b > sy0 && pBox.t < sy1;
      if (hit && (P.punchT >= 0 || P.boost > 0) && (s.hitId !== P.punchId || P.boost > 0)) {
        s.hitId = P.punchId; s.hp -= P.boost > 0 ? 3 : 1;
        SFX.hit(); fx.shake = 3; hitSpark(P.x + P.dir * 14, P.y - 18, '#ffe45a');
        for (let i = 0; i < 6; i++) parts.push({ x: rnd(sx0, sx1), y: rnd(sy0, sy1), vx: rnd(-60, 60), vy: rnd(-100, -20), life: .4, max: .4, c: '#a26630', sz: 2, g: 300, k: 'sq' });
        if (s.hp <= 0) {
          s.broken = true;
          for (let xx = s.x0; xx < s.x0 + s.w; xx++) for (let yy = ROWS - s.hb - s.hh; yy < ROWS - s.hb; yy++) G.L.grid[yy][xx] = 0;
          SFX.boom(); fx.shake = 6; floatText('SEGREDO!', s.x, sy0 - 12, '#ffe45a', 2); confettiSmall(s.x, sy0);
        }
      }
    }
  }
}"""
assert old_mover_collide in s, "old_mover_collide not found"
s = s.replace(old_mover_collide, new_mover_collide, 1)

# 7. CALL updateLevelGimmicks IN updatePlayer
up_target = "  if (G.movers) moverCollide(prevB);"
up_rep = "  moverCollide(prevB);\n  updateLevelGimmicks(dt);"
assert up_target in s, "up_target not found"
s = s.replace(up_target, up_rep, 1)

# 8. DRAW GIMMICKS IN drawPlay
draw_target = "  if (G.movers) drawBath(cx, cy);"
draw_rep = """  if (G.movers) drawBath(cx, cy);
  // checkpoints
  if (G.checkpoints) {
    for (const cp of G.checkpoints) {
      const x = Math.round(cp.x - cx), y = Math.round(cp.y - cy);
      if (x < -30 || x > W + 30) continue;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 2, y - 28, 5, 28);
      ctx.fillStyle = '#9a6030'; ctx.fillRect(x - 1, y - 27, 3, 27);
      const fCol = cp.active ? '#3b9eff' : '#605568';
      const bCol = cp.active ? '#7fd0ff' : '#887d90';
      const wave = cp.active ? Math.sin(gtime * 6) * 3 : 0;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x + 2, y - 26, 12, 9);
      ctx.fillStyle = fCol; ctx.fillRect(x + 2, y - 25, 10, 7);
      ctx.fillStyle = bCol; ctx.fillRect(x + 3, y - 24 + wave * 0.3, 4, 3);
    }
  }
  // springs
  if (G.springs) {
    for (const sp of G.springs) {
      const x = Math.round(sp.x - cx), y = Math.round(sp.y - cy);
      if (x < -30 || x > W + 30) continue;
      const sq = sp.squish > 0 ? (sp.squish / .3) : 0;
      const sh = 10 * (1 - sq * .6);
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 7, y - sh - 2, 14, sh + 2);
      ctx.fillStyle = '#f09020'; ctx.fillRect(x - 6, y - sh - 1, 12, sh);
      ctx.fillStyle = '#ffe050'; ctx.fillRect(x - 4, y - sh, 8, 2);
      ctx.fillRect(x - 2, y - sh / 2, 4, 2);
    }
  }
  // baby ants
  if (G.babies) {
    for (const b of G.babies) {
      if (b.got) continue;
      const x = Math.round(b.x - cx), y = Math.round(b.y - cy + Math.sin(gtime * 4 + b.bob) * 3);
      if (x < -30 || x > W + 30) continue;
      ctx.fillStyle = 'rgba(255,230,90,.3)'; ctx.beginPath(); ctx.arc(x, y - 8, 11, 0, 7); ctx.fill();
      ctx.drawImage(SPR.baby, x - 7, y - 14);
    }
  }
  // crumbs
  if (G.crumbs) {
    for (const c of G.crumbs) {
      if (c.dead) continue;
      const x0 = Math.round(c.x - cx), y = Math.round(c.y - cy);
      if (x0 + c.w < -10 || x0 > W + 10) continue;
      const shk = c.shake > 0 ? (Math.random() * 2 - 1) : 0;
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x0 - 1, y - 1 + shk, c.w + 2, 6);
      ctx.fillStyle = c.shake > .4 ? '#d08040' : '#8a9a40'; ctx.fillRect(x0, y + shk, c.w, 4);
      ctx.fillStyle = '#4a5020'; for (let xx = x0 + 4; xx < x0 + c.w - 2; xx += 8) ctx.fillRect(xx, y + 1 + shk, 2, 2);
    }
  }
  // switches and gates
  if (G.switches) {
    for (const sw of G.switches) {
      const x = Math.round(sw.x - cx), y = Math.round(sw.y - cy);
      if (x > -30 && x < W + 30) {
        ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 6, y - 14, 12, 14);
        ctx.fillStyle = sw.on ? '#7ff0ff' : '#ff4a7a'; ctx.fillRect(x - 4, y - 12, 8, 10);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 2, y - 10, 4, 3);
      }
      if (!sw.on) {
        const gx = Math.round(sw.gx * T - cx), gy = Math.round((ROWS - sw.gh - sw.ghh) * T - cy), gw = sw.gw * T, gh = sw.ghh * T;
        if (gx + gw > -10 && gx < W + 10) {
          ctx.fillStyle = '#1a1020'; ctx.fillRect(gx - 1, gy - 1, gw + 2, gh + 2);
          ctx.fillStyle = '#8a5028'; ctx.fillRect(gx, gy, gw, gh);
          ctx.fillStyle = '#c48040'; for (let yy = gy + 4; yy < gy + gh - 4; yy += 8) ctx.fillRect(gx + 2, yy, gw - 4, 2);
        }
      }
    }
  }"""
assert draw_target in s, "draw_target not found"
s = s.replace(draw_target, draw_rep, 1)

# 9. DRAW BABY IN HUD
hud_target = "  ctx.drawImage(SPR.sugar, 70, 10); text('×' + G.sugar, 83, 14);"
hud_rep = "  ctx.drawImage(SPR.sugar, 70, 10); text('×' + G.sugar, 83, 14);\n  ctx.drawImage(SPR.baby, 120, 8); text((G.babiesGot || 0) + '/3', 137, 14, { color: '#ffe45a' });"
assert hud_target in s, "hud_target not found"
s = s.replace(hud_target, hud_rep, 1)

# 10. UPDATE STARTCLEAR TO INCLUDE BABIES
clear_target = "  G.clear.rows = [['AÇÚCAR', G.sugar + '/' + G.sugarTotal], ['INIMIGOS', G.kills + '/' + G.enemiesTotal], ['COMBO MÁXIMO', '×' + G.maxCombo], ['TEMPO', fmtTime(time) + (timeBonus ? '  +' + timeBonus : '')]];"
clear_rep = "  G.clear.rows = [['AÇÚCAR', G.sugar + '/' + G.sugarTotal], ['BEBÊS SALVOS', (G.babiesGot || 0) + '/3'], ['INIMIGOS', G.kills + '/' + G.enemiesTotal], ['COMBO MÁXIMO', '×' + G.maxCombo], ['TEMPO', fmtTime(time) + (timeBonus ? '  +' + timeBonus : '')]];"
assert clear_target in s, "clear_target not found"
s = s.replace(clear_target, clear_rep, 1)

with open(DST, 'w', encoding='utf-8') as f:
    f.write(s)

print("Game expansion completed successfully!")
