import { useEffect, useRef } from "react";
import { LINES } from "../data";
import { InkLink } from "../components/Transition";
import { Tilt } from "../components/Fx";
import { gsap, scrollToEl } from "../lib/motion";

export default function Lines() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".lines-title .ln", { yPercent: 110, stagger: 0.1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
      gsap.from(".line-card", { y: 100, opacity: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".lines-grid", start: "top 85%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="lines" id="lines">
      <p className="kicker">The OCTOPUS family</p>
      <h2 className="lines-title section-title">
        <span className="ln-mask"><span className="ln">Our</span></span>
        <span className="ln-mask"><span className="ln outline">lines</span></span>
      </h2>
      <p className="section-lead">OCTOPUS is a growing family of botanical product lines. Each one has its own look, its own flavors and its own corner of the deep.</p>
      <div className="lines-grid">
        {LINES.map((l) => (
          <article key={l.id} className="line-card">
            <div className="line-art"><img src={l.art} alt="" loading="lazy" /></div>
            <Tilt max={8} className="line-visual">
              <img src={l.image} alt={`OCTOPUS ${l.name} display`} loading="lazy" />
            </Tilt>
            <div className="line-body">
              <span className="line-status">Available now</span>
              <h3>{l.name}</h3>
              <p>{l.text}</p>
              <p className="line-meta">{l.formats.join(" · ")} · {l.flavors} flavors</p>
              <button className="btn btn-glow" onClick={() => scrollToEl("#flavors")} data-cursor="DIVE">
                Explore {l.name}
              </button>
            </div>
          </article>
        ))}
        <article className="line-card line-soon">
          <div className="line-sonar" aria-hidden><i /><i /><i /></div>
          <div className="line-body">
            <span className="line-status is-soon">Surfacing soon</span>
            <h3>More lines</h3>
            <p>New OCTOPUS lines are on their way up from the deep. Retailers can ask us about the full catalog.</p>
            <InkLink href="/contact" className="btn btn-ghost">Ask about the catalog</InkLink>
          </div>
        </article>
      </div>
    </section>
  );
}
