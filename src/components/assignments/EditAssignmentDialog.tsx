'use client';

import { CompilationErrorDialog } from '@/components/common/CompilationErrorDialog';
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { formatCpp } from '@/utils/formatCpp';
import { zodResolver } from '@hookform/resolvers/zod';
import Editor from '@monaco-editor/react';
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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

type AssignmentResponse = components['schemas']['AssignmentResponse'];

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
    testMode: z.enum(['IO', 'UNIT_TEST']).optional(),
    ciConfigTemplate: z.string().optional(),
    functionSignature: z.string().optional(),
    testFileContent: z.string().optional(),
    testCases: z.array(testCaseSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.functionSignature?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Function signature is required',
        path: ['functionSignature'],
      });
    }
    if (data.testMode === 'UNIT_TEST' && !data.testFileContent?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Test file content is required for unit test mode',
        path: ['testFileContent'],
      });
    }
  });

type EditAssignmentFormData = z.infer<typeof schema>;

/** Converts an ISO datetime string to the YYYY-MM-DDTHH:mm format required by datetime-local inputs. */
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditAssignmentDialogProps {
  assignment: AssignmentResponse;
  open: boolean;
  onClose: () => void;
}

export const EditAssignmentDialog = ({ assignment, open, onClose }: EditAssignmentDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const programmingTask = assignment.programmingTask;
  const hasProgrammingTask = programmingTask != null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditAssignmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      maxScore: assignment.maxScore ?? 100,
      deadline: toDatetimeLocal(assignment.deadline),
      testMode: programmingTask?.testMode ?? 'IO',
      ciConfigTemplate: programmingTask?.ciConfigTemplate ?? '',
      functionSignature: programmingTask?.functionSignature ?? '',
      testFileContent: programmingTask?.testFileContent ?? '',
      testCases:
        programmingTask?.testCases?.map((tc) => ({
          name: tc.name ?? '',
          testType: (tc.testType as 'IO' | 'EXCEPTION') ?? 'IO',
          input: tc.input ?? '',
          expectedOutput: tc.expectedOutput ?? '',
        })) ?? [],
    },
  });

  const testMode = watch('testMode');
  const testCases = watch('testCases');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'testCases',
  });

  useEffect(() => {
    reset({
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      maxScore: assignment.maxScore ?? 100,
      deadline: toDatetimeLocal(assignment.deadline),
      testMode: programmingTask?.testMode ?? 'IO',
      ciConfigTemplate: programmingTask?.ciConfigTemplate ?? '',
      functionSignature: programmingTask?.functionSignature ?? '',
      testFileContent: programmingTask?.testFileContent ?? '',
      testCases:
        programmingTask?.testCases?.map((tc) => ({
          name: tc.name ?? '',
          testType: (tc.testType as 'IO' | 'EXCEPTION') ?? 'IO',
          input: tc.input ?? '',
          expectedOutput: tc.expectedOutput ?? '',
        })) ?? [],
    });
  }, [assignment, programmingTask, reset]);

  const handleTestFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setValue('testFileContent', content);
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setValue],
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditAssignmentFormData) => {
    if (assignment.id == null) return;
    setSubmitting(true);
    try {
      // Validate compilation if programming task
      if (hasProgrammingTask && data.functionSignature) {
        const { data: compileResult, error: compileError } = await apiClient.POST(
          '/api/compile/validate',
          {
            body: {
              solutionCode: data.functionSignature,
              testFileContent:
                data.testMode === 'UNIT_TEST' ? data.testFileContent || undefined : undefined,
            },
          },
        );
        if (compileError || !compileResult) {
          toast.error('Failed to validate compilation');
          setSubmitting(false);
          return;
        }
        if (!compileResult.success) {
          setCompileError(compileResult.output ?? 'Unknown error');
          setSubmitting(false);
          return;
        }
      }

      const { error } = await apiClient.PUT('/api/assignments/{id}', {
        params: { path: { id: assignment.id } },
        body: {
          title: data.title,
          description: data.description || undefined,
          maxScore: data.maxScore,
          deadline: data.deadline || undefined,
          programmingTask: hasProgrammingTask
            ? {
                language: programmingTask!.language,
                testMode: (data.testMode as 'IO' | 'UNIT_TEST') ?? 'IO',
                ciConfigTemplate: data.ciConfigTemplate || undefined,
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
        },
      });

      if (error) {
        toast.error('Failed to update assignment');
        return;
      }

      toast.success('Assignment updated');
      handleClose();
      router.refresh();
    } catch {
      toast.error('Failed to update assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Assignment</DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
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

              {/* Programming task fields */}
              {hasProgrammingTask && (
                <>
                  <Divider />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Programming Task
                  </Typography>

                  {/* Test mode selector */}
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

                  <TextField
                    {...register('ciConfigTemplate')}
                    label="CI config template (optional)"
                    placeholder="Leave blank to use the default template"
                    multiline
                    rows={3}
                    inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                    fullWidth
                  />

                  {/* Function signature — always shown */}
                  <Divider />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
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
                    This code will be pre-filled in the student&apos;s editor.
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
                          height="150px"
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

                  {/* Unit test mode: test file editor */}
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
                              height="250px"
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

                  {/* I/O Test cases (only shown in IO mode) */}
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
                </>
              )}
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
      <CompilationErrorDialog
        open={compileError != null}
        output={compileError}
        onClose={() => setCompileError(null)}
      />
    </>
  );
};
