import { CoursesResults } from '@/components/courses/CoursesResults';
import { CoursesToolbar } from '@/components/courses/CoursesToolbar';
import { CreateCourseButton } from '@/components/courses/CreateCourseButton';
import { getCourses } from '@/lib/api/courses';
import { getGroups } from '@/lib/api/groups';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';

function getSubtitle(roles: string[]): string {
  if (roles.includes(Role.ADMIN)) return 'All courses';
  if (roles.includes(Role.TEACHER)) return 'Courses you teach';
  return 'Your enrolled courses';
}

function getEmptyDescription(roles: string[]): string {
  if (roles.includes(Role.TEACHER)) return "You haven't created any courses yet";
  return 'You are not enrolled in any courses yet';
}

interface CoursesPageProps {
  searchParams: {
    query?: string;
    groupId?: string;
    page?: string;
  };
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function parseGroupId(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const canCreate = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  const query = searchParams.query ?? '';
  const groupId = parseGroupId(searchParams.groupId);
  const page = parsePage(searchParams.page);

  let coursesPage: Awaited<ReturnType<typeof getCourses>>;
  let groups: Awaited<ReturnType<typeof getGroups>>;
  try {
    [coursesPage, groups] = await Promise.all([
      getCourses({
        query: query.trim() === '' ? undefined : query.trim(),
        groupId: groupId ?? undefined,
        page,
      }),
      getGroups(),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  const hasFilters = query.trim() !== '' || groupId != null;

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Section 1: header + filters — grouped in a card */}
      <Card>
        <CardContent
          sx={{
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:last-child': { pb: 2 },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}
            >
              Courses
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {getSubtitle(roles)}
            </Typography>
          </Box>
          {canCreate && <CreateCourseButton />}
        </CardContent>
        <Divider />
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <CoursesToolbar groups={groups ?? []} currentQuery={query} currentGroupId={groupId} />
        </CardContent>
      </Card>

      {/* Section 2: course cards */}
      <CoursesResults
        courses={coursesPage?.content ?? []}
        currentPage={coursesPage?.page ?? 0}
        totalPages={coursesPage?.totalPages ?? 0}
        totalElements={coursesPage?.totalElements ?? 0}
        emptyDescription={
          hasFilters ? 'Try adjusting the search or group filter' : getEmptyDescription(roles)
        }
      />
    </Box>
  );
}
