import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug } from "../data";
import { InkLink } from "../components/Transition";
import Product3D from "../three/Product3D";
import { gsap, ScrollTrigger } from "../lib/motion";
import { setTint } from "../lib/theme";
import { srcSet } from "../lib/img";
import { useSeo } from "../lib/seo";
import { useEntered } from "../App";
import NotFound from "./NotFound";

export default function FlavorPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const f = flavorBySlug(slug);
  const root = useRef<HTMLDivElement>(null);
  const entered = useEntered();
  useSeo(f ? `${f.name} · Blue Lotus · OCTOPUS` : "OCTOPUS", f ? `OCTOPUS Blue Lotus ${f.name} — ${f.vibe}. Pre-Roll 2G and Dabs 2.5G. 21+.` : undefined);

  useEffect(() => {
    if (!f || !entered) return;
    setTint(f.color, f.color2);
    const ctx = gsap.context(() => {
      gsap.from(".fp-fade", { y: 30, opacity: 0, stagger: 0.07, duration: 0.9, ease: "power3.out", delay: 0.15 });
    }, root.current!);
    const t = setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [f, entered]);

  if (!f) return <NotFound />;
  const i = FLAVORS.indexOf(f);

  return (
    <div ref={root} className="fp" key={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <section className="fp-top wrap">
        <div className="fp-tank fp-fade">
          <span className="tank-water" />
          <span className="tank-bubbles" aria-hidden><i /><i /><i /><i /></span>
          <div className="fp-duo">
            <figure>
              <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="fp-p" fill={0.86} />
              <figcaption>Pre-Roll <b>2G</b></figcaption>
            </figure>
            <figure>
              <Product3D key={"b" + f.slug} flavor={f} kind="box" className="fp-p" fill={0.84} phase={1.2} />
              <figcaption>Dabs <b>2.5G</b></figcaption>
            </figure>
          </div>
          <span className="tank-glass" aria-hidden />
        </div>
        <div className="fp-info">
          <p className="kicker fp-fade">Blue Lotus · {String(i + 1).padStart(2, "0")}/06</p>
          <h1 className="fp-name fp-fade">{f.name}</h1>
          <p className="fp-vibe fp-fade">{f.vibe}</p>
          <p className="fp-tag fp-fade">{f.tagline}</p>
          <ul className="notes fp-fade">
            {f.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <dl className="fp-specs fp-fade">
            <div><dt>Pre-Roll</dt><dd>2G</dd></div>
            <div><dt>Dabs</dt><dd>2.5G</dd></div>
          </dl>
        </div>
      </section>

      <section className="rt-grid wrap fp-displays">
        <figure className="rt-card">
          <img src={f.disp} srcSet={srcSet(f.disp)} sizes="(max-width: 760px) 90vw, 45vw" alt={`${f.name} pre-roll 20-pack display`} loading="lazy" />
          <figcaption>Pre-Roll · 20-pack display</figcaption>
        </figure>
        <figure className="rt-card">
          <img src={f.box} srcSet={srcSet(f.box)} sizes="(max-width: 760px) 90vw, 45vw" alt={`${f.name} dabs display`} loading="lazy" />
          <figcaption>Dabs · display box</figcaption>
        </figure>
      </section>

      <nav className="fp-more wrap" aria-label="Other flavors">
        <p className="kicker">More Blue Lotus flavors</p>
        <div className="fp-chips">
          {FLAVORS.filter((x) => x.slug !== f.slug).map((x) => (
            <InkLink key={x.slug} href={`/flavors/${x.slug}`} color={x.color} className="fp-chip">
              <i style={{ background: x.color }} />
              {x.name}
            </InkLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
