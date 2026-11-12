import { FLAVORS } from "../data";
import Reveal from "../components/Reveal";
import { InkLink } from "../components/Transition";
import { srcSet } from "../lib/img";

type Cat = "tube" | "box";

const COPY: Record<Cat, { eyebrow: string; title: string; text: string }> = {
  tube: {
    eyebrow: "Blue Lotus Pre-Rolls · 2G",
    title: "Pre-Rolls.",
    text: "One 2G pre-roll per tube. Twenty tubes per box. Six flavors.",
  },
  box: {
    eyebrow: "Blue Lotus Dabs · 2.5G",
    title: "Dabs.",
    text: "2.5G botanical concentrate. Tall box and small box. Six flavors.",
  },
};

/** One category: each flavor shown with its packaging. Tap a card to see it in 3D. */
export default function Collection({ kind, id }: { kind: Cat; id?: string }) {
  const c = COPY[kind];
  return (
    <section className={"sec cat cat-" + kind} id={id}>
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="h2">{c.title}</h2>
          <p className="cat-text">{c.text}</p>
        </Reveal>
        <div className="packs-row">
          {FLAVORS.map((f) => {
            const src = kind === "tube" ? f.disp : f.dabs;
            return (
              <InkLink key={f.slug} href={`/products/${f.slug}${kind === "box" ? "?format=dabs" : ""}`} className="pack" ariaLabel={`${f.name} ${kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"} — view in 3D`}>
                <span className="pack-glow" style={{ ["--c" as string]: f.color }} aria-hidden />
                <img src={src} srcSet={kind === "tube" ? srcSet(src, 560, 1000) : srcSet(src, 432, 756)} sizes="(max-width: 760px) 46vw, 30vw" alt={`${f.name} ${kind === "tube" ? "pre-roll tube and 20-pack box" : "dabs tall box and small box"}`} loading="lazy" />
                <span className="pack-cap">
                  <b style={{ color: f.color }}>{f.name}</b>
                  <span>{f.vibe}</span>
                  <i>View in 3D →</i>
                </span>
              </InkLink>
            );
          })}
        </div>
        {kind === "box" && (
          <Reveal className="counter">
            <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 900px) 92vw, 56vw" alt="Blue Lotus Dabs counter display with all six flavors" loading="lazy" />
            <div className="counter-copy">
              <p className="eyebrow">Counter display</p>
              <h3 className="h3">All six dabs flavors in one display.</h3>
              <p className="cat-text">Made for the counter: Blue Dreamz, Royal Haze, Purple Paradise, Midnight Lotus, Cloud 9 and Egyptian Nights.</p>
              <InkLink href={`/wholesale?product=${encodeURIComponent("Blue Lotus Dabs 2.5G — counter display")}`} className="btn btn-flavor">Wholesale inquiry</InkLink>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
