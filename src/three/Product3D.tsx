import { useEffect, useRef, useState } from "react";
import type { Kind, Ctrl } from "./stage";
import type { Flavor } from "../data";
import { srcSet } from "../lib/img";
import { isTouch } from "../lib/theme";

type Props = {
  flavor: Flavor;
  kind: Kind;
  className?: string;
  fill?: number;
  sway?: number;
  yaw?: number;
  phase?: number;
  spin?: boolean;
  label?: string;
  pop?: boolean;
  tentacles?: boolean;
  ctrl?: Ctrl;
  live?: boolean;
};

/** Start downloading the 3D engine early (e.g. while the intro is on screen). */
export const preload3D = () => import("./stage");

/** In-page slot: the 3D engine paints a real 3D product into a canvas inside this element. */
export default function Product3D({ flavor, kind, className = "", fill, sway, yaw, phase, spin, label, pop, tentacles, ctrl, live }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // dabs fall back to the display-box photo if a flavor has no box textures
  const has3D = kind === "tube" || kind === "cube" || !!flavor.tex.front;

  useEffect(() => {
    if (!has3D || !ref.current) return;
    let off: (() => void) | undefined;
    let dead = false;
    preload3D().then(({ stage }) => {
      if (dead || !ref.current) return;
      off = stage.add(ref.current, {
        kind,
        color: flavor.color,
        tex: flavor.tex,
        fill,
        sway,
        spin,
        yaw: yaw ?? (kind === "tube" ? 0 : -0.5),
        phase,
        pop,
        tentacles,
        ctrl,
        live,
      });
      if (stage.failed) setFailed(true);
    });
    return () => {
      dead = true;
      off?.();
    };
  }, [flavor, kind, fill, sway, yaw, phase, spin, has3D, pop, tentacles, ctrl, live]);

  const photo = !has3D ? flavor.box : failed ? (kind === "tube" ? flavor.tube : kind === "cube" ? flavor.box : flavor.tall) : null;
  const canDrag = has3D && !failed && !isTouch() && !ctrl;
  return (
    <div
      ref={ref}
      className={"p3d " + (canDrag ? "is-drag " : "") + className}
      role="img"
      aria-label={label ?? `${flavor.name} ${kind === "tube" ? "Pre-Roll 2G" : kind === "cube" ? "Dabs 2.5G small box" : "Dabs 2.5G tall box"}`}
      data-cursor={canDrag ? "DRAG" : undefined}
    >
      {photo && <img src={photo} srcSet={srcSet(photo)} sizes="(max-width: 900px) 60vw, 25vw" alt="" className="p3d-fallback" draggable={false} />}
    </div>
  );
}
