# OCTOPUS · Blue Lotus — brand site

An informational brand website for **OCTOPUS Blue Lotus**: botanical pre-rolls (2G) and dabs (2.5G) in six flavors. There is no store, cart or checkout.

## Stack
- React 19 + Vite + TypeScript
- GSAP (ScrollTrigger) + Lenis for smooth scrolling and scroll-driven animation
- Raw WebGL fragment shader for the "abyss" background (caustics, light rays, bubbles, bioluminescence) with adaptive resolution
- Canvas 2D procedural tentacles (FABRIK inverse kinematics) that follow the cursor
- `server.mjs`: a dependency-free Node server that serves `dist/` (SPA fallback) and `POST /api/contact`

## Pages
- `/` — hero with tentacles, manifesto, horizontal flavor scroll, formats, 3D collection ring, botanicals, lab, wholesale
- `/flavors/:slug` — one page per flavor (6)
- `/lab-reports` — lab results by flavor ("coming soon" for now)
- `/contact` — contact / wholesale form

## Local development
```bash
npm install
npm run dev        # http://localhost:5173  (the contact form only works with npm start)
npm run build && npm start   # http://localhost:3000
```

## Railway
Deploys as-is (`railway.json`): build `npm ci && npm run build`, start `npm start`, healthcheck `/health`. No database.

### Environment variables (all optional)
| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact-form messages by email via Resend |
| `CONTACT_TO` | Destination email(s), comma-separated |
| `CONTACT_FROM` | Sender address on a domain verified in Resend (e.g. `OCTOPUS <hello@yourdomain.com>`) |

Without these variables the form still responds OK and each message is printed to the Railway logs (`[contact] ...`).

## Editing content
All flavors, descriptions, aroma notes, formats and the legal disclaimer live in `src/data.ts`.
Images are in `public/img/` (`p/` = background-removed products, `art/` = packaging artwork).
