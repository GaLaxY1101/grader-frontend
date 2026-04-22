import type { components } from '@/lib/api/types/index';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

type AssignmentResponse = components['schemas']['AssignmentResponse'];

interface AssignmentCardProps {
  assignment: AssignmentResponse;
}

function getDeadlineColor(
  deadline: string | undefined,
): 'error.main' | 'warning.main' | 'text.secondary' {
  if (deadline == null) return 'text.secondary';
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  if (diffMs < 0) return 'error.main';
  if (diffMs <= 3 * 24 * 60 * 60 * 1000) return 'warning.main';
  return 'text.secondary';
}

function formatDeadline(deadline: string | undefined): string {
  if (deadline == null) return 'No deadline';
  return `Due ${new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const deadlineColor = getDeadlineColor(assignment.deadline);
  const deadlineLabel = formatDeadline(assignment.deadline);

  const isProgramming = assignment.programmingTask != null;
  const isFileUpload = assignment.fileUploadTask != null;

  return (
    <Box
      component={Link}
      href={`/courses/${assignment.courseId}/assignments/${assignment.id}`}
      sx={{ textDecoration: 'none', display: 'block' }}
    >
      <Card
        variant="outlined"
        sx={{
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 2.5,
            '&:last-child': { pb: 2.5 },
          }}
        >
          {/* Title + score badge */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {assignment.title ?? '—'}
            </Typography>
            <Chip
              label={`${assignment.maxScore ?? 0} pts`}
              size="small"
              color="primary"
              sx={{ flexShrink: 0 }}
            />
          </Box>

          {/* Description — truncated to 2 lines */}
          {assignment.description != null && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {assignment.description}
            </Typography>
          )}

          {/* Deadline + type badge */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}
          >
            <Typography variant="body2" sx={{ color: deadlineColor }}>
              {deadlineLabel}
            </Typography>
            {isProgramming ? (
              <Chip
                label="Code"
                icon={<CodeIcon fontSize="small" />}
                size="small"
                variant="outlined"
                color="primary"
              />
            ) : isFileUpload ? (
              <Chip
                label="File"
                icon={<UploadFileIcon fontSize="small" />}
                size="small"
                variant="outlined"
                color="success"
              />
            ) : (
              <Chip
                label="Text"
                icon={<ArticleIcon fontSize="small" />}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
