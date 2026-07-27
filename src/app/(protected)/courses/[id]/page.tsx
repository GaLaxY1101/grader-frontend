import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { EditCourseButton } from '@/components/courses/EditCourseButton';
import { ManageStudentsButton } from '@/components/courses/ManageStudentsButton';
import { getAssignmentsByCourse } from '@/lib/api/assignments';
import { getCourseById, getCourseStudents } from '@/lib/api/courses';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const canManage = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  let course: Awaited<ReturnType<typeof getCourseById>>;
  let assignments: Awaited<ReturnType<typeof getAssignmentsByCourse>>;
  let students: Awaited<ReturnType<typeof getCourseStudents>>;

  try {
    [course, assignments, students] = await Promise.all([
      getCourseById(courseId),
      getAssignmentsByCourse(courseId),
      getCourseStudents(courseId),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  const assignmentList = assignments ?? [];
  const studentList = students ?? [];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header: back button + course actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          href="/courses"
          startIcon={<ArrowBackIcon />}
          variant="text"
          color="inherit"
        >
          Back to courses
        </Button>
        {canManage && (
          <Stack direction="row" spacing={1}>
            <ManageStudentsButton courseId={courseId} enrolledStudents={studentList} />
            {course != null && <EditCourseButton course={course} />}
          </Stack>
        )}
      </Box>

      <Stack spacing={4}>
        {/* Course metadata */}
        {course != null && <CourseInfoCard course={course} />}

        {/* Assignments section */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                Assignments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assignmentList.length} assignment{assignmentList.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            {canManage && (
              <Button
                component={Link}
                href={`/courses/${courseId}/assignments/new`}
                variant="outlined"
                size="small"
              >
                + Add
              </Button>
            )}
          </Box>

          {assignmentList.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="Assignments will appear here once added."
            />
          ) : (
            <Stack spacing={1.5}>
              {assignmentList.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
