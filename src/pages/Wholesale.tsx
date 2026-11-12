import { useEffect } from "react";
import LeadForm, { Field } from "../components/LeadForm";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";
import { srcSet } from "../lib/img";

const TYPES = ["Smoke shop", "Convenience store", "Dispensary / CBD store", "Distributor", "Online retailer", "Other"];
const PRODUCTS = ["Blue Lotus Pre-Rolls 2G (20-tube box)", "Blue Lotus Dabs 2.5G (tall box + small box)", "Blue Lotus Dabs 2.5G counter display (6 flavors)"];

export default function Wholesale() {
  useSeo("Wholesale · OCTOPUS", "Carry OCTOPUS in your store. Apply for wholesale pricing.");
  useEffect(() => resetTint(), []);
  const product = new URLSearchParams(window.location.search).get("product") || "";
  return (
    <div className="wrap form-page">
      <header className="form-intro">
        <p className="eyebrow">Wholesale</p>
        <h1 className="display">Carry <em>OCTOPUS.</em></h1>
        <p className="lead">Retailers and distributors: tell us about your business and we'll send wholesale pricing and availability.</p>
        <ul className="perks">
          <li><b>Counter-ready displays</b><span>Pre-rolls in 20-tube boxes. Dabs in a six-flavor counter display.</span></li>
          <li><b>Six flavors</b><span>One line, a full color range on the shelf.</span></li>
          <li><b>Lab tested</b><span>QR code on every pack links to lab results.</span></li>
        </ul>
        <div className="perk-media">
          <img src="/img/p/lineup-blue.webp" srcSet={srcSet("/img/p/lineup-blue.webp", 560, 1300)} sizes="(max-width: 900px) 90vw, 36vw" alt="OCTOPUS Blue Lotus displays" loading="lazy" />
        </div>
      </header>
      <LeadForm type="Wholesale" submitLabel="Apply for wholesale" done={<><h2 className="h2">Application received.</h2><p className="lead">Thanks — our wholesale team will contact you shortly.</p></>}>
        <Field name="business" label="Business name" required />
        <Field name="name" label="Contact name" required half />
        <Field name="phone" label="Phone" type="tel" half />
        <Field name="email" label="Email" type="email" required half />
        <Field name="location" label="City / State" required half />
        <label className="field">
          <span>Business type *</span>
          <select name="businessType" required defaultValue="">
            <option value="" disabled>Select…</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <fieldset className="field">
          <span>Products of interest</span>
          {PRODUCTS.map((p) => (
            <label className="check" key={p}><input type="checkbox" name="products" value={p} defaultChecked={product.includes("counter display") ? p.includes("counter display") : product.includes("Pre-Roll") ? p.includes("Pre-Roll") : product.includes("Dabs") ? p.startsWith("Blue Lotus Dabs 2.5G (") : !!product} /> <span>{p}</span></label>
          ))}
        </fieldset>
        <Field name="message" label="Anything else?" area defaultValue={product ? `Interested in ${product}.` : ""} />
      </LeadForm>
    </div>
  );
}
