class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if suspended (browser security autoplay policies)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Classic AIM message received "Ting!"
  playReceived() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.50, now); // C6
      osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now); // E6
      osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.12); // C7

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }

  // Classic AIM message sent "Shhhk" or click
  playSent() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.04; // 40ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1300;
      filter.Q.value = 4.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.04);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }

  // Classic AIM Buddy Sign On (Door opening & Chime)
  playSignOn() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Squeak sound (sweeping high pitch triangle)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.linearRampToValueAtTime(2200, now + 0.12);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.12);

      // Chime part
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      
      chimeOsc.type = "sine";
      chimeOsc.frequency.setValueAtTime(523.25, now + 0.12); // C5
      chimeOsc.frequency.setValueAtTime(783.99, now + 0.20); // G5
      chimeOsc.frequency.setValueAtTime(1046.50, now + 0.28); // C6
      
      chimeGain.gain.setValueAtTime(0.0, now);
      chimeGain.gain.setValueAtTime(0.08, now + 0.12);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      
      chimeOsc.start(now + 0.12);
      chimeOsc.stop(now + 0.6);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }

  // Classic AIM Buddy Sign Off (Door Slam)
  playSignOff() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(120, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }

  // Warning Sound "Error Alert/Buzzer"
  playWarning() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 250;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }
}

export const soundManager = new SoundManager();
