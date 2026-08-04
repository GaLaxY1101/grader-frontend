'use client';

import { AssignmentFormFields } from '@/components/assignments/AssignmentFormFields';
import {
  assignmentFormSchema,
  buildProgrammingTaskPayload,
  emptyFormDefaults,
  type AssignmentFormValues,
} from '@/components/assignments/assignmentFormSchema';
import { runCompileCheck } from '@/components/assignments/useAssignmentCompileCheck';
import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import { apiClient } from '@/lib/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function NewAssignmentPage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: emptyFormDefaults,
  });

  const onSubmit = async (data: AssignmentFormValues) => {
    setSubmitting(true);
    try {
      const compile = await runCompileCheck(data);
      if (!compile.ok) {
        if (compile.kind === 'compile_error') setCompileError(compile.output);
        return;
      }

      const { error } = await apiClient.POST('/api/courses/{courseId}/assignments', {
        params: { path: { courseId } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          deadline: data.deadline || undefined,
          programmingTask: buildProgrammingTaskPayload(data),
        },
      });

      if (error) {
        toast.error('Failed to create assignment');
        return;
      }

      toast.success('Assignment created');
      router.push(`/courses/${courseId}`);
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ py: 1.5, px: 3, '&:last-child': { pb: 1.5 } }}>
            <Button
              startIcon={<ArrowBackIcon />}
              variant="contained"
              color="inherit"
              size="small"
              onClick={() => router.push(`/courses/${courseId}`)}
            >
              Back to course
            </Button>
          </CardContent>
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
              New Assignment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details below and click Create when ready. Students can attach any files
              to their submission.
            </Typography>
          </CardContent>
        </Card>

        <Paper
          variant="outlined"
          sx={{ borderRadius: '12px', p: { xs: 2.5, sm: 4 }, mt: 4 }}
          component="form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <Stack spacing={2.5}>
            <AssignmentFormFields form={form} showDeadline />

            {form.formState.errors.root != null && (
              <FormHelperText error>{form.formState.errors.root.message}</FormHelperText>
            )}

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="contained"
                color="inherit"
                disabled={submitting}
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={submitting}>
                Create Assignment
              </LoadingButton>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
}
