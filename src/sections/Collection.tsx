import { FLAVORS } from "../data";
import FlavorCard from "../components/FlavorCard";
import Reveal from "../components/Reveal";
import { smUrl } from "../lib/img";
import type { Kind } from "../three/stage";

const COPY: Record<Kind, { eyebrow: string; title: string; text: string; pack: string }> = {
  tube: {
    eyebrow: "Category · Pre-Roll 2G",
    title: "Pre-Rolls.",
    text: "One 2G pre-roll per child-resistant tube. Sold in a horizontal 20-pack box with window.",
    pack: "20-pack box with window",
  },
  box: {
    eyebrow: "Category · Dabs 2.5G",
    title: "Dabs.",
    text: "2.5G botanical concentrate in the tall box. Same six flavors.",
    pack: "Dabs box",
  },
};

/** One product category: six flavors of the same format, plus its packaging. */
export default function Collection({ kind, id }: { kind: Kind; id?: string }) {
  const c = COPY[kind];
  return (
    <section className={"sec cat cat-" + kind} id={id}>
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="h2">{c.title}</h2>
          <p className="cat-text">{c.text}</p>
        </Reveal>
        <div className="fgrid">
          {FLAVORS.map((f, k) => <FlavorCard key={kind + f.slug} f={f} kind={kind} index={k} />)}
        </div>
        <div className="packs" aria-label={c.pack}>
          <p className="pick-label">{c.pack}</p>
          <div className="packs-row">
            {FLAVORS.map((f) => (
              <figure key={f.slug} className="pack">
                <img src={smUrl(kind === "tube" ? f.disp : f.box)} alt={`${f.name} ${kind === "tube" ? "pre-roll 20-pack box" : "dabs box"}`} loading="lazy" />
                <figcaption>{f.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
