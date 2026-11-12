import { useEffect, useRef, type ReactNode } from "react";

type S = { id: string; x: number; y: number; r: number; node: ReactNode; cls?: string };

/** Stickers in the packaging style that can be dragged anywhere inside their parent. */
export default function Stickers({ items }: { items: S[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const all = Array.from(el.querySelectorAll<HTMLElement>(".sticker"));
    let z = 10;
    const offs: (() => void)[] = [];
    all.forEach((s) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
      const down = (e: PointerEvent) => {
        drag = true;
        s.setPointerCapture(e.pointerId);
        sx = e.clientX;
        sy = e.clientY;
        ox = parseFloat(s.dataset.dx || "0");
        oy = parseFloat(s.dataset.dy || "0");
        s.style.zIndex = String(++z);
        s.classList.add("is-lift");
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const dx = ox + e.clientX - sx, dy = oy + e.clientY - sy;
        s.dataset.dx = String(dx);
        s.dataset.dy = String(dy);
        s.style.translate = `${dx}px ${dy}px`;
      };
      const up = () => {
        drag = false;
        s.classList.remove("is-lift");
      };
      s.addEventListener("pointerdown", down);
      s.addEventListener("pointermove", move);
      s.addEventListener("pointerup", up);
      s.addEventListener("pointercancel", up);
      offs.push(() => {
        s.removeEventListener("pointerdown", down);
        s.removeEventListener("pointermove", move);
        s.removeEventListener("pointerup", up);
        s.removeEventListener("pointercancel", up);
      });
    });
    return () => offs.forEach((f) => f());
  }, []);
  return (
    <div ref={root} className="stickers" aria-hidden>
      {items.map((s) => (
        <div key={s.id} className={"sticker " + (s.cls || "")} style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.r}deg` }}>
          {s.node}
        </div>
      ))}
    </div>
  );
}
