// Audio and vibration utilities using Web Audio API (no external MP3 needed!)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Must be called on user tap (click/touch) so Android Chrome unlocks Web Audio playback.
 */
export function unlockAudio(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play silent 1-sample buffer to ensure iOS/Android hardware audio channel wakes up
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // ignore
  }
}

export function playBeep(
  frequency = 600,
  duration = 0.15,
  type: OscillatorType = 'sine',
  volume = 0.25
) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
}

/**
 * Loud mechanical clock TIC-TAC for the final 5 seconds of rest (5, 4, 3, 2, 1).
 * Odd seconds (5, 3, 1) play sharp high "TIC"; even seconds (4, 2) play resonant "TAC".
 */
export function playClockTickTock(remainingSeconds = 1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isTic = remainingSeconds % 2 === 1;

    // 1) Resonant woody/metallic clock escapement body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    const startFreq = isTic ? 2100 : 1480;
    const endFreq = isTic ? 820 : 540;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.045);

    oscGain.gain.setValueAtTime(0.95, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // 2) Crisp mechanical click transient (cuts through loud gym speakers on Android)
    const clickDur = 0.028;
    const sampleCount = Math.floor(ctx.sampleRate * clickDur);
    const noiseBuffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleCount * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isTic ? 3200 : 2300, now);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + clickDur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    vibrateDevice([65]);
  } catch (e) {
    console.warn('Tick-tock playback error', e);
  }
}

// Rest timer finish alert (High energy loud chime)
export function playRestFinishAlert() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.75, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    // Upward triumphant chime
    playTone(587.33, now, 0.14); // D5
    playTone(783.99, now + 0.14, 0.14); // G5
    playTone(1046.5, now + 0.28, 0.4); // C6

    vibrateDevice([300, 120, 400]);
  } catch (e) {
    console.warn('Rest alert error', e);
  }
}

// Personal Record celebration sound (fanfare!)
export function playPRFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.15, t: 0.24 },
      { f: 1046.5, d: 0.45, t: 0.39 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.35, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });

    vibrateDevice([150, 80, 150, 80, 300]);
  } catch (e) {
    console.warn('PR fanfare error', e);
  }
}

export function vibrateDevice(pattern: number[] = [200]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored if device does not support or permission blocked
    }
  }
}
