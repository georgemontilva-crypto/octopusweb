import { InkLink } from "./Transition";
import { LINKS } from "./Nav";
import { DISCLAIMER, FLAVORS } from "../data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/img/logo.webp" alt="OCTOPUS" loading="lazy" />
            <p>Bold botanical blends. Strictly 21+.</p>
            <InkLink href="/wholesale" className="btn btn-flavor btn-sm">Wholesale</InkLink>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <InkLink href="/" className="footer-link">Home</InkLink>
            {LINKS.map((l) => <InkLink key={l.href} href={l.href} className="footer-link">{l.label}</InkLink>)}
            <InkLink href="/wholesale" className="footer-link">Wholesale</InkLink>
          </div>
          <div className="footer-col">
            <h4>Blue Lotus</h4>
            {FLAVORS.map((f) => (
              <InkLink key={f.slug} href={`/products/${f.slug}`} className="footer-link"><i style={{ background: f.color }} />{f.name}</InkLink>
            ))}
          </div>
        </div>
        <p className="footer-legal">{DISCLAIMER}</p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OCTOPUS. All rights reserved.</span>
          <span>21+ only</span>
        </div>
      </div>
    </footer>
  );
}
