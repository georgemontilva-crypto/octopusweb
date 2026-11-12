import { useEffect, useRef, type ReactNode, type ElementType } from "react";

/** Short, subtle fade-up when an element enters the viewport (content is never hidden for long). */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0 }: { children: ReactNode; as?: ElementType; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add("is-in");
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={"reveal " + className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
