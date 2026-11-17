// High-fidelity, lightweight Web Audio API sound synthesis
// 100% offline, zero lag, zero external audio asset downloads

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

let isMuted = false;
try {
  const saved = localStorage.getItem('table_sound_muted');
  isMuted = saved === 'true';
} catch {
  // ignore
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
  try {
    localStorage.setItem('table_sound_muted', muted ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!isMuted);
  return isMuted;
}

/**
 * Ultra-subtle, tactile acoustic tap (quiet, non-intrusive like a soft mechanical key or muted pen tap)
 */
export function playTapSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Gentle sine tap with very fast decay (16ms) and low volume
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.016);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.018);
  } catch {
    // AudioContext blocked or unsupported
  }
}

/**
 * Realistic diagonal pen slash / scratch when crossing off a cell
 * Generates textured paper friction between 2200Hz - 4200Hz
 */
export function playCrossSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const sampleRate = ctx.sampleRate;
    const duration = 0.06; // 60ms quick stroke
    const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const progress = i / data.length;
      // Friction scratch envelope: quick attack, textured body, clean release
      const env = Math.sin(progress * Math.PI) * (1 - progress * 0.35);
      data[i] = (Math.random() * 2 - 1) * env * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter centered at 3800Hz dropping to 2200Hz like a physical pen slash
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4200, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + duration);
    filter.Q.setValueAtTime(2.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration + 0.01);
  } catch {
    // ignore
  }
}

// Textured paper grain loop for fluid, continuous crayon/pen doodling
let paperGrainBuffer: AudioBuffer | null = null;
let crayonSource: AudioBufferSourceNode | null = null;
let crayonGain: GainNode | null = null;
let crayonFilter: BiquadFilterNode | null = null;
let crayonSilenceTimeout: ReturnType<typeof setTimeout> | null = null;

function getPaperGrainBuffer(ctx: AudioContext): AudioBuffer {
  if (paperGrainBuffer) return paperGrainBuffer;
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 1.5; // 1.5s seamless loop
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Synthesize realistic paper tooth / fiber roughness
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    const pink = b0 + b1 + b2 + white * 0.5362;
    const grit = Math.random() < 0.03 ? (Math.random() * 2 - 1) * 0.7 : 0;
    data[i] = (pink * 0.35 + grit * 0.65) * 0.22;
  }
  paperGrainBuffer = buffer;
  return buffer;
}

/**
 * Starts continuous paper-grain audio for fluid crayon drawing
 */
export function startCrayonSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    stopCrayonSound();

    const buffer = getPaperGrainBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass filter tuned to paper fiber friction (~3200Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, ctx.currentTime);
    filter.Q.setValueAtTime(2.2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    crayonSource = source;
    crayonGain = gain;
    crayonFilter = filter;
  } catch {
    // ignore
  }
}

/**
 * Called on pointer move while drawing - modulates paper friction with movement
 */
export function updateCrayonMotion() {
  if (isMuted || !crayonGain || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    // Smoothly bring up realistic paper friction sound
    crayonGain.gain.cancelScheduledValues(now);
    crayonGain.gain.setTargetAtTime(0.09, now, 0.015);

    // Subtle pitch fluctuation as stroke curves over paper tooth
    if (crayonFilter) {
      const targetFreq = 2900 + Math.random() * 700;
      crayonFilter.frequency.setTargetAtTime(targetFreq, now, 0.02);
    }

    // Silence smoothly if hand pauses for 75ms
    if (crayonSilenceTimeout) clearTimeout(crayonSilenceTimeout);
    crayonSilenceTimeout = setTimeout(() => {
      if (crayonGain && audioCtx) {
        crayonGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.025);
      }
    }, 75);
  } catch {
    // ignore
  }
}

/**
 * Cleanly stops crayon sound on lift
 */
export function stopCrayonSound() {
  if (crayonSilenceTimeout) {
    clearTimeout(crayonSilenceTimeout);
    crayonSilenceTimeout = null;
  }
  if (crayonGain && audioCtx) {
    try {
      crayonGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.015);
      const oldSource = crayonSource;
      setTimeout(() => {
        try {
          oldSource?.stop();
          oldSource?.disconnect();
        } catch {
          // ignore
        }
      }, 35);
    } catch {
      // ignore
    }
  }
  crayonSource = null;
  crayonGain = null;
  crayonFilter = null;
}

/** Soft rising swoosh when adding a new row */
export function playAddRowSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // ignore
  }
}

/** Soft wipe sound when clearing doodles or scores */
export function playClearSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {
    // ignore
  }
}
