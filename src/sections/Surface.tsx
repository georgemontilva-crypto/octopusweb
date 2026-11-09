import { useEffect, useRef } from "react";
import { InkLink } from "../components/Transition";
import { Tilt } from "../components/Fx";
import { gsap } from "../lib/motion";

/** Retail displays + the two closing paths (lab results / wholesale). */
export default function Surface() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sf-disp", { y: 120, opacity: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".sf-displays", start: "top 80%" } });
      gsap.from(".sf-tile", { y: 80, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".sf-tiles", start: "top 85%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="sf">
      <header className="wrap li-head">
        <p className="kicker">For retailers</p>
        <h2 className="li-title">On the counter</h2>
      </header>
      <div className="sf-displays wrap">
        <Tilt max={7} className="sf-disp">
          <img src="/img/p/purple-paradise-disp.webp" alt="OCTOPUS Blue Lotus pre-roll 20-pack display" loading="lazy" />
          <span>Pre-Roll · 20-pack display</span>
        </Tilt>
        <Tilt max={7} className="sf-disp">
          <img src="/img/p/lineup-blue.webp" alt="OCTOPUS Blue Lotus dabs 6-flavor display" loading="lazy" />
          <span>Dabs · 6-flavor display</span>
        </Tilt>
      </div>
      <div className="sf-tiles wrap">
        <InkLink href="/contact" className="sf-tile sf-tile-a" cursor="LET'S TALK">
          <span className="kicker">Wholesale</span>
          <b>Carry OCTOPUS</b>
          <i>→</i>
        </InkLink>
        <InkLink href="/lab-reports" className="sf-tile sf-tile-b" cursor="SCAN">
          <span className="kicker">Transparency</span>
          <b>Lab results</b>
          <i>→</i>
        </InkLink>
      </div>
    </section>
  );
}
