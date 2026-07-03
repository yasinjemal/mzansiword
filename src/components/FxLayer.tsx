"use client";

import { useEffect, useRef } from "react";
import { attachFx } from "@/lib/fx";

/**
 * Full-viewport particle canvas (GAME-FEEL.md #1). Sits above page content,
 * below the film grain (z-90). Purely decorative: never intercepts input.
 */
export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return attachFx(ref.current);
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden
    />
  );
}
