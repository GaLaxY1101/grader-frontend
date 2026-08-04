'use client';

import { AssignmentFormFields } from '@/components/assignments/AssignmentFormFields';
import {
  assignmentFormSchema,
  buildProgrammingTaskPayload,
  toFormDefaults,
  type AssignmentFormValues,
} from '@/components/assignments/assignmentFormSchema';
import { runCompileCheck } from '@/components/assignments/useAssignmentCompileCheck';
import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type TemplateAssignmentResponse = components['schemas']['TemplateAssignmentResponse'];

interface EditTemplateAssignmentDialogProps {
  assignment: TemplateAssignmentResponse;
  open: boolean;
  onClose: () => void;
}

export const EditTemplateAssignmentDialog = ({
  assignment,
  open,
  onClose,
}: EditTemplateAssignmentDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const hadCodeCheck = assignment.programmingTask != null;

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: toFormDefaults(assignment),
  });

  useEffect(() => {
    form.reset(toFormDefaults(assignment));
  }, [assignment, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    if (assignment.id == null) return;

    if (hadCodeCheck && !data.enableCodeCheck) {
      const confirmed = window.confirm(
        'This will delete the existing code check configuration. Continue?',
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      const compile = await runCompileCheck(data);
      if (!compile.ok) {
        if (compile.kind === 'compile_error') setCompileError(compile.output);
        return;
      }

      const { error } = await apiClient.PUT('/api/template-assignments/{id}', {
        params: { path: { id: assignment.id } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          programmingTask: buildProgrammingTaskPayload(data),
        },
      });

      if (error) {
        toast.error('Failed to update assignment');
        return;
      }

      toast.success('Assignment updated');
      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to update assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Template Assignment</DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <AssignmentFormFields form={form} showDeadline={false} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={submitting}>
              Save changes
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
};
