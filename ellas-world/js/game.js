'use strict';
// Ella's World: the café scene, customers, the kitchen, animal care, the shop, days and saving.
(() => {
  const W = 960, H = 540;
  const $ = (id) => document.getElementById(id);
  const canvas = $('scene'), ctx = canvas.getContext('2d'), stage = $('stage');
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Menu ----------
  const ING = {
    mango: { e: '🥭', n: 'Mango' }, banana: { e: '🍌', n: 'Banana' }, ice: { e: '🧊', n: 'Ice' },
    egg: { e: '🥚', n: 'Egg' }, flour: { e: '🌾', n: 'Flour' }, honey: { e: '🍯', n: 'Honey' },
    cacao: { e: '🍫', n: 'Cacao' }, milk: { e: '🥛', n: 'Milk' }, cream: { e: '🍦', n: 'Whipped cream' },
    strawberry: { e: '🍓', n: 'Strawberry' }, sprinkles: { e: '🌈', n: 'Rainbow sprinkles' },
    pineapple: { e: '🍍', n: 'Pineapple' }, kiwi: { e: '🥝', n: 'Kiwi' }, coconut: { e: '🥥', n: 'Coconut' },
    tea: { e: '🍵', n: 'Tea' }, pearls: { e: '🟤', n: 'Tapioca pearls' },
  };
  // day = the café day the recipe is unlocked on.
  const RECIPES = {
    mango: { name: 'Mango Smoothie', short: 'Mango Smoothie', icon: '🥤', vessel: 'cup', a: 'a', ings: ['mango', 'banana', 'ice'], act: { e: '🌀', label: 'Blend', sfx: 'blend' }, day: 1, price: 8 },
    pancakes: { name: 'Banana Pancakes', short: 'Pancakes', icon: '🥞', vessel: 'plate', a: 'some', ings: ['egg', 'flour', 'banana', 'honey'], act: { e: '🍳', label: 'Flip', sfx: 'sizzle' }, day: 1, price: 10 },
    cocoa: { name: 'Rainforest Hot Cocoa', short: 'Hot Cocoa', icon: '☕', vessel: 'mug', a: 'a', ings: ['cacao', 'milk', 'cream'], act: { e: '🥄', label: 'Stir', sfx: 'clink' }, day: 2, price: 9 },
    cupcake: { name: 'Rainbow Cupcake', short: 'Cupcake', icon: '🧁', vessel: 'plate', a: 'a', ings: ['flour', 'egg', 'strawberry', 'sprinkles'], act: { e: '🔥', label: 'Bake', sfx: 'sizzle' }, day: 3, price: 12 },
    fruit: { name: 'Jungle Fruit Bowl', short: 'Fruit Bowl', icon: '🥣', vessel: 'bowl', a: 'a', ings: ['pineapple', 'kiwi', 'strawberry', 'coconut'], act: { e: '🥄', label: 'Mix', sfx: 'clink' }, day: 4, price: 11 },
    bubble: { name: 'Axolotl Bubble Tea', short: 'Bubble Tea', icon: '🧋', vessel: 'cup', a: 'an', ings: ['tea', 'milk', 'strawberry', 'pearls'], act: { e: '🤲', label: 'Shake', sfx: 'blend' }, day: 5, price: 12 },
  };
  const TAPS = 6;

  // ---------- Visitors ----------
  // Ella's family. To add someone, copy Sarah and change the look and lines.
  const FAMILY = [
    {
      id: 'sarah', name: 'Sarah', family: true, draw: 'kid',
      look: { hair: '#7a4a2a', hairDark: '#56331b', skin: '#ffe3cf', shirt: '#8e6bd8', legs: '#34477a', shoes: '#f5f5f5', style: 'long', scale: 1.12 },
      order: ['Hi {ella}! Can I have {a} {item}, please?', "Hey little sis! I'd like {a} {item}, please!", "Ooh, I'd love {a} {item}, please!"],
      fav: 'My favourite! {A} {item}, please!',
      thanks: ['Wow, {ella}! This is amazing!', 'Yum! Best café in the whole rainforest!', "You're the best little sister ever!"],
    },
  ];
  const ANIMALS = [
    { id: 'toucan', name: 'Tico the Toucan', short: 'Tico', draw: 'toucan', sound: 'Squawk!', order: ['Squawk! {A} {item}, please!', 'Squawk! {A} {item} for me!'], thanks: ['Squawk-tastic! Thank you!'] },
    { id: 'sloth', name: 'Sunny the Sloth', short: 'Sunny', draw: 'sloth', sound: 'Hmmmm...', order: ['Hiii... {ella}... {a}... {item}... pleeease...'], thanks: ['Thaaank... youuu...'] },
    { id: 'frog', name: 'Pip the Frog', short: 'Pip', draw: 'frog', sound: 'Ribbit!', order: ["Ribbit! I'd love {a} {item}!", 'Ribbit ribbit! {A} {item}, please!'], thanks: ['Ribbit! Hoppy, hoppy day!'] },
    { id: 'capy', name: 'Coco the Capybara', short: 'Coco', draw: 'capybara', sound: 'Wheek!', order: ['Hello, friend. {A} {item}, if you please.'], thanks: ['Most relaxing. Thank you!'] },
  ];
  const VISITORS = Object.fromEntries([...FAMILY, ...ANIMALS].map((v) => [v.id, v]));

  const DOG_LINES = {
    hungry: { talk: ['My tummy is rumbling, {ella}!', "Is it snack time? I think it's snack time!"], sound: '*whine* 🦴' },
    bored: { talk: ["Can we play ball? Pleeease?", "I'm sooo bored. Let's play!"], sound: 'Woof? Woof!' },
    treat: { talk: ['Crunch crunch! Yummy!', 'Best. Treat. Ever!'], sound: '*crunch crunch*' },
    full: { talk: ["I'm full! Maybe later."], sound: '*sniff* ... *yawn*' },
    ball: { talk: ['Again! Again!', "I'm the fastest dog in the rainforest!"], sound: 'WOOF! WOOF!' },
    pet: { talk: ["That's the spot!", 'I love you, {ella}!'], sound: '*happy wiggle*' },
    water: { talk: ['Slurp slurp! Ahhh.'], sound: '*slurp slurp*' },
    hi: { talk: ['Hi {ella}!', 'Woof! Hi!'], sound: 'Woof!' },
  };
  const AXO_LINES = {
    fed: { talk: ['Yum, worms! Thank you, {ella}!', 'Nom nom nom!'], sound: '*happy wiggle*' },
    full: { talk: ["We're full! Blub."], sound: 'blub.' },
    clean: { talk: ['Sparkly clean! We love it!'], sound: '*sparkly swim*' },
    hungry: { talk: ["{ella}! We're hungry!"], sound: 'blub... blub...' },
    dirty: { talk: ['Our pond is getting mucky...'], sound: 'blub?' },
    hi: { talk: ['Hi {ella}! Watch us twirl!', 'We love living here!'], sound: '*twirl*' },
  };
  const ELLA_LINES = ['Welcome to {cafe}!', 'I love my café!', "{dog}, you're the best!", 'What should I make next?'];

  const AXO_START = [{ name: 'Bubbles', colour: 'pink' }, { name: 'Mochi', colour: 'lilac' }];
  const SHOP = [
    { id: 'lights', name: 'Fairy lights', icon: '💡', cost: 20, cur: 'coins' },
    { id: 'baskets', name: 'Flower baskets', icon: '🌺', cost: 15, cur: 'coins' },
    { id: 'lanterns', name: 'Paper lanterns', icon: '🏮', cost: 30, cur: 'coins' },
    { id: 'rainbow', name: 'Waterfall rainbow', icon: '🌈', cost: 50, cur: 'coins' },
    { id: 'bed', name: 'Comfy bed for {dog}', icon: '🛏️', cost: 20, cur: 'hearts' },
    { id: 'butterflies', name: 'Butterfly friends', icon: '🦋', cost: 25, cur: 'hearts' },
    { id: 'goldie', name: 'Goldie the gold axolotl', axo: 'gold', cost: 30, cur: 'hearts' },
    { id: 'splash', name: 'Splash the blue axolotl', axo: 'blue', cost: 45, cur: 'hearts' },
  ];

  // ---------- Layout ----------
  const EX = 230, EY = 364;            // Ella, behind the counter
  const AX = 140, AY = 508;            // the dog, lying in front of the counter
  const PX = 770, PY = 452, PRX = 160, PRY = 64; // axolotl pond
  const SPOT = { x: 450, y: 478 };     // where customers stand to order
  const PATH = [{ x: 1010, y: 360 }, { x: 570, y: 360 }, SPOT];

  // ---------- Save ----------
  const SAVE_KEY = 'ellasWorld.v1';
  function freshSave() {
    return {
      setupDone: false, cafeName: '', dogName: CONFIG.dogName, talk: CONFIG.animalsTalk,
      read: true, sound: true, music: true,
      coins: 0, hearts: 0, day: 1, servedToday: 0, served: 0, todayList: [], dayCoins: 0, dayHearts: 0,
      owned: [], tummy: 70, fun: 60, pondFood: 55, algae: [{ x: 700, y: 440 }, { x: 830, y: 470 }],
    };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && typeof s === 'object') return { ...freshSave(), ...s }; } catch (e) { /* no save */ }
    return freshSave();
  }
  let S = load();
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }

  const cafeName = () => S.cafeName.trim() || CONFIG.cafeNameIdeas[0];
  const dogName = () => S.dogName.trim() || CONFIG.dogName;
  const fmt = (s, extra = {}) => s.replace(/\{(\w+)\}/g, (m, k) => ({ ella: CONFIG.playerName, dog: dogName(), cafe: cafeName(), ...extra })[k] ?? m);
  const line = (set) => fmt(S.talk === false ? set.sound : pick(set.talk));
  const unlocked = () => Object.keys(RECIPES).filter((id) => RECIPES[id].day <= S.day);
  const owns = (id) => S.owned.includes(id);

  // ---------- Runtime state ----------
  const R = {
    t: 0, started: false, customer: null, nextIn: 1.5, summaryOpen: false,
    particles: [], says: {}, worms: [], axos: [], butterflies: [],
    dog: { chew: 0, happy: 0, look: 0, lap: 0, ball: null, pet: 0, bowl: 0 },
    ellaWave: 0, kitchen: null, tray: null, hover: false,
    algaeTimer: 30, nagTimer: 20, hintTimer: 0, saveTimer: 0, bubbleRect: null,
  };
  function syncAxolotls() {
    const want = [...AXO_START, ...SHOP.filter((i) => i.axo && owns(i.id)).map((i) => ({ name: i.name.split(' ')[0], colour: i.axo }))];
    while (R.axos.length < want.length) {
      const a = want[R.axos.length];
      R.axos.push({ ...a, x: PX + rand(-80, 80), y: PY + rand(-20, 20), ang: rand(0, 6), tx: PX, ty: PY, speed: rand(26, 38), wait: 0, seed: rand(0, 9) });
    }
  }
  syncAxolotls();
  for (let i = 0; i < 4; i++) R.butterflies.push({ seed: rand(0, 100), colour: pick(['#3f8cff', '#ff9f43', '#ff5d8f', '#ffd54a']) });

  // ---------- Speech ----------
  function speak(text) {
    if (!S.read || !('speechSynthesis' in window)) return;
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\*/g, '').trim();
    if (!clean) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 0.95; u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch (e) { /* speech not available */ }
  }
  function say(who, text, dur = 3.6, read = true) {
    R.says[who] = { text, until: R.t + dur };
    if (read) speak(text);
  }

  // ---------- Particles ----------
  function burst(e, x, y, n = 5, size = 22) {
    for (let i = 0; i < n; i++) {
      R.particles.push({ e, x: x + rand(-14, 14), y: y + rand(-8, 8), vx: rand(-50, 50), vy: rand(-110, -50), life: 0, max: rand(1, 1.6), size });
    }
  }
  function flyTo(e, x, y, target, n = 4) {
    const r = $(target).getBoundingClientRect(), sr = canvas.getBoundingClientRect();
    const tx = (r.left + r.width * 0.25 - sr.left) * W / sr.width, ty = (r.top + r.height / 2 - sr.top) * H / sr.height;
    for (let i = 0; i < n; i++) R.particles.push({ e, fly: true, sx: x + rand(-15, 15), sy: y + rand(-15, 15), tx, ty, life: -i * 0.09, max: 0.8, size: 24 });
  }
  function textPop(text, x, y, colour = '#fff') {
    R.particles.push({ text, colour, x, y, vx: 0, vy: -40, life: 0, max: 1.4, size: 26 });
  }

  // ---------- Money ----------
  function addCoins(n, x, y) {
    S.coins += n; S.dayCoins += n;
    flyTo('🪙', x, y, 'coins', Math.min(6, 2 + Math.floor(n / 3)));
    textPop(`+${n}`, x, y - 20, '#ffe066');
    Sound.coin(); bumpChip('coins');
  }
  function addHearts(n, x, y) {
    S.hearts += n; S.dayHearts += n;
    flyTo('❤️', x, y, 'hearts', Math.min(5, n + 1));
    Sound.heart(); bumpChip('hearts');
  }
  function bumpChip(id) {
    const el = $(id); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    setTimeout(updateHud, 700);
  }
  function updateHud() {
    $('coins').textContent = `🪙 ${S.coins}`;
    $('hearts').textContent = `❤️ ${S.hearts}`;
    $('day').textContent = `☀️ Day ${S.day} · ${S.servedToday}/${S.todayList.length || CONFIG.customersPerDay(S.day)}`;
  }

  // ---------- Days & customers ----------
  function buildDayList() {
    const list = ['sarah'];
    const n = CONFIG.customersPerDay(S.day);
    while (list.length < n) {
      const id = pick(ANIMALS).id;
      if (id !== list[list.length - 1]) list.push(id);
    }
    S.todayList = list; S.servedToday = 0; S.dayCoins = 0; S.dayHearts = 0;
  }
  function pickOrder(v) {
    if (v.id === 'sarah' && RECIPES[CONFIG.sarahFavourite]) return CONFIG.sarahFavourite;
    const fresh = unlocked().filter((id) => RECIPES[id].day === S.day);
    if (S.servedToday === 0 && S.day > 1 && fresh.length) return pick(fresh); // show off the new recipe first
    return pick(unlocked());
  }
  function spawnCustomer() {
    const v = VISITORS[S.todayList[S.servedToday]] || VISITORS.sarah;
    R.customer = { v, x: PATH[0].x, y: PATH[0].y, leg: 1, state: 'in', t: 0, order: pickOrder(v), served: null };
    Sound.bell();
  }
  function talks(v) { return v.family || S.talk !== false; }
  function orderText(c) {
    const r = RECIPES[c.order];
    if (!talks(c.v)) return c.v.sound;
    const tpl = c.v.id === 'sarah' && CONFIG.sarahFavourite === c.order ? c.v.fav : pick(c.v.order);
    return fmt(tpl, { item: r.name, a: r.a, A: r.a[0].toUpperCase() + r.a.slice(1) });
  }
  function moveAlong(c, dt, forward) {
    const speed = 170;
    let left = speed * dt;
    while (left > 0) {
      const target = PATH[c.leg];
      if (!target) return true;
      const dx = target.x - c.x, dy = target.y - c.y, d = Math.hypot(dx, dy);
      if (d <= left) { c.x = target.x; c.y = target.y; left -= d; c.leg += forward ? 1 : -1; if (c.leg < 0 || c.leg >= PATH.length) return true; }
      else { c.x += dx / d * left; c.y += dy / d * left; left = 0; }
    }
    return false;
  }
  function updateCustomer(dt) {
    const c = R.customer;
    if (!c) {
      if (!R.started || R.summaryOpen) return;
      if (S.servedToday >= S.todayList.length) { showSummary(); return; }
      R.nextIn -= dt;
      if (R.nextIn <= 0) spawnCustomer();
      return;
    }
    c.t += dt;
    if (c.state === 'in') {
      if (moveAlong(c, dt, true)) {
        c.state = 'wait'; c.t = 0;
        c.text = orderText(c);
        speak(c.text);
      }
    } else if (c.state === 'happy') {
      if (c.t > 2.4) { c.state = 'out'; c.t = 0; c.leg = PATH.length - 2; }
    } else if (c.state === 'out') {
      if (moveAlong(c, dt, false)) { R.customer = null; R.nextIn = 2.2; }
    }
  }
  function serve() {
    const k = R.kitchen, c = R.customer;
    if (!k || !c) return;
    const r = RECIPES[k.rid];
    closeModal('kitchen');
    c.state = 'happy'; c.t = 0; c.served = r.icon;
    c.text = talks(c.v) ? fmt(pick(c.v.thanks)) : `${c.v.sound} 💕`;
    speak(c.text);
    R.ellaWave = 2;
    S.servedToday++; S.served++;
    addCoins(r.price + Math.floor(rand(0, 4)), c.x, c.y - 120);
    setTimeout(() => addHearts(c.v.family ? 3 : 1, c.x, c.y - 140), 350);
    burst('✨', c.x, c.y - 140, 6);
    Sound.tada();
    save(); updateHud();
  }
  function showSummary() {
    R.summaryOpen = true;
    const next = Object.values(RECIPES).filter((r) => r.day === S.day + 1);
    $('sum-title').textContent = `Day ${S.day} done! 🌟`;
    $('sum-text').textContent = `You served ${S.todayList.length} happy customers at ${cafeName()}!`;
    $('sum-coins').textContent = `🪙 +${S.dayCoins}`;
    $('sum-hearts').textContent = `❤️ +${S.dayHearts}`;
    $('sum-unlock').hidden = !next.length;
    if (next.length) $('sum-unlock').textContent = `New recipe tomorrow: ${next.map((r) => `${r.icon} ${r.name}`).join(', ')}!`;
    $('next-day').textContent = `Start Day ${S.day + 1} ☀️`;
    openModal('summary');
    Sound.tada();
    speak(`Day ${S.day} done! You served ${S.todayList.length} happy customers!`);
  }
  $('next-day').addEventListener('click', () => {
    S.day++; buildDayList(); save(); updateHud();
    closeModal('summary'); R.summaryOpen = false; R.nextIn = 1.5;
  });

  // ---------- Kitchen ----------
  function shelfIngredients() {
    const need = new Set(unlocked().flatMap((id) => RECIPES[id].ings));
    return Object.keys(ING).filter((id) => need.has(id));
  }
  function openKitchen() {
    const c = R.customer;
    if (!c || c.state !== 'wait') return;
    closeTray();
    const r = RECIPES[c.order];
    R.kitchen = { rid: c.order, added: [], taps: 0, step: 'ings', fresh: null };
    $('k-title').textContent = `Making ${r.a} ${r.name} for ${c.v.short || c.v.name} ${r.icon}`;
    $('k-shelf').innerHTML = shelfIngredients().map((id) => `<button class="ing" data-ing="${id}"><span>${ING[id].e}</span>${ING[id].n}</button>`).join('');
    const names = r.ings.map((id) => ING[id].n.toLowerCase());
    setMsg(`It needs ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`);
    speak(`Let's make ${r.a} ${r.name}! It needs ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`);
    renderKitchen();
    openModal('kitchen');
    Sound.pop();
  }
  function setMsg(text) { $('k-msg').textContent = text; }
  function renderKitchen() {
    const k = R.kitchen, r = RECIPES[k.rid], c = R.customer;
    const who = c ? (c.v.short || c.v.name) : '';
    $('k-icon').textContent = r.icon;
    $('k-name').textContent = r.name;
    const allIn = k.step !== 'ings';
    $('k-steps').innerHTML =
      r.ings.map((id) => `<li class="${k.added.includes(id) ? 'done' : ''}">${ING[id].e} ${ING[id].n}</li>`).join('') +
      `<li class="step ${k.step === 'serve' ? 'done' : allIn ? 'now' : ''}">${r.act.e} ${r.act.label} it</li>` +
      `<li class="${k.step === 'serve' ? 'now' : ''}">✨ Serve to ${esc(who)}</li>`;
    const v = $('k-vessel');
    v.className = `vessel ${r.vessel}`;
    v.innerHTML = k.step === 'serve'
      ? `<span class="final">${r.icon}</span>`
      : `<div class="contents">${k.added.map((id) => `<span class="${id === k.fresh ? 'new' : ''}">${ING[id].e}</span>`).join('')}</div>`;
    const btn = $('k-action');
    btn.hidden = k.step === 'ings';
    btn.className = `big-btn${k.step === 'serve' ? ' green' : ''}`;
    btn.textContent = k.step === 'serve' ? `✨ Serve to ${who}!` : `${r.act.e} ${r.act.label}! Tap tap tap!`;
    $('k-prog').hidden = k.step !== 'action';
    $('k-prog').firstElementChild.style.width = `${(k.taps / TAPS) * 100}%`;
    for (const b of $('k-shelf').children) {
      b.disabled = k.step !== 'ings';
      b.classList.toggle('used', k.added.includes(b.dataset.ing));
    }
  }
  $('k-shelf').addEventListener('click', (e) => {
    const b = e.target.closest('.ing');
    const k = R.kitchen;
    if (!b || !k || k.step !== 'ings') return;
    const id = b.dataset.ing, r = RECIPES[k.rid];
    if (!r.ings.includes(id)) {
      b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
      const m = `Hmm, ${r.name} ${r.a === 'some' ? "don't" : "doesn't"} need ${ING[id].n.toLowerCase()}. Check the recipe card!`;
      setMsg(m); speak(m); Sound.nope();
      return;
    }
    if (k.added.includes(id)) { setMsg('That one is already in! 👍'); Sound.tap(); return; }
    k.added.push(id); k.fresh = id;
    Sound.pop();
    if (k.added.length === r.ings.length) {
      k.step = 'action';
      const m = `Everything's in! Now ${r.act.label.toLowerCase()} it!`;
      setMsg(m); speak(m);
    } else setMsg(pick(['Yum!', 'Perfect!', 'Nice one!', 'Great choice!', 'Ooh, yummy!']));
    renderKitchen();
  });
  $('k-action').addEventListener('click', () => {
    const k = R.kitchen;
    if (!k) return;
    if (k.step === 'serve') { serve(); return; }
    const r = RECIPES[k.rid];
    k.taps++; k.fresh = null;
    Sound[r.act.sfx]();
    if (k.taps >= TAPS) {
      k.step = 'serve';
      const m = `Ta-da! The ${r.name} ${r.a === 'some' ? 'are' : 'is'} ready!`;
      setMsg(m); speak(m); Sound.sparkle();
    } else setMsg(`${r.act.label}ing... ${'⭐'.repeat(k.taps)}`);
    renderKitchen();
    const v = $('k-vessel'); v.classList.remove('wiggle'); void v.offsetWidth; v.classList.add('wiggle');
  });

  // ---------- Animal care ----------
  const DOG_MOUTH = { x: AX + 118, y: AY - 88 };
  function dogCare(action) {
    const d = R.dog;
    if (action === 'treat') {
      if (S.tummy >= 95) { say('dog', line(DOG_LINES.full)); return; }
      R.particles.push({ e: '🦴', fly: true, sx: EX + 30, sy: EY - 70, tx: DOG_MOUTH.x, ty: DOG_MOUTH.y, life: 0, max: 0.6, size: 30, done: () => {
        d.chew = 1.6; d.happy = 2; Sound.chomp();
        S.tummy = clamp(S.tummy + 32, 0, 100); addHearts(2, DOG_MOUTH.x, DOG_MOUTH.y - 20);
        say('dog', line(DOG_LINES.treat)); refreshTray();
      } });
    } else if (action === 'water') {
      if (S.tummy >= 95) { say('dog', line(DOG_LINES.full)); return; }
      d.bowl = 2.2; d.lap = 2; Sound.splash();
      S.tummy = clamp(S.tummy + 15, 0, 100); addHearts(1, DOG_MOUTH.x + 20, DOG_MOUTH.y);
      say('dog', line(DOG_LINES.water));
    } else if (action === 'ball') {
      if (d.ball) return;
      d.ball = { t: 0 }; Sound.woof();
      setTimeout(() => {
        d.happy = 2.5;
        const was = S.fun;
        S.fun = clamp(S.fun + 32, 0, 100);
        if (was < 95) addHearts(2, DOG_MOUTH.x, DOG_MOUTH.y - 20);
        say('dog', line(DOG_LINES.ball)); refreshTray();
      }, 1900);
    } else if (action === 'pet') {
      d.pet = 1.4; d.happy = 2;
      const was = S.fun;
      S.fun = clamp(S.fun + 12, 0, 100);
      if (was < 95) addHearts(1, AX + 80, AY - 120);
      burst('💕', AX + 80, AY - 110, 3, 20);
      say('dog', line(DOG_LINES.pet));
    }
    refreshTray(); save();
  }
  function pondCare(action) {
    if (action === 'feed') {
      if (S.pondFood >= 95) { say('pond', line(AXO_LINES.full)); return; }
      for (let i = 0; i < 4; i++) {
        const a = rand(0, Math.PI * 2), r = rand(0.15, 0.7);
        R.worms.push({ x: PX + Math.cos(a) * PRX * r, y: PY + Math.sin(a) * PRY * r, z: rand(60, 110), seed: rand(0, 9) });
      }
      Sound.splash();
    } else if (action === 'clean') {
      if (!S.algae.length) say('pond', line(AXO_LINES.clean));
      else { const m = 'Tap the green muck spots in the pond to scrub them away!'; say('ella', m); }
    } else if (action === 'hi') {
      for (const a of R.axos) { a.tx = PX + rand(-90, 90); a.ty = PY + PRY * 0.5; a.wait = 0; a.twirl = 1.2; }
      Sound.squeak(); burst('💕', PX, PY - 20, 3, 20);
      say('pond', line(AXO_LINES.hi));
    }
    refreshTray();
  }
  function scrubAlgae(i) {
    const a = S.algae.splice(i, 1)[0];
    burst('✨', a.x, a.y, 5, 18); Sound.sparkle();
    addHearts(1, a.x, a.y);
    if (!S.algae.length) say('pond', line(AXO_LINES.clean));
    refreshTray(); save();
  }
  function updateAnimals(dt) {
    if (R.started && !R.summaryOpen) {
      S.tummy = clamp(S.tummy - dt * 0.17, 0, 100);
      S.fun = clamp(S.fun - dt * 0.2, 0, 100);
      S.pondFood = clamp(S.pondFood - dt * 0.14, 0, 100);
      R.algaeTimer -= dt;
      if (R.algaeTimer <= 0 && S.algae.length < 5) {
        R.algaeTimer = rand(30, 45);
        const a = rand(0, Math.PI * 2), r = rand(0.2, 0.75);
        S.algae.push({ x: Math.round(PX + Math.cos(a) * PRX * r), y: Math.round(PY + Math.sin(a) * PRY * r) });
      }
      R.nagTimer -= dt;
      if (R.nagTimer <= 0) {
        R.nagTimer = 28;
        const waiting = R.customer && R.customer.state === 'wait';
        if (!waiting && !R.kitchen) {
          if (S.tummy < 40) say('dog', line(DOG_LINES.hungry), 4);
          else if (S.fun < 40) say('dog', line(DOG_LINES.bored), 4);
          else if (S.pondFood < 35) say('pond', line(AXO_LINES.hungry), 4);
          else if (S.algae.length >= 3) say('pond', line(AXO_LINES.dirty), 4);
        }
      }
    }
    const d = R.dog;
    for (const k of ['chew', 'happy', 'lap', 'pet', 'bowl']) d[k] = Math.max(0, d[k] - dt);
    let look = d.lap > 0 ? 0.3 : 0;
    if (d.ball) {
      d.ball.t += dt;
      const bt = d.ball.t;
      look = bt < 1.8 ? -0.12 + Math.sin(bt * 3.5) * 0.08 : 0;
      if (bt > 2.1) d.ball = null;
    }
    d.look += (look - d.look) * Math.min(1, dt * 8);

    // axolotls swim about and chase worms
    for (const a of R.axos) {
      let target = null, best = 1e9;
      for (const w of R.worms) {
        if (w.z > 0) continue;
        const dd = Math.hypot(w.x - a.x, w.y - a.y);
        if (dd < best) { best = dd; target = w; }
      }
      if (target) { a.tx = target.x; a.ty = target.y; }
      else if (a.wait > 0) a.wait -= dt;
      else if (Math.hypot(a.tx - a.x, a.ty - a.y) < 6) {
        a.wait = rand(0.5, 2.5);
        const ang = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 0.8;
        a.tx = PX + Math.cos(ang) * (PRX - 30) * r; a.ty = PY + Math.sin(ang) * (PRY - 16) * r;
      }
      const dx = a.tx - a.x, dy = a.ty - a.y, dist = Math.hypot(dx, dy);
      if (dist > 1 && a.wait <= 0) {
        const sp = (target ? 75 : a.speed) * dt;
        const want = Math.atan2(dy, dx);
        let diff = ((want - a.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        a.ang += diff * Math.min(1, dt * 5);
        a.x += Math.cos(a.ang) * Math.min(sp, dist); a.y += Math.sin(a.ang) * Math.min(sp, dist);
      }
      if (a.twirl > 0) { a.twirl -= dt; a.ang += dt * 9; }
      if (target && Math.hypot(target.x - a.x, target.y - a.y) < 12) {
        R.worms.splice(R.worms.indexOf(target), 1);
        const was = S.pondFood;
        S.pondFood = clamp(S.pondFood + 11, 0, 100);
        burst('💕', a.x, a.y - 10, 2, 16); Sound.squeak();
        if (was < 95) addHearts(1, a.x, a.y);
        if (!R.worms.length) { say('pond', line(AXO_LINES.fed)); refreshTray(); save(); }
      }
    }
    for (const w of R.worms) if (w.z > 0) { w.z -= dt * 140; if (w.z <= 0) { w.z = 0; Sound.splash(); } }
  }

  // ---------- Tray ----------
  function openTray(kind) {
    R.tray = kind;
    refreshTray();
    $('tray').hidden = false;
  }
  function closeTray() { R.tray = null; $('tray').hidden = true; }
  function meter(label, v) {
    return `<div class="meter ${v >= 50 ? 'ok' : ''}">${label}<div class="meter-bar"><div style="width:${Math.round(v)}%"></div></div></div>`;
  }
  function refreshTray() {
    if (!R.tray) return;
    const el = $('tray');
    if (R.tray === 'dog') {
      el.innerHTML = `<div class="tray-head"><span>🐾 ${esc(dogName())}</span><button class="close" data-tray-close aria-label="Close">✕</button></div>
        <div class="meters">${meter('Tummy', S.tummy)}${meter('Fun', S.fun)}</div>
        <div class="tray-btns">
          <button class="care-btn" data-care="treat"><span>🦴</span>Treat</button>
          <button class="care-btn" data-care="water"><span>💧</span>Water</button>
          <button class="care-btn" data-care="ball"><span>🎾</span>Play ball</button>
          <button class="care-btn" data-care="pet"><span>🤚</span>Pet</button>
        </div>`;
    } else {
      el.innerHTML = `<div class="tray-head"><span>🌊 The axolotls: ${R.axos.map((a) => esc(a.name)).join(', ')}</span><button class="close" data-tray-close aria-label="Close">✕</button></div>
        <div class="meters">${meter('Food', S.pondFood)}${meter('Clean pond', 100 - S.algae.length * 20)}</div>
        <div class="tray-btns">
          <button class="care-btn" data-care="feed"><span>🪱</span>Feed worms</button>
          <button class="care-btn" data-care="clean"><span>🧽</span>Clean</button>
          <button class="care-btn" data-care="hi"><span>👋</span>Say hi</button>
        </div>`;
    }
  }
  $('tray').addEventListener('click', (e) => {
    if (e.target.closest('[data-tray-close]')) { closeTray(); return; }
    const b = e.target.closest('[data-care]');
    if (!b) return;
    Sound.tap();
    if (R.tray === 'dog') dogCare(b.dataset.care); else pondCare(b.dataset.care);
  });

  // ---------- Modals ----------
  function openModal(id) { $(id).hidden = false; }
  function closeModal(id) {
    $(id).hidden = true;
    if (id === 'kitchen') R.kitchen = null;
    if (id === 'settings' || id === 'shop') updateHud();
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (c) { Sound.tap(); closeModal(c.dataset.close); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    for (const id of ['kitchen', 'shop', 'settings']) if (!$(id).hidden) closeModal(id);
    closeTray();
  });

  // ---------- Shop ----------
  function renderShop() {
    $('shop-grid').innerHTML = SHOP.map((it) => {
      const have = S[it.cur], sym = it.cur === 'coins' ? '🪙' : '❤️';
      const icon = it.axo ? `<canvas data-axo="${it.axo}" width="180" height="108"></canvas>` : it.icon;
      const btn = owns(it.id) ? '<div class="owned">✓ In your café</div>'
        : `<button class="buy-btn ${have >= it.cost ? '' : 'cant'}" data-buy="${it.id}">${sym} ${it.cost}</button>`;
      return `<div class="shop-item"><div class="shop-icon">${icon}</div><div class="shop-name">${esc(fmt(it.name))}</div>${btn}</div>`;
    }).join('');
    for (const cv of $('shop-grid').querySelectorAll('canvas')) {
      const g = cv.getContext('2d'); g.scale(2, 2);
      Art.axolotl(g, 48, 28, 0, 0.5, cv.dataset.axo, 1.4);
    }
  }
  $('shop-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-buy]');
    if (!b) return;
    const it = SHOP.find((i) => i.id === b.dataset.buy);
    if (S[it.cur] < it.cost) {
      const need = it.cost - S[it.cur];
      Sound.nope();
      speak(it.cur === 'coins' ? `You need ${need} more coins. Serve more customers!` : `You need ${need} more hearts. Look after the animals!`);
      b.textContent = it.cur === 'coins' ? `Need ${need} more 🪙` : `Need ${need} more ❤️`;
      return;
    }
    S[it.cur] -= it.cost; S.owned.push(it.id);
    syncAxolotls(); Sound.tada(); save(); renderShop(); updateHud();
    speak(`Yay! ${fmt(it.name)}!`);
  });
  $('shop-btn').addEventListener('click', () => { Sound.tap(); closeTray(); renderShop(); openModal('shop'); });

  // ---------- Settings & first-time setup ----------
  function buildOptions(el, first) {
    el.innerHTML = `
      <label class="q">What's your café called?<input id="o-cafe" maxlength="28" placeholder="Type a name, or tap an idea"></label>
      <div class="pills">${CONFIG.cafeNameIdeas.map((n) => `<button class="pill" data-cafe="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <label class="q">What's your dog's name?<input id="o-dog" maxlength="16"></label>
      <div class="pills">${CONFIG.dogNameIdeas.map((n) => `<button class="pill" data-dog="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <div class="q" id="o-talk-q">Can the animals talk?</div>
      <div class="pills"><button class="pill" data-talk="yes">Yes, they talk! 🗣️</button><button class="pill" data-talk="no">No, just animal sounds 🐾</button></div>
      ${first ? '' : `
      <div class="q-row">Read words out loud 🔊 <div class="pills"><button class="pill" data-opt="read">On</button></div></div>
      <div class="q-row">Sound effects 🔔 <div class="pills"><button class="pill" data-opt="sound">On</button></div></div>
      <div class="q-row">Music 🎵 <div class="pills"><button class="pill" data-opt="music">On</button></div></div>`}`;
    const cafe = el.querySelector('#o-cafe'), dogIn = el.querySelector('#o-dog');
    cafe.value = S.cafeName; dogIn.value = S.dogName;
    const sync = () => {
      for (const p of el.querySelectorAll('[data-cafe]')) p.classList.toggle('on', p.dataset.cafe === S.cafeName);
      for (const p of el.querySelectorAll('[data-dog]')) p.classList.toggle('on', p.dataset.dog === S.dogName);
      for (const p of el.querySelectorAll('[data-talk]')) p.classList.toggle('on', S.talk === (p.dataset.talk === 'yes'));
      for (const p of el.querySelectorAll('[data-opt]')) { const on = S[p.dataset.opt]; p.classList.toggle('on', on); p.textContent = on ? 'On' : 'Off'; }
      $('title-cafe').textContent = cafeName();
    };
    cafe.addEventListener('input', () => { S.cafeName = cafe.value; save(); sync(); });
    dogIn.addEventListener('input', () => { S.dogName = dogIn.value; save(); sync(); });
    el.onclick = (e) => {
      const p = e.target.closest('.pill');
      if (!p) return;
      Sound.init(); Sound.tap();
      if (p.dataset.cafe) { S.cafeName = p.dataset.cafe; cafe.value = S.cafeName; }
      if (p.dataset.dog) { S.dogName = p.dataset.dog; dogIn.value = S.dogName; }
      if (p.dataset.talk) S.talk = p.dataset.talk === 'yes';
      if (p.dataset.opt) {
        S[p.dataset.opt] = !S[p.dataset.opt];
        Sound.setSfx(S.sound); Sound.setMusic(S.music && R.started);
        if (!S.read && 'speechSynthesis' in window) speechSynthesis.cancel();
      }
      save(); sync();
    };
    sync();
  }
  $('settings-btn').addEventListener('click', () => { Sound.tap(); closeTray(); buildOptions($('settings-fields'), false); openModal('settings'); });
  $('reset-btn').addEventListener('click', () => {
    if (!confirm('Start the café over from Day 1? Coins, hearts and shop items will be gone.')) return;
    const keep = { cafeName: S.cafeName, dogName: S.dogName, talk: S.talk, read: S.read, sound: S.sound, music: S.music, setupDone: true };
    S = { ...freshSave(), ...keep };
    R.axos.length = 0; syncAxolotls(); R.customer = null; R.nextIn = 1.5; R.worms.length = 0;
    buildDayList(); save(); updateHud(); closeModal('settings');
  });

  function showSetup() {
    document.querySelector('.title-card').classList.add('setup');
    $('title-main').hidden = true; $('title-setup').hidden = false;
    buildOptions($('setup-fields'), true);
  }
  $('title-edit').addEventListener('click', () => { Sound.init(); Sound.tap(); showSetup(); });
  $('go-btn').addEventListener('click', () => {
    if (S.talk == null) {
      const q = $('o-talk-q'); q.classList.remove('shake-q'); void q.offsetWidth; q.classList.add('shake-q');
      speak('Can the animals talk? Pick yes or no!');
      return;
    }
    S.setupDone = true; save(); startGame();
  });
  $('play-btn').addEventListener('click', () => { if (S.setupDone && S.talk != null) startGame(); else showSetup(); });

  function startGame() {
    Sound.init(); Sound.setSfx(S.sound); Sound.setMusic(S.music);
    $('title').hidden = true; $('hud').hidden = false; $('hint').hidden = false;
    if (!S.todayList.length) buildDayList();
    R.started = true; R.nextIn = 1.2;
    updateHud(); save();
    say('ella', fmt(`Welcome to {cafe}! Here comes ${S.servedToday === 0 ? 'Sarah' : 'a customer'}!`));
  }

  // ---------- Hints ----------
  function updateHint() {
    if (!R.started) return;
    const c = R.customer;
    let h;
    if (c && c.state === 'wait') h = `👆 Tap ${c.v.short || c.v.name} to start cooking!`;
    else if (c && c.state === 'in') h = `🔔 ${c.v.name} is coming in!`;
    else if (S.tummy < 40 || S.fun < 40) h = `🐾 ${dogName()} needs you! Tap ${dogName()}.`;
    else if (S.algae.length >= 3) h = '🧽 The pond is mucky. Tap the green spots!';
    else if (S.pondFood < 35) h = '🪱 The axolotls are hungry. Tap the pond!';
    else h = `💕 Tap ${dogName()} or the axolotls to look after them`;
    if ($('hint').textContent !== h) $('hint').textContent = h;
  }

  // ---------- Input ----------
  function toScene(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  const inPond = (x, y) => ((x - PX) / PRX) ** 2 + ((y - PY) / PRY) ** 2 < 1;
  const onDog = (x, y) => x > AX - 110 && x < AX + 132 && y > AY - 122 && y < AY + 6;
  const onElla = (x, y) => Math.abs(x - EX) < 36 && y > EY - 160 && y < EY - 60;
  function onCustomer(x, y) {
    const c = R.customer;
    if (!c || c.state !== 'wait') return false;
    const b = R.bubbleRect;
    if (b && x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h + 14) return true;
    return Math.abs(x - c.x) < 55 && y > c.y - 175 && y < c.y + 8;
  }
  function algaeAt(x, y) { return S.algae.findIndex((a) => Math.hypot(a.x - x, a.y - y) < 24); }
  canvas.addEventListener('pointerdown', (e) => {
    if (!R.started) return;
    Sound.init();
    const { x, y } = toScene(e);
    if (onCustomer(x, y)) { openKitchen(); return; }
    const ai = algaeAt(x, y);
    if (ai >= 0) { scrubAlgae(ai); return; }
    if (onDog(x, y)) {
      openTray('dog'); R.dog.happy = 1.2; Sound.woof();
      say('dog', line(DOG_LINES.hi), 2.5, false);
      return;
    }
    if (inPond(x, y)) { openTray('pond'); Sound.splash(); burst('💧', x, y, 3, 16); return; }
    if (onElla(x, y)) { R.ellaWave = 1.6; say('ella', fmt(pick(ELLA_LINES))); return; }
    closeTray();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!R.started) return;
    const { x, y } = toScene(e);
    const hot = onCustomer(x, y) || algaeAt(x, y) >= 0 || onDog(x, y) || inPond(x, y) || onElla(x, y);
    if (hot !== R.hover) { R.hover = hot; canvas.style.cursor = hot ? 'pointer' : 'default'; }
  });

  // ---------- Drawing ----------
  let bg = null, k = 1;
  function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.setProperty('--s', s);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    k = s * dpr;
    canvas.width = Math.round(W * k); canvas.height = Math.round(H * k);
    bg = document.createElement('canvas');
    bg.width = canvas.width; bg.height = canvas.height;
    const g = bg.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0);
    drawBackground(g);
  }

  function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function drawBackground(g) {
    const rnd = seeded(7);
    let gr = g.createLinearGradient(0, 0, 0, 340);
    gr.addColorStop(0, '#0f4d38'); gr.addColorStop(0.5, '#2f8f5b'); gr.addColorStop(1, '#a6dc9c');
    g.fillStyle = gr; g.fillRect(0, 0, W, 340);
    // sunbeams through the canopy
    g.fillStyle = 'rgba(255, 246, 190, 0.09)';
    for (const [x, w] of [[180, 60], [430, 90], [640, 50], [760, 80]]) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w * 2.6 + 60, 340); g.lineTo(x + w * 1.4 + 20, 340); g.fill();
    }
    // far trunks
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 112 + rnd() * 40, w = 18 + rnd() * 26;
      g.fillStyle = `rgba(52, 92, 62, ${0.55 + rnd() * 0.3})`;
      g.fillRect(x, 40, w, 300);
    }
    // canopy blobs
    const greens = ['#165c40', '#1d6b48', '#247a4f', '#2c8757'];
    for (let i = 0; i < 46; i++) {
      Art.fillCirc(g, greens[i % 4], rnd() * W, rnd() * 120 - 20, 40 + rnd() * 50);
    }
    // bushes on the horizon, with flowers
    const bush = ['#3b9a5e', '#4aaa68', '#5cb873'];
    for (let i = 0; i < 30; i++) Art.fillCirc(g, bush[i % 3], i * 34 + rnd() * 20, 300 + rnd() * 20, 26 + rnd() * 20);
    for (let i = 0; i < 26; i++) Art.flower(g, rnd() * W, 285 + rnd() * 35, 5 + rnd() * 3, pick(['#ff5d8f', '#ff9f43', '#ffd54a', '#c77dff']), '#fff3b0');

    // deck
    gr = g.createLinearGradient(0, 330, 0, H);
    gr.addColorStop(0, '#b98552'); gr.addColorStop(1, '#d6a46b');
    g.fillStyle = gr; g.fillRect(0, 330, W, H - 330);
    for (let y = 338, i = 0; y < H; y += 22 + i * 1.5, i++) {
      g.fillStyle = 'rgba(110, 66, 30, 0.28)'; g.fillRect(0, y, W, 2);
      for (let x = (i % 2) * 90 + 40; x < W; x += 180) { g.fillRect(x, y - 20 - i * 1.5, 2, 20 + i * 1.5); }
    }
    // railing
    g.fillStyle = '#8a5a30';
    for (let x = 10; x < W; x += 70) { Art.rr(g, x, 290, 10, 44, 3); g.fill(); }
    Art.rr(g, 0, 288, W, 10, 4); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, 289, W, 3);
    // vines
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 115 + rnd() * 30, len = 60 + rnd() * 120;
      g.strokeStyle = '#2e6b3a'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 15, len / 2, x, len); g.stroke();
      for (let y = 18; y < len; y += 22) Art.leaf(g, x + 3, y, 16, 6, y % 44 ? 0.5 : 2.6, '#3fa35f', '#2e7d4a');
    }
    // big foreground leaves at the top
    for (const [x, y, a, c] of [[-10, 10, 0.6, '#1e7a46'], [20, -10, 0.2, '#2a8f55'], [970, 10, 2.5, '#1e7a46'], [940, -10, 2.9, '#2a8f55'], [380, -14, 1.4, '#1d6d44'], [600, -14, 1.7, '#24804f']]) {
      Art.leaf(g, x, y, 120, 34, a, c, '#145a35');
    }
    // cliff for the waterfall
    for (const [x, y, r, c] of [[905, 210, 60, '#6f7d6a'], [950, 250, 55, '#5f6c5b'], [870, 280, 45, '#7c8a76'], [930, 320, 50, '#66735f'], [890, 175, 40, '#808f7a']]) {
      Art.fillCirc(g, c, x, y, r);
    }
    for (const [x, y] of [[880, 160], [930, 190], [855, 250], [960, 280]]) Art.fillEll(g, '#4f9a4f', x, y, 22, 9);
  }

  function drawMenuBoard() {
    const list = unlocked();
    const x = 26, y = 150, w = 148, h = 34 + list.length * 22;
    ctx.fillStyle = '#6b4a2b'; Art.rr(ctx, x - 5, y - 5, w + 10, h + 10, 10); ctx.fill();
    ctx.fillStyle = '#244a36'; Art.rr(ctx, x, y, w, h, 7); ctx.fill();
    ctx.fillStyle = '#fffaf0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 17px Fredoka, sans-serif'; ctx.fillText('MENU', x + w / 2, y + 16);
    ctx.font = '500 14px Fredoka, sans-serif'; ctx.textAlign = 'left';
    list.forEach((id, i) => {
      const r = RECIPES[id];
      Art.emoji(ctx, r.icon, x + 16, y + 42 + i * 22, 15);
      ctx.fillStyle = '#fffaf0'; ctx.fillText(r.short, x + 30, y + 43 + i * 22);
    });
  }

  function drawCounter() {
    ctx.fillStyle = 'rgba(60,35,10,0.2)'; ctx.fillRect(34, 420, 340, 8);
    ctx.fillStyle = '#9c6a3c'; ctx.fillRect(30, 332, 340, 90);
    ctx.fillStyle = '#b07a46';
    for (let x = 36; x < 366; x += 22) { Art.rr(ctx, x, 336, 16, 82, 6); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let x = 40; x < 366; x += 22) ctx.fillRect(x, 340, 3, 74);
    ctx.fillStyle = '#d9a66c'; Art.rr(ctx, 22, 314, 356, 22, 8); ctx.fill();
    ctx.fillStyle = '#ecc28c'; Art.rr(ctx, 22, 314, 356, 7, 6); ctx.fill();
    for (let i = 0; i < 11; i++) Art.leaf(ctx, 30 + i * 33, 338, 18, 7, 1.2 + (i % 2) * 0.7, i % 2 ? '#3fa35f' : '#57b56f');
    for (let i = 0; i < 4; i++) Art.flower(ctx, 70 + i * 90, 342, 6, '#ff5d8f', '#ffd54a');
    // fruit basket and tip jar
    ctx.fillStyle = '#c48a4a'; Art.rr(ctx, 46, 300, 56, 18, 8); ctx.fill();
    Art.emoji(ctx, '🍍', 60, 292, 22); Art.emoji(ctx, '🥭', 78, 298, 20); Art.emoji(ctx, '🍌', 92, 296, 20);
    const fill = Math.min(1, S.coins / 120);
    ctx.fillStyle = 'rgba(220,240,255,0.55)'; Art.rr(ctx, 316, 280, 34, 36, 8); ctx.fill();
    ctx.fillStyle = '#ffcc33'; Art.rr(ctx, 319, 313 - 28 * fill, 28, 28 * fill + 1, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; Art.rr(ctx, 316, 280, 34, 36, 8); ctx.stroke();
    ctx.fillStyle = '#6b4a2b'; ctx.font = '600 10px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TIPS', 333, 274);
  }

  function drawWaterfall(t) {
    const x = 902, w = 30, top = 196, bottom = 426;
    let gr = ctx.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, '#9fe3f0'); gr.addColorStop(0.5, '#e9fbff'); gr.addColorStop(1, '#8fd6e8');
    ctx.fillStyle = gr; Art.rr(ctx, x, top, w, bottom - top, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const yy = top + ((t * 120 + i * 40) % (bottom - top));
      ctx.beginPath(); ctx.moveTo(x + 5 + (i % 3) * 8, yy); ctx.lineTo(x + 5 + (i % 3) * 8, yy + 18); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) Art.fillCirc(ctx, 'rgba(255,255,255,0.75)', x + w / 2 + Math.sin(t * 3 + i * 2) * 18, bottom - 4 + Math.cos(t * 4 + i) * 3, 7 + (i % 2) * 3);
    if (owns('rainbow')) {
      ctx.save(); ctx.globalAlpha = 0.4; ctx.lineWidth = 6;
      ['#ff5d5d', '#ffa64d', '#ffe14d', '#6edc6e', '#5dafff', '#a37dff'].forEach((c, i) => {
        ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(860, 430, 120 - i * 6, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
      });
      ctx.restore();
    }
  }

  function drawPond(t) {
    Art.fillEll(ctx, '#7f8c78', PX, PY + 4, PRX + 12, PRY + 12);
    const stones = 22;
    for (let i = 0; i < stones; i++) {
      const a = (i / stones) * Math.PI * 2;
      Art.fillEll(ctx, i % 2 ? '#8e9b87' : '#a3ae9b', PX + Math.cos(a) * (PRX + 8), PY + 4 + Math.sin(a) * (PRY + 8), 16, 10, a);
    }
    const muck = S.algae.length / 5;
    const gr = ctx.createRadialGradient(PX - 40, PY - 20, 10, PX, PY, PRX);
    gr.addColorStop(0, muck > 0.5 ? '#79c7a3' : '#7fe0e0'); gr.addColorStop(1, muck > 0.5 ? '#3a8f6e' : '#2a96a8');
    ctx.fillStyle = gr; Art.ell(ctx, PX, PY, PRX, PRY); ctx.fill();
    ctx.save();
    Art.ell(ctx, PX, PY, PRX, PRY); ctx.clip();
    // pebbles on the bottom
    for (let i = 0; i < 14; i++) Art.fillEll(ctx, 'rgba(255,255,255,0.12)', PX - 130 + i * 20, PY + 30 + (i % 3) * 8, 6, 3);
    // ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const r = ((t * 14 + i * 25) % 75);
      ctx.globalAlpha = 1 - r / 75;
      Art.ell(ctx, PX + 120, PY - 30, r * 1.2, r * 0.4); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const w of R.worms) if (w.z <= 0) drawWorm(w, t);
    for (const a of R.axos) Art.axolotl(ctx, a.x, a.y, a.ang, t + a.seed, a.colour, 1.15);
    for (const a of S.algae) {
      Art.fillCirc(ctx, 'rgba(74, 120, 30, 0.85)', a.x, a.y, 13);
      Art.fillCirc(ctx, 'rgba(96, 150, 40, 0.85)', a.x - 9, a.y + 3, 9);
      Art.fillCirc(ctx, 'rgba(96, 150, 40, 0.85)', a.x + 9, a.y - 2, 8);
      Art.fillCirc(ctx, 'rgba(160, 200, 80, 0.8)', a.x - 2, a.y - 4, 3);
    }
    // water sheen
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; Art.ell(ctx, PX - 50, PY - 30, 70, 12, -0.08); ctx.fill();
    ctx.restore();
    // lily pads
    for (const [lx, ly, r, fl] of [[660, 430, 18, true], [865, 480, 15, false], [720, 495, 13, false]]) {
      ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.ellipse(lx, ly + Math.sin(t + lx) * 1.5, r, r * 0.55, 0, 0.3, Math.PI * 2 - 0.1); ctx.lineTo(lx, ly); ctx.fill();
      if (fl) Art.flower(ctx, lx + 2, ly - 4, 8, '#ffb3d1', '#ffd54a');
    }
    for (const w of R.worms) if (w.z > 0) drawWorm({ ...w, y: w.y - w.z }, t);
  }
  function drawWorm(w, t) {
    ctx.strokeStyle = '#e8797f'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const px = w.x - 8 + i * 2.7, py = w.y + Math.sin(t * 8 + w.seed + i) * 2;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
  }

  function drawDecorUnder(t) {
    if (owns('lanterns')) {
      for (const [x, len, c] of [[262, 120, '#ff6f61'], [700, 130, '#ffb03a']]) {
        ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, len - 20); ctx.stroke();
        const sw = Math.sin(t * 1.2 + x) * 2;
        ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 25;
        Art.fillEll(ctx, c, x + sw, len, 18, 22); ctx.restore();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5;
        for (const o of [-8, 0, 8]) { ctx.beginPath(); ctx.ellipse(x + sw, len, Math.abs(o) + 4, 22, 0, -1.3, 1.3); ctx.stroke(); }
        ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x + sw - 8, len - 24, 16, 4); ctx.fillRect(x + sw - 8, len + 20, 16, 4);
      }
    }
    if (owns('baskets')) {
      for (const x of [112, 848]) {
        ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 18, 112); ctx.moveTo(x, 0); ctx.lineTo(x + 18, 112); ctx.stroke();
        for (let i = 0; i < 5; i++) Art.leaf(ctx, x, 114, 22, 8, Math.PI * (0.15 + i * 0.17), '#3fa35f');
        ctx.fillStyle = '#a8703c'; ctx.beginPath(); ctx.moveTo(x - 24, 112); ctx.lineTo(x + 24, 112); ctx.lineTo(x + 16, 134); ctx.lineTo(x - 16, 134); ctx.fill();
        for (const [fx, fy, c] of [[-12, 106, '#ff5d8f'], [6, 102, '#ffd54a'], [16, 110, '#c77dff'], [-2, 112, '#ff9f43']]) Art.flower(ctx, x + fx, fy, 8, c, '#fff3b0');
      }
    }
  }
  function drawLights(t) {
    if (!owns('lights')) return;
    const cols = ['#ff5d8f', '#ffd54a', '#7fe0e0', '#c77dff', '#7fd88f'];
    ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 1.5;
    for (let seg = 0; seg < 4; seg++) {
      const x0 = seg * 240, x1 = x0 + 240;
      ctx.beginPath(); ctx.moveTo(x0, 96); ctx.quadraticCurveTo(x0 + 120, 136, x1, 96); ctx.stroke();
      for (let i = 1; i < 10; i++) {
        const u = i / 10, bx = x0 + 240 * u, by = 96 + 2 * u * (1 - u) * 40;
        const on = (Math.sin(t * 3 + i + seg * 2) + 1) / 2;
        ctx.save(); ctx.shadowColor = cols[(i + seg) % 5]; ctx.shadowBlur = 8 + on * 10;
        Art.fillEll(ctx, cols[(i + seg) % 5], bx, by + 6, 4, 6); ctx.restore();
      }
    }
  }

  function drawEllaChar(t) {
    Art.kid(ctx, EX, EY, t, {
      hair: '#f7d774', hairDark: '#e2b84a', skin: '#ffe3cf', shirt: '#ff8a8a', legs: '#4fb39a', shoes: '#ffffff',
      style: 'pony', apron: true, freckles: true, clip: true, wave: R.ellaWave > 0, happy: R.ellaWave > 0.6,
    });
  }

  function drawDog(t) {
    const d = R.dog;
    if (owns('bed')) {
      Art.fillEll(ctx, '#6a46b8', AX + 6, AY - 4, 128, 22);
      Art.fillEll(ctx, '#8c6ad6', AX + 6, AY - 8, 116, 16);
    }
    if (d.bowl > 0) {
      ctx.fillStyle = '#2ec4b6'; Art.rr(ctx, AX + 120, AY - 18, 40, 16, 6); ctx.fill();
      Art.fillEll(ctx, '#9fe3f0', AX + 140, AY - 18, 18, 4);
    }
    Art.dog(ctx, AX, AY, t, { happy: d.happy > 0, chew: d.chew > 0, look: d.look, lap: d.lap > 0 });
    if (d.pet > 0) Art.emoji(ctx, '🤚', AX + 80 + Math.sin(t * 12) * 12, AY - 126, 30);
    if (d.ball) {
      const bt = Math.min(d.ball.t / 1.8, 1);
      // out to the right and back again
      const u = bt < 0.5 ? bt * 2 : 2 - bt * 2;
      const bx = DOG_MOUTH.x + u * 300, by = DOG_MOUTH.y + u * 80 - Math.sin(u * Math.PI) * 120 - Math.abs(Math.sin(bt * Math.PI * 4)) * 20 * u;
      Art.emoji(ctx, '🎾', bx, by, 24);
    }
    if ((S.tummy < 40 || S.fun < 40) && !d.happy && R.started) thought(AX + 30, AY - 130, S.tummy < 40 ? '🦴' : '🎾', t);
  }
  function thought(x, y, e, t) {
    const b = Math.sin(t * 3) * 3;
    Art.fillCirc(ctx, '#fff', x + 18, y + 20 + b * 0.3, 4);
    Art.fillCirc(ctx, '#fff', x + 10, y + 10 + b * 0.6, 6);
    Art.fillCirc(ctx, '#fff', x, y - 10 + b, 22);
    Art.emoji(ctx, e, x, y - 10 + b, 24);
  }

  function drawCustomer(c, t) {
    const depth = 0.86 + ((c.y - PATH[0].y) / (SPOT.y - PATH[0].y)) * 0.14;
    const walking = c.state === 'in' || c.state === 'out';
    const happy = c.state === 'happy';
    const facingLeft = c.state !== 'out';
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(depth, depth);
    const v = c.v;
    if (v.draw === 'kid') Art.kid(ctx, 0, 0, t, { ...v.look, walking, happy, wave: happy });
    else {
      if (facingLeft) ctx.scale(-1, 1);
      Art[v.draw](ctx, 0, 0, t, { walking, happy });
    }
    ctx.restore();
    if (c.served) Art.emoji(ctx, c.served, c.x + 30, c.y - 70, 34);
    if (happy) for (let i = 0; i < 2; i++) Art.heart(ctx, c.x - 20 + i * 40, c.y - 180 - ((t * 40 + i * 20) % 40), 10, '#ff5d8f');
  }
  function customerBubble(c, t) {
    R.bubbleRect = null;
    if (c.state !== 'wait' && c.state !== 'happy') return;
    const top = c.y - (c.v.draw === 'kid' ? 182 : 160);
    const bob = c.state === 'wait' ? Math.sin(t * 3) * 3 : 0;
    const r = RECIPES[c.order];
    const opts = c.state === 'wait'
      ? { icon: r.icon, sub: talks(c.v) ? '' : r.name, glow: true }
      : {};
    const rect = bubble(c.x, top + bob, c.text, opts);
    if (c.state === 'wait') {
      R.bubbleRect = rect;
      Art.emoji(ctx, '👆', rect.x + rect.w - 6, rect.y + rect.h - 4 + Math.sin(t * 6) * 4, 26);
    }
  }

  function wrap(text, maxW) {
    const words = text.split(' '), lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function bubble(x, y, text, o = {}) {
    ctx.save();
    ctx.font = '600 18px Fredoka, sans-serif';
    const lines = text ? wrap(text, o.maxW || 230) : [];
    const lh = 22, iconH = o.icon ? 46 : 0, subH = o.sub ? 22 : 0;
    let tw = Math.max(o.icon ? 50 : 0, ...lines.map((l) => ctx.measureText(l).width));
    if (o.sub) { ctx.font = '700 16px Fredoka, sans-serif'; tw = Math.max(tw, ctx.measureText(o.sub).width); }
    const w = tw + 30, h = lines.length * lh + iconH + subH + 18;
    const bx = clamp(x - w / 2, 8, W - 8 - w), by = y - h - 14;
    if (o.glow) { ctx.shadowColor = '#fff6a8'; ctx.shadowBlur = 14 + Math.sin(R.t * 4) * 6; }
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; Art.rr(ctx, bx + 2, by + 4, w, h, 18); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fffdf7';
    Art.rr(ctx, bx, by, w, h, 18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(clamp(x, bx + 20, bx + w - 20) - 10, by + h - 1); ctx.lineTo(clamp(x, bx + 20, bx + w - 20) + 10, by + h - 1); ctx.lineTo(x, y); ctx.fill();
    let cy = by + 10;
    if (o.icon) { Art.emoji(ctx, o.icon, bx + w / 2, cy + 22, 38); cy += iconH; }
    ctx.fillStyle = '#3b2a1a'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.font = '600 18px Fredoka, sans-serif';
    for (const l of lines) { ctx.fillText(l, bx + w / 2, cy); cy += lh; }
    if (o.sub) { ctx.font = '700 16px Fredoka, sans-serif'; ctx.fillStyle = '#d6457a'; ctx.fillText(o.sub, bx + w / 2, cy + 1); }
    ctx.restore();
    return { x: bx, y: by, w, h };
  }

  function drawSays() {
    const at = { dog: [AX + 96, AY - 122], pond: [PX - 20, PY - PRY - 12], ella: [EX, EY - 152] };
    for (const who of Object.keys(R.says)) {
      const s = R.says[who];
      if (R.t > s.until) { delete R.says[who]; continue; }
      bubble(at[who][0], at[who][1], s.text, { maxW: 210 });
    }
  }

  function drawParticles(dt) {
    for (let i = R.particles.length - 1; i >= 0; i--) {
      const p = R.particles[i];
      p.life += dt;
      if (p.life < 0) continue;
      if (p.life >= p.max) { if (p.done) p.done(); R.particles.splice(i, 1); continue; }
      const u = p.life / p.max;
      if (p.fly) {
        const e = u * u * (3 - 2 * u);
        const x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e - Math.sin(e * Math.PI) * 60;
        Art.emoji(ctx, p.e, x, y, p.size);
        continue;
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt;
      const alpha = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1;
      if (p.text) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.font = '700 26px Fredoka, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 5; ctx.strokeStyle = '#3b2a1a'; ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.colour; ctx.fillText(p.text, p.x, p.y); ctx.restore();
      } else Art.emoji(ctx, p.e, p.x, p.y, p.size, alpha);
    }
  }

  function drawButterflies(t) {
    if (!owns('butterflies')) return;
    for (const b of R.butterflies) {
      const s = b.seed, tt = t * 0.5 + s;
      Art.butterfly(ctx, 480 + Math.sin(tt * 0.7) * 420 + Math.sin(tt * 2.1) * 30, 220 + Math.sin(tt * 1.1 + s) * 90, t + s, b.colour, 1.7);
    }
  }

  function render(dt) {
    const t = R.t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    drawDecorUnder(t);
    Art.sign(ctx, W / 2, 30, cafeName(), t);
    drawLights(t);
    drawMenuBoard();
    drawEllaChar(t);
    drawCounter();
    const c = R.customer;
    if (c && c.y < 400) drawCustomer(c, t);
    drawWaterfall(t);
    drawPond(t);
    if (c && c.y >= 400) drawCustomer(c, t);
    drawDog(t);
    drawButterflies(t);
    if (c) customerBubble(c, t); else R.bubbleRect = null;
    drawSays();
    drawParticles(dt);
  }

  // ---------- Loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    R.t += dt;
    R.ellaWave = Math.max(0, R.ellaWave - dt);
    updateCustomer(dt);
    updateAnimals(dt);
    render(dt);
    R.hintTimer -= dt;
    if (R.hintTimer <= 0) { R.hintTimer = 0.4; updateHint(); if (R.tray) refreshTrayMeters(); }
    R.saveTimer -= dt;
    if (R.saveTimer <= 0 && R.started) { R.saveTimer = 4; save(); }
    requestAnimationFrame(frame);
  }
  // Update just the meter bars so the tray buttons aren't rebuilt under Ella's finger.
  function refreshTrayMeters() {
    const vals = R.tray === 'dog' ? [S.tummy, S.fun] : [S.pondFood, 100 - S.algae.length * 20];
    $('tray').querySelectorAll('.meter').forEach((m, i) => {
      m.classList.toggle('ok', vals[i] >= 50);
      m.querySelector('.meter-bar > div').style.width = `${Math.round(vals[i])}%`;
    });
  }

  addEventListener('resize', resize);
  resize();
  $('title-cafe').textContent = S.setupDone ? cafeName() : 'Run a magical rainforest café!';
  if (!S.setupDone) $('play-btn').textContent = '▶ Start';
  updateHud();
  if (document.fonts) document.fonts.ready.then(resize);
  requestAnimationFrame(frame);
})();
