import { useEffect } from "react";
import { FLAVORS } from "../data";
import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";
import { smUrl } from "../lib/img";

export default function LabReports() {
  useSeo("Lab Report · OCTOPUS", "Lab reports for OCTOPUS products, by line and flavor.");
  useEffect(() => resetTint(), []);
  return (
    <>
      <header className="page-hero wrap">
        <p className="eyebrow">Lab report</p>
        <h1 className="display">Tested, <em>batch by batch.</em></h1>
        <p className="lead">Scan the QR code on your OCTOPUS pack, or find your product below. Certificates are being published batch by batch.</p>
      </header>
      <section className="sec sec-tight">
        <div className="wrap">
          <h2 className="h3 lab-line">Blue Lotus</h2>
          <div className="lab-table" role="table" aria-label="Blue Lotus lab reports">
            <div className="lab-row lab-row-head" role="row">
              <span role="columnheader">Flavor</span><span role="columnheader">Pre-Roll 2G</span><span role="columnheader">Dabs 2.5G</span>
            </div>
            {FLAVORS.map((f) => (
              <div className="lab-row" role="row" key={f.slug}>
                <span role="cell" className="lab-flavor">
                  <img src={smUrl(f.tube)} alt="" loading="lazy" />
                  <InkLink href={`/products/${f.slug}`}><b>{f.name}</b></InkLink>
                </span>
                <span role="cell" className="lab-status">Coming soon</span>
                <span role="cell" className="lab-status">Coming soon</span>
              </div>
            ))}
          </div>
          <p className="fine">Questions about a batch? <InkLink href="/contact" className="link-arrow">Contact us →</InkLink></p>
        </div>
      </section>
    </>
  );
}
