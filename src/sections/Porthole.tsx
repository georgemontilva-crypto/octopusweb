import { useEffect, useRef, useState } from "react";
import Tentacles from "../components/Tentacles";
import Product3D from "../three/Product3D";
import { FLAVORS } from "../data";
import { scrollToEl } from "../lib/motion";
import { InkLink } from "../components/Transition";
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


  return (
    <section ref={root} className="ph" id="top" style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2 }}>
      <Tentacles active={entered} />
      <div className="ph-inner wrap">
        <div className="ph-port ph-fade">
          <div className="ph-water" />
          <div className="ph-caustics" />
          <Product3D key={f.slug} flavor={f} kind="tube" className="ph-p" fill={0.8} spin />
          <div className="ph-glass" />
          <div className="ph-rim">{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ ["--a" as string]: `${k * 45}deg` }} />)}</div>
        </div>
        <div className="ph-copy">
          <p className="ph-flavor ph-fade"><span>{f.name}</span> · {f.vibe}</p>
          <h1 className="ph-title ph-fade">Dive in.</h1>
          <p className="ph-sub ph-fade">
            <b>Blue Lotus</b> is our botanical line: dried blue lotus flower with herbal botanicals, in six flavors. Available as <b>2G pre-rolls</b> and <b>2.5G dabs</b>. No THC. 21+ only.
          </p>
          <div className="ph-ctas ph-fade">
            <button className="btn btn-glow" onClick={() => scrollToEl("#products")}>Explore products</button>
            <InkLink href="/contact?type=Wholesale" className="btn btn-ghost">Wholesale inquiry</InkLink>
          </div>
        </div>
      </div>
    </section>
  );
}
