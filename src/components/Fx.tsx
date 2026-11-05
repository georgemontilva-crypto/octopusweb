import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { gsap, scrollState } from "../lib/motion";
import { isTouch } from "../lib/theme";

/** 3D tilt that follows the pointer (and gently auto-sways on touch). Also drives --mx/--my for holo shine. */
export function Tilt({ children, className = "", max = 14, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const touch = isTouch();
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0, inside = false;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      inside = px > -0.25 && px < 1.25 && py > -0.25 && py < 1.25;
      if (!inside) return;
      ty = (px - 0.5) * max * 2;
      tx = -(py - 0.5) * max * 2;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (touch || !inside) {
        ty = Math.sin(now / 1400) * max * 0.6;
        tx = Math.cos(now / 1700) * max * 0.3;
      }
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [max]);
  return (
    <div ref={ref} className={"tilt " + className} style={style}>
      {children}
    </div>
  );
}

/** Button/link wrapper that magnetically follows the cursor. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (isTouch()) return;
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      if (Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [strength]);
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}

/** Infinite marquee whose speed reacts to scroll velocity. */
export function Marquee({ items, reverse = false, className = "" }: { items: string[]; reverse?: boolean; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!;
    let x = 0;
    let dir = reverse ? 1 : -1;
    const tick = () => {
      const half = el.scrollWidth / 2;
      const v = scrollState.velocity;
      if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
      x += dir * (0.6 + Math.min(Math.abs(v) * 0.35, 14));
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reverse]);
  const row = [...items, ...items];
  return (
    <div className={"marquee " + className}>
      <div ref={track} className="marquee-track">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="marquee-item">
            {t}
            <svg viewBox="0 0 24 24" className="marquee-star" aria-hidden>
              <path d="M12 0c1 6 6 11 12 12-6 1-11 6-12 12-1-6-6-11-12-12 6-1 11-6 12-12z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Split a string into animated chars. */
export function Chars({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((c, i) => (
        <span key={i} className="ch" aria-hidden style={{ ["--i" as string]: i }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
