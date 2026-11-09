import { useEffect, useRef, useState } from "react";
import Tentacles from "../components/Tentacles";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import { gsap, scrollToEl } from "../lib/motion";
import { setTint } from "../lib/theme";
import { useEntered } from "../App";

/** Hero: a ship porthole looking into the deep, a 3D tube turning inside, flavors cycling. */
export default function Porthole() {
  const entered = useEntered();
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const f = FLAVORS[i];

  useEffect(() => {
    if (!entered) return;
    setTint(f.color, f.color2);
  }, [f, entered]);

  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setI((x) => (x + 1) % FLAVORS.length), 4500);
    return () => clearInterval(t);
  }, [entered]);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => gsap.set(".ph-fade", { opacity: 0, y: 30 }), el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!entered) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".ph-port", { scale: 0.7, rotate: -25 }, { scale: 1, rotate: 0, duration: 1.6, ease: "elastic.out(1, 0.7)" });
      gsap.to(".ph-fade", { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: "power3.out", delay: 0.2 });
    }, root.current!);
    return () => ctx.revert();
  }, [entered]);

  return (
    <section ref={root} className="ph" id="top" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <Tentacles active={entered} />
      <div className="ph-inner wrap">
        <div className="ph-port ph-fade">
          <div className="ph-water" />
          <div className="ph-caustics" />
          {entered && <Product3D key={f.slug} flavor={f} kind="tube" className="ph-p" fill={0.8} spin />}
          <div className="ph-glass" />
          <div className="ph-rim">{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ ["--a" as string]: `${k * 45}deg` }} />)}</div>
        </div>
        <div className="ph-copy">
          <p className="ph-flavor ph-fade"><span>{f.name}</span> · {f.vibe}</p>
          <h1 className="ph-title ph-fade">Dive in.</h1>
          <p className="ph-sub ph-fade">Bold botanical blends from the deep. Strictly 21+.</p>
          <button className="btn btn-glow ph-fade" onClick={() => scrollToEl("#products")} data-cursor="DIVE">Explore products</button>
        </div>
      </div>
    </section>
  );
}
