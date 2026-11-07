import { useEffect, useRef } from "react";
import { stage, type Kind } from "./stage";
import type { Flavor } from "../data";

type Props = {
  flavor: Flavor;
  kind: Kind;
  className?: string;
  drag?: boolean;
  fill?: number;
  sway?: number;
  yaw?: number;
  phase?: number;
  label?: string;
};

/** A DOM slot where the shared WebGL stage renders a real 3D product. Falls back to the photo. */
export default function Product3D({ flavor, kind, className = "", drag = true, fill, sway, yaw, phase, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Royal Haze has no tall-box photo: fall back to the display-box photo for dabs
  const has3D = kind === "tube" || !!flavor.tex.front;

  useEffect(() => {
    if (!has3D || !ref.current) return;
    return stage.add(ref.current, {
      slug: flavor.slug,
      kind,
      color: flavor.color,
      tex: flavor.tex,
      drag,
      fill,
      sway,
      yaw: yaw ?? (kind === "box" ? -0.5 : 0),
      phase,
    });
  }, [flavor, kind, drag, fill, sway, yaw, phase, has3D]);

  return (
    <div
      ref={ref}
      className={"p3d " + (drag && has3D ? "is-drag " : "") + className}
      role="img"
      aria-label={label ?? `${flavor.name} ${kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"}`}
      data-cursor={drag && has3D ? "DRAG" : undefined}
    >
      {!has3D && <img src={flavor.box} alt="" className="p3d-fallback" draggable={false} />}
      {/* photo fallback for no-WebGL browsers */}
      {has3D && stage.failed && <img src={kind === "tube" ? flavor.tube : flavor.tall} alt="" className="p3d-fallback" />}
    </div>
  );
}
