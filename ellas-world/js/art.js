'use strict';
// All the art is drawn in code: Ella, Sarah, the dog, the axolotls, the rainforest visitors and the café.
const Art = (() => {
  const TAU = Math.PI * 2;
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
  function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); }
  function fillEll(ctx, color, x, y, rx, ry, rot = 0) { ctx.fillStyle = color; ell(ctx, x, y, rx, ry, rot); ctx.fill(); }
  function fillCirc(ctx, color, x, y, r) { ctx.fillStyle = color; circ(ctx, x, y, r); ctx.fill(); }
  function shadow(ctx, x, y, rx) { fillEll(ctx, 'rgba(70,40,10,0.22)', x, y, rx, rx * 0.26); }

  function emoji(ctx, e, x, y, size, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${size}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(e, x, y);
    ctx.restore();
  }
  function heart(ctx, x, y, s, color) {
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.3, x - s * 0.4, y - s, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.3, x, y + s * 0.35);
    ctx.fill();
  }
  function leaf(ctx, x, y, len, w, ang, color, vein) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.45, -w, len, 0); ctx.quadraticCurveTo(len * 0.45, w, 0, 0); ctx.fill();
    if (vein) { ctx.strokeStyle = vein; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke(); }
    ctx.restore();
  }
  function flower(ctx, x, y, r, petal, centre) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2;
      fillEll(ctx, petal, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.62, r * 0.42, a);
    }
    fillCirc(ctx, centre, x, y, r * 0.3);
  }

  // ---------- People (front view, origin = feet) ----------
  function arm(ctx, sx, sy, ang, skin, sleeve) {
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
    ctx.fillStyle = skin; rr(ctx, -4.5, 4, 9, 30, 4.5); ctx.fill(); circ(ctx, 0, 34, 5.5); ctx.fill();
    ctx.fillStyle = sleeve; rr(ctx, -6.5, -3, 13, 15, 6); ctx.fill();
    ctx.restore();
  }

  // o: { hair, hairDark, skin, shirt, legs, shoes, style: 'pony'|'long', apron, freckles, clip, wave, happy, walking, scale }
  function kid(ctx, x, y, t, o) {
    const s = o.scale || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    shadow(ctx, 0, 0, 24);
    const step = o.walking ? Math.sin(t * 12) : 0;
    const upL = Math.max(0, step) * 4, upR = Math.max(0, -step) * 4;
    ctx.fillStyle = o.legs;
    rr(ctx, -12, -40, 9, 36 - upL, 4); ctx.fill();
    rr(ctx, 3, -40, 9, 36 - upR, 4); ctx.fill();
    ctx.fillStyle = o.shoes;
    rr(ctx, -15, -9 - upL, 14, 9, 4); ctx.fill();
    rr(ctx, 1, -9 - upR, 14, 9, 4); ctx.fill();

    ctx.translate(0, o.walking ? -Math.abs(step) * 2.5 : Math.sin(t * 2) * 0.8);
    const hy = -114;

    // hair behind the head
    if (o.style === 'long') {
      ctx.fillStyle = o.hairDark; rr(ctx, -32, hy - 4, 64, 64, 18); ctx.fill();
    } else {
      ctx.save(); ctx.translate(24, hy - 14); ctx.rotate(0.55 + Math.sin(t * 3) * 0.12);
      fillEll(ctx, o.hair, 0, 22, 11, 25);
      fillEll(ctx, o.hairDark, 3, 30, 5, 15);
      ctx.restore();
      fillCirc(ctx, '#ff6fa8', 22, hy - 12, 5); // hair tie
      ctx.fillStyle = o.hairDark; rr(ctx, -29, hy - 6, 58, 30, 14); ctx.fill();
    }

    // dress
    ctx.fillStyle = o.shirt; ctx.beginPath();
    ctx.moveTo(-16, -84); ctx.quadraticCurveTo(0, -89, 16, -84);
    ctx.lineTo(24, -38); ctx.quadraticCurveTo(0, -33, -24, -38); ctx.closePath(); ctx.fill();
    if (o.apron) {
      ctx.fillStyle = '#fffaf0'; ctx.beginPath();
      ctx.moveTo(-11, -78); ctx.lineTo(11, -78); ctx.lineTo(18, -41); ctx.quadraticCurveTo(0, -37, -18, -41); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-11, -78); ctx.lineTo(-6, -89); ctx.moveTo(11, -78); ctx.lineTo(6, -89); ctx.stroke();
      leaf(ctx, -6, -54, 13, 5, -0.4, '#4caf6a', '#2e7d4a');
      fillCirc(ctx, '#ff8fb1', 7, -56, 3);
    }

    const sw = o.walking ? step * 0.25 : 0;
    arm(ctx, -16, -80, 0.22 + sw, o.skin, o.shirt);
    arm(ctx, 16, -80, o.wave ? -2.7 + Math.sin(t * 12) * 0.35 : -0.22 + sw, o.skin, o.shirt);

    // neck, ears, head
    ctx.fillStyle = o.skin; rr(ctx, -5, -93, 10, 10, 3); ctx.fill();
    circ(ctx, -26, hy + 3, 5); ctx.fill(); circ(ctx, 26, hy + 3, 5); ctx.fill();
    circ(ctx, 0, hy, 27); ctx.fill();

    // face
    const blink = (t % 4.3) < 0.13;
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (const ex of [-10, 10]) {
      if (o.happy) { ctx.beginPath(); ctx.arc(ex, hy + 5, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
      else if (blink) { ctx.beginPath(); ctx.moveTo(ex - 4, hy + 2); ctx.lineTo(ex + 4, hy + 2); ctx.stroke(); }
      else {
        fillEll(ctx, '#3a2a20', ex, hy + 2, 4.2, 5.4);
        fillCirc(ctx, '#fff', ex + 1.6, hy - 0.6, 1.6);
      }
    }
    ctx.globalAlpha = 0.45;
    fillEll(ctx, '#ff8fa3', -16, hy + 11, 5.5, 3.5); fillEll(ctx, '#ff8fa3', 16, hy + 11, 5.5, 3.5);
    ctx.globalAlpha = 1;
    if (o.freckles) {
      ctx.fillStyle = '#c4865a';
      for (const [fx, fy] of [[-13, 8], [-17, 7], [-15, 11], [-19, 10], [-4, 7], [13, 8], [17, 7], [15, 11], [19, 10], [4, 7]]) {
        circ(ctx, fx, hy + fy, 1.1); ctx.fill();
      }
    }
    ctx.strokeStyle = '#d9a184'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, hy + 7, 2.2, 0.2, Math.PI - 0.2); ctx.stroke();
    if (o.happy) {
      ctx.fillStyle = '#b5404f'; ctx.beginPath(); ctx.arc(0, hy + 13, 6, 0, Math.PI); ctx.fill();
      fillEll(ctx, '#ff8fa3', 0, hy + 16.5, 3.4, 1.8);
    } else {
      ctx.strokeStyle = '#a5524a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, hy + 11, 5.5, 0.3, Math.PI - 0.3); ctx.stroke();
    }

    // fringe
    ctx.fillStyle = o.hair; ctx.beginPath();
    ctx.arc(0, hy - 2, 30, Math.PI * 0.93, Math.PI * 2.07);
    ctx.quadraticCurveTo(26, hy - 12, 12, hy - 13);
    ctx.quadraticCurveTo(-4, hy - 22, -14, hy - 12);
    ctx.quadraticCurveTo(-26, hy - 10, -29, hy + 4);
    ctx.closePath(); ctx.fill();
    if (o.style === 'long') {
      ctx.fillStyle = o.hair;
      rr(ctx, -34, hy - 4, 12, 56, 6); ctx.fill(); rr(ctx, 22, hy - 4, 12, 56, 6); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(-6, hy - 6, 22, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
    if (o.clip) flower(ctx, -21, hy - 22, 9, '#ff5d8f', '#ffd54a');
    ctx.restore();
  }

  // ---------- The dog: a black Great Dane with a white chest patch, lying down, facing right ----------
  // o: { happy, chew, look (head tilt, + = down), lap, scale }
  function dog(ctx, x, y, t, o = {}) {
    const B = '#1d1d24', B2 = '#2f303b', HL = '#4a4c5c';
    ctx.save(); ctx.translate(x, y); ctx.scale(o.scale || 1, o.scale || 1);
    shadow(ctx, 0, 2, 100);
    const breathe = Math.sin(t * 2) * 1.2;

    const wag = o.happy ? Math.sin(t * 16) * 0.55 : Math.sin(t * 2.5) * 0.12;
    ctx.save(); ctx.translate(-74, -28); ctx.rotate(-0.25 + wag);
    ctx.strokeStyle = B; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-28, 2, -46, 18); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = B2; rr(ctx, 24, -24, 70, 12, 6); ctx.fill(); fillEll(ctx, B2, 94, -16, 10, 7); // far front leg
    fillEll(ctx, B, -48, -27, 31, 25);
    fillEll(ctx, B, -6, -31 - breathe * 0.5, 72, 27 + breathe * 0.3);
    fillEll(ctx, B, -20, -6, 22, 7);
    ctx.fillStyle = B; rr(ctx, 30, -15, 74, 13, 6); ctx.fill(); fillEll(ctx, B, 106, -8, 11, 7); // near front leg
    ctx.strokeStyle = HL; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(-6, -31, 66, 22, 0, Math.PI * 1.15, Math.PI * 1.7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-48, -27, 24, 19, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();

    // neck
    ctx.fillStyle = B; ctx.beginPath();
    ctx.moveTo(28, -52); ctx.lineTo(60, -94); ctx.lineTo(92, -84); ctx.lineTo(72, -22); ctx.closePath(); ctx.fill();
    fillEll(ctx, '#f6f5f0', 66, -38, 10, 16, 0.25); // the white chest patch
    fillEll(ctx, '#ffffff', 64, -42, 4, 6, 0.25);

    // head (tilts around the neck)
    ctx.save(); ctx.translate(74, -84); ctx.rotate(o.look || 0); ctx.translate(-74, 84);
    ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(60, -80); ctx.lineTo(88, -70); ctx.stroke();
    fillCirc(ctx, '#ffd54a', 76, -66, 4);
    ctx.fillStyle = B; rr(ctx, 56, -116, 46, 40, 15); ctx.fill();
    const jaw = o.chew ? Math.abs(Math.sin(t * 14)) * 4 : 0;
    rr(ctx, 86, -102, 38, 24, 10); ctx.fill();
    rr(ctx, 88, -86 + jaw, 32, 10, 5); ctx.fill();
    if (o.happy || o.lap) {
      fillEll(ctx, '#ff7aa2', 112, -74 + jaw + (o.lap ? Math.sin(t * 18) * 2 : 0), 5, 8);
    }
    ctx.strokeStyle = HL; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(98, -84 + jaw * 0.5); ctx.lineTo(118, -86); ctx.stroke();
    fillEll(ctx, '#050507', 123, -98, 6.5, 5.5);
    fillCirc(ctx, '#6e7080', 121, -100, 1.8);
    const blink = (t % 5.1) < 0.14;
    if (o.happy) {
      ctx.strokeStyle = '#d9d9e3'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(85, -100, 4.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    } else if (!blink) {
      fillCirc(ctx, '#f4efe6', 85, -101, 5);
      fillCirc(ctx, '#5b3a1e', 86, -101, 3.6);
      fillCirc(ctx, '#ffffff', 87.3, -102.4, 1.3);
    } else {
      ctx.strokeStyle = '#d9d9e3'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(81, -101); ctx.lineTo(89, -101); ctx.stroke();
    }
    ctx.strokeStyle = HL; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(79, -109); ctx.lineTo(90, -107); ctx.stroke();
    // floppy ear
    const flop = Math.sin(t * 1.7) * 1.5;
    ctx.fillStyle = '#121217'; ctx.beginPath();
    ctx.moveTo(62, -112); ctx.quadraticCurveTo(48, -102, 56 + flop, -78);
    ctx.quadraticCurveTo(70, -88, 76, -110); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---------- Axolotls (top view, facing +x) ----------
  const AXO = {
    pink: { body: '#ffb3c7', dark: '#f28aa8', gill: '#ff4f86' },
    lilac: { body: '#dcc8ff', dark: '#b89cf0', gill: '#ff6fa8' },
    gold: { body: '#ffd76a', dark: '#eeb43a', gill: '#ff8a5c' },
    blue: { body: '#a6c8ff', dark: '#719fe8', gill: '#5a6cff' },
  };
  function axolotl(ctx, x, y, ang, t, colour, s = 1) {
    const c = AXO[colour] || AXO.pink;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const w = Math.sin(t * 7) * 0.35;
    ctx.fillStyle = c.dark; ctx.beginPath();
    ctx.moveTo(-10, -4); ctx.quadraticCurveTo(-26, -8 + w * 8, -38, w * 14);
    ctx.quadraticCurveTo(-26, 8 + w * 8, -10, 4); ctx.fill();
    for (const [lx, side] of [[-8, -1], [-8, 1], [6, -1], [6, 1]]) {
      fillEll(ctx, c.dark, lx, side * 9, 5, 2.4, side * (0.7 + w * 0.4));
    }
    fillEll(ctx, c.body, -3, 0, 15, 7.5);
    fillEll(ctx, c.body, 12, 0, 10, 11);
    ctx.strokeStyle = c.gill; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const a = side * (1.85 + i * 0.4 + Math.sin(t * 4 + i) * 0.08);
        const bx = 8, by = side * 7;
        const ex = bx + Math.cos(a) * 10, ey = by + Math.sin(a) * 10;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
        fillCirc(ctx, c.gill, ex, ey, 2.2);
        fillCirc(ctx, c.gill, (bx + ex) / 2, (by + ey) / 2, 1.7);
      }
    }
    fillCirc(ctx, '#2b1d24', 16, -5, 1.9); fillCirc(ctx, '#2b1d24', 16, 5, 1.9);
    fillCirc(ctx, '#fff', 16.6, -5.6, 0.7); fillCirc(ctx, '#fff', 16.6, 4.4, 0.7);
    ctx.strokeStyle = '#a2506a'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(17, 0, 3.5, -1, 1); ctx.stroke();
    ctx.globalAlpha = 0.5; fillEll(ctx, '#ff8fa3', 14, -7.5, 2.2, 1.4); fillEll(ctx, '#ff8fa3', 14, 7.5, 2.2, 1.4);
    ctx.restore();
  }

  // ---------- Rainforest visitors (drawn facing right; the game mirrors them) ----------
  function toucan(ctx, x, y, t, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.35, 1.35);
    shadow(ctx, 0, 0, 18);
    const hop = o.walking ? -Math.abs(Math.sin(t * 10)) * 6 : 0;
    ctx.translate(0, hop);
    ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(-6, 0); ctx.moveTo(5, -14); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = '#1b1b22'; rr(ctx, -16, -30, 12, 34, 5); ctx.fill(); // tail
    fillEll(ctx, '#1b1b22', 0, -38, 20, 27);
    fillEll(ctx, '#fff3b0', 6, -52, 12, 11);
    fillEll(ctx, '#e53950', 4, -24, 9, 4);
    const flap = o.happy ? Math.sin(t * 18) * 0.5 : 0;
    ctx.save(); ctx.translate(-6, -46); ctx.rotate(0.2 + flap);
    fillEll(ctx, '#30303c', -4, 12, 9, 20); ctx.restore();
    fillCirc(ctx, '#1b1b22', 2, -68, 16);
    fillCirc(ctx, '#4fc3f7', 8, -72, 6); fillCirc(ctx, '#111', 9, -72, 2.8); fillCirc(ctx, '#fff', 10, -73.5, 1);
    ctx.fillStyle = '#ffb02e'; ctx.beginPath();
    ctx.moveTo(14, -80); ctx.quadraticCurveTo(44, -86, 58, -70); ctx.quadraticCurveTo(40, -66, 14, -62); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6ccf5f'; ctx.beginPath();
    ctx.moveTo(14, -80); ctx.quadraticCurveTo(26, -84, 32, -82); ctx.lineTo(28, -74); ctx.lineTo(14, -72); ctx.closePath(); ctx.fill();
    fillEll(ctx, '#d84343', 55, -71, 4, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(15, -70); ctx.quadraticCurveTo(38, -72, 56, -70); ctx.stroke();
    ctx.restore();
  }

  function sloth(ctx, x, y, t, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.2, 1.2);
    shadow(ctx, 0, 0, 26);
    ctx.translate(0, o.walking ? Math.sin(t * 4) * 1.5 : 0);
    const F = '#9c7a58', F2 = '#7f6146';
    fillEll(ctx, F2, -12, -6, 9, 7); fillEll(ctx, F2, 12, -6, 9, 7);
    fillEll(ctx, F, 0, -44, 30, 40);
    fillEll(ctx, '#b8996f', 0, -38, 18, 26);
    const reach = o.happy ? Math.sin(t * 6) * 0.3 : Math.sin(t * 1.2) * 0.06;
    for (const side of [-1, 1]) {
      ctx.save(); ctx.translate(side * 24, -62); ctx.rotate(side * (0.35 + reach));
      ctx.fillStyle = F2; rr(ctx, -6, 0, 12, 42, 6); ctx.fill();
      ctx.strokeStyle = '#efe4cf'; ctx.lineWidth = 2;
      for (const cx of [-4, 0, 4]) { ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx + side, 48); ctx.stroke(); }
      ctx.restore();
    }
    fillCirc(ctx, F, 0, -88, 26);
    fillEll(ctx, '#ead8b8', 0, -86, 22, 17);
    fillEll(ctx, '#5a4030', -10, -88, 8, 5, -0.5); fillEll(ctx, '#5a4030', 10, -88, 8, 5, 0.5);
    const blink = (t % 3.7) < 0.3;
    if (!blink && !o.happy) { fillCirc(ctx, '#1a120c', -9, -88, 2.6); fillCirc(ctx, '#1a120c', 9, -88, 2.6); fillCirc(ctx, '#fff', -8.2, -89, 0.9); fillCirc(ctx, '#fff', 9.8, -89, 0.9); }
    else { ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-9, -87, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(9, -87, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    fillEll(ctx, '#3b2a20', 0, -80, 4, 3);
    ctx.strokeStyle = '#3b2a20'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(0, -78, 7, 0.35, Math.PI - 0.35); ctx.stroke();
    ctx.fillStyle = F2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * 7, -112, 5, 4, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  function frog(ctx, x, y, t, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.45, 1.45);
    shadow(ctx, 0, 0, 24);
    const hop = o.walking ? -Math.abs(Math.sin(t * 7)) * 14 : (o.happy ? -Math.abs(Math.sin(t * 9)) * 6 : 0);
    ctx.translate(0, hop);
    const G = '#58c95a';
    for (const side of [-1, 1]) {
      fillEll(ctx, G, side * 20, -10, 12, 9);
      ctx.fillStyle = '#ff8f3a';
      for (const k of [-1, 0, 1]) fillCirc(ctx, '#ff8f3a', side * (24 + k * 5), -1, 3);
    }
    fillEll(ctx, G, 0, -26, 25, 22);
    fillEll(ctx, '#3d7bd8', -20, -26, 5, 12, 0.2); fillEll(ctx, '#3d7bd8', 20, -26, 5, 12, -0.2);
    fillEll(ctx, '#e9f7c7', 0, -20, 15, 14);
    fillEll(ctx, G, 0, -44, 22, 14);
    for (const side of [-1, 1]) {
      fillCirc(ctx, G, side * 13, -56, 10);
      fillCirc(ctx, '#e53935', side * 13, -56, 7.5);
      fillEll(ctx, '#111', side * 13, -56, 1.8, 5.5);
      fillCirc(ctx, '#fff', side * 13 + 2.5, -58.5, 1.4);
    }
    ctx.strokeStyle = '#2f7d34'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -46, 13, 0.25, Math.PI - 0.25); ctx.stroke();
    fillCirc(ctx, '#ff8fa3', -14, -40, 2.5); fillCirc(ctx, '#ff8fa3', 14, -40, 2.5);
    ctx.restore();
  }

  function capybara(ctx, x, y, t, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1.25, 1.25);
    shadow(ctx, 0, 0, 34);
    ctx.translate(0, o.walking ? -Math.abs(Math.sin(t * 8)) * 2 : 0);
    const C = '#a8754a', C2 = '#8c5f39';
    fillEll(ctx, C2, -16, -6, 9, 7); fillEll(ctx, C2, 16, -6, 9, 7);
    fillEll(ctx, C, 0, -34, 36, 30);
    fillEll(ctx, '#bb8a5d', 0, -28, 22, 18);
    ctx.fillStyle = C; rr(ctx, -22, -86, 44, 40, 18); ctx.fill();
    rr(ctx, -19, -64, 38, 24, 12); ctx.fill();
    fillEll(ctx, C2, -18, -86, 6, 5); fillEll(ctx, C2, 18, -86, 6, 5);
    const blink = (t % 4.6) < 0.3;
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2.2;
    if (blink || o.happy) { ctx.beginPath(); ctx.moveTo(-14, -72); ctx.lineTo(-7, -72); ctx.moveTo(7, -72); ctx.lineTo(14, -72); ctx.stroke(); }
    else { fillCirc(ctx, '#2a1a10', -10, -72, 2.6); fillCirc(ctx, '#2a1a10', 10, -72, 2.6); }
    fillEll(ctx, '#5b3a22', -5, -56, 2.4, 1.6); fillEll(ctx, '#5b3a22', 5, -56, 2.4, 1.6);
    ctx.strokeStyle = '#5b3a22'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(0, -54); ctx.lineTo(0, -49); ctx.moveTo(-5, -47); ctx.quadraticCurveTo(0, -45, 5, -47); ctx.stroke();
    fillCirc(ctx, '#ffa726', 0, -96, 10); // a little orange on its head, of course
    leaf(ctx, 1, -105, 10, 4, -0.9, '#4caf50');
    ctx.restore();
  }

  // ---------- Café bits ----------
  function sign(ctx, x, y, text, t) {
    ctx.save();
    ctx.font = '700 26px Fredoka, sans-serif';
    const w = Math.max(220, ctx.measureText(text).width + 90), h = 52;
    const sway = Math.sin(t * 0.8) * 0.012;
    ctx.translate(x, y); ctx.rotate(sway);
    ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 24, 0); ctx.lineTo(-w / 2 + 30, -y); ctx.moveTo(w / 2 - 24, 0); ctx.lineTo(w / 2 - 30, -y); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ctx, -w / 2 + 3, 4, w, h, 14); ctx.fill();
    ctx.fillStyle = '#b07a46'; rr(ctx, -w / 2, 0, w, h, 14); ctx.fill();
    ctx.fillStyle = '#c98f57'; rr(ctx, -w / 2 + 5, 5, w - 10, h - 10, 10); ctx.fill();
    leaf(ctx, -w / 2 + 6, 6, 26, 9, 2.6, '#3e9b5c'); leaf(ctx, -w / 2 + 6, 6, 22, 7, 1.7, '#57b56f');
    leaf(ctx, w / 2 - 6, 6, 26, 9, 0.5, '#3e9b5c'); leaf(ctx, w / 2 - 6, 6, 22, 7, 1.4, '#57b56f');
    flower(ctx, -w / 2 + 10, 8, 8, '#ff5d8f', '#ffd54a');
    axolotl(ctx, -w / 2 + 34, h / 2, -0.2, t, 'pink', 0.8);
    ctx.fillStyle = '#fffaf0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 14, h / 2 + 1);
    ctx.restore();
  }

  function butterfly(ctx, x, y, t, colour, s = 1) {
    const f = Math.abs(Math.sin(t * 14));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    fillEll(ctx, colour, -5 * f - 2, -3, 6 * f + 1.5, 7, -0.3);
    fillEll(ctx, colour, 5 * f + 2, -3, 6 * f + 1.5, 7, 0.3);
    fillEll(ctx, '#222', 0, 0, 1.6, 6);
    ctx.restore();
  }

  return { TAU, EMOJI_FONT, rr, circ, ell, fillEll, fillCirc, emoji, heart, leaf, flower, shadow, kid, dog, axolotl, toucan, sloth, frog, capybara, sign, butterfly };
})();
