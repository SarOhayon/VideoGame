// DRIP DROP: Brandeis Block — main loop, story, driving, combat, saving.
const SAVE_KEY = 'dripdrop-brandeis-v1';
const TAU = Math.PI * 2;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ITEMS = [
  { id: 'jacket', slot: 'body', name: 'Silver Cross Leather Jacket', price: 0, emoji: '🧥', desc: 'Starter fit. Black moto leather, sterling cross patches.', stats: {} },
  { id: 'hoodie', slot: 'body', name: 'Cross Patch Hoodie', price: 60, emoji: '🖤', desc: 'Huge silver cross print. +20 max HP.', stats: { hp: 20 } },
  { id: 'habs', slot: 'body', name: 'Habs Retro Jersey', price: 120, emoji: '🏒', desc: 'Bleu-blanc-rouge. +35 max HP. Go Habs Go.', stats: { hp: 35 } },
  { id: 'jeans', slot: 'legs', name: 'Cross Patch Denim', price: 0, emoji: '👖', desc: 'Starter. Black denim with leather cross patches.', stats: {} },
  { id: 'leather', slot: 'legs', name: 'Cemetery Leather Pants', price: 80, emoji: '⚫', desc: 'Black leather, silver crosses. +15% speed.', stats: { speed: 0.15 } },
  { id: 'rings', slot: 'hands', name: 'Dagger Ring Stack', price: 45, emoji: '💍', desc: 'Sterling rings on every finger. +30% punch damage.', stats: { dmg: 0.3 } },
  { id: 'trucker', slot: 'head', name: 'Horseshoe Trucker Hat', price: 50, emoji: '🧢', desc: 'Black + white mesh. +25% silver from KOs.', stats: { silver: 0.25 } },
  { id: 'beanie', slot: 'head', name: 'Cross Beanie', price: 35, emoji: '🧶', desc: "It's cold in CSL. Heal 1 HP/sec.", stats: { regen: 1 } },
  { id: 'shades', slot: 'face', name: 'Silver-Arm Shades', price: 65, emoji: '🕶️', desc: 'Kings notice you from 30% closer.', stats: { stealth: 0.3 } },
  { id: 'rims', slot: 'truck', name: 'Chrome Cybertruck Rims', price: 70, emoji: '🛞', desc: '+20% Cybertruck top speed.', stats: { truck: 0.2 } },
  { id: 'chain', slot: 'neck', name: 'Silver Cross Chain', price: null, quest: true, emoji: '⛓️', desc: 'YOUR chain. +20% damage, +10 HP.', stats: { dmg: 0.2, hp: 10 } },
];
const itemById = (id) => ITEMS.find((i) => i.id === id);

const AMBIENT = [
  ['first snow in CSL rn ❄️ wear a coat pls', 'selfie-snow', 'première neige ❄️'],
  ['bring me a poutine fr 🍟 the poutinerie on Westminster slaps', 'poutine', 'hungry 😩'],
  ['ur fit is actually so hard rn 🔥'],
  ['Habs game tonight 🏒 GO HABS GO', 'selfie-hearts', 'GO HABS GO ❤️💙'],
  ['the rink by the école is open, the ice is SO slippery lol ⛸️'],
  ['stop by 5911 and hit the Drip Shop if u got silver 🛍️ (E at ur door)'],
  ['my mom says hi 😭 also be safe out there'],
  ['someone said the Kings are scared of u now 💀'],
  ['ok who keeps beeping a cybertruck horn on Brandeis 😂', 'selfie-dog', 'it was u wasn\'t it'],
];

const DEAD_LINES = [
  'Emma: "get up bro 😭 ur chain is still out there"',
  'Emma: "nah that was a cheap shot. run it back"',
  'Emma: "eat a poutine and try again 🍟"',
  'Emma: "ur streak is still alive, don\'t fold now 🔥"',
];

const G = {
  state: 'title', time: 0,
  canvas: null, ctx: null, light: null, lctx: null, dpr: 1, zoom: 1, zoomCur: 1,
  cam: { x: 0, y: 0 }, shake: 0,
  player: null, truck: null, enemies: [], boss: null, pickups: [], particles: [], floaters: [], npcs: [], snow: [],
  stats: {}, flags: {}, questKills: 0, spawnT: 3, coinT: 0, foodT: { poutine: 0, bagel: 0 }, ambientT: 70, honkCd: 0,
  sinceHurt: 99, playerDown: false, save: null,
};

// ---------------- Story ----------------
const STEPS = [
  {
    id: 'truck', obj: () => 'Get in the black Cybertruck in the driveway', target: () => G.truck,
    start(mode) {
      if (mode === 'respawn') return;
      UI.snap('ARIEH 😭😭 the Cavendish Kings just posted UR silver cross chain on their story', 'story', '"new drip 👑💀"');
      UI.snap('they took it out of ur gym bag at the mall. we\'re getting it back fr');
      UI.snap('ur dad\'s black Cybertruck is in the driveway at 5911 👀 keys are in it. walk up to it + press E');
    },
    done: () => G.player.inTruck,
  },
  {
    id: 'mall', obj: () => 'Drive to Cavendish Mall (follow the yellow arrow)', target: () => World.points.mall,
    start(mode) {
      if (mode === 'respawn') return;
      UI.snap(Input.touch ? 'drag the joystick to drive, 📢 = honk' : 'W = gas, S = brake/reverse, A/D = steer. Space = honk 📢');
      UI.snap('go to Cavendish Mall, they\'re chilling by the entrance');
    },
    done: () => dist(G.player, World.points.mall) < 280,
  },
  {
    id: 'mallfight', obj: () => `Beat the Kings at Cavendish Mall (${G.questKills}/4)`, target: () => nearestTagged('quest'),
    start(mode) {
      G.questKills = 0;
      G.spawnGroup(World.points.mall, 4, { tag: 'quest' });
      if (mode === 'respawn') return;
      UI.snap('4 of them. red hoodies w/ the crown 👑', 'selfie-shades', 'show them the drip 💀');
      UI.snap(Input.touch ? 'hop out (E) and hit 👊 to punch' : 'hop out (E) and press Space to punch. u can also bump them w/ the truck lol');
    },
    done: () => G.questKills >= 4,
  },
  {
    id: 'speedy', obj: () => 'Catch Speedy at the skatepark in the parc', target: () => taggedOne('speedy') || World.points.skatepark,
    start(mode) {
      removeTagged('speedy');
      G.enemies.push(new King(World.points.skatepark.x, World.points.skatepark.y, { kind: 'runner', tag: 'speedy', name: 'SPEEDY', hp: 1, speed: 170 }));
      if (mode === 'respawn') return;
      UI.snap('one of them dropped his phone lol');
      UI.snap('it says the chain is with SPEEDY at the skatepark next to the Aquatic Centre 🛹');
      UI.snap(Input.touch ? 'he\'s fast. tap 🛹 to skate and run him down' : 'he\'s fast. press Shift to skate and run him down');
    },
    done: () => G.flags.speedyCaught,
  },
  {
    id: 'westminster', obj: () => 'Find the Kings\' spot behind the dépanneur on Westminster', target: () => World.points.hideout,
    start(mode) {
      if (mode === 'respawn') return;
      UI.snap('SPEEDY FOLDED 😂 he says King Kav took it to their spot on Westminster, behind the dépanneur');
      UI.snap('also u got silver now — hit the Drip Shop at 5911 (E at ur front door) 🛍️');
    },
    done: () => dist(G.player, World.points.hideout) < 240,
  },
  {
    id: 'hideout', obj: () => `Clear the Kings' hideout (${G.questKills}/5)`, target: () => nearestTagged('quest'),
    start(mode) {
      G.questKills = 0;
      G.spawnGroup(World.points.hideout, 5, { tag: 'quest', hp: 44 });
      if (mode === 'respawn') return;
      UI.snap('5 of them 😬 the poutinerie across the street has poutine if u need HP', 'poutine', 'heals u fr');
    },
    done: () => G.questKills >= 5,
  },
  {
    id: 'railyard', obj: () => 'Get into the CP rail yard (gate at the end of Westminster)', target: () => World.points.gate,
    start(mode) {
      World.gateOpen = true;
      if (mode === 'respawn') return;
      UI.snap('the last guy had a note: "CP yard gate code 1904" 💀 the gate is OPEN');
      UI.snap('King Kav is at the CP rail yard with ur chain. bottom of Westminster. be careful fr');
    },
    done: () => G.player.y > 83.6 * TILE,
  },
  {
    id: 'boss', obj: () => 'Take down King Kav 👑', target: () => G.boss,
    start(mode) {
      removeTagged('boss');
      G.boss = new Boss(World.points.arena.x + 120, World.points.arena.y);
      G.flags.bossDown = false;
      if (mode === 'respawn') return;
      UI.snap('THAT\'S HIM. he\'s on an e-scooter 🛴', 'boss', 'King Kav 👑');
      UI.snap('he charges in straight lines. dodge and make him crash into a boxcar, THEN hit him 🚃💥');
    },
    done: () => G.flags.bossDown,
  },
  {
    id: 'chain', obj: () => 'Grab your silver cross chain ⛓️', target: () => G.pickups.find((p) => p.type === 'chain'),
    start() {
      if (!G.pickups.some((p) => p.type === 'chain')) G.pickups.push({ type: 'chain', x: World.points.arena.x, y: World.points.arena.y, seed: 0, t: 0 });
      UI.snap('HE\'S DOWN 😭😭 GRAB UR CHAIN');
    },
    done: () => G.flags.chainBack,
  },
  {
    id: 'party', obj: () => 'Head back to 5911 Brandeis. Emma\'s throwing you a party 🎉', target: () => G.npcs.find((n) => n.kind === 'emma') || World.points.home,
    start(mode) {
      startParty();
      if (mode === 'respawn') return;
      UI.snap('THE CHAIN IS BACK 🔥🔥🔥', 'chain', 'where it belongs ⛓️');
      UI.snap('everyone\'s at urs, I\'m on the front lawn at 5911 🎉 come thru', 'selfie-hearts', 'party at 5911 🎉');
    },
    done: () => dist(G.player, G.npcs.find((n) => n.kind === 'emma') || World.points.home) < 70,
  },
  {
    id: 'free', obj: () => 'Free roam: farm silver, cop the drip, run the block', target: () => null,
    start(mode) {
      startParty();
      if (mode === 'advance') Game.showEnding();
    },
    done: () => false,
  },
];

function taggedOne(tag) { return G.enemies.find((e) => e.tag === tag && !e.ko); }
function nearestTagged(tag) {
  let best = null, bd = Infinity;
  for (const e of G.enemies) if (e.tag === tag && !e.ko) { const d = dist(e, G.player); if (d < bd) { bd = d; best = e; } }
  return best;
}
function removeTagged(tag) { G.enemies = G.enemies.filter((e) => e.tag !== tag); }

function startParty() {
  World.party = true;
  if (G.npcs.length) return;
  const h = World.points.home;
  G.npcs.push({ kind: 'emma', x: h.x + 40, y: h.y + 22, facing: -1, seed: 0 });
  const cols = ['#c77dff', '#3ddcff', '#ff6b9a', '#9dff5c', '#ffb347'];
  const spots = [[-70, 20], [-110, 30], [90, 34], [-40, 50], [130, 20]];
  spots.forEach(([dx, dy], i) => G.npcs.push({
    kind: 'guest', x: h.x + dx, y: h.y + dy, facing: dx > 0 ? -1 : 1, seed: i * 1.7, color: cols[i],
    skin: SKINS[i % SKINS.length], hair: i % 2 ? 'long' : 'buzz', hairColor: ['#2a1d14', '#c9a35a', '#111', '#6b3a1e', '#3a2a20'][i],
  }));
}

// ---------------- Game controller ----------------
const Game = {
  OPTIONAL_SLOTS: ['head', 'face', 'hands', 'neck', 'truck'],

  init() {
    G.canvas = document.getElementById('game');
    G.ctx = G.canvas.getContext('2d');
    G.light = document.createElement('canvas');
    G.lctx = G.light.getContext('2d');
    Input.init();
    World.build();
    UI.init();
    G.save = this.loadSave() || this.defaultSave();
    this.computeStats();
    this.resetWorldEntities();
    for (let i = 0; i < 90; i++) G.snow.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 0.8 + Math.random() * 1.8, v: 25 + Math.random() * 45, ph: Math.random() * TAU });
    addEventListener('resize', () => this.resize());
    this.resize();
    if (this.loadSave() && this.loadSave().step > 0) UI.show('btn-continue');
    const titleCtx = UI.el['title-art'].getContext('2d');
    const drawTitle = () => { if (G.state === 'title') { Sprites.titleArt(titleCtx, this.outfit(), G.time); requestAnimationFrame(drawTitle); } };
    drawTitle();
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      this.tick(dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },

  resize() {
    G.dpr = Math.min(2, window.devicePixelRatio || 1);
    G.canvas.width = Math.floor(innerWidth * G.dpr);
    G.canvas.height = Math.floor(innerHeight * G.dpr);
    G.light.width = G.canvas.width; G.light.height = G.canvas.height;
    G.zoom = clamp(Math.min(innerWidth, innerHeight) / 620, 0.62, 1.3);
  },

  // ---------- Save ----------
  defaultSave() {
    return { silver: 0, owned: ['jacket', 'jeans'], equipped: { body: 'jacket', legs: 'jeans', head: null, face: null, hands: null, neck: null, truck: null }, step: 0, streak: 0, kos: 0, time: 0 };
  },
  loadSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s || typeof s.step !== 'number') return null;
      const d = this.defaultSave();
      return { ...d, ...s, equipped: { ...d.equipped, ...s.equipped }, step: clamp(s.step, 0, STEPS.length - 1) };
    } catch (e) { return null; }
  },
  writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) { /* private mode: play without saving */ } },

  computeStats() {
    const s = { hp: 0, dmg: 0, speed: 0, silver: 0, regen: 0, stealth: 0, truck: 0 };
    for (const id of Object.values(G.save.equipped)) {
      const it = id && itemById(id);
      if (it) for (const k in it.stats) s[k] += it.stats[k];
    }
    G.stats = { maxHp: 100 + s.hp, dmg: 1 + s.dmg, speed: 1 + s.speed, silver: 1 + s.silver, regen: s.regen, aggro: 1 - s.stealth, truck: s.truck };
  },
  outfit() {
    const e = G.save.equipped;
    return { body: e.body, legs: e.legs, head: e.head, face: e.face, hands: e.hands, neck: e.neck };
  },

  // ---------- Flow ----------
  resetWorldEntities() {
    const sp = World.points.spawn, tp = World.points.truck;
    G.player = { x: sp.x, y: sp.y, r: 10, vx: 0, vy: 0, facing: 1, dir: { x: 0, y: 1 }, walk: 0, moving: false, skate: false, hp: G.stats.maxHp, inv: 0, atkCd: 0, punchT: 0, inTruck: false };
    G.truck = { x: tp.x, y: tp.y, angle: tp.a, speed: 0 };
    G.enemies = []; G.boss = null; G.npcs = []; G.particles = []; G.floaters = [];
    G.pickups = G.pickups.filter((p) => p.type === 'chain');
    World.party = false;
    G.flags = {};
    G.cam.x = sp.x - innerWidth / 2; G.cam.y = sp.y - innerHeight / 2;
  },

  newGame() {
    G.save = this.defaultSave();
    G.pickups = [];
    this.writeSave();
    this.begin();
  },
  continueGame() {
    G.save = this.loadSave() || this.defaultSave();
    this.begin();
  },
  begin() {
    Sound.init();
    if (!G.musicStarted) { G.musicStarted = true; Sound.setMusic(true); UI.el['btn-music'].textContent = 'MUSIC: ON'; }
    this.computeStats();
    this.resetWorldEntities();
    World.gateOpen = G.save.step >= 6;
    if (G.save.step >= 7) G.flags.bossDown = G.save.step > 7;
    for (let i = 0; i < 90; i++) this.spawnWorldCoin(true);
    UI.clearSnaps();
    ['title', 'ending', 'dead', 'pause', 'shop'].forEach((id) => UI.show(id, false));
    UI.show('hud'); UI.show('touch', Input.touch);
    G.playerDown = false;
    G.state = 'play';
    G.ambientT = 70;
    this.startStep(G.save.step === 0 ? 'new' : 'load');
    this.snapCamera();
  },
  startStep(mode) { STEPS[G.save.step].start(mode); },
  advance() {
    G.save.step = Math.min(G.save.step + 1, STEPS.length - 1);
    G.save.streak++;
    G.floater(G.player.x, G.player.y - 80, '🔥 SNAP STREAK +1', '#fffc00');
    Sound.play.win();
    this.writeSave();
    UI.snapQueue = [];
    this.startStep('advance');
  },
  objectiveText() { return STEPS[G.save.step].obj(); },
  target() { return STEPS[G.save.step].target(); },

  pause() { if (G.state !== 'play') return; G.state = 'paused'; UI.show('pause'); },
  resume() { ['pause', 'ending', 'shop'].forEach((id) => UI.show(id, false)); G.state = 'play'; },

  openShop() { G.state = 'shop'; Sound.play.door(); UI.renderShop(G); UI.show('shop'); },
  closeShop() { UI.show('shop', false); G.state = 'play'; this.writeSave(); },
  shopClick(it) {
    const s = G.save;
    const owned = s.owned.includes(it.id);
    if (!owned) {
      if (it.quest || s.silver < it.price) { Sound.play.error(); return; }
      s.silver -= it.price; s.owned.push(it.id); s.equipped[it.slot] = it.id; Sound.play.buy();
    } else if (s.equipped[it.slot] === it.id) {
      if (!this.OPTIONAL_SLOTS.includes(it.slot)) return;
      s.equipped[it.slot] = null;
    } else { s.equipped[it.slot] = it.id; Sound.play.door(); }
    const oldMax = G.stats.maxHp;
    this.computeStats();
    G.player.hp = clamp(G.player.hp + Math.max(0, G.stats.maxHp - oldMax), 1, G.stats.maxHp);
    this.writeSave();
    UI.renderShop(G);
  },

  showEnding() {
    G.state = 'ending';
    const c = UI.el['end-art'].getContext('2d');
    c.clearRect(0, 0, 480, 300);
    Sprites.drawArieh(c, 170, 285, { facing: 1, scale: 4.4 }, this.outfit());
    Sprites.drawEmma(c, 320, 285, 0, -1, 4.4);
    const mins = Math.floor(G.save.time / 60), secs = Math.floor(G.save.time % 60);
    UI.el['end-stats'].innerHTML = `<span class="chip">👊 ${G.save.kos} KOs</span><span class="chip">◆ ${G.save.silver} silver</span><span class="chip">🔥 ${G.save.streak} streak</span><span class="chip">⏱ ${mins}m ${secs}s</span>`;
    UI.show('ending');
  },

  respawn() {
    UI.show('dead', false);
    G.save.silver = Math.floor(G.save.silver * 0.8);
    G.enemies = G.enemies.filter((e) => !e.tag);
    G.boss = null;
    const p = G.player, sp = World.points.spawn, tp = World.points.truck;
    Object.assign(p, { x: sp.x, y: sp.y, vx: 0, vy: 0, hp: G.stats.maxHp, inv: 1.5, inTruck: false, skate: false });
    Object.assign(G.truck, { x: tp.x, y: tp.y, angle: tp.a, speed: 0 });
    G.playerDown = false;
    G.state = 'play';
    this.writeSave();
    this.startStep('respawn');
    this.snapCamera();
  },

  snapCamera() {
    const sc = G.dpr * G.zoom, vw = G.canvas.width / sc, vh = G.canvas.height / sc;
    G.zoomCur = G.zoom;
    G.cam.x = clamp(G.player.x - vw / 2, 0, MAP_W * TILE - vw);
    G.cam.y = clamp(G.player.y - vh / 2, 0, MAP_H * TILE - vh);
  },

  spawnWorldCoin(anywhere) {
    const pos = World.randomOpen(null);
    if (!pos) return;
    if (!anywhere && dist(pos, G.player) < 600) return;
    G.pickups.push({ type: 'silver', x: pos.x, y: pos.y, v: 2, seed: Math.random() * 10, t: 0, world: true });
  },

  // ---------- Main tick ----------
  tick(dt) {
    G.time += dt;
    if (Input.take('music')) { const on = Sound.setMusic(!Sound.isMusicOn()); UI.el['btn-music'].textContent = 'MUSIC: ' + (on ? 'ON' : 'OFF'); }
    if (G.state === 'play') {
      if (Input.take('pause')) this.pause();
      else this.update(dt);
    } else if (G.state === 'paused' && Input.take('pause')) this.resume();
    else if (G.state === 'shop' && (Input.take('pause') || Input.take('interact'))) this.closeShop();
    else if (G.state === 'title') {
      const sc = G.dpr * G.zoom;
      G.cam.x = World.points.home.x - G.canvas.width / sc / 2 + Math.sin(G.time * 0.15) * 300;
      G.cam.y = World.points.home.y - G.canvas.height / sc / 2 - 60;
    }
    this.updateSnow(dt);
    this.render();
    Input.endFrame();
  },

  update(dt) {
    const p = G.player, tr = G.truck;
    G.save.time += dt;
    G.sinceHurt += dt;
    G.honkCd -= dt;

    // Interact: truck in/out, shop, Emma
    let prompt = null;
    const nearTruck = !p.inTruck && dist(p, tr) < 95;
    const nearDoor = !p.inTruck && dist(p, World.points.home) < 55;
    if (p.inTruck) prompt = Math.abs(tr.speed) < 60 ? 'E — get out' : null;
    else if (nearTruck) prompt = 'E — drive the Cybertruck';
    else if (nearDoor) prompt = 'E — Drip Shop (5911 Brandeis)';
    UI.prompt(prompt);
    if (Input.take('interact')) {
      if (p.inTruck) this.exitTruck();
      else if (nearTruck) { p.inTruck = true; p.skate = false; Sound.play.door(); }
      else if (nearDoor) { this.openShop(); return; }
    }

    if (p.inTruck) this.updateTruck(dt, true); else { this.updatePlayer(dt); this.updateTruck(dt, false); }

    // regen: gear regen always, plus easy-mode heal when out of combat
    const regen = G.stats.regen + (G.sinceHurt > 4 ? 3 : 0);
    p.hp = Math.min(G.stats.maxHp, p.hp + regen * dt);

    for (const e of G.enemies) e.update(dt, G);
    if (G.boss) G.boss.update(dt, G);
    this.separate();
    G.enemies = G.enemies.filter((e) => !(e.ko && e.koT > 1.3));

    this.updatePickups(dt);
    this.updateSpawners(dt);
    this.updateFx(dt);

    const step = STEPS[G.save.step];
    if (step.done()) this.advance();

    // Emma checks in now and then
    if (G.save.step >= 1) {
      G.ambientT -= dt;
      if (G.ambientT <= 0 && !UI.snapCur && !UI.snapQueue.length) {
        G.ambientT = 80 + Math.random() * 60;
        const a = pick(AMBIENT);
        UI.snap(a[0], a[1], a[2]);
      }
    }
    UI.updateSnaps(dt, G);
    this.updateCamera(dt);
    UI.hud(G);
    UI.minimap(G);
  },

  updatePlayer(dt) {
    const p = G.player, st = G.stats;
    const mv = Input.move();
    if (Input.take('skate')) { p.skate = !p.skate; G.floater(p.x, p.y - 64, p.skate ? '🛹 SKATE' : '🚶 WALK', '#fff'); }
    const onIce = World.tileAt(p.x, p.y) === T.ICE;
    const spd = (p.skate ? 245 : 150) * st.speed;
    const k = onIce ? 1.5 : 14;
    p.vx += (mv.x * spd - p.vx) * Math.min(1, dt * k);
    p.vy += (mv.y * spd - p.vy) * Math.min(1, dt * k);
    moveEntity(p, p.vx * dt, p.vy * dt);
    p.moving = Math.hypot(p.vx, p.vy) > 20;
    if (p.moving) p.walk += dt;
    if (Math.abs(mv.x) > 0.15) p.facing = Math.sign(mv.x);
    const mm = Math.hypot(mv.x, mv.y);
    if (mm > 0.2) p.dir = { x: mv.x / mm, y: mv.y / mm };
    p.atkCd -= dt; p.punchT -= dt; p.inv -= dt;

    if (Input.take('attack') && p.atkCd <= 0) {
      p.atkCd = 0.3; p.punchT = 0.14;
      if (Math.abs(p.dir.x) > 0.1) p.facing = Math.sign(p.dir.x);
      Sound.play.punch();
      // punch lands in front of you (and generously to the side you're facing)
      const ax = Math.abs(p.dir.x) > 0.1 ? p.dir.x : p.facing * 0.5;
      const hx = p.x + ax * 22, hy = p.y + p.dir.y * 22;
      const dmg = 12 * st.dmg * (1 + 0.05 * G.save.streak);
      let hit = false;
      const targets = G.boss ? [...G.enemies, G.boss] : G.enemies;
      for (const e of targets) {
        if (e.ko) continue;
        const d = Math.hypot(e.x - hx, e.y - hy);
        if (d < 30 + e.r) {
          const kx = (e.x - p.x) / (dist(e, p) || 1), ky = (e.y - p.y) / (dist(e, p) || 1);
          e.hurt(dmg, kx * 260, ky * 260, G);
          G.burst(e.x, e.y - 30, '#ffffff', 6);
          G.floater(e.x, e.y - 70, String(Math.round(dmg)), '#ffe14d');
          hit = true;
        }
      }
      if (hit) { Sound.play.hit(); G.shake = Math.max(G.shake, 4); }
    }
  },

  updateTruck(dt, driven) {
    const tr = G.truck, p = G.player;
    let throttle = 0, steer = 0;
    if (driven) {
      if (Input.joy.active) {
        const jx = Input.joy.x, jy = Input.joy.y, m = Math.hypot(jx, jy);
        if (m > 0.25) {
          const want = Math.atan2(jy, jx);
          let d = want - tr.angle;
          while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
          throttle = m; steer = clamp(d * 2, -1, 1);
        }
      } else {
        throttle = (Input.held('up') ? 1 : 0) - (Input.held('down') ? 1 : 0);
        steer = (Input.held('right') ? 1 : 0) - (Input.held('left') ? 1 : 0);
      }
      if (Input.take('attack') && G.honkCd <= 0) {
        G.honkCd = 0.8; Sound.play.honk();
        G.floater(tr.x, tr.y - 50, 'HONK! 📢', '#fffc00');
        for (const e of G.enemies) if (!e.ko && dist(e, tr) < 170) e.stun = Math.max(e.stun, 1.3);
      }
    }
    const tile = World.tileAt(tr.x, tr.y);
    const offroad = tile === T.GRASS || tile === T.GRAVEL;
    const max = 420 * (1 + G.stats.truck) * (offroad ? 0.6 : 1);
    if (throttle > 0) tr.speed += (tr.speed < 0 ? 900 : 340) * throttle * dt;
    else if (throttle < 0) tr.speed -= (tr.speed > 0 ? 700 : 240) * -throttle * dt;
    else tr.speed -= Math.sign(tr.speed) * Math.min(Math.abs(tr.speed), (tile === T.ICE ? 60 : 260) * dt);
    if (tr.speed > max) tr.speed = Math.max(max, tr.speed - 600 * dt);
    tr.speed = clamp(tr.speed, -170, 520);

    const turn = 2.7 * clamp(tr.speed / 150, -1, 1);
    const oldA = tr.angle;
    tr.angle += steer * turn * dt;
    if (this.truckHits(tr.x, tr.y, tr.angle)) tr.angle = oldA;

    const d = tr.speed * dt, steps = Math.max(1, Math.ceil(Math.abs(d) / 8));
    const cx = Math.cos(tr.angle), cy = Math.sin(tr.angle);
    for (let i = 0; i < steps; i++) {
      const nx = tr.x + (cx * d) / steps, ny = tr.y + (cy * d) / steps;
      if (this.truckHits(nx, ny, tr.angle)) {
        if (Math.abs(tr.speed) > 220) { Sound.play.crash(); G.shake = 8; }
        tr.speed *= -0.3;
        break;
      }
      tr.x = nx; tr.y = ny;
    }

    // bump Kings out of the way
    if (Math.abs(tr.speed) > 110) {
      const targets = G.boss ? [...G.enemies, G.boss] : G.enemies;
      for (const e of targets) {
        if (e.ko || e.bumpCd > 0) continue;
        const rx = e.x - tr.x, ry = e.y - tr.y;
        const along = clamp(rx * cx + ry * cy, -40, 40);
        const px = tr.x + cx * along, py = tr.y + cy * along;
        if (Math.hypot(e.x - px, e.y - py) < e.r + 20) {
          e.bumpCd = 0.6;
          const nx = (e.x - px) || -cy, ny = (e.y - py) || cx, nm = Math.hypot(nx, ny) || 1;
          e.hurt(14 + Math.abs(tr.speed) / 16, (nx / nm) * 320 + cx * tr.speed * 0.4, (ny / nm) * 320 + cy * tr.speed * 0.4, G);
          tr.speed *= 0.7;
          Sound.play.hit(); G.shake = Math.max(G.shake, 5);
          G.burst(e.x, e.y - 20, '#ffffff', 8);
        }
      }
    }
    if (driven) { p.x = tr.x; p.y = tr.y; }
  },

  truckHits(x, y, a) {
    const cx = Math.cos(a), cy = Math.sin(a);
    for (const o of [-26, 0, 26]) if (circleHitsSolid(x + cx * o, y + cy * o, 17)) return true;
    return false;
  },

  exitTruck() {
    const tr = G.truck, p = G.player;
    if (Math.abs(tr.speed) > 60) return;
    const cx = Math.cos(tr.angle), cy = Math.sin(tr.angle);
    const spots = [[-cy * 42, cx * 42], [cy * 42, -cx * 42], [-cx * 62, -cy * 62], [cx * 62, cy * 62]];
    for (const [ox, oy] of spots) {
      if (!circleHitsSolid(tr.x + ox, tr.y + oy, p.r)) {
        p.x = tr.x + ox; p.y = tr.y + oy; p.vx = p.vy = 0; p.inTruck = false; tr.speed = 0;
        Sound.play.door();
        return;
      }
    }
  },

  separate() {
    const list = G.enemies;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (a.ko || b.ko) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d > 0 && d < 22) {
        const push = (22 - d) / 2, nx = dx / d, ny = dy / d;
        moveEntity(a, -nx * push, -ny * push); moveEntity(b, nx * push, ny * push);
      }
    }
  },

  updatePickups(dt) {
    const p = G.player;
    const reach = p.inTruck ? 46 : 24;
    for (const k of G.pickups) {
      k.t += dt;
      if (k.vx || k.vy) {
        k.r = 4;
        moveEntity(k, k.vx * dt, k.vy * dt);
        k.vx *= Math.max(0, 1 - dt * 4); k.vy *= Math.max(0, 1 - dt * 4);
        if (Math.abs(k.vx) < 2) k.vx = 0; if (Math.abs(k.vy) < 2) k.vy = 0;
      }
      const d = dist(p, k);
      if (k.type === 'silver' && d < 90 && k.t > 0.3) {
        const s = Math.min(d, 380 * dt);
        k.x += ((p.x - k.x) / (d || 1)) * s; k.y += ((p.y - k.y) / (d || 1)) * s;
      }
      if (d < reach && k.t > 0.2) {
        k.dead = true;
        switch (k.type) {
          case 'silver': G.save.silver += k.v; Sound.play.coin(); G.floater(k.x, k.y - 20, `+${k.v}`, '#dfe3e8'); break;
          case 'poutine': p.hp = Math.min(G.stats.maxHp, p.hp + 50); Sound.play.heal(); G.floater(k.x, k.y - 20, '🍟 POUTINE +50', '#ffcc33'); G.foodT.poutine = 25; break;
          case 'bagel': p.hp = Math.min(G.stats.maxHp, p.hp + 25); Sound.play.heal(); G.floater(k.x, k.y - 20, '🥯 BAGEL +25', '#ffcc33'); if (k.shop) G.foodT.bagel = 25; break;
          case 'chain':
            G.flags.chainBack = true;
            if (!G.save.owned.includes('chain')) G.save.owned.push('chain');
            G.save.equipped.neck = 'chain';
            this.computeStats(); p.hp = G.stats.maxHp;
            Sound.play.win(); G.shake = 6;
            G.burst(k.x, k.y, '#ffffff', 30);
            G.floater(k.x, k.y - 40, '⛓️ CHAIN SECURED', '#ffffff');
            break;
        }
      }
    }
    G.pickups = G.pickups.filter((k) => !k.dead);
  },

  updateSpawners(dt) {
    // world silver keeps coming back
    G.coinT -= dt;
    if (G.coinT <= 0) {
      G.coinT = 1.5;
      if (G.pickups.filter((k) => k.world).length < 90) this.spawnWorldCoin(false);
    }
    // food at the poutinerie and the bagel shop
    for (const f of ['poutine', 'bagel']) {
      G.foodT[f] -= dt;
      if (G.foodT[f] <= 0 && !G.pickups.some((k) => k.type === f && k.shop)) {
        const pt = World.points[f];
        G.pickups.push({ type: f, x: pt.x, y: pt.y, seed: Math.random() * 10, t: 1, shop: true });
      }
    }
    // roaming Kings
    G.spawnT -= dt;
    if (G.spawnT > 0 || G.save.step < 2) return;
    G.spawnT = 5;
    for (const [id, reg] of Object.entries(World.regions)) {
      if (id === 'yard' && !World.gateOpen) continue;
      if (id === 'mall' && G.save.step < 3) continue;
      const n = G.enemies.filter((e) => e.region === id && !e.ko).length;
      if (n >= 2 || Math.random() < 0.5) continue;
      const pos = World.randomOpen(reg);
      if (pos && dist(pos, G.player) > 650 && !circleHitsSolid(pos.x, pos.y, 12)) G.enemies.push(new King(pos.x, pos.y, { region: id }));
    }
  },

  updateFx(dt) {
    for (const q of G.particles) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; q.life -= dt;
    }
    G.particles = G.particles.filter((q) => q.life > 0);
    for (const f of G.floaters) { f.y -= 32 * dt; f.life -= dt; }
    G.floaters = G.floaters.filter((f) => f.life > 0);
    G.shake = Math.max(0, G.shake - dt * 30);
    if (World.party && Math.random() < dt * 8) {
      const h = World.points.home;
      G.particles.push({ x: h.x + (Math.random() - 0.5) * 220, y: h.y - 160 - Math.random() * 40, vx: (Math.random() - 0.5) * 30, vy: 40, g: 20, life: 3, max: 3, color: pick(['#ff3b6b', '#ffe14d', '#3ddcff', '#9dff5c', '#c77dff']), size: 3 });
    }
  },

  updateCamera(dt) {
    const p = G.player, tr = G.truck;
    G.zoomCur += (G.zoom * (p.inTruck ? 0.8 : 1) - G.zoomCur) * Math.min(1, dt * 2);
    const sc = G.dpr * G.zoomCur, vw = G.canvas.width / sc, vh = G.canvas.height / sc;
    const look = p.inTruck ? 0.35 : 0;
    const tx = p.x + Math.cos(tr.angle) * tr.speed * look, ty = p.y + Math.sin(tr.angle) * tr.speed * look - 20;
    G.cam.x += (tx - vw / 2 - G.cam.x) * Math.min(1, dt * 6);
    G.cam.y += (ty - vh / 2 - G.cam.y) * Math.min(1, dt * 6);
    G.cam.x = clamp(G.cam.x, 0, Math.max(0, MAP_W * TILE - vw));
    G.cam.y = clamp(G.cam.y, 0, Math.max(0, MAP_H * TILE - vh));
  },

  updateSnow(dt) {
    for (const s of G.snow) {
      s.y += s.v * dt; s.x += Math.sin(G.time + s.ph) * 12 * dt - 6 * dt;
      if (s.y > innerHeight + 5) { s.y = -5; s.x = Math.random() * innerWidth; }
      if (s.x < -5) s.x = innerWidth + 5;
    }
  },

  // ---------- Render ----------
  render() {
    const ctx = G.ctx, W = G.canvas.width, H = G.canvas.height;
    const sc = G.dpr * (G.state === 'title' ? G.zoom : G.zoomCur);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0d14'; ctx.fillRect(0, 0, W, H);
    const shx = (Math.random() - 0.5) * G.shake, shy = (Math.random() - 0.5) * G.shake;
    const view = { x: G.cam.x + shx, y: G.cam.y + shy, w: W / sc, h: H / sc };
    ctx.setTransform(sc, 0, 0, sc, -view.x * sc, -view.y * sc);

    World.draw(ctx, view, G.time);

    const inView = (o, m = 80) => o.x > view.x - m && o.x < view.x + view.w + m && o.y > view.y - m && o.y < view.y + view.h + m;
    for (const k of G.pickups) if (inView(k)) Sprites.drawPickup(ctx, k, G.time);

    // boss telegraph
    const b = G.boss;
    if (b && !b.ko && b.state === 'aim') {
      ctx.save(); ctx.strokeStyle = 'rgba(255,40,60,0.7)'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.dir.x * 520, b.y + b.dir.y * 520); ctx.stroke(); ctx.restore();
    }

    // y-sorted characters + truck
    const p = G.player, tr = G.truck;
    const draw = [];
    draw.push({ y: tr.y + 10, f: () => Sprites.drawTruck(ctx, tr, G.save.equipped.truck === 'rims', G.time) });
    if (!p.inTruck && G.state !== 'title') draw.push({ y: p.y, f: () => Sprites.drawArieh(ctx, p.x, p.y, { facing: p.facing, walk: p.walk, moving: p.moving, punch: p.punchT > 0, skate: p.skate, blink: p.inv > 0 && Math.floor(G.time * 20) % 2 === 0 }, this.outfit()) });
    for (const e of G.enemies) if (inView(e)) draw.push({ y: e.y, f: () => Sprites.drawKing(ctx, e, G.time) });
    if (b && inView(b, 120)) draw.push({ y: b.y, f: () => Sprites.drawBoss(ctx, b, G.time) });
    for (const n of G.npcs) if (inView(n)) {
      if (n.kind === 'emma') draw.push({ y: n.y, f: () => { Sprites.drawEmma(ctx, n.x, n.y, G.time, n.facing); ctx.font = '800 11px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fffc00'; ctx.fillText('EMMA FISHER', n.x, n.y - 64); } });
      else draw.push({ y: n.y, f: () => Sprites.drawGuest(ctx, n, G.time) });
    }
    draw.sort((a, c) => a.y - c.y);
    for (const d of draw) d.f();

    for (const q of G.particles) {
      ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
      ctx.fillStyle = q.color; ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (const f of G.floaters) {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.font = '900 15px Inter, Arial';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    if (G.state !== 'title') this.drawObjectiveMarker(ctx, view);
    this.renderLights(sc, view);
    this.renderSnow();
  },

  drawObjectiveMarker(ctx, view) {
    const tgt = this.target();
    if (!tgt) return;
    const p = G.player;
    const d = dist(p, tgt);
    const onScreen = tgt.x > view.x && tgt.x < view.x + view.w && tgt.y > view.y && tgt.y < view.y + view.h;
    if (onScreen) {
      const bob = Math.sin(G.time * 5) * 5;
      ctx.fillStyle = '#fffc00'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tgt.x, tgt.y - 76 + bob); ctx.lineTo(tgt.x - 9, tgt.y - 92 + bob); ctx.lineTo(tgt.x + 9, tgt.y - 92 + bob); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    if (d > 160) {
      const a = Math.atan2(tgt.y - p.y, tgt.x - p.x), R = p.inTruck ? 72 : 50;
      ctx.save(); ctx.translate(p.x + Math.cos(a) * R, p.y - 22 + Math.sin(a) * R); ctx.rotate(a);
      ctx.fillStyle = '#fffc00'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-3, 0); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.font = '800 11px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fffc00';
      ctx.fillText(`${Math.round(d / TILE * 2)}m`, p.x + Math.cos(a) * (R + 24), p.y - 18 + Math.sin(a) * (R + 24));
    }
  },

  renderLights(sc, view) {
    const L = G.lctx, W = G.light.width, H = G.light.height;
    L.setTransform(1, 0, 0, 1, 0, 0);
    L.globalCompositeOperation = 'source-over';
    L.clearRect(0, 0, W, H);
    L.fillStyle = 'rgba(6,8,28,0.58)'; L.fillRect(0, 0, W, H);
    L.globalCompositeOperation = 'destination-out';
    L.setTransform(sc, 0, 0, sc, -view.x * sc, -view.y * sc);
    const hole = (x, y, r, a) => {
      if (x < view.x - r || x > view.x + view.w + r || y < view.y - r || y > view.y + view.h + r) return;
      const g = L.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      L.fillStyle = g; L.fillRect(x - r, y - r, r * 2, r * 2);
    };
    for (const l of World.lamps) hole(l.x, l.y, l.flood ? 230 : 150, 0.85);
    const p = G.player, tr = G.truck;
    if (!p.inTruck) hole(p.x, p.y - 20, 190, 0.55);
    const cx = Math.cos(tr.angle), cy = Math.sin(tr.angle);
    hole(tr.x, tr.y, 80, 0.4);
    if (p.inTruck) { hole(tr.x + cx * 110, tr.y + cy * 110, 120, 0.8); hole(tr.x + cx * 200, tr.y + cy * 200, 100, 0.55); }
    if (World.party) hole(World.points.home.x, World.points.home.y - 30, 240, 0.75);
    const c = G.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(G.light, 0, 0);

    // warm glows on top
    c.setTransform(sc, 0, 0, sc, -view.x * sc, -view.y * sc);
    c.globalCompositeOperation = 'lighter';
    for (const l of World.lamps) {
      if (l.x < view.x - 40 || l.x > view.x + view.w + 40 || l.y < view.y - 40 || l.y > view.y + view.h + 40) continue;
      c.fillStyle = 'rgba(255,200,110,0.12)'; c.beginPath(); c.arc(l.x, l.y, 26, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,230,170,0.8)'; c.beginPath(); c.arc(l.x, l.y, 3.5, 0, TAU); c.fill();
    }
    if (World.party) {
      const h = World.points.home;
      const cols = ['rgba(255,59,107,0.10)', 'rgba(61,220,255,0.10)', 'rgba(199,125,255,0.10)'];
      for (let i = 0; i < 3; i++) {
        const a = G.time * 1.5 + i * 2.1;
        c.fillStyle = cols[i]; c.beginPath(); c.arc(h.x + Math.cos(a) * 60, h.y - 40 + Math.sin(a) * 30, 90, 0, TAU); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over';
  },

  renderSnow() {
    const c = G.ctx;
    c.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    for (const s of G.snow) { c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); }
  },
};

// ---------------- Helpers used by entities ----------------
G.hurtPlayer = (dmg, kx, ky) => {
  const p = G.player;
  if (p.inv > 0 || p.inTruck || G.state !== 'play') return;
  p.hp -= dmg; p.inv = 0.5; G.sinceHurt = 0;
  p.vx += kx * 300; p.vy += ky * 300;
  Sound.play.hurt(); G.shake = Math.max(G.shake, 6);
  G.floater(p.x, p.y - 70, `-${dmg}`, '#ff4d5a');
  UI.flashDamage();
  if (p.hp <= 0) {
    p.hp = 0; G.playerDown = true; G.state = 'dead';
    UI.el['dead-line'].textContent = pick(DEAD_LINES);
    UI.show('dead');
  }
};
G.onKO = (e) => {
  G.save.kos++;
  Sound.play.ko();
  G.burst(e.x, e.y - 20, e.kind === 'boss' ? '#c77dff' : '#ff4d5a', e.kind === 'boss' ? 30 : 12);
  if (e.kind === 'boss') {
    G.flags.bossDown = true;
    G.pickups.push({ type: 'chain', x: e.x, y: e.y, seed: 0, t: 0, vx: 0, vy: 0 });
    for (let i = 0; i < 15; i++) G.dropCoin(e.x, e.y, 4);
    for (const k of G.enemies) if (k.tag === 'boss' && !k.ko) { k.ko = true; k.koT = 0; }
    return;
  }
  if (e.tag === 'quest') G.questKills++;
  if (e.kind === 'runner') {
    G.flags.speedyCaught = true;
    G.floater(e.x, e.y - 80, 'CAUGHT SPEEDY!', '#fffc00');
    for (let i = 0; i < 8; i++) G.dropCoin(e.x, e.y, 3);
    return;
  }
  const n = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) G.dropCoin(e.x, e.y, Math.round(3 * G.stats.silver));
  if (Math.random() < 0.2) G.pickups.push({ type: 'bagel', x: e.x, y: e.y, seed: Math.random() * 10, t: 0, vx: 0, vy: 0 });
};
G.dropCoin = (x, y, v) => {
  const a = Math.random() * TAU, s = 80 + Math.random() * 120;
  G.pickups.push({ type: 'silver', x, y, v, vx: Math.cos(a) * s, vy: Math.sin(a) * s, seed: Math.random() * 10, t: 0 });
};
G.spawnGroup = (center, n, opts) => {
  for (let i = 0; i < n; i++) {
    let pos = { x: center.x, y: center.y };
    for (let k = 0; k < 60; k++) {
      const a = Math.random() * TAU, d = 30 + Math.random() * 130;
      const px = center.x + Math.cos(a) * d, py = center.y + Math.sin(a) * d;
      if (!circleHitsSolid(px, py, 14) && World.tileAt(px, py) !== T.GATE) { pos = { x: px, y: py }; break; }
    }
    G.enemies.push(new King(pos.x, pos.y, opts));
  }
};
G.burst = (x, y, color, n) => {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, s = 60 + Math.random() * 160;
    G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, g: 260, life: 0.5 + Math.random() * 0.4, max: 0.9, color, size: 3 });
  }
};
G.floater = (x, y, text, color) => G.floaters.push({ x, y, text, color, life: 1.3 });

addEventListener('load', () => Game.init());
