import { useEffect, useRef, useState } from "react";
import type { Kind } from "./stage";
import type { Flavor } from "../data";
import { srcSet } from "../lib/img";

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

/** Start downloading the 3D engine early (e.g. while the intro is on screen). */
export const preload3D = () => import("./stage");

/** A DOM slot where the shared WebGL stage renders a real 3D product. Falls back to the photo. */
export default function Product3D({ flavor, kind, className = "", drag = true, fill, sway, yaw, phase, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // Royal Haze has no tall-box photo: fall back to the display-box photo for dabs
  const has3D = kind === "tube" || !!flavor.tex.front;

  useEffect(() => {
    if (!has3D || !ref.current) return;
    let off: (() => void) | undefined;
    let dead = false;
    preload3D().then(({ stage }) => {
      if (dead || !ref.current) return;
      off = stage.add(ref.current, {
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
      if (stage.failed) setFailed(true);
    });
    return () => {
      dead = true;
      off?.();
    };
  }, [flavor, kind, drag, fill, sway, yaw, phase, has3D]);

  const photo = !has3D ? flavor.box : failed ? (kind === "tube" ? flavor.tube : flavor.tall) : null;
  return (
    <div
      ref={ref}
      className={"p3d " + (drag && has3D && !failed ? "is-drag " : "") + className}
      role="img"
      aria-label={label ?? `${flavor.name} ${kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"}`}
      data-cursor={drag && has3D && !failed ? "DRAG" : undefined}
    >
      {photo && <img src={photo} srcSet={srcSet(photo)} sizes="(max-width: 900px) 70vw, 30vw" alt="" className="p3d-fallback" draggable={false} />}
    </div>
  );
}
