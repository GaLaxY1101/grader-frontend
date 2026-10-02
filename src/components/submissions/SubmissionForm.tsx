'use client';

import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import {
  SubmissionStatusBadge,
  type SubmissionStatus,
} from '@/components/submissions/SubmissionStatusBadge';
import { TestReportView } from '@/components/submissions/TestReportView';
import { apiClient } from '@/lib/api/client';
import type { AttemptResponse } from '@/lib/api/submissions';
import Editor from '@monaco-editor/react';
import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const MONACO_LANGUAGE: Record<string, string> = {
  C: 'c',
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
};

function toMonacoLanguage(lang: string | null | undefined): string {
  if (lang == null) return 'plaintext';
  return MONACO_LANGUAGE[lang.toUpperCase()] ?? lang.toLowerCase();
}

const TERMINAL_STATUSES: SubmissionStatus[] = ['PASSED', 'FAILED', 'ERROR'];

const isRunningStatus = (status: SubmissionStatus | undefined | null) =>
  status != null && !TERMINAL_STATUSES.includes(status);

interface SubmissionFormProps {
  assignmentId: number;
  language?: string | null;
  functionSignature?: string | null;
  initialSubmissionId?: number | null;
  initialAttempts: AttemptResponse[];
}

export const SubmissionForm = ({
  assignmentId,
  language,
  functionSignature,
  initialSubmissionId,
  initialAttempts,
}: SubmissionFormProps) => {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptResponse[]>(initialAttempts);
  const [submissionId, setSubmissionId] = useState<number | null>(initialSubmissionId ?? null);

  const latestAttempt = attempts[0] ?? null;
  const latestStatus = latestAttempt?.status as SubmissionStatus | undefined;
  const running = isRunningStatus(latestStatus);
  const wasRunningRef = useRef(running);

  const [code, setCode] = useState<string>(latestAttempt?.codeContent ?? functionSignature ?? '');
  const [dirty, setDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Poll attempts while the latest one is still running.
  useEffect(() => {
    if (submissionId == null || !running) return;
    let cancelled = false;
    const tick = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (apiClient as any).GET(
        '/api/submissions/{submissionId}/attempts',
        { params: { path: { submissionId } } },
      );
      if (cancelled || error || data == null) return;
      setAttempts(data as AttemptResponse[]);
    };
    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [submissionId, running]);

  // Sync editor with the latest attempt code when the user hasn't touched it.
  useEffect(() => {
    if (dirty) return;
    setCode(latestAttempt?.codeContent ?? functionSignature ?? '');
  }, [latestAttempt?.id, latestAttempt?.codeContent, dirty, functionSignature]);

  // Refresh the server-rendered submission summary once the latest attempt lands.
  useEffect(() => {
    if (wasRunningRef.current && !running) {
      router.refresh();
    }
    wasRunningRef.current = running;
  }, [running, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (running) return;
    if (!code.trim()) {
      toast.error('Code cannot be empty');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: compileResult, error: compileErr } = await apiClient.POST(
        '/api/assignments/{assignmentId}/compile',
        {
          params: { path: { assignmentId } },
          body: { solutionCode: code },
        },
      );
      if (compileErr || !compileResult) {
        toast.error('Failed to validate compilation');
        setIsSubmitting(false);
        return;
      }
      if (!compileResult.success) {
        setCompileError(compileResult.output ?? 'Unknown error');
        setIsSubmitting(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (apiClient as any).POST(
        '/api/assignments/{assignmentId}/submissions',
        {
          params: { path: { assignmentId } },
          body: { codeContent: code },
        },
      );
      if (error || data == null) {
        toast.error('Submission failed. Please try again.');
        return;
      }
      const attempt = data as AttemptResponse;
      setSubmissionId(attempt.submissionId);
      setAttempts((prev) => [attempt, ...prev]);
      setDirty(false);
      toast.success('Submitted! Waiting for results…');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {running && (
          <Alert severity="info" icon={<CircularProgress size={16} />}>
            Attempt #{latestAttempt?.attemptNumber} is being tested. You cannot edit the code or
            submit again until it finishes.
          </Alert>
        )}

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Editor
            height="400px"
            language={toMonacoLanguage(language)}
            theme="vs"
            value={code}
            onChange={(value) => {
              setCode(value ?? '');
              setDirty(true);
            }}
            loading={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            }
            options={{
              readOnly: running,
              minimap: { enabled: false },
              fontSize: 13,
              tabSize: 4,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              scrollbar: { alwaysConsumeMouseWheel: false },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={running || !code.trim()}
          >
            Submit
          </LoadingButton>
        </Box>
      </Box>

      {attempts.length > 0 && (
        <Box sx={{ mt: 4 }}>
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
            Attempts ({attempts.length})
          </Typography>
          <List disablePadding>
            <Divider />
            {attempts.map((attempt) => (
              <Box key={attempt.id}>
                <ListItem
                  disableGutters
                  sx={{ px: 0, py: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 13 }}>
                      #{attempt.attemptNumber}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Attempt #${attempt.attemptNumber}`}
                    secondary={new Date(attempt.submittedAt).toLocaleString()}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                    <SubmissionStatusBadge status={attempt.status as SubmissionStatus} />
                    {attempt.score != null && (
                      <Chip label={`${attempt.score} pts`} size="small" variant="outlined" />
                    )}
                  </Box>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>

          {latestAttempt != null &&
            !running &&
            (latestAttempt.testReport?.detailsAvailable ||
              latestAttempt.pipelineOutput != null) && (
              <Box sx={{ mt: 3 }}>
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
                  Latest results (attempt #{latestAttempt.attemptNumber})
                </Typography>
                <TestReportView
                  report={latestAttempt.testReport}
                  pipelineOutput={latestAttempt.pipelineOutput}
                />
              </Box>
            )}
        </Box>
      )}

      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
};
