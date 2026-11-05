import { useEffect, useRef, useState } from "react";
import { FLAVORS, FORMATS } from "../data";
import { Tilt } from "../components/Fx";
import { gsap } from "../lib/motion";

function FormatCard({ fmt, idx }: { fmt: (typeof FORMATS)[number]; idx: number }) {
  const [sel, setSel] = useState(idx === 0 ? 0 : 2);
  const f = FLAVORS[sel];
  return (
    <article className="fmt-card" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <Tilt max={8} className="fmt-visual">
        <div className="fmt-holo" />
        <div className="fmt-art" key={"a" + f.slug}><img src={f.art} alt="" loading="lazy" /></div>
        <img key={f.slug} src={f[fmt.key]} alt={`${fmt.name} ${f.name}`} className={"fmt-img fmt-img-" + fmt.id} loading="lazy" />
        <span className="fmt-size">{fmt.size}</span>
      </Tilt>
      <div className="fmt-body">
        <p className="kicker">{fmt.kicker}</p>
        <h3 className="fmt-name">{fmt.name}</h3>
        <p className="fmt-text">{fmt.text}</p>
        <div className="fmt-swatches" role="radiogroup" aria-label="Flavor">
          {FLAVORS.map((x, i) => (
            <button
              key={x.slug}
              role="radio"
              aria-checked={i === sel}
              aria-label={x.name}
              className={"swatch" + (i === sel ? " is-on" : "")}
              style={{ ["--s" as string]: x.color }}
              onClick={() => setSel(i)}
              onMouseEnter={() => setSel(i)}
              data-cursor={x.name.toUpperCase()}
            />
          ))}
        </div>
        <p className="fmt-flavor"><b>{f.name}</b> · {f.vibe}</p>
        <p className="fmt-pack">Ships in a {fmt.pack}</p>
      </div>
    </article>
  );
}

export default function Formats() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fmt-title .ln", { yPercent: 110, stagger: 0.1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".fmt-title", start: "top 85%" } });
      gsap.utils.toArray<HTMLElement>(".fmt-card").forEach((c, i) => {
        gsap.from(c, { y: 140, opacity: 0, rotate: i ? 4 : -4, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 90%" } });
      });
    }, root.current!);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="fmt" id="products">
      <p className="kicker">Blue Lotus line</p>
      <h2 className="fmt-title section-title">
        <span className="ln-mask"><span className="ln">Two ways</span></span>
        <span className="ln-mask"><span className="ln outline">to go under</span></span>
      </h2>
      <div className="fmt-grid">
        {FORMATS.map((fmt, i) => <FormatCard key={fmt.id} fmt={fmt} idx={i} />)}
      </div>
    </section>
  );
}
