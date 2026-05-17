'use client';

import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import { apiClient } from '@/lib/api/client';
import { formatCpp } from '@/utils/formatCpp';
import { zodResolver } from '@hookform/resolvers/zod';
import Editor from '@monaco-editor/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
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
    testMode: z.enum(['IO', 'UNIT_TEST']).optional(),
    functionSignature: z.string().optional(),
    testFileContent: z.string().optional(),
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
    if (data.taskType === 'CODE' && !data.functionSignature?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Function signature is required',
        path: ['functionSignature'],
      });
    }
    if (data.taskType === 'CODE' && data.testMode === 'UNIT_TEST') {
      if (data.language !== 'CPP') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Unit test mode requires C++',
          path: ['language'],
        });
      }
      if (!data.testFileContent?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Test file content is required for unit test mode',
          path: ['testFileContent'],
        });
      }
    }
  });

type CreateAssignmentFormData = z.infer<typeof schema>;

export default function NewAssignmentPage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskType: 'NONE',
      testMode: 'IO',
      maxScore: 100,
      testCases: [],
    },
  });

  const taskType = watch('taskType');
  const testMode = watch('testMode');
  const testCases = watch('testCases');

  const { fields, append, remove } = useFieldArray({ control, name: 'testCases' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => setValue('testFileContent', e.target?.result as string);
      reader.readAsText(file);
      event.target.value = '';
    },
    [setValue],
  );

  const onSubmit = async (data: CreateAssignmentFormData) => {
    setSubmitting(true);
    try {
      if (data.taskType === 'CODE' && data.functionSignature) {
        const { data: compileResult, error: compileErr } = await apiClient.POST(
          '/api/compile/validate',
          {
            body: {
              solutionCode: data.functionSignature,
              testFileContent:
                data.testMode === 'UNIT_TEST' ? data.testFileContent || undefined : undefined,
            },
          },
        );
        if (compileErr || !compileResult) {
          toast.error('Failed to validate compilation');
          return;
        }
        if (!compileResult.success) {
          setCompileError(compileResult.output ?? 'Unknown error');
          return;
        }
      }

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
                  testMode: (data.testMode as 'IO' | 'UNIT_TEST') ?? 'IO',
                  functionSignature: data.functionSignature || undefined,
                  testFileContent:
                    data.testMode === 'UNIT_TEST' ? data.testFileContent || undefined : undefined,
                  testCases:
                    data.testMode !== 'UNIT_TEST'
                      ? data.testCases?.map((tc) => ({
                          name: tc.name,
                          testType: tc.testType as 'IO' | 'EXCEPTION',
                          input: tc.input || undefined,
                          expectedOutput:
                            tc.testType === 'IO' ? tc.expectedOutput || undefined : undefined,
                        }))
                      : undefined,
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
      router.push(`/courses/${courseId}`);
    } catch {
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            color="inherit"
            onClick={() => router.push(`/courses/${courseId}`)}
            sx={{ mr: 2 }}
          >
            Back to course
          </Button>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          New Assignment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details below and click Create when ready.
        </Typography>

        <Paper
          variant="outlined"
          sx={{ borderRadius: '12px', p: { xs: 2.5, sm: 4 } }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Stack spacing={2.5}>
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

                <FormControl>
                  <FormLabel sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Test mode</Typography>
                  </FormLabel>
                  <Controller
                    name="testMode"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field} value={field.value ?? 'IO'}>
                        <FormControlLabel
                          value="IO"
                          control={<Radio size="small" />}
                          label="I/O Tests"
                        />
                        <FormControlLabel
                          value="UNIT_TEST"
                          control={<Radio size="small" />}
                          label="Unit Tests"
                        />
                      </RadioGroup>
                    )}
                  />
                </FormControl>

                <Divider />

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle2">Function Signature / Template Code</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      setValue('functionSignature', formatCpp(watch('functionSignature') ?? ''))
                    }
                  >
                    Format Code
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  This code will be pre-filled in the student&apos;s editor. They implement the
                  function body.
                </Typography>
                <Controller
                  name="functionSignature"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: errors.functionSignature ? 'error.main' : 'divider',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Editor
                        height="300px"
                        language="cpp"
                        theme="vs-dark"
                        value={field.value ?? ''}
                        onChange={(value) => field.onChange(value ?? '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          tabSize: 4,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </Box>
                  )}
                />
                {errors.functionSignature && (
                  <FormHelperText error>{errors.functionSignature.message}</FormHelperText>
                )}

                {testMode === 'UNIT_TEST' && (
                  <>
                    <Divider />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2">Test File (test.cpp)</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() =>
                            setValue('testFileContent', formatCpp(watch('testFileContent') ?? ''))
                          }
                        >
                          Format Code
                        </Button>
                        <Button size="small" onClick={() => fileInputRef.current?.click()}>
                          Upload File
                        </Button>
                      </Box>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".cpp,.cxx,.cc,.h,.hpp"
                        hidden
                        onChange={handleTestFileUpload}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Write assertions in main(). Use #include &quot;solution.cpp&quot; to access
                      student code. Return 0 on success.
                    </Typography>
                    <Controller
                      name="testFileContent"
                      control={control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            border: '1px solid',
                            borderColor: errors.testFileContent ? 'error.main' : 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Editor
                            height="400px"
                            language="cpp"
                            theme="vs-dark"
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(value ?? '')}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              tabSize: 4,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                            }}
                          />
                        </Box>
                      )}
                    />
                    {errors.testFileContent && (
                      <FormHelperText error>{errors.testFileContent.message}</FormHelperText>
                    )}
                  </>
                )}

                {testMode !== 'UNIT_TEST' && (
                  <>
                    <Divider />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
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
                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}
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
              </>
            )}

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

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="text"
                disabled={submitting}
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={submitting}>
                Create Assignment
              </LoadingButton>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
}
