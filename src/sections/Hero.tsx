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
  const word = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const f = HERO[i];

  useEffect(() => {
    if (!entered) return;
    setTint(f.color, f.color2);
    // giant flavor name: letters rise in on every change
    const chars = word.current?.querySelectorAll(".hw-ch");
    if (chars?.length) gsap.fromTo(chars, { yPercent: 110, rotate: 6, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, stagger: 0.035, duration: 1, ease: "expo.out" });
  }, [f, entered]);

  useEffect(() => {
    if (!entered || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 5200);
    return () => clearInterval(t);
  }, [entered, paused]);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.set(".hx-fade", { y: 30, opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } })
        .to(".hx-word", { yPercent: -30, scale: 1.15, opacity: 0, ease: "none" }, 0)
        .to(".hx-stage", { yPercent: 14, ease: "none" }, 0)
        .to(".hx-bottom", { opacity: 0, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    const ctx = gsap.context(() => {
      gsap.to(".hx-fade", { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.35 });
    }, root.current!);
    return () => ctx.revert();
  }, [entered]);

  const lines = f.name.toUpperCase().split(" ");

  return (
    <div className="pin-wrap">
      <section ref={root} className="hx" id="top" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
        <Tentacles active={entered} />
        <div ref={word} className="hx-word" aria-hidden key={f.slug}>
          {lines.map((l, k) => (
            <span className="hw-line" key={k}>
              {l.split("").map((c, j) => <span className="hw-ch" key={j}>{c}</span>)}
            </span>
          ))}
        </div>
        <div className="hx-stage hx-fade" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <div className="hx-halo" />
          {entered && (
            <>
              <Product3D key={"b" + f.slug} flavor={f} kind="box" className="hx-box" fill={0.92} phase={1.3} />
              <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="hx-tube" fill={0.94} />
            </>
          )}
        </div>
        <div className="hx-bottom wrap">
          <p className="hx-line hx-fade">
            Bold botanical blends.<br />
            <span>From the deep.</span>
          </p>
          <div className="hx-picker hx-fade">
            <span className="hx-name">{f.name}</span>
            <div className="hx-dots" role="tablist" aria-label="Flavor">
              {HERO.map((x, k) => (
                <button key={x.slug} role="tab" aria-selected={k === i} aria-label={x.name} className={k === i ? "is-on" : ""} style={{ ["--s" as string]: x.color }} onClick={() => setI(k)} />
              ))}
            </div>
          </div>
          <div className="hx-ctas hx-fade">
            <Magnetic>
              <button className="btn btn-glow" onClick={() => scrollToEl("#showroom")} data-cursor="DIVE">See the products</button>
            </Magnetic>
            <Magnetic>
              <InkLink href="/lab-reports" className="btn btn-ghost">Lab results</InkLink>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
