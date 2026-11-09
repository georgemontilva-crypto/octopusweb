import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/** Native scrolling everywhere (no scroll smoothing / hijacking). We only track when the user is scrolling. */
export const scrollState = { velocity: 0, last: 0 };
if (typeof window !== "undefined") {
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      scrollState.velocity = y - lastY;
      lastY = y;
      scrollState.last = performance.now();
    },
    { passive: true },
  );
  window.addEventListener("touchmove", () => (scrollState.last = performance.now()), { passive: true });
}
/** true while the page is being scrolled (and ~150ms after) */
export const isScrolling = () => performance.now() - scrollState.last < 150;

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function scrollToEl(sel: string) {
  const el = document.querySelector(sel) as HTMLElement | null;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top, behavior: "smooth" });
}

export function lockScroll(lock: boolean) {
  document.documentElement.classList.toggle("is-locked", lock);
}

export { gsap, ScrollTrigger };
