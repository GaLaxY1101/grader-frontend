'use client';

// TODO: after `pnpm generate-api`, replace (apiClient as any) with the properly-typed client call.
// The cast is temporary until the new submission endpoints are in the generated types.

import { apiClient } from '@/lib/api/client';
import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface SubmissionFormProps {
  assignmentId: number;
  language?: string | null;
  existingSubmissionId?: number | null;
}

export const SubmissionForm = ({
  assignmentId,
  language,
  existingSubmissionId,
}: SubmissionFormProps) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Code cannot be empty');
      return;
    }
    setIsSubmitting(true);
    try {
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
      router.push(`/submissions/${(data as { id: number }).id}`);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Submit your solution
        </Typography>
        {language != null && (
          <Chip label={language} size="small" variant="outlined" color="primary" />
        )}
      </Box>

      {existingSubmissionId != null && (
        <Alert severity="info" sx={{ mb: 1 }}>
          You have a previous submission.{' '}
          <a href={`/submissions/${existingSubmissionId}`} style={{ color: 'inherit' }}>
            View it
          </a>
          . Submitting again will create a new attempt.
        </Alert>
      )}

      <TextField
        label="Source code"
        multiline
        minRows={12}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={
          language != null ? `// Write your ${language} solution here` : '// Your solution'
        }
        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
        fullWidth
        required
      />

      <Box>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!code.trim()}
        >
          Submit
        </LoadingButton>
      </Box>
    </Box>
  );
};
