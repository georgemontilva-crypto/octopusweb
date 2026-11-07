import { useEffect, useRef, useState } from "react";
import { FLAVORS } from "../data";
import Product3D from "../three/Product3D";
import { InkLink } from "../components/Transition";
import { gsap, ScrollTrigger } from "../lib/motion";
import { resetTint, setTint } from "../lib/theme";

export default function Showroom() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const f = FLAVORS[i];
  const active = useRef(false);

  useEffect(() => {
    if (active.current) setTint(f.color, f.color2);
  }, [f]);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.from(".sr-head > *", { y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      gsap.from(".sr-info > *", { y: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 60%" } });
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (s) => {
          active.current = s.isActive;
          if (s.isActive) setTint(FLAVORS[iRef.current].color, FLAVORS[iRef.current].color2);
          else resetTint();
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  const iRef = useRef(0);
  iRef.current = i;

  return (
    <section ref={root} className="sr" id="showroom" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <header className="sr-head wrap">
        <p className="kicker">Blue Lotus line</p>
        <h2 className="section-title small">Pick your flavor</h2>
      </header>
      <div className="sr-main wrap">
        <div className="sr-stage">
          <div className="sr-floor" />
          <figure className="sr-item">
            <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="sr-p sr-p-tube" fill={0.92} />
            <figcaption>Pre-Roll <b>2G</b></figcaption>
          </figure>
          <figure className="sr-item">
            <Product3D key={"b" + f.slug} flavor={f} kind="box" className="sr-p sr-p-box" fill={0.9} phase={1.1} />
            <figcaption>Dabs <b>2.5G</b></figcaption>
          </figure>
          <span className="sr-hint">Drag to rotate</span>
        </div>
        <div className="sr-info">
          <span className="sr-count">{String(i + 1).padStart(2, "0")} / 06</span>
          <h3 className="sr-name">{f.name}</h3>
          <p className="sr-vibe">{f.vibe}</p>
          <ul className="notes">
            {f.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <div className="sr-swatches" role="radiogroup" aria-label="Flavor">
            {FLAVORS.map((x, k) => (
              <button key={x.slug} role="radio" aria-checked={k === i} className={"sr-sw" + (k === i ? " is-on" : "")} style={{ ["--s" as string]: x.color }} onClick={() => setI(k)} data-cursor={x.name.toUpperCase()}>
                <i />
                <span>{x.name}</span>
              </button>
            ))}
          </div>
          <InkLink href={`/flavors/${f.slug}`} color={f.color} className="btn btn-flavor" cursor="OPEN">
            View {f.name} →
          </InkLink>
        </div>
      </div>
    </section>
  );
}
