'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type GroupResponse = components['schemas']['GroupResponse'];

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  faculty: z.string().optional(),
  speciality: z.string().optional(),
  yearOfCreation: z.number().min(2000, 'Year must be 2000 or later').max(2100),
});

type FormData = z.infer<typeof schema>;

interface EditGroupDialogProps {
  group: GroupResponse | null;
  open: boolean;
  onClose: () => void;
}

export const EditGroupDialog = ({ group, open, onClose }: EditGroupDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (group != null) {
      reset({
        code: group.code ?? '',
        name: group.name ?? '',
        faculty: group.faculty ?? '',
        speciality: group.speciality ?? '',
        yearOfCreation: group.yearOfCreation ?? new Date().getFullYear(),
      });
    }
  }, [group, reset]);

  const onSubmit = async (data: FormData) => {
    if (group?.id == null) return;

    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT('/api/groups/{id}', {
        params: { path: { id: group.id } },
        body: {
          code: data.code,
          name: data.name,
          faculty: data.faculty || undefined,
          speciality: data.speciality || undefined,
          yearOfCreation: data.yearOfCreation,
        },
      });

      if (error) {
        toast.error('Failed to update group');
        return;
      }

      toast.success('Group updated successfully');
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Group</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('code')}
                label="Code"
                required
                error={errors.code != null}
                helperText={errors.code?.message}
                fullWidth
              />
              <TextField
                {...register('yearOfCreation', { valueAsNumber: true })}
                label="Year of Creation"
                type="number"
                required
                error={errors.yearOfCreation != null}
                helperText={errors.yearOfCreation?.message}
                fullWidth
              />
            </Stack>
            <TextField
              {...register('name')}
              label="Name"
              required
              error={errors.name != null}
              helperText={errors.name?.message}
              fullWidth
            />
            <TextField
              {...register('faculty')}
              label="Faculty"
              error={errors.faculty != null}
              helperText={errors.faculty?.message}
              fullWidth
            />
            <TextField
              {...register('speciality')}
              label="Speciality"
              error={errors.speciality != null}
              helperText={errors.speciality?.message}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={submitting}>
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
