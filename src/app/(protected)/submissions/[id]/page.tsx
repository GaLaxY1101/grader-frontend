import { SubmissionStatusBadge } from '@/components/submissions/SubmissionStatusBadge';
import { getSubmissionById, listAttempts } from '@/lib/api/submissions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const submissionId = Number(params.id);

  let submission: Awaited<ReturnType<typeof getSubmissionById>>;
  let attempts: Awaited<ReturnType<typeof listAttempts>>;

  try {
    [submission, attempts] = await Promise.all([
      getSubmissionById(submissionId),
      listAttempts(submissionId),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load submission';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        {/* Toolbar row */}
        <CardContent
          sx={{
            py: 1.5,
            px: 3,
            '&:last-child': { pb: 1.5 },
          }}
        >
          <Button
            component={Link}
            href={`/courses`}
            startIcon={<ArrowBackIcon />}
            variant="text"
            color="inherit"
            size="small"
          >
            Back
          </Button>
        </CardContent>
        <Divider />

        {/* Hero + summary */}
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" fontWeight={600}>
              Submission
            </Typography>
            <SubmissionStatusBadge status={submission.status} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {submission.score != null && (
              <Chip label={`Latest: ${submission.score} pts`} size="small" variant="outlined" />
            )}
            {submission.bestScore != null && (
              <Chip
                label={`Best: ${submission.bestScore} pts`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            <Chip
              label={`${submission.attemptCount} attempt${submission.attemptCount === 1 ? '' : 's'}`}
              size="small"
              variant="outlined"
            />
            <Typography component="span" color="text.disabled" sx={{ lineHeight: 1 }}>
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {submission.studentEmail}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Attempts card */}
      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: attempts.length === 0 ? 3 : 0 } }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: attempts.length === 0 ? 1.5 : 2 }}>
            Attempts ({attempts.length})
          </Typography>

          {attempts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No attempts yet.
            </Typography>
          ) : (
            <List disablePadding sx={{ mx: -3 }}>
              {attempts.map((attempt, index) => (
                <Box key={attempt.id}>
                  {index === 0 && <Divider />}
                  <ListItem
                    disableGutters
                    sx={{ px: 3, py: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}
                    component={Link}
                    href={`/attempts/${attempt.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 13 }}
                      >
                        #{attempt.attemptNumber}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Attempt #${attempt.attemptNumber}`}
                      secondary={new Date(attempt.submittedAt).toLocaleString()}
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                      <SubmissionStatusBadge status={attempt.status} />
                      {attempt.score != null && (
                        <Chip label={`${attempt.score} pts`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
