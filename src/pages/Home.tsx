import InkHero from "../sections/InkHero";
import Collection from "../sections/Collection";
import PopTop from "../sections/PopTop";
import { DabsBand, WholesaleBand, InfoBand } from "../sections/Bands";
import { useSeo } from "../lib/seo";

export default function Home() {
  useSeo("OCTOPUS — From the Deep", "OCTOPUS — bold botanical blends. Discover Blue Lotus pre-rolls (2G) and dabs (2.5G) in six flavors. Strictly 21+.");
  return (
    <>
      <InkHero />
      <Collection id="collection" />
      <PopTop />
      <DabsBand />
      <WholesaleBand />
      <InfoBand />
    </>
  );
}
