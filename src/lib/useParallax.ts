"use client";

import { useEffect, type RefObject } from "react";

/**
 * Parallax input for 2.5D scenes (GAME-FEEL.md #2). Writes smoothed `--px` /
 * `--py` pixel offsets onto the element from device tilt (Android fires
 * deviceorientation without a permission prompt; iOS needs a gesture-gated
 * prompt we deliberately skip) and pointer position (desktop). Layers consume
 * the vars with `translate3d(calc(var(--px) * -depth), ...)`.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  max = 14,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const step = () => {
      raf = 0;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--px", `${cx.toFixed(2)}px`);
      el.style.setProperty("--py", `${cy.toFixed(2)}px`);
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(step);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const onPointer = (e: PointerEvent) => {
      tx = clamp((e.clientX / window.innerWidth) * 2 - 1) * max;
      ty = clamp((e.clientY / window.innerHeight) * 2 - 1) * max;
      kick();
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = clamp(e.gamma / 28) * max; // left-right tilt
      ty = clamp((e.beta - 42) / 28) * max; // neutral ≈ phone held at ~42°
      kick();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, max]);
}
