import { useEffect, useRef } from "react";

type Drip = { x: number; y: number; len: number; max: number; w: number; color: string };

/**
 * Octopus ink: hold the mouse (or drag a finger when `armed`) to squirt ink in the flavor color.
 * Big splats, satellite droplets and drips; the ink slowly fades so the wall is always ready again.
 * The loop only runs while something is moving, so an idle wall costs nothing.
 */
export default function InkWall({ color, armed }: { color: string; armed: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  colorRef.current = color;
  const armedRef = useRef(armed);
  armedRef.current = armed;

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    let dpr = 1, raf = 0, running = false, down = false, lastPaint = 0;
    let last: { x: number; y: number } | null = null;
    const drips: Drip[] = [];
    const FADE_MS = 9000;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const wake = () => {
      lastPaint = performance.now();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const blob = (x: number, y: number, r: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = r * (0.82 + Math.random() * 0.36);
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    const splat = (x: number, y: number, speed: number) => {
      const col = colorRef.current;
      const R = (16 + Math.min(speed, 50) * 0.35) * dpr;
      ctx.globalAlpha = 0.92;
      blob(x, y, R, col);
      // glossy ink highlight
      ctx.globalAlpha = 0.18;
      blob(x - R * 0.25, y - R * 0.25, R * 0.35, "#ffffff");
      // satellite droplets
      ctx.globalAlpha = 0.9;
      const n = 6 + Math.floor(Math.random() * 6);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = R * (1.2 + Math.random() * 2.2);
        blob(x + Math.cos(a) * d, y + Math.sin(a) * d, R * (0.08 + Math.random() * 0.22), col);
      }
      if (Math.random() < 0.35 && drips.length < 60) drips.push({ x: x + (Math.random() - 0.5) * R, y: y + R * 0.6, len: 0, max: (40 + Math.random() * 140) * dpr, w: (2 + Math.random() * 4) * dpr, color: col });
      ctx.globalAlpha = 1;
      wake();
    };

    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,.sticker,input,[data-noink]")) return;
      if (e.pointerType !== "mouse" && !armedRef.current) return;
      down = true;
      const p = pos(e);
      last = p;
      splat(p.x, p.y, 10);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const p = pos(e);
      const sp = last ? Math.hypot(p.x - last.x, p.y - last.y) / dpr : 0;
      if (sp > 14 * (touch ? 1.4 : 1)) {
        splat(p.x, p.y, sp);
        last = p;
      }
    };
    const onUp = () => {
      down = false;
      last = null;
    };
    const host = c.parentElement!;
    host.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    function tick(now: number) {
      // drips run down
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i];
        const step = 1.6 * dpr;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x - d.w / 2, d.y + d.len, d.w, step);
        d.len += step;
        if (d.len >= d.max) {
          ctx.beginPath();
          ctx.arc(d.x, d.y + d.len, d.w * 0.9, 0, Math.PI * 2);
          ctx.fill();
          drips.splice(i, 1);
        }
      }
      // ink slowly fades away
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.012)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "source-over";
      if (drips.length || down || now - lastPaint < FADE_MS) raf = requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, c.width, c.height);
        running = false;
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return <canvas ref={ref} className="inkwall" aria-hidden />;
}
