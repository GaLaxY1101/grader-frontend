'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type StudentResponse = components['schemas']['StudentResponse'];
type GroupResponse = components['schemas']['GroupResponse'];
type CourseTemplateResponse = components['schemas']['CourseTemplateResponse'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  academicYear: z.number().min(2020, 'Min year is 2020').max(2040, 'Max year is 2040'),
  semester: z.number().min(1).max(2),
});

type CreateCourseFormData = z.infer<typeof schema>;

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateCourseDialog = ({ open, onClose }: CreateCourseDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [allTemplates, setAllTemplates] = useState<CourseTemplateResponse[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<GroupResponse[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentResponse[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplateResponse | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      academicYear: new Date().getFullYear(),
      semester: 1,
    },
  });

  useEffect(() => {
    if (!open) return;
    setLoadingGroups(true);
    setLoadingStudents(true);
    setLoadingTemplates(true);
    apiClient.GET('/api/groups').then(({ data, error }) => {
      if (error) toast.error('Failed to load groups');
      else setAllGroups(data ?? []);
      setLoadingGroups(false);
    });
    apiClient.GET('/api/v1/students').then(({ data, error }) => {
      if (error) toast.error('Failed to load students');
      else setAllStudents(data ?? []);
      setLoadingStudents(false);
    });
    apiClient
      .GET('/api/templates', { params: { query: { size: 100 } } })
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load templates');
        else setAllTemplates(data?.content ?? []);
        setLoadingTemplates(false);
      });
  }, [open]);

  const selectedGroupIds = useMemo(
    () => new Set(selectedGroups.map((g) => g.id).filter((id): id is number => id != null)),
    [selectedGroups],
  );

  const availableStudents = useMemo(
    () =>
      allStudents.filter(
        (s) => s.id != null && (s.groupId == null || !selectedGroupIds.has(s.groupId)),
      ),
    [allStudents, selectedGroupIds],
  );

  useEffect(() => {
    setSelectedStudents((prev) =>
      prev.filter((s) => s.groupId == null || !selectedGroupIds.has(s.groupId)),
    );
  }, [selectedGroupIds]);

  const handleClose = () => {
    reset();
    setSelectedGroups([]);
    setSelectedStudents([]);
    setSelectedTemplate(null);
    onClose();
  };

  const onSubmit = async (data: CreateCourseFormData) => {
    setSubmitting(true);
    try {
      const { data: created, error } = await apiClient.POST('/api/courses', {
        body: {
          name: data.name,
          description: data.description || undefined,
          academicYear: data.academicYear,
          semester: data.semester,
          templateId: selectedTemplate?.id ?? undefined,
        },
      });

      if (error || created?.id == null) {
        toast.error('Failed to create course');
        return;
      }

      const courseId = created.id;
      let enrollFailures = 0;

      const groupCalls = selectedGroups
        .filter((g) => g.id != null)
        .map((g) =>
          apiClient.POST('/api/courses/{id}/groups/{groupId}', {
            params: { path: { id: courseId, groupId: g.id! } },
          }),
        );

      const studentCalls = selectedStudents
        .filter((s) => s.id != null)
        .map((s) =>
          apiClient.POST('/api/courses/{id}/students/{studentId}', {
            params: { path: { id: courseId, studentId: s.id! } },
          }),
        );

      const results = await Promise.allSettled([...groupCalls, ...studentCalls]);
      for (const r of results) {
        if (r.status === 'rejected' || r.value.error) enrollFailures++;
      }

      if (enrollFailures > 0) {
        toast.warning(
          `Course created, but ${enrollFailures} enrollment${enrollFailures === 1 ? '' : 's'} failed`,
        );
      } else {
        toast.success('Course created successfully');
      }

      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Course</DialogTitle>

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

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Template (optional)
              </Typography>
            </Divider>

            <Box>
              <Autocomplete
                options={allTemplates}
                loading={loadingTemplates}
                value={selectedTemplate}
                onChange={(_, v) => setSelectedTemplate(v)}
                getOptionLabel={(o) => o.name ?? ''}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Create from template"
                    placeholder="Blank course (no template)"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTemplates && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                Assignments from the template will be copied into the new course.
              </Typography>
            </Box>

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Enrollment (optional)
              </Typography>
            </Divider>

            <Box>
              <Autocomplete
                multiple
                options={allGroups}
                loading={loadingGroups}
                value={selectedGroups}
                onChange={(_, v) => setSelectedGroups(v)}
                getOptionLabel={(o) => o.code ?? ''}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.code}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add groups"
                    placeholder="Select groups to enroll"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingGroups && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                Enrolls every active member of each group.
              </Typography>
            </Box>

            <Box>
              <Autocomplete
                multiple
                options={availableStudents}
                loading={loadingStudents}
                value={selectedStudents}
                onChange={(_, v) => setSelectedStudents(v)}
                getOptionLabel={(o) =>
                  `${o.firstName ?? ''} ${o.lastName ?? ''} (${o.email ?? ''})`.trim()
                }
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.firstName ?? ''} ${option.lastName ?? ''}`.trim()}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add individual students"
                    placeholder="Select students to enroll"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                Students already in a selected group are hidden.
              </Typography>
            </Box>
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
