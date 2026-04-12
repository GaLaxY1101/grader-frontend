# Progress

## 2026-04-12 — Project bootstrap

### Done
- Bootstrapped Next.js 14 with TypeScript, ESLint, App Router, `src/` layout, `@/*` import alias, no Tailwind
- Switched package manager from npm to pnpm; removed `package-lock.json`, committed `pnpm-lock.yaml`
- Cleared boilerplate: `src/app/page.tsx` → minimal `<div />`, `src/app/globals.css` → empty, deleted `src/app/page.module.css`
- Wired repo to `git@github.com:GaLaxY1101/grader-frontend.git` on branch `main`
- Added PROGRESS.md rule to CLAUDE.md

### Decisions
- pnpm chosen as package manager (per CLAUDE.md)
- Branch named `main` to match GitHub default

### Next
- Install and configure dependencies: MUI v5, NextAuth v4, openapi-fetch, React Hook Form, Zod, Redux Toolkit, react-toastify, Vitest
- Set up folder structure per CLAUDE.md
- Set up NextAuth with Keycloak provider

---

## 2026-04-12 — TypeScript configuration

### Done
- Replaced `tsconfig.json` with stricter config
- Added `"target": "ESNext"` (was missing)
- Added `"noUncheckedIndexedAccess": true` — array/index access now returns `T | undefined`, catching off-by-one bugs at compile time
- Added `"react"` path alias pointing to local `@types/react` to prevent version mismatches
- Added `"tests"` to `exclude` so Vitest handles its own type checking
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- `noUncheckedIndexedAccess` enabled from the start while the codebase is small — easier to enforce early than retrofit later

---

## 2026-04-12 — ESLint + Prettier setup

### Done
- Installed: `prettier`, `eslint-plugin-prettier`, `eslint-config-prettier`, `eslint-plugin-import`, `@typescript-eslint/{eslint-plugin,parser}`, `prettier-plugin-organize-imports`
- Replaced `.eslintrc.json` with full config: `next/core-web-vitals` + `plugin:prettier/recommended` + TS-aware unused-vars rule
- Created `.prettierrc`: single quotes, 100-char line width, LF endings, trailing commas, auto-organized imports
- Created `.prettierignore`: excludes `.next`, `node_modules`, `public`
- Added scripts to `package.json`: `lint:eslint`, `format`, `tsc:test`
- Fixed formatting in `src/app/layout.tsx` (double quotes → single quotes) via `pnpm format`
- Both `pnpm lint` and `pnpm format` pass with no errors

### Decisions
- `eslint-config-prettier` disables ESLint style rules so Prettier is the single source of truth for formatting
- `eslint-plugin-prettier` surfaces Prettier violations as ESLint errors — one command (`pnpm lint`) catches both bugs and style
- `prettier-plugin-organize-imports` auto-sorts imports on format — no manual ordering needed
- `@typescript-eslint/no-unused-vars` replaces the base `no-unused-vars` rule; prefix `_` to intentionally ignore a variable

### Next
- Install remaining dependencies: MUI v5, NextAuth v4, openapi-fetch, React Hook Form, Zod, Redux Toolkit, react-toastify, Vitest
- Set up folder structure per CLAUDE.md
- Configure NextAuth with Keycloak provider
