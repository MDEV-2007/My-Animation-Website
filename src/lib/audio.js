'use client';

import { stage } from './state';

// A fully procedural ambient engine — no audio files, no copyrighted music.
// It evokes the *style* of a Zimmer-esque space score with original material:
// a sustained church-organ pad, a slow high "wind" shimmer, and a hypnotic
// ascending arpeggio ostinato that morphs per world. A master high-pass keeps
// it cinematic, never engine-like.

// Per-world identity. `root` sits in a musical octave; `chord` are semitone
// offsets voiced open + consonant; `air` shapes the breath layer; `step` sets
// the arpeggio speed (ms) so faster/tenser worlds pulse quicker.
const WORLDS = [
  { root: 174.6, chord: [0, 7, 12, 19], air: 3200, step: 300 }, // genesis  (F3)
  { root: 196.0, chord: [0, 7, 12, 16], air: 5200, step: 280 }, // forest   (G3)
  { root: 146.8, chord: [0, 7, 12, 17], air: 2200, step: 340 }, // ocean    (D3)
  { root: 220.0, chord: [0, 7, 14, 19], air: 4200, step: 240 }, // mountains(A3)
  { root: 261.6, chord: [0, 7, 12, 16], air: 6500, step: 220 }, // cosmos   (C4)
  { root: 164.8, chord: [0, 5, 9, 12], air: 2800, step: 300 }, // developer(E3)
  { root: 293.7, chord: [0, 7, 11, 16], air: 7000, step: 260 }, // skills   (D4)
];

function ratio(semitones) {
  return Math.pow(2, semitones / 12);
}

class AudioEngine {
  constructor() {
    this.ready = false;
    this.muted = false;
    this.voices = [];
    this.actIndex = -1;
    this.raf = null;
    this.arpTimer = null;
    this.arpStep = 0;
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit() {
    this.listeners.forEach((f) => f(this.muted, this.ready));
  }

  _organWave(partials) {
    const n = partials.length + 1;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    partials.forEach((amp, i) => (imag[i + 1] = amp));
    return this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  // Must be called from a user gesture (browsers block autoplay).
  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    // organ timbres (drawbar-ish additive)
    this.organSoft = this._organWave([1, 0.5, 0.35, 0.2, 0.12]);
    this.organBright = this._organWave([1, 0.6, 0.6, 0.4, 0.3, 0.2, 0.12]);

    // --- master chain: gain -> high-pass (kill rumble) -> warmth low-pass ---
    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 110;
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass';
    warm.frequency.value = 7000;
    this.master.connect(hp).connect(warm).connect(ctx.destination);
    this.master.gain.setTargetAtTime(0.42, ctx.currentTime, 2.0);

    // --- big generated reverb (cathedral) ---
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(5.0, 2.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.7;
    this.reverb.connect(wet).connect(this.master);

    // --- sustained organ pad ---
    const padBus = ctx.createGain();
    padBus.gain.value = 0.42;
    padBus.connect(this.master);
    padBus.connect(this.reverb);

    for (let i = 0; i < 4; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1600;
      filter.Q.value = 0.2;
      const vGain = ctx.createGain();
      vGain.gain.value = 0.0001;
      filter.connect(vGain).connect(padBus);

      const osc = ctx.createOscillator();
      osc.setPeriodicWave(this.organSoft);
      osc.detune.value = -4;
      osc.connect(filter);
      osc.start();
      const twin = ctx.createOscillator();
      twin.setPeriodicWave(this.organSoft);
      twin.detune.value = 5;
      twin.connect(filter);
      twin.start();

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.03 + i * 0.012;
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(vGain.gain);
      lfo.start();

      vGain.gain.setTargetAtTime(0.1, ctx.currentTime, 3.5);
      this.voices.push({ osc, twin, filter, vGain });
    }

    // --- arpeggio bus (the Interstellar-style ostinato) ---
    this.arpBus = ctx.createGain();
    this.arpBus.gain.value = 0.9;
    const arpLp = ctx.createBiquadFilter();
    arpLp.type = 'lowpass';
    arpLp.frequency.value = 2600;
    this.arpBus.connect(arpLp);
    arpLp.connect(this.master);
    arpLp.connect(this.reverb);

    // --- airy breath layer ---
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(5);
    noise.loop = true;
    const nHi = ctx.createBiquadFilter();
    nHi.type = 'highpass';
    nHi.frequency.value = 1800;
    const nBand = ctx.createBiquadFilter();
    nBand.type = 'bandpass';
    nBand.frequency.value = 3200;
    nBand.Q.value = 0.5;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.0001;
    noise.connect(nHi).connect(nBand).connect(nGain).connect(this.master);
    nGain.connect(this.reverb);
    noise.start();
    nGain.gain.setTargetAtTime(0.035, ctx.currentTime, 3.5);
    const nLfo = ctx.createOscillator();
    const nLfoGain = ctx.createGain();
    nLfo.frequency.value = 0.06;
    nLfoGain.gain.value = 700;
    nLfo.connect(nLfoGain).connect(nBand.frequency);
    nLfo.start();
    this.noise = { band: nBand, gain: nGain };

    this.ready = true;
    this._applyWorld(0, true);
    this._loop();
    this._startArp();
    this.emit();
  }

  // one plucked organ note for the arpeggio
  _arpNote(freq, when, vel = 0.09) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(this.organBright);
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(vel, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.85);
    osc.connect(g).connect(this.arpBus);
    osc.start(when);
    osc.stop(when + 0.9);
  }

  _startArp() {
    const tick = () => {
      const w = WORLDS[this.actIndex] || WORLDS[0];
      if (this.ready && !this.muted && this.pattern) {
        const t = this.ctx.currentTime + 0.02;
        const p = this.pattern;
        const semi = p[this.arpStep % p.length];
        // accent the first note of each bar; occasional silence for breath
        const beat = this.arpStep % p.length;
        const accent = beat === 0 ? 0.12 : 0.075;
        if (!(beat === p.length - 1 && Math.random() < 0.35)) {
          this._arpNote(w.root * ratio(semi), t, accent);
          // sparse high sparkle an octave up
          if (beat % 4 === 0) this._arpNote(w.root * ratio(semi + 12), t, 0.035);
        }
        this.arpStep++;
      }
      this.arpTimer = setTimeout(tick, (WORLDS[this.actIndex] || WORLDS[0]).step);
    };
    tick();
  }

  _impulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const len = rate * duration;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  _noiseBuffer(seconds) {
    const rate = this.ctx.sampleRate;
    const len = rate * seconds;
    const buf = this.ctx.createBuffer(1, len, rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _applyWorld(index, instant = false) {
    if (!this.ready || index === this.actIndex) return;
    this.actIndex = index;
    const w = WORLDS[index];
    const t = this.ctx.currentTime;
    const tau = instant ? 0.001 : 3.0;
    this.voices.forEach((v, i) => {
      const semi = w.chord[i % w.chord.length];
      const freq = w.root * ratio(semi);
      v.osc.frequency.setTargetAtTime(freq, t, tau);
      v.twin.frequency.setTargetAtTime(freq, t, tau);
    });
    this.noise.band.frequency.setTargetAtTime(w.air, t, tau);
    // build an ascending arpeggio over the chord across ~2 octaves, then a
    // gentle descent for the classic rise-and-fall ostinato.
    const up = [...w.chord, ...w.chord.map((c) => c + 12)];
    const down = [...w.chord.map((c) => c + 12)].reverse().slice(1, -1);
    this.pattern = [...up, ...down];
  }

  _loop() {
    const tick = () => {
      if (this.ready) {
        const p = stage.eased;
        const idx = Math.min(
          WORLDS.length - 1,
          Math.max(0, Math.round(p * (WORLDS.length - 1)))
        );
        this._applyWorld(idx);
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  // soft muted key tap for the terminal
  typing() {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 320 + Math.random() * 220;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // gentle bell when a project world opens
  chime(freq = 660) {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    [freq, freq * 1.5, freq * 2].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.setPeriodicWave(this.organBright);
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02 + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc.connect(g).connect(this.reverb);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  }

  toggleMute() {
    if (!this.ready) return;
    this.muted = !this.muted;
    this.master.gain.setTargetAtTime(
      this.muted ? 0.0001 : 0.42,
      this.ctx.currentTime,
      0.5
    );
    this.emit();
    return this.muted;
  }
}

let engine = null;
export function getAudio() {
  if (typeof window === 'undefined') return null;
  if (!engine) engine = new AudioEngine();
  return engine;
}
