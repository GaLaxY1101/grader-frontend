'use client';

import { AssignmentType, supportsCode } from '@/utils/assignmentType';
import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { getTestFileTemplate, type AssignmentFormValues } from './assignmentFormSchema';
import { codeEditorOptions, CollapsibleCodeSection, EditorFrame } from './CollapsibleCodeSection';
import { TestGenerationPanel } from './TestGenerationPanel';

interface AssignmentFormFieldsProps {
  form: UseFormReturn<AssignmentFormValues>;
  showDeadline: boolean;
  /**
   * Shows the reference solution editor and the "Generate tests with AI" panel.
   * Course assignments only: templates do not store a reference solution.
   */
  enableAiTestGeneration?: boolean;
  /** Saved assignment id, passed to AI test generation; undefined for a new assignment. */
  assignmentId?: number;
}

export const AssignmentFormFields = ({
  form,
  showDeadline,
  enableAiTestGeneration = false,
  assignmentId,
}: AssignmentFormFieldsProps) => {
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
  const type = watch('type');
  const codeAllowed = supportsCode(type);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!codeAllowed && enableCodeCheck) {
      setValue('enableCodeCheck', false, { shouldDirty: true });
    }
  }, [codeAllowed, enableCodeCheck, setValue]);

  const monacoLanguage = language === 'PYTHON' ? 'python' : language === 'C' ? 'c' : 'cpp';
  const testFileName =
    language === 'PYTHON' ? 'test_solution.py' : language === 'C' ? 'test.cpp' : 'test.cpp';
  const testFileAccept = language === 'PYTHON' ? '.py' : '.cpp,.cxx,.cc,.h,.hpp,.c';
  const solutionImportHint =
    language === 'PYTHON'
      ? 'Write pytest tests. Use `from solution import ...` to access student code.'
      : language === 'C'
        ? 'Write assertions in main(). Use #include "solution.c" to access student code. Return 0 on success.'
        : 'Write assertions in main(). Use #include "solution.cpp" to access student code. Return 0 on success.';

  useEffect(() => {
    if (!enableCodeCheck || !language) return;
    const current = getValues('testFileContent') ?? '';
    if (current.trim() !== '') return;
    const template = getTestFileTemplate(language);
    if (template) setValue('testFileContent', template, { shouldDirty: false });
  }, [enableCodeCheck, language, getValues, setValue]);

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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>Assignment type</InputLabel>
            <Select {...field} label="Assignment type">
              <MenuItem value={AssignmentType.CODE}>Code only</MenuItem>
              <MenuItem value={AssignmentType.FILE}>Files only</MenuItem>
              <MenuItem value={AssignmentType.CODE_FILE}>Code + files</MenuItem>
            </Select>
            <FormHelperText>
              File and hybrid assignments let students attach files reviewed manually.
            </FormHelperText>
          </FormControl>
        )}
      />

      <Divider />

      {codeAllowed && (
        <>
          <Controller
            name="enableCodeCheck"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
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
                      <MenuItem value="PYTHON">Python</MenuItem>
                    </Select>
                    {errors.language && <FormHelperText>{errors.language.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <CollapsibleCodeSection
                title="Function Signature / Template Code"
                caption="This code will be pre-filled in the student's editor."
                errorMessage={errors.functionSignature?.message}
              >
                <Controller
                  name="functionSignature"
                  control={control}
                  render={({ field }) => (
                    <EditorFrame hasError={errors.functionSignature != null}>
                      <Editor
                        height="350px"
                        language={monacoLanguage}
                        theme="vs"
                        value={field.value ?? ''}
                        onChange={(value) => field.onChange(value ?? '')}
                        options={codeEditorOptions}
                      />
                    </EditorFrame>
                  )}
                />
              </CollapsibleCodeSection>

              {enableAiTestGeneration && (
                <>
                  <CollapsibleCodeSection
                    title="Reference Solution"
                    caption="Correct solution used to validate generated tests. Hidden from students."
                  >
                    <Controller
                      name="referenceSolution"
                      control={control}
                      render={({ field }) => (
                        <EditorFrame>
                          <Editor
                            height="300px"
                            language={monacoLanguage}
                            theme="vs"
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(value ?? '')}
                            options={codeEditorOptions}
                          />
                        </EditorFrame>
                      )}
                    />
                  </CollapsibleCodeSection>

                  <TestGenerationPanel form={form} assignmentId={assignmentId} />
                </>
              )}

              <CollapsibleCodeSection
                title={`Test File (${testFileName})`}
                caption={solutionImportHint}
                errorMessage={errors.testFileContent?.message}
                header={
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={testFileAccept}
                    hidden
                    onChange={handleTestFileUpload}
                  />
                }
              >
                <Controller
                  name="testFileContent"
                  control={control}
                  render={({ field }) => (
                    <EditorFrame hasError={errors.testFileContent != null}>
                      <Editor
                        height="500px"
                        language={monacoLanguage}
                        theme="vs"
                        value={field.value ?? ''}
                        onChange={(value) => field.onChange(value ?? '')}
                        options={codeEditorOptions}
                      />
                    </EditorFrame>
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
              </CollapsibleCodeSection>
            </Stack>
          </Collapse>
        </>
      )}
    </Stack>
  );
};
