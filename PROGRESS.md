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
- Configure TypeScript strict mode, ESLint rules
- Set up NextAuth with Keycloak provider
