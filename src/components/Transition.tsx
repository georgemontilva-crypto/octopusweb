import { useEffect, type MouseEvent, type ReactNode } from "react";
import { useLocation } from "wouter";
import { ScrollTrigger } from "../lib/motion";

let nav: ((to: string) => void) | null = null;

/** Gives goTo() access to the router. */
export function NavBridge() {
  const [, navigate] = useLocation();
  useEffect(() => {
    nav = navigate;
  }, [navigate]);
  return null;
}

/** Plain, fast page change: new page at the top with a short fade (no full-screen transition). */
export function goTo(href: string) {
  if (!nav) return;
  if (href === window.location.pathname + window.location.search) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  nav(href);
  window.scrollTo(0, 0);
  const main = document.querySelector(".main");
  main?.classList.remove("page-in");
  void (main as HTMLElement | null)?.offsetWidth;
  main?.classList.add("page-in");
  setTimeout(() => ScrollTrigger.refresh(), 120);
}

type Props = { href: string; color?: string; className?: string; children: ReactNode; cursor?: string; onClick?: () => void; ariaLabel?: string };

export function InkLink({ href, className, children, onClick, ariaLabel }: Props) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onClick?.();
    goTo(href);
  };
  return (
    <a href={href} onClick={handle} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
