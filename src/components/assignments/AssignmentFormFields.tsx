'use client';

import { formatCpp } from '@/utils/formatCpp';
import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useRef } from 'react';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';
import type { AssignmentFormValues } from './assignmentFormSchema';

interface AssignmentFormFieldsProps {
  form: UseFormReturn<AssignmentFormValues>;
  showDeadline: boolean;
}

export const AssignmentFormFields = ({ form, showDeadline }: AssignmentFormFieldsProps) => {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const enableCodeCheck = watch('enableCodeCheck');
  const testMode = watch('testMode');
  const testCases = watch('testCases');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields, append, remove } = useFieldArray({ control, name: 'testCases' });

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

  return (
    <Stack spacing={2.5} sx={{ pt: 0.5 }}>
      <TextField
        {...register('title')}
        label="Title"
        required
        error={errors.title != null}
        helperText={errors.title?.message}
        fullWidth
      />

      <TextField {...register('description')} label="Description" multiline rows={3} fullWidth />

      <TextField
        {...register('maxScore', { valueAsNumber: true })}
        label="Max score"
        type="number"
        required
        error={errors.maxScore != null}
        helperText={errors.maxScore?.message}
        fullWidth
      />

      {showDeadline && (
        <TextField
          {...register('deadline')}
          label="Deadline"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      )}

      <Divider />

      <Controller
        name="enableCodeCheck"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
            }
            label={
              <Box>
                <Typography variant="subtitle2">Enable Code Check</Typography>
                <Typography variant="caption" color="text.secondary">
                  Students submit C/C++ code that is compiled and tested automatically.
                </Typography>
              </Box>
            }
          />
        )}
      />

      {enableCodeCheck && (
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
                {errors.language && <FormHelperText>{errors.language.message}</FormHelperText>}
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
                  <FormControlLabel value="IO" control={<Radio size="small" />} label="I/O Tests" />
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

          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          {testMode === 'UNIT_TEST' && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                Write assertions in main(). Use #include &quot;solution.cpp&quot; to access student
                code. Return 0 on success.
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

          {testMode !== 'UNIT_TEST' && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
    </Stack>
  );
};
