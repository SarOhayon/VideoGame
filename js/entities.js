// Collision helpers + enemies (the Cavendish Kings, Speedy, and King Kav).
function circleHitsSolid(x, y, r) {
  const x0 = Math.floor((x - r) / TILE), x1 = Math.floor((x + r) / TILE);
  const y0 = Math.floor((y - r) / TILE), y1 = Math.floor((y + r) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (!World.solidTile(tx, ty)) continue;
    const cx = Math.max(tx * TILE, Math.min(x, (tx + 1) * TILE));
    const cy = Math.max(ty * TILE, Math.min(y, (ty + 1) * TILE));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}

// Moves a circle entity with wall sliding. Returns true if it bumped into something.
function moveEntity(e, dx, dy) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
  const sx = dx / steps, sy = dy / steps;
  let hit = false;
  for (let i = 0; i < steps; i++) {
    if (sx) { if (!circleHitsSolid(e.x + sx, e.y, e.r)) e.x += sx; else hit = true; }
    if (sy) { if (!circleHitsSolid(e.x, e.y + sy, e.r)) e.y += sy; else hit = true; }
  }
  return hit;
}

const KING_NAMES = ['Lil Crown', 'K-Dawg', 'Prince', 'Duke', 'Jester', 'Rook', 'Baron', 'Knight', 'Count', 'Squire', 'Bishop', 'Earl'];
const SKINS = ['#b07a55', '#8d5a3b', '#d9a77e', '#6b4430', '#c48a64', '#e8bf98'];

class King {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y; this.r = 11;
    this.kind = opts.kind || 'king';
    this.maxHp = this.hp = opts.hp || 36;
    this.speed = opts.speed || 100;
    this.dmg = opts.dmg || 7;
    this.aggro = opts.aggro || 240;
    this.tag = opts.tag || null;
    this.region = opts.region || null;
    this.name = opts.name || KING_NAMES[Math.floor(Math.random() * KING_NAMES.length)];
    this.skin = SKINS[Math.floor(Math.random() * SKINS.length)];
    this.home = { x, y };
    this.facing = Math.random() < 0.5 ? 1 : -1;
    this.vx = 0; this.vy = 0; this.walk = 0; this.moving = false;
    this.atkCd = 0.6 + Math.random() * 0.6; this.punchT = 0; this.hurtT = 0; this.stun = 0; this.bumpCd = 0;
    this.wanderT = 0; this.wdir = { x: 0, y: 0 }; this.detourT = 0; this.detour = { x: 0, y: 0 }; this.stuckT = 0;
    this.ko = false; this.koT = 0; this.alert = false;
  }

  update(dt, G) {
    if (this.ko) { this.koT += dt; return; }
    if (this.vx || this.vy) {
      moveEntity(this, this.vx * dt, this.vy * dt);
      const f = Math.max(0, 1 - dt * 7);
      this.vx *= f; this.vy *= f;
      if (Math.abs(this.vx) < 3) this.vx = 0;
      if (Math.abs(this.vy) < 3) this.vy = 0;
    }
    this.hurtT -= dt; this.atkCd -= dt; this.punchT -= dt; this.bumpCd -= dt;
    if (this.stun > 0) { this.stun -= dt; this.moving = false; return; }

    const p = G.player;
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1;
    let mx = 0, my = 0, spd = this.speed;
    this.alert = false;

    if (this.kind === 'runner') {
      if (d < 420) {
        mx = -dx / d; my = -dy / d;
        const c = World.points.skatepark, cd = Math.hypot(c.x - this.x, c.y - this.y) || 1;
        if (cd > 380) { mx += ((c.x - this.x) / cd) * 1.3; my += ((c.y - this.y) / cd) * 1.3; }
        const m = Math.hypot(mx, my) || 1; mx /= m; my /= m;
        if (d < this.r + p.r + 8 && !p.inTruck) { this.hurt(99, 0, 0, G); return; }
      } else spd = 0;
    } else if (!p.inTruck && !G.playerDown && d < this.aggro * G.stats.aggro) {
      this.alert = true;
      if (d > 24) { mx = dx / d; my = dy / d; }
      if (d < 34 && this.atkCd <= 0) {
        this.atkCd = 0.9 + Math.random() * 0.4; this.punchT = 0.15;
        G.hurtPlayer(this.dmg, dx / d, dy / d);
      }
    } else if (p.inTruck && d < 200) {
      mx = -dx / d; my = -dy / d; spd *= 1.1;
    } else {
      this.wanderT -= dt;
      if (this.wanderT <= 0) {
        this.wanderT = 1 + Math.random() * 2.5;
        const a = Math.random() * Math.PI * 2;
        this.wdir = Math.random() < 0.35 ? { x: 0, y: 0 } : { x: Math.cos(a), y: Math.sin(a) };
        const hd = Math.hypot(this.home.x - this.x, this.home.y - this.y);
        if (hd > 240) this.wdir = { x: (this.home.x - this.x) / hd, y: (this.home.y - this.y) / hd };
      }
      mx = this.wdir.x; my = this.wdir.y; spd *= 0.45;
    }

    if (this.detourT > 0) { this.detourT -= dt; mx = this.detour.x; my = this.detour.y; }

    if ((mx || my) && spd > 0) {
      const ox = this.x, oy = this.y;
      moveEntity(this, mx * spd * dt, my * spd * dt);
      const moved = Math.hypot(this.x - ox, this.y - oy);
      if (moved < spd * dt * 0.3) {
        this.stuckT += dt;
        if (this.stuckT > 0.3) {
          this.stuckT = 0;
          const s = Math.random() < 0.5 ? 1 : -1;
          this.detour = { x: -my * s, y: mx * s }; this.detourT = 0.6; this.wanderT = 0;
        }
      } else this.stuckT = 0;
      this.moving = moved > 0.3;
      if (Math.abs(mx) > 0.1) this.facing = Math.sign(mx);
      this.walk += dt;
    } else this.moving = false;
    if (this.alert && Math.abs(dx) > 4) this.facing = Math.sign(dx);
  }

  hurt(dmg, kx, ky, G) {
    if (this.ko) return;
    this.hp -= dmg; this.hurtT = 0.18;
    this.vx += kx; this.vy += ky;
    this.stun = Math.max(this.stun, 0.15);
    if (this.hp <= 0) { this.ko = true; this.koT = 0; G.onKO(this); }
  }
}

class Boss {
  constructor(x, y) {
    Object.assign(this, {
      x, y, r: 16, hp: 300, maxHp: 300, state: 'idle', t: 2, dir: { x: 1, y: 0 }, facing: -1,
      hurtT: 0, vx: 0, vy: 0, ko: false, koT: 0, kind: 'boss', name: 'KING KAV', minions: false, bumpCd: 0, blockedT: 0,
    });
  }

  update(dt, G) {
    if (this.ko) { this.koT += dt; return; }
    this.hurtT -= dt; this.bumpCd -= dt; this.blockedT -= dt;
    if (this.vx || this.vy) {
      moveEntity(this, this.vx * dt, this.vy * dt);
      const f = Math.max(0, 1 - dt * 6); this.vx *= f; this.vy *= f;
    }
    const p = G.player;
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1;
    const inYard = this.y > 83.5 * TILE;

    switch (this.state) {
      case 'idle': {
        this.t -= dt;
        let mx = 0, my = 0;
        if (!inYard) {
          const a = World.points.arena, ad = Math.hypot(a.x - this.x, a.y - this.y) || 1;
          mx = (a.x - this.x) / ad; my = (a.y - this.y) / ad;
        } else if (d < 170) { mx = -dx / d; my = -dy / d; } else if (d > 280) { mx = dx / d; my = dy / d; }
        if (mx || my) moveEntity(this, mx * 90 * dt, my * 90 * dt);
        this.facing = dx >= 0 ? 1 : -1;
        if (this.t <= 0 && inYard && d < 650) { this.state = 'aim'; this.t = 0.9; Sound.play.charge(); }
        break;
      }
      case 'aim':
        this.t -= dt;
        if (this.t > 0.3) this.dir = { x: dx / d, y: dy / d };
        this.facing = this.dir.x >= 0 ? 1 : -1;
        if (this.t <= 0) { this.state = 'charge'; this.t = 1.4; }
        break;
      case 'charge': {
        this.t -= dt;
        const spd = this.hp < this.maxHp * 0.5 ? 560 : 500;
        const hit = moveEntity(this, this.dir.x * spd * dt, this.dir.y * spd * dt);
        const tr = G.truck;
        const hitTruck = Math.hypot(tr.x - this.x, tr.y - this.y) < 48;
        if (hit || hitTruck) {
          this.state = 'stun'; this.t = 2.6;
          Sound.play.crash(); G.shake = 12;
          G.burst(this.x, this.y - 20, '#ffd23f', 20);
          G.floater(this.x, this.y - 90, 'CRASHED! HIT HIM NOW!', '#ffd23f');
        } else if (!p.inTruck && Math.hypot(p.x - this.x, p.y - this.y) < this.r + p.r + 6) {
          G.hurtPlayer(18, this.dir.x * 1.5, this.dir.y * 1.5);
        }
        if (this.t <= 0 && this.state === 'charge') { this.state = 'idle'; this.t = 1 + Math.random() * 0.6; }
        break;
      }
      case 'stun':
        this.t -= dt;
        if (this.t <= 0) { this.state = 'idle'; this.t = 1.2; }
        break;
    }

    if (!this.minions && this.hp < this.maxHp * 0.5) {
      this.minions = true;
      G.spawnGroup({ x: this.x, y: this.y }, 2, { tag: 'boss' });
      G.floater(this.x, this.y - 100, 'KINGS! GET HIM!', '#ff4d5a');
    }
  }

  hurt(dmg, kx, ky, G) {
    if (this.ko) return;
    const open = this.state === 'stun';
    this.hp -= open ? dmg : dmg * 0.15;
    this.hurtT = 0.15;
    if (!open && this.blockedT <= 0) { this.blockedT = 0.8; G.floater(this.x, this.y - 95, 'BLOCKED — make him crash!', '#cfd3d8'); }
    if (this.hp <= 0) { this.hp = 0; this.ko = true; this.koT = 0; G.onKO(this); }
  }
}
