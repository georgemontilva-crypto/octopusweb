import { useEffect, useRef } from "react";
import { LINES } from "../data";
import { InkLink } from "../components/Transition";
import { gsap, scrollToEl } from "../lib/motion";

export default function Lines() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".line-card", { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 78%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="lines" id="lines">
      <header className="wrap sec-head">
        <p className="kicker">The OCTOPUS family</p>
        <h2 className="section-title small">Our lines</h2>
      </header>
      <div className="lines-grid wrap">
        {LINES.map((l) => (
          <button key={l.id} className="line-card" onClick={() => scrollToEl("#showroom")} data-cursor="DIVE">
            <div className="line-art"><img src={l.art} alt="" loading="lazy" /></div>
            <img src={l.image} alt={`OCTOPUS ${l.name}`} className="line-img" loading="lazy" />
            <div className="line-body">
              <span className="line-status">Available now</span>
              <h3>{l.name}</h3>
              <p className="line-meta">{l.formats.join(" · ")} · {l.flavors} flavors</p>
            </div>
          </button>
        ))}
        <InkLink href="/contact" className="line-card line-soon" cursor="ASK">
          <div className="line-sonar" aria-hidden><i /><i /><i /></div>
          <div className="line-body">
            <span className="line-status is-soon">Surfacing soon</span>
            <h3>More lines</h3>
            <p className="line-meta">Ask us about the full catalog →</p>
          </div>
        </InkLink>
      </div>
    </section>
  );
}
