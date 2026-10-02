'use client';

import type { IterationResponse } from '@/lib/api/testGeneration';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type PromptType = NonNullable<IterationResponse['promptType']>;

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  GENERATE: 'Generate',
  REPAIR_COMPILE: 'Fix compile errors',
  REPAIR_FAILING: 'Fix failing tests',
  KILL_MUTANT: 'Strengthen tests',
  PRUNE_FAILING: 'Remove failing tests',
};

interface IterationChipsProps {
  iteration: IterationResponse;
}

const IterationChips = ({ iteration }: IterationChipsProps) => {
  const { compileOk, refPassed, refTotal, mutantsKilled, mutantsTotal, testCount, coveragePct } =
    iteration;
  const allPass = refTotal != null && refTotal > 0 && refPassed === refTotal;

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      <Chip
        size="small"
        label={compileOk ? 'compiles ✓' : 'compile error ✗'}
        color={compileOk ? 'success' : 'error'}
        variant="outlined"
      />
      {compileOk && refTotal != null && (
        <Chip
          size="small"
          label={`reference ${refPassed ?? 0}/${refTotal}`}
          color={allPass ? 'success' : 'warning'}
          variant="outlined"
        />
      )}
      {mutantsKilled != null && mutantsTotal != null && mutantsTotal > 0 && (
        <Chip
          size="small"
          label={`bugs caught ${mutantsKilled}/${mutantsTotal}`}
          color={mutantsKilled === mutantsTotal ? 'success' : 'default'}
          variant="outlined"
        />
      )}
      {testCount != null && <Chip size="small" label={`${testCount} tests`} variant="outlined" />}
      {coveragePct != null && (
        <Chip size="small" label={`${Math.round(coveragePct)}% coverage`} variant="outlined" />
      )}
    </Stack>
  );
};

interface TestGenerationTimelineProps {
  iterations: IterationResponse[];
}

/**
 * One row per self-repair iteration: what was asked of the AI and how the resulting test file
 * did against the reference solution and the seeded bugs. Rejected candidates are greyed out.
 */
export const TestGenerationTimeline = ({ iterations }: TestGenerationTimelineProps) => {
  if (iterations.length === 0) return null;

  return (
    <List dense disablePadding>
      {iterations.map((it) => {
        const rejected = it.accepted === false;
        const label = it.promptType != null ? PROMPT_TYPE_LABELS[it.promptType] : 'Iteration';
        return (
          <ListItem
            key={it.iterationNo}
            disableGutters
            sx={{ display: 'block', py: 1, opacity: rejected ? 0.5 : 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {(it.iterationNo ?? 0) + 1}. {label}
              </Typography>
              {rejected && (
                <Chip
                  size="small"
                  label="rejected: removed too many tests"
                  sx={{ height: 20, fontSize: 11 }}
                />
              )}
              {it.durationMs != null && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {(it.durationMs / 1000).toFixed(1)} s
                </Typography>
              )}
            </Box>
            <IterationChips iteration={it} />
          </ListItem>
        );
      })}
    </List>
  );
};
