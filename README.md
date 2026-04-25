# Live Intake

Real-time patient intake with a live staff dashboard.
Built with **Next.js 14 (App Router) · TailwindCSS · Socket.IO · react-hook-form + zod · TypeScript**.

**Live demo:** https://live-intake.onrender.com

- [`/patient`](https://live-intake.onrender.com/patient) — patient fills out the form
- [`/staff`](https://live-intake.onrender.com/staff) — staff watches every session update in real time
- [`/style`](https://live-intake.onrender.com/style) — style guide: color tokens, typography, components

Open `/patient` and `/staff` side by side to see the sync.

> **Note:** First request after ~15 min idle may take 30–60s (Render free tier cold start).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The app uses a **custom Next.js server** (`server.js`) so Socket.IO can attach
to the same HTTP listener as the Next.js handler.

### Production

```bash
npm run build
npm start
```

`PORT` is read from the environment (defaults to `3000`).

---

## Deployment

Because the app uses a long-lived WebSocket server, deploy to a platform that
supports persistent Node processes:

| Platform | Notes |
| -------- | ----- |
| **Render / Railway / Fly.io** | Recommended. Deploy as a Node web service. Build: `npm run build`. Start: `npm start`. Expose `$PORT`. |
| **Heroku** | Works. `Procfile`: `web: npm start`. |
| **Vercel** | Next.js pages render fine, but Vercel's serverless functions cannot keep a Socket.IO server alive. To deploy on Vercel, swap the transport in `src/lib/socket.ts` for a managed service (Pusher / Ably / Supabase Realtime). |

---

## Project structure

```
.
├── server.js                  # Custom Next.js + Socket.IO server
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx         # Header, fonts, locale provider
    │   ├── page.tsx           # Landing
    │   ├── globals.css        # Tailwind + reusable .ag-* utility classes
    │   ├── patient/page.tsx   # Hosts <PatientForm />
    │   ├── staff/page.tsx     # Hosts <StaffView />
    │   └── style/page.tsx     # Style guide reference
    ├── components/
    │   ├── PatientForm.tsx    # 4-step form, validation, live emits
    │   ├── StaffView.tsx      # Dashboard grid of session cards
    │   ├── DateField.tsx      # Custom date picker (popover calendar)
    │   ├── StatusBadge.tsx    # active / inactive / submitted pill
    │   ├── Header.tsx         # Sticky header + nav + language toggle
    │   └── AgnosMark.tsx      # Brand mark
    └── lib/
        ├── socket.ts          # Socket.IO client singletons (patient / staff)
        ├── i18n.tsx           # TH / EN dictionary + LocaleProvider
        ├── types.ts           # PatientData, PatientSession, PatientStatus
        └── validation.ts      # zod schema, single source of truth
```

---

## Design (UI/UX)

Two routes, one shared header — clean mental model and demo-friendly (open both
in two browser windows to see the sync).

### Responsive breakpoints

| Surface | Phone | Tablet (`sm`) | Desktop (`xl`) |
| ------- | ----- | ------------- | -------------- |
| Patient form card | `p-6`, single column | `p-7`, 2-column field grid | `p-10` |
| Stepper | Single-step view + 4 progress segments | Full pill row, jumpable | Full pill row |
| Staff dashboard grid | 1 card / row | 2 cards / row | 3 cards / row |
| Filter bar | 2×2 grid | Inline pill row | Inline pill row |
| Header brand | Mark only | Mark + name | Mark + name |

### Visual language

- **Palette:** teal-emerald primary (`#0d7d6f`), tinted paper canvas
  (`#f3f6f4`), saturated color reserved for status only.
- **Typography:** IBM Plex Sans Thai/Sans/Mono via `next/font/google` so Thai
  and Latin share weight equally.
- **Inputs:** uniform `.ag-input` style — focus ring is a 4px primary tint.
- **Status pills** (active / idle / submitted) use a distinct color + dot
  animation so a staff member can read them from across the room.

### Accessibility

- `aria-live="polite"` on save indicator and status pills.
- `aria-invalid` on form fields with errors.
- `aria-current="page"` on the active nav link.
- `aria-haspopup="dialog"` + `aria-expanded` on the date picker trigger.
- All animations sit behind `@media (prefers-reduced-motion: reduce)`.
- Color contrast meets WCAG AA on all text/background pairs.

---

## Component architecture

### `PatientForm`

Client component. Owns the form state via `react-hook-form` with a
`zodResolver`. Splits the 13 fields across **4 steps** (Identity → Contact →
Preferences → Emergency) with a stepper that:

- Locks the **Next** button until every required field in the current step is
  non-empty (cheap synchronous check; full zod runs on submit).
- Lets users jump back to any completed step.
- On submit failure, jumps to the first step with errors.

A `watch()` subscription pushes a debounced (`400ms`) `patient:update` to the
server on every change and drives a `saving / saved` indicator. On submit it
emits `patient:submit` and switches to a success panel with confetti.

### `StaffView`

Client component. Maintains a `Record<id, PatientSession>` keyed by socket id,
seeded from `sessions:snapshot` on join and updated by
`session:update` / `session:leave`. Sorts sessions by status (idle → active →
submitted) then by recency. Tracks the **last-changed field** by diffing
incoming updates against a shadow cache, so each card can show the freshest
edit with a blinking caret.

### `StatusBadge`

Pure presentational component that maps a `PatientStatus` to color + label +
dot animation.

### `DateField`

Custom date picker with a popover calendar — month/year dropdowns for fast
navigation (helpful for elderly patients), localized weekday and month labels,
keyboard `Esc` to close, click-outside to dismiss, and `max` to disable future
dates.

### `lib/socket.ts`

Returns process-wide singleton clients so HMR and route navigation don't spawn
duplicate connections. Role is sent in the handshake query
(`role=patient|staff`) and the server routes on it.

### `lib/i18n.tsx`

Single TH/EN dictionary + `LocaleProvider` (Context). Choice persists in
`localStorage`. Toggle lives in the header.

### `lib/validation.ts`

The single source of truth for field rules (required, phone regex, email
format, DOB-not-in-the-future). The inferred type (`PatientFormValues`) is
reused anywhere the form shape is needed.

---

## Real-time synchronization flow

```
┌──────────────┐   patient:update (debounced 400ms)   ┌──────────┐   session:update   ┌───────────┐
│ PatientForm  │ ────────────────────────────────────▶│  server  │ ─────────────────▶ │ StaffView │
│  (client)    │                                      │ (Node +  │                    │  (client) │
│              │   patient:submit                     │ Socket.IO│   session:leave    │           │
│              │ ────────────────────────────────────▶│  )       │ ─────────────────▶ │           │
│              │                                      │          │                    │           │
│              │◀── patient:state (rehydrate on mount)│          │                    │           │
└──────────────┘                                      └──────────┘                    └───────────┘
                                                            │
                                                            ▼  setInterval(2s)
                                              flip stale sessions → "inactive",
                                              GC submitted sessions after 30 min
```

### On the server (`server.js`)

- Each patient socket owns a session keyed by its `socket.id`. State is an
  in-memory `Map<sessionId, { data, status, updatedAt, submittedAt? }>`.
- Staff sockets join the `staff` room on connection and immediately receive a
  `sessions:snapshot`. They can request a fresh snapshot any time via
  `staff:snapshot` (used after a route remount where local state was lost).
- `patient:update` merges the partial into the session, marks it `active`, and
  broadcasts to the `staff` room.
- `patient:submit` freezes the session as `submitted` and blocks further
  updates.
- `patient:state` lets a patient client re-fetch its own session — used to
  rehydrate the form after a route remount so values aren't lost.
- A 2-second tick flips `active` sessions to `inactive` once they've been
  silent for 5 seconds and garbage-collects submitted sessions after 30
  minutes.
- On disconnect: non-submitted sessions are removed (`session:leave`);
  submitted ones linger until GC.

### On the client (`src/lib/socket.ts`)

- `getPatientSocket()` / `getStaffSocket()` lazily create a singleton Socket.IO
  client. The handshake query carries `role`, which the server uses to decide
  whether to create a session or subscribe the caller to the `staff` room.

---

## Tech stack

| Concern                | Choice                                  |
| ---------------------- | --------------------------------------- |
| Framework              | Next.js 14 (App Router) + TypeScript    |
| Styling                | TailwindCSS 3 with custom theme         |
| Real-time transport    | Socket.IO (WebSocket + polling fallback)|
| Form + validation      | react-hook-form + zod                   |
| Icons                  | lucide-react                            |
| Fonts                  | IBM Plex Sans Thai / Sans / Mono via `next/font` |

---

## Bonus features beyond the spec

- 4-step form with a stepper that gates `Next` on required fields and resumes
  at the first incomplete step after a route remount.
- Custom date picker with a popover calendar (no native browser look).
- Save-state indicator (`saving` / `saved`) driven off the same debounce that
  emits to the server.
- Last-typed field surfaced on each staff card with a blinking caret while the
  patient is actively typing.
- Attention banner on the staff dashboard that's clickable as a one-tap filter
  to "Idle" sessions.
- Search across name / phone / email on the staff dashboard.
- TH / EN locale toggle that persists in `localStorage`.
- Confetti + checkmark draw-in animation on submit (respects
  `prefers-reduced-motion`).
- **Style guide page** at `/style` — live reference of the design tokens
  (colors, typography, spacing, components) sourced from `tailwind.config.ts`.

---

## What's intentionally out of scope

- Persistence (DB). Sessions are in-memory so the demo has zero setup.
- Auth. A production staff view would sit behind SSO.
- Multi-server fan-out. Swap the in-memory `Map` for Redis pub/sub plus the
  Socket.IO Redis adapter to scale beyond one process.
