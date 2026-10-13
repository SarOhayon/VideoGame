// Keyboard + touch input, mapped to game actions.
const Input = {
  down: new Set(),
  presses: new Set(),
  joy: { active: false, x: 0, y: 0 },
  touch: false,
  KEYMAP: {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
    ' ': 'attack', j: 'attack', e: 'interact', enter: 'interact', shift: 'skate', q: 'skate',
    escape: 'pause', p: 'pause', m: 'music',
  },

  init() {
    addEventListener('keydown', (e) => {
      const a = this.KEYMAP[e.key.toLowerCase()];
      if (!a) return;
      e.preventDefault();
      if (!e.repeat) this.presses.add(a);
      this.down.add(a);
    });
    addEventListener('keyup', (e) => {
      const a = this.KEYMAP[e.key.toLowerCase()];
      if (a) this.down.delete(a);
    });
    addEventListener('blur', () => this.down.clear());
    this.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  held(a) { return this.down.has(a); },
  take(a) { if (this.presses.has(a)) { this.presses.delete(a); return true; } return false; },
  press(a) { this.presses.add(a); },

  move() {
    let x = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0);
    let y = (this.held('down') ? 1 : 0) - (this.held('up') ? 1 : 0);
    if (this.joy.active) { x = this.joy.x; y = this.joy.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    return { x, y };
  },

  endFrame() { this.presses.clear(); },
};
