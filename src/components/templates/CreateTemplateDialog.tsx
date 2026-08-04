'use client';

import { apiClient } from '@/lib/api/client';
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

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CreateTemplateFormData = z.infer<typeof schema>;

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateTemplateDialog = ({ open, onClose }: CreateTemplateDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateTemplateFormData) => {
    setSubmitting(true);
    try {
      const { data: created, error } = await apiClient.POST('/api/templates', {
        body: { name: data.name, description: data.description || undefined },
      });
      if (error || created?.id == null) {
        toast.error('Failed to create template');
        return;
      }
      toast.success('Template created');
      handleClose();
      router.push(`/templates/${created.id}`);
    } catch {
      toast.error('Failed to create template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Template</DialogTitle>
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
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={submitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
