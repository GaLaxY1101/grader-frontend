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
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type CourseTemplateDetailResponse = components['schemas']['CourseTemplateDetailResponse'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type EditTemplateFormData = z.infer<typeof schema>;

interface EditTemplateDialogProps {
  template: CourseTemplateDetailResponse;
  open: boolean;
  onClose: () => void;
}

export const EditTemplateDialog = ({ template, open, onClose }: EditTemplateDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTemplateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template.name ?? '',
      description: template.description ?? '',
    },
  });

  useEffect(() => {
    reset({ name: template.name ?? '', description: template.description ?? '' });
  }, [template, reset]);

  const onSubmit = async (data: EditTemplateFormData) => {
    if (template.id == null) return;
    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT('/api/templates/{id}', {
        params: { path: { id: template.id } },
        body: { name: data.name, description: data.description || undefined },
      });
      if (error) {
        toast.error('Failed to update template');
        return;
      }
      toast.success('Template updated');
      onClose();
      router.refresh();
    } catch {
      toast.error('Failed to update template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Template</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              {...register('name')}
              label="Template name"
              required
              error={errors.name != null}
              helperText={errors.name?.message}
              fullWidth
            />
            <TextField
              {...register('description')}
              label="Description"
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
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
