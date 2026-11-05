import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug } from "../data";
import { Chars, Tilt } from "../components/Fx";
import { InkLink } from "../components/Transition";
import { gsap, ScrollTrigger } from "../lib/motion";
import { setTint } from "../lib/theme";
import { useSeo } from "../lib/seo";
import { useEntered } from "../App";
import NotFound from "./NotFound";

export default function FlavorPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const f = flavorBySlug(slug);
  const root = useRef<HTMLDivElement>(null);
  const entered = useEntered();
  useSeo(f ? `${f.name} · OCTOPUS Blue Lotus` : "OCTOPUS", f ? `${f.name} — ${f.tagline} Blue Lotus pre-roll 2G & dabs 2.5G. ${f.vibe}.` : undefined);

  useEffect(() => {
    if (!f || !entered) return;
    setTint(f.color, f.color2);
    const el = root.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(".fp-name .ch", { yPercent: 120, rotate: 10, opacity: 0, stagger: 0.035, duration: 1.1, ease: "expo.out" })
        .from(".fp-fade", { y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out" }, 0.3)
        .from(".fp-tall", { y: 200, rotate: 14, opacity: 0, duration: 1.5, ease: "expo.out" }, 0.2)
        .from(".fp-tube", { y: 260, rotate: -18, opacity: 0, duration: 1.6, ease: "expo.out" }, 0.35);
      gsap.to(".fp-bg img", { yPercent: 18, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".fp-hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".fp-reveal").forEach((r) => {
        gsap.from(r, { y: 90, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: r, start: "top 88%" } });
      });
    }, el);
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [f, entered]);

  if (!f) return <NotFound />;
  const i = FLAVORS.indexOf(f);
  const next = FLAVORS[(i + 1) % FLAVORS.length];
  const prev = FLAVORS[(i + FLAVORS.length - 1) % FLAVORS.length];

  return (
    <div ref={root} className="fp" key={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2, ["--ink" as string]: f.ink }}>
      <section className="fp-hero">
        <div className="fp-bg"><img src={f.art} alt="" /></div>
        <div className="fp-copy">
          <p className="fp-index fp-fade">{String(i + 1).padStart(2, "0")} / 06 · Blue Lotus</p>
          <h1 className="fp-name">
            {f.name.split(" ").map((w) => (
              <span className="fp-name-line" key={w}><Chars text={w} /></span>
            ))}
          </h1>
          <span className="vibe fp-fade">{f.vibe}</span>
          <p className="fp-tag fp-fade">{f.tagline}</p>
          <p className="fp-desc fp-fade">{f.description}</p>
          <ul className="notes fp-fade">
            {f.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </div>
        <div className="fp-stage">
          <div className="fl-ring" />
          <div className="fl-ring fl-ring-2" />
          <Tilt max={14} className="fp-tilt">
            <img src={f.tall} alt={`${f.name} Blue Lotus Dabs 2.5G`} className="fp-tall" />
            <img src={f.tube} alt={`${f.name} Blue Lotus Pre-Roll 2G`} className="fp-tube" />
          </Tilt>
        </div>
      </section>

      <section className="fp-formats">
        <div className="fp-format fp-reveal">
          <Tilt max={10} className="fp-format-img"><img src={f.tube} alt="" loading="lazy" className="is-tube" /></Tilt>
          <div>
            <p className="kicker">Pre-Roll · 2G</p>
            <h2>{f.name} Pre-Roll</h2>
            <p>One 2G Blue Lotus pre-roll in a child-resistant tube. Available in a 20-pack countertop display.</p>
            <ul className="specs">
              <li><b>Net wt.</b> 2G</li>
              <li><b>Count</b> 1 pre-roll</li>
              <li><b>Display</b> 20-pack</li>
            </ul>
          </div>
        </div>
        <div className="fp-format fp-reveal">
          <Tilt max={10} className="fp-format-img"><img src={f.tall} alt="" loading="lazy" className="is-tall" /></Tilt>
          <div>
            <p className="kicker">Dabs · 2.5G</p>
            <h2>{f.name} Dabs</h2>
            <p>A 2.5G Blue Lotus botanical concentrate. Serving size: 1 dab. Sold in the 6-flavor display.</p>
            <ul className="specs">
              <li><b>Net wt.</b> 2.5G</li>
              <li><b>Type</b> Botanical concentrate</li>
              <li><b>Display</b> 6 flavors</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="fp-counter fp-reveal">
        <h2 className="section-title small">On the <span className="drip">counter</span></h2>
        <div className="fp-counter-grid">
          <Tilt max={6} className="fp-counter-item"><img src={f.disp} alt={`${f.name} pre-roll 20-pack display`} loading="lazy" /><span>Pre-Roll 20-pack display</span></Tilt>
          <Tilt max={6} className="fp-counter-item"><img src={f.box} alt={`${f.name} dabs display box`} loading="lazy" /><span>Dabs display</span></Tilt>
        </div>
      </section>

      <section className="fp-ingr fp-reveal">
        <div>
          <p className="kicker">Ingredients</p>
          <p className="fp-ingr-text">Dried Blue Lotus Flower (<em>Nymphaea caerulea</em>), Damiana Leaf, Mugwort, Marshmallow Leaf, Food-Grade Binding Agent.</p>
        </div>
        <ul className="fp-badges">
          <li>No THC</li><li>No Hemp</li><li>No Delta</li><li>No Synthetics</li><li>Lab Tested</li><li>21+</li>
        </ul>
        <InkLink href="/lab-reports" className="btn btn-ghost" color={f.color}>Lab results →</InkLink>
      </section>

      <nav className="fp-next">
        <InkLink href={`/flavors/${prev.slug}`} color={prev.color} className="fp-nav fp-prev" cursor="PREV">
          <img src={prev.art} alt="" loading="lazy" />
          <span className="kicker">← Previous</span>
          <b style={{ color: prev.color }}>{prev.name}</b>
        </InkLink>
        <InkLink href={`/flavors/${next.slug}`} color={next.color} className="fp-nav fp-nxt" cursor="NEXT">
          <img src={next.art} alt="" loading="lazy" />
          <span className="kicker">Next current →</span>
          <b style={{ color: next.color }}>{next.name}</b>
        </InkLink>
      </nav>
    </div>
  );
}
