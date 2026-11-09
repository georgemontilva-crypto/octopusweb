import { useEffect, useRef } from "react";
import Tentacles from "../components/Tentacles";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import { gsap, scrollToEl } from "../lib/motion";
import { resetTint } from "../lib/theme";
import { useEntered } from "../App";

const HERO = FLAVORS[0]; // Blue Dreamz — the signature

export default function Dive() {
  const entered = useEntered();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.set(".dv-ch", { yPercent: 115 });
      gsap.set(".dv-fade", { opacity: 0, y: 24 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } })
        .to(".dv-l2", { scale: 1.25, opacity: 0, ease: "none" }, 0)
        .to(".dv-l1", { yPercent: -120, opacity: 0, ease: "none" }, 0)
        .to(".dv-p", { yPercent: 35, ease: "none" }, 0)
        .to(".dv-bottom", { opacity: 0, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    resetTint();
    const ctx = gsap.context(() => {
      gsap.to(".dv-ch", { yPercent: 0, stagger: 0.05, duration: 1.3, ease: "expo.out", delay: 0.1 });
      gsap.to(".dv-fade", { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: "power3.out", delay: 0.7 });
    }, root.current!);
    return () => ctx.revert();
  }, [entered]);

  const chars = (t: string) => t.split("").map((c, k) => <span className="dv-ch" key={k}>{c === " " ? " " : c}</span>);

  return (
    <div className="pin-wrap">
      <section ref={root} className="dv" id="top">
        <Tentacles active={entered} />
        <h1 className="dv-title" aria-label="Into the deep — OCTOPUS">
          <span className="dv-l1">{chars("INTO THE")}</span>
          <span className="dv-l2">{chars("DEEP")}</span>
        </h1>
        {entered && <Product3D flavor={HERO} kind="tube" className="dv-p" fill={0.97} sway={0.55} />}
        <div className="dv-bottom wrap">
          <p className="dv-tag dv-fade">
            Bold botanical blends
            <br />
            by <b>OCTOPUS</b>
          </p>
          <button className="dv-scroll dv-fade" onClick={() => scrollToEl("#currents")} data-cursor="DIVE">
            <span>Scroll to dive</span>
            <i />
          </button>
        </div>
      </section>
    </div>
  );
}
