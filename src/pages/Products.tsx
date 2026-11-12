import Collection from "../sections/Collection";
import { WholesaleBand } from "../sections/Bands";
import { scrollToEl } from "../lib/motion";
import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";
import { useEffect } from "react";

export default function Products() {
  useSeo("Products · OCTOPUS", "OCTOPUS product lines. Blue Lotus: six flavors as Pre-Roll 2G and Dabs 2.5G.");
  useEffect(() => {
    resetTint();
    const h = window.location.hash;
    if (h === "#dabs" || h === "#prerolls") setTimeout(() => scrollToEl(h), 120);
  }, []);
  return (
    <>
      <header className="page-hero wrap">
        <p className="eyebrow">Products</p>
        <h1 className="display">Our <em>lines.</em></h1>
        <div className="lines-tabs">
          <a href="#prerolls" className="line-pill is-on" onClick={(e) => { e.preventDefault(); scrollToEl("#prerolls"); }}>
            <b>Blue Lotus Pre-Rolls</b>
            <span>2G · 6 flavors</span>
          </a>
          <a href="#dabs" className="line-pill is-on" onClick={(e) => { e.preventDefault(); scrollToEl("#dabs"); }}>
            <b>Blue Lotus Dabs</b>
            <span>2.5G · 6 flavors</span>
          </a>
          <InkLink href="/contact" className="line-pill line-pill-soon">
            <b>More lines</b>
            <span>Coming soon — ask us</span>
          </InkLink>
        </div>
      </header>
      <Collection kind="tube" id="prerolls" />
      <Collection kind="box" id="dabs" />
      <WholesaleBand />
    </>
  );
}
