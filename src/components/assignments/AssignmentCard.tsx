import type { components } from '@/lib/api/types/index';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CodeIcon from '@mui/icons-material/Code';
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

type DeadlineStatus = 'overdue' | 'urgent' | 'upcoming';

function getDeadlineStatus(deadline: string | undefined): DeadlineStatus | null {
  if (deadline == null) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return 'overdue';
  if (diffMs <= 3 * 24 * 60 * 60 * 1000) return 'urgent';
  return 'upcoming';
}

function formatDeadline(deadline: string | undefined): string {
  if (deadline == null) return 'No deadline';
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const deadlineStyles: Record<DeadlineStatus, { color: string; bg: string; label: string }> = {
  overdue: { color: '#B91C1C', bg: '#FFF1F2', label: 'Overdue' },
  urgent: { color: '#B45309', bg: '#FFFBEB', label: 'Due soon' },
  upcoming: { color: '#0369A1', bg: '#F0F9FF', label: 'Upcoming' },
};

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const status = getDeadlineStatus(assignment.deadline);
  const deadlineLabel = formatDeadline(assignment.deadline);

  const hasCodeCheck = assignment.programmingTask != null;

  const style = status != null ? deadlineStyles[status] : null;

  return (
    <Box
      component={Link}
      href={`/courses/${assignment.courseId}/assignments/${assignment.id}`}
      sx={{ textDecoration: 'none', display: 'block' }}
    >
      <Card
        sx={{
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0px 8px 20px -4px rgba(15,23,42,0.12)',
            transform: 'translateY(-2px)',
            borderColor: 'primary.light',
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            p: 2.5,
            '&:last-child': { pb: 2.5 },
          }}
        >
          {/* Title row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                fontSize: '0.9375rem',
                color: 'text.primary',
              }}
            >
              {assignment.title ?? '—'}
            </Typography>
            <Chip
              label={`${assignment.maxScore ?? 0} pts`}
              size="small"
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                fontSize: '0.75rem',
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                borderRadius: '6px',
              }}
            />
          </Box>

          {/* Description */}
          {assignment.description != null && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.55,
              }}
            >
              {assignment.description}
            </Typography>
          )}

          {/* Footer: deadline + type */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
              pt: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Deadline */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon
                sx={{
                  fontSize: 14,
                  color: style?.color ?? 'text.secondary',
                }}
              />
              {style != null ? (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: style.color,
                      backgroundColor: style.bg,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {style.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {deadlineLabel}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {deadlineLabel}
                </Typography>
              )}
            </Box>

            {/* Code check chip (only when enabled) */}
            {hasCodeCheck && (
              <Chip
                label="Code Check"
                icon={<CodeIcon sx={{ fontSize: '14px !important' }} />}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  backgroundColor: '#EEF2FF',
                  color: '#4338CA',
                  borderRadius: '5px',
                  '& .MuiChip-icon': { color: '#4338CA' },
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
