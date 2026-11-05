import { useEffect } from "react";
import Hero from "../sections/Hero";
import Manifesto from "../sections/Manifesto";
import Flavors from "../sections/Flavors";
import Formats from "../sections/Formats";
import Collection from "../sections/Collection";
import Botanicals from "../sections/Botanicals";
import { LabCta, WholesaleCta } from "../sections/Closers";
import { Marquee } from "../components/Fx";
import { pending } from "../components/Nav";
import { resetTint } from "../lib/theme";
import { ScrollTrigger, scrollToEl } from "../lib/motion";
import { useSeo } from "../lib/seo";

export default function Home() {
  useSeo("OCTOPUS · Blue Lotus — From the Deep", "Botanical Blue Lotus pre-rolls (2G) and dabs (2.5G) in six flavors. No THC. No hemp. 21+.");
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
      <div className="marquees">
        <Marquee items={["No THC", "No Hemp", "No Delta", "100% Botanical", "Blue Lotus", "21+ Only"]} />
        <Marquee reverse className="marquee-alt" items={["Blue Dreamz", "Royal Haze", "Purple Paradise", "Midnight Lotus", "Cloud 9", "Egyptian Nights"]} />
      </div>
      <Manifesto />
      <Flavors />
      <Formats />
      <Collection />
      <Botanicals />
      <LabCta />
      <WholesaleCta />
    </>
  );
}
