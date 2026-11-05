import { useEffect, useRef } from "react";
import Tentacles from "../components/Tentacles";
import { Chars, Magnetic, Tilt } from "../components/Fx";
import { InkLink } from "../components/Transition";
import { gsap, scrollToEl } from "../lib/motion";
import { useEntered } from "../App";

export default function Hero() {
  const entered = useEntered();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.set(".hero-title .ch", { yPercent: 120, rotate: 8, opacity: 0 });
      gsap.set(".hero-logo-wrap", { scale: 0.4, opacity: 0, y: 80 });
      gsap.set(".hero-fade", { y: 30, opacity: 0 });

      gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 1 },
      })
        .to(".hero-title-l", { xPercent: -45, opacity: 0.1 }, 0)
        .to(".hero-title-r", { xPercent: 45, opacity: 0.1 }, 0)
        .to(".hero-logo-stage", { scale: 1.5, yPercent: 20, opacity: 0, filter: "blur(10px)" }, 0)
        .to(".hero-fade", { y: -60, opacity: 0 }, 0)
        .to(".tentacles", { yPercent: 18 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(".hero-title .ch", { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: "expo.out" })
        .to(".hero-logo-wrap", { scale: 1, opacity: 1, y: 0, duration: 1.6, ease: "elastic.out(1, 0.55)" }, 0.25)
        .to(".hero-fade", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 0.8);
    }, el);
    return () => ctx.revert();
  }, [entered]);

  return (
    <div className="pin-wrap">
    <section ref={root} className="hero" id="top">
      <Tentacles active={entered} />
      <h1 className="hero-title" aria-label="OCTOPUS Blue Lotus">
        <Chars text="BLUE" className="hero-title-l" />
        <Chars text="LOTUS" className="hero-title-r" />
      </h1>
      <div className="hero-logo-stage">
        <div className="hero-logo-wrap">
          <Tilt max={12} className="hero-logo-tilt">
            <div className="hero-halo" />
            <img src="/img/logo.webp" alt="OCTOPUS logo" className="hero-logo" />
          </Tilt>
        </div>
      </div>
      <div className="hero-bottom">
        <p className="hero-sub hero-fade">
          Botanical pre-rolls &amp; dabs, pulled from the abyss.
          <br />
          <b>Six flavors.</b> Zero THC. Pure Blue Lotus.
        </p>
        <div className="hero-ctas hero-fade">
          <Magnetic>
            <button className="btn btn-glow" onClick={() => scrollToEl("#flavors")} data-cursor="DIVE">
              Explore the flavors
            </button>
          </Magnetic>
          <Magnetic>
            <InkLink href="/lab-reports" className="btn btn-ghost">Lab results</InkLink>
          </Magnetic>
        </div>
      </div>
      <div className="hero-chips hero-fade" aria-hidden>
        <span>2G Pre-Roll</span>
        <span>2.5G Dabs</span>
        <span className="chip-21">21+</span>
      </div>
      <button className="scroll-cue hero-fade" onClick={() => scrollToEl("#manifesto")} aria-label="Scroll down">
        <span>DIVE</span>
        <i />
      </button>
    </section>
    </div>
  );
}
