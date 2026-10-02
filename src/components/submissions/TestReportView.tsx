'use client';

import type { TestCaseResult, TestReport } from '@/lib/api/submissions';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  diffSegments,
  firstErrorLine,
  groupTests,
  STATUS_EXPLANATION,
  STATUS_LABEL,
  visibleWhitespace,
  type DiffSegment,
  type TestCaseStatus,
} from './testReportUtils';

const monoBlock = {
  fontFamily: 'monospace',
  fontSize: 12,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  m: 0,
} as const;

const darkLog = {
  ...monoBlock,
  bgcolor: 'grey.900',
  color: 'grey.100',
  p: 2,
  borderRadius: 1,
  maxHeight: 400,
  overflow: 'auto',
} as const;

const RUN_STATUS_CHIP: Record<
  NonNullable<TestReport['status']>,
  { label: string; color: 'success' | 'error' | 'warning' | 'default' } | null
> = {
  COMPLETED: null,
  COMPILE_ERROR: { label: 'Compilation error', color: 'error' },
  CRASHED: { label: 'Program crashed', color: 'error' },
  TIMEOUT: { label: 'Time limit exceeded', color: 'warning' },
  UNKNOWN: null,
};

const StatusIcon = ({ status }: { status: TestCaseStatus }) => {
  switch (status) {
    case 'PASSED':
      return <CheckCircleIcon fontSize="small" color="success" />;
    case 'FAILED':
      return <CancelIcon fontSize="small" color="error" />;
    case 'TIMEOUT':
      return <HourglassBottomIcon fontSize="small" color="warning" />;
    case 'NOT_RUN':
    case 'SKIPPED':
      return <RemoveCircleOutlineIcon fontSize="small" color="disabled" />;
    default:
      return <ErrorIcon fontSize="small" color="error" />;
  }
};

const RawLog = ({ output, title }: { output: string; title: string }) => (
  <Accordion disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="body2">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box component="pre" sx={darkLog}>
        {output}
      </Box>
    </AccordionDetails>
  </Accordion>
);

const DiffValue = ({ segments, highlight }: { segments: DiffSegment[]; highlight: string }) => (
  <Box
    component="pre"
    sx={{ ...monoBlock, p: 1, bgcolor: 'grey.50', borderRadius: 1, minHeight: 24 }}
  >
    {segments.length === 0 ? (
      <Box component="span" sx={{ color: 'text.disabled' }}>
        (empty)
      </Box>
    ) : (
      segments.map((segment, i) =>
        segment.changed ? (
          <Box
            component="mark"
            key={i}
            sx={{ bgcolor: highlight, color: 'inherit', borderRadius: 0.5 }}
          >
            {visibleWhitespace(segment.text)}
          </Box>
        ) : (
          <span key={i}>{visibleWhitespace(segment.text)}</span>
        ),
      )
    )}
  </Box>
);

/** Expected | Got block for a failed test. */
export const ExpectedActual = ({ expected, actual }: { expected: string; actual: string }) => {
  const diff = diffSegments(expected, actual);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Expected
        </Typography>
        <DiffValue segments={diff.expected} highlight="success.light" />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Got
        </Typography>
        <DiffValue segments={diff.actual} highlight="error.light" />
      </Box>
    </Box>
  );
};

const hasDetails = (test: TestCaseResult) =>
  test.expected != null ||
  test.actual != null ||
  test.message != null ||
  (test.status != null && STATUS_EXPLANATION[test.status] != null);

const TestRow = ({ test }: { test: TestCaseResult }) => {
  const status = test.status ?? 'FAILED';
  const expandable = status !== 'PASSED' && hasDetails(test);
  const [open, setOpen] = useState(false);
  const explanation = STATUS_EXPLANATION[status];
  const hasValues = test.expected != null || test.actual != null;

  return (
    <Box component="li" sx={{ listStyle: 'none' }}>
      <ListItemButton
        dense
        disabled={!expandable}
        onClick={() => setOpen((v) => !v)}
        sx={{ '&.Mui-disabled': { opacity: 1 } }}
        aria-expanded={expandable ? open : undefined}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <StatusIcon status={status} />
        </ListItemIcon>
        <ListItemText
          primary={test.name}
          primaryTypographyProps={{ fontFamily: 'monospace', fontSize: 13 }}
          secondary={status !== 'PASSED' ? STATUS_LABEL[status] : undefined}
        />
        {test.durationMs != null && status === 'PASSED' && (
          <Typography variant="caption" color="text.disabled">
            {test.durationMs} ms
          </Typography>
        )}
        {expandable && (
          <ExpandMoreIcon
            fontSize="small"
            sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
          />
        )}
      </ListItemButton>
      {expandable && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ pl: 6, pr: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {hasValues && (
              <ExpectedActual expected={test.expected ?? ''} actual={test.actual ?? ''} />
            )}
            {test.message != null && (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                {test.message}
              </Typography>
            )}
            {explanation != null && !hasValues && (
              <Typography variant="body2" color="text.secondary">
                {explanation}
              </Typography>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const CompileOutput = ({ output }: { output: string }) => {
  const lines = output.split('\n');
  const errorIndex = firstErrorLine(lines);
  return (
    <Box component="pre" sx={{ ...darkLog, mt: 1 }}>
      {lines.map((line, i) => (
        <Box
          component="span"
          key={i}
          sx={
            i === errorIndex
              ? { display: 'block', bgcolor: 'error.dark', color: 'common.white', fontWeight: 700 }
              : { display: 'block' }
          }
        >
          {line || ' '}
        </Box>
      ))}
    </Box>
  );
};

interface TestReportViewProps {
  report?: TestReport | null;
  /** Raw CI log; shown in a collapsed "Show full log" section, or as-is without a report. */
  pipelineOutput?: string | null;
}

/**
 * Per-test results of an attempt: summary bar, compile errors, failed tests with Expected | Got,
 * collapsed passed tests and the raw log. Falls back to the raw log when no details are available.
 */
export const TestReportView = ({ report, pipelineOutput }: TestReportViewProps) => {
  if (report == null || !report.detailsAvailable) {
    if (!pipelineOutput) return null;
    return (
      <Box component="pre" sx={darkLog} data-testid="raw-log">
        {pipelineOutput}
      </Box>
    );
  }

  const passed = report.passed ?? 0;
  const total = report.total ?? 0;
  const tests = report.tests ?? [];
  const { problems, passed: passedTests } = groupTests(tests);
  const runChip = report.status != null ? RUN_STATUS_CHIP[report.status] : null;
  const allPassed = total > 0 && passed === total && report.status === 'COMPLETED';
  const compileError = report.status === 'COMPILE_ERROR';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {!compileError && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {passed} / {total} tests passed
            </Typography>
            {runChip != null && <Chip size="small" label={runChip.label} color={runChip.color} />}
          </Box>
          <LinearProgress
            variant="determinate"
            value={total > 0 ? (passed / total) * 100 : 0}
            color={allPassed ? 'success' : passed > 0 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
            aria-label={`${passed} of ${total} tests passed`}
          />
        </Box>
      )}

      {compileError && (
        <Alert severity="error">
          <AlertTitle>Compilation failed</AlertTitle>
          {report.compileOutput ? (
            <CompileOutput output={report.compileOutput} />
          ) : (
            'Your code did not compile, so no tests were run.'
          )}
        </Alert>
      )}

      {report.feedbackLevel === 'SUMMARY' && !compileError && (
        <Typography variant="body2" color="text.secondary">
          Individual test results are hidden for this assignment.
        </Typography>
      )}

      {problems.length > 0 && (
        <List dense disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {problems.map((test) => (
            <TestRow key={test.name} test={test} />
          ))}
        </List>
      )}

      {passedTests.length > 0 && (
        <Accordion
          disableGutters
          variant="outlined"
          defaultExpanded={problems.length === 0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Passed tests ({passedTests.length})</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List dense disablePadding>
              {passedTests.map((test) => (
                <TestRow key={test.name} test={test} />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {pipelineOutput && <RawLog output={pipelineOutput} title="Show full log" />}
    </Box>
  );
};
