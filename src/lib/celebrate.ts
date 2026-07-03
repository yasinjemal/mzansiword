// Client-side celebration helpers shared by game modes.

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

export async function fireConfetti(big = false) {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  // Highveld Dusk palette (globals.css): brand greens, SA gold, terracotta.
  const colors = ["#2bd684", "#ffb612", "#ffd45c", "#f7f3ea", "#e2725b"];
  confetti({
    particleCount: big ? 130 : 80,
    spread: big ? 90 : 75,
    origin: { y: 0.55 },
    colors,
  });
  setTimeout(
    () =>
      confetti({
        particleCount: big ? 80 : 50,
        spread: 100,
        scalar: 0.8,
        origin: { y: 0.4 },
        colors,
      }),
    250,
  );
}
