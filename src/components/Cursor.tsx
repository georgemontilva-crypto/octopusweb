import { useEffect, useRef } from "react";
import { inkPulse, isTouch } from "../lib/theme";

type Bubble = { x: number; y: number; r: number; vx: number; vy: number; life: number; ink?: boolean; hue?: number };

/** Custom cursor + bubble trail + ink splash on click (fixed full-screen FX layer). */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const fx = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const touch = isTouch();
    const canvas = fx.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts: Bubble[] = [];
    const m = { x: W / 2, y: H / 2, rx: W / 2, ry: H / 2, lx: W / 2, ly: H / 2 };
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      m.x = e.clientX; m.y = e.clientY;
      if (touch) return;
      const sp = Math.hypot(m.x - m.lx, m.y - m.ly);
      if (sp > 6 && parts.length < 140) {
        const n = Math.min(3, Math.floor(sp / 18) + 1);
        for (let i = 0; i < n; i++)
          parts.push({ x: m.x + (Math.random() - 0.5) * 10, y: m.y + (Math.random() - 0.5) * 10, r: 1.5 + Math.random() * 4.5, vx: (Math.random() - 0.5) * 0.4, vy: -0.4 - Math.random() * 0.9, life: 1 });
      }
      m.lx = m.x; m.ly = m.y;
      const el = (e.target as HTMLElement)?.closest?.("a,button,[data-cursor],input,textarea,select,label") as HTMLElement | null;
      const was = hovering;
      hovering = !!el;
      if (ring.current) {
        ring.current.classList.toggle("is-hover", hovering);
        const txt = el?.getAttribute("data-cursor") || "";
        if (label.current && (txt || was !== hovering)) label.current.textContent = txt;
        ring.current.classList.toggle("has-label", !!txt);
      }
    };
    const onDown = (e: PointerEvent) => {
      inkPulse(e.clientX, e.clientY);
      const n = touch ? 14 : 26;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 5;
        parts.push({ x: e.clientX, y: e.clientY, r: 4 + Math.random() * 14, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, ink: true, hue: Math.random() });
      }
      ring.current?.classList.add("is-down");
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };
    const onUp = () => ring.current?.classList.remove("is-down");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let idle = false;
    const loop = () => {
      if (touch && parts.length === 0) {
        ctx.clearRect(0, 0, W, H);
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
      m.rx += (m.x - m.rx) * 0.16;
      m.ry += (m.y - m.ry) * 0.16;
      if (!touch) {
        if (dot.current) dot.current.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        if (ring.current) ring.current.style.transform = `translate3d(${m.rx}px, ${m.ry}px, 0)`;
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.ink) {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.93; p.vy *= 0.93; p.r *= 1.012; p.life -= 0.018;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          const c = p.hue! > 0.5 ? "123, 60, 255" : "255, 43, 179";
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(${c}, ${0.5 * p.life})`);
          g.addColorStop(1, `rgba(${c}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else {
          p.x += p.vx + Math.sin(p.life * 12) * 0.3; p.y += p.vy; p.life -= 0.014;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200, 220, 255, ${0.55 * p.life})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.6 * p.life})`;
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <canvas ref={fx} className="fx-layer" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span ref={label} />
      </div>
    </>
  );
}
