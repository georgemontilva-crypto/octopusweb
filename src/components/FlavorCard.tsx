import Product3D from "../three/Product3D";
import { InkLink } from "./Transition";
import type { Flavor } from "../data";
import type { Kind } from "../three/stage";

export default function FlavorCard({ f, kind, index }: { f: Flavor; kind: Kind; index: number }) {
  return (
    <InkLink href={`/products/${f.slug}`} className="fcard" ariaLabel={`${f.name} — ${f.vibe}`}>
      <span className="fcard-stage" style={{ ["--c" as string]: f.color }}>
        <span className="fcard-light" aria-hidden />
        <Product3D flavor={f} kind={kind} className="fcard-p" fill={0.86} phase={index * 0.9} sway={0.4} />
        <span className="fcard-floor" aria-hidden />
      </span>
      <span className="fcard-body">
        <span className="fcard-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="fcard-name">{f.name}</span>
        <span className="fcard-vibe" style={{ color: f.color }}>{f.vibe}</span>
        <span className="fcard-notes">{f.notes.join(" · ")}</span>
      </span>
    </InkLink>
  );
}
