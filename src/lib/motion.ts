import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { reducedMotion } from "./theme";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export let lenis: Lenis | null = null;
export const scrollState = { velocity: 0 };

export function initSmoothScroll() {
  if (lenis) return lenis;
  if (reducedMotion()) return null;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", (e: { velocity: number }) => {
    scrollState.velocity = e.velocity;
    ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToEl(sel: string) {
  const el = document.querySelector(sel) as HTMLElement | null;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export function lockScroll(lock: boolean) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.classList.toggle("is-locked", lock);
}

/** split text into spans of words or chars (keeps it accessible via aria-label on parent) */
export function splitChars(text: string) {
  return text.split("").map((c, i) => ({ c: c === " " ? " " : c, i }));
}

export { gsap, ScrollTrigger };
