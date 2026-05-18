'use client';

import { apiClient } from '@/lib/api/client';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  faculty: z.string().optional(),
  speciality: z.string().optional(),
  yearOfCreation: z.number().min(2000, 'Year must be 2000 or later').max(2100),
});

type FormData = z.infer<typeof schema>;

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateGroupDialog = ({ open, onClose }: CreateGroupDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { yearOfCreation: new Date().getFullYear() },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { error } = await apiClient.POST('/api/groups', {
        body: {
          code: data.code,
          faculty: data.faculty || undefined,
          speciality: data.speciality || undefined,
          yearOfCreation: data.yearOfCreation,
        },
      });

      if (error) {
        toast.error('Failed to create group');
        return;
      }

      toast.success('Group created successfully');
      reset();
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Group</DialogTitle>
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
