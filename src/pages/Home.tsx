import { useEffect } from "react";
import Hero from "../sections/Hero";
import Collection from "../sections/Collection";
import Formats from "../sections/Formats";
import { WholesaleBand, InfoBand } from "../sections/Bands";
import { useSeo } from "../lib/seo";
import { ScrollTrigger } from "../lib/motion";

export default function Home() {
  useSeo("OCTOPUS — From the Deep", "OCTOPUS — bold botanical blends. Discover Blue Lotus pre-rolls (2G) and dabs (2.5G) in six flavors. Strictly 21+.");
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <Hero />
      <Collection id="collection" />
      <Formats />
      <WholesaleBand />
      <InfoBand />
    </>
  );
}
