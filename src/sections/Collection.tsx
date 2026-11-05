import { useEffect, useRef } from "react";
import { FLAVORS } from "../data";
import { InkLink } from "../components/Transition";
import { gsap, scrollState } from "../lib/motion";

const ITEMS = FLAVORS.flatMap((f) => [
  { f, src: f.tube, kind: "tube" },
  { f, src: f.tall, kind: "tall" },
]);

export default function Collection() {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const rg = ring.current!;
    const items = Array.from(rg.querySelectorAll<HTMLElement>(".ring-item"));
    const N = items.length;
    let rot = 0, vel = 0, dragging = false, lastX = 0, R = 0, visible = false;
    let current = -1;
    let moved = 0;
    const layout = () => {
      R = Math.min(Math.max(window.innerWidth * 0.34, 130), 620);
    };
    layout();
    window.addEventListener("resize", layout);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      el.classList.add("is-drag");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      vel = dx * 0.25;
    };
    const up = () => {
      dragging = false;
      el.classList.remove("is-drag");
    };
    const stage = el.querySelector(".ring-stage") as HTMLElement;
    const clickGuard = (e: MouseEvent) => {
      if (moved > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    stage.addEventListener("click", clickGuard, true);
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const tick = () => {
      if (!visible) return;
      const sv = scrollState.velocity;
      rot += vel + 0.12 + sv * 0.04;
      vel *= dragging ? 0.6 : 0.94;
      let best = -1, bestZ = -2;
      items.forEach((it, i) => {
        const a = (i / N) * 360 + rot;
        const rad = (a * Math.PI) / 180;
        const z = Math.cos(rad);
        const x = Math.sin(rad) * R;
        const s = 0.62 + (z + 1) * 0.24;
        it.style.transform = `translate3d(${x}px, ${-z * 18}px, ${z * R * 0.5}px) rotateY(${a}deg) scale(${s})`;
        it.style.zIndex = String(Math.round((z + 1) * 100));
        it.style.opacity = String(0.25 + (z + 1) * 0.375);
        it.style.filter = `brightness(${0.35 + (z + 1) * 0.35}) saturate(${0.6 + (z + 1) * 0.3})`;
        if (z > bestZ) {
          bestZ = z;
          best = i;
        }
      });
      if (best !== current && label.current) {
        current = best;
        const it = ITEMS[best];
        label.current.textContent = `${it.f.name} · ${it.kind === "tube" ? "Pre-Roll 2G" : "Dabs 2.5G"}`;
        label.current.style.color = it.f.color;
      }
    };
    gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      gsap.from(".col-title .ln", { yPercent: 110, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      gsap.fromTo(".ring-stage", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 70%" } });
    }, el);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", layout);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("click", clickGuard, true);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="col">
      <h2 className="col-title section-title">
        <span className="ln-mask"><span className="ln">The full</span></span>
        <span className="ln-mask"><span className="ln drip">collection</span></span>
      </h2>
      <div className="ring-stage" data-cursor="DRAG">
        <div className="ring-floor" />
        <div ref={ring} className="ring">
          {ITEMS.map((it, i) => (
            <div className="ring-item" key={i}>
              <InkLink href={`/flavors/${it.f.slug}`} color={it.f.color} ariaLabel={it.f.name}>
                <img src={it.src} alt={`${it.f.name} ${it.kind === "tube" ? "pre-roll" : "dabs"}`} draggable={false} className={"ring-img ring-" + it.kind} />
              </InkLink>
            </div>
          ))}
        </div>
      </div>
      <div ref={label} className="ring-label" aria-live="polite" />
      <p className="ring-hint">Drag to spin · Tap to dive in</p>
    </section>
  );
}
