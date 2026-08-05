'use client';

import Editor from '@monaco-editor/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { getTestFileTemplate, type AssignmentFormValues } from './assignmentFormSchema';

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
    getValues,
    formState: { errors },
  } = form;

  const enableCodeCheck = watch('enableCodeCheck');
  const language = watch('language');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableCodeCheck || !language) return;
    const current = getValues('testFileContent') ?? '';
    if (current.trim() !== '') return;
    const template = getTestFileTemplate(language);
    if (template) setValue('testFileContent', template, { shouldDirty: false });
  }, [enableCodeCheck, language, getValues, setValue]);
  const [signatureOpen, setSignatureOpen] = useState<boolean>(true);
  const [testFileOpen, setTestFileOpen] = useState<boolean>(true);

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
                  Students submit code that is compiled against a teacher-provided test file.
                </Typography>
              </Box>
            }
          />
        )}
      />

      <Collapse in={enableCodeCheck} unmountOnExit timeout={600}>
        <Stack spacing={2.5}>
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

          <TextField
            {...register('ciConfigTemplate')}
            label="CI config template (optional)"
            placeholder="Leave blank to use the default template"
            multiline
            rows={3}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
            fullWidth
          />

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 1,
              borderColor: errors.functionSignature ? 'error.main' : 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box
              role="button"
              tabIndex={0}
              onClick={() => setSignatureOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSignatureOpen((v) => !v);
                }
              }}
              aria-expanded={signatureOpen}
              aria-label={signatureOpen ? 'Collapse editor' : 'Expand editor'}
              sx={{
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: 1,
                mx: -1,
                px: 1,
                py: 0.5,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {signatureOpen ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
                <Typography variant="subtitle2">Function Signature / Template Code</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                This code will be pre-filled in the student&apos;s editor.
              </Typography>
            </Box>
            <Collapse in={signatureOpen} unmountOnExit={false}>
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
                      height="350px"
                      language="cpp"
                      theme="vs"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        tabSize: 4,
                        lineNumbers: 'on',
                        lineNumbersMinChars: 3,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        scrollbar: { alwaysConsumeMouseWheel: false },
                      }}
                    />
                  </Box>
                )}
              />
            </Collapse>
            {errors.functionSignature && (
              <FormHelperText error>{errors.functionSignature.message}</FormHelperText>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: errors.testFileContent ? 'error.main' : 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box
              role="button"
              tabIndex={0}
              onClick={() => setTestFileOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTestFileOpen((v) => !v);
                }
              }}
              aria-expanded={testFileOpen}
              aria-label={testFileOpen ? 'Collapse editor' : 'Expand editor'}
              sx={{
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: 1,
                mx: -1,
                px: 1,
                py: 0.5,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {testFileOpen ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
                <Typography variant="subtitle2">Test File (test.cpp)</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Write assertions in main(). Use #include &quot;solution.cpp&quot; to access student
                code. Return 0 on success.
              </Typography>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept=".cpp,.cxx,.cc,.h,.hpp"
              hidden
              onChange={handleTestFileUpload}
            />
            <Collapse in={testFileOpen} unmountOnExit={false}>
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
                      height="500px"
                      language="cpp"
                      theme="vs"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(value ?? '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        tabSize: 4,
                        lineNumbers: 'on',
                        lineNumbersMinChars: 3,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 12, bottom: 12 },
                        scrollbar: { alwaysConsumeMouseWheel: false },
                      }}
                    />
                  </Box>
                )}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload File
                </Button>
              </Box>
            </Collapse>
            {errors.testFileContent && (
              <FormHelperText error>{errors.testFileContent.message}</FormHelperText>
            )}
          </Paper>
        </Stack>
      </Collapse>
    </Stack>
  );
};
