import { useEffect, useMemo, useRef, useState } from "react";
import Product3D from "../three/Product3D";
import type { Ctrl, Kind } from "../three/stage";
import type { Flavor } from "../data";

const VIEWS = [
  { id: "front", label: "Front", yaw: 0 },
  { id: "side", label: "Side", yaw: Math.PI / 2 },
  { id: "back", label: "Back", yaw: Math.PI },
];

/** Apple-style product viewer: drag to rotate 360° (inside the viewer only), preset views, zoom. */
export default function Viewer({ flavor, kind }: { flavor: Flavor; kind: Kind }) {
  const ctrl = useMemo<Ctrl>(() => ({ yaw: kind === "tube" ? 0 : 0.5, pitch: 0.06, zoom: 1, progress: 0 }), [kind]);
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState("front");
  const [hint, setHint] = useState(true);
  const has3D = kind !== "box" || !!flavor.tex.front;

  useEffect(() => {
    const el = box.current;
    if (!el || !has3D) return;
    let down = false, lx = 0, ly = 0;
    const d = (e: PointerEvent) => {
      down = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
      setHint(false);
      el.classList.add("is-grab");
    };
    const m = (e: PointerEvent) => {
      if (!down) return;
      ctrl.yaw += (e.clientX - lx) * 0.012;
      ctrl.pitch = Math.max(-0.35, Math.min(0.45, ctrl.pitch + (e.clientY - ly) * 0.004));
      lx = e.clientX;
      ly = e.clientY;
      setView("");
    };
    const u = () => {
      down = false;
      el.classList.remove("is-grab");
    };
    const w = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 4) return;
      e.preventDefault();
      ctrl.zoom = Math.max(1, Math.min(2.2, ctrl.zoom - e.deltaY * 0.002));
      setZoom(ctrl.zoom);
    };
    el.addEventListener("pointerdown", d);
    el.addEventListener("pointermove", m);
    el.addEventListener("pointerup", u);
    el.addEventListener("pointercancel", u);
    el.addEventListener("wheel", w, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", d);
      el.removeEventListener("pointermove", m);
      el.removeEventListener("pointerup", u);
      el.removeEventListener("pointercancel", u);
      el.removeEventListener("wheel", w);
    };
  }, [ctrl, has3D]);

  const go = (id: string, yaw: number) => {
    // rotate the shortest way to the requested face
    const base = (kind === "box" ? 0 : 0) + yaw;
    const k = Math.round((ctrl.yaw - base) / (Math.PI * 2));
    ctrl.yaw = base + k * Math.PI * 2;
    ctrl.pitch = 0.06;
    setView(id);
  };
  const z = (d: number) => {
    ctrl.zoom = Math.max(1, Math.min(2.2, ctrl.zoom + d));
    setZoom(ctrl.zoom);
  };

  return (
    <div className="viewer" style={{ ["--c" as string]: flavor.color }}>
      <div ref={box} className={"viewer-box" + (has3D ? "" : " is-photo")}>
        <div className="viewer-glow" />
        <Product3D key={kind + flavor.slug} flavor={flavor} kind={kind} ctrl={has3D ? ctrl : undefined} live className="viewer-p" fill={0.82} />
        {has3D && hint && <span className="viewer-hint">↔ Drag to rotate</span>}
      </div>
      {has3D && (
        <div className="viewer-bar">
          <div className="seg seg-sm" role="group" aria-label="View">
            {VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? "is-on" : ""} onClick={() => go(v.id, v.yaw)}>{v.label}</button>
            ))}
          </div>
          <div className="zoom" role="group" aria-label="Zoom">
            <button onClick={() => z(-0.3)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => z(0.3)} disabled={zoom >= 2.2} aria-label="Zoom in">+</button>
          </div>
        </div>
      )}
    </div>
  );
}
