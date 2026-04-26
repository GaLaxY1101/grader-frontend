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
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type UserResponse = components['schemas']['UserResponse'];

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditUserDialogProps {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}

export const EditUserDialog = ({ user, open, onClose }: EditUserDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user != null) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        isActive: user.isActive ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    if (user?.id == null) return;

    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT('/api/v1/users/{id}', {
        params: { path: { id: user.id } },
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          isActive: data.isActive,
        },
      });

      if (error) {
        toast.error('Failed to update user');
        return;
      }

      toast.success('User updated successfully');
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {user?.email && (
              <Typography variant="body2" color="text.secondary">
                Email: <strong>{user.email}</strong> (cannot be changed)
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('firstName')}
                label="First Name"
                required
                error={errors.firstName != null}
                helperText={errors.firstName?.message}
                fullWidth
              />
              <TextField
                {...register('lastName')}
                label="Last Name"
                required
                error={errors.lastName != null}
                helperText={errors.lastName?.message}
                fullWidth
              />
            </Stack>
            <TextField
              {...register('phone')}
              label="Phone"
              error={errors.phone != null}
              helperText={errors.phone?.message}
              fullWidth
            />
            <TextField
              {...register('dateOfBirth')}
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              error={errors.dateOfBirth != null}
              helperText={errors.dateOfBirth?.message}
              fullWidth
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active"
                />
              )}
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
