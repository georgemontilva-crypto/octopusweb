import { useEffect, useRef } from "react";
import { LINES } from "../data";
import { InkLink } from "../components/Transition";
import { gsap, scrollToEl } from "../lib/motion";
import { isTouch } from "../lib/theme";
import { smUrl } from "../lib/img";

/** Editorial index of OCTOPUS product lines. Hovering a row floats its image next to the cursor. */
export default function LinesIndex() {
  const root = useRef<HTMLElement>(null);
  const float = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      gsap.from(".li-row", { yPercent: 60, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 75%" } });
    }, el);
    if (isTouch()) return () => ctx.revert();
    const img = float.current!;
    const xTo = gsap.quickTo(img, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(img, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, []);

  const show = (src: string | null) => {
    const img = float.current;
    if (!img || isTouch()) return;
    if (src) {
      img.src = src;
      gsap.to(img, { opacity: 1, scale: 1, rotate: -4, duration: 0.5, ease: "back.out(2)" });
    } else gsap.to(img, { opacity: 0, scale: 0.6, rotate: 0, duration: 0.3 });
  };

  return (
    <section ref={root} className="li" id="lines">
      <img ref={float} className="li-float" alt="" aria-hidden />
      <header className="wrap li-head">
        <p className="kicker">The OCTOPUS family</p>
        <h2 className="li-title">Lines</h2>
      </header>
      <ul className="li-list wrap">
        {LINES.map((l, k) => (
          <li key={l.id}>
            <button className="li-row" onClick={() => scrollToEl("#currents")} onPointerEnter={() => show(l.image)} onPointerLeave={() => show(null)}>
              <em>{String(k + 1).padStart(2, "0")}</em>
              <img src={smUrl(l.image)} alt="" className="li-thumb" loading="lazy" />
              <b>{l.name}</b>
              <span className="li-meta">{l.formats.join(" · ")} · {l.flavors} flavors</span>
              <span className="li-status">Available</span>
            </button>
          </li>
        ))}
        <li>
          <InkLink href="/contact" className="li-row li-soon" cursor="ASK">
            <em>{String(LINES.length + 1).padStart(2, "0")}</em>
            <b>More lines</b>
            <span className="li-meta">Ask us about the full catalog</span>
            <span className="li-status is-soon">Surfacing soon</span>
          </InkLink>
        </li>
      </ul>
    </section>
  );
}
