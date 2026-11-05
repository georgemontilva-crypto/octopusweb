import { useEffect } from "react";
import Hero from "../sections/Hero";
import Manifesto from "../sections/Manifesto";
import Flavors from "../sections/Flavors";
import Lines from "../sections/Lines";
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
  useSeo("OCTOPUS — From the Deep", "OCTOPUS — bold botanical blends pulled up from the deep. Discover our product lines, including Blue Lotus pre-rolls and dabs. 21+.");
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
        <Marquee items={["OCTOPUS", "From the deep", "Eight arms", "Bold flavor", "21+ only"]} />
        <Marquee reverse className="marquee-alt" items={["Blue Dreamz", "Royal Haze", "Purple Paradise", "Midnight Lotus", "Cloud 9", "Egyptian Nights"]} />
      </div>
      <Manifesto />
      <Lines />
      <Flavors />
      <Formats />
      <Collection />
      <Botanicals />
      <LabCta />
      <WholesaleCta />
    </>
  );
}
