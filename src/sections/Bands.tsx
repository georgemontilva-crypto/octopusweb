import { InkLink } from "../components/Transition";
import Reveal from "../components/Reveal";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import { srcSet } from "../lib/img";

/** Dabs feature: rotating 3D box + three facts. */
export function DabsBand() {
  const f = FLAVORS[0];
  return (
    <section className="sec">
      <div className="wrap dabs">
        <Reveal className="dabs-stage">
          <Product3D flavor={f} kind="box" className="dabs-p" fill={0.86} spin />
        </Reveal>
        <Reveal className="dabs-copy">
          <p className="eyebrow">Dabs · 2.5G</p>
          <h2 className="mega mega-sm">Botanical<br />concentrate</h2>
          <ul className="facts">
            <li><b>2.5G</b><span>per box</span></li>
            <li><b>6</b><span>flavors</span></li>
            <li><b>0</b><span>THC</span></li>
          </ul>
          <InkLink href="/products" className="btn btn-flavor">See all dabs</InkLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Full flavor-colored wholesale band (the whole block takes the current flavor color). */
export function WholesaleBand() {
  return (
    <section className="flavor-band">
      <div className="wrap fb-grid">
        <div>
          <p className="eyebrow fb-eyebrow">For retailers & distributors</p>
          <h2 className="mega mega-sm fb-title">Put OCTOPUS<br />on your shelf</h2>
          <p className="fb-text">Counter-ready 20-pack pre-roll displays and six-flavor dab displays.</p>
          <div className="ctas">
            <InkLink href="/wholesale" className="btn btn-dark">Apply for wholesale</InkLink>
            <InkLink href="/contact" className="btn btn-dark-line">Contact us</InkLink>
          </div>
        </div>
        <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 900px) 90vw, 45vw" alt="OCTOPUS Blue Lotus displays" loading="lazy" className="fb-img" />
      </div>
    </section>
  );
}

export function InfoBand() {
  return (
    <section className="sec sec-tight">
      <div className="wrap info">
        <Reveal className="info-card">
          <p className="eyebrow">About us</p>
          <h3 className="h3">A family of bold botanical lines.</h3>
          <p>OCTOPUS creates botanical products with loud flavor and serious standards. Blue Lotus is our first line — more are on the way.</p>
          <InkLink href="/about" className="link-arrow">Our story →</InkLink>
        </Reveal>
        <Reveal className="info-card" delay={100}>
          <p className="eyebrow">Lab report</p>
          <h3 className="h3">Tested, batch by batch.</h3>
          <p>Scan the QR code on your pack or find your flavor to see its lab results.</p>
          <InkLink href="/lab-reports" className="link-arrow">View lab reports →</InkLink>
        </Reveal>
      </div>
    </section>
  );
}
