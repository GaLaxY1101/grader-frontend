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
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type CourseDetailResponse = components['schemas']['CourseDetailResponse'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  academicYear: z.number().min(2020, 'Min year is 2020').max(2040, 'Max year is 2040'),
  semester: z.number().min(1).max(2),
});

type EditCourseFormData = z.infer<typeof schema>;

interface EditCourseDialogProps {
  course: CourseDetailResponse;
  open: boolean;
  onClose: () => void;
}

export const EditCourseDialog = ({ course, open, onClose }: EditCourseDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: course.name ?? '',
      description: course.description ?? '',
      academicYear: course.academicYear ?? new Date().getFullYear(),
      semester: course.semester ?? 1,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditCourseFormData) => {
    if (course.id == null) return;
    setSubmitting(true);
    try {
      const { error } = await apiClient.PUT('/api/courses/{id}', {
        params: { path: { id: course.id } },
        body: {
          name: data.name,
          description: data.description || undefined,
          academicYear: data.academicYear,
          semester: data.semester,
        },
      });

      if (error) {
        toast.error('Failed to update course');
        return;
      }

      toast.success('Course updated');
      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Course</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              {...register('name')}
              label="Course name"
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

            <TextField
              {...register('academicYear', { valueAsNumber: true })}
              label="Academic year"
              type="number"
              required
              error={errors.academicYear != null}
              helperText={errors.academicYear?.message ?? 'e.g. 2025 for the 2025/2026 year'}
              fullWidth
            />

            <FormControl fullWidth required error={errors.semester != null}>
              <InputLabel>Semester</InputLabel>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Semester">
                    <MenuItem value={1}>Semester 1</MenuItem>
                    <MenuItem value={2}>Semester 2</MenuItem>
                  </Select>
                )}
              />
              {errors.semester != null && (
                <FormHelperText>{errors.semester.message}</FormHelperText>
              )}
            </FormControl>
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
