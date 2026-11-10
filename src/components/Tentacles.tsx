import { useEffect, useRef } from "react";
import { isTouch, reducedMotion } from "../lib/theme";
import { isScrolling } from "../lib/motion";

type V = { x: number; y: number };

type Spec = { bx: number; by: number; ang: number; reach: number; width: number; phase: number };

const DESKTOP: Spec[] = [
  { bx: -0.05, by: 1.06, ang: -50, reach: 0.34, width: 0.6, phase: 0 },
  { bx: 1.05, by: 1.06, ang: -130, reach: 0.34, width: 0.6, phase: 1.7 },
  { bx: -0.06, by: 0.5, ang: 8, reach: 0.22, width: 0.45, phase: 3.1 },
  { bx: 1.06, by: 0.44, ang: 172, reach: 0.22, width: 0.45, phase: 4.4 },
];
const MOBILE: Spec[] = [
  { bx: -0.08, by: 1.04, ang: -60, reach: 0.4, width: 0.55, phase: 0 },
  { bx: 1.08, by: 1.04, ang: -120, reach: 0.4, width: 0.55, phase: 1.7 },
];

const SEGS = 28;

class Tentacle {
  pts: V[] = [];
  tip: V;
  len = 0;
  w = 0;
  base: V = { x: 0, y: 0 };
  dir = 0;
  reachPx = 0;
  recoil = 0;
  constructor(public s: Spec) {
    this.tip = { x: 0, y: 0 };
  }
  layout(W: number, H: number) {
    const m = Math.min(W, H);
    this.base = { x: this.s.bx * W, y: this.s.by * H };
    this.dir = (this.s.ang * Math.PI) / 180;
    this.reachPx = this.s.reach * Math.max(m, Math.min(W, 900) * 0.9);
    this.len = this.reachPx / SEGS;
    this.w = Math.max(20, m * 0.062) * this.s.width;
    this.pts = Array.from({ length: SEGS }, (_, i) => ({
      x: this.base.x + Math.cos(this.dir) * this.len * i,
      y: this.base.y + Math.sin(this.dir) * this.len * i,
    }));
    this.tip = { ...this.pts[SEGS - 1] };
  }
  update(t: number, _mouse: V | null, grow: number) {
    const { base, dir, reachPx, s } = this;
    const reach = reachPx * grow;
    // idle target: curling sway
    const sway = Math.sin(t * 0.35 + s.phase) * 0.22 + Math.sin(t * 0.17 + s.phase * 2) * 0.1;
    const a = dir + sway;
    const idleR = reach * (0.72 + 0.12 * Math.sin(t * 0.9 + s.phase));
    let tx = base.x + Math.cos(a) * idleR;
    let ty = base.y + Math.sin(a) * idleR;
    if (this.recoil > 0) {
      const r = this.recoil;
      tx = tx + (base.x + Math.cos(dir) * reach * 0.3 - tx) * r;
      ty = ty + (base.y + Math.sin(dir) * reach * 0.3 - ty) * r;
      this.recoil = Math.max(0, r - 0.025);
    }
    this.tip.x += (tx - this.tip.x) * 0.07;
    this.tip.y += (ty - this.tip.y) * 0.07;

    const L = this.len * grow;
    const p = this.pts;
    // FABRIK backward
    p[SEGS - 1].x = this.tip.x;
    p[SEGS - 1].y = this.tip.y;
    for (let i = SEGS - 2; i >= 0; i--) {
      const dx = p[i].x - p[i + 1].x, dy = p[i].y - p[i + 1].y;
      const d = Math.hypot(dx, dy) || 1;
      p[i].x = p[i + 1].x + (dx / d) * L;
      p[i].y = p[i + 1].y + (dy / d) * L;
    }
    // forward (anchor base, bias first segments toward base direction for a natural root)
    p[0].x = base.x;
    p[0].y = base.y;
    for (let i = 1; i < SEGS; i++) {
      let dx = p[i].x - p[i - 1].x, dy = p[i].y - p[i - 1].y;
      if (i < 5) {
        const bias = (5 - i) * 0.12;
        dx += Math.cos(dir) * L * bias;
        dy += Math.sin(dir) * L * bias;
      }
      const d = Math.hypot(dx, dy) || 1;
      p[i].x = p[i - 1].x + (dx / d) * L;
      p[i].y = p[i - 1].y + (dy / d) * L;
    }
  }
  draw(ctx: CanvasRenderingContext2D, t: number, glow: boolean) {
    const p = this.pts;
    const n = SEGS;
    // display points with travelling wave perpendicular to the spine
    const dp: V[] = [];
    const nm: V[] = [];
    const ws: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
      let tx = b.x - a.x, ty = b.y - a.y;
      const d = Math.hypot(tx, ty) || 1;
      tx /= d; ty /= d;
      const nx = -ty, ny = tx;
      const f = i / (n - 1);
      const wave = Math.sin(f * 7 - t * 2.4 + this.s.phase) * 9 * f * f;
      dp.push({ x: p[i].x + nx * wave, y: p[i].y + ny * wave });
      nm.push({ x: nx, y: ny });
      ws.push(this.w * Math.pow(1 - f, 0.85) + 1.2);
    }
    const left: V[] = [], right: V[] = [];
    for (let i = 0; i < n; i++) {
      left.push({ x: dp[i].x + nm[i].x * ws[i], y: dp[i].y + nm[i].y * ws[i] });
      right.push({ x: dp[i].x - nm[i].x * ws[i], y: dp[i].y - nm[i].y * ws[i] });
    }
    const path = new Path2D();
    path.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < n - 1; i++) {
      const mx = (left[i].x + left[i + 1].x) / 2, my = (left[i].y + left[i + 1].y) / 2;
      path.quadraticCurveTo(left[i].x, left[i].y, mx, my);
    }
    const tipEnd = dp[n - 1];
    path.quadraticCurveTo(left[n - 1].x, left[n - 1].y, tipEnd.x + (tipEnd.x - dp[n - 2].x) * 0.6, tipEnd.y + (tipEnd.y - dp[n - 2].y) * 0.6);
    path.quadraticCurveTo(right[n - 1].x, right[n - 1].y, right[n - 2].x, right[n - 2].y);
    for (let i = n - 2; i > 0; i--) {
      const mx = (right[i].x + right[i - 1].x) / 2, my = (right[i].y + right[i - 1].y) / 2;
      path.quadraticCurveTo(right[i].x, right[i].y, mx, my);
    }
    path.lineTo(right[0].x, right[0].y);
    path.closePath();

    const g = ctx.createLinearGradient(dp[0].x, dp[0].y, tipEnd.x, tipEnd.y);
    g.addColorStop(0, "#2a1478");
    g.addColorStop(0.45, "#5a3bd6");
    g.addColorStop(1, "#9a7cff");

    ctx.save();
    if (glow) {
      ctx.shadowColor = "rgba(255, 43, 179, 0.55)";
      ctx.shadowBlur = 28;
    }
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.restore();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#0b0220";
    ctx.lineJoin = "round";
    ctx.stroke(path);

    // glossy highlight
    ctx.beginPath();
    for (let i = 1; i < n - 2; i++) {
      const x = dp[i].x + nm[i].x * ws[i] * 0.45, y = dp[i].y + nm[i].y * ws[i] * 0.45;
      if (i === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(235, 225, 255, 0.45)";
    ctx.lineWidth = Math.max(1.5, this.w * 0.12);
    ctx.lineCap = "round";
    ctx.stroke();

    // suckers on the underside
    for (let i = 3; i < n - 3; i += 2) {
      const r = ws[i] * 0.34;
      if (r < 1.6) continue;
      const x = dp[i].x - nm[i].x * ws[i] * 0.6, y = dp[i].y - nm[i].y * ws[i] * 0.6;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.82, Math.atan2(nm[i].y, nm[i].x), 0, Math.PI * 2);
      ctx.fillStyle = "#ff8fd9";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0b0220";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = "#b02a8f";
      ctx.fill();
    }
  }
}

export default function Tentacles({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const touch = isTouch();
    const specs = touch || window.innerWidth < 760 ? MOBILE : DESKTOP;
    const ts = specs.map((s) => new Tentacle(s));
    let W = 0, H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ts.forEach((t) => t.layout(W, H));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let mouse: V | null = null;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (mouse = null);
    const onDown = () => {};
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    let grow = 0;
    let started = 0;
    const slow = reducedMotion();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (touch && isScrolling()) return;
      if (activeRef.current) {
        if (!started) started = now;
        grow = Math.min(1, (now - started) / 1800);
      }
      const e = 1 - Math.pow(1 - grow, 3);
      const t = (now / 1000) * (slow ? 0.25 : 1);
      ctx.clearRect(0, 0, W, H);
      if (e <= 0.001) return;
      for (const tn of ts) {
        tn.update(t, mouse, e);
        tn.draw(ctx, t, false);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="tentacles" aria-hidden />;
}
