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

---

## 2026-04-12 — Husky + lint-staged pre-commit hook

### Done
- Installed `husky` v9 and `lint-staged`
- Initialized Husky (`pnpm exec husky init`) — adds `prepare` script so hooks install automatically on `pnpm install`
- `.husky/pre-commit` runs `pnpm exec lint-staged`
- `lint-staged` config in `package.json`: runs `prettier --write` then `eslint --fix --max-warnings=0` on staged `src/**/*.{ts,tsx}` files only

### Decisions
- Pre-commit chosen over pre-push so bad formatting never enters git history at all
- lint-staged scopes the run to staged files only — hook completes in under a second even as the project grows
- `--max-warnings=0` on ESLint means warnings block the commit; use `_` prefix on variables to intentionally suppress unused-var warnings
- `prepare` script means any new contributor gets hooks automatically after `pnpm install` — no manual setup needed

---

## 2026-04-12 — Environment variable configuration

### Done
- Installed `@t3-oss/env-nextjs` and `zod`
- Created `.env.local` with all required values (not committed — covered by `.env*.local` in `.gitignore`)
- Created `.env.sample` with empty values — committed as reference for new contributors
- Created `src/utils/env.ts` using `createEnv` from `@t3-oss/env-nextjs`
- `pnpm tsc --noEmit` passes with zero errors
- `pnpm dev` starts cleanly at http://localhost:3000, reads `.env.local`, no validation errors

### Decisions
- `@t3-oss/env-nextjs` validates env vars at build time — if a required variable is missing or malformed, the app refuses to start with a clear error rather than failing silently at runtime
- `server` block vars are stripped from client bundles by Next.js — accessing them in a client component throws at runtime, enforcing the server/client boundary
- `NEXT_PUBLIC_` prefix is Next.js convention for vars accessible in the browser; everything else stays server-only
- `.env.sample` committed as contributor reference; `.env.local` stays gitignored forever

### Next
- Install remaining dependencies: MUI v5, NextAuth v4, openapi-fetch, React Hook Form, Zod, Redux Toolkit, react-toastify, Vitest
- Set up folder structure per CLAUDE.md
- Configure NextAuth with Keycloak provider

---

## 2026-04-12 — MUI theme configuration

### Done
- Installed MUI v5 stack: `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@mui/lab`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/system`, `@emotion/react`, `@emotion/styled`, `@emotion/cache`
- Created `src/styles/theme.ts` — university blue (`#1565C0`) primary palette, Inter font stack, 8px border radius, component overrides for Button, Card, TableCell
- Created `src/providers/ThemeProvider.tsx` — wraps `AppRouterCacheProvider` (SSR-safe emotion cache) + `MuiThemeProvider` + `CssBaseline`
- Replaced `src/app/layout.tsx` — removed Geist fonts and `globals.css`, wired in `ThemeProvider`
- Replaced `src/app/page.tsx` — MUI smoke-test: blue h1 heading + contained button on `#F5F7FA` background
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- `AppRouterCacheProvider` with `enableCssLayer: true` is required for Next.js 14 App Router + emotion SSR — without it, styles hydrate incorrectly and cause flash-of-unstyled-content
- Sub-path imports (`@mui/material/Box` vs `@mui/material`) used in server components to avoid the barrel-import bundler warning
- `CssBaseline` injected inside `ThemeProvider` so it picks up the theme's background color (`#F5F7FA`) automatically

### Next
- Configure NextAuth with Keycloak provider
- Add remaining dependencies: openapi-fetch, React Hook Form, Redux Toolkit, react-toastify, Vitest
- Build the authenticated layout (Sidebar + Topbar)

---

## 2026-04-12 — NextAuth + Keycloak configuration

### Done
- Installed `next-auth`, `jwt-decode`, `jsonwebtoken`, `@types/jsonwebtoken`
- Created `src/lib/server/auth.ts` — full `AuthOptions` with:
  - Keycloak OAuth provider (PKCE + state checks, reads env vars via `src/utils/env.ts`)
  - `jwt` callback: stores `access_token`, `id_token`, `refresh_token`, `expires_at`, and `app_roles` (decoded from JWT claim) on initial sign-in; silently refreshes expired tokens with a 30s safety margin; marks `error: 'RefreshAccessTokenError'` on failure
  - `session` callback: exposes `access_token`, `id_token`, `roles`, and `error` to client — nothing else leaks through
  - Module augmentation for `Session` and `JWT` interfaces — TypeScript knows about the custom fields
- Created `src/app/api/auth/[...nextauth]/route.ts` — standard NextAuth route handler
- Created `src/middleware.ts` — `next-auth/middleware` protects all routes except `/signin`, `/api/auth/*`, and Next.js internals
- Created `src/app/(auth)/signin/page.tsx` — sign-in page with MUI layout, single "Sign in with Keycloak" button
- Created `src/app/(protected)/layout.tsx` — server-side session guard; redirects unauthenticated users to `/signin`
- Created `src/app/(protected)/dashboard/page.tsx` — placeholder dashboard showing user name and roles
- Updated `src/app/layout.tsx` — fetches session server-side, passes it to `SessionProvider` to avoid client-side loading flicker
- Created `src/providers/SessionProvider.tsx` — thin wrapper around `NextAuthSessionProvider` that accepts a pre-fetched session
- Created `src/hooks/useAuth.ts` — `useAuth` hook exposing `user`, `roles`, `accessToken`, `isLoading`, `isAuthenticated`, `hasRole(role)`; `Role` const defined here
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- Token refresh happens in the `jwt` callback (server-only) — the client never sees raw tokens, only the stripped session object
- `app_roles` claim is read from the decoded access token at sign-in and cached in the JWT; no re-decode needed on every request
- Session is fetched once in `RootLayout` and passed down via `SessionProvider` — avoids a waterfall where every client component independently waits for the session cookie to be validated
- Two layers of protection: `middleware.ts` (edge, fast) redirects before the page even renders; `(protected)/layout.tsx` (server component) double-checks — belt-and-suspenders for SSR correctness
- `useAuth` is the single entry point for role checks in client components; raw `useSession` should not be used directly

### Next
- Run Keycloak in Docker and test the full login flow end-to-end
- Add remaining dependencies: openapi-fetch, React Hook Form, Redux Toolkit, react-toastify, Vitest
- Build the authenticated layout (Sidebar + Topbar)

---

## 2026-04-21 — Keycloak login/logout flow end-to-end

### Done
- Tested full login flow: `/` → `/signin` → Keycloak → `/dashboard` showing user name and roles
- Fixed root `/` page: replaced MUI placeholder with a server-side `redirect('/dashboard')`
- Added `LogoutButton` client component (`src/components/common/LogoutButton.tsx`) on the dashboard
- Created `src/app/api/auth/logout/route.ts` — server route that:
  - Reads `id_token` from the active session
  - Clears Next.js session cookies (`next-auth.session-token`)
  - Redirects to Keycloak's end-session endpoint with `client_id`, `id_token_hint`, and `post_logout_redirect_uri`
- Fixed `signIn('keycloak', { callbackUrl: '/dashboard' })` — without explicit callbackUrl, NextAuth defaulted to redirecting back to `/signin` after login
- Registered `http://localhost:3000/signin` as a valid post-logout redirect URI in Keycloak

### Decisions
- Custom `/api/auth/logout` route instead of NextAuth's `signOut()` — `signOut()` only clears the Next.js session but leaves the Keycloak SSO session alive, causing sign-in to fail immediately after logout
- `client_id` included in logout params so Keycloak can validate the redirect URI even when `id_token_hint` is absent
- Keycloak runs on port 9080 (Spring Boot occupies 8080)

### Next
- Move `Role` constant from `useAuth.ts` to `src/utils/roles.ts` (per CLAUDE.md)
- Add remaining dependencies: React Hook Form, Redux Toolkit, react-toastify, Vitest
- Build the authenticated layout (Sidebar + Topbar)

---

## 2026-04-21 — openapi-fetch API client

### Done
- Installed `openapi-fetch` (runtime) and `openapi-typescript@^6.7.4` (dev)
- Added `generate-api` script to `package.json` — points at `http://localhost:8080/v3/api-docs`
- Added `test:vitest` script to `package.json` for future Vitest integration
- Generated `src/lib/api/types/index.ts` from live Spring Boot OpenAPI spec — **never edit manually**
- Created `src/lib/api/client.ts` — `openapi-fetch` client for Client Components; JWT middleware reads `access_token` from `getSession()` and injects `Authorization: Bearer …` header automatically
- Created `src/lib/api/serverClient.ts` — factory function for Server Components; uses `getServerSession()` which works in RSC/SSR context
- Created `src/lib/api/index.ts` — re-exports `apiClient`, `createServerClient`, and the `paths` type
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- `getSession()` (client-side) vs `getServerSession(auth)` (server-side) is the key split: Next.js forbids `next-auth/react` imports in server context, so two separate clients are needed
- `openapi-typescript@6` (not v7) chosen because v7 changed the output shape in a way that requires openapi-fetch v1 — v6 + current openapi-fetch is the stable pairing
- Middleware pattern on `baseClient` keeps auth concern in one place; no call site needs to set the Authorization header manually

### Usage
```ts
// Client Component ('use client')
import { apiClient } from '@/lib/api';
const { data, error } = await apiClient.GET('/api/courses');

// Server Component (no directive)
import { createServerClient } from '@/lib/api';
const client = await createServerClient();
const { data, error } = await client.GET('/api/courses');
```

### Next
- Move `Role` constant from `useAuth.ts` to `src/utils/roles.ts` (per CLAUDE.md)
- Install React Hook Form, Zod (already present), Redux Toolkit, react-toastify, Vitest
- Build the authenticated layout (Sidebar + Topbar)

---

## 2026-04-21 — Teacher courses list page

### Done
- Created `src/app/(protected)/courses/page.tsx` — Server Component, calls `GET /api/courses` via `createServerClient`; renders an inline error `Alert` on failure, empty-state text when no courses, or the grid
- Created `src/components/courses/CourseCard.tsx` — MUI `Card` with course name, description (2-line clamp), academic year/semester, date range, and active/inactive `Chip`
- Created `src/components/courses/CoursesGrid.tsx` — `'use client'` wrapper that renders a `Grid` of `CourseCard`s and handles click-navigation to `/courses/{id}`
- `pnpm tsc:test` passes with zero errors

### Decisions
- Page is a Server Component: data is fetched on the server using `createServerClient` — no client-side loading state needed, faster initial paint
- Error handling is an inline `Alert` (not toast) because there is no data to show and we are in a server component; toast requires a client component
- Navigation logic (`useRouter`) lives in `CoursesGrid` (client component) so `CourseCard` stays a pure presentational component usable anywhere
- Backend filters by JWT identity — calling `GET /api/courses` as an authenticated teacher returns only that teacher's courses; no manual filter needed

### Next
- Build course detail page (`/courses/[id]`)
- Build authenticated layout (Sidebar + Topbar)
- Move `Role` to `src/utils/roles.ts`

---

## 2026-04-22 — Layout + Sidebar + Routing skeleton

### Done
- Created placeholder pages: `courses/[id]`, `courses/[id]/assignments/[assignmentId]`, `submissions/[id]`, `admin` — each returns a minimal `<div>` pending real implementation
- Created `src/components/layout/navigation.ts` — role-keyed `NavItem[]` config (STUDENT/TEACHER/ADMIN); icon names are strings mapped in Sidebar
- Created `src/components/layout/Sidebar.tsx` — permanent MUI `Drawer` (240 px); active link highlighted via `usePathname`; icon map avoids dynamic imports; user email in footer
- Created `src/components/layout/Topbar.tsx` — MUI `AppBar`; page title derived from pathname; role `Chip` (blue/green/red); logout calls custom `/api/auth/logout` route
- Created `src/components/layout/MainLayout.tsx` — flex-row composition of Sidebar + Topbar + scrollable content; `'use client'` so server-component children are passed via props (Next.js composition pattern)
- Updated `src/app/(protected)/layout.tsx` — server-side session guard passes `primaryRole`, `userName`, `userEmail` to `MainLayout`
- Created `src/components/common/PageHeader.tsx` — title + optional subtitle + optional action button
- Created `src/components/common/LoadingSkeleton.tsx` — configurable row count of `Skeleton` rectangles
- Created `src/components/common/EmptyState.tsx` — centred empty-state with title, description, and optional action
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- **Icon map vs dynamic import**: a static `Record<string, React.ElementType>` for the three icons we use is simpler and type-safe; dynamic imports would require `next/dynamic` wrappers and add code-splitting complexity for three icons
- **Custom logout route**: Topbar logout navigates to `/api/auth/logout` (not `signOut()`) — same as the standalone `LogoutButton`; `signOut()` clears the Next.js cookie but leaves the Keycloak SSO session alive, causing immediate auto-login
- **Server → client composition**: `ProtectedLayout` is a server component (reads session, no JS shipped); `MainLayout` is `'use client'` so Sidebar/Topbar can use `usePathname`; children are passed as a prop so they remain server-rendered — standard Next.js App Router pattern
- **`noUncheckedIndexedAccess` safety**: all array accesses in `getPageTitle` explicitly guard against `undefined` before use

### Next
- Build course detail page (`/courses/[id]`)
- Build assignment detail + submission page
- Add React Hook Form, Redux Toolkit, react-toastify, Vitest

---

## 2026-04-22 — Course detail page

### Done
- Extended `src/lib/api/courses.ts` — added `getCourseStudents` and `getCourseTeachers` (GET `/api/courses/{id}/students` and `/teachers`)
- Created `src/lib/api/assignments.ts` — `getAssignmentsByCourse` (GET `/api/courses/{courseId}/assignments`) and `getAssignmentById` (GET `/api/assignments/{id}`)
- Created `src/components/assignments/AssignmentCard.tsx` — Server Component; clickable card linking to `/courses/{courseId}/assignments/{id}`; shows title, description (2-line clamp), deadline with color-coded urgency (past → error.main, ≤3 days → warning.main, future → text.secondary), max score Chip, type badge (Code/File/Text with icon)
- Created `src/components/courses/CourseInfoCard.tsx` — Server Component; displays course name (h4), description, info grid (academic year, semester, date range), and active/inactive status Chip
- Rewrote `src/app/(protected)/courses/[id]/page.tsx` — Server Component; fetches all data in parallel via `Promise.all`; renders CourseInfoCard, assignment list with EmptyState fallback, and students/teachers sections (TEACHER/ADMIN only)
- Created `src/app/(protected)/courses/[id]/loading.tsx` — Next.js streaming skeleton with three Skeleton rectangles
- Created `src/app/(protected)/courses/[id]/error.tsx` — Next.js error boundary with "Try again" reset button
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- `CourseDetailResponse` from `GET /api/courses/{id}` already includes students, teachers, and assignments. Separate API calls are made anyway per the learning-project spec — the explicit `Promise.all` teaches the parallel-fetch pattern clearly
- Deadline color is computed server-side; MUI `sx` accepts theme palette strings like `'error.main'` so no `useTheme` hook is needed in the server component
- `Button component={Link}` used for the back button so it stays a server component with no `useRouter`
- Students/teachers sections are conditionally rendered by checking `roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN)` — a single `canManage` boolean derived at the top of the function

### Next
- Build assignment detail + submission page (`/courses/[id]/assignments/[assignmentId]`)
- Add Redux Toolkit, Vitest

---

## 2026-04-22 — Submissions module (BE + FE)

### Done
- **BE**: Submissions module fully implemented (Session 6):
  - `V9__init_submissions.sql` — `submissions` table with status, code_content, score, pipeline fields, and 4 indexes
  - `SubmissionStatus` enum: PENDING / RUNNING / PASSED / FAILED / ERROR
  - `Submission` entity with `startPipeline()` and `applyResult()` mutation methods (ready for GitLab webhook)
  - `SubmissionRepository` — JPQL fetch-join queries to prevent N+1 on student → user chain
  - `StudentRepository.findByUser_Email()` added (mirrors TeacherRepository pattern)
  - `SubmissionServiceImpl` — 5 operations; students enforced to own submissions only via `enforceStudentOwnership()`
  - `SubmissionController` — 5 endpoints (POST create, GET by id, GET status, GET all for assignment, GET my latest)
  - 11 unit tests: happy path, not-found, access-denial for each operation
- `src/hooks/usePolling.ts` — generic polling hook; stops on terminal status; stable refs prevent stale closure bugs
- `src/lib/api/submissions.ts` — server-side API helpers (`getSubmissionById`, `getMyLatestSubmission`, `listSubmissionsByAssignment`)
- `src/components/submissions/SubmissionStatusBadge.tsx` — color-coded MUI Chip per status
- `src/components/submissions/SubmissionForm.tsx` — textarea form; posts to BE; on success redirects to `/submissions/{id}`; shows "previous submission" notice if re-submitting
- `src/components/submissions/SubmissionList.tsx` — teacher view; clickable rows linking to `/submissions/{id}`
- `src/app/(protected)/courses/[id]/assignments/[assignmentId]/page.tsx` — Server Component; role-aware: form for students, submission table for teachers/admins; parallel fetch of assignment + role-specific data; `loading.tsx` + `error.tsx` added
- `src/app/(protected)/submissions/[id]/page.tsx` — client component; polls `/api/submissions/{id}/status` every 3 s; spinner while PENDING/RUNNING; pipeline output in monospace code block when done
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- **Ownership enforcement in service, not controller**: `@PreAuthorize` sets the role gate; `enforceStudentOwnership()` checks identity inside the service so the same method serves both students (own only) and teachers (any)
- **JPQL fetch joins in repository**: `Submission → Student → User` is a two-hop lazy chain; fetching eagerly in the query avoids N+1 without making entity relationships `EAGER`
- **`usePolling` stable refs**: `fetcherRef` and `stopWhenRef` hold the latest function values so the `setInterval` callback never closes over stale props
- **Temporary `as any` casts in `submissions.ts` and `submissions/[id]/page.tsx`**: new BE endpoints are not in generated types yet — run `pnpm generate-api` after starting BE to replace these with proper typed calls
- **File upload deferred**: form shows an info alert for file-upload assignments; BE model already supports it via `code_content` extension

### Next
- Start BE → run `pnpm generate-api` → replace `as any` casts with typed calls
- Session 7 (BE): GitLab API client, push code on submission, webhook endpoint
- Admin page (`/admin`): user and group management tables
- Vitest setup for FE unit tests

---

## 2026-04-22 — Create Course dialog + Sidebar role fix

### Done
- Fixed `src/app/(protected)/layout.tsx` — `session.roles[0]` was picking up Keycloak's internal roles (`default-roles-*`, `offline_access`, `uma_authorization`) instead of the app role; replaced with `roles.find(r => APP_ROLES.has(r))` which scans for the first `STUDENT`/`TEACHER`/`ADMIN` role
- Installed `react-hook-form`, `react-toastify`, `@hookform/resolvers`
- Added `<ToastContainer>` to `src/app/layout.tsx` (bottom-right, 4s auto-close)
- Created `src/components/courses/CreateCourseDialog.tsx` — `'use client'` dialog; React Hook Form + Zod schema; posts to `POST /api/courses` via `apiClient`; shows success/error toasts; calls `router.refresh()` so the server component re-fetches the course list without a full navigation
- Created `src/components/courses/CreateCourseButton.tsx` — `'use client'` button that owns the `open` state; keeps the courses page a pure server component
- Updated `src/app/(protected)/courses/page.tsx` — replaced the disabled Button with `<CreateCourseButton />`
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- **`z.coerce.number()` rejected** — Zod v4 types its input as `unknown`, which conflicts with `zodResolver`'s type inference; used `z.number()` with RHF's `valueAsNumber: true` on the text input instead
- **`LoadingButton` from `@mui/lab`** — MUI v5's `Button` has no `loading` prop (added in v6); `@mui/lab/LoadingButton` is already in the dep tree and covers the spinner-during-submit UX
- **`router.refresh()`** — tells Next.js to re-run the server component's data fetch and stream the new HTML; no client-side state or re-render of the whole page needed

---

## 2026-04-22 — Course list page

### Done
- Created `src/lib/api/courses.ts` — `getCourses` and `getCourseById` functions using `createServerClient`; throws on API error so callers can try/catch or let Next.js error boundary catch it
- Rewrote `src/components/courses/CourseCard.tsx`:
  - Replaced `onClick`+`CardActionArea` with a Next.js `Link` wrapping the whole card via `Box component={Link}` (stays a Server Component — no 'use client')
  - Hover effect: `boxShadow: 4` + `translateY(-2px)` via `sx` transition
  - Academic year formatted as "2025/2026 · Semester 1"
  - Semester badge: `Chip` variant outlined; active/inactive badge alongside it
- Simplified `src/components/courses/CoursesGrid.tsx` — removed `'use client'` and `useRouter`; navigation is now handled by Link inside CourseCard
- Rewrote `src/app/(protected)/courses/page.tsx` (Server Component):
  - Reads session with `getServerSession(auth)` for role-aware text
  - `PageHeader` title "Courses", subtitle varies by role (STUDENT/TEACHER/ADMIN)
  - TEACHER and ADMIN see a disabled "Create Course" button in the action slot
  - try/catch around `getCourses()` — shows inline `Alert` on API failure
  - Empty state via `EmptyState` component with role-specific description
  - 3-column grid (xs=12, sm=6, md=4) via `CoursesGrid`
- Created `src/app/(protected)/courses/loading.tsx` — Next.js streaming loading UI using `LoadingSkeleton`
- Created `src/app/(protected)/courses/error.tsx` — Next.js error boundary with "Try again" reset button
- `pnpm tsc --noEmit` passes with zero errors

### Decisions
- Teacher/student count badges were omitted: `CourseResponse` from the API does not include aggregate counts. `CourseDetailResponse` has `teachers[]` and `students[]` arrays but requires a per-course fetch — not suitable for a list page.
- `Box component={Link}` pattern chosen over `CardActionArea` so `CourseCard` stays a pure Server Component; `useRouter` is never needed if the entire card is a link
- try/catch in the page (not just error.tsx): API failures show a friendly inline Alert rather than unmounting the whole subtree; error.tsx is the backstop for unexpected rendering errors

### Next
- Build course detail page (`/courses/[id]`)
- Build assignment detail + submission page

---

## 2026-04-22 — Layout fix + UI improvements

### Done
- **Layout gap fix**: removed redundant `ml: 240px` from `MainLayout` main area — MUI permanent `Drawer` already inserts a spacer div into the flex row, so the explicit margin doubled the offset
- **Teachers in course header**: moved teachers out of a standalone section and into `CourseInfoCard` as avatar chips with tooltips; visible to all roles; dropped the now-redundant `getCourseTeachers` parallel fetch
- **Edit Course** (`/courses/[id]`): `EditCourseDialog` pre-fills all fields from the current course; calls `PUT /api/courses/{id}`; `router.refresh()` re-fetches the server component on success
- **Add Assignment** (`/courses/[id]`): `CreateAssignmentDialog` with task-type radio (Text / Code / File Upload); Code section shows language + CI config template; File section shows extensions, size, count; calls `POST /api/courses/{courseId}/assignments`
- **Edit Assignment** (`/courses/[id]/assignments/[id]`): `EditAssignmentDialog` pre-fills title, description, max score, deadline (ISO → datetime-local conversion); calls `PUT /api/assignments/{id}`
- **Delete Assignment** (`/courses/[id]/assignments/[id]`): `DeleteAssignmentButton` opens a confirmation dialog before calling `DELETE /api/assignments/{id}`; navigates back to course on success; dialog copy clarifies this is a soft delete
- All buttons follow the client-wrapper pattern (e.g. `EditCourseButton`, `EditAssignmentButton`) to keep server components free of `'use client'`

### Decisions
- Confirmation dialog for delete: destructive action — one extra click is worth preventing accidental data loss
- `toDatetimeLocal()` helper in `EditAssignmentDialog`: converts ISO offset string from the API to `YYYY-MM-DDTHH:mm` required by `<input type="datetime-local">`; displayed in the user's local timezone
- Task type details (language, CI template, file settings) are not editable — `UpdateAssignmentRequest` on the BE intentionally omits them; edit dialog reflects this constraint

### Next
- Start BE → run `pnpm generate-api` → replace `as any` casts in submissions API with typed calls
- Admin page: user and group management
- Vitest setup for FE unit tests

---

## 2026-04-28 — UI overhaul (design polish)

### Done
- **Theme** (`src/styles/theme.ts`): Updated color palette (blue-600 primary, richer semantic colors), refined typography with tight letter-spacing, new shadow scale (10 levels), component overrides for Button, Card, Chip, Dialog, Alert, TableCell/Row, OutlinedInput, Tooltip, LinearProgress, custom scrollbar via CssBaseline
- **Sidebar** (`src/components/layout/Sidebar.tsx`): Dark gradient sidebar (navy-to-midnight), logo icon with blue accent, left active-indicator bar, muted inactive icon/text colors, user avatar with initials (gradient fill), wider at 256px
- **Topbar** (`src/components/layout/Topbar.tsx`): Glass-effect background with backdrop blur, avatar with gradient fill, icon-only logout button (tooltip), role badge outlined variant, vertical divider between sections
- **CourseCard** (`src/components/courses/CourseCard.tsx`): Per-course deterministic accent color (6-color palette), 4px gradient top accent bar, softer badge styling (filled instead of outlined), footer meta split by divider
- **AssignmentCard** (`src/components/assignments/AssignmentCard.tsx`): Overdue/urgent/upcoming badge system with colored pill, footer separated by divider, score badge uses indigo tint, type chips use semantic colors
- **CourseInfoCard** (`src/components/courses/CourseInfoCard.tsx`): Uppercase labels with wider letter-spacing, teacher chip uses gradient avatar, status badge uses semantic colors
- **EmptyState** (`src/components/common/EmptyState.tsx`): Added optional `icon` prop with square icon container, centered layout with proper gap
- **PageHeader** (`src/components/common/PageHeader.tsx`): Added bottom border divider, tighter letter-spacing on title
- **LoadingSkeleton** (`src/components/common/LoadingSkeleton.tsx`): Wave animation, configurable height, rounded corners
- **Dashboard** (`src/app/(protected)/dashboard/page.tsx`): Welcome banner with gradient background and decorative circles, 4-stat overview grid with colored icon boxes, role-specific subtitle
- **Course detail page**: Section headers have count subtitle + bottom divider instead of plain h5, student list uses gradient avatars and bottom border per row

### Decisions
- Dark sidebar contrasts strongly with the light content area, giving the layout visual depth without an overwhelming color scheme
- Deterministic accent colors per course ID (id % 6) means cards look varied without random flicker on re-render
- `backdrop-filter: blur(8px)` on Topbar gives a modern glass feel that stays readable
- `pnpm tsc --noEmit` passes with zero errors after all changes
