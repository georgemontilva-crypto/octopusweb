import { useEffect } from "react";
import { InkLink } from "../components/Transition";
import Reveal from "../components/Reveal";
import { LINES } from "../data";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";

const VALUES = [
  { t: "Botanical", d: "Plant-based blends built on real botanicals. No THC, no hemp, no synthetic cannabinoids in Blue Lotus." },
  { t: "Tested", d: "Every batch goes through lab testing, with results available by QR code on the pack." },
  { t: "Bold", d: "Loud colors, big flavor and packaging that stands out on any counter." },
];

export default function About() {
  useSeo("About Us · OCTOPUS", "About OCTOPUS — a family of bold botanical product lines.");
  useEffect(() => resetTint(), []);
  return (
    <>
      <header className="page-hero wrap">
        <p className="eyebrow">About us</p>
        <h1 className="display">Born in <em>the deep.</em></h1>
        <p className="lead lead-lg">
          OCTOPUS is a family of botanical product lines with one idea: bold flavor, serious standards and packaging you can't miss. Like its namesake, the brand reaches in many directions — Blue Lotus is the first arm.
        </p>
      </header>
      <section className="sec sec-tight">
        <div className="wrap values">
          {VALUES.map((v, k) => (
            <Reveal key={v.t} className="value" delay={k * 80}>
              <span className="value-num">0{k + 1}</span>
              <h3 className="h3">{v.t}</h3>
              <p>{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="sec">
        <div className="wrap about-split">
          <Reveal className="about-media">
            <img src="/img/art/abyss-sm.webp" alt="" loading="lazy" />
            <img src="/img/logo.webp" alt="OCTOPUS" className="about-logo" loading="lazy" />
          </Reveal>
          <Reveal className="about-copy">
            <p className="eyebrow">Our lines</p>
            <h2 className="h2">One brand, <em>many arms.</em></h2>
            <ul className="about-lines">
              {LINES.map((l) => (
                <li key={l.id}><b>{l.name}</b><span>{l.formats.join(" · ")} · {l.flavors} flavors</span><em className="ok">Available</em></li>
              ))}
              <li><b>More lines</b><span>In development</span><em>Coming soon</em></li>
            </ul>
            <div className="ctas">
              <InkLink href="/products" className="btn btn-primary">See products</InkLink>
              <InkLink href="/wholesale" className="btn btn-line">Wholesale</InkLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
