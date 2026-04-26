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
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
});

type FormData = z.infer<typeof schema>;

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateUserDialog = ({ open, onClose }: CreateUserDialogProps) => {
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
    defaultValues: { role: 'STUDENT' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { error } = await apiClient.POST('/api/v1/users', {
        body: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          role: data.role,
        },
      });

      if (error) {
        toast.error('Failed to create user');
        return;
      }

      toast.success('User created successfully');
      reset();
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add User</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              required
              error={errors.email != null}
              helperText={errors.email?.message}
              fullWidth
            />
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
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={errors.role != null}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select {...field} labelId="role-label" label="Role">
                    <MenuItem value="STUDENT">Student</MenuItem>
                    <MenuItem value="TEACHER">Teacher</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              )}
            />
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
