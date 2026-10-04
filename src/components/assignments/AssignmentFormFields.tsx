'use client';

import Editor from '@monaco-editor/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

  const language = watch('language');
  const codeAllowed = watch('codeCheckEnabled');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const monacoLanguage = language === 'PYTHON' ? 'python' : language === 'C' ? 'c' : 'cpp';
  const testFileName =
    language === 'PYTHON' ? 'test_solution.py' : language === 'C' ? 'test.cpp' : 'test.cpp';
  const testFileAccept = language === 'PYTHON' ? '.py' : '.cpp,.cxx,.cc,.h,.hpp,.c';
  const solutionImportHint =
    language === 'PYTHON'
      ? 'Write pytest tests with `from solution import *`. Compare as `assert actual == expected` so students see both values.'
      : `Start with #include "grader_test.h" and #include "${language === 'C' ? 'solution.c' : 'solution.cpp'}". ` +
        'Write each test as TEST_CASE(test_name) { ... } using EXPECT_EQ(expected, actual), EXPECT_TRUE or ' +
        'EXPECT_NEAR. No main() needed. Plain assert() still works but only shows the raw log.';

  useEffect(() => {
    if (!codeAllowed || !language) return;
    const current = getValues('testFileContent') ?? '';
    if (current.trim() !== '') return;
    const template = getTestFileTemplate(language);
    if (template) setValue('testFileContent', template, { shouldDirty: false });
  }, [codeAllowed, language, getValues, setValue]);

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
        name="codeCheckEnabled"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch checked={field.value} onChange={field.onChange} />}
            label="Enable code check"
          />
        )}
      />

      <Divider />

      {codeAllowed && (
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

          <Controller
            name="feedbackLevel"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Student feedback</InputLabel>
                <Select {...field} label="Student feedback" value={field.value ?? 'FULL'}>
                  <MenuItem value="FULL">Full: test names, expected and actual values</MenuItem>
                  <MenuItem value="NAMES_ONLY">Names only: pass/fail per test, no values</MenuItem>
                  <MenuItem value="SUMMARY">Summary: only the number of passed tests</MenuItem>
                </Select>
                <FormHelperText>
                  What students see after each attempt. Use &quot;Names only&quot; or
                  &quot;Summary&quot; for hidden tests; this also hides compiler output. Students
                  never see the raw CI log; teachers always see the full report.
                </FormHelperText>
              </FormControl>
            )}
          />

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
              <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()}>
                Upload File
              </Button>
            </Box>
          </CollapsibleCodeSection>
        </Stack>
      )}
    </Stack>
  );
};
