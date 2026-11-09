import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug } from "../data";
import { InkLink } from "../components/Transition";
import { Tilt } from "../components/Fx";
import Product3D from "../three/Product3D";
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
  useSeo(f ? `${f.name} · Blue Lotus · OCTOPUS` : "OCTOPUS", f ? `OCTOPUS Blue Lotus ${f.name} — ${f.vibe}. Pre-Roll 2G and Dabs 2.5G. 21+.` : undefined);

  useEffect(() => {
    if (!f || !entered) return;
    setTint(f.color, f.color2);
    const ctx = gsap.context(() => {
      gsap.fromTo(".fv-ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.04, duration: 1.2, ease: "expo.out", delay: 0.15 });
      gsap.from(".fv-fade", { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", delay: 0.5 });
      gsap.from(".sf-disp", { y: 100, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".fv-displays", start: "top 80%" } });
    }, root.current!);
    const t = setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [f, entered]);

  if (!f) return <NotFound />;
  const i = FLAVORS.indexOf(f);
  const next = FLAVORS[(i + 1) % FLAVORS.length];
  const prev = FLAVORS[(i + FLAVORS.length - 1) % FLAVORS.length];
  const words = f.name.toUpperCase().split(" ");

  return (
    <div ref={root} className="fv" key={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <section className="fv-hero">
        <div className="fv-bg" aria-hidden><img src={f.art} alt="" /></div>
        <h1 className="fv-word" aria-label={f.name}>
          {words.map((w, k) => (
            <span className="fv-line" key={k} aria-hidden>
              {w.split("").map((c, j) => <span className="fv-ch" key={j}>{c}</span>)}
            </span>
          ))}
        </h1>
        <div className="fv-stage">
          <div className="cu-floor" />
          <figure className="cu-item">
            <Product3D key={"b" + f.slug} flavor={f} kind="box" className="cu-p" fill={0.9} phase={1.2} />
            <figcaption>Dabs <b>2.5G</b></figcaption>
          </figure>
          <figure className="cu-item cu-item-tube">
            <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="cu-p" fill={0.92} />
            <figcaption>Pre-Roll <b>2G</b></figcaption>
          </figure>
        </div>
        <div className="fv-bottom wrap">
          <div className="fv-fade">
            <p className="kicker">Blue Lotus · {String(i + 1).padStart(2, "0")}/06</p>
            <p className="cu-vibe">{f.vibe}</p>
          </div>
          <ul className="notes fv-fade">
            {f.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <dl className="fv-specs fv-fade">
            <div><dt>Pre-Roll</dt><dd>2G</dd></div>
            <div><dt>Dabs</dt><dd>2.5G</dd></div>
          </dl>
        </div>
      </section>

      <section className="fv-displays wrap sf-displays">
        <Tilt max={6} className="sf-disp">
          <img src={f.disp} alt={`${f.name} pre-roll 20-pack display`} loading="lazy" />
          <span>Pre-Roll · 20-pack display</span>
        </Tilt>
        <Tilt max={6} className="sf-disp">
          <img src={f.box} alt={`${f.name} dabs display`} loading="lazy" />
          <span>Dabs · display box</span>
        </Tilt>
      </section>

      <nav className="fv-next wrap" aria-label="More flavors">
        <InkLink href={`/flavors/${prev.slug}`} color={prev.color} className="fv-nav" cursor="PREV">
          <span className="kicker">← Previous</span>
          <b style={{ color: prev.color }}>{prev.name}</b>
        </InkLink>
        <InkLink href={`/flavors/${next.slug}`} color={next.color} className="fv-nav fv-nav-next" cursor="NEXT">
          <span className="kicker">Next →</span>
          <b style={{ color: next.color }}>{next.name}</b>
        </InkLink>
      </nav>
    </div>
  );
}
