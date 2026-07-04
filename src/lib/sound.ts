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

interface NoiseOpts {
  at?: number;
  duration?: number;
  gain?: number;
  /** band-pass center; low = whoosh/boom, high = shimmer/cymbal */
  freq?: number;
  q?: number;
}

/** Filtered white-noise burst — the "body" layer tones alone can't give. */
function noise(opts: NoiseOpts = {}): void {
  if (isMuted()) return;
  const audio = audioCtx();
  if (!audio) return;
  try {
    const { at = 0, duration = 0.25, gain = 0.1, freq = 2000, q = 0.8 } = opts;
    const t0 = audio.currentTime + at;
    const len = Math.ceil(audio.sampleRate * duration);
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = audio.createBufferSource();
    src.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, t0);
    filter.Q.setValueAtTime(q, t0);
    const amp = audio.createGain();
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter).connect(amp).connect(audio.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.05);
  } catch {}
}

/** Semitone helper: n steps above A4-ish base. */
const step = (base: number, n: number) => base * Math.pow(2, n / 12);

export const sfx = {
  /** Key/letter press; pitch rises with each letter in the trace. */
  click(index = 0) {
    tone(step(440, Math.min(index, 8) * 2), {
      type: "triangle",
      gain: 0.09,
      duration: 0.06,
    });
  },
  /**
   * A grid/daily word lands: soft *shh* + rising triad + low thump.
   * Combo (2, 3, …) shifts the triad up so chains audibly climb.
   */
  correct(combo = 1) {
    const shift = Math.min(Math.max(combo - 1, 0), 4) * 2; // +2 semitones per combo, capped
    noise({ duration: 0.18, gain: 0.06, freq: 3200, q: 0.6 }); // shh
    tone(step(110, shift), { type: "sine", gain: 0.14, duration: 0.16 }); // thump
    tone(step(523.25, shift), { at: 0.02, duration: 0.1, gain: 0.13 });
    tone(step(659.25, shift), { at: 0.09, duration: 0.1, gain: 0.13 });
    tone(step(783.99, shift), { at: 0.16, duration: 0.18, gain: 0.14 });
  },
  /** Bonus word found: fast sparkle arpeggio. */
  bonus() {
    [880, 1108.73, 1318.51, 1760].forEach((f, i) =>
      tone(f, { type: "triangle", at: i * 0.045, duration: 0.1, gain: 0.11 }),
    );
    noise({ at: 0.05, duration: 0.3, gain: 0.045, freq: 6500, q: 0.5 }); // shimmer
  },
  /** Coins land in the wallet. */
  coin() {
    tone(987.77, { type: "square", gain: 0.06, duration: 0.05 });
    tone(1318.51, { type: "square", gain: 0.06, at: 0.05, duration: 0.12 });
  },
  /** Coins spent (hint). */
  spend() {
    tone(660, { type: "square", gain: 0.05, duration: 0.1, glideTo: 440 });
  },
  /** Invalid word / rejected input. */
  invalid() {
    tone(180, { type: "sawtooth", gain: 0.06, duration: 0.14 });
  },
  /** Level or daily puzzle complete: *shhh-boom* + chord. */
  complete() {
    noise({ duration: 0.35, gain: 0.07, freq: 1800, q: 0.5 }); // shhh swell
    tone(130.81, { type: "sine", at: 0.08, duration: 0.4, gain: 0.16 }); // boom
    noise({ at: 0.08, duration: 0.25, gain: 0.05, freq: 500, q: 0.7 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, { at: 0.1 + i * 0.08, duration: 0.22, gain: 0.13 }),
    );
  },
  /** Chapter unlocked — the big layered hit. */
  unlock() {
    tone(65.41, { type: "sine", at: 0, duration: 0.7, gain: 0.18 }); // sub
    tone(130.81, { type: "sawtooth", at: 0, duration: 0.5, gain: 0.06 }); // body
    noise({ duration: 0.8, gain: 0.06, freq: 7000, q: 0.4 }); // cymbal tail
    [261.63, 329.63, 392.0, 523.25, 659.25, 783.99].forEach((f, i) =>
      tone(f, { at: 0.05 + i * 0.07, duration: 0.3, gain: 0.12 }),
    );
    tone(1046.5, { at: 0.55, duration: 0.5, gain: 0.12 }); // sustained top
  },
};
