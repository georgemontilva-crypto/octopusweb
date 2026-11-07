import { useEffect, useRef } from "react";
import { InkLink } from "../components/Transition";
import { Magnetic, Tilt } from "../components/Fx";
import { gsap } from "../lib/motion";

export function Counter() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ct2-item", { y: 100, opacity: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="ct2">
      <header className="wrap sec-head sec-head-row">
        <div>
          <p className="kicker">For retailers</p>
          <h2 className="section-title small">Built for the counter</h2>
        </div>
        <Magnetic><InkLink href="/contact" className="btn btn-glow" cursor="LET'S TALK">Become a retailer</InkLink></Magnetic>
      </header>
      <div className="ct2-grid wrap">
        <Tilt max={7} className="ct2-item">
          <img src="/img/p/purple-paradise-disp.webp" alt="OCTOPUS Blue Lotus pre-roll 20-pack display" loading="lazy" />
          <span>Pre-Roll · 20-pack display</span>
        </Tilt>
        <Tilt max={7} className="ct2-item">
          <img src="/img/p/lineup-blue.webp" alt="OCTOPUS Blue Lotus dabs 6-flavor display" loading="lazy" />
          <span>Dabs · 6-flavor display</span>
        </Tilt>
      </div>
    </section>
  );
}

const FACTS = ["No THC", "No Hemp", "No Delta", "Lab tested"];

export function LabStrip() {
  return (
    <section className="lab2">
      <div className="wrap lab2-inner">
        <div>
          <p className="kicker">Blue Lotus line</p>
          <ul className="lab2-facts">
            {FACTS.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <InkLink href="/lab-reports" className="btn btn-ghost" cursor="SCAN">Lab results →</InkLink>
      </div>
    </section>
  );
}
