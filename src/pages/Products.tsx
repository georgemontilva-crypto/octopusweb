import Collection from "../sections/Collection";
import Formats from "../sections/Formats";
import { WholesaleBand } from "../sections/Bands";
import { LINES } from "../data";
import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";
import { useEffect } from "react";

export default function Products() {
  useSeo("Products · OCTOPUS", "OCTOPUS product lines. Blue Lotus: six flavors as Pre-Roll 2G and Dabs 2.5G.");
  useEffect(() => resetTint(), []);
  return (
    <>
      <header className="page-hero wrap">
        <p className="eyebrow">Products</p>
        <h1 className="display">Our <em>lines.</em></h1>
        <div className="lines-tabs">
          {LINES.map((l) => (
            <a key={l.id} href="#blue-lotus" className="line-pill is-on">
              <b>{l.name}</b>
              <span>{l.formats.join(" · ")} · {l.flavors} flavors</span>
            </a>
          ))}
          <InkLink href="/contact" className="line-pill line-pill-soon">
            <b>More lines</b>
            <span>Coming soon — ask us</span>
          </InkLink>
        </div>
      </header>
      <Collection id="blue-lotus" eyebrow="Blue Lotus line" title="Blue Lotus." />
      <Formats />
      <WholesaleBand />
    </>
  );
}
