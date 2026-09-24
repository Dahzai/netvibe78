/**
 * Procedural Web Audio API sound synthesis for medieval combat.
 * No external mp3 assets required; zero latency, fully responsive and dynamic.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private musicBeat: number = 0;
  private isInCombat: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureContext() {
    this.initContext();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setMusicVolume(volume: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime);
    }
  }

  // --- SWORD SWING ---
  public playSwordSwing() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.22;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + dur);
    filter.Q.setValueAtTime(3.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur);
  }

  // --- AXE SWING ---
  public playAxeSwing() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.35;

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Deep sub-tone for heavy axe mass
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur);
    osc.start(t);
    osc.stop(t + dur);
  }

  // --- WEAPON CLASH / METAL-ON-METAL ---
  public playWeaponClash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Metallic chime frequencies (inharmonic metal blade resonance)
    const freqs = [1280, 2140, 3180, 4750];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.94, t + 0.4);

      const vol = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 + idx * 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.6);
    });

    // Sharp initial impact transient click
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(600, t);
    oscClick.frequency.exponentialRampToValueAtTime(90, t + 0.04);
    gainClick.gain.setValueAtTime(0.5, t);
    gainClick.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    oscClick.connect(gainClick);
    gainClick.connect(this.sfxGain);
    oscClick.start(t);
    oscClick.stop(t + 0.04);
  }

  // --- SHIELD / WEAPON BLOCK ---
  public playBlock() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Heavy blunt metal parry thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);

    // High metal ring deflection
    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1850, t);
    ringGain.gain.setValueAtTime(0.25, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    ring.connect(ringGain);
    ringGain.connect(this.sfxGain);
    ring.start(t);
    ring.stop(t + 0.25);
  }

  // --- FLESH / ARMOR IMPACT (HIT) ---
  public playHit(isHeavy: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = isHeavy ? 0.35 : 0.2;

    // Visceral low impact punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 160 : 210, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + dur);

    gain.gain.setValueAtTime(isHeavy ? 0.8 : 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);

    // Crunch noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(650, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.45 : 0.25, t);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.12);
  }

  // --- DODGE / ROLL WHOOSH ---
  public playDodge() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.28;

    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(850, t + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(250, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur);
  }

  // --- FOOTSTEP ---
  public playFootstep() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dur = 0.08;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95 + Math.random() * 30, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + dur);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  // --- GUARD BREAK STUN ---
  public playGuardBreak() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Shattering ring
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.6);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // --- VICTORY FANFARE ---
  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Medieval brass fanfare chords (D4 -> F#4 -> A4 -> D5)
    const chord = [293.66, 369.99, 440.0, 587.33];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.001, t + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.12);
      osc.stop(t + 2.3);
    });
  }

  // --- DEFEAT TOLL ---
  public playDefeat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Low funeral bell toll (C#2 / 69.3 Hz + dark inharmonics)
    const freqs = [69.3, 138.6, 218.0];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.4 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 2.9);
    });
  }

  // --- DYNAMIC MEDIEVAL BGM ---
  public startCombatMusic() {
    this.initContext();
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    this.isInCombat = true;
    this.musicBeat = 0;

    const bpm = 100;
    const intervalMs = (60 / bpm) * 1000 * 0.5; // Eighth note step

    const step = () => {
      if (!this.musicPlaying) return;
      this.playMusicStep(this.musicBeat);
      this.musicBeat = (this.musicBeat + 1) % 32;
      this.musicTimer = window.setTimeout(step, intervalMs);
    };

    step();
  }

  public stopCombatMusic() {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playMusicStep(beat: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // War drum on downbeats (beats 0, 4, 8, 12, 16, 20, 24, 28)
    if (beat % 4 === 0) {
      this.playDrum(t, beat % 8 === 0 ? 65 : 85, beat % 8 === 0 ? 0.45 : 0.3);
    } else if (beat % 2 === 0 && Math.random() > 0.4) {
      // Syncopated ghost snare/taiko
      this.playDrum(t, 120, 0.15);
    }

    // Atmospheric cello / drone chord on every 16 beats (Bar start)
    if (beat === 0 || beat === 16) {
      const root = beat === 0 ? 73.42 : 65.41; // D2 or C2
      this.playDroneNote(t, root, 4.2);
      this.playDroneNote(t, root * 1.5, 4.2); // Fifth
    }
  }

  private playDrum(time: number, freq: number, volume: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.22);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  private playDroneNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.linearRampToValueAtTime(450, time + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(280, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }
}

export const soundEngine = new SoundEngine();
