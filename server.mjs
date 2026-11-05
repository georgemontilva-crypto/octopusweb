// Minimal production server: serves the Vite build (SPA fallback) + POST /api/contact.
// Optional env: RESEND_API_KEY, CONTACT_TO (destination email), CONTACT_FROM (verified sender).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const hits = new Map(); // naive rate limit per IP

function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

async function handleContact(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 5) return send(res, 429, { error: "Too many messages, try again later." });
  list.push(now);
  hits.set(ip, list);

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) return send(res, 413, { error: "Message too long." });
  }
  let d;
  try {
    d = JSON.parse(raw || "{}");
  } catch {
    return send(res, 400, { error: "Invalid request." });
  }
  if (d.website) return send(res, 200, { ok: true });
  const name = String(d.name || "").trim().slice(0, 120);
  const email = String(d.email || "").trim().slice(0, 160);
  const message = String(d.message || "").trim().slice(0, 3000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return send(res, 400, { error: "Please fill in your name, a valid email and a message." });
  const entry = { type: String(d.type || "General").slice(0, 30), name, email, business: String(d.business || "").slice(0, 160), location: String(d.location || "").slice(0, 160), message };
  console.log("[contact]", JSON.stringify(entry));

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO;
  if (key && to) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || "OCTOPUS Web <onboarding@resend.dev>",
          to: to.split(",").map((s) => s.trim()),
          reply_to: email,
          subject: `[OCTOPUS · ${entry.type}] ${name}`,
          html: `<h2>New ${esc(entry.type)} message</h2><p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Business:</b> ${esc(entry.business)}<br><b>Location:</b> ${esc(entry.location)}</p><p>${esc(message).replace(/\n/g, "<br>")}</p>`,
        }),
      });
      if (!r.ok) console.error("[contact] resend failed", r.status, await r.text());
    } catch (e) {
      console.error("[contact] resend error", e);
    }
  }
  send(res, 200, { ok: true });
}

function serveFile(res, file, cache) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Cache-Control": cache ? "public, max-age=31536000, immutable" : "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://x");
    if (url.pathname === "/api/contact") {
      if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
      return await handleContact(req, res);
    }
    if (url.pathname === "/health") return send(res, 200, { ok: true });
    const safe = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const file = path.join(DIST, safe);
    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      return serveFile(res, file, safe.startsWith("/assets/"));
    }
    if (path.extname(safe)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    fs.createReadStream(path.join(DIST, "index.html")).pipe(res);
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end("Server error");
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`OCTOPUS web listening on :${PORT}`));
