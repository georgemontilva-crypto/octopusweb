import { useState } from "react";
import { FLAVORS } from "../data";
import FlavorCard from "../components/FlavorCard";
import FormatToggle from "../components/FormatToggle";
import Reveal from "../components/Reveal";
import type { Kind } from "../three/stage";

export default function Collection({ title = "Six flavors.", eyebrow = "The Blue Lotus collection", id }: { title?: string; eyebrow?: string; id?: string }) {
  const [kind, setKind] = useState<Kind>("tube");
  return (
    <section className="sec" id={id}>
      <div className="wrap">
        <Reveal className="sec-head sec-head-row">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="h2">{title}</h2>
          </div>
          <FormatToggle kind={kind} onChange={setKind} />
        </Reveal>
        <div className="fgrid">
          {FLAVORS.map((f, k) => <FlavorCard key={kind + f.slug} f={f} kind={kind} index={k} />)}
        </div>
      </div>
    </section>
  );
}
