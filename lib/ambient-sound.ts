/**
 * Web Audio API Ambient Soundscape Generator
 * Produces calming, high-fidelity background environments (Rain, Campfire, Forest, Ocean, Lullaby)
 * that play smoothly under audiobook narration.
 */

export type AmbientSoundType = "none" | "rain" | "campfire" | "forest" | "ocean" | "lullaby";

export interface AmbientTrackOption {
  id: AmbientSoundType;
  name: string;
  emoji: string;
  description: string;
}

export const AMBIENT_TRACKS: AmbientTrackOption[] = [
  {
    id: "none",
    name: "Silent / Off",
    emoji: "🔇",
    description: "Voice narration only",
  },
  {
    id: "rain",
    name: "Cozy Gentle Rain",
    emoji: "🌧️",
    description: "Soft raindrops on a bedroom window",
  },
  {
    id: "campfire",
    name: "Warm Campfire",
    emoji: "🪵",
    description: "Crackling warm hearth & glow",
  },
  {
    id: "forest",
    name: "Enchanted Woods",
    emoji: "🌲",
    description: "Whispering pine breeze & gentle birds",
  },
  {
    id: "ocean",
    name: "Calm Ocean Waves",
    emoji: "🌊",
    description: "Rhythmic soothing tides on shore",
  },
  {
    id: "lullaby",
    name: "Music Box Bells",
    emoji: "🎵",
    description: "Dreamy soft pentatonic music box",
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: AmbientSoundType = "none";
  private isRunning: boolean = false;
  private volume: number = 0.25; // Default ambient volume (gentle background)

  // Active nodes for cleanup
  private activeNodes: (AudioNode | number)[] = [];
  private intervals: NodeJS.Timeout[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): AmbientSoundType {
    return this.currentTrack;
  }

  public stop() {
    this.currentTrack = "none";
    this.isRunning = false;

    // Clear all intervals and loops
    this.intervals.forEach((timer) => clearInterval(timer));
    this.intervals = [];

    // Fade out and disconnect active nodes
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    }

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        try {
          if (typeof node === "object" && "disconnect" in node) {
            (node as AudioNode).disconnect();
          }
        } catch {
          // ignore
        }
      });
      this.activeNodes = [];

      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }, 120);
  }

  public play(track: AmbientSoundType) {
    this.stop();
    this.currentTrack = track;
    if (track === "none") return;

    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    this.isRunning = true;
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);

    switch (track) {
      case "rain":
        this.startRain(ctx, this.masterGain);
        break;
      case "campfire":
        this.startCampfire(ctx, this.masterGain);
        break;
      case "forest":
        this.startForest(ctx, this.masterGain);
        break;
      case "ocean":
        this.startOcean(ctx, this.masterGain);
        break;
      case "lullaby":
        this.startLullaby(ctx, this.masterGain);
        break;
    }
  }

  // --- SOUND GENERATORS ---

  private createNoiseBuffer(ctx: AudioContext, seconds: number = 3): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Pink / Brown filtered noise
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain boost
    }
    return buffer;
  }

  private startRain(ctx: AudioContext, destination: GainNode) {
    // Continuous soft pink noise base
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, ctx.currentTime);

    noise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter, rainGain);

    // Random soft raindrop pings
    const interval = setInterval(() => {
      if (!this.isRunning || this.currentTrack !== "rain") return;
      try {
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const freq = 1200 + Math.random() * 800;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.04);

        dropGain.gain.setValueAtTime(0.04 + Math.random() * 0.03, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

        osc.connect(dropGain);
        dropGain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch {
        // ignore
      }
    }, 180);

    this.intervals.push(interval);
  }

  private startCampfire(ctx: AudioContext, destination: GainNode) {
    // Warm low-frequency roar
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    const fireGain = ctx.createGain();
    fireGain.gain.setValueAtTime(0.4, ctx.currentTime);

    noise.connect(filter);
    filter.connect(fireGain);
    fireGain.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter, fireGain);

    // Crackle & pop impulses
    const interval = setInterval(() => {
      if (!this.isRunning || this.currentTrack !== "campfire") return;
      if (Math.random() > 0.4) {
        try {
          const osc = ctx.createOscillator();
          const popGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(120 + Math.random() * 300, ctx.currentTime);

          popGain.gain.setValueAtTime(0.12 + Math.random() * 0.08, ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

          osc.connect(popGain);
          popGain.connect(destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.035);
        } catch {
          // ignore
        }
      }
    }, 120);

    this.intervals.push(interval);
  }

  private startForest(ctx: AudioContext, destination: GainNode) {
    // Gentle whispering tree canopy breeze
    const noiseBuffer = this.createNoiseBuffer(ctx, 4);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.2, ctx.currentTime);

    noise.connect(filter);
    filter.connect(breezeGain);
    breezeGain.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter, breezeGain);

    // Occasional subtle bird chirps in the distance
    const interval = setInterval(() => {
      if (!this.isRunning || this.currentTrack !== "forest") return;
      if (Math.random() > 0.65) {
        try {
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          const baseFreq = 2200 + Math.random() * 600;

          osc.type = "sine";
          osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(baseFreq + 350, ctx.currentTime + 0.06);
          osc.frequency.linearRampToValueAtTime(baseFreq + 100, ctx.currentTime + 0.12);

          chirpGain.gain.setValueAtTime(0.04, ctx.currentTime);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

          osc.connect(chirpGain);
          chirpGain.connect(destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch {
          // ignore
        }
      }
    }, 1200);

    this.intervals.push(interval);
  }

  private startOcean(ctx: AudioContext, destination: GainNode) {
    // Low frequency rolling ocean swells
    const noiseBuffer = this.createNoiseBuffer(ctx, 5);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, ctx.currentTime);

    // LFO for wave swelling
    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.2, ctx.currentTime);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(destination);
    noise.start();

    this.activeNodes.push(noise, filter, swellGain);

    // Dynamic oscillating wave rhythm
    let t = 0;
    const interval = setInterval(() => {
      if (!this.isRunning || this.currentTrack !== "ocean") return;
      t += 0.2;
      const wave = (Math.sin(t * 0.8) + 1) / 2; // 0 to 1 cycle
      if (filter && ctx) {
        try {
          filter.frequency.setTargetAtTime(180 + wave * 450, ctx.currentTime, 0.2);
          swellGain.gain.setTargetAtTime(0.1 + wave * 0.25, ctx.currentTime, 0.2);
        } catch {
          // ignore
        }
      }
    }, 150);

    this.intervals.push(interval);
  }

  private startLullaby(ctx: AudioContext, destination: GainNode) {
    // Pentatonic scale notes (C5, D5, E5, G5, A5, C6)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    let noteIdx = 0;

    const interval = setInterval(() => {
      if (!this.isRunning || this.currentTrack !== "lullaby") return;
      try {
        const freq = notes[noteIdx % notes.length];
        noteIdx = (noteIdx + 1 + Math.floor(Math.random() * 2)) % notes.length;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0.06, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(noteGain);
        noteGain.connect(destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.25);
      } catch {
        // ignore
      }
    }, 900);

    this.intervals.push(interval);
  }
}

export const ambientSound = new AmbientSoundEngine();
