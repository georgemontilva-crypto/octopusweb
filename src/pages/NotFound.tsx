import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";

export default function NotFound() {
  useSeo("Not found · OCTOPUS");
  return (
    <div className="wrap page-hero nf">
      <p className="eyebrow">404</p>
      <h1 className="display">Lost <em>at sea.</em></h1>
      <p className="lead">This page doesn't exist.</p>
      <InkLink href="/" className="btn btn-primary">Back home</InkLink>
    </div>
  );
}
