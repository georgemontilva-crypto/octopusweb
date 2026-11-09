import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useLocation } from "wouter";
import { gsap, scrollToTop, ScrollTrigger } from "../lib/motion";
import { inkPulse } from "../lib/theme";

let overlayEl: HTMLDivElement | null = null;
let busy = false;
let nav: ((to: string) => void) | null = null;

export function InkOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  useEffect(() => {
    overlayEl = ref.current;
    nav = navigate;
  }, [navigate]);
  return (
    <div ref={ref} className="ink-wipe" aria-hidden>
      <img src="/img/logo.webp" alt="" className="ink-wipe-logo" />
    </div>
  );
}

export function goTo(href: string, x = window.innerWidth / 2, y = window.innerHeight / 2, color = "#7b3cff") {
  if (busy || !overlayEl || !nav) return;
  if (href === window.location.pathname) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  busy = true;
  const el = overlayEl;
  el.style.setProperty("--wc", color);
  el.style.pointerEvents = "auto";
  inkPulse(x, y);
  const logo = el.querySelector(".ink-wipe-logo");
  gsap.set(el, { clipPath: `circle(0% at ${x}px ${y}px)`, visibility: "visible" });
  gsap.set(logo, { scale: 0.6, opacity: 0, rotate: -20 });
  const tl = gsap.timeline();
  tl.to(el, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.75, ease: "power3.in" })
    .to(logo, { scale: 1, opacity: 1, rotate: 0, duration: 0.45, ease: "back.out(2)" }, "-=0.2")
    .add(() => {
      nav!(href);
      scrollToTop();
    })
    .add(() => ScrollTrigger.refresh(), "+=0.15")
    .to(logo, { scale: 1.4, opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.1")
    .to(el, {
      clipPath: `circle(0% at 50% 100%)`,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        el.style.pointerEvents = "none";
        gsap.set(el, { visibility: "hidden" });
        busy = false;
      },
    }, "-=0.15");
}

type Props = { href: string; color?: string; className?: string; children: ReactNode; cursor?: string; onClick?: () => void; ariaLabel?: string };

export function InkLink({ href, color, className, children, cursor, onClick, ariaLabel }: Props) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onClick?.();
    goTo(href, e.clientX, e.clientY, color);
  };
  return (
    <a href={href} onClick={handle} className={className} data-cursor={cursor} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
