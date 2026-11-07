import { InkLink } from "./Transition";
import { DISCLAIMER, FLAVORS } from "../data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <h4>Blue Lotus flavors</h4>
          {FLAVORS.map((f) => (
            <InkLink key={f.slug} href={`/flavors/${f.slug}`} color={f.color} className="footer-link">
              <i style={{ background: f.color }} />
              {f.name}
            </InkLink>
          ))}
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <InkLink href="/" className="footer-link">Home</InkLink>
          <InkLink href="/lab-reports" className="footer-link">Lab Results</InkLink>
          <InkLink href="/contact" className="footer-link">Contact & Wholesale</InkLink>
        </div>
        <div className="footer-col footer-badges">
          <h4>Blue Lotus line</h4>
          <ul>
            <li>No THC</li>
            <li>No Hemp</li>
            <li>No Delta</li>
            <li>No Synthetic Cannabinoids</li>
            <li>Lab Tested</li>
            <li>Made in USA</li>
          </ul>
        </div>
      </div>
      <div className="footer-logo">
        <img src="/img/logo.webp" alt="OCTOPUS" loading="lazy" />
      </div>
      <p className="footer-legal">{DISCLAIMER}</p>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Octopus Co. · 21+ only</span>
        <span>From the deep</span>
      </div>
    </footer>
  );
}
