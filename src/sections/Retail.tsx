import { useEffect, useRef } from "react";
import { InkLink } from "../components/Transition";
import { gsap } from "../lib/motion";
import { srcSet } from "../lib/img";

export default function Retail() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".rt-card, .rt-tile", { y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="rt">
      <header className="wrap rt-head">
        <p className="kicker">For retailers</p>
        <h2 className="h2">Made for the counter</h2>
      </header>
      <div className="rt-grid wrap">
        <figure className="rt-card">
          <img src="/img/p/purple-paradise-disp.webp" srcSet={srcSet("/img/p/purple-paradise-disp.webp")} sizes="(max-width: 760px) 90vw, 45vw" alt="OCTOPUS Blue Lotus pre-roll 20-pack display" loading="lazy" />
          <figcaption>Pre-Roll · 20-pack display</figcaption>
        </figure>
        <figure className="rt-card">
          <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 760px) 90vw, 45vw" alt="OCTOPUS Blue Lotus dabs 6-flavor display" loading="lazy" />
          <figcaption>Dabs · 6-flavor display</figcaption>
        </figure>
      </div>
      <div className="rt-tiles wrap">
        <InkLink href="/contact" className="rt-tile rt-tile-a" cursor="LET'S TALK">
          <span>Wholesale</span>
          <b>Carry OCTOPUS →</b>
        </InkLink>
        <InkLink href="/lab-reports" className="rt-tile" cursor="SCAN">
          <span>Transparency</span>
          <b>Lab results →</b>
        </InkLink>
      </div>
    </section>
  );
}
