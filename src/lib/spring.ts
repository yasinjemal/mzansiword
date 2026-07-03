// Hand-rolled spring motion (GAME-FEEL.md #4). A damped harmonic oscillator
// is integrated once per call and sampled into Web Animations API keyframes —
// the same technique Motion One uses, at 0 KB of dependencies. Springs are
// decorative: reduced-motion users get the end state instantly.

export interface SpringOpts {
  stiffness?: number;
  damping?: number;
}

/**
 * Integrate a spring from 0 toward 1 and return per-frame progress samples
 * (60 fps spacing). Values overshoot past 1 and oscillate before settling —
 * that overshoot is the whole point.
 */
export function sampleSpring({ stiffness = 320, damping = 16 }: SpringOpts = {}): number[] {
  const out: number[] = [0];
  let x = 0;
  let v = 0;
  const dt = 1 / 120; // integrate at 120 Hz, sample every 2nd step
  for (let i = 0; i < 288; i++) {
    // hard cap ~2.4 s
    const a = -stiffness * (x - 1) - damping * v;
    v += a * dt;
    x += v * dt;
    if (i % 2 === 1) out.push(x);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.02) break;
  }
  out.push(1);
  return out;
}

function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Run a spring-progress animation, mapping each progress sample to a keyframe. */
export function springAnimate(
  el: Element,
  frame: (p: number) => Keyframe,
  opts?: SpringOpts,
) {
  if (reduced() || typeof el.animate !== "function") return;
  const samples = sampleSpring(opts);
  el.animate(samples.map(frame), {
    duration: (samples.length * 1000) / 60,
    easing: "linear",
    fill: "both",
  });
}

/** Card/panel entrance: rises and scales in, overshoots, settles. */
export function springEnter(el: Element, rise = 18) {
  springAnimate(
    el,
    (p) => ({
      transform: `translateY(${((1 - p) * rise).toFixed(2)}px) scale(${(0.92 + 0.08 * p).toFixed(4)})`,
      opacity: String(Math.min(1, Math.max(0, p * 1.6))),
    }),
    { stiffness: 300, damping: 15 },
  );
}

/** Impulse bump (coin chip on earn): jumps to `peak`, wobbles back to rest. */
export function springPop(el: Element, peak = 1.28) {
  springAnimate(
    el,
    (p) => ({ transform: `scale(${(peak + (1 - peak) * p).toFixed(4)})` }),
    { stiffness: 380, damping: 11 },
  );
}
