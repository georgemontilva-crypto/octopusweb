import { useEffect } from "react";
import { FLAVORS, type Flavor } from "../data";
import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";
import { smUrl } from "../lib/img";

const CATS = [
  { id: "pre", title: "Blue Lotus Pre-Rolls", col: "Pre-Roll 2G", img: (f: Flavor) => f.tube },
  { id: "dabs", title: "Blue Lotus Dabs", col: "Dabs 2.5G · tall box + small box", img: (f: Flavor) => f.dabs },
];

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
          {CATS.map((c) => (
            <div key={c.id} className="lab-block">
              <h2 className="h3 lab-line">{c.title}</h2>
              <div className="lab-table" role="table" aria-label={`${c.title} lab reports`}>
                <div className="lab-row lab-row-head" role="row">
                  <span role="columnheader">Flavor</span><span role="columnheader">{c.col}</span>
                </div>
                {FLAVORS.map((f) => (
                  <div className="lab-row" role="row" key={c.id + f.slug}>
                    <span role="cell" className="lab-flavor">
                      <img src={smUrl(c.img(f))} alt="" loading="lazy" className={"lab-img-" + c.id} />
                      <InkLink href={`/products/${f.slug}${c.id === "dabs" ? "?format=dabs" : ""}`}><b>{f.name}</b></InkLink>
                    </span>
                    <span role="cell" className="lab-status">Coming soon</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="fine">Questions about a batch? <InkLink href="/contact" className="link-arrow">Contact us →</InkLink></p>
        </div>
      </section>
    </>
  );
}
