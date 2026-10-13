// HUD, Emma's disappearing Snaps, the Drip Shop, overlays and touch controls.
const UI = {
  el: {},
  snapQueue: [],
  snapCur: null,
  snapT: 0,
  snapGap: 0,
  last: {},
  SNAP_TIME: 10,

  init() {
    const ids = ['hud', 'hp-fill', 'hp-text', 'silver', 'streak', 'mode', 'obj-text', 'minimap', 'bossbar', 'boss-fill', 'prompt',
      'snap', 'snap-avatar', 'snap-photo', 'snap-text', 'snap-timer', 'snap-streak', 'touch', 'joy-zone', 'joy', 'knob', 'btn-attack', 'btn-skate',
      'title', 'title-art', 'btn-continue', 'btn-new', 'shop', 'shop-silver', 'shop-list', 'shop-preview', 'shop-stats', 'shop-close',
      'pause', 'btn-resume', 'btn-music', 'btn-restart', 'dead', 'dead-line', 'btn-respawn', 'ending', 'end-art', 'end-stats',
      'btn-freeroam', 'btn-newgame2', 'pause-btn', 'dmg'];
    for (const id of ids) this.el[id] = document.getElementById(id);
    this.mctx = this.el.minimap.getContext('2d');

    Sprites.emmaFace(this.el['snap-avatar'].getContext('2d'), 44, 44, 44, null);
    this.el.snap.addEventListener('click', () => this.dismissSnap());

    this.el['btn-new'].onclick = () => Game.newGame();
    this.el['btn-continue'].onclick = () => Game.continueGame();
    this.el['shop-close'].onclick = () => Game.closeShop();
    this.el['btn-resume'].onclick = () => Game.resume();
    this.el['pause-btn'].onclick = () => Game.pause();
    this.el['btn-music'].onclick = () => { const on = Sound.setMusic(!Sound.isMusicOn()); this.el['btn-music'].textContent = 'MUSIC: ' + (on ? 'ON' : 'OFF'); };
    this.el['btn-restart'].onclick = () => { if (confirm('Restart the story from the beginning? You keep nothing.')) Game.newGame(); };
    this.el['btn-respawn'].onclick = () => Game.respawn();
    this.el['btn-freeroam'].onclick = () => Game.resume();
    this.el['btn-newgame2'].onclick = () => Game.newGame();

    if (Input.touch) this.initTouch();
  },

  initTouch() {
    const zone = this.el['joy-zone'], joy = this.el.joy, knob = this.el.knob;
    let id = null, cx = 0, cy = 0;
    const R = 50;
    zone.addEventListener('pointerdown', (e) => {
      id = e.pointerId; zone.setPointerCapture(id);
      const rect = zone.getBoundingClientRect();
      cx = e.clientX; cy = e.clientY;
      joy.style.left = (cx - rect.left - 60) + 'px'; joy.style.top = (cy - rect.top - 60) + 'px'; joy.style.bottom = 'auto';
      Input.joy.active = true; Input.joy.x = 0; Input.joy.y = 0;
    });
    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const m = Math.hypot(dx, dy);
      if (m > R) { dx = (dx / m) * R; dy = (dy / m) * R; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      Input.joy.x = dx / R; Input.joy.y = dy / R;
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null; Input.joy.active = false; Input.joy.x = Input.joy.y = 0;
      knob.style.transform = '';
    };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
    document.querySelectorAll('.tbtn').forEach((b) => {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.init(); Input.press(b.dataset.act); });
    });
  },

  show(id, on = true) { this.el[id].classList.toggle('hidden', !on); },

  set(key, el, prop, val) {
    if (this.last[key] === val) return;
    this.last[key] = val;
    if (prop === 'text') el.textContent = val; else el.style[prop] = val;
  },

  hud(G) {
    const p = G.player, st = G.stats;
    const pct = Math.max(0, (p.hp / st.maxHp) * 100);
    this.set('hpw', this.el['hp-fill'], 'width', pct.toFixed(1) + '%');
    this.set('hpt', this.el['hp-text'], 'text', `${Math.ceil(p.hp)} / ${st.maxHp}`);
    this.set('silver', this.el.silver, 'text', `◆ ${G.save.silver} silver`);
    this.set('streak', this.el.streak, 'text', `🔥 ${G.save.streak}`);
    this.set('mode', this.el.mode, 'text', p.inTruck ? '🛻 Cybertruck' : p.skate ? '🛹 Skating' : '🚶 Walking');
    this.set('obj', this.el['obj-text'], 'text', Game.objectiveText());
    if (Input.touch) {
      this.set('btnA', this.el['btn-attack'], 'text', p.inTruck ? '📢' : '👊');
      this.set('btnS', this.el['btn-skate'], 'text', p.skate ? '🚶' : '🛹');
    }
    const boss = G.boss;
    const bossOn = !!(boss && !boss.ko);
    if (this.last.boss !== bossOn) { this.last.boss = bossOn; this.show('bossbar', bossOn); }
    if (bossOn) this.set('bossw', this.el['boss-fill'], 'width', ((boss.hp / boss.maxHp) * 100).toFixed(1) + '%');
  },

  prompt(text) {
    if (this.last.prompt === text) return;
    this.last.prompt = text;
    this.show('prompt', !!text);
    if (text) this.el.prompt.textContent = (Input.touch ? 'Tap ' : 'Press ') + text;
  },

  flashDamage() {
    const d = this.el.dmg;
    d.classList.add('on');
    clearTimeout(this.dmgTimer);
    this.dmgTimer = setTimeout(() => d.classList.remove('on'), 60);
  },

  // ---------- Snaps (disappear after 10s, like the real thing) ----------
  snap(text, photo, cap) { this.snapQueue.push({ text, photo, cap }); },
  clearSnaps() { this.snapQueue = []; this.snapCur = null; this.show('snap', false); },
  dismissSnap() { this.snapT = 0; },

  updateSnaps(dt, G) {
    if (this.snapCur) {
      // read faster when more snaps are waiting
      this.snapT -= dt * (this.snapQueue.length ? 1.6 : 1);
      const left = Math.max(0, this.snapT / this.SNAP_TIME);
      this.el['snap-timer'].style.background = `conic-gradient(#f23c57 ${left}turn, #eee 0)`;
      if (this.snapT <= 0) { this.snapCur = null; this.show('snap', false); this.snapGap = 0.4; }
      return;
    }
    if (this.snapGap > 0) { this.snapGap -= dt; return; }
    const s = this.snapQueue.shift();
    if (!s) return;
    this.snapCur = s;
    this.snapT = this.SNAP_TIME;
    this.el['snap-text'].textContent = s.text;
    this.el['snap-streak'].textContent = `🔥 ${G.save.streak}`;
    const ph = this.el['snap-photo'];
    if (s.photo) { Sprites.snapPhoto(ph.getContext('2d'), s.photo, s.cap); ph.classList.remove('hidden'); } else ph.classList.add('hidden');
    const el = this.el.snap;
    el.classList.add('hidden'); void el.offsetWidth; el.classList.remove('hidden');
    Sound.play.snap();
  },

  // ---------- Snap Map ----------
  minimap(G) {
    const c = this.mctx, W = 168, H = 120, sx = W / MAP_W, sy = H / MAP_H;
    c.imageSmoothingEnabled = false;
    c.drawImage(World.mini, 0, 0, W, H);
    if (World.gateOpen) { c.fillStyle = '#3ddc84'; c.fillRect(112 * sx, 82 * sy, 3 * sx, 2); }
    c.fillStyle = '#e5303d';
    for (const e of G.enemies) if (!e.ko) { c.beginPath(); c.arc(e.x / TILE * sx, e.y / TILE * sy, 1.6, 0, 7); c.fill(); }
    const tgt = Game.target();
    if (tgt) {
      const pulse = 3 + Math.sin(G.time * 6) * 1.2;
      c.fillStyle = '#111'; c.beginPath(); c.arc(tgt.x / TILE * sx, tgt.y / TILE * sy, pulse + 1.5, 0, 7); c.fill();
      c.fillStyle = '#fffc00'; c.beginPath(); c.arc(tgt.x / TILE * sx, tgt.y / TILE * sy, pulse, 0, 7); c.fill();
    }
    const p = G.player;
    c.fillStyle = '#111'; c.beginPath(); c.arc(p.x / TILE * sx, p.y / TILE * sy, 4.5, 0, 7); c.fill();
    c.strokeStyle = '#dfe3e8'; c.lineWidth = 1.5; c.stroke();
  },

  // ---------- Drip Shop ----------
  renderShop(G) {
    this.el['shop-silver'].textContent = `◆ ${G.save.silver}`;
    const list = this.el['shop-list'];
    list.innerHTML = '';
    for (const it of ITEMS) {
      const owned = G.save.owned.includes(it.id);
      const equipped = G.save.equipped[it.slot] === it.id;
      const card = document.createElement('div');
      card.className = 'item' + (equipped ? ' equipped' : '');
      card.innerHTML = `<div class="item-top"><span class="item-emoji">${it.emoji}</span><div><div class="item-name">${it.name}</div><div class="item-slot">${it.slot}</div></div></div><div class="item-desc">${it.desc}</div>`;
      const b = document.createElement('button');
      if (it.quest && !owned) { b.textContent = 'Get it back from King Kav'; b.disabled = true; }
      else if (equipped) { b.textContent = Game.OPTIONAL_SLOTS.includes(it.slot) ? 'EQUIPPED · tap to remove' : 'EQUIPPED'; b.disabled = !Game.OPTIONAL_SLOTS.includes(it.slot); }
      else if (owned) b.textContent = 'EQUIP';
      else { b.textContent = `BUY · ◆ ${it.price}`; b.className = 'buy'; b.disabled = G.save.silver < it.price; }
      b.onclick = () => Game.shopClick(it);
      card.appendChild(b);
      list.appendChild(card);
    }
    const st = G.stats;
    this.el['shop-stats'].innerHTML =
      `<b>Max HP</b> ${st.maxHp}<br><b>Punch</b> ×${(st.dmg * (1 + 0.05 * G.save.streak)).toFixed(2)}<br><b>Speed</b> ×${st.speed.toFixed(2)}<br>` +
      `<b>Silver drops</b> ×${st.silver.toFixed(2)}<br><b>Regen</b> ${st.regen}/s<br><b>Truck</b> ×${(1 + st.truck).toFixed(2)}`;
    const pc = this.el['shop-preview'].getContext('2d');
    pc.clearRect(0, 0, 300, 380);
    Sprites.drawArieh(pc, 150, 350, { facing: 1, scale: 5.2 }, Game.outfit());
  },
};
