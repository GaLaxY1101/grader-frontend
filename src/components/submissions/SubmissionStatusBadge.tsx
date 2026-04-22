import Chip from '@mui/material/Chip';

export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' }
> = {
  PENDING: { label: 'Pending', color: 'default' },
  RUNNING: { label: 'Running', color: 'primary' },
  PASSED: { label: 'Passed', color: 'success' },
  FAILED: { label: 'Failed', color: 'error' },
  ERROR: { label: 'Error', color: 'warning' },
};

export const SubmissionStatusBadge = ({ status }: SubmissionStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return <Chip label={config.label} color={config.color} size="small" />;
};
