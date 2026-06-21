let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  // Resume context if suspended by browser security autoplay policies
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
};

export const playClickSound = (type: 'click' | 'error' | 'backspace'): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'error') {
      // Lower-pitched thud indicating mistake
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.12);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    // For clicks and backspace, simulate a realistic mechanical keyboard click
    // using a transient noise pop + a rapid sine wave frequency decay.

    // 1. Noise transient (the plastic-on-plastic snap)
    const bufferSize = ctx.sampleRate * 0.02; // 20ms of sound
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter the noise to keep only high/mid frequencies (the "clack")
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'click' ? 4000 : 2500;
    filter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Fast volume envelope for noise
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    // 2. Sine wave pop (the bottom-out thud of the switch keycap)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'click' ? 1400 : 900, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.018);

    oscGain.gain.setValueAtTime(0.04, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    // Start both audio sources
    noiseSource.start(now);
    noiseSource.stop(now + 0.02);
    
    osc.start(now);
    osc.stop(now + 0.02);

  } catch (e) {
    // Fail silently if browser blocks audio thread
    console.warn("Audio play blocked", e);
  }
};
