import { CoursesResults } from '@/components/courses/CoursesResults';
import { CoursesToolbar } from '@/components/courses/CoursesToolbar';
import { CreateCourseButton } from '@/components/courses/CreateCourseButton';
import { getCourses } from '@/lib/api/courses';
import { getGroups } from '@/lib/api/groups';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

interface CoursesPageBodyProps {
  isActive: boolean;
  title: string;
  subtitle: string;
  emptyDescription: string;
  canCreate: boolean;
  query: string;
  groupId: number | null;
  page: number;
}

export const CoursesPageBody = async ({
  isActive,
  title,
  subtitle,
  emptyDescription,
  canCreate,
  query,
  groupId,
  page,
}: CoursesPageBodyProps) => {
  let coursesPage: Awaited<ReturnType<typeof getCourses>>;
  let groups: Awaited<ReturnType<typeof getGroups>>;
  try {
    [coursesPage, groups] = await Promise.all([
      getCourses({
        query: query.trim() === '' ? undefined : query.trim(),
        groupId: groupId ?? undefined,
        isActive,
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
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          </Box>
          {canCreate && <CreateCourseButton />}
        </CardContent>
        <Divider />
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <CoursesToolbar groups={groups ?? []} currentQuery={query} currentGroupId={groupId} />
        </CardContent>
      </Card>

      <CoursesResults
        courses={coursesPage?.content ?? []}
        currentPage={coursesPage?.page ?? 0}
        totalPages={coursesPage?.totalPages ?? 0}
        totalElements={coursesPage?.totalElements ?? 0}
        emptyDescription={
          hasFilters ? 'Try adjusting the search or group filter' : emptyDescription
        }
      />
    </Box>
  );
};
