import { useEffect, useRef } from "react";
import { FLAVORS } from "../data";
import { InkLink } from "../components/Transition";
import { gsap, ScrollTrigger } from "../lib/motion";
import { resetTint } from "../lib/theme";
import { useSeo } from "../lib/seo";
import { useEntered } from "../App";
import { smUrl } from "../lib/img";

export default function LabReports() {
  useSeo("Lab Results · OCTOPUS", "Lab results for OCTOPUS products, by line and flavor.");
  const root = useRef<HTMLDivElement>(null);
  const entered = useEntered();
  useEffect(() => {
    resetTint();
    if (!entered) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-title .ln", { yPercent: 110, stagger: 0.1, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from(".lr-card", { y: 80, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", delay: 0.4 });
    }, root.current!);
    setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => ctx.revert();
  }, [entered]);

  return (
    <div ref={root} className="page">
      <header className="page-head">
        <p className="kicker">Transparency</p>
        <h1 className="page-title section-title">
          <span className="ln-mask"><span className="ln">Lab</span></span>
          <span className="ln-mask"><span className="ln outline">results</span></span>
        </h1>
        <p className="section-lead">Scan the QR code on your pack, or find your product line and flavor below. Certificates are being uploaded batch by batch.</p>
      </header>
      <h2 className="lr-line">Blue Lotus <span>· Pre-Roll 2G &amp; Dabs 2.5G</span></h2>
      <div className="lr-grid">
        {FLAVORS.map((f) => (
          <article key={f.slug} className="lr-card" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
            <div className="lr-art"><img src={smUrl(f.art)} alt="" loading="lazy" /></div>
            <img src={f.tube} alt="" className="lr-tube" loading="lazy" />
            <div className="lr-body">
              <h2>{f.name}</h2>
              <ul>
                <li><span>Pre-Roll 2G</span><em>Coming soon</em></li>
                <li><span>Dabs 2.5G</span><em>Coming soon</em></li>
              </ul>
              <InkLink href={`/flavors/${f.slug}`} color={f.color} className="lr-link">View flavor →</InkLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
