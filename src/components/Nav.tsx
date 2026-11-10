import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { goTo, InkLink } from "./Transition";
import { gsap, lockScroll, scrollToEl } from "../lib/motion";
import { FLAVORS } from "../data";

export const pending = { hash: "" };

const LINKS = [
  { label: "Products", hash: "#products" },
];

export default function Nav() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const depthRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastY = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const y = window.scrollY;
      if (depthRef.current) depthRef.current.textContent = String(Math.round(y * 1.7)).padStart(5, "0");
      if (navRef.current) {
        navRef.current.classList.toggle("is-solid", y > 40);
        if (Math.abs(y - lastY) > 6) navRef.current.classList.toggle("is-hidden", y > lastY && y > 400);
      }
      lastY = y;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;
    lockScroll(open);
    if (open) {
      gsap.fromTo(menuRef.current, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.9, ease: "expo.inOut" });
      gsap.fromTo(menuRef.current.querySelectorAll(".menu-item"), { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.8, delay: 0.35, ease: "expo.out" });
    }
  }, [open]);

  const section = (e: MouseEvent, hash: string) => {
    e.preventDefault();
    setOpen(false);
    if (loc === "/") scrollToEl(hash);
    else {
      pending.hash = hash;
      goTo("/");
    }
  };

  return (
    <>
      <header ref={navRef} className="nav">
        <InkLink href="/" className="nav-logo" cursor="HOME" ariaLabel="OCTOPUS home">
          <img src="/img/logo.webp" alt="OCTOPUS" />
        </InkLink>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <a key={l.hash} href={"/" + l.hash} onClick={(e) => section(e, l.hash)} className="nav-link">
              <span data-text={l.label}>{l.label}</span>
            </a>
          ))}
          <InkLink href="/lab-reports" className="nav-link"><span data-text="Lab Results">Lab Results</span></InkLink>
          <InkLink href="/contact" className="nav-link"><span data-text="Contact">Contact</span></InkLink>
          <InkLink href="/contact?type=Wholesale" className="nav-link nav-cta">Wholesale inquiry</InkLink>
        </nav>
        <div className="nav-depth" aria-hidden>
          <i />DEPTH <span ref={depthRef}>00000</span>m
        </div>
        <button className={"burger" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <i /><i /><i />
        </button>
      </header>

      <div ref={menuRef} className={"menu" + (open ? " is-open" : "")} aria-hidden={!open}>
        <div className="menu-inner">
          {LINKS.map((l) => (
            <div className="menu-mask" key={l.hash}>
              <a href={"/" + l.hash} className="menu-item" onClick={(e) => section(e, l.hash)}>{l.label}</a>
            </div>
          ))}
          <div className="menu-mask"><InkLink href="/lab-reports" className="menu-item" onClick={() => setOpen(false)}>Lab Results</InkLink></div>
          <div className="menu-mask"><InkLink href="/contact" className="menu-item" onClick={() => setOpen(false)}>Contact</InkLink></div>
          <div className="menu-mask"><InkLink href="/contact?type=Wholesale" className="menu-item menu-item-cta" onClick={() => setOpen(false)}>Wholesale</InkLink></div>
          <p className="menu-sub">Blue Lotus flavors</p>
          <div className="menu-flavors">
            {FLAVORS.map((f) => (
              <InkLink key={f.slug} href={`/flavors/${f.slug}`} color={f.color} className="menu-dot" onClick={() => setOpen(false)} ariaLabel={f.name}>
                <i style={{ background: f.color }} />
                {f.name}
              </InkLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
