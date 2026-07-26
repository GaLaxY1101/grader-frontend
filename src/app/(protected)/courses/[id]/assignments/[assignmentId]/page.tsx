import { DeleteAssignmentButton } from '@/components/assignments/DeleteAssignmentButton';
import { EditAssignmentButton } from '@/components/assignments/EditAssignmentButton';
import { SubmissionForm } from '@/components/submissions/SubmissionForm';
import { SubmissionList } from '@/components/submissions/SubmissionList';
import { SubmissionStatusBadge } from '@/components/submissions/SubmissionStatusBadge';
import { getAssignmentById } from '@/lib/api/assignments';
import { getMySubmission, listAttempts, listSubmissionsByAssignment } from '@/lib/api/submissions';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CodeIcon from '@mui/icons-material/Code';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

function formatDeadline(deadline: string | null | undefined): {
  label: string;
  color: 'error' | 'warning' | 'text.secondary';
} {
  if (deadline == null) return { label: 'No deadline', color: 'text.secondary' };
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const label = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (diffDays < 0) return { label, color: 'error' };
  if (diffDays <= 3) return { label, color: 'warning' };
  return { label, color: 'text.secondary' };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: { id: string; assignmentId: string };
}) {
  const courseId = Number(params.id);
  const assignmentId = Number(params.assignmentId);
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const isStudent = roles.includes(Role.STUDENT);
  const canManage = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  let assignment: Awaited<ReturnType<typeof getAssignmentById>>;

  try {
    assignment = await getAssignmentById(assignmentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load assignment';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  // Load role-specific data in parallel
  const [mySubmission, allSubmissions] = await Promise.all([
    isStudent ? getMySubmission(assignmentId) : Promise.resolve(null),
    canManage ? listSubmissionsByAssignment(assignmentId).catch(() => []) : Promise.resolve([]),
  ]);

  // Fetch latest attempt code for pre-filling the editor
  let latestAttemptCode: string | null = null;
  if (mySubmission?.id != null) {
    const attempts = await listAttempts(mySubmission.id).catch(() => []);
    const latest = attempts[attempts.length - 1];
    if (latest != null) {
      latestAttemptCode = latest.codeContent ?? null;
    }
  }

  const deadline = formatDeadline(assignment?.deadline);
  const programmingTask = assignment?.programmingTask;
  const hasCodeCheck = programmingTask != null;

  return (
    <Box sx={{ p: 4 }}>
      {/* Back button + edit action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          href={`/courses/${courseId}`}
          startIcon={<ArrowBackIcon />}
          variant="text"
          color="inherit"
        >
          Back to course
        </Button>
        {canManage && assignment != null && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <EditAssignmentButton assignment={assignment} />
            <DeleteAssignmentButton
              assignmentId={assignment.id!}
              assignmentTitle={assignment.title ?? ''}
              courseId={courseId}
            />
          </Box>
        )}
      </Box>

      <Stack spacing={4}>
        {/* Assignment info card */}
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {assignment?.title ?? '—'}
              </Typography>
              {hasCodeCheck && (
                <Chip label="Code Check" size="small" icon={<CodeIcon />} variant="outlined" />
              )}
            </Box>

            {assignment?.description != null && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
              >
                {assignment.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color={deadline.color}>
                  {deadline.label}
                </Typography>
              </Box>
              <Chip
                label={`Max score: ${assignment?.maxScore ?? '—'}`}
                size="small"
                variant="outlined"
              />
              {programmingTask?.language != null && (
                <Chip
                  label={programmingTask.language}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Student: submission form + latest status */}
        {isStudent && (
          <Box>
            {mySubmission != null && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  My submission
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SubmissionStatusBadge status={mySubmission.status} />
                  {mySubmission.bestScore != null && (
                    <Chip
                      label={`Best: ${mySubmission.bestScore} / ${assignment?.maxScore ?? '?'} pts`}
                      size="small"
                    />
                  )}
                  <Chip
                    label={`${mySubmission.attemptCount} attempt${mySubmission.attemptCount === 1 ? '' : 's'}`}
                    size="small"
                    variant="outlined"
                  />
                  <Button
                    component={Link}
                    href={`/submissions/${mySubmission.id}`}
                    size="small"
                    variant="text"
                  >
                    View attempts
                  </Button>
                </Box>
              </Box>
            )}

            {hasCodeCheck ? (
              <SubmissionForm
                assignmentId={assignmentId}
                language={programmingTask?.language}
                existingSubmissionId={mySubmission?.id}
                testMode={programmingTask?.testMode}
                functionSignature={programmingTask?.functionSignature}
                lastAttemptCode={latestAttemptCode}
              />
            ) : (
              <Alert severity="info">File attachment submissions are coming soon.</Alert>
            )}
          </Box>
        )}

        {/* Teacher/admin: all submissions */}
        {canManage && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Submissions ({allSubmissions.length})
            </Typography>
            <SubmissionList submissions={allSubmissions} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
