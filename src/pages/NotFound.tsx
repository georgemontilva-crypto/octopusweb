import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";

export default function NotFound() {
  useSeo("Lost at sea · OCTOPUS");
  return (
    <div className="page nf">
      <h1 className="nf-code drip">404</h1>
      <p className="section-lead">You swam too deep. This page doesn't exist.</p>
      <InkLink href="/" className="btn btn-glow">Back to the surface</InkLink>
    </div>
  );
}
