# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Consult /docs before writing any code

Before generating or modifying any code, you MUST ALWAYS first check the `/docs` directory for a relevant documentation file covering the feature, library, or pattern you are about to work with. If a matching doc exists, read it in full and follow its guidance. Only proceed without a docs file if none exists for the area in question:

- /docs/ui.md
- /docs/data-fetching.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

This is a Next.js 16 project using the App Router pattern with TypeScript and Tailwind CSS 4.

**Key directories**
- `src/app/` - App Router pages and layouts (not Pages Router)
- `public/` - Static assets

**Path alias:** Use `@/` for imports from the src directory (e.g., `@/app/...`)

## Stack

- **Next.js 16.2.6** — App Router only (no Pages Router). This version has breaking changes vs. older Next.js; read `node_modules/next/dist/docs/` before writing any Next.js-specific code.
- **React 19.2.4**
- **Tailwind CSS 4** — configured via `postcss.config.mjs` and `@tailwindcss/postcss`. No `tailwind.config.*` file; v4 uses CSS-first configuration.
- **TypeScript 5**

## Project structure

```
src/app/           # App Router root
  layout.tsx       # Root layout — sets fonts (Geist), html/body classes
  page.tsx         # Home route
  globals.css      # Global styles + Tailwind imports
```

All routes live under `src/app/`. Add new routes as folders with a `page.tsx`.

## Key conventions

- Fonts: Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`) are loaded via `next/font/google` in the root layout and exposed as CSS variables.
- Dark mode: handled via Tailwind's `dark:` variant (class-based or media — not yet explicitly configured).
- For client-side navigation performance, read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.mdx` — Suspense alone is not enough; routes may need to export `unstable_instant`.
