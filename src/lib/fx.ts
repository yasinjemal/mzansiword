// Zero-dependency canvas particle engine for game feel (GAME-FEEL.md #1).
// Additive blending + pre-rendered sprites give the glowy "engine" look at
// canvas-2D cost. The fx.* emitters are the stable API boundary: if we ever
// need shaders or >1k live particles, swap this engine for PixiJS behind the
// same calls. Everything here is decorative — it must never affect gameplay.

interface Vec {
  x: number;
  y: number;
}

interface SparkP {
  kind: "spark";
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
}

interface CoinP {
  kind: "coin";
  life: number;
  max: number;
  size: number;
  turns: number;
  // quadratic bezier: start -> control -> target
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
}

interface RingP {
  kind: "ring";
  x: number;
  y: number;
  life: number;
  max: number;
  radius: number;
  color: string;
}

type Particle = SparkP | CoinP | RingP;

const MAX_PARTICLES = 400; // hard cap; oldest are dropped first

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let parts: Particle[] = [];
let raf = 0;
let last = 0;
let lastTrail: Vec | null = null;

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ------------------------------------------------ sprite cache */

const sprites = new Map<string, HTMLCanvasElement>();

/** Soft glow dot: white-hot core fading through `color` to transparent. */
function glowSprite(color: string): HTMLCanvasElement {
  const key = `glow:${color}`;
  const hit = sprites.get(key);
  if (hit) return hit;
  const s = document.createElement("canvas");
  s.width = s.height = 32;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.35, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  sprites.set(key, s);
  return s;
}

function coinSprite(): HTMLCanvasElement {
  const hit = sprites.get("coin");
  if (hit) return hit;
  const s = document.createElement("canvas");
  s.width = s.height = 32;
  const c = s.getContext("2d")!;
  const g = c.createLinearGradient(0, 4, 0, 28);
  g.addColorStop(0, "#ffd45c");
  g.addColorStop(1, "#dd9500");
  c.fillStyle = g;
  c.beginPath();
  c.arc(16, 16, 13, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(120,74,0,0.9)";
  c.lineWidth = 2;
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.55)";
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(16, 16, 8.5, 0, Math.PI * 2);
  c.stroke();
  sprites.set("coin", s);
  return s;
}

/* ------------------------------------------------ engine loop */

function push(p: Particle) {
  if (parts.length >= MAX_PARTICLES) parts.splice(0, parts.length - MAX_PARTICLES + 1);
  parts.push(p);
  if (!raf && ctx) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function tick(now: number) {
  raf = 0;
  if (!ctx || !canvas) return;
  const dt = Math.min((now - last) / 1000, 0.04);
  last = now;

  const w = canvas.width;
  const h = canvas.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.restore();

  const alive: Particle[] = [];
  for (const p of parts) {
    p.life -= dt;
    if (p.life <= 0) continue;
    const t = 1 - p.life / p.max; // 0 -> 1 over lifetime

    if (p.kind === "spark") {
      p.vy += p.gravity * dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy *= 1 - 0.4 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const alpha = 1 - t * t;
      const size = p.size * (1 - t * 0.4);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.drawImage(glowSprite(p.color), p.x - size, p.y - size, size * 2, size * 2);
    } else if (p.kind === "coin") {
      const e = t * t * (3 - 2 * t); // smoothstep
      const inv = 1 - e;
      const x = inv * inv * p.sx + 2 * inv * e * p.cx + e * e * p.tx;
      const y = inv * inv * p.sy + 2 * inv * e * p.cy + e * e * p.ty;
      const flip = Math.cos(t * Math.PI * 2 * p.turns); // fake 3D spin
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = t > 0.85 ? (1 - t) / 0.15 : 1; // fade into the chip
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(Math.max(Math.abs(flip), 0.12), 1);
      ctx.drawImage(coinSprite(), -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    } else {
      const e = 1 - (1 - t) * (1 - t); // ease-out
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3.5 * (1 - t) + 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * e, 0, Math.PI * 2);
      ctx.stroke();
    }
    alive.push(p);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  parts = alive;
  if (parts.length > 0) raf = requestAnimationFrame(tick);
}

/* ------------------------------------------------ mount (FxLayer) */

export function attachFx(el: HTMLCanvasElement): () => void {
  canvas = el;
  ctx = el.getContext("2d");
  const resize = () => {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  return () => {
    window.removeEventListener("resize", resize);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    parts = [];
    canvas = null;
    ctx = null;
  };
}

/* ------------------------------------------------ position helpers */

export function rectCenter(el: Element | null): Vec | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Center of the visible coin wallet chip (CoinsChip sets data-fx="coins"). */
export function coinsTarget(): Vec | null {
  return rectCenter(document.querySelector('[data-fx="coins"]'));
}

/* ------------------------------------------------ emitters */

const GOLD = "rgba(255,182,18,0.9)";

export const fx = {
  /** Radial burst of glowing sparks (word found, celebrations). */
  sparkleBurst(
    x: number,
    y: number,
    opts: { count?: number; color?: string; speed?: number } = {},
  ) {
    if (reducedMotion() || !ctx) return;
    const { count = 20, color = GOLD, speed = 240 } = opts;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.65);
      const life = 0.45 + Math.random() * 0.45;
      push({
        kind: "spark",
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        life,
        max: life,
        size: 3 + Math.random() * 4,
        color,
        gravity: 300,
      });
    }
  },

  /** Tiny pop when the trace catches a wheel letter. */
  pop(x: number, y: number, color: string = GOLD) {
    if (reducedMotion() || !ctx) return;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 90 + Math.random() * 70;
      const life = 0.3 + Math.random() * 0.2;
      push({
        kind: "spark",
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life,
        max: life,
        size: 2.5 + Math.random() * 2,
        color,
        gravity: 120,
      });
    }
  },

  /** Sparkle trail following the finger while tracing (distance-throttled). */
  trail(x: number, y: number, color: string = GOLD) {
    if (reducedMotion() || !ctx) return;
    if (lastTrail) {
      const dx = x - lastTrail.x;
      const dy = y - lastTrail.y;
      if (dx * dx + dy * dy < 144) return; // every ~12px
    }
    lastTrail = { x, y };
    const life = 0.35 + Math.random() * 0.15;
    push({
      kind: "spark",
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40 - 20,
      life,
      max: life,
      size: 2 + Math.random() * 2.5,
      color,
      gravity: 60,
    });
  },

  /** Coins arc physically from a point into the wallet chip. */
  coinBurstTo(x: number, y: number, target: Vec, count = 7) {
    if (reducedMotion() || !ctx) return;
    for (let i = 0; i < count; i++) {
      const sx = x + (Math.random() - 0.5) * 36;
      const sy = y + (Math.random() - 0.5) * 20;
      const life = 0.55 + i * 0.06 + Math.random() * 0.1;
      push({
        kind: "coin",
        life,
        max: life,
        size: 15 + Math.random() * 6,
        turns: 1.5 + Math.random(),
        sx,
        sy,
        cx: (sx + target.x) / 2 + (Math.random() - 0.5) * 120,
        cy: Math.min(sy, target.y) - 60 - Math.random() * 50,
        tx: target.x,
        ty: target.y,
      });
    }
  },

  /** Expanding ring for level/chapter completion. */
  shockwave(x: number, y: number, color: string = GOLD, radius = 110) {
    if (reducedMotion() || !ctx) return;
    push({ kind: "ring", x, y, life: 0.6, max: 0.6, radius, color });
  },
};
