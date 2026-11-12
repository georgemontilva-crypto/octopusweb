type Kind = "tube" | "box";

export default function FormatToggle({ kind, onChange }: { kind: Kind; onChange: (k: Kind) => void }) {
  return (
    <div className="seg" role="radiogroup" aria-label="Format">
      <button role="radio" aria-checked={kind === "tube"} className={kind === "tube" ? "is-on" : ""} onClick={() => onChange("tube")}>Pre-Roll 2G</button>
      <button role="radio" aria-checked={kind === "box"} className={kind === "box" ? "is-on" : ""} onClick={() => onChange("box")}>Dabs 2.5G</button>
    </div>
  );
}
