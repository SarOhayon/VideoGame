// Tiny WebAudio synth: sound effects + a looping trap beat. No audio files needed.
const Sound = (() => {
  let ac = null, master = null, musicGain = null, noiseBuf = null;
  let musicOn = false, musicTimer = null, step = 0, nextTime = 0;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    } catch (e) { ac = null; }
  }

  function tone(freq, dur, type, vol, slideTo, at, dest) {
    if (!ac) return;
    const t = at ?? ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, hp, at, dest) {
    if (!ac) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = at ?? ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 1000;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || master);
    s.start(t); s.stop(t + dur + 0.05);
  }

  const later = (d) => (ac ? ac.currentTime + d : 0);

  const play = {
    coin() { tone(1320, 0.07, 'square', 0.05); tone(1980, 0.09, 'square', 0.05, null, later(0.05)); },
    punch() { noise(0.07, 0.22, 400); tone(160, 0.09, 'sine', 0.3, 60); },
    hit() { tone(110, 0.14, 'sawtooth', 0.16, 45); noise(0.05, 0.18, 2000); },
    hurt() { tone(320, 0.22, 'sawtooth', 0.13, 110); },
    snap() { tone(988, 0.08, 'sine', 0.2); tone(1480, 0.16, 'sine', 0.2, null, later(0.08)); },
    honk() { tone(233, 0.32, 'square', 0.09); tone(277, 0.32, 'square', 0.07); },
    door() { tone(523, 0.06, 'triangle', 0.15); tone(784, 0.09, 'triangle', 0.15, null, later(0.06)); },
    buy() { [880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.1, 'square', 0.06, null, later(i * 0.06))); },
    ko() { tone(420, 0.35, 'triangle', 0.16, 70); },
    charge() { tone(110, 0.7, 'sawtooth', 0.09, 520); },
    crash() { noise(0.4, 0.35, 80); tone(70, 0.35, 'sine', 0.4, 35); },
    heal() { tone(660, 0.1, 'triangle', 0.12); tone(990, 0.15, 'triangle', 0.12, null, later(0.08)); },
    win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'square', 0.07, null, later(i * 0.12))); },
    error() { tone(160, 0.15, 'square', 0.08); },
  };

  // --- Music: dark 140bpm trap loop (808 + hats + claps + bell) ---
  const BPM = 140, STEP = 60 / BPM / 4;
  const ROOTS = [55, 43.65, 49, 41.2];
  const BELL = [[440, 523.25, 659.25], [349.23, 440, 523.25], [392, 493.88, 587.33], [329.63, 415.3, 493.88]];
  const BELL_AT = { 0: 0, 3: 1, 6: 2, 10: 1 };

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 32) % 4, i = s % 32;
    if ([0, 11, 16, 22, 27].includes(i)) {
      tone(150, 0.11, 'sine', 0.5, 40, t, musicGain);
      tone(ROOTS[bar], 0.55, 'sine', 0.42, ROOTS[bar] * 0.94, t, musicGain);
    }
    if (i === 8 || i === 24) noise(0.16, 0.28, 1400, t, musicGain);
    const roll = i >= 28;
    if (i % 2 === 0 || roll) noise(0.03, roll ? 0.06 : 0.09, 7000, t, musicGain);
    const b = BELL_AT[i % 16];
    if (b !== undefined) tone(BELL[bar][b] * 2, 0.4, 'triangle', 0.05, null, t, musicGain);
  }

  function pump() {
    if (!ac || !musicOn) return;
    while (nextTime < ac.currentTime + 0.15) { scheduleStep(step++, nextTime); nextTime += STEP; }
  }

  function setMusic(on) {
    init();
    if (!ac) return false;
    musicOn = on;
    if (on) {
      nextTime = ac.currentTime + 0.05;
      if (!musicTimer) musicTimer = setInterval(pump, 40);
    } else {
      clearInterval(musicTimer); musicTimer = null;
    }
    return musicOn;
  }

  return { init, play, setMusic, isMusicOn: () => musicOn };
})();
