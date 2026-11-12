import { useState, type FormEvent, type ReactNode } from "react";

type Status = "idle" | "sending" | "sent" | "error";

/** Posts to /api/contact. `type` tells the team what kind of request it is. */
export default function LeadForm({ type, children, submitLabel, done }: { type: string; children: ReactNode; submitLabel: string; done: ReactNode }) {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    fd.forEach((v, k) => {
      body[k] = body[k] ? `${body[k]}, ${v}` : String(v);
    });
    if (body.website) return; // honeypot
    setStatus("sending");
    setErr("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, type }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (x) {
      setStatus("error");
      setErr((x as Error).message);
    }
  };

  if (status === "sent")
    return (
      <div className="form-done">
        {done}
        <button className="btn btn-line" onClick={() => setStatus("idle")}>Send another</button>
      </div>
    );

  return (
    <form className="form" onSubmit={submit}>
      {children}
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden />
      <label className="check"><input type="checkbox" required /> <span>I confirm I am 21 years of age or older.</span></label>
      {status === "error" && <p className="form-err" role="alert">{err}</p>}
      <button className="btn btn-flavor form-send" disabled={status === "sending"}>{status === "sending" ? "Sending…" : submitLabel}</button>
    </form>
  );
}

export function Field({ name, label, type = "text", required, defaultValue, area, half }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string; area?: boolean; half?: boolean }) {
  return (
    <label className={"field" + (half ? " field-half" : "")}>
      <span>{label}{required && " *"}</span>
      {area ? (
        <textarea name={name} required={required} rows={5} maxLength={3000} defaultValue={defaultValue} />
      ) : (
        <input name={name} type={type} required={required} maxLength={160} defaultValue={defaultValue} />
      )}
    </label>
  );
}
