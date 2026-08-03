import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { getAssignmentsByCourse } from '@/lib/api/assignments';
import { listMyCourseSubmissions } from '@/lib/api/submissions';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function CourseAssignmentsTab({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const canManage = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);
  const isStudent = roles.includes(Role.STUDENT);

  let assignments: Awaited<ReturnType<typeof getAssignmentsByCourse>>;
  try {
    assignments = await getAssignmentsByCourse(courseId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  const assignmentList = assignments ?? [];

  const mySubmissions = isStudent ? await listMyCourseSubmissions(courseId) : [];
  const gradeByAssignment = new Map<number, number | null>(
    mySubmissions.map((s) => [s.assignmentId, s.grade]),
  );

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
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
              variant="contained"
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
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                myGrade={
                  isStudent && assignment.id != null
                    ? (gradeByAssignment.get(assignment.id) ?? null)
                    : undefined
                }
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
