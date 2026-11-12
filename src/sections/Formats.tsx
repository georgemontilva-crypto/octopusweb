import Product3D from "../three/Product3D";
import Reveal from "../components/Reveal";
import { FLAVORS } from "../data";

const F = FLAVORS[0];

export default function Formats() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">Two formats</p>
          <h2 className="h2">Pick your <em>ritual.</em></h2>
        </Reveal>
        <div className="formats">
          <Reveal className="format">
            <div className="format-stage"><span className="fcard-light" aria-hidden /><Product3D flavor={F} kind="tube" className="format-p" fill={0.9} /><span className="fcard-floor" aria-hidden /></div>
            <div className="format-body">
              <h3>Pre-Roll</h3>
              <p className="format-size">2G</p>
              <p>One Blue Lotus pre-roll in a child-resistant tube. Sold in 20-pack countertop displays.</p>
            </div>
          </Reveal>
          <Reveal className="format" delay={100}>
            <div className="format-stage"><span className="fcard-light" aria-hidden /><Product3D flavor={F} kind="box" className="format-p" fill={0.88} phase={1} /><span className="fcard-floor" aria-hidden /></div>
            <div className="format-body">
              <h3>Dabs</h3>
              <p className="format-size">2.5G</p>
              <p>Blue Lotus botanical concentrate. Sold in a six-flavor display.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
