import { useEffect } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug, INGREDIENTS } from "../data";
import { InkLink } from "../components/Transition";
import Product3D from "../three/Product3D";
import { setTint } from "../lib/theme";
import { srcSet } from "../lib/img";
import { useSeo } from "../lib/seo";
import NotFound from "./NotFound";

export default function FlavorPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const f = flavorBySlug(slug);
  useSeo(f ? `${f.name} · Blue Lotus · OCTOPUS` : "OCTOPUS", f ? `OCTOPUS Blue Lotus ${f.name} — ${f.vibe}. Pre-Roll 2G and Dabs 2.5G. 21+.` : undefined);
  useEffect(() => {
    if (f) setTint(f.color, f.color2);
  }, [f]);
  if (!f) return <NotFound />;
  const i = FLAVORS.indexOf(f);
  const next = FLAVORS[(i + 1) % FLAVORS.length];
  const prev = FLAVORS[(i + FLAVORS.length - 1) % FLAVORS.length];

  return (
    <div className="pdp" key={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <section className="wrap pdp-top">
        <nav className="crumbs" aria-label="Breadcrumb">
          <InkLink href="/products">Products</InkLink> <span>/</span> <span>Blue Lotus</span> <span>/</span> <b>{f.name}</b>
        </nav>
        <div className="pdp-grid">
          <div className="pdp-stage">
            <span className="fcard-light" aria-hidden />
            <div className="pdp-duo">
              <figure><Product3D key={"t" + f.slug} flavor={f} kind="tube" className="pdp-p" fill={0.9} /><figcaption>Pre-Roll · 2G</figcaption></figure>
              <figure><Product3D key={"b" + f.slug} flavor={f} kind="box" className="pdp-p" fill={0.88} phase={1.2} /><figcaption>Dabs · 2.5G</figcaption></figure>
            </div>
            <span className="fcard-floor" aria-hidden />
          </div>
          <div className="pdp-info">
            <p className="eyebrow">Blue Lotus · {String(i + 1).padStart(2, "0")} / 06</p>
            <h1 className="pdp-name">{f.name}</h1>
            <p className="pdp-vibe">{f.vibe}</p>
            <p className="pdp-tag">{f.tagline}</p>
            <dl className="spec">
              <div><dt>Aroma notes</dt><dd>{f.notes.join(", ")}</dd></div>
              <div><dt>Formats</dt><dd>Pre-Roll 2G · Dabs 2.5G</dd></div>
              <div><dt>Displays</dt><dd>20-pack (pre-roll) · 6-flavor (dabs)</dd></div>
              <div><dt>Ingredients</dt><dd>{INGREDIENTS.map((x) => x.name).join(", ")}, food-grade binding agent</dd></div>
              <div><dt>Free from</dt><dd>THC · Hemp · Delta · Synthetic cannabinoids</dd></div>
            </dl>
            <div className="ctas">
              <InkLink href={`/wholesale?product=${encodeURIComponent("Blue Lotus " + f.name)}`} className="btn btn-primary">Wholesale inquiry</InkLink>
              <InkLink href="/lab-reports" className="btn btn-line">Lab report</InkLink>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap pdp-displays">
        <figure className="media-card">
          <img src={f.disp} srcSet={srcSet(f.disp)} sizes="(max-width: 760px) 90vw, 45vw" alt={`${f.name} pre-roll 20-pack display`} loading="lazy" />
          <figcaption>Pre-Roll · 20-pack display</figcaption>
        </figure>
        <figure className="media-card">
          <img src={f.box} srcSet={srcSet(f.box)} sizes="(max-width: 760px) 90vw, 45vw" alt={`${f.name} dabs display`} loading="lazy" />
          <figcaption>Dabs · display box</figcaption>
        </figure>
      </section>

      <nav className="wrap pdp-nav" aria-label="More flavors">
        <InkLink href={`/products/${prev.slug}`} className="pdp-nav-link"><span>← Previous</span><b style={{ color: prev.color }}>{prev.name}</b></InkLink>
        <InkLink href={`/products/${next.slug}`} className="pdp-nav-link pdp-nav-next"><span>Next →</span><b style={{ color: next.color }}>{next.name}</b></InkLink>
      </nav>
    </div>
  );
}
