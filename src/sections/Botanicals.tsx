import { useEffect, useRef } from "react";
import { INGREDIENTS } from "../data";
import { gsap } from "../lib/motion";

const STAMPS = ["No THC", "No Hemp", "No Delta", "No Synthetics"];

export default function Botanicals() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.from(".bot-title .ln", { yPercent: 110, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      gsap.fromTo(".bot-core", { scale: 0.3, rotate: -90, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".bot-orbit", start: "top 80%" } });
      gsap.from(".bot-card", { y: 80, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".bot-orbit", start: "top 70%" } });
      gsap.fromTo(".stamp", { scale: 1.8, opacity: 0, rotate: () => gsap.utils.random(-30, 30) }, {
        scale: 1, opacity: 1, rotate: () => gsap.utils.random(-9, 9), stagger: 0.16, duration: 0.55, ease: "back.out(2.2)",
        scrollTrigger: { trigger: ".stamps", start: "top 85%" },
      });
      gsap.to(".bot-core-text", { rotate: 360, duration: 30, repeat: -1, ease: "none" });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bot" id="botanicals">
      <p className="kicker">Inside Blue Lotus</p>
      <h2 className="bot-title section-title">
        <span className="ln-mask"><span className="ln">Pure</span></span>
        <span className="ln-mask"><span className="ln outline">botanicals</span></span>
      </h2>
      <p className="section-lead">Four plants. Nothing synthetic. Every Blue Lotus product is built on dried Blue Lotus flower and a smooth herbal base.</p>

      <div className="bot-orbit">
        <div className="bot-core">
          <svg viewBox="0 0 300 300" className="bot-core-text" aria-hidden>
            <defs>
              <path id="circ" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
            </defs>
            <text>
              <textPath href="#circ">NYMPHAEA CAERULEA ✺ BLUE LOTUS ✺ SACRED FLOWER OF THE NILE ✺ </textPath>
            </text>
          </svg>
          <div className="bot-lotus">
            <img src="/img/art/blue-dreamz.webp" alt="" loading="lazy" />
          </div>
        </div>
        {INGREDIENTS.map((ing, i) => (
          <div className={"bot-card bot-card-" + i} key={ing.name}>
            <span className="bot-num">0{i + 1}</span>
            <h3>{ing.name}</h3>
            <em>{ing.latin}</em>
            <p>{ing.text}</p>
          </div>
        ))}
      </div>

      <div className="stamps">
        {STAMPS.map((s) => (
          <span className="stamp" key={s}>{s}</span>
        ))}
      </div>
      <p className="bot-foot">Plus a food-grade binding agent. That's the whole list.</p>
    </section>
  );
}
