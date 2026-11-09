import { useEffect, useRef, useState } from "react";
import { FLAVORS, LINES } from "../data";
import Product3D from "../three/Product3D";
import { InkLink } from "../components/Transition";
import { gsap } from "../lib/motion";
import type { Kind } from "../three/stage";

/** Product lines → Blue Lotus flavors, each one in its own glass tank with the real 3D product. */
export default function Aquarium() {
  const root = useRef<HTMLElement>(null);
  const [line, setLine] = useState<string>(LINES[0].id);
  const [kind, setKind] = useState<Kind>("tube");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".aq-head > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.fromTo(el.querySelectorAll(".tank"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: "power3.out", clearProps: "transform" });
  }, [kind, line]);

  return (
    <section ref={root} className="aq" id="products">
      <header className="aq-head wrap">
        <p className="kicker">Product lines</p>
        <div className="aq-tabs" role="tablist" aria-label="Product lines">
          {LINES.map((l) => (
            <button key={l.id} role="tab" aria-selected={line === l.id} className={"aq-tab" + (line === l.id ? " is-on" : "")} onClick={() => setLine(l.id)}>
              {l.name}
            </button>
          ))}
          <button role="tab" aria-selected={line === "soon"} className={"aq-tab" + (line === "soon" ? " is-on" : "")} onClick={() => setLine("soon")}>
            More lines <small>soon</small>
          </button>
        </div>
      </header>

      {line === "soon" ? (
        <div className="aq-soon wrap">
          <div className="aq-sonar" aria-hidden><i /><i /><i /></div>
          <h2>More lines are surfacing</h2>
          <p>New OCTOPUS lines are on their way up from the deep.</p>
          <InkLink href="/contact" className="btn btn-glow">Ask about the catalog</InkLink>
        </div>
      ) : (
        <>
          <div className="aq-bar wrap">
            <h2 className="aq-title">Blue Lotus</h2>
            <div className="seg" role="radiogroup" aria-label="Format">
              <button role="radio" aria-checked={kind === "tube"} className={kind === "tube" ? "is-on" : ""} onClick={() => setKind("tube")}>Pre-Roll 2G</button>
              <button role="radio" aria-checked={kind === "box"} className={kind === "box" ? "is-on" : ""} onClick={() => setKind("box")}>Dabs 2.5G</button>
            </div>
          </div>
          <div className="aq-grid wrap">
            {FLAVORS.map((f, k) => (
              <InkLink key={f.slug} href={`/flavors/${f.slug}`} color={f.color} className="tank" cursor="OPEN" ariaLabel={`${f.name} — ${f.vibe}`}>
                <span className="tank-water" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }} />
                <span className="tank-bubbles" aria-hidden><i /><i /><i /><i /></span>
                <Product3D key={kind + f.slug} flavor={f} kind={kind} className="tank-p" fill={0.9} phase={k * 0.9} sway={0.5} />
                <span className="tank-glass" aria-hidden />
                <span className="tank-meta">
                  <b>{f.name}</b>
                  <em style={{ color: f.color }}>{f.vibe}</em>
                </span>
              </InkLink>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
