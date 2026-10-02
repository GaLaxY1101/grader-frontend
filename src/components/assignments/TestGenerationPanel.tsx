'use client';

import Editor from '@monaco-editor/react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getTestFileTemplate, type AssignmentFormValues } from './assignmentFormSchema';
import { codeEditorOptions, EditorFrame } from './CollapsibleCodeSection';
import { TestGenerationTimeline } from './TestGenerationTimeline';
import { useTestGeneration } from './useTestGeneration';

interface TestGenerationPanelProps {
  form: UseFormReturn<AssignmentFormValues>;
  /** Saved assignment the tests belong to; undefined while creating a new assignment. */
  assignmentId?: number;
}

/**
 * Explains why generation cannot start yet, or returns null when everything needed is filled in.
 */
export const generationBlocker = (values: {
  language?: string;
  description?: string;
  referenceSolution?: string;
}): string | null => {
  if (!values.language) return 'Select a language first';
  if (!values.description?.trim()) return 'Add a task description first';
  if (!values.referenceSolution?.trim()) return 'Enter a reference solution first';
  return null;
};

/**
 * True if the test editor holds only the starter template (or nothing) for the language.
 * Line endings are normalized: Monaco reports CRLF on Windows.
 */
export const isUntouchedTestFile = (content: string, language: string | undefined): boolean => {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  return normalized === '' || normalized === getTestFileTemplate(language).trim();
};

export const TestGenerationPanel = ({ form, assignmentId }: TestGenerationPanelProps) => {
  const { watch, getValues, setValue } = form;
  const { start, status, job, error, isRunning } = useTestGeneration();
  const [mutationFeedback, setMutationFeedback] = useState<boolean>(true);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const previousStatus = useRef<string>(status);

  const language = watch('language');
  const description = watch('description');
  const referenceSolution = watch('referenceSolution');
  const blocker = generationBlocker({ language, description, referenceSolution });
  const monacoLanguage = language === 'PYTHON' ? 'python' : 'cpp';
  const iterations = job?.iterations ?? [];
  const finalTests = job?.finalTestContent ?? '';

  useEffect(() => {
    if (previousStatus.current !== status) {
      if (status === 'SUCCEEDED') toast.success('AI tests are ready');
      if (status === 'FAILED') toast.error('AI test generation failed');
      previousStatus.current = status;
    }
  }, [status]);

  useEffect(() => {
    if (error != null) toast.error(error);
  }, [error]);

  const handleGenerate = () => {
    const values = getValues();
    if (values.language == null) return;
    void start({
      assignmentId,
      language: values.language,
      taskDescription: values.description || undefined,
      functionSignature: values.functionSignature || undefined,
      referenceSolution: values.referenceSolution ?? '',
      config: { mutationFeedback },
    });
  };

  const insertTests = () => {
    setValue('testFileContent', finalTests, { shouldDirty: true, shouldValidate: true });
    setConfirmOpen(false);
    toast.info('Generated tests inserted into the test file');
  };

  const handleUseTests = () => {
    if (isUntouchedTestFile(getValues('testFileContent') ?? '', language)) {
      insertTests();
    } else {
      setConfirmOpen(true);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">Generate tests with AI</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            A local AI model writes tests from the task description. They are run against your
            reference solution and against automatically planted bugs, and repaired until they pass
            and catch the bugs. Usually takes 15–60 s.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title={blocker ?? ''} disableHoverListener={blocker == null}>
            <span>
              <LoadingButton
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                loading={isRunning}
                loadingPosition="start"
                disabled={blocker != null || isRunning}
                onClick={handleGenerate}
              >
                Generate tests with AI
              </LoadingButton>
            </span>
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={mutationFeedback}
                disabled={isRunning}
                onChange={(e) => setMutationFeedback(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Mutation feedback{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  (add tests for bugs the suite misses)
                </Typography>
              </Typography>
            }
          />
        </Box>

        {isRunning && (
          <Box>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              {status === 'PENDING' ? 'Starting…' : `Running iteration ${iterations.length + 1}…`}
            </Typography>
          </Box>
        )}

        <TestGenerationTimeline iterations={iterations} />

        {status === 'FAILED' && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleGenerate}
                disabled={blocker != null}
              >
                Retry
              </Button>
            }
          >
            {job?.errorMessage ?? 'Test generation failed'}
          </Alert>
        )}

        {status === 'SUCCEEDED' && finalTests !== '' && (
          <Stack spacing={1}>
            <EditorFrame>
              <Editor
                height="300px"
                language={monacoLanguage}
                theme="vs"
                value={finalTests}
                options={{ ...codeEditorOptions, readOnly: true }}
              />
            </EditorFrame>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="success" onClick={handleUseTests}>
                Use these tests
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Replace the test file?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The test file editor already contains tests. Replace them with the generated tests?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={insertTests}>
            Replace
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
