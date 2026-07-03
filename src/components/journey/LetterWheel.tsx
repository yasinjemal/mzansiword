"use client";

import { useRef, useState } from "react";
import { fx } from "@/lib/fx";
import { ShuffleIcon } from "../icons";

const SIZE = 272; // px, square
const RADIUS = 100;
const HIT_RADIUS = 32;

interface Point {
  x: number;
  y: number;
}

function positionFor(displayIndex: number, count: number): Point {
  const angle = (-90 + (displayIndex * 360) / count) * (Math.PI / 180);
  return {
    x: SIZE / 2 + RADIUS * Math.cos(angle),
    y: SIZE / 2 + RADIUS * Math.sin(angle),
  };
}

export function LetterWheel({
  wheel,
  order,
  selection,
  tracing,
  disabled,
  onTraceStart,
  onTraceEnter,
  onTraceEnd,
  onTraceCancel,
  onShuffle,
}: {
  wheel: string[];
  order: number[]; // display position -> wheel index
  selection: number[]; // wheel indices in trace order
  tracing: boolean;
  disabled: boolean;
  onTraceStart: (wheelIndex: number) => void;
  onTraceEnter: (wheelIndex: number) => void;
  onTraceEnd: () => void;
  onTraceCancel: () => void;
  onShuffle: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const poppedRef = useRef<Set<number>>(new Set()); // letters already fx-popped this trace
  const [pointer, setPointer] = useState<Point | null>(null);

  const positions = order.map((_, p) => positionFor(p, wheel.length));
  const displayOf = (wheelIndex: number) => order.indexOf(wheelIndex);

  function localPoint(e: React.PointerEvent): Point | null {
    const rect = rectRef.current;
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function hitTest(p: Point): number | null {
    for (let d = 0; d < positions.length; d++) {
      const dx = p.x - positions[d].x;
      const dy = p.y - positions[d].y;
      if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) return order[d];
    }
    return null;
  }

  function popAt(wheelIndex: number) {
    const rect = rectRef.current;
    if (!rect || poppedRef.current.has(wheelIndex)) return;
    poppedRef.current.add(wheelIndex);
    const pos = positions[displayOf(wheelIndex)];
    fx.pop(rect.left + pos.x, rect.top + pos.y);
  }

  function handleDown(e: React.PointerEvent) {
    if (disabled) return;
    rectRef.current = containerRef.current!.getBoundingClientRect();
    const p = localPoint(e);
    if (!p) return;
    const hit = hitTest(p);
    if (hit === null) return;
    containerRef.current!.setPointerCapture(e.pointerId);
    setPointer(p);
    poppedRef.current = new Set();
    popAt(hit);
    onTraceStart(hit);
  }

  function handleMove(e: React.PointerEvent) {
    if (!tracing) return;
    const p = localPoint(e);
    if (!p) return;
    setPointer(p);
    fx.trail(e.clientX, e.clientY);
    const hit = hitTest(p);
    if (hit !== null) {
      if (!selection.includes(hit)) popAt(hit);
      onTraceEnter(hit);
    }
  }

  function handleUp() {
    if (!tracing) return;
    setPointer(null);
    poppedRef.current = new Set();
    onTraceEnd();
  }

  function handleCancel() {
    setPointer(null);
    poppedRef.current = new Set();
    onTraceCancel();
  }

  const tracePoints = selection
    .map((wi) => positions[displayOf(wi)])
    .filter(Boolean);

  const tracePath = [
    ...tracePoints.map((p) => `${p.x},${p.y}`),
    ...(tracing && pointer ? [`${pointer.x},${pointer.y}`] : []),
  ].join(" ");

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <div
        className="absolute inset-3 rounded-full border border-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-sm"
        style={{
          background:
            "radial-gradient(circle at 50% 32%, rgba(255,255,255,0.05) 0%, rgba(27,23,35,0.78) 62%, rgba(20,16,26,0.85) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -18px 40px rgba(0,0,0,0.35), 0 24px 48px -20px rgba(0,0,0,0.7)",
        }}
      />

      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleCancel}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={SIZE}
          height={SIZE}
          aria-hidden
        >
          <defs>
            <linearGradient id="trace-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-bright)" />
              <stop offset="100%" stopColor="var(--gold-deep)" />
            </linearGradient>
          </defs>
          {tracePoints.length > 0 && (
            <>
              {/* soft glow under the golden thread */}
              <polyline
                points={tracePath}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.28"
              />
              <polyline
                points={tracePath}
                fill="none"
                stroke="url(#trace-gold)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            </>
          )}
        </svg>

        {order.map((wheelIndex, d) => {
          const pos = positions[d];
          const active = selection.includes(wheelIndex);
          return (
            <button
              key={wheelIndex}
              type="button"
              tabIndex={-1} // physical keyboard typing is the a11y path
              disabled={disabled}
              className={`wheel-letter ${active ? "wheel-letter-active" : ""}`}
              style={{ left: pos.x, top: pos.y }}
              aria-label={wheel[wheelIndex]}
            >
              {wheel[wheelIndex]}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onShuffle}
          disabled={disabled}
          aria-label="Shuffle letters"
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-foreground"
        >
          <ShuffleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
