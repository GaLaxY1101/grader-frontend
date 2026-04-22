'use client';

// TODO: after `pnpm generate-api`, replace (apiClient as any) with the properly-typed client call.

import {
  SubmissionStatusBadge,
  type SubmissionStatus,
} from '@/components/submissions/SubmissionStatusBadge';
import { usePolling } from '@/hooks/usePolling';
import { apiClient } from '@/lib/api/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useCallback } from 'react';

interface StatusSnapshot {
  id: number;
  status: SubmissionStatus;
  score: number | null;
  pipelineOutput: string | null;
}

const TERMINAL_STATUSES: SubmissionStatus[] = ['PASSED', 'FAILED', 'ERROR'];

export default function SubmissionStatusPage({ params }: { params: { id: string } }) {
  const submissionId = Number(params.id);

  const fetcher = useCallback(async (): Promise<StatusSnapshot> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (apiClient as any).GET('/api/submissions/{id}/status', {
      params: { path: { id: submissionId } },
    });
    if (error || data == null) throw new Error('Failed to fetch submission status');
    return data as StatusSnapshot;
  }, [submissionId]);

  const {
    data: status,
    isLoading,
    error,
  } = usePolling(fetcher, {
    intervalMs: 3000,
    stopWhen: (d) => TERMINAL_STATUSES.includes(d.status),
  });

  return (
    <Box sx={{ p: 4 }}>
      <Button
        component={Link}
        href="/courses"
        startIcon={<ArrowBackIcon />}
        variant="text"
        color="inherit"
        sx={{ mb: 3 }}
      >
        Back to courses
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Submission #{submissionId}
      </Typography>

      {error != null && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Status
            </Typography>
            {isLoading && status == null ? (
              <CircularProgress size={20} />
            ) : status != null ? (
              <>
                <SubmissionStatusBadge status={status.status} />
                {(status.status === 'PENDING' || status.status === 'RUNNING') && (
                  <CircularProgress size={16} thickness={5} />
                )}
              </>
            ) : null}
          </Box>

          {status?.score != null && (
            <Box sx={{ mb: 2 }}>
              <Chip label={`Score: ${status.score} pts`} color="primary" variant="outlined" />
            </Box>
          )}

          {status?.pipelineOutput != null && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Pipeline output
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  maxHeight: 400,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {status.pipelineOutput}
              </Box>
            </>
          )}

          {status != null &&
            TERMINAL_STATUSES.includes(status.status) &&
            status.pipelineOutput == null && (
              <Typography variant="body2" color="text.secondary">
                No pipeline output available.
              </Typography>
            )}
        </CardContent>
      </Card>
    </Box>
  );
}
