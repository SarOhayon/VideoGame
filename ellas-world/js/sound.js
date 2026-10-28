'use strict';
// Tiny WebAudio synth: café sound effects and a gentle marimba tune. No audio files needed.
const Sound = (() => {
  let ac = null, out = null, musicBus = null, noiseBuf = null, musicTimer = null, beat = 0;
  let sfxOn = true, musicOn = true;

  function init() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      out = ac.createGain(); out.gain.value = 0.55; out.connect(ac.destination);
      musicBus = ac.createGain(); musicBus.gain.value = 0.16; musicBus.connect(out);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(f, dur, o = {}) {
    if (!ac || (!sfxOn && !o.music)) return;
    const t0 = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.music ? musicBus : out);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, o = {}) {
    if (!ac || !sfxOn) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = ac.currentTime + (o.delay || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.freq || 1000; f.Q.value = o.q || 1;
    const g = ac.createGain();
    g.gain.setValueAtTime(o.vol || 0.15, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  const fx = {
    pop: () => tone(520, 0.12, { type: 'triangle', to: 950, vol: 0.22 }),
    tap: () => tone(700, 0.06, { type: 'triangle', vol: 0.12 }),
    nope: () => { tone(330, 0.13, { type: 'triangle', vol: 0.16 }); tone(262, 0.2, { type: 'triangle', vol: 0.16, delay: 0.11 }); },
    coin: () => { tone(988, 0.1, { type: 'square', vol: 0.06 }); tone(1319, 0.25, { type: 'square', vol: 0.06, delay: 0.08 }); },
    heart: () => [784, 988, 1175].forEach((f, i) => tone(f, 0.25, { vol: 0.12, delay: i * 0.07 })),
    sparkle: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.08, delay: i * 0.06 })),
    bell: () => { tone(1568, 0.7, { vol: 0.12 }); tone(2093, 0.7, { vol: 0.08, delay: 0.16 }); },
    woof: () => { tone(260, 0.16, { type: 'sawtooth', to: 150, vol: 0.12 }); noise(0.12, { freq: 500, vol: 0.12 }); },
    blend: () => noise(0.22, { freq: 900, q: 0.7, vol: 0.2 }),
    sizzle: () => noise(0.3, { freq: 4000, q: 0.5, vol: 0.12 }),
    clink: () => { tone(2400, 0.12, { vol: 0.08 }); tone(3100, 0.1, { vol: 0.05, delay: 0.03 }); },
    splash: () => noise(0.35, { freq: 1600, q: 0.6, vol: 0.16 }),
    chomp: () => { noise(0.07, { freq: 700, vol: 0.18 }); noise(0.07, { freq: 700, vol: 0.18, delay: 0.16 }); },
    squeak: () => tone(1100, 0.14, { to: 1700, vol: 0.1 }),
    tada: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.18, { type: 'triangle', vol: 0.14, delay: i * 0.12 })),
  };

  // F major pentatonic marimba. Four chords, eight beats each.
  const SCALE = [349, 392, 440, 523, 587, 698, 784, 880];
  const ROOTS = [175, 220, 233, 196];
  function tick() {
    if (!ac || !musicOn) return;
    const bar = Math.floor(beat / 8) % ROOTS.length;
    if (beat % 8 === 0) tone(ROOTS[bar], 0.9, { music: true, vol: 0.5 });
    if (beat % 8 === 4) tone(ROOTS[bar] * 1.5, 0.5, { music: true, vol: 0.3 });
    if (Math.random() < 0.55) {
      const f = SCALE[Math.floor(Math.random() * SCALE.length)];
      tone(f, 0.35, { music: true, vol: 0.45 });
      tone(f * 4, 0.08, { music: true, vol: 0.08 });
    }
    beat++;
  }
  function startMusic() {
    if (musicTimer || !musicOn) return;
    init(); musicTimer = setInterval(tick, 260);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  return {
    init, ...fx,
    setSfx(v) { sfxOn = v; },
    setMusic(v) { musicOn = v; if (v) startMusic(); else stopMusic(); },
    startMusic,
  };
})();
