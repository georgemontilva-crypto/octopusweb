import { useEffect } from "react";
import Hero from "../sections/Hero";
import Lines from "../sections/Lines";
import Showroom from "../sections/Showroom";
import FlavorGrid from "../sections/FlavorGrid";
import { Counter, LabStrip } from "../sections/Counter";
import { pending } from "../components/Nav";
import { resetTint } from "../lib/theme";
import { ScrollTrigger, scrollToEl } from "../lib/motion";
import { useSeo } from "../lib/seo";

export default function Home() {
  useSeo("OCTOPUS — From the Deep", "OCTOPUS — bold botanical blends pulled up from the deep. Explore our product lines. Strictly 21+.");
  useEffect(() => {
    resetTint();
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      if (pending.hash) {
        scrollToEl(pending.hash);
        pending.hash = "";
      }
    }, 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Hero />
      <Lines />
      <Showroom />
      <FlavorGrid />
      <Counter />
      <LabStrip />
    </>
  );
}
