import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { FLAVORS, flavorBySlug, INGREDIENTS } from "../data";
import { InkLink } from "../components/Transition";
import Viewer from "../components/Viewer";
import FormatToggle from "../components/FormatToggle";
import { setTint } from "../lib/theme";
import { srcSet } from "../lib/img";
import { useSeo } from "../lib/seo";
import NotFound from "./NotFound";

export default function FlavorPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const f = flavorBySlug(slug);
  const [piece, setPiece] = useState<"box" | "cube">("box");
  const [kind, setKind] = useState<"tube" | "box">(() => (new URLSearchParams(window.location.search).get("format") === "dabs" ? "box" : "tube"));
  useSeo(f ? `${f.name} · Blue Lotus · OCTOPUS` : "OCTOPUS", f ? `OCTOPUS Blue Lotus ${f.name} — ${f.vibe}. Pre-Roll 2G and Dabs 2.5G. 21+.` : undefined);
  useEffect(() => {
    if (f) setTint(f.color, f.color2);
  }, [f]);
  if (!f) return <NotFound />;
  const i = FLAVORS.indexOf(f);

  return (
    <div className="pdp" key={f.slug} style={{ ["--c" as string]: f.color }}>
      <section className="wrap pdp-top">
        <nav className="crumbs" aria-label="Breadcrumb">
          <InkLink href="/products">Products</InkLink> <span>/</span> <span>Blue Lotus</span> <span>/</span> <b>{f.name}</b>
        </nav>
        <div className="pdp-grid">
          <div className="pdp-view">
            <Viewer key={kind === "box" ? piece : kind} flavor={f} kind={kind === "box" ? piece : "tube"} />
            {kind === "box" && (
              <div className="seg seg-sm" role="radiogroup" aria-label="Dabs packaging">
                <button role="radio" aria-checked={piece === "box"} className={piece === "box" ? "is-on" : ""} onClick={() => setPiece("box")}>Tall box</button>
                <button role="radio" aria-checked={piece === "cube"} className={piece === "cube" ? "is-on" : ""} onClick={() => setPiece("cube")}>Small box</button>
              </div>
            )}
          </div>
          <div className="pdp-info">
            <p className="eyebrow">Blue Lotus · {String(i + 1).padStart(2, "0")} / 06</p>
            <h1 className="flavor-name">{f.name}</h1>
            <p className="pdp-vibe">{f.vibe}</p>
            <p className="pdp-tag">{f.tagline}</p>
            <div className="pdp-pick">
              <span className="pick-label">Format</span>
              <FormatToggle kind={kind} onChange={setKind} />
            </div>
            <div className="pdp-pick">
              <span className="pick-label">Flavor</span>
              <div className="swatches">
                {FLAVORS.map((x) => (
                  <InkLink key={x.slug} href={`/products/${x.slug}${kind === "box" ? "?format=dabs" : ""}`} className={"swatch" + (x.slug === f.slug ? " is-on" : "")} ariaLabel={x.name}>
                    <i style={{ background: x.color }} />
                  </InkLink>
                ))}
              </div>
            </div>
            <dl className="spec">
              <div><dt>Aroma notes</dt><dd>{f.notes.join(", ")}</dd></div>
              <div><dt>{kind === "tube" ? "Pre-Roll" : "Dabs"}</dt><dd>{kind === "tube" ? "2G · 1 pre-roll per tube · 20 tubes per box" : "2.5G botanical concentrate · tall box + small box"}</dd></div>
              <div><dt>Ingredients</dt><dd>{kind === "tube" ? `${INGREDIENTS.map((x) => x.name).join(", ")}, food-grade binding agent` : "Blue Lotus botanical concentrate"}</dd></div>
              <div><dt>Free from</dt><dd>THC · Hemp · Delta · Synthetic cannabinoids</dd></div>
            </dl>
            <div className="ctas">
              <InkLink href={`/wholesale?product=${encodeURIComponent(`Blue Lotus ${f.name} — ${kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"}`)}`} className="btn btn-flavor">Wholesale inquiry</InkLink>
              <InkLink href="/lab-reports" className="btn btn-line">Lab report</InkLink>
            </div>
          </div>
        </div>
      </section>
      <section className="wrap pdp-displays">
        {kind === "tube" ? (
          <figure className="media-card media-wide">
            <img src={f.disp} srcSet={srcSet(f.disp, 560, 1000)} sizes="(max-width: 760px) 92vw, 60vw" alt={`${f.name} pre-roll tube and 20-pack box`} loading="lazy" />
            <figcaption>Pre-Roll 2G · tube + 20-pack box</figcaption>
          </figure>
        ) : (
          <>
            <figure className="media-card">
              <img src={f.dabs} srcSet={srcSet(f.dabs, 432, 756)} sizes="(max-width: 760px) 92vw, 45vw" alt={`${f.name} dabs tall box and small box`} loading="lazy" />
              <figcaption>Dabs 2.5G · tall box + small box</figcaption>
            </figure>
            <figure className="media-card">
              <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 760px) 92vw, 45vw" alt="Blue Lotus Dabs counter display with all six flavors" loading="lazy" />
              <figcaption>Dabs 2.5G · counter display, all 6 flavors</figcaption>
            </figure>
          </>
        )}
      </section>
    </div>
  );
}
