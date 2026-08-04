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

interface CreateTemplateAssignmentDialogProps {
  templateId: number;
  open: boolean;
  onClose: () => void;
}

export const CreateTemplateAssignmentDialog = ({
  templateId,
  open,
  onClose,
}: CreateTemplateAssignmentDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: emptyFormDefaults,
  });

  useEffect(() => {
    if (!open) form.reset(emptyFormDefaults);
  }, [open, form]);

  const handleClose = () => {
    form.reset(emptyFormDefaults);
    onClose();
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    setSubmitting(true);
    try {
      const compile = await runCompileCheck(data);
      if (!compile.ok) {
        if (compile.kind === 'compile_error') setCompileError(compile.output);
        return;
      }
      const { error } = await apiClient.POST('/api/templates/{templateId}/assignments', {
        params: { path: { templateId } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          programmingTask: buildProgrammingTaskPayload(data),
        },
      });
      if (error) {
        toast.error('Failed to create assignment');
        return;
      }
      toast.success('Assignment created');
      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>New Template Assignment</DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <AssignmentFormFields form={form} showDeadline={false} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" loading={submitting}>
              Create
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
