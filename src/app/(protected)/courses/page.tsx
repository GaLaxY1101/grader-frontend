import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { CoursesGrid } from '@/components/courses/CoursesGrid';
import { getCourses } from '@/lib/api/courses';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

export default async function CoursesPage() {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];

  const canCreate = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  let courses: Awaited<ReturnType<typeof getCourses>>;
  try {
    courses = await getCourses();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  const courseList = courses ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <PageHeader
        title="Courses"
        subtitle={getSubtitle(roles)}
        action={
          canCreate ? (
            <Button variant="contained" disabled>
              Create Course
            </Button>
          ) : undefined
        }
      />

      {courseList.length === 0 ? (
        <EmptyState title="No courses yet" description={getEmptyDescription(roles)} />
      ) : (
        <CoursesGrid courses={courseList} />
      )}
    </Box>
  );
}
