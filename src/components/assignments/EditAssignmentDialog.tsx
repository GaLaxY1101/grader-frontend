'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type AssignmentResponse = components['schemas']['AssignmentResponse'];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  maxScore: z.number().min(1, 'Min 1').max(1000, 'Max 1000'),
  deadline: z.string().optional(),
});

type EditAssignmentFormData = z.infer<typeof schema>;

/** Converts an ISO datetime string to the YYYY-MM-DDTHH:mm format required by datetime-local inputs. */
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditAssignmentDialogProps {
  assignment: AssignmentResponse;
  open: boolean;
  onClose: () => void;
}

export const EditAssignmentDialog = ({ assignment, open, onClose }: EditAssignmentDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAssignmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      maxScore: assignment.maxScore ?? 100,
      deadline: toDatetimeLocal(assignment.deadline),
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditAssignmentFormData) => {
    if (assignment.id == null) return;
    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT('/api/assignments/{id}', {
        params: { path: { id: assignment.id } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          deadline: data.deadline || undefined,
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Assignment</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              {...register('title')}
              label="Title"
              required
              error={errors.title != null}
              helperText={errors.title?.message}
              fullWidth
            />

            <TextField
              {...register('description')}
              label="Description"
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              {...register('maxScore', { valueAsNumber: true })}
              label="Max score"
              type="number"
              required
              error={errors.maxScore != null}
              helperText={errors.maxScore?.message}
              fullWidth
            />

            <TextField
              {...register('deadline')}
              label="Deadline"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
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
  );
};
