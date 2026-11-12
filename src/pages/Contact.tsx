import { useEffect } from "react";
import LeadForm, { Field } from "../components/LeadForm";
import { InkLink } from "../components/Transition";
import { useSeo } from "../lib/seo";
import { resetTint } from "../lib/theme";

export default function Contact() {
  useSeo("Contact · OCTOPUS", "Contact OCTOPUS — questions about our products, lab reports or distribution.");
  useEffect(() => resetTint(), []);
  return (
    <div className="wrap form-page">
      <header className="form-intro">
        <p className="eyebrow">Contact</p>
        <h1 className="display">Say <em>hello.</em></h1>
        <p className="lead">Questions about our products, a lab report or anything else — write to us and the team will get back to you.</p>
        <div className="aside-card">
          <p className="eyebrow">Want to sell OCTOPUS?</p>
          <p>Retailers and distributors, use the wholesale application so we can prepare pricing for you.</p>
          <InkLink href="/wholesale" className="link-arrow">Go to wholesale →</InkLink>
        </div>
      </header>
      <LeadForm type="General" submitLabel="Send message" done={<><h2 className="h2">Message received.</h2><p className="lead">Thanks — we'll get back to you soon.</p></>}>
        <Field name="name" label="Name" required half />
        <Field name="email" label="Email" type="email" required half />
        <Field name="subject" label="Subject" />
        <Field name="message" label="Message" required area />
      </LeadForm>
    </div>
  );
}
