# Therapist Booking

## Getting started

```bash
pnpm install
pnpm dev
```

---

## Architectural decisions

### `server/` vs `app/api/`

| | `server/` | `app/api/` |
|---|---|---|
| **Called by** | Server Components (direct function call) | External HTTP clients (mobile app, webhooks, third-party services) |
| **When to use** | Any data fetching or mutation initiated by the Next.js app itself | When something outside this Next.js app needs to call you |

Rule of thumb: if the caller is a page or a Server Action in this repo, put it in `server/`. Only reach for `app/api/` when an external system needs an HTTP endpoint.

### Server Component vs Client Component

Default to **Server Component**. Opt into `"use client"` only when you need one of:

- Browser APIs (`window`, `navigator`, `localStorage`, …)
- React state (`useState`, `useReducer`)
- React effects (`useEffect`, `useLayoutEffect`)
- Event listeners attached inside JSX (`onClick`, `onChange`, …)
- Third-party libraries that themselves require a browser context

Push the `"use client"` boundary as far down the tree as possible so that the parent components (and their data fetching) stay on the server.
