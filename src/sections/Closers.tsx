import { useEffect, useRef } from "react";
import { InkLink } from "../components/Transition";
import { Magnetic } from "../components/Fx";
import { gsap } from "../lib/motion";

export function LabCta() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".lab-copy > *", { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
      gsap.from(".sonar", { scale: 0.5, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="lab">
      <div className="sonar" aria-hidden>
        <div className="sonar-sweep" />
        <i className="ping p1" /><i className="ping p2" /><i className="ping p3" />
        <svg viewBox="0 0 40 40" className="sonar-qr">
          <path d="M4 4h12v12H4zM7 7v6h6V7zM24 4h12v12H24zM27 7v6h6V7zM4 24h12v12H4zM7 27v6h6v-6zM20 4h2v4h-2zM20 10h2v2h-2zM24 20h4v2h-4zM30 20h6v2h-6zM20 20h2v6h-2zM24 24h2v6h-2zM28 28h8v2h-8zM28 32h2v4h-2zM32 32h4v4h-4zM20 30h2v6h-2zM4 20h6v2H4zM12 20h4v2h-4z" />
        </svg>
      </div>
      <div className="lab-copy">
        <p className="kicker">Transparency, from the bottom up</p>
        <h2 className="section-title small">Lab results.<br /><span className="outline">Out in the open.</span></h2>
        <p className="section-lead">Scan the QR code on your OCTOPUS pack to see its lab results and product info — or browse reports by line and flavor.</p>
        <Magnetic><InkLink href="/lab-reports" className="btn btn-glow" cursor="SCAN">View lab results</InkLink></Magnetic>
      </div>
    </section>
  );
}

export function WholesaleCta() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".ws-big", { xPercent: 30 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.from(".ws-body > *", { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="ws">
      <div className="ws-big" aria-hidden>RELEASE THE OCTOPUS · RELEASE THE OCTOPUS ·</div>
      <div className="ws-body">
        <p className="kicker">Retailers & distributors</p>
        <h2 className="section-title small">Put the octopus<br /><span className="drip">on your shelf</span></h2>
        <p className="section-lead">Countertop displays that glow from across the store. Ask us about wholesale pricing and the full OCTOPUS catalog.</p>
        <Magnetic><InkLink href="/contact" className="btn btn-glow" cursor="LET'S TALK">Become a retailer</InkLink></Magnetic>
      </div>
      <div className="ws-displays">
        <img src="/img/p/lineup-blue.webp" alt="OCTOPUS Blue Lotus 6-flavor dabs display" loading="lazy" className="ws-d1" />
        <img src="/img/p/purple-paradise-disp.webp" alt="OCTOPUS pre-roll 20-pack display" loading="lazy" className="ws-d2" />
      </div>
    </section>
  );
}
