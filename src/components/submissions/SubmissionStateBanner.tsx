'use client';

import { SubmissionFileState } from '@/utils/assignmentType';
import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';

type State = SubmissionFileState | null | undefined;

const severityFor = (state: State): 'info' | 'warning' | 'success' => {
  switch (state) {
    case SubmissionFileState.SUBMITTED:
      return 'info';
    case SubmissionFileState.RETURNED:
      return 'warning';
    case SubmissionFileState.GRADED:
      return 'success';
    default:
      return 'info';
  }
};

const titleFor = (state: State): string => {
  switch (state) {
    case SubmissionFileState.DRAFT:
      return 'Draft — not turned in yet';
    case SubmissionFileState.SUBMITTED:
      return 'Turned in — awaiting teacher review';
    case SubmissionFileState.RETURNED:
      return 'Returned for redo';
    case SubmissionFileState.GRADED:
      return 'Graded';
    default:
      return 'Not started';
  }
};

export interface SubmissionStateBannerProps {
  fileState: State;
  returnComment?: string | null;
  canTurnIn: boolean;
  onTurnIn: () => void;
  turningIn?: boolean;
}

export const SubmissionStateBanner = ({
  fileState,
  returnComment,
  canTurnIn,
  onTurnIn,
  turningIn = false,
}: SubmissionStateBannerProps) => {
  const showTurnIn =
    fileState === SubmissionFileState.DRAFT || fileState === SubmissionFileState.RETURNED;

  return (
    <Alert severity={severityFor(fileState)} sx={{ alignItems: 'center' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Stack spacing={0.5}>
          <AlertTitle sx={{ mb: 0 }}>{titleFor(fileState)}</AlertTitle>
          {fileState === SubmissionFileState.RETURNED && returnComment && (
            <Typography variant="body2">
              <strong>Teacher note:</strong> {returnComment}
            </Typography>
          )}
        </Stack>
        {showTurnIn && (
          <Button
            variant="contained"
            size="small"
            onClick={onTurnIn}
            disabled={!canTurnIn || turningIn}
          >
            {turningIn ? 'Turning in…' : 'Turn in'}
          </Button>
        )}
      </Stack>
    </Alert>
  );
};
