import { useEffect, useRef } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug } from "../data";
import { InkLink } from "../components/Transition";
import { Tilt } from "../components/Fx";
import Product3D from "../three/Product3D";
import FlavorGrid from "../sections/FlavorGrid";
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
      gsap.from(".fp2-info > *", { y: 40, opacity: 0, stagger: 0.07, duration: 0.9, ease: "expo.out", delay: 0.25 });
      gsap.from(".fp2-disp", { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".fp2-displays", start: "top 80%" } });
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

  return (
    <div ref={root} className="fp2" key={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <section className="fp2-hero wrap">
        <div className="fp2-bg" aria-hidden><img src={f.art} alt="" /></div>
        <div className="fp2-stage">
          <div className="sr-floor" />
          <figure className="sr-item">
            <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="sr-p sr-p-tube" fill={0.92} />
            <figcaption>Pre-Roll <b>2G</b></figcaption>
          </figure>
          <figure className="sr-item">
            <Product3D key={"b" + f.slug} flavor={f} kind="box" className="sr-p sr-p-box" fill={0.9} phase={1.1} />
            <figcaption>Dabs <b>2.5G</b></figcaption>
          </figure>
          <span className="sr-hint">Drag to rotate</span>
        </div>
        <div className="fp2-info">
          <p className="kicker">Blue Lotus · {String(i + 1).padStart(2, "0")} / 06</p>
          <h1 className="sr-name">{f.name}</h1>
          <p className="sr-vibe">{f.vibe}</p>
          <p className="fp2-tag">{f.tagline}</p>
          <ul className="notes">
            {f.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <dl className="fp2-specs">
            <div><dt>Pre-Roll</dt><dd>2G · 1 per tube</dd></div>
            <div><dt>Dabs</dt><dd>2.5G · botanical concentrate</dd></div>
          </dl>
          <div className="fp2-nav">
            <InkLink href={`/flavors/${prev.slug}`} color={prev.color} className="fp2-arrow" ariaLabel={`Previous: ${prev.name}`}>← {prev.name}</InkLink>
            <InkLink href={`/flavors/${next.slug}`} color={next.color} className="fp2-arrow" ariaLabel={`Next: ${next.name}`}>{next.name} →</InkLink>
          </div>
        </div>
      </section>

      <section className="fp2-displays wrap">
        <Tilt max={6} className="fp2-disp">
          <img src={f.disp} alt={`${f.name} pre-roll 20-pack display`} loading="lazy" />
          <span>Pre-Roll · 20-pack display</span>
        </Tilt>
        <Tilt max={6} className="fp2-disp">
          <img src={f.box} alt={`${f.name} dabs display`} loading="lazy" />
          <span>Dabs · display box</span>
        </Tilt>
      </section>

      <FlavorGrid exclude={f.slug} title="More flavors" />
    </div>
  );
}
