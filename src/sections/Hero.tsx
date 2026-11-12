import { useEffect, useState } from "react";
import Product3D from "../three/Product3D";
import { InkLink } from "../components/Transition";
import { FLAVORS } from "../data";
import { setTint } from "../lib/theme";

const HERO = FLAVORS.filter((f) => f.tex.front);

/** Studio hero: the products on a lit pedestal, flavor picker, one clear message. */
export default function Hero() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const f = HERO[i];

  useEffect(() => setTint(f.color, f.color2), [f]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 6000);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <section className="hero" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <div className="hero-beam" aria-hidden />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">OCTOPUS · Blue Lotus line</p>
          <h1 className="display">
            Blue Lotus.<br />
            <em>Pulled from the deep.</em>
          </h1>
          <p className="lead">
            Dried blue lotus flower and herbal botanicals in six flavors — as <b>2G pre-rolls</b> and <b>2.5G dabs</b>. No THC. 21+ only.
          </p>
          <div className="ctas">
            <InkLink href="/products" className="btn btn-primary">Explore products</InkLink>
            <InkLink href="/wholesale" className="btn btn-line">Wholesale</InkLink>
          </div>
        </div>
        <div className="hero-stage">
          <div className="hero-word" aria-hidden key={f.slug}>{f.name}</div>
          <div className="pedestal" aria-hidden />
          <div className="hero-duo">
            <Product3D key={"b" + f.slug} flavor={f} kind="box" className="hero-p hero-p-box" fill={0.9} phase={1.2} />
            <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="hero-p hero-p-tube" fill={0.92} />
          </div>
          <div className="hero-pick" role="tablist" aria-label="Flavor">
            {HERO.map((x, k) => (
              <button
                key={x.slug}
                role="tab"
                aria-selected={k === i}
                aria-label={x.name}
                className={k === i ? "is-on" : ""}
                style={{ ["--s" as string]: x.color }}
                onClick={() => {
                  setAuto(false);
                  setI(k);
                }}
              />
            ))}
            <span className="hero-pick-name">{f.name} <i>· {f.vibe}</i></span>
          </div>
        </div>
      </div>
    </section>
  );
}
