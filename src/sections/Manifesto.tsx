import { useEffect, useRef } from "react";
import { gsap } from "../lib/motion";

const TEXT =
  "Eight arms. Six flavors. One sacred flower pulled up from the deep — Blue Lotus, the water lily of the ancient Nile, reborn as smoke and amber.";
const HOT = new Set(["Eight", "arms.", "Six", "flavors.", "Blue", "Lotus,"]);

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 0px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "+=180%", scrub: 1, pin: true, anticipatePin: 1 },
        });
        tl.fromTo(".mani-media", { clipPath: "circle(9% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", ease: "none", duration: 1 }, 0)
          .fromTo(".mani-media img", { scale: 1.5, rotate: -6 }, { scale: 1.05, rotate: 0, ease: "none", duration: 1 }, 0)
          .fromTo(".mani-word", { opacity: 0.12, y: 12 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.25, ease: "none" }, 0.05)
          .fromTo(".mani-kicker", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="pin-wrap">
    <section ref={root} className="mani" id="manifesto">
      <div className="mani-media">
        <img src="/img/art/abyss.webp" alt="" loading="lazy" />
        <div className="mani-media-shade" />
      </div>
      <div className="mani-inner">
        <p className="mani-kicker">— The legend</p>
        <p className="mani-text">
          {TEXT.split(" ").map((w, i) => (
            <span key={i} className={"mani-word" + (HOT.has(w) ? " is-hot" : "")}>
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
    </div>
  );
}
