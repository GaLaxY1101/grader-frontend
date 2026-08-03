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
            onClick={() => router.back()}
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="inherit"
            size="small"
          >
            Back
          </Button>
        </CardContent>
        <Divider />

        {/* Hero + status */}
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: status?.score != null ? 2 : 0,
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              Attempt #{status?.attemptNumber ?? '…'}
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
            <Chip label={`Score: ${status.score} pts`} color="primary" variant="outlined" />
          )}
        </CardContent>

        {/* Pipeline output section */}
        {status?.pipelineOutput ? (
          <>
            <Divider />
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  mb: 1.5,
                  display: 'block',
                }}
              >
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
                  m: 0,
                }}
              >
                {status.pipelineOutput}
              </Box>
            </CardContent>
          </>
        ) : status != null && TERMINAL_STATUSES.includes(status.status) ? (
          <>
            <Divider />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No pipeline output available.
              </Typography>
            </CardContent>
          </>
        ) : null}
      </Card>

      {error != null && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
