import { useEffect, useRef, useState } from "react";
import { FLAVORS } from "../data";
import Product3D from "../three/Product3D";
import { InkLink } from "../components/Transition";
import { gsap, ScrollTrigger, lenis } from "../lib/motion";
import { resetTint, setTint } from "../lib/theme";

const N = FLAVORS.length;

/** Pinned, scroll-driven flavor showcase: every scroll step brings up the next flavor in 3D. */
export default function Currents() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [i, setI] = useState(0);
  const iRef = useRef(0);
  const f = FLAVORS[i];

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * N * 0.75,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          if (bar.current) bar.current.style.transform = `scaleY(${s.progress})`;
          const k = Math.min(N - 1, Math.floor(s.progress * N));
          if (k !== iRef.current) {
            iRef.current = k;
            setI(k);
          }
        },
        onToggle: (s) => {
          if (s.isActive) setTint(FLAVORS[iRef.current].color, FLAVORS[iRef.current].color2);
          else resetTint();
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (st.current?.isActive) setTint(f.color, f.color2);
    const el = root.current;
    if (!el) return;
    gsap.fromTo(el.querySelectorAll(".cu-anim"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: "expo.out" });
  }, [f]);

  const jump = (k: number) => {
    const s = st.current;
    if (!s) return;
    const y = s.start + ((k + 0.5) / N) * (s.end - s.start);
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="pin-wrap">
      <section ref={root} className="cu" id="currents" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
        <div className="cu-glow" />
        <div className="cu-grid wrap">
          <nav className="cu-rail" aria-label="Blue Lotus flavors">
            <p className="kicker">Blue Lotus line</p>
            <ol>
              {FLAVORS.map((x, k) => (
                <li key={x.slug}>
                  <button className={k === i ? "is-on" : ""} style={{ ["--s" as string]: x.color }} onClick={() => jump(k)} aria-current={k === i}>
                    <em>{String(k + 1).padStart(2, "0")}</em>
                    <span>{x.name}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="cu-track"><div ref={bar} /></div>
          </nav>

          <div className="cu-stage">
            <div className="cu-floor" />
            <figure className="cu-item">
              <Product3D key={"b" + f.slug} flavor={f} kind="box" className="cu-p" fill={0.9} phase={1.2} />
              <figcaption>Dabs <b>2.5G</b></figcaption>
            </figure>
            <figure className="cu-item cu-item-tube">
              <Product3D key={"t" + f.slug} flavor={f} kind="tube" className="cu-p" fill={0.92} />
              <figcaption>Pre-Roll <b>2G</b></figcaption>
            </figure>
          </div>

          <div className="cu-info">
            <span className="cu-num cu-anim">{String(i + 1).padStart(2, "0")}<i>/06</i></span>
            <h2 className="cu-name cu-anim">{f.name}</h2>
            <p className="cu-vibe cu-anim">{f.vibe}</p>
            <ul className="notes cu-anim">
              {f.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <InkLink href={`/flavors/${f.slug}`} color={f.color} className="btn btn-flavor cu-anim" cursor="OPEN">
              Explore {f.name}
            </InkLink>
          </div>
        </div>
      </section>
    </div>
  );
}
