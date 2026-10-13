// All the art is drawn in code: characters, the black Cybertruck, pickups, Emma's Snap avatar and photos.
const Sprites = (() => {
  const SILVER = '#dfe3e8', SILVER_D = '#8e96a1', GOLD = '#ffcc33';
  const TAU = Math.PI * 2;
  const shadeCache = new Map();

  function shade(hex, amt) {
    const key = hex + amt;
    if (shadeCache.has(key)) return shadeCache.get(key);
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    const out = `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
    shadeCache.set(key, out);
    return out;
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }

  // Gothic cross with flared tips — the signature silver motif.
  function cross(ctx, x, y, s, color) {
    const a = s * 0.15;
    ctx.fillStyle = color;
    ctx.fillRect(x - a, y - s * 0.5, a * 2, s);
    ctx.fillRect(x - s * 0.36, y - s * 0.22, s * 0.72, a * 2);
    ctx.fillRect(x - a * 1.8, y - s * 0.5, a * 3.6, a);
    ctx.fillRect(x - a * 1.8, y + s * 0.5 - a, a * 3.6, a);
    ctx.fillRect(x - s * 0.36, y - s * 0.22 - a * 0.8, a, a * 3.6);
    ctx.fillRect(x + s * 0.36 - a, y - s * 0.22 - a * 0.8, a, a * 3.6);
  }
  function crown(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x - s, y - s * 0.9); ctx.lineTo(x - s * 0.5, y - s * 0.4); ctx.lineTo(x, y - s * 1.1);
    ctx.lineTo(x + s * 0.5, y - s * 0.4); ctx.lineTo(x + s, y - s * 0.9); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fill();
  }
  function heart(ctx, x, y, s, color) {
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.4, y - s, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.3, x, y + s * 0.35);
    ctx.fill();
  }

  // Generic 3/4 top-down person. Origin = feet. Drawn facing right, mirrored for left.
  function drawHuman(ctx, o) {
    if (o.blink) return;
    ctx.save();
    ctx.translate(o.x, o.y);
    const s = o.scale || 1;
    ctx.scale(s * (o.facing < 0 ? -1 : 1), s);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 0, o.scooter ? 22 : 13, 5, 0, 0, TAU); ctx.fill();

    if (o.skate) {
      ctx.fillStyle = '#e9e9e9'; ctx.fillRect(-13, -2, 5, 3); ctx.fillRect(8, -2, 5, 3);
      ctx.fillStyle = '#0d0d0d'; rr(ctx, -18, -6, 36, 5, 2.5); ctx.fill();
      cross(ctx, 0, -3.5, 4, SILVER_D);
      ctx.translate(0, -5);
    }
    if (o.scooter) {
      ctx.fillStyle = '#111'; circle(ctx, -16, -3, 4.5); ctx.fill(); circle(ctx, 18, -3, 4.5); ctx.fill();
      ctx.fillStyle = '#2a2a2a'; rr(ctx, -21, -10, 40, 6, 2); ctx.fill();
      ctx.fillStyle = GOLD; ctx.fillRect(-15, -9, 27, 1.5);
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(17, -8); ctx.lineTo(12, -44); ctx.moveTo(6, -44); ctx.lineTo(18, -44); ctx.stroke();
      ctx.translate(0, -9);
    }

    const walking = o.moving && !o.skate && !o.scooter;
    const sw = walking ? Math.sin(o.walk * 13) : 0;
    const bob = o.dance ? Math.abs(Math.sin(o.dance * 7)) * 3 : walking ? Math.abs(sw) * 1.2 : 0;

    // long hair goes behind everything
    if (o.hair === 'long') { ctx.fillStyle = o.hairColor; rr(ctx, -10.5, -52 - bob, 19, 30, 8); ctx.fill(); }

    // legs + shoes
    const legL = 15 + sw * 2.5, legR = 15 - sw * 2.5;
    ctx.fillStyle = o.legs.c;
    ctx.fillRect(-7, -16, 6, legL); ctx.fillRect(1, -16, 6, legR);
    if (o.legs.kind === 'jeans') { cross(ctx, -4, -9, 5, '#d4d4d4'); cross(ctx, 4, -6, 4, '#d4d4d4'); }
    if (o.legs.kind === 'leather') {
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-6, -15, 1.5, legL - 3); ctx.fillRect(2, -15, 1.5, legR - 3);
      cross(ctx, -4, -8, 4, SILVER); cross(ctx, 4, -11, 3.5, SILVER);
    }
    ctx.fillStyle = o.shoes || '#f1f1f1';
    rr(ctx, -9, -16 + legL - 3, 9, 4, 1.5); ctx.fill();
    rr(ctx, 0, -16 + legR - 3, 9, 4, 1.5); ctx.fill();

    ctx.translate(0, -bob);
    const swing = sw * 3;

    // back arm
    ctx.fillStyle = shade(o.body.c, -18);
    rr(ctx, -13, -33 - swing * 0.3, 5, 15, 2.5); ctx.fill();
    ctx.fillStyle = shade(o.skin, -10); circle(ctx, -10.5, -17 - swing * 0.3, 2.8); ctx.fill();

    // torso
    ctx.fillStyle = o.body.c; rr(ctx, -10, -36, 20, 21, 5); ctx.fill();
    if (o.body.kind === 'rabbi') { ctx.fillStyle = o.body.c; rr(ctx, -10.5, -20, 21, 13, 2); ctx.fill(); }
    switch (o.body.kind) {
      case 'jacket':
        ctx.fillStyle = '#262626';
        ctx.beginPath(); ctx.moveTo(-8, -36); ctx.lineTo(-2, -36); ctx.lineTo(-5, -28); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(8, -36); ctx.lineTo(3, -36); ctx.lineTo(6, -29); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = SILVER; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(-2, -35); ctx.lineTo(3, -25); ctx.lineTo(3, -16); ctx.stroke();
        cross(ctx, -5, -24, 7, SILVER); cross(ctx, 7, -20, 4, SILVER);
        ctx.fillStyle = SILVER; ctx.fillRect(-9, -34, 1.6, 1.6); ctx.fillRect(7.5, -34, 1.6, 1.6);
        break;
      case 'hoodie':
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, -36, 7, 0, Math.PI); ctx.fill();
        cross(ctx, 0, -25, 13, '#e8e8e8');
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-3, -35); ctx.lineTo(-3, -30); ctx.moveTo(3, -35); ctx.lineTo(3, -30); ctx.stroke();
        break;
      case 'habs':
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-10, -25, 20, 1.5); ctx.fillRect(-10, -19.5, 20, 1.5);
        ctx.fillStyle = '#1d2c6b'; ctx.fillRect(-10, -23.5, 20, 4);
        ctx.fillStyle = '#fff'; ctx.font = '900 6px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText('MTL', 0, -28);
        break;
      case 'bums':
        // oversized scruffy hoodie: patch, stain, pocket
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-7, -22, 14, 5);
        ctx.fillStyle = '#c9b48a'; ctx.fillRect(-7, -32, 5, 4);
        ctx.fillStyle = 'rgba(40,30,20,0.35)'; circle(ctx, 4, -27, 2.5); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '900 5px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText('MB', 0, -18.5);
        break;
      case 'kav':
        crown(ctx, 0, -21, 6, GOLD);
        ctx.fillStyle = GOLD; ctx.fillRect(-10, -18, 20, 1.5);
        break;
      case 'rabbi':
        ctx.fillStyle = '#f4f4f4';
        ctx.beginPath(); ctx.moveTo(-4, -36); ctx.lineTo(4, -36); ctx.lineTo(0, -26); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-0.6, -25, 1.2, 14);
        ctx.fillStyle = '#3a3a3a'; for (const by of [-23, -18, -13]) { ctx.beginPath(); ctx.arc(2.5, by, 1, 0, TAU); ctx.fill(); }
        break;
      case 'puffer':
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let y = -33; y < -16; y += 5) ctx.fillRect(-10, y, 20, 1.5);
        ctx.fillStyle = '#2b2b33'; ctx.fillRect(-1, -36, 2, 20);
        break;
      case 'party':
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-10, -27, 20, 3);
        break;
    }
    if (o.shoulders === 'tallit') {
      ctx.fillStyle = '#f7f5ef';
      rr(ctx, -11.5, -37, 23, 6, 3); ctx.fill();
      ctx.fillRect(-11.5, -33, 6, 18); ctx.fillRect(5.5, -33, 6, 18);
      ctx.fillStyle = '#1b1b1b';
      for (const sy of [-26, -23]) { ctx.fillRect(-11.5, sy, 6, 1.4); ctx.fillRect(5.5, sy, 6, 1.4); }
      ctx.fillStyle = '#e8e2cf'; ctx.fillRect(-7, -37, 14, 2.5);
      ctx.strokeStyle = '#f7f5ef'; ctx.lineWidth = 0.8; ctx.beginPath();
      for (const fx of [-10.5, -7, 6.5, 10]) { ctx.moveTo(fx, -15); ctx.lineTo(fx + 0.5, -10); }
      ctx.stroke();
    }
    if (o.neck === 'chain' || o.neck === 'gold') {
      const col = o.neck === 'gold' ? GOLD : SILVER;
      ctx.strokeStyle = col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-5, -35); ctx.quadraticCurveTo(0, -25, 5, -35); ctx.stroke();
      cross(ctx, 0, -26, 7, col);
      ctx.fillStyle = '#fff'; ctx.fillRect(1, -29, 1.2, 1.2);
    }

    // front arm
    if (o.punch) {
      ctx.fillStyle = o.body.c; rr(ctx, 4, -32, 18, 6, 3); ctx.fill();
      ctx.fillStyle = o.skin; circle(ctx, 23, -29, 4.3); ctx.fill();
      if (o.hands === 'rings') { ctx.fillStyle = SILVER; ctx.fillRect(21, -32.5, 1.8, 7); ctx.fillRect(24.2, -32.5, 1.6, 7); }
      if (o.wrist === 'rolex') { ctx.fillStyle = GOLD; ctx.fillRect(16, -32.5, 3, 7); ctx.fillStyle = '#0f3d2a'; ctx.fillRect(16.5, -30.5, 2, 2.5); }
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(30, -34); ctx.lineTo(36, -36); ctx.moveTo(31, -29); ctx.lineTo(38, -29); ctx.moveTo(30, -24); ctx.lineTo(36, -22); ctx.stroke();
    } else if (o.phone) {
      ctx.fillStyle = o.body.c; rr(ctx, 4, -32, 6, 11, 3); ctx.fill();
      ctx.fillStyle = o.skin; circle(ctx, 9, -22, 2.8); ctx.fill();
      ctx.fillStyle = '#111'; rr(ctx, 8, -31, 6, 9, 1.5); ctx.fill();
      ctx.fillStyle = '#fffc00'; ctx.fillRect(9, -30, 4, 7);
    } else {
      ctx.fillStyle = o.body.c; rr(ctx, 8, -33 + swing * 0.3, 5, 15, 2.5); ctx.fill();
      ctx.fillStyle = o.skin; circle(ctx, 10.5, -17 + swing * 0.3, 3); ctx.fill();
      if (o.hands === 'rings') { ctx.fillStyle = SILVER; ctx.fillRect(9, -18 + swing * 0.3, 3, 1.5); }
      if (o.wrist === 'rolex') { ctx.fillStyle = GOLD; ctx.fillRect(7.6, -21.5 + swing * 0.3, 5.8, 2.6); ctx.fillStyle = '#0f3d2a'; ctx.fillRect(9.6, -21 + swing * 0.3, 1.8, 1.6); }
    }

    // head
    const hy = -45;
    if (o.hair === 'hood') { ctx.fillStyle = shade(o.body.c, -12); circle(ctx, -1, hy, 11); ctx.fill(); }
    ctx.fillStyle = o.skin; circle(ctx, 0, hy, 8.5); ctx.fill();
    ctx.fillStyle = shade(o.skin, -18); circle(ctx, -3, hy + 1, 2.2); ctx.fill();
    switch (o.hair) {
      case 'curly':
        ctx.fillStyle = '#17110d';
        circle(ctx, -5, hy - 5, 5); ctx.fill(); circle(ctx, 0, hy - 7.5, 5.5); ctx.fill(); circle(ctx, 5, hy - 6, 4.5); ctx.fill();
        circle(ctx, -8, hy - 1, 4); ctx.fill(); circle(ctx, -7, hy + 3, 2.8); ctx.fill();
        break;
      case 'buzz':
        ctx.fillStyle = o.hairColor || '#2a1d14'; ctx.beginPath(); ctx.arc(0, hy - 1, 8.8, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
        break;
      case 'long':
        ctx.fillStyle = o.hairColor;
        ctx.beginPath(); ctx.ellipse(-0.5, hy - 5, 9.5, 5.8, 0, 0, TAU); ctx.fill();
        rr(ctx, -9.5, hy - 5, 4.5, 15, 2); ctx.fill();
        break;
      case 'hood':
        ctx.strokeStyle = shade(o.body.c, -35); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-1, hy, 10, -1.3, 1.3); ctx.stroke();
        if (o.headband) { ctx.fillStyle = '#fff'; ctx.fillRect(-8, hy - 6, 17, 3); }
        break;
    }
    // face
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(3, hy - 1, 1.8, 2.6); ctx.fillRect(6.5, hy - 1, 1.8, 2.6);
    if (o.lashes) { ctx.fillRect(2.5, hy - 2.2, 2.6, 0.9); ctx.fillRect(6, hy - 2.2, 2.6, 0.9); ctx.fillStyle = 'rgba(240,120,140,0.5)'; circle(ctx, 6, hy + 3, 1.8); ctx.fill(); }
    if (o.earring) cross(ctx, -3, hy + 5, 3.2, SILVER);
    if (o.hoops) { ctx.strokeStyle = GOLD; ctx.lineWidth = 1; circle(ctx, -3, hy + 5, 2); ctx.stroke(); }

    switch (o.head) {
      case 'trucker':
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, hy - 3, 9.6, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#f2f2f2'; ctx.fillRect(0, hy - 11.5, 8, 7);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(4, hy - 8.8, 2.1, 0.15 * Math.PI, 0.85 * Math.PI, true); ctx.stroke();
        ctx.fillStyle = '#111'; ctx.fillRect(6, hy - 4.5, 8, 2.5);
        break;
      case 'fedora':
        ctx.fillStyle = '#0d0d0d';
        ctx.beginPath(); ctx.ellipse(0, hy - 5, 14, 3.2, 0, 0, TAU); ctx.fill();
        rr(ctx, -8, hy - 15, 16, 10, 3); ctx.fill();
        ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-8, hy - 8, 16, 2);
        break;
      case 'beanie':
        ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.arc(0, hy - 2, 9.8, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#262626'; ctx.fillRect(-10, hy - 4.5, 20, 3.5);
        cross(ctx, 3, hy - 8, 4.5, SILVER);
        break;
    }
    if (o.face === 'shades') {
      ctx.fillStyle = '#050505'; rr(ctx, 1.5, hy - 2.5, 8.5, 3.6, 1.5); ctx.fill();
      ctx.strokeStyle = SILVER; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1.5, hy - 1.5); ctx.lineTo(-3, hy - 1); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(7, hy - 2, 1.5, 1);
    }
    if (o.crown) crown(ctx, -1, hy - 9, 7, GOLD);
    ctx.restore();
  }

  const OUTFIT = {
    body: { rabbi: { c: '#0e0e10', kind: 'rabbi' }, jacket: { c: '#121212', kind: 'jacket' }, hoodie: { c: '#1b1b1d', kind: 'hoodie' }, habs: { c: '#b5121b', kind: 'habs' } },
    legs: { jeans: { c: '#22262e', kind: 'jeans' }, leather: { c: '#0b0b0b', kind: 'leather' } },
  };

  function drawArieh(ctx, x, y, st, outfit) {
    drawHuman(ctx, {
      x, y, facing: st.facing, walk: st.walk, moving: st.moving, punch: st.punch, skate: st.skate, blink: st.blink,
      scale: st.scale || 1, dance: st.dance, skin: '#c99872', hair: 'curly',
      body: OUTFIT.body[outfit.body] || OUTFIT.body.jacket, legs: OUTFIT.legs[outfit.legs] || OUTFIT.legs.jeans,
      shoes: '#f3f3f3', head: outfit.head, face: outfit.face, hands: outfit.hands, neck: outfit.neck, wrist: outfit.wrist, shoulders: outfit.shoulders, earring: true,
    });
  }

  function drawEmma(ctx, x, y, t, facing, scale = 1) {
    drawHuman(ctx, {
      x, y, facing, dance: t, scale, skin: '#efc6a3', hair: 'long', hairColor: '#5b3a22', lashes: true, hoops: true,
      body: { c: '#1e1e26', kind: 'puffer' }, legs: { c: '#17171c', kind: 'plain' }, shoes: '#f5f5f5', phone: true,
    });
  }

  function drawNoa(ctx, x, y, t, facing, scale = 1) {
    drawHuman(ctx, {
      x, y, facing, dance: t + 0.8, scale, skin: '#f1cdb0', hair: 'long', hairColor: '#c9a66e', lashes: true,
      body: { c: '#e8e0d2', kind: 'puffer' }, legs: { c: '#2a2a33', kind: 'plain' }, shoes: '#f5f5f5',
    });
  }

  function drawGuest(ctx, g, t) {
    drawHuman(ctx, {
      x: g.x, y: g.y, facing: g.facing, dance: t + g.seed, skin: g.skin, hair: g.hair, hairColor: g.hairColor,
      body: { c: g.color, kind: 'party' }, legs: { c: '#222', kind: 'plain' }, shoes: '#eee', lashes: g.hair === 'long',
    });
  }

  function stars(ctx, x, y, t, n = 3) {
    for (let i = 0; i < n; i++) {
      const a = t * 4 + (i * TAU) / n;
      ctx.fillStyle = '#ffe14d';
      ctx.font = '12px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText('★', x + Math.cos(a) * 12, y + Math.sin(a) * 4);
    }
  }

  function drawKing(ctx, e, t) {
    const body = e.kind === 'runner' ? '#d4571c' : (e.color || '#6b6f4e');
    if (e.ko) {
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - e.koT / 1.2);
      ctx.translate(e.x, e.y); ctx.rotate((Math.PI / 2) * (e.facing || 1));
      drawHuman(ctx, { x: 0, y: 0, facing: 1, skin: e.skin, hair: 'hood', body: { c: body, kind: 'bums' }, legs: { c: '#4a5a78', kind: 'plain' }, shoes: '#8a7a66' });
      ctx.restore();
      stars(ctx, e.x, e.y - 14, t);
      return;
    }
    drawHuman(ctx, {
      x: e.x, y: e.y, facing: e.facing, walk: e.walk, moving: e.moving, punch: e.punchT > 0, skate: e.kind === 'runner',
      blink: e.hurtT > 0 && Math.floor(t * 30) % 2 === 0, skin: e.skin, hair: 'hood', headband: e.kind === 'runner',
      body: { c: body, kind: 'bums' }, legs: { c: '#4a5a78', kind: 'plain' }, shoes: '#8a7a66',
    });
    if (e.stun > 0.2) stars(ctx, e.x, e.y - 60, t);
    ctx.font = '800 10px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,90,100,0.95)'; ctx.fillText(e.name, e.x, e.y - 62);
    if (e.hp < e.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - 15, e.y - 58, 30, 4);
      ctx.fillStyle = '#e5303d'; ctx.fillRect(e.x - 15, e.y - 58, 30 * Math.max(0, e.hp / e.maxHp), 4);
    }
  }

  function drawBoss(ctx, b, t) {
    if (b.ko) {
      ctx.save(); ctx.globalAlpha = Math.max(0.3, 1 - b.koT / 2);
      ctx.translate(b.x, b.y); ctx.rotate(Math.PI / 2);
      drawHuman(ctx, { x: 0, y: 0, facing: 1, scale: 1.3, skin: '#a8714f', hair: 'hood', body: { c: '#4b1e6e', kind: 'kav' }, legs: { c: '#222', kind: 'plain' }, shoes: '#111', crown: true });
      ctx.restore();
      stars(ctx, b.x, b.y - 18, t, 4);
      return;
    }
    if (b.state === 'charge') {
      ctx.fillStyle = 'rgba(199,125,255,0.25)';
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(b.x - b.dir.x * i * 14, b.y - b.dir.y * i * 14, 18, 7, 0, 0, TAU); ctx.fill(); }
    }
    drawHuman(ctx, {
      x: b.x, y: b.y, facing: b.facing, scale: 1.3, scooter: true, blink: b.hurtT > 0 && Math.floor(t * 30) % 2 === 0,
      skin: '#a8714f', hair: 'hood', body: { c: '#4b1e6e', kind: 'kav' }, legs: { c: '#222', kind: 'plain' }, shoes: '#111',
      neck: 'gold', crown: true, face: 'shades',
    });
    if (b.state === 'stun') stars(ctx, b.x, b.y - 84, t, 4);
    if (b.state === 'aim') { ctx.font = '900 22px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff3b4f'; ctx.fillText('!', b.x, b.y - 92); }
  }

  // Black Cybertruck, top-down. Angle 0 = facing right.
  function drawTruck(ctx, tr, rims, t) {
    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.rotate(tr.angle);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-40, -18, 88, 44);
    const wheel = rims ? SILVER : '#2b2b2b';
    for (const [wx, wy] of [[-30, -24], [-30, 16], [18, -24], [18, 16]]) {
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(wx, wy, 16, 8);
      ctx.fillStyle = wheel; ctx.fillRect(wx + 4, wy + 2, 8, 4);
    }
    ctx.fillStyle = '#121316';
    ctx.beginPath();
    ctx.moveTo(-42, -20); ctx.lineTo(34, -20); ctx.lineTo(43, -12); ctx.lineTo(43, 12); ctx.lineTo(34, 20); ctx.lineTo(-42, 20); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a3e46'; ctx.lineWidth = 1.5; ctx.stroke();
    // vault (bed cover)
    ctx.fillStyle = '#18191d'; ctx.fillRect(-40, -16, 34, 32);
    ctx.fillStyle = '#202228'; for (let x = -38; x < -8; x += 6) ctx.fillRect(x, -16, 1, 32);
    // glass
    const g = ctx.createLinearGradient(-6, -16, 22, 16);
    g.addColorStop(0, '#1b2430'); g.addColorStop(0.5, '#33465a'); g.addColorStop(1, '#141b24');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(21, -14); ctx.lineTo(21, 14); ctx.lineTo(-6, 17); ctx.closePath(); ctx.fill();
    // hood
    ctx.fillStyle = '#16171b';
    ctx.beginPath(); ctx.moveTo(21, -14); ctx.lineTo(34, -18); ctx.lineTo(41, -11); ctx.lineTo(41, 11); ctx.lineTo(34, 18); ctx.lineTo(21, 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();
    // mirrors
    ctx.fillStyle = '#121316'; ctx.fillRect(15, -23, 5, 4); ctx.fillRect(15, 19, 5, 4);
    // light bars
    ctx.shadowBlur = 12; ctx.shadowColor = '#bfe6ff';
    ctx.strokeStyle = '#eef8ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(42.5, -13); ctx.lineTo(42.5, 13); ctx.stroke();
    ctx.shadowColor = '#ff2a3a'; ctx.strokeStyle = '#ff2a3a';
    ctx.beginPath(); ctx.moveTo(-42.5, -17); ctx.lineTo(-42.5, 17); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawPickup(ctx, p, t) {
    const bob = Math.sin(t * 4 + p.seed) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 7, 3, 0, 0, TAU); ctx.fill();
    const y = p.y - 6 + bob;
    switch (p.type) {
      case 'silver': {
        const g = ctx.createRadialGradient(p.x - 2, y - 2, 1, p.x, y, 7);
        g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#8e96a1');
        ctx.fillStyle = g; circle(ctx, p.x, y, 6.5); ctx.fill();
        cross(ctx, p.x, y, 7, '#5d6570');
        if ((t * 2 + p.seed) % 3 < 0.15) { ctx.fillStyle = '#fff'; ctx.fillRect(p.x + 3, y - 7, 2, 2); }
        break;
      }
      case 'poutine':
        ctx.fillStyle = '#e8e2d6'; ctx.beginPath(); ctx.moveTo(p.x - 10, y - 3); ctx.lineTo(p.x + 10, y - 3); ctx.lineTo(p.x + 7, y + 6); ctx.lineTo(p.x - 7, y + 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#c8102e'; ctx.fillRect(p.x - 8, y + 1, 16, 2);
        ctx.fillStyle = '#f2c14e'; for (let i = -7; i <= 6; i += 3) ctx.fillRect(p.x + i, y - 8 + (i & 1), 2, 7);
        ctx.fillStyle = '#6b3d1e'; ctx.beginPath(); ctx.ellipse(p.x, y - 4, 8, 3.5, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff8e0'; for (const [dx, dy] of [[-4, -5], [2, -4], [5, -6], [-1, -6]]) ctx.fillRect(p.x + dx, y + dy, 2.2, 2.2);
        break;
      case 'bagel':
        ctx.fillStyle = '#b97a3e'; circle(ctx, p.x, y, 7.5); ctx.fill();
        ctx.fillStyle = '#d99a5a'; circle(ctx, p.x - 1, y - 1, 6); ctx.fill();
        ctx.fillStyle = '#3a2a1a'; circle(ctx, p.x, y, 2.5); ctx.fill();
        ctx.fillStyle = '#fff6d6'; for (const [dx, dy] of [[-4, -3], [3, -4], [4, 2], [-3, 3], [0, -5]]) ctx.fillRect(p.x + dx, y + dy, 1.4, 1.4);
        break;
      case 'rolex': {
        ctx.save();
        ctx.shadowBlur = 18; ctx.shadowColor = '#ffe9a0';
        ctx.fillStyle = '#d9a520'; rr(ctx, p.x - 4, y - 15, 8, 30, 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = -13; k < 14; k += 4) ctx.fillRect(p.x - 4, y + k, 8, 1);
        ctx.fillStyle = GOLD; circle(ctx, p.x, y, 8.5); ctx.fill();
        ctx.fillStyle = '#0f3d2a'; circle(ctx, p.x, y, 6); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, y); ctx.lineTo(p.x, y - 4.5); ctx.moveTo(p.x, y); ctx.lineTo(p.x + 3.5, y + 1); ctx.stroke();
        ctx.fillStyle = GOLD; ctx.fillRect(p.x - 1, y - 6, 2, 1.5);
        ctx.restore();
        for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57; ctx.fillStyle = '#fff'; ctx.fillRect(p.x + Math.cos(a) * 18, y + Math.sin(a) * 18, 2, 2); }
        break;
      }
      case 'chain': {
        ctx.save();
        ctx.shadowBlur = 18; ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = SILVER; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, y - 8, 10, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        cross(ctx, p.x, y + 5, 12, SILVER);
        ctx.restore();
        for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57; ctx.fillStyle = '#fff'; ctx.fillRect(p.x + Math.cos(a) * 18, y + Math.sin(a) * 18, 2, 2); }
        break;
      }
    }
  }

  // ---------- Emma's Snap avatar + photos ----------
  function emmaFace(ctx, cx, cy, r, filter) {
    ctx.save();
    circle(ctx, cx, cy, r); ctx.fillStyle = '#fffc00'; ctx.fill(); ctx.clip();
    ctx.fillStyle = '#5b3a22'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.2, r * 0.62, r * 0.78, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1e1e26'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.05, r * 0.85, r * 0.45, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e6b892'; ctx.fillRect(cx - r * 0.12, cy + r * 0.35, r * 0.24, r * 0.3);
    ctx.fillStyle = '#efc6a3'; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.42, r * 0.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5b3a22';
    ctx.beginPath(); ctx.ellipse(cx + r * 0.05, cy - r * 0.38, r * 0.5, r * 0.22, -0.2, 0, TAU); ctx.fill();
    ctx.fillRect(cx - r * 0.47, cy - r * 0.35, r * 0.13, r * 0.75);
    ctx.fillRect(cx + r * 0.36, cy - r * 0.3, r * 0.12, r * 0.6);
    const ex = r * 0.17, ey = cy - r * 0.02;
    if (filter === 'hearts') {
      heart(ctx, cx - ex, ey + r * 0.04, r * 0.16, '#ff2d55'); heart(ctx, cx + ex, ey + r * 0.04, r * 0.16, '#ff2d55');
    } else if (filter === 'shades') {
      ctx.fillStyle = '#111'; rr(ctx, cx - r * 0.36, ey - r * 0.08, r * 0.3, r * 0.16, r * 0.05); ctx.fill(); rr(ctx, cx + r * 0.06, ey - r * 0.08, r * 0.3, r * 0.16, r * 0.05); ctx.fill();
      ctx.fillRect(cx - r * 0.07, ey - r * 0.04, r * 0.14, r * 0.03);
    } else {
      ctx.fillStyle = '#2a1a12'; circle(ctx, cx - ex, ey, r * 0.06); ctx.fill(); circle(ctx, cx + ex, ey, r * 0.06); ctx.fill();
      ctx.fillStyle = '#fff'; circle(ctx, cx - ex + r * 0.02, ey - r * 0.02, r * 0.02); ctx.fill(); circle(ctx, cx + ex + r * 0.02, ey - r * 0.02, r * 0.02); ctx.fill();
    }
    ctx.fillStyle = 'rgba(240,120,140,0.45)'; circle(ctx, cx - r * 0.25, cy + r * 0.14, r * 0.07); ctx.fill(); circle(ctx, cx + r * 0.25, cy + r * 0.14, r * 0.07); ctx.fill();
    ctx.strokeStyle = '#b5475a'; ctx.lineWidth = Math.max(1, r * 0.04);
    ctx.beginPath(); ctx.arc(cx, cy + r * 0.14, r * 0.13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(1, r * 0.03);
    circle(ctx, cx - r * 0.43, cy + r * 0.18, r * 0.07); ctx.stroke(); circle(ctx, cx + r * 0.43, cy + r * 0.18, r * 0.07); ctx.stroke();
    if (filter === 'dog') {
      ctx.fillStyle = '#7a4a2a';
      ctx.beginPath(); ctx.ellipse(cx - r * 0.45, cy - r * 0.5, r * 0.14, r * 0.3, -0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + r * 0.45, cy - r * 0.5, r * 0.14, r * 0.3, 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.07, r * 0.08, r * 0.05, 0, 0, TAU); ctx.fill();
    }
    if (filter === 'snow') {
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 18; i++) { circle(ctx, cx - r + hash2(i, 3) * r * 2, cy - r + hash2(3, i) * r * 2, r * 0.025 + hash2(i, i) * r * 0.03); ctx.fill(); }
    }
    ctx.restore();
  }

  function caption(ctx, W, H, text) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, H * 0.68, W, 40);
    ctx.fillStyle = '#fff'; ctx.font = '700 20px Inter, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H * 0.68 + 20);
  }

  function snapPhoto(ctx, kind, capText) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    const night = ['#141a33', '#05060c'], purple = ['#3a1450', '#0b0612'];
    const cols = kind === 'story' || kind === 'boss' ? purple : night;
    bg.addColorStop(0, cols[0]); bg.addColorStop(1, cols[1]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 40; i++) { circle(ctx, hash2(i, 9) * W, hash2(9, i) * H, 1 + hash2(i, i) * 2); ctx.fill(); }
    switch (kind) {
      case 'story':
        ctx.save(); ctx.translate(W * 0.3, H * 0.97); ctx.scale(3.4, 3.4);
        drawKing(ctx, { x: 0, y: 0, facing: 1, walk: 0, moving: false, punchT: 0, kind: 'king', skin: '#b07a55', name: '', hp: 1, maxHp: 1, hurtT: 0, stun: 0 }, 0);
        ctx.restore();
        ctx.save(); ctx.translate(W * 0.68, H * 0.42); ctx.scale(3, 3);
        drawPickup(ctx, { type: 'rolex', x: 0, y: 0, seed: 0 }, 1.2);
        ctx.restore();
        ctx.font = '900 18px Inter, Arial'; ctx.fillStyle = GOLD; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('@cavendishmallbums', 14, 30);
        break;
      case 'boss':
        ctx.save(); ctx.translate(W / 2, H * 0.97); ctx.scale(2.4, 2.4);
        drawBoss(ctx, { x: 0, y: 0, facing: -1, state: 'idle', hurtT: 0, ko: false, dir: { x: 1, y: 0 } }, 0);
        ctx.restore();
        break;
      case 'rolex':
        ctx.save(); ctx.translate(W / 2, H * 0.42); ctx.scale(4, 4); ctx.translate(-W / 2, -H * 0.42);
        drawPickup(ctx, { type: 'rolex', x: W / 2, y: H * 0.45, seed: 0 }, 0.6);
        ctx.restore();
        break;
      case 'selfie':
      case 'selfie-hearts':
      case 'selfie-dog':
      case 'selfie-snow':
        emmaFace(ctx, W / 2, H * 0.48, H * 0.4, kind.split('-')[1] || 'shades');
        break;
      case 'poutine':
        ctx.save(); ctx.translate(W / 2, H * 0.45); ctx.scale(5, 5); ctx.translate(-W / 2, -H * 0.45);
        drawPickup(ctx, { type: 'poutine', x: W / 2, y: H * 0.5, seed: 0 }, 0);
        ctx.restore();
        break;
    }
    if (capText) caption(ctx, W, H, capText);
    ctx.restore();
  }

  // Bigger scenes for the title/end screens.
  function titleArt(ctx, outfit, t) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(W * 0.62, H * 0.62); ctx.scale(2.2, 2.2);
    drawTruck(ctx, { x: 0, y: 0, angle: -0.15 }, false, t);
    ctx.restore();
    drawArieh(ctx, W * 0.24, H * 0.95, { facing: 1, scale: 4, dance: 0 }, outfit);
    ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255,252,0,0.6)';
    emmaFace(ctx, W * 0.86, H * 0.24, 52, 'hearts');
    ctx.restore();
  }

  return { drawHuman, drawArieh, drawEmma, drawNoa, drawGuest, drawKing, drawBoss, drawTruck, drawPickup, emmaFace, snapPhoto, titleArt, cross, OUTFIT };
})();
