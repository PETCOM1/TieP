export type SoundType = 'blue' | 'brown' | 'typewriter' | 'digital';

class AudioService {
  private ctx: AudioContext | null = null;
  private volumeValue = 0.5;
  private soundTypeValue: SoundType = 'blue';
  private muted = false;

  constructor() {
    // Load config from localStorage
    const storedVol = localStorage.getItem('tiepit_sound_volume');
    if (storedVol !== null) this.volumeValue = parseFloat(storedVol);
    
    const storedType = localStorage.getItem('tiepit_sound_type');
    if (storedType !== null) this.soundTypeValue = storedType as SoundType;
    
    const storedMuted = localStorage.getItem('tiepit_sound_muted');
    if (storedMuted !== null) this.muted = storedMuted === 'true';
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    localStorage.setItem('tiepit_sound_volume', this.volumeValue.toString());
  }

  getVolume(): number {
    return this.volumeValue;
  }

  setSoundType(type: SoundType) {
    this.soundTypeValue = type;
    localStorage.setItem('tiepit_sound_type', type);
  }

  getSoundType(): SoundType {
    return this.soundTypeValue;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    localStorage.setItem('tiepit_sound_muted', muted.toString());
  }

  isMuted(): boolean {
    return this.muted;
  }

  playKey(key: string) {
    if (this.muted || this.volumeValue === 0) return;
    
    try {
      this.initContext();
      if (!this.ctx) return;
      
      const destination = this.ctx.destination;
      const now = this.ctx.currentTime;

      // Master Gain Node for Volume Control
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volumeValue * 0.4, now); // Scale to prevent clipping
      masterGain.connect(destination);

      const isSpace = key === ' ' || key === 'Spacebar';
      const isEnter = key === 'Enter';

      if (this.soundTypeValue === 'blue') {
        this.playCherryBlue(this.ctx, masterGain, now, isSpace, isEnter);
      } else if (this.soundTypeValue === 'brown') {
        this.playCherryBrown(this.ctx, masterGain, now, isSpace, isEnter);
      } else if (this.soundTypeValue === 'typewriter') {
        this.playTypewriter(this.ctx, masterGain, now, isSpace, isEnter);
      } else if (this.soundTypeValue === 'digital') {
        this.playDigital(this.ctx, masterGain, now, isSpace, isEnter);
      }
    } catch (e) {
      console.warn("Failed to play keyboard audio click:", e);
    }
  }

  private playCherryBlue(ctx: AudioContext, output: AudioNode, now: number, isSpace: boolean, isEnter: boolean) {
    // High-frequency tactile metal click
    const clickDuration = 0.006;
    const noise = this.createNoiseBuffer(ctx, clickDuration);
    if (noise) {
      const clickSource = ctx.createBufferSource();
      clickSource.buffer = noise;
      
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(6500, now);
      
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(1.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + clickDuration);
      
      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(output);
      clickSource.start(now);
    }

    // Housing bottom-out thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const clackDuration = isSpace ? 0.08 : isEnter ? 0.06 : 0.035;
    const baseFreq = isSpace ? 190 : isEnter ? 240 : 340;
    const pitchJitter = (Math.random() - 0.5) * 20;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq + pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime((baseFreq + pitchJitter) * 0.75, now + clackDuration);

    oscGain.gain.setValueAtTime(isSpace ? 0.8 : 0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + clackDuration);

    const clackFilter = ctx.createBiquadFilter();
    clackFilter.type = 'lowpass';
    clackFilter.frequency.setValueAtTime(1200, now);

    osc.connect(clackFilter);
    clackFilter.connect(oscGain);
    oscGain.connect(output);
    osc.start(now);
    osc.stop(now + clackDuration);
  }

  private playCherryBrown(ctx: AudioContext, output: AudioNode, now: number, isSpace: boolean, isEnter: boolean) {
    // Softer tactile bump, thud bottom-out thud only
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const duration = isSpace ? 0.09 : isEnter ? 0.07 : 0.045;
    const baseFreq = isSpace ? 160 : isEnter ? 200 : 280;
    const pitchJitter = (Math.random() - 0.5) * 15;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq + pitchJitter, now);
    osc.frequency.linearRampToValueAtTime((baseFreq + pitchJitter) * 0.8, now + duration);

    oscGain.gain.setValueAtTime(isSpace ? 0.6 : 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(output);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  private playTypewriter(ctx: AudioContext, output: AudioNode, now: number, isSpace: boolean, isEnter: boolean) {
    // Heavy wooden strike pop + ringing spring
    const duration = isSpace ? 0.18 : isEnter ? 0.14 : 0.09;
    const baseFreq = isSpace ? 130 : isEnter ? 180 : 250;
    const pitchJitter = (Math.random() - 0.5) * 30;

    const noise = this.createNoiseBuffer(ctx, duration);
    if (noise) {
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noise;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq + pitchJitter, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      noiseSource.start(now);
    }

    // High spring ring component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSpace ? 700 : 1300, now);
    oscGain.gain.setValueAtTime(isSpace ? 0.04 : 0.1, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.18 : 0.08));
    
    osc.connect(oscGain);
    oscGain.connect(output);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  private playDigital(ctx: AudioContext, output: AudioNode, now: number, isSpace: boolean, isEnter: boolean) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const duration = 0.012;
    const pitch = isSpace ? 600 : isEnter ? 800 : 1200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(oscGain);
    oscGain.connect(output);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer | null {
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    } catch {
      return null;
    }
  }
}

export const audioService = new AudioService();
