'use client';

import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import { apiClient } from '@/lib/api/client';
import { formatCpp } from '@/utils/formatCpp';
import Editor from '@monaco-editor/react';
import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

// Maps backend language enum values to Monaco language IDs
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

interface SubmissionFormProps {
  assignmentId: number;
  language?: string | null;
  existingSubmissionId?: number | null;
  testMode?: string | null;
  functionSignature?: string | null;
  lastAttemptCode?: string | null;
}

export const SubmissionForm = ({
  assignmentId,
  language,
  existingSubmissionId,
  functionSignature,
  lastAttemptCode,
}: SubmissionFormProps) => {
  const router = useRouter();
  const [code, setCode] = useState(lastAttemptCode ?? functionSignature ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const handleFormat = () => {
    setCode((current) => formatCpp(current));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Code cannot be empty');
      return;
    }
    setIsSubmitting(true);
    try {
      // Validate compilation before submitting
      const { data: compileResult, error: compileError } = await apiClient.POST(
        '/api/assignments/{assignmentId}/compile',
        {
          params: { path: { assignmentId } },
          body: { solutionCode: code },
        },
      );
      if (compileError || !compileResult) {
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
      toast.success('Submitted! Waiting for results…');
      router.push(`/attempts/${(data as { id: number }).id}`);
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
        {existingSubmissionId != null && (
          <Alert severity="info" sx={{ mb: 1 }}>
            You have a previous submission.{' '}
            <a href={`/submissions/${existingSubmissionId}`} style={{ color: 'inherit' }}>
              View it
            </a>
            . Submitting again will create a new attempt.
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
            value={code}
            onChange={(value) => setCode(value ?? '')}
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
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 4,
              wordWrap: 'on',
              lineNumbersMinChars: 3,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!code.trim()}
          >
            Submit
          </LoadingButton>
          <Button variant="outlined" size="small" onClick={handleFormat} disabled={isSubmitting}>
            Format Code
          </Button>
        </Box>
      </Box>
      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
};
