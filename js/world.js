// The map: a stylized, top-down Côte Saint-Luc at night. Tiles are 32px.
const TILE = 32, MAP_W = 140, MAP_H = 100;
const T = {
  GRASS: 0, ROAD: 1, WALK: 2, BUILDING: 3, TREE: 4, WATER: 5, LOT: 6, RAIL: 7, GRAVEL: 8,
  PLAZA: 9, FENCE: 10, DRIVE: 11, HOUSE: 12, GATE: 13, BOXCAR: 14, CONCRETE: 15, ICE: 16, BOARDS: 17,
};
const SOLID = new Set([T.BUILDING, T.TREE, T.WATER, T.FENCE, T.HOUSE, T.BOXCAR, T.BOARDS]);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const BASE_RGB = {
  [T.GRASS]: [44, 72, 46], [T.ROAD]: [38, 40, 47], [T.WALK]: [100, 103, 110], [T.BUILDING]: [50, 50, 56],
  [T.TREE]: [44, 72, 46], [T.WATER]: [36, 118, 176], [T.LOT]: [50, 52, 58], [T.RAIL]: [84, 78, 70],
  [T.GRAVEL]: [84, 78, 70], [T.PLAZA]: [118, 112, 108], [T.FENCE]: [70, 70, 66], [T.DRIVE]: [84, 86, 92],
  [T.HOUSE]: [44, 72, 46], [T.GATE]: [84, 78, 70], [T.BOXCAR]: [84, 78, 70], [T.CONCRETE]: [142, 142, 146],
  [T.ICE]: [196, 226, 240], [T.BOARDS]: [230, 230, 235],
};
const MINI_RGB = {
  [T.GRASS]: '#cfe8c5', [T.ROAD]: '#ffffff', [T.WALK]: '#ececec', [T.BUILDING]: '#d6cfc6', [T.TREE]: '#a9d69a',
  [T.WATER]: '#9fd3f5', [T.LOT]: '#e2e2e2', [T.RAIL]: '#a99f92', [T.GRAVEL]: '#d6cdbf', [T.PLAZA]: '#e6dfd6',
  [T.FENCE]: '#9a9a9a', [T.DRIVE]: '#e6e6e6', [T.HOUSE]: '#e0d4c4', [T.GATE]: '#f2c200', [T.BOXCAR]: '#b5654a',
  [T.CONCRETE]: '#e9e9e9', [T.ICE]: '#e6f6ff', [T.BOARDS]: '#c8102e',
};

const World = {
  tiles: new Uint8Array(MAP_W * MAP_H),
  colors: [],
  gateOpen: false,
  party: false,
  roads: [], buildings: [], houses: [], boxcars: [], lamps: [], labels: [], ramps: [],
  points: {},
  regions: {},
  mini: null,

  get(tx, ty) { if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return T.FENCE; return this.tiles[ty * MAP_W + tx]; },
  set(tx, ty, v) { if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return; this.tiles[ty * MAP_W + tx] = v; },
  fill(x, y, w, h, v) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, v); },
  solidTile(tx, ty) { const t = this.get(tx, ty); if (t === T.GATE) return !this.gateOpen; return SOLID.has(t); },
  tileAt(px, py) { return this.get(Math.floor(px / TILE), Math.floor(py / TILE)); },

  addBuilding(x, y, w, h, color, roof, label, opts = {}) {
    this.fill(x, y, w, h, T.BUILDING);
    this.buildings.push({ x, y, w, h, color, roof, label, ...opts });
  },
  addHouse(x, y, w, h, front, num, roof) {
    this.fill(x, y, w, h, T.HOUSE);
    this.houses.push({ x, y, w, h, front, num, roof, home: num === '5911' });
  },

  build() {
    const R = mulberry32(5911);
    this.fill(0, 0, MAP_W, MAP_H, T.GRASS);

    // --- Streets (real Côte Saint-Luc names, layout is stylized) ---
    this.roads = [
      { x: 60, y: 0, w: 4, h: 82, name: 'BOUL. CAVENDISH', v: true },
      { x: 112, y: 0, w: 3, h: 82, name: 'AV. WESTMINSTER', v: true },
      { x: 0, y: 8, w: 140, h: 4, name: 'CH. DE LA CÔTE-SAINT-LUC', v: false },
      { x: 0, y: 46, w: 140, h: 3, name: 'CH. KILDARE', v: false },
      { x: 3, y: 74, w: 57, h: 3, name: 'BRANDEIS', v: false },
      { x: 64, y: 29, w: 48, h: 3, name: 'CH. GUELPH', v: false },
    ];
    for (const r of this.roads) this.fill(r.x - 1, r.y - 1, r.w + 2, r.h + 2, T.WALK);
    for (const r of this.roads) this.fill(r.x, r.y, r.w, r.h, T.ROAD);

    // --- Parc + Centre aquatique + skatepark ---
    this.fill(5, 26, 54, 2, T.WALK);
    this.fill(14, 13, 2, 3, T.WALK);
    this.fill(44, 41, 2, 4, T.WALK);
    this.addBuilding(7, 16, 15, 8, '#2f5873', '#46799b', 'CENTRE AQUATIQUE');
    this.fill(23, 15, 12, 10, T.CONCRETE);
    this.fill(24, 16, 10, 8, T.WATER);
    this.fill(37, 28, 17, 13, T.CONCRETE);
    this.ramps = [
      { x: 39, y: 30, w: 3, h: 2 }, { x: 48, y: 30, w: 4, h: 2 }, { x: 43, y: 35, w: 4, h: 1, rail: true },
      { x: 39, y: 37, w: 2, h: 3 }, { x: 50, y: 36, w: 2, h: 3 },
    ];

    // --- School + outdoor rink (patinoire) ---
    this.addBuilding(5, 52, 20, 10, '#5b3d30', '#7d5a48', 'ÉCOLE SECONDAIRE');
    this.fill(14, 50, 2, 2, T.WALK);
    this.fill(32, 52, 24, 12, T.BOARDS);
    this.fill(33, 53, 22, 10, T.ICE);
    this.fill(43, 50, 2, 3, T.WALK);
    this.set(43, 52, T.ICE); this.set(44, 52, T.ICE);

    // --- Brandeis: houses on both sides. North side = odd numbers. 5911 is lot #5 ---
    const roofs = ['#5b3b33', '#3d4a5c', '#4c4c4c', '#6a5640', '#38433a', '#5a4660'];
    for (let i = 0; i < 7; i++) {
      const x = 6 + i * 7;
      this.addHouse(x, 67, 5, 5, 's', String(5901 + i * 2), roofs[i % 6]);
      this.fill(x + 5, 68, 2, 5, T.DRIVE);
      this.addHouse(x, 79, 5, 3, 'n', String(5900 + i * 2), roofs[(i + 3) % 6]);
      this.fill(x + 5, 78, 2, 4, T.DRIVE);
    }

    // --- Guelph houses ---
    for (let i = 0; i < 5; i++) {
      const x = 67 + i * 7;
      this.addHouse(x, 22, 5, 5, 's', '', roofs[(i + 1) % 6]);
      this.fill(x + 5, 23, 2, 5, T.DRIVE);
      this.addHouse(x, 33, 5, 5, 'n', '', roofs[(i + 4) % 6]);
      this.fill(x + 5, 33, 2, 5, T.DRIVE);
    }
    // --- Houses along the north side of Côte-Saint-Luc Rd ---
    for (let x = 2; x + 6 < 139; x += 7) {
      if ((x + 6 >= 58 && x <= 65) || (x + 6 >= 110 && x <= 116)) continue;
      this.addHouse(x, 1, 5, 5, 's', '', roofs[(x / 7 | 0) % 6]);
      this.fill(x + 5, 2, 2, 5, T.DRIVE);
    }

    // --- Cavendish Mall ---
    this.fill(65, 50, 38, 23, T.LOT);
    this.fill(72, 64, 27, 3, T.PLAZA);
    this.addBuilding(72, 53, 27, 11, '#3a3f4b', '#565d6e', 'CAVENDISH MALL', { big: true });
    this.addBuilding(70, 74, 16, 7, '#33465a', '#4b6580', 'ARÉNA');

    // --- Westminster shops ---
    const shopColors = ['#7a2e2e', '#2e5a7a', '#5a7a2e', '#7a5a2e', '#5a2e7a', '#2e7a6a', '#7a2e5a', '#4a4a4a'];
    const west = [[14, 6, 'DÉPANNEUR'], [21, 6, 'BAGELS'], [34, 5, 'PHARMACIE'], [40, 5, 'BARBIER'],
      [51, 6, 'POUTINERIE'], [58, 6, 'PIZZA'], [65, 6, 'SNEAKERS'], [72, 7, 'NETTOYEUR']];
    west.forEach(([y, h, name], i) => this.addBuilding(104, y, 7, h, shopColors[i % 8], null, name, { shop: true }));
    const east = [[14, 6, 'CAFÉ'], [21, 7, 'SUSHI'], [29, 7, 'FLEURISTE'], [37, 8, 'BANQUE'],
      [51, 7, 'DÉPANNEUR 24H'], [74, 7, 'ÉLECTRONIQUE']];
    east.forEach(([y, h, name], i) => this.addBuilding(116, y, 9, h, shopColors[(i + 3) % 8], null, name, { shop: true }));
    this.addBuilding(127, 14, 10, 14, '#2b2f3a', '#3c4252', 'CONDOS');
    this.addBuilding(127, 30, 10, 14, '#2f2b3a', '#433c52', 'TOUR');
    // The Kings' hideout: alley behind the dépanneur
    this.fill(116, 59, 9, 14, T.PLAZA);
    this.addBuilding(126, 54, 10, 20, '#3a1d22', '#52282f', 'KINGS HQ', { kings: true });

    // --- CP rail yard (locked until you get the gate code) ---
    this.fill(0, 82, MAP_W, 1, T.FENCE);
    this.fill(1, 83, MAP_W - 2, 16, T.GRAVEL);
    for (const ry of [86, 91, 96]) this.fill(1, ry, MAP_W - 2, 1, T.RAIL);
    this.fill(112, 82, 3, 1, T.GATE);
    const boxColors = ['#8a3b2a', '#2a4f8a', '#5c5c5c', '#8a6a2a', '#3b6b3b'];
    [[72, 85, 8], [90, 90, 8], [118, 85, 8], [100, 95, 8], [128, 90, 7], [80, 95, 6], [20, 90, 9], [40, 85, 9], [8, 95, 8]]
      .forEach(([x, y, w], i) => { this.fill(x, y, w, 2, T.BOXCAR); this.boxcars.push({ x, y, w, h: 2, color: boxColors[i % 5] }); });

    // --- Map border ---
    this.fill(0, 0, MAP_W, 1, T.FENCE); this.fill(0, MAP_H - 1, MAP_W, 1, T.FENCE);
    this.fill(0, 0, 1, MAP_H, T.FENCE); this.fill(MAP_W - 1, 0, 1, MAP_H, T.FENCE);

    // --- Trees: only on open grass, never touching paths or houses ---
    const inPark = (x, y) => x >= 4 && x <= 57 && y >= 14 && y <= 43;
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      if (this.get(x, y) !== T.GRASS) continue;
      let ok = true;
      for (let j = -1; j <= 1 && ok; j++) for (let i = -1; i <= 1; i++) {
        const n = this.get(x + i, y + j);
        if (n !== T.GRASS && n !== T.TREE && n !== T.FENCE) { ok = false; break; }
      }
      if (ok && R() < (inPark(x, y) ? 0.08 : 0.035)) this.set(x, y, T.TREE);
    }

    // --- Street lamps ---
    const lamp = (tx, ty) => { if (this.get(tx, ty) === T.WALK) this.lamps.push({ x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE }); };
    for (const r of this.roads) {
      if (r.v) for (let y = r.y + 3; y < r.y + r.h; y += 8) { lamp(r.x - 1, y); lamp(r.x + r.w, y + 4); }
      else for (let x = r.x + 3; x < r.x + r.w; x += 8) { lamp(x, r.y - 1); lamp(x + 4, r.y + r.h); }
    }
    for (let x = 68; x <= 100; x += 8) { this.lamps.push({ x: x * TILE, y: 51 * TILE }); this.lamps.push({ x: x * TILE, y: 71 * TILE }); }
    [[60, 84], [84, 84], [106, 88], [124, 97], [30, 88], [112, 93]].forEach(([x, y]) => this.lamps.push({ x: x * TILE, y: y * TILE, flood: true }));
    this.lamps.push({ x: 45 * TILE, y: 29 * TILE }, { x: 45 * TILE, y: 39.5 * TILE }, { x: 120 * TILE, y: 60 * TILE }, { x: 120 * TILE, y: 71 * TILE });

    // --- Labels painted on the map ---
    for (const r of this.roads) {
      if (r.v) for (let y = r.y + 6; y < r.y + r.h - 4; y += 30) this.labels.push({ x: (r.x + r.w / 2) * TILE, y: y * TILE, text: r.name, rot: -Math.PI / 2, size: 13, color: 'rgba(255,255,255,0.45)' });
      else for (let x = r.x + 12; x < r.x + r.w - 6; x += 34) this.labels.push({ x: x * TILE, y: (r.y + r.h / 2) * TILE + 5, text: r.name, rot: 0, size: 13, color: 'rgba(255,255,255,0.45)' });
    }
    this.labels.push(
      { x: 30 * TILE, y: 37 * TILE, text: 'PARC', size: 30, color: 'rgba(255,255,255,0.16)' },
      { x: 45.5 * TILE, y: 28.6 * TILE, text: 'SKATEPARK', size: 13, color: 'rgba(30,30,30,0.6)' },
      { x: 44 * TILE, y: 58.3 * TILE, text: 'PATINOIRE', size: 20, color: 'rgba(30,70,140,0.45)' },
      { x: 84 * TILE, y: 71.4 * TILE, text: 'STATIONNEMENT', size: 14, color: 'rgba(255,255,255,0.3)' },
      { x: 113.5 * TILE, y: 84.4 * TILE, text: 'CP RAIL · DÉFENSE DE PASSER', size: 12, color: 'rgba(255,220,80,0.8)' },
      { x: 120.5 * TILE, y: 68 * TILE, text: 'KINGS 👑', size: 26, color: 'rgba(229,48,61,0.75)', rot: -0.15 },
      { x: 20 * TILE, y: 42 * TILE, text: 'CÔTE SAINT-LUC', size: 22, color: 'rgba(255,255,255,0.12)' },
    );

    // --- Key places ---
    this.points = {
      home: { x: 43.5 * TILE, y: 72.2 * TILE },
      spawn: { x: 43.5 * TILE, y: 72.7 * TILE },
      truck: { x: 47 * TILE, y: 70.2 * TILE, a: Math.PI / 2 },
      mall: { x: 85 * TILE, y: 68.5 * TILE },
      skatepark: { x: 45 * TILE, y: 34 * TILE },
      hideout: { x: 120 * TILE, y: 65 * TILE },
      gate: { x: 113.5 * TILE, y: 82.5 * TILE },
      arena: { x: 105 * TILE, y: 88.5 * TILE },
      poutine: { x: 111.5 * TILE, y: 54 * TILE },
      bagel: { x: 111.5 * TILE, y: 24 * TILE },
    };
    this.regions = {
      park: { x: 6, y: 28, w: 30, h: 13 },
      guelph: { x: 66, y: 28, w: 44, h: 5 },
      mall: { x: 66, y: 50, w: 36, h: 22 },
      westminster: { x: 111, y: 14, w: 5, h: 66 },
      yard: { x: 5, y: 84, w: 50, h: 13 },
    };

    // --- Precomputed tile colors (with a little per-tile noise) ---
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      const t = this.get(x, y);
      const c = BASE_RGB[t];
      const v = (hash2(x, y) - 0.5) * (t === T.GRASS || t === T.TREE || t === T.HOUSE ? 14 : 6);
      this.colors[y * MAP_W + x] = `rgb(${c[0] + v | 0},${c[1] + v | 0},${c[2] + v | 0})`;
    }
    this.buildMinimap();
  },

  buildMinimap() {
    const c = document.createElement('canvas');
    c.width = MAP_W; c.height = MAP_H;
    const g = c.getContext('2d');
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      g.fillStyle = MINI_RGB[this.get(x, y)];
      g.fillRect(x, y, 1, 1);
    }
    this.mini = c;
  },

  randomOpen(region, R = Math.random) {
    for (let k = 0; k < 80; k++) {
      const tx = region ? region.x + Math.floor(R() * region.w) : 1 + Math.floor(R() * (MAP_W - 2));
      const ty = region ? region.y + Math.floor(R() * region.h) : 1 + Math.floor(R() * (MAP_H - 2));
      const t = this.get(tx, ty);
      if (SOLID.has(t) || t === T.GATE) continue;
      if (!region && ty >= 83 && !this.gateOpen) continue;
      return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
    }
    return null;
  },

  // ---------------- Drawing ----------------
  draw(ctx, v, time) {
    const x0 = Math.max(0, Math.floor(v.x / TILE)), y0 = Math.max(0, Math.floor(v.y / TILE));
    const x1 = Math.min(MAP_W - 1, Math.floor((v.x + v.w) / TILE)), y1 = Math.min(MAP_H - 1, Math.floor((v.y + v.h) / TILE));

    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      ctx.fillStyle = this.colors[y * MAP_W + x];
      ctx.fillRect(x * TILE, y * TILE, TILE + 0.5, TILE + 0.5);
    }

    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const t = this.get(x, y), px = x * TILE, py = y * TILE;
      switch (t) {
        case T.WALK:
          ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(px, py, TILE, 1); ctx.fillRect(px, py, 1, TILE);
          break;
        case T.WATER: {
          const o = Math.sin(time * 2 + x * 0.8 + y) * 4;
          ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(px + 5, py + 12 + o); ctx.lineTo(px + 18, py + 12 + o); ctx.stroke();
          break;
        }
        case T.RAIL:
          ctx.fillStyle = '#4a3a2c';
          for (let k = 0; k < 4; k++) ctx.fillRect(px + k * 8 + 1, py + 3, 4, 26);
          ctx.fillStyle = '#b9bcc2'; ctx.fillRect(px, py + 8, TILE, 3); ctx.fillRect(px, py + 21, TILE, 3);
          break;
        case T.FENCE:
          ctx.fillStyle = '#8d939a'; ctx.fillRect(px, py + 13, TILE, 3); ctx.fillRect(px + 14, py + 5, 4, 22);
          ctx.strokeStyle = 'rgba(190,195,200,0.35)'; ctx.lineWidth = 1;
          ctx.beginPath();
          for (let k = -TILE; k < TILE; k += 8) { ctx.moveTo(px + k, py + 6); ctx.lineTo(px + k + 20, py + 26); ctx.moveTo(px + k + 20, py + 6); ctx.lineTo(px + k, py + 26); }
          ctx.stroke();
          break;
        case T.GATE:
          if (!this.gateOpen) for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#f2c200' : '#111'; ctx.fillRect(px + k * 8, py + 10, 8, 12); }
          break;
        case T.LOT:
          if (x % 3 === 0 && y % 6 !== 0 && y > 50 && y < 72) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(px, py + 4, 2, 24); }
          break;
        case T.ICE:
          if (hash2(x, y) > 0.6) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px + 16, py + 16, 10 + hash2(y, x) * 10, 0.2, 1.6); ctx.stroke(); }
          if (x === 44 && (y === 57 || y === 58)) { ctx.fillStyle = 'rgba(200,16,46,0.7)'; ctx.fillRect(px, py, 2, TILE); }
          break;
        case T.BOARDS:
          ctx.fillStyle = '#f4f4f6'; ctx.fillRect(px + 3, py + 3, 26, 26);
          ctx.fillStyle = '#c8102e'; ctx.fillRect(px + 3, py + 14, 26, 3);
          break;
        case T.DRIVE:
          ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(px, py, 1, TILE);
          break;
      }
    }

    // Road center dashes
    ctx.save();
    ctx.strokeStyle = 'rgba(240,200,60,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([18, 14]);
    for (const r of this.roads) {
      if (r.x * TILE > v.x + v.w || (r.x + r.w) * TILE < v.x || r.y * TILE > v.y + v.h || (r.y + r.h) * TILE < v.y) continue;
      ctx.beginPath();
      if (r.v) { const cx = (r.x + r.w / 2) * TILE; ctx.moveTo(cx, r.y * TILE); ctx.lineTo(cx, (r.y + r.h) * TILE); }
      else { const cy = (r.y + r.h / 2) * TILE; ctx.moveTo(r.x * TILE, cy); ctx.lineTo((r.x + r.w) * TILE, cy); }
      ctx.stroke();
    }
    ctx.restore();

    const vis = (o) => !((o.x + o.w) * TILE < v.x - 40 || o.x * TILE > v.x + v.w + 40 || (o.y + o.h) * TILE < v.y - 40 || o.y * TILE > v.y + v.h + 40);

    for (const r of this.ramps) if (vis(r)) this.drawRamp(ctx, r);
    for (const b of this.boxcars) if (vis(b)) this.drawBoxcar(ctx, b);
    for (const h of this.houses) if (vis(h)) this.drawHouse(ctx, h, time);
    for (const b of this.buildings) if (vis(b)) this.drawBuilding(ctx, b);

    // Lamp posts
    ctx.fillStyle = '#222';
    for (const l of this.lamps) {
      if (l.x < v.x - 20 || l.x > v.x + v.w + 20 || l.y < v.y - 20 || l.y > v.y + v.h + 20) continue;
      ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Trees (canopy with a dusting of first snow)
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (this.get(x, y) !== T.TREE) continue;
      const cx = x * TILE + 16, cy = y * TILE + 16, s = 0.85 + hash2(x, y) * 0.35;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx + 4, cy + 6, 16 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1f3d26'; ctx.beginPath(); ctx.arc(cx, cy, 16 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2c5634'; ctx.beginPath(); ctx.arc(cx - 3, cy - 4, 11 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(240,248,255,0.55)';
      ctx.beginPath(); ctx.arc(cx - 6, cy - 8, 3.5 * s, 0, Math.PI * 2); ctx.arc(cx + 3, cy - 10, 2.5 * s, 0, Math.PI * 2); ctx.arc(cx - 1, cy - 2, 2 * s, 0, Math.PI * 2); ctx.fill();
    }

    // Labels
    for (const l of this.labels) {
      if (l.x < v.x - 300 || l.x > v.x + v.w + 300 || l.y < v.y - 300 || l.y > v.y + v.h + 300) continue;
      ctx.save(); ctx.translate(l.x, l.y); if (l.rot) ctx.rotate(l.rot);
      ctx.font = `800 ${l.size}px Inter, Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = l.color; ctx.fillText(l.text, 0, 0);
      ctx.restore();
    }
  },

  drawRamp(ctx, r) {
    const px = r.x * TILE, py = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
    if (r.rail) {
      ctx.fillStyle = '#555'; ctx.fillRect(px, py + 12, w, 8);
      ctx.fillStyle = '#d0d4da'; ctx.fillRect(px, py + 12, w, 3);
      return;
    }
    const g = ctx.createLinearGradient(px, py, px, py + h);
    g.addColorStop(0, '#6d6f74'); g.addColorStop(1, '#b4b6ba');
    ctx.fillStyle = g; ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#d6d9de'; ctx.fillRect(px, py, w, 3);
  },

  drawBoxcar(ctx, b) {
    const px = b.x * TILE, py = b.y * TILE, w = b.w * TILE, h = b.h * TILE;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px + 6, py + 6, w, h);
    ctx.fillStyle = b.color; ctx.fillRect(px, py, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let x = px + 8; x < px + w; x += 12) ctx.fillRect(x, py, 2, h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(px, py + h / 2 - 1, w, 2);
    ctx.font = '900 16px Inter, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CP', px + w / 2, py + h / 2);
  },

  drawHouse(ctx, h, time) {
    const px = h.x * TILE, py = h.y * TILE, w = h.w * TILE, hh = h.h * TILE;
    ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(px + 7, py + 7, w, hh);
    ctx.fillStyle = h.roof; ctx.fillRect(px, py, w, hh);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(px, py, w, hh / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px, py + hh / 2 - 1, w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = py + 6; y < py + hh; y += 7) ctx.fillRect(px, y, w, 1);
    ctx.fillStyle = '#3a2a24'; ctx.fillRect(px + w - 26, py + 8, 10, 10);
    // door + number plate on the street side
    const dy = h.front === 's' ? py + hh - 3 : py - 3;
    ctx.fillStyle = '#2a1c14'; ctx.fillRect(px + w / 2 - 8, dy, 16, 6);
    // windows glowing
    ctx.fillStyle = 'rgba(255,214,120,0.85)';
    const wy = h.front === 's' ? py + hh - 4 : py;
    ctx.fillRect(px + 12, wy, 14, 4); ctx.fillRect(px + w - 26, wy, 14, 4);
    if (h.num) {
      const ny = h.front === 's' ? py + hh + 12 : py - 12;
      ctx.font = `800 ${h.home ? 15 : 10}px Inter, Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (h.home) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(px + w / 2 - 26, ny - 10, 52, 20);
        ctx.strokeStyle = '#dfe3e8'; ctx.lineWidth = 1.5; ctx.strokeRect(px + w / 2 - 26, ny - 10, 52, 20);
        ctx.fillStyle = '#ffffff';
      } else ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(h.num, px + w / 2, ny + 1);
    }
    if (h.home && this.party) {
      const cols = ['#ff3b6b', '#ffe14d', '#3ddcff', '#9dff5c', '#c77dff'];
      for (let i = 0; i <= 10; i++) {
        const bx = px + (w * i) / 10, by = py + hh - 2 + Math.sin(i * 1.3) * 2;
        ctx.fillStyle = cols[(i + Math.floor(time * 4)) % cols.length];
        ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  },

  drawBuilding(ctx, b) {
    const px = b.x * TILE, py = b.y * TILE, w = b.w * TILE, h = b.h * TILE;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px + 8, py + 8, w, h);
    ctx.fillStyle = b.color; ctx.fillRect(px, py, w, h);
    ctx.fillStyle = b.roof || 'rgba(255,255,255,0.08)'; ctx.fillRect(px + 6, py + 6, w - 12, h - 12);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, w - 2, h - 2);
    // rooftop AC units
    ctx.fillStyle = 'rgba(200,205,210,0.35)';
    const n = Math.max(1, Math.floor(w / 120));
    for (let i = 0; i < n; i++) { const ax = px + 16 + hash2(b.x + i, b.y) * (w - 50); const ay = py + 14 + hash2(b.y, b.x + i) * (h - 44); ctx.fillRect(ax, ay, 18, 14); }
    if (b.big) {
      ctx.fillStyle = 'rgba(160,210,255,0.25)';
      for (let x = px + 30; x < px + w - 40; x += 70) ctx.fillRect(x, py + 30, 40, h - 60);
    }
    if (b.label) {
      ctx.save();
      ctx.translate(px + w / 2, py + h / 2);
      if (b.shop && h > w) ctx.rotate(-Math.PI / 2);
      const size = b.big ? 26 : b.shop ? 13 : 15;
      ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(b.label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-tw / 2 - 8, -size * 0.75, tw + 16, size * 1.5);
      ctx.fillStyle = b.kings ? '#ff4d5a' : b.shop ? '#ffe8a3' : '#ffffff';
      ctx.fillText(b.label, 0, 1);
      ctx.restore();
    }
  },
};
