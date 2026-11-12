import { useEffect, useState } from "react";
import { srcSet } from "../lib/img";
import InkWall from "../components/InkWall";
import Stickers from "../components/Stickers";
import { InkLink } from "../components/Transition";
import FormatToggle from "../components/FormatToggle";
type Kind = "tube" | "box";
import { FLAVORS } from "../data";
import { setTint, isTouch } from "../lib/theme";

const HERO = FLAVORS;

const STICKERS = [
  { id: "21", x: 91, y: 20, r: 12, node: <span>21+</span>, cls: "st-21" },
  { id: "thc", x: 92, y: 74, r: -8, node: <span>THC<br />FREE</span>, cls: "st-thc" },
  { id: "bot", x: 40, y: 84, r: 6, node: <span>6<br />Flavors</span>, cls: "st-pill" },
];

/** The ink wall: squirt octopus ink in the flavor color, drag the stickers, pick a flavor. */
export default function InkHero() {
  const [i, setI] = useState(0);
  const [armed, setArmed] = useState(false);
  const [kind, setKind] = useState<Kind>("tube");
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
          <p className="lead"><b>Blue Lotus Pre-Rolls 2G</b> and <b>Blue Lotus Dabs 2.5G</b>. Six flavors each. No THC. 21+.</p>
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
          <InkLink href={`/products/${f.slug}${kind === "tube" ? "" : "?format=dabs"}`} className="ink-duo" ariaLabel={`${f.name} ${kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"} — view in 3D`}>
            <img
              key={kind + f.slug}
              className={"ink-pack ink-pack-" + kind}
              src={kind === "tube" ? f.disp : f.dabs}
              srcSet={kind === "tube" ? srcSet(f.disp, 560, 1000) : srcSet(f.dabs, 432, 756)}
              sizes="(max-width: 900px) 86vw, 44vw"
              alt={`${f.name} ${kind === "tube" ? "Pre-Roll 2G tube and 20-pack box" : "Dabs 2.5G tall box and small box"}`}
              draggable={false}
            />
          </InkLink>
          <div className="ink-format">
            <FormatToggle kind={kind} onChange={setKind} />
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
