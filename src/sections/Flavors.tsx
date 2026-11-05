import { useEffect, useRef } from "react";
import { FLAVORS } from "../data";
import { Tilt } from "../components/Fx";
import { InkLink } from "../components/Transition";
import { gsap, ScrollTrigger } from "../lib/motion";
import { resetTint, setTint } from "../lib/theme";

export default function Flavors() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const tr = track.current!;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const dist = () => tr.scrollWidth - window.innerWidth;
        const tween = gsap.to(tr, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
            onLeave: resetTint,
            onLeaveBack: resetTint,
          },
        });
        gsap.utils.toArray<HTMLElement>(".fl-panel").forEach((p) => {
          const f = FLAVORS.find((x) => x.slug === p.dataset.slug)!;
          ScrollTrigger.create({
            trigger: p,
            containerAnimation: tween,
            start: "left 55%",
            end: "right 55%",
            onToggle: (s) => s.isActive && setTint(f.color, f.color2),
          });
          gsap.fromTo(p.querySelector(".fl-bg img"), { xPercent: -12 }, { xPercent: 12, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
          gsap.fromTo(p.querySelector(".fl-stage"), { xPercent: 30, rotate: 10 }, { xPercent: -30, rotate: -10, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
          gsap.fromTo(p.querySelectorAll(".fl-name .ln"), { yPercent: 100 }, { yPercent: 0, stagger: 0.1, ease: "expo.out", duration: 1.1, scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 70%", toggleActions: "play none none reverse" } });
        });
      });
      mm.add("(max-width: 899px)", () => {
        const panels = el.querySelectorAll<HTMLElement>(".fl-panel");
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const f = FLAVORS.find((x) => x.slug === (e.target as HTMLElement).dataset.slug)!;
                setTint(f.color, f.color2);
              }
            });
          },
          { root: tr, threshold: 0.6 },
        );
        panels.forEach((p) => io.observe(p));
        const onScroll = () => {
          const max = tr.scrollWidth - tr.clientWidth;
          if (bar.current) bar.current.style.transform = `scaleX(${max ? tr.scrollLeft / max : 0})`;
        };
        tr.addEventListener("scroll", onScroll, { passive: true });
        const st = ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", onLeave: resetTint, onLeaveBack: resetTint, onEnter: () => tr.dispatchEvent(new Event("scroll")) });
        return () => {
          io.disconnect();
          tr.removeEventListener("scroll", onScroll);
          st.kill();
        };
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="pin-wrap">
    <section ref={root} className="flv" id="flavors">
      <div className="flv-head">
        <span className="kicker">Pick your current</span>
        <div className="flv-progress"><div ref={bar} /></div>
        <span className="flv-hint">Scroll · Swipe →</span>
      </div>
      <div ref={track} className="flv-track">
        <article className="fl-intro">
          <p className="kicker">06 flavors · 2 formats</p>
          <h2 className="fl-intro-title">
            Six<br />
            <span className="drip">currents</span>
            <br />one abyss
          </h2>
          <p className="fl-intro-text">Every flavor has its own color, its own vibe, its own corner of the deep. Ride the current →</p>
        </article>
        {FLAVORS.map((f, i) => (
          <article key={f.slug} className="fl-panel" data-slug={f.slug} style={{ ["--c" as string]: f.color, ["--c2" as string]: f.color2, ["--ink" as string]: f.ink }}>
            <div className="fl-bg"><img src={f.art} alt="" loading="lazy" /></div>
            <div className="fl-index">
              {String(i + 1).padStart(2, "0")} <i>/ 06</i>
            </div>
            <h3 className="fl-name" aria-label={f.name}>
              {f.short.split("\n").map((l) => (
                <span className="ln-mask" key={l}><span className="ln">{l}</span></span>
              ))}
            </h3>
            <div className="fl-stage">
              <div className="fl-ring" />
              <div className="fl-ring fl-ring-2" />
              <Tilt max={18} className="fl-tilt">
                <img src={f.tube} alt={`${f.name} Blue Lotus 2G pre-roll`} className="fl-tube" loading="lazy" />
              </Tilt>
              <div className="fl-shadow" />
            </div>
            <div className="fl-info">
              <span className="vibe">{f.vibe}</span>
              <p className="fl-tag">{f.tagline}</p>
              <ul className="notes">
                {f.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
              <InkLink href={`/flavors/${f.slug}`} color={f.color} className="btn btn-flavor" cursor="DIVE IN">
                Dive into {f.name} →
              </InkLink>
            </div>
          </article>
        ))}
      </div>
    </section>
    </div>
  );
}
