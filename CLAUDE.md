# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build (also runs type checking)
pnpm lint         # ESLint
pnpm exec tsc --noEmit   # type check without building
```

To add a new shadcn component:
```bash
pnpm dlx shadcn@latest add <component-name>
```

## Architecture

### Route groups and their purpose

Three route groups exist under `app/`, each with its own `layout.tsx`:

| Group | URL prefix | Intent |
|---|---|---|
| `(marketing)` | `/` | Public pages — will share header/footer |
| `(booking)` | `/booking` | Multi-step booking flow — minimal chrome |
| `(admin)` | `/admin` | Protected admin panel — auth guard goes in its `layout.tsx` |

### `server/` vs `app/api/`

`server/queries/` and `server/actions/` contain plain async TypeScript functions, not HTTP handlers. They are called directly by Server Components and Server Actions respectively. Every file in `server/` starts with `import "server-only"`, which causes a build error if anything in that directory is accidentally imported into a Client Component.

`app/api/` is reserved for HTTP endpoints needed by external callers (webhooks, mobile clients, third-party services). For anything initiated within this Next.js app itself, use `server/`.

### Server vs Client Components

Default to Server Components. Add `"use client"` only when the component needs browser APIs, `useState`/`useReducer`, `useEffect`, or event handlers. Push the boundary as far down the tree as possible — parent data-fetching stays on the server.

### User context

`lib/user-context.tsx` exposes `UserProvider`, `useUser()`, and the `User` / `UserRole` types. The provider is mounted in the root layout (`app/layout.tsx`), where `getCurrentUser()` is the placeholder for future session resolution. Client Components anywhere in the tree call `useUser()` to access the session without prop drilling.

### Styling

Tailwind CSS v4 with two custom scales defined via `@theme` in `app/globals.css`:
- `brand-*` (50–950) — forest green used for buttons, active states, badges
- `surface-*` (50–400) — warm cream/off-white for page and panel backgrounds

shadcn CSS variables (`:root` / `.dark`) sit alongside these in `globals.css` and are intentionally left at their defaults — color customisation comes later.

### shadcn/ui

Style is `base-nova` (uses Base UI primitives, not Radix UI directly). The `components.json` aliases map:
- `@/components/ui` → `components/ui/` (shadcn primitives)
- `@/lib/utils` → `lib/utils.ts` (exports `cn()`)

The `form` component (`components/ui/form.tsx`) was written manually because it is absent from the `base-nova` registry; it wraps `react-hook-form` the same way the classic shadcn form does. Forms use `react-hook-form` + `zod` via `@hookform/resolvers`.

### Path aliases (tsconfig)

```
@/components/*  →  components/*
@/lib/*         →  lib/*
@/server/*      →  server/*
```
