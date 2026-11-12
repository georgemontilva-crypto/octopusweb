import { InkLink } from "../components/Transition";
import Reveal from "../components/Reveal";
import { srcSet } from "../lib/img";

/** Wholesale band with the retail displays. */
export function WholesaleBand() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal className="band">
          <div className="band-copy">
            <p className="eyebrow">For retailers & distributors</p>
            <h2 className="h2">Made to sell <em>from the counter.</em></h2>
            <p className="lead">Ready-to-display packs that stand out on any shelf: 20-pack pre-roll displays and six-flavor dab displays.</p>
            <div className="ctas">
              <InkLink href="/wholesale" className="btn btn-primary">Apply for wholesale</InkLink>
              <InkLink href="/contact" className="btn btn-line">Contact us</InkLink>
            </div>
          </div>
          <div className="band-media">
            <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 900px) 90vw, 40vw" alt="OCTOPUS Blue Lotus dabs six-flavor display" loading="lazy" className="band-img-a" />
            <img src="/img/p/purple-paradise-disp.webp" srcSet={srcSet("/img/p/purple-paradise-disp.webp")} sizes="(max-width: 900px) 60vw, 22vw" alt="OCTOPUS Blue Lotus pre-roll 20-pack display" loading="lazy" className="band-img-b" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** About teaser + lab report teaser. */
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
