'use client';

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
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface AttemptStatusSnapshot {
  attemptId: number;
  attemptNumber: number;
  status: SubmissionStatus;
  score: number | null;
  pipelineOutput: string | null;
}

const TERMINAL_STATUSES: SubmissionStatus[] = ['PASSED', 'FAILED', 'ERROR'];

export default function AttemptStatusPage({ params }: { params: { id: string } }) {
  const attemptId = Number(params.id);
  const router = useRouter();

  const fetcher = useCallback(async (): Promise<AttemptStatusSnapshot> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (apiClient as any).GET('/api/attempts/{attemptId}/status', {
      params: { path: { attemptId } },
    });
    if (error || data == null) throw new Error('Failed to fetch attempt status');
    return data as AttemptStatusSnapshot;
  }, [attemptId]);

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
        onClick={() => router.back()}
        startIcon={<ArrowBackIcon />}
        variant="text"
        color="inherit"
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Attempt #{status?.attemptNumber ?? '…'}
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

          {status?.pipelineOutput ? (
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
          ) : status != null && TERMINAL_STATUSES.includes(status.status) ? (
            <Typography variant="body2" color="text.secondary">
              No pipeline output available.
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
