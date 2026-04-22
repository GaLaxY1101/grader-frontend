import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { CreateAssignmentButton } from '@/components/assignments/CreateAssignmentButton';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { EditCourseButton } from '@/components/courses/EditCourseButton';
import { getAssignmentsByCourse } from '@/lib/api/assignments';
import { getCourseById, getCourseStudents } from '@/lib/api/courses';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

function getInitials(firstName: string | undefined, lastName: string | undefined): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

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
      {/* Header: back button + edit action */}
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
        {canManage && course != null && <EditCourseButton course={course} />}
      </Box>

      <Stack spacing={4}>
        {/* Course metadata */}
        {course != null && <CourseInfoCard course={course} />}

        {/* Assignments section */}
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Assignments
            </Typography>
            {canManage && <CreateAssignmentButton courseId={courseId} />}
          </Box>

          {assignmentList.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="Assignments will appear here once added."
            />
          ) : (
            <Stack spacing={2}>
              {assignmentList.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </Stack>
          )}
        </Box>

        {/* Students section — TEACHER / ADMIN only */}
        {canManage && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Students ({studentList.length})
              </Typography>
              <Button variant="outlined" size="small" disabled>
                + Add
              </Button>
            </Box>

            {studentList.length === 0 ? (
              <EmptyState
                title="No students enrolled"
                description="Enroll students to see them here."
              />
            ) : (
              <List disablePadding>
                {studentList.map((student) => (
                  <ListItem key={student.studentId} disableGutters sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                        {getInitials(student.firstName, student.lastName)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || '—'}
                      secondary={student.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
