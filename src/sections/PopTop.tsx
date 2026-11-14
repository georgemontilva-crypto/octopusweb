import { useEffect, useMemo, useRef, useState } from "react";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import type { Ctrl } from "../three/stage";

const STEPS = [
  { t: "Pop the top", d: "Child-resistant doob tube, sealed fresh." },
  { t: "Pull it out", d: "A full 2G Blue Lotus pre-roll, hand-rolled." },
  { t: "Ready to roll", d: "2G of Blue Lotus, sealed in its own tube." },
];

/** Sticky (native CSS) scene: the tube opens as you scroll. No scroll hijacking. */
export default function PopTop() {
  const wrap = useRef<HTMLElement>(null);
  const ctrl = useMemo<Ctrl>(() => ({ yaw: 0, pitch: 0.12, zoom: 1, progress: 0 }), []);
  const [step, setStep] = useState(0);
  // one flavor only for this scene
  const f = FLAVORS[0];

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      ctrl.progress = Math.min(1, p / 0.85);
      ctrl.yaw = p * 0.3 - 0.12;
      setStep(p < 0.28 ? 0 : p < 0.72 ? 1 : 2);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [ctrl]);

  return (
    <section ref={wrap} className="pop" style={{ ["--c" as string]: f.color }}>
      <div className="pop-sticky">
        <div className="wrap pop-grid">
          <div className="pop-copy">
            <p className="eyebrow">Pre-Roll · 2G</p>
            <h2 className="mega pop-title" key={step}>{STEPS[step].t}</h2>
            <p className="lead">{STEPS[step].d}</p>
            <ol className="pop-steps" aria-hidden>
              {STEPS.map((x, k) => <li key={x.t} className={k <= step ? "is-on" : ""} />)}
            </ol>
          </div>
        </div>
        <div className="pop-stage-full">
          <div className="pop-glow" />
          <Product3D flavor={f} kind="tube" pop tentacles ctrl={ctrl} live className="pop-p" />
        </div>
      </div>
    </section>
  );
}
