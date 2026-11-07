import { useEffect, useRef } from "react";
import { FLAVORS } from "../data";
import Product3D from "../three/Product3D";
import { InkLink } from "../components/Transition";
import { gsap } from "../lib/motion";

export default function FlavorGrid({ exclude, title = "All six flavors", kicker = "Blue Lotus · Pre-Roll 2G" }: { exclude?: string; title?: string; kicker?: string }) {
  const root = useRef<HTMLElement>(null);
  const list = FLAVORS.filter((f) => f.slug !== exclude);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fg-card", { y: 80, opacity: 0, stagger: 0.07, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="fg">
      <header className="wrap sec-head">
        <p className="kicker">{kicker}</p>
        <h2 className="section-title small">{title}</h2>
      </header>
      <div className={"fg-grid wrap" + (list.length === 5 ? " is-five" : "")}>
        {list.map((f, k) => (
          <InkLink key={f.slug} href={`/flavors/${f.slug}`} color={f.color} className="fg-card" cursor="OPEN" ariaLabel={f.name}>
            <div className="fg-bg" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
              <img src={f.art} alt="" loading="lazy" />
            </div>
            <Product3D flavor={f} kind="tube" className="fg-p" drag={false} fill={0.86} sway={0.45} phase={k * 0.9} />
            <div className="fg-meta">
              <b>{f.name}</b>
              <span style={{ color: f.color }}>{f.vibe}</span>
            </div>
          </InkLink>
        ))}
      </div>
    </section>
  );
}
