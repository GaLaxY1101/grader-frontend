import { GradesTable } from '@/components/grades/GradesTable';
import { getCourseGrades } from '@/lib/api/grades';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CourseGradesTab({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const canView = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  if (!canView) {
    redirect(`/courses/${courseId}`);
  }

  let gradebook: Awaited<ReturnType<typeof getCourseGrades>>;
  try {
    gradebook = await getCourseGrades(courseId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  if (gradebook == null) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">Failed to load grades</Alert>
      </Box>
    );
  }

  return <GradesTable courseId={courseId} gradebook={gradebook} />;
}
