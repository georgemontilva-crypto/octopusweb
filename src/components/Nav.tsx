import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { InkLink } from "./Transition";
import { lockScroll } from "../lib/motion";

export const LINKS = [
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Lab Report", href: "/lab-reports" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => lockScroll(open), [open]);
  useEffect(() => setOpen(false), [loc]);

  const active = (href: string) => (loc === href || loc.startsWith(href + "/") ? " is-active" : "");

  return (
    <>
      <header className={"nav" + (solid || open ? " is-solid" : "")}>
        <div className="wrap nav-inner">
          <InkLink href="/" className="nav-logo" ariaLabel="OCTOPUS home">
            <img src="/img/logo.webp" alt="OCTOPUS" />
          </InkLink>
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <InkLink key={l.href} href={l.href} className={"nav-link" + active(l.href)}>{l.label}</InkLink>
            ))}
            <InkLink href="/wholesale" className={"btn btn-flavor btn-sm" + active("/wholesale")}>Wholesale</InkLink>
          </nav>
          <button className={"burger" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <i /><i />
          </button>
        </div>
      </header>
      <div className={"menu" + (open ? " is-open" : "")} aria-hidden={!open}>
        <nav className="wrap menu-inner" aria-label="Mobile">
          {[{ label: "Home", href: "/" }, ...LINKS].map((l) => (
            <InkLink key={l.href} href={l.href} className={"menu-item" + (loc === l.href ? " is-active" : "")} onClick={() => setOpen(false)}>{l.label}</InkLink>
          ))}
          <InkLink href="/wholesale" className="btn btn-flavor menu-cta" onClick={() => setOpen(false)}>Wholesale</InkLink>
        </nav>
      </div>
    </>
  );
}
