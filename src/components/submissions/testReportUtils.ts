import type { TestCaseResult } from '@/lib/api/submissions';

export type TestCaseStatus = NonNullable<TestCaseResult['status']>;

export interface DiffSegment {
  text: string;
  changed: boolean;
}

/**
 * Minimal character diff: the common prefix and suffix are unchanged, the middle part differs.
 * Good enough to point at the first mismatch in short expected/actual values without a dependency.
 */
export function diffSegments(
  expected: string,
  actual: string,
): { expected: DiffSegment[]; actual: DiffSegment[] } {
  let prefix = 0;
  const maxPrefix = Math.min(expected.length, actual.length);
  while (prefix < maxPrefix && expected[prefix] === actual[prefix]) prefix++;

  let suffix = 0;
  const maxSuffix = Math.min(expected.length, actual.length) - prefix;
  while (
    suffix < maxSuffix &&
    expected[expected.length - 1 - suffix] === actual[actual.length - 1 - suffix]
  ) {
    suffix++;
  }

  const split = (value: string): DiffSegment[] =>
    [
      { text: value.slice(0, prefix), changed: false },
      { text: value.slice(prefix, value.length - suffix), changed: true },
      { text: value.slice(value.length - suffix), changed: false },
    ].filter((segment) => segment.text !== '');

  return { expected: split(expected), actual: split(actual) };
}

/**
 * Makes spaces visible inside string/char literals (values rendered as "..." or '...'),
 * so a missing or extra space is obvious. Other values are returned unchanged.
 */
export function visibleWhitespace(value: string): string {
  const quoted = /^(["'])[\s\S]*\1$/.test(value);
  return quoted ? value.replace(/ /g, '·').replace(/\t/g, '→') : value;
}

const STATUS_ORDER: Record<TestCaseStatus, number> = {
  FAILED: 0,
  ERROR: 0,
  CRASHED: 0,
  TIMEOUT: 0,
  NOT_RUN: 1,
  SKIPPED: 2,
  PASSED: 3,
};

/** Splits tests into non-passing (failed/crashed first, then not run) and passed, keeping run order. */
export function groupTests(tests: TestCaseResult[]): {
  problems: TestCaseResult[];
  passed: TestCaseResult[];
} {
  const indexed = tests.map((test, index) => ({ test, index }));
  const rank = (t: TestCaseResult) => STATUS_ORDER[t.status ?? 'FAILED'];
  const problems = indexed
    .filter(({ test }) => test.status !== 'PASSED')
    .sort((a, b) => rank(a.test) - rank(b.test) || a.index - b.index)
    .map(({ test }) => test);
  const passed = tests.filter((test) => test.status === 'PASSED');
  return { problems, passed };
}

export const STATUS_LABEL: Record<TestCaseStatus, string> = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  ERROR: 'Error',
  CRASHED: 'Crashed',
  TIMEOUT: 'Timed out',
  NOT_RUN: 'Not run',
  SKIPPED: 'Skipped',
};

/** Plain-language explanation for statuses that have no expected/actual values. */
export const STATUS_EXPLANATION: Partial<Record<TestCaseStatus, string>> = {
  ERROR: 'Your code raised an unexpected error (exception) during this test.',
  CRASHED:
    'The program crashed while running this test (for example a segmentation fault, an abort, or exit() in your code).',
  TIMEOUT:
    'The time limit was exceeded while running this test. Look for an infinite loop or a very slow algorithm.',
  NOT_RUN: 'This test did not run because the program stopped during an earlier test.',
  SKIPPED: 'This test was skipped.',
};

/** Index of the first compiler output line that reports an error, or -1. */
export function firstErrorLine(lines: string[]): number {
  return lines.findIndex((line) => /\berror\b|Error:/.test(line));
}
