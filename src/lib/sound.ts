// Synthesized game audio via Web Audio — no audio files to download (SA
// data budget), no licensing. The AudioContext is created lazily inside a
// user gesture, which also satisfies browser autoplay policies. All calls
// are safe no-ops on unsupported browsers or when muted.

const MUTE_KEY = "mw:muted";
let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
}

function audioCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  at?: number; // seconds from now
  duration?: number;
  glideTo?: number; // pitch slide target
}

function tone(freq: number, opts: ToneOpts = {}): void {
  if (isMuted()) return;
  const audio = audioCtx();
  if (!audio) return;
  try {
    const { type = "sine", gain = 0.12, at = 0, duration = 0.12, glideTo } = opts;
    const t0 = audio.currentTime + at;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {}
}

/** Semitone helper: n steps above A4-ish base. */
const step = (base: number, n: number) => base * Math.pow(2, n / 12);

export const sfx = {
  /** Key/letter press; pitch rises with each letter in the trace. */
  click(index = 0) {
    tone(step(440, Math.min(index, 8) * 2), {
      type: "triangle",
      gain: 0.07,
      duration: 0.06,
    });
  },
  /** A grid/daily word lands. */
  correct() {
    tone(523.25, { at: 0, duration: 0.09 }); // C5
    tone(659.25, { at: 0.07, duration: 0.09 }); // E5
    tone(783.99, { at: 0.14, duration: 0.14 }); // G5
  },
  /** Bonus word found. */
  bonus() {
    tone(880, { type: "triangle", at: 0, duration: 0.08 });
    tone(1174.66, { type: "triangle", at: 0.06, duration: 0.16, gain: 0.1 });
  },
  /** Coins land in the wallet. */
  coin() {
    tone(987.77, { type: "square", gain: 0.05, duration: 0.05 });
    tone(1318.51, { type: "square", gain: 0.05, at: 0.05, duration: 0.12 });
  },
  /** Coins spent (hint). */
  spend() {
    tone(660, { type: "square", gain: 0.05, duration: 0.1, glideTo: 440 });
  },
  /** Invalid word / rejected input. */
  invalid() {
    tone(180, { type: "sawtooth", gain: 0.06, duration: 0.14 });
  },
  /** Level or daily puzzle complete. */
  complete() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, { at: i * 0.09, duration: 0.16, gain: 0.11 }),
    );
  },
  /** Chapter unlocked — bigger fanfare. */
  unlock() {
    tone(261.63, { type: "triangle", at: 0, duration: 0.5, gain: 0.08 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
      tone(f, { at: 0.06 + i * 0.1, duration: 0.2, gain: 0.1 }),
    );
  },
};
