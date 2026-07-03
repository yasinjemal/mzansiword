"use client";

import { useEffect, useRef, useState } from "react";

// Living dusk sky (GAME-FEEL.md #5): one fragment shader, raw WebGL, no
// libraries. Slow gradient drift, drifting fbm clouds, sun halo + turning
// god rays, all in the chapter palette. Renders at 0.6× CSS resolution and
// ~30 fps (the sky is soft and slow — nobody can tell), pauses when the tab
// is hidden or when chapter art covers it, and if WebGL is unavailable the
// canvas simply never fades in, leaving the CSS gradient fallback.

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_top;
uniform vec3 u_bot;
uniform vec3 u_acc;
uniform vec3 u_bg;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.3, 7.7);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_t;

  // dusk gradient with a slow breathing drift
  float drift = 0.04 * sin(t * 0.07);
  vec3 col = mix(u_bot, u_top, clamp(uv.y + drift, 0.0, 1.0));

  // drifting clouds, confined to the mid-sky band
  vec2 cp = vec2(uv.x * 2.6 + t * 0.012, uv.y * 5.0 - t * 0.004);
  float cl = fbm(cp);
  float band = smoothstep(0.18, 0.45, uv.y) * (1.0 - smoothstep(0.72, 0.95, uv.y));
  float clouds = smoothstep(0.52, 0.8, cl) * band;
  col = mix(col, mix(col + 0.06, u_acc, 0.22), clouds * 0.4);

  // sun halo + slowly turning god rays (sun sits where the DOM glow lives)
  vec2 sun = vec2(0.5, 0.72);
  vec2 d = uv - sun;
  d.x *= u_res.x / u_res.y;
  float dist = length(d);
  float ang = atan(d.y, d.x);
  float rays = pow(max(sin(ang * 9.0 + t * 0.08), 0.0), 4.0);
  col += u_acc * rays * exp(-3.5 * dist) * 0.09;
  col += u_acc * exp(-8.0 * dist) * 0.22;

  // settle into the page background toward the bottom
  col = mix(u_bg, col, smoothstep(0.0, 0.35, uv.y));

  gl_FragColor = vec4(col, 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const PAGE_BG = hexToRgb("#120f17");
const RES_SCALE = 0.6; // sky is soft — render below CSS resolution
const FRAME_MS = 32; // ~30 fps; cloud drift is far too slow to need 60

export function ShaderSky({
  skyTop,
  skyBottom,
  accent,
  paused = false,
}: {
  skyTop: string;
  skyBottom: string;
  accent: string;
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const pausedRef = useRef(paused);
  const ctrlRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) ctrlRef.current?.stop();
    else ctrlRef.current?.start();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // fallback: CSS gradient stays

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    try {
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(s) ?? "shader compile failed");
        }
        return s;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("program link failed");
      }
    } catch {
      return; // fallback: CSS gradient stays
    }
    gl.useProgram(program);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // one oversized triangle covers the viewport with no seams
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uT = gl.getUniformLocation(program, "u_t");
    gl.uniform3fv(gl.getUniformLocation(program, "u_top"), hexToRgb(skyTop));
    gl.uniform3fv(gl.getUniformLocation(program, "u_bot"), hexToRgb(skyBottom));
    gl.uniform3fv(gl.getUniformLocation(program, "u_acc"), hexToRgb(accent));
    gl.uniform3fv(gl.getUniformLocation(program, "u_bg"), PAGE_BG);

    const resize = () => {
      canvas.width = Math.max(1, Math.round(window.innerWidth * RES_SCALE));
      canvas.height = Math.max(1, Math.round(window.innerHeight * RES_SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    let lost = false;
    let first = true;

    const frame = (now: number) => {
      raf = 0;
      if (now - last >= FRAME_MS) {
        last = now;
        gl.uniform1f(uT, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (first) {
          first = false;
          setReady(true);
          if (reduced) return; // one still frame is plenty
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && !lost && !document.hidden && !pausedRef.current) {
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    ctrlRef.current = { start, stop };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      stop();
      setReady(false); // fallback: CSS gradient shows again
    };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    start();

    return () => {
      stop();
      ctrlRef.current = null;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, [skyTop, skyBottom, accent]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
