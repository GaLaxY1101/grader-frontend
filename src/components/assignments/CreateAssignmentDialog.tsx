'use client';

import { apiClient } from '@/lib/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const testCaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  testType: z.enum(['IO', 'EXCEPTION']),
  input: z.string().optional(),
  expectedOutput: z.string().optional(),
});

const schema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    maxScore: z.number().min(1, 'Min 1').max(1000, 'Max 1000'),
    deadline: z.string().optional(),
    taskType: z.enum(['NONE', 'CODE', 'FILE']),
    language: z.enum(['C', 'CPP']).optional(),
    ciConfigTemplate: z.string().optional(),
    testCases: z.array(testCaseSchema).optional(),
    allowedExtensions: z.string().optional(),
    maxFileSize: z.number().optional(),
    allowedFileCount: z.number().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.taskType === 'CODE' && !data.language) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Language is required for code tasks',
        path: ['language'],
      });
    }
  });

type CreateAssignmentFormData = z.infer<typeof schema>;

interface CreateAssignmentDialogProps {
  courseId: number;
  open: boolean;
  onClose: () => void;
}

export const CreateAssignmentDialog = ({
  courseId,
  open,
  onClose,
}: CreateAssignmentDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskType: 'NONE',
      maxScore: 100,
      testCases: [],
    },
  });

  const taskType = watch('taskType');
  const testCases = watch('testCases');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'testCases',
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateAssignmentFormData) => {
    setSubmitting(true);
    try {
      const { error } = await apiClient.POST('/api/courses/{courseId}/assignments', {
        params: { path: { courseId } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          deadline: data.deadline || undefined,
          programmingTask:
            data.taskType === 'CODE'
              ? {
                  language: data.language as 'C' | 'CPP',
                  ciConfigTemplate: data.ciConfigTemplate || undefined,
                  testCases: data.testCases?.map((tc) => ({
                    name: tc.name,
                    testType: tc.testType as 'IO' | 'EXCEPTION',
                    input: tc.input || undefined,
                    expectedOutput:
                      tc.testType === 'IO' ? tc.expectedOutput || undefined : undefined,
                  })),
                }
              : undefined,
          fileUploadTask:
            data.taskType === 'FILE'
              ? {
                  allowedExtensions: data.allowedExtensions
                    ? data.allowedExtensions
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : undefined,
                  maxFileSize: data.maxFileSize || undefined,
                  allowedFileCount: data.allowedFileCount ?? 1,
                }
              : undefined,
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Assignment</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {/* Base fields */}
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

            {/* Task type selector */}
            <Divider />

            <FormControl>
              <FormLabel sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Task type</Typography>
              </FormLabel>
              <Controller
                name="taskType"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="NONE"
                      control={<Radio size="small" />}
                      label="Text / Manual"
                    />
                    <FormControlLabel value="CODE" control={<Radio size="small" />} label="Code" />
                    <FormControlLabel
                      value="FILE"
                      control={<Radio size="small" />}
                      label="File Upload"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {/* Code task fields */}
            {taskType === 'CODE' && (
              <>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={errors.language != null}>
                      <InputLabel>Language</InputLabel>
                      <Select {...field} label="Language" value={field.value ?? ''}>
                        <MenuItem value="C">C</MenuItem>
                        <MenuItem value="CPP">C++</MenuItem>
                      </Select>
                      {errors.language && (
                        <FormHelperText>{errors.language.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                <TextField
                  {...register('ciConfigTemplate')}
                  label="CI config template (optional)"
                  placeholder="Leave blank to use the default template"
                  multiline
                  rows={4}
                  inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                  fullWidth
                />

                {/* Test cases */}
                <Divider />

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle2">Test Cases</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      append({ name: '', testType: 'IO', input: '', expectedOutput: '' })
                    }
                  >
                    + Add Test Case
                  </Button>
                </Box>

                {fields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          {...register(`testCases.${index}.name`)}
                          label="Test name"
                          size="small"
                          required
                          error={errors.testCases?.[index]?.name != null}
                          helperText={errors.testCases?.[index]?.name?.message}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => remove(index)}
                          sx={{ minWidth: 32, px: 1, mt: 0.5 }}
                        >
                          ✕
                        </Button>
                      </Box>

                      <FormControl>
                        <FormLabel>
                          <Typography variant="caption" color="text.secondary">
                            Test type
                          </Typography>
                        </FormLabel>
                        <Controller
                          name={`testCases.${index}.testType`}
                          control={control}
                          render={({ field: typeField }) => (
                            <RadioGroup row {...typeField}>
                              <FormControlLabel
                                value="IO"
                                control={<Radio size="small" />}
                                label="IO (input / output)"
                              />
                              <FormControlLabel
                                value="EXCEPTION"
                                control={<Radio size="small" />}
                                label="Exception (non-zero exit)"
                              />
                            </RadioGroup>
                          )}
                        />
                      </FormControl>

                      <TextField
                        {...register(`testCases.${index}.input`)}
                        label="Input"
                        multiline
                        rows={2}
                        size="small"
                        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                        fullWidth
                      />

                      {testCases?.[index]?.testType === 'IO' && (
                        <TextField
                          {...register(`testCases.${index}.expectedOutput`)}
                          label="Expected output"
                          multiline
                          rows={2}
                          size="small"
                          inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                          fullWidth
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </>
            )}

            {/* File upload task fields */}
            {taskType === 'FILE' && (
              <>
                <TextField
                  {...register('allowedExtensions')}
                  label="Allowed extensions"
                  placeholder="e.g. pdf, docx, zip"
                  helperText="Comma-separated list"
                  fullWidth
                />
                <TextField
                  {...register('maxFileSize', { valueAsNumber: true })}
                  label="Max file size (KB)"
                  type="number"
                  error={errors.maxFileSize != null}
                  helperText={errors.maxFileSize?.message}
                  fullWidth
                />
                <TextField
                  {...register('allowedFileCount', { valueAsNumber: true })}
                  label="Max file count"
                  type="number"
                  error={errors.allowedFileCount != null}
                  helperText={errors.allowedFileCount?.message}
                  fullWidth
                />
              </>
            )}

            {errors.root != null && <FormHelperText error>{errors.root.message}</FormHelperText>}
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
