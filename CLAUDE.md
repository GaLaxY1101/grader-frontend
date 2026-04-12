# University Grader CMS — Frontend

## Project overview
University CMS with automated lab checking via GitLab CI/CD.
Frontend for ~500 students and teachers.

Backend: Spring Boot 3.2 REST API running at http://localhost:8080
API docs: http://localhost:8080/v3/api-docs (OpenAPI)

## Tech stack
- Next.js 14 App Router
- TypeScript (strict mode)
- Material UI v5
- NextAuth v4 + Keycloak (SSO/JWT)
- openapi-fetch + openapi-typescript (auto-generated API layer)
- React Hook Form + Zod (forms)
- Redux Toolkit (state — only when useState is not enough)
- react-toastify (notifications)
- Vitest (unit tests)
- pnpm (package manager)

## Roles
Three user roles extracted from JWT token (claim: app_roles):
- STUDENT — view courses, submit labs, see results
- TEACHER — manage courses, assignments, view submissions
- ADMIN   — manage users, groups

---

## Folder structure

src/
├── app/
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx              # shared authenticated layout (sidebar + topbar)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx            # course list
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # course detail
│   │   │       └── assignments/
│   │   │           └── [assignmentId]/
│   │   │               └── page.tsx  # assignment detail + submission
│   │   ├── submissions/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # submission status + results
│   │   └── admin/
│   │       └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── layout.tsx                  # root layout — mounts Providers
│
├── components/                     # shared reusable components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MainLayout.tsx
│   ├── common/
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   └── [feature]/                  # feature-specific components
│
├── hooks/                          # custom React hooks
│   ├── useAuth.ts                  # access session + roles
│   ├── usePolling.ts               # poll endpoint every N seconds
│   └── useToast.ts                 # toast notification helpers
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # openapi-fetch client + JWT middleware
│   │   └── types/
│   │       └── index.ts            # AUTO-GENERATED — never edit manually
│   ├── server/
│   │   └── auth.ts                 # NextAuth options (Keycloak)
│   └── store/
│       ├── store.ts                # Redux store factory
│       └── features/
│           ├── loader/
│           │   └── slice.ts
│           └── dialog/
│               └── slice.ts
│
├── providers/
│   ├── Providers.tsx               # root provider composition
│   ├── StoreProvider.tsx           # Redux provider (SSR-safe)
│   └── ThemeProvider.tsx           # MUI theme provider
│
├── styles/
│   └── theme.ts                    # MUI theme config
│
├── middleware.ts                   # NextAuth route protection
│
└── utils/
    ├── env.ts                      # validated env vars (@t3-oss/env-nextjs)
    └── roles.ts                    # role check helpers

---

## Strict rules — follow these in every file

### TypeScript
- Strict mode is ON — never use `any`
- Use `unknown` if type is truly unknown, then narrow it
- All props must have an explicit interface
- All useState must be typed when not inferrable

```ts
// CORRECT
const [courses, setCourses] = useState<CourseResponse[]>([]);
const [error, setError] = useState<string | null>(null);

// WRONG
const [courses, setCourses] = useState([]);
const [data, setData] = useState<any>(null);
```

### File extensions
- Components: .tsx
- Everything else: .ts
- No .js or .jsx files

### API layer
- NEVER write API types manually
- NEVER write fetch/axios calls manually
- ALL API calls go through the openapi-fetch client in src/lib/api/client.ts
- To regenerate types after backend changes: pnpm run generate-api

```ts
// CORRECT
import { apiClient } from '@/lib/api/client';
const { data, error } = await apiClient.GET('/api/courses');

// WRONG
const res = await fetch('http://localhost:8080/api/courses');
const res = await axios.get('/api/courses');
```

### Components
- NEVER use default export for components — use named exports
- ALWAYS define props interface above the component
- NEVER put API calls directly in a component — use a custom hook or server component

```tsx
// CORRECT
interface CourseCardProps {
  course: CourseResponse;
  onClick: (id: number) => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return <div onClick={() => onClick(course.id)}>{course.name}</div>;
};

// WRONG
const CourseCard = (props: any) => { ... }
export default CourseCard;
```

### Server vs Client components
- Default: Server Component (no directive needed)
- Add 'use client' ONLY when you need:
  - useState / useEffect / other hooks
  - onClick or other browser event handlers
  - browser APIs (localStorage, window, etc.)
- NEVER add 'use client' to a layout or a data-fetching component

### Forms
- ALL forms use React Hook Form + Zod
- Define Zod schema first, then infer TypeScript type from it
- NEVER use uncontrolled inputs without React Hook Form

```ts
// CORRECT
const courseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  academicYear: z.number().min(2020).max(2030),
  semester: z.number().min(1).max(2),
});

type CreateCourseFormData = z.infer<typeof courseSchema>;
```

### State management
- Start with useState for local component state
- Use React Context for state shared across a few components
- Use Redux only for complex cross-feature state (ask before reaching for Redux)
- NEVER store server data in Redux — keep it in component state or server components

### Error handling
- ALL API calls must handle error state
- Show error to user via react-toastify
- NEVER silently swallow errors

```ts
// CORRECT
const { data, error } = await apiClient.GET('/api/courses');
if (error) {
  toast.error('Failed to load courses');
  return;
}

// WRONG
const { data } = await apiClient.GET('/api/courses');
// ignoring error
```

### Routing
- Use Next.js App Router file-based routing
- NEVER use React Router
- Protected pages live under src/app/(protected)/
- Public pages live under src/app/(auth)/

### Role-based rendering
- Use the useAuth hook to get current role
- NEVER hardcode role strings — import from src/utils/roles.ts

```tsx
// CORRECT
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/utils/roles';

const { role } = useAuth();
if (role === Role.TEACHER) { ... }

// WRONG
if (role === 'TEACHER') { ... }
```

---

## Environment variables

Required in .env.local (never commit this file):
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                    # generate: openssl rand -base64 32
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=university-grader
KEYCLOAK_CLIENT_ID=grader-frontend
KEYCLOAK_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:8080
```

All env vars are validated in src/utils/env.ts using @t3-oss/env-nextjs.
NEVER access process.env directly — always use the validated env object.

---

## Commands

```bash
pnpm dev              # start dev server
pnpm build            # production build
pnpm lint             # ESLint
pnpm tsc:test         # TypeScript check
pnpm test:vitest      # run unit tests
pnpm generate-api     # regenerate API types from Spring Boot
```

---

## How to add a new page

1. Create file: src/app/(protected)/[feature]/page.tsx
2. If it needs client interactivity: add 'use client' at top
3. If it fetches data: prefer server component (no 'use client')
4. Add link to Sidebar.tsx
5. Add role guard if needed (TEACHER/ADMIN only pages)

## How to add a new component

1. Create file: src/components/[feature]/ComponentName.tsx
2. Define props interface
3. Export as named export
4. If it needs MUI: import from @mui/material
5. Never import from @mui/icons-material in server components

## How to add a new API call

1. Run pnpm generate-api (if backend has new endpoints)
2. Use apiClient from src/lib/api/client.ts
3. Handle both data and error
4. Show toast on error

---

## Learning notes
This is also a learning project. When implementing something new:
- Explain what you are doing and why
- Point out any patterns worth understanding
- If there are multiple approaches, briefly mention the tradeoff
