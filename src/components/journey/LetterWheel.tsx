"use client";

import { useRef, useState } from "react";
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

  function handleDown(e: React.PointerEvent) {
    if (disabled) return;
    rectRef.current = containerRef.current!.getBoundingClientRect();
    const p = localPoint(e);
    if (!p) return;
    const hit = hitTest(p);
    if (hit === null) return;
    containerRef.current!.setPointerCapture(e.pointerId);
    setPointer(p);
    onTraceStart(hit);
  }

  function handleMove(e: React.PointerEvent) {
    if (!tracing) return;
    const p = localPoint(e);
    if (!p) return;
    setPointer(p);
    const hit = hitTest(p);
    if (hit !== null) onTraceEnter(hit);
  }

  function handleUp() {
    if (!tracing) return;
    setPointer(null);
    onTraceEnd();
  }

  function handleCancel() {
    setPointer(null);
    onTraceCancel();
  }

  const tracePoints = selection
    .map((wi) => positions[displayOf(wi)])
    .filter(Boolean);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <div className="absolute inset-3 rounded-full bg-surface/70 shadow-2xl shadow-black/40 backdrop-blur-sm" />

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
          {tracePoints.length > 0 && (
            <polyline
              points={[
                ...tracePoints.map((p) => `${p.x},${p.y}`),
                ...(tracing && pointer ? [`${pointer.x},${pointer.y}`] : []),
              ].join(" ")}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
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
