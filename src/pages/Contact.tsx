import { useEffect, useRef, useState, type FormEvent } from "react";
import { ScrollTrigger } from "../lib/motion";
import { inkPulse, resetTint } from "../lib/theme";
import { useSeo } from "../lib/seo";
import { useEntered } from "../App";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  useSeo("Contact & Wholesale · OCTOPUS", "Get in touch with OCTOPUS — wholesale, distribution and general questions.");
  const root = useRef<HTMLDivElement>(null);
  const entered = useEntered();
  const params = new URLSearchParams(window.location.search);
  const product = params.get("product") || "";
  const [type, setType] = useState(["Wholesale", "Distribution", "General"].includes(params.get("type") || "") ? params.get("type")! : "Wholesale");
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    resetTint();
    if (!entered) return;
    setTimeout(() => ScrollTrigger.refresh(), 200);
  }, [entered]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    if (body.website) return; // honeypot
    setStatus("sending");
    setErr("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, type }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong");
      setStatus("sent");
      const b = (e.target as HTMLElement).getBoundingClientRect();
      inkPulse(b.left + b.width / 2, b.top + b.height / 2);
    } catch (x) {
      setStatus("error");
      setErr((x as Error).message);
    }
  };

  return (
    <div ref={root} className="page ct">
      <header className="page-head">
        <p className="kicker">Say hi from the surface</p>
        <h1 className="page-title section-title">
          <span className="ln-mask"><span className="ln">Contact</span></span>
          <span className="ln-mask"><span className="ln drip">&amp; wholesale</span></span>
        </h1>
        <p className="section-lead">Retailers, distributors, or just curious — drop us a line and the crew will get back to you. We don't sell online; find OCTOPUS at participating retailers (21+ only).</p>
      </header>

      {status === "sent" ? (
        <div className="ct-done">
          <img src="/img/logo.webp" alt="" />
          <h2>Message received.</h2>
          <p>It's sinking to the bottom of our inbox as we speak. We'll get back to you soon.</p>
          <button className="btn btn-ghost" onClick={() => setStatus("idle")}>Send another</button>
        </div>
      ) : (
        <form className="ct-form" onSubmit={submit}>
          <div className="ct-types" role="radiogroup" aria-label="Topic">
            {["Wholesale", "Distribution", "General"].map((t) => (
              <button type="button" key={t} role="radio" aria-checked={type === t} className={"ct-type" + (type === t ? " is-on" : "")} onClick={() => setType(t)}>
                {t}
              </button>
            ))}
          </div>
          <label className="field"><input name="name" required placeholder=" " maxLength={120} /><span>Your name</span></label>
          <label className="field"><input name="email" type="email" required placeholder=" " maxLength={160} /><span>Email</span></label>
          {type !== "General" && (
            <>
              <label className="field"><input name="business" placeholder=" " maxLength={160} /><span>Business name</span></label>
              <label className="field"><input name="location" placeholder=" " maxLength={160} /><span>City / State</span></label>
            </>
          )}
          <label className="field field-area"><textarea name="message" required placeholder=" " rows={5} maxLength={3000} defaultValue={product ? `I am interested in carrying ${product}.` : ""} /><span>Message</span></label>
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden />
          <label className="ct-check"><input type="checkbox" required /> <span>I confirm I am 21 years of age or older.</span></label>
          {status === "error" && <p className="ct-err">{err}</p>}
          <button className="btn btn-glow ct-send" disabled={status === "sending"} data-cursor="SEND">
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
