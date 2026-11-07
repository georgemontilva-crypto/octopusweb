import { useEffect, useRef, useState } from "react";
import Tentacles from "../components/Tentacles";
import { Magnetic } from "../components/Fx";
import { InkLink } from "../components/Transition";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import { gsap, scrollToEl } from "../lib/motion";
import { setTint } from "../lib/theme";
import { useEntered } from "../App";

// hero cycles through the flavors that have both 3D formats
const HERO = FLAVORS.filter((f) => f.tex.front);

export default function Hero() {
  const entered = useEntered();
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const f = HERO[i];

  useEffect(() => {
    if (!entered) return;
    setTint(f.color, f.color2);
  }, [f, entered]);

  useEffect(() => {
    if (!entered || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 5200);
    return () => clearInterval(t);
  }, [entered, paused]);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.set(".hx-logo", { scale: 0.6, opacity: 0, y: 40 });
      gsap.set(".hx-fade", { y: 30, opacity: 0 });
      gsap.to(".hx-inner", { yPercent: 12, opacity: 0.2, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    const ctx = gsap.context(() => {
      gsap.to(".hx-logo", { scale: 1, opacity: 1, y: 0, duration: 1.4, ease: "elastic.out(1, 0.6)", delay: 0.1 });
      gsap.to(".hx-fade", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.5 });
    }, root.current!);
    return () => ctx.revert();
  }, [entered]);

  return (
    <div className="pin-wrap">
      <section ref={root} className="hx" id="top">
        <Tentacles active={entered} />
        <div className="hx-inner wrap">
          <div className="hx-brand">
            <img src="/img/logo.webp" alt="OCTOPUS" className="hx-logo" />
            <p className="hx-line hx-fade">
              Bold botanical blends.
              <br />
              <span>From the deep.</span>
            </p>
            <div className="hx-ctas hx-fade">
              <Magnetic>
                <button className="btn btn-glow" onClick={() => scrollToEl("#showroom")} data-cursor="DIVE">
                  See the products
                </button>
              </Magnetic>
              <Magnetic>
                <InkLink href="/lab-reports" className="btn btn-ghost">Lab results</InkLink>
              </Magnetic>
            </div>
          </div>
          <div className="hx-stage hx-fade" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
            <div className="hx-halo" style={{ background: `radial-gradient(circle, ${f.color}55, transparent 62%)` }} />
            {entered && (
              <>
                <Product3D key={"b" + f.slug} flavor={f} kind="box" className="hx-box" fill={0.86} phase={1.3} />
                <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="hx-tube" fill={0.9} />
              </>
            )}
          </div>
          <div className="hx-caption hx-fade">
              <span style={{ color: f.color }}>{f.name}</span>
              <div className="hx-dots" role="tablist" aria-label="Flavor">
                {HERO.map((x, k) => (
                  <button key={x.slug} role="tab" aria-selected={k === i} aria-label={x.name} className={k === i ? "is-on" : ""} style={{ ["--s" as string]: x.color }} onClick={() => setI(k)} />
                ))}
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
