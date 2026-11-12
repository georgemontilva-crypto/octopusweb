import { useEffect, useState } from "react";
import Product3D from "../three/Product3D";
import InkWall from "../components/InkWall";
import Stickers from "../components/Stickers";
import { InkLink } from "../components/Transition";
import { FLAVORS } from "../data";
import { setTint, isTouch } from "../lib/theme";

const HERO = FLAVORS.filter((f) => f.tex.front);

const STICKERS = [
  { id: "logo", x: 44, y: 9, r: -10, node: <img src="/img/logo.webp" alt="" draggable={false} />, cls: "st-logo" },
  { id: "21", x: 91, y: 20, r: 12, node: <span>21+</span>, cls: "st-21" },
  { id: "thc", x: 92, y: 74, r: -8, node: <span>THC<br />FREE</span>, cls: "st-thc" },
  { id: "bot", x: 40, y: 84, r: 6, node: <span>Botanical<br />Blend</span>, cls: "st-pill" },
];

/** The ink wall: squirt octopus ink in the flavor color, drag the stickers, pick a flavor. */
export default function InkHero() {
  const [i, setI] = useState(0);
  const [armed, setArmed] = useState(false);
  const touch = isTouch();
  const f = HERO[i];
  useEffect(() => setTint(f.color, f.color2), [f]);

  return (
    <section className={"ink-hero" + (armed ? " is-inking" : "")} style={{ ["--c" as string]: f.color }}>
      <InkWall color={f.color} armed={armed} />
      <Stickers items={STICKERS} />
      <div className="wrap ink-grid">
        <div className="ink-copy">
          <p className="eyebrow">OCTOPUS · Blue Lotus line</p>
          <h1 className="mega">
            <span className="mega-1">Blue</span>
            <span className="mega-2">Lotus</span>
          </h1>
          <p className="lead">Dried blue lotus flower and herbal botanicals in six flavors. <b>Pre-Roll 2G</b> and <b>Dabs 2.5G</b>. No THC. 21+.</p>
          <div className="ctas">
            <InkLink href="/products" className="btn btn-flavor">Explore products</InkLink>
            <InkLink href="/wholesale" className="btn btn-line">Wholesale</InkLink>
          </div>
          <p className="ink-hint" data-noink>
            {touch ? (
              <button className={"ink-toggle" + (armed ? " is-on" : "")} onClick={() => setArmed((a) => !a)} aria-pressed={armed}>
                {armed ? "✓ Ink mode on — draw with your finger" : "🐙 Ink mode — tap to squirt ink"}
              </button>
            ) : (
              <span>🐙 Hold & drag anywhere to squirt ink · drag the stickers</span>
            )}
          </p>
        </div>
        <div className="ink-stage" data-noink>
          <div className="ink-duo">
            <Product3D key={"b" + f.slug} flavor={f} kind="box" className="ink-p ink-p-box" fill={0.9} phase={1.2} />
            <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="ink-p ink-p-tube" fill={0.92} />
          </div>
          <div className="flavor-chips" role="radiogroup" aria-label="Flavor">
            {HERO.map((x, k) => (
              <button key={x.slug} role="radio" aria-checked={k === i} className={"fchip" + (k === i ? " is-on" : "")} style={{ ["--s" as string]: x.color }} onClick={() => setI(k)}>
                <i />
                {x.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
