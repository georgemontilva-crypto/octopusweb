import { useEffect, useRef, useState } from "react";
import { gsap, lockScroll } from "../lib/motion";
import { inkPulse, storage } from "../lib/theme";
import { FLAVORS } from "../data";

const PRELOAD = ["/img/logo.webp", ...FLAVORS.flatMap((f) => [f.tex.tube, f.tex.front, f.tex.side]).filter((x): x is string => !!x)];
const KEY = "octopus_21_ok";

export default function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"load" | "gate" | "denied">("load");
  const verified = useRef(storage.get(KEY) === "1");

  useEffect(() => {
    lockScroll(true);
    let done = 0;
    let shown = 0;
    let cancelled = false;
    const bump = () => {
      done++;
    };
    PRELOAD.forEach((src) => {
      const i = new Image();
      i.onload = i.onerror = bump;
      i.src = src;
    });
    const start = performance.now();
    let last = start;
    const tick = () => {
      if (cancelled) return;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      const real = done / PRELOAD.length;
      const minT = Math.min(1, (now - start) / 1400);
      const target = Math.min(real, minT);
      shown += (target - shown) * Math.min(1, dt * 8);
      if (target >= 1 && shown > 0.985) shown = 1;
      setPct(Math.round(shown * 100));
      if (shown >= 1) {
        if (verified.current) exit();
        else setPhase("gate");
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // hard fallback (slow networks)
    const t = setTimeout(() => (done = PRELOAD.length), 6000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "gate" || !root.current) return;
    gsap.fromTo(root.current.querySelectorAll(".gate-anim"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out" });
  }, [phase]);

  const exit = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const el = root.current;
    if (!el) return;
    inkPulse(x, y);
    const tl = gsap.timeline({
      onComplete: () => {
        lockScroll(false);
        onDone();
      },
    });
    tl.to(el.querySelector(".intro-logo"), { scale: 1.25, opacity: 0, duration: 0.6, ease: "power2.in" })
      .to(el, { clipPath: `circle(0% at ${x}px ${y}px)`, duration: 1.05, ease: "expo.inOut" }, "-=0.35");
  };

  const yes = (e: React.MouseEvent) => {
    storage.set(KEY, "1");
    exit(e.clientX, e.clientY);
  };

  return (
    <div ref={root} className="intro" style={{ clipPath: "circle(150% at 50% 50%)" }}>
      <div className="intro-ink" />
      <div className="intro-center">
        <div className="intro-logo-wrap">
          <img src="/img/logo.webp" alt="OCTOPUS" className="intro-logo" />
        </div>
        {phase === "load" && (
          <div className="intro-load">
            <div className="intro-bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
            <span className="intro-pct">DESCENDING · {String(pct).padStart(3, "0")}%</span>
          </div>
        )}
        {phase === "gate" && (
          <div className="gate">
            <p className="gate-kicker gate-anim">Botanical products · Adults only</p>
            <h2 className="gate-title gate-anim">
              Are you <span className="drip">21+</span>?
            </h2>
            <p className="gate-text gate-anim">You must be of legal age to enter the abyss.</p>
            <div className="gate-actions gate-anim">
              <button className="btn btn-glow" onClick={yes} data-cursor="ENTER">
                Yes, let me in
              </button>
              <button className="btn btn-ghost" onClick={() => setPhase("denied")}>
                No
              </button>
            </div>
          </div>
        )}
        {phase === "denied" && (
          <div className="gate">
            <h2 className="gate-title">Come back when you're 21.</h2>
            <p className="gate-text">The deep will still be here.</p>
            <button className="btn btn-ghost" onClick={() => setPhase("gate")}>Go back</button>
          </div>
        )}
      </div>
    </div>
  );
}
