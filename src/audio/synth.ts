type ToneSpec = { frequency: number; duration: number; delay?: number; type?: OscillatorType; gain?: number };

let context: AudioContext | null = null;

const audioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!context) context = new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
};

const playTone = ({ frequency, duration, delay = 0, type = "sine", gain = 0.12 }: ToneSpec) => {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const amp = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(amp).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
};

export const sounds = {
  tick: () => playTone({ frequency: 880, duration: 0.06, type: "square", gain: 0.05 }),
  urgentTick: () => playTone({ frequency: 1320, duration: 0.08, type: "square", gain: 0.07 }),
  boing: () => {
    const ctx = audioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const amp = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    amp.gain.setValueAtTime(0.12, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    oscillator.connect(amp).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.35);
  },
  fanfare: () => {
    playTone({ frequency: 523.25, duration: 0.18, delay: 0, type: "triangle" });
    playTone({ frequency: 659.25, duration: 0.18, delay: 0.16, type: "triangle" });
    playTone({ frequency: 783.99, duration: 0.18, delay: 0.32, type: "triangle" });
    playTone({ frequency: 1046.5, duration: 0.5, delay: 0.48, type: "triangle", gain: 0.16 });
  },
  timeUp: () => {
    playTone({ frequency: 440, duration: 0.25, type: "sawtooth", gain: 0.08 });
    playTone({ frequency: 330, duration: 0.4, delay: 0.22, type: "sawtooth", gain: 0.08 });
  },
  pop: () => playTone({ frequency: 1200, duration: 0.05, type: "sine", gain: 0.08 }),
};

export type SoundName = keyof typeof sounds;

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
};
