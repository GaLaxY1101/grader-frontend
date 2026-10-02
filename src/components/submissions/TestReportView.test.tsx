import type { TestReport } from '@/lib/api/submissions';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TestReportView } from './TestReportView';

afterEach(cleanup);

const fullReport: TestReport = {
  status: 'CRASHED',
  passed: 1,
  total: 5,
  detailsAvailable: true,
  feedbackLevel: 'FULL',
  tests: [
    { name: 'test_single_char', status: 'PASSED', durationMs: 1 },
    {
      name: 'test_empty_string',
      status: 'FAILED',
      expected: 'true',
      actual: 'false',
      message: 'EXPECT_EQ(true, isPal(""))',
    },
    { name: 'test_error', status: 'ERROR', message: 'ValueError: bad input' },
    { name: 'test_large_input', status: 'CRASHED' },
    { name: 'test_after', status: 'NOT_RUN' },
  ],
};

describe('TestReportView', () => {
  it('shows the summary, run status and failed tests before passed ones', () => {
    render(<TestReportView report={fullReport} pipelineOutput="raw log text" />);

    expect(screen.getByText('1 / 5 tests passed')).toBeTruthy();
    expect(screen.getByText('Program crashed')).toBeTruthy();
    const names = screen.getAllByText(/^test_/).map((el) => el.textContent);
    expect(names.indexOf('test_empty_string')).toBeLessThan(names.indexOf('test_single_char'));
    expect(names.indexOf('test_large_input')).toBeLessThan(names.indexOf('test_after'));
    expect(screen.getByText('Passed tests (1)')).toBeTruthy();
    expect(screen.getByText('Show full log')).toBeTruthy();
  });

  it('expands a failed test into Expected | Got', () => {
    render(<TestReportView report={fullReport} />);

    expect(screen.queryByText('Expected')).toBeNull();
    fireEvent.click(screen.getByText('test_empty_string'));

    expect(screen.getByText('Expected').nextElementSibling?.textContent).toBe('true');
    expect(screen.getByText('Got').nextElementSibling?.textContent).toBe('false');
    // Only the differing part is highlighted: "tru|e" vs "fals|e".
    expect(screen.getByText('fals').tagName).toBe('MARK');
  });

  it('explains crashed, error and not-run tests', () => {
    render(<TestReportView report={fullReport} />);

    fireEvent.click(screen.getByText('test_large_input'));
    fireEvent.click(screen.getByText('test_after'));
    fireEvent.click(screen.getByText('test_error'));

    expect(screen.getByText(/crashed while running this test/)).toBeTruthy();
    expect(screen.getByText(/did not run because the program stopped/)).toBeTruthy();
    expect(screen.getByText('ValueError: bad input')).toBeTruthy();
  });

  it('shows a timeout with its own label', () => {
    render(
      <TestReportView
        report={{
          ...fullReport,
          status: 'TIMEOUT',
          tests: [{ name: 'test_loop', status: 'TIMEOUT' }],
          passed: 0,
          total: 1,
        }}
      />,
    );

    expect(screen.getByText('Time limit exceeded')).toBeTruthy();
    fireEvent.click(screen.getByText('test_loop'));
    expect(screen.getByText(/infinite loop/)).toBeTruthy();
  });

  it('shows compiler output for a compile error', () => {
    render(
      <TestReportView
        report={{
          status: 'COMPILE_ERROR',
          passed: 0,
          total: 0,
          detailsAvailable: true,
          feedbackLevel: 'FULL',
          compileOutput: "solution.cpp:3:5: error: expected ';'\n    3 |   }",
          tests: [],
        }}
      />,
    );

    expect(screen.getByText('Compilation failed')).toBeTruthy();
    expect(screen.getByText("solution.cpp:3:5: error: expected ';'")).toBeTruthy();
    expect(screen.queryByText(/tests passed/)).toBeNull();
  });

  it('NAMES_ONLY: lists tests without values', () => {
    render(
      <TestReportView
        report={{
          ...fullReport,
          status: 'COMPLETED',
          feedbackLevel: 'NAMES_ONLY',
          passed: 1,
          total: 2,
          tests: [
            { name: 'test_ok', status: 'PASSED' },
            { name: 'test_hidden', status: 'FAILED' },
          ],
        }}
      />,
    );

    expect(screen.getByText('test_hidden')).toBeTruthy();
    fireEvent.click(screen.getByText('test_hidden'));
    expect(screen.queryByText('Expected')).toBeNull();
  });

  it('SUMMARY: shows only the counts', () => {
    render(
      <TestReportView
        report={{
          status: 'COMPLETED',
          passed: 7,
          total: 10,
          detailsAvailable: true,
          feedbackLevel: 'SUMMARY',
          tests: [],
        }}
      />,
    );

    expect(screen.getByText('7 / 10 tests passed')).toBeTruthy();
    expect(screen.getByText(/hidden for this assignment/)).toBeTruthy();
    expect(screen.queryByText(/^test_/)).toBeNull();
  });

  it('falls back to the raw log when no details are available', () => {
    render(
      <TestReportView
        report={{ detailsAvailable: false, feedbackLevel: 'FULL', tests: [] }}
        pipelineOutput="Assertion `add(1, 2) == 3' failed."
      />,
    );

    expect(screen.getByTestId('raw-log').textContent).toContain('Assertion');
    expect(screen.queryByText(/tests passed/)).toBeNull();
  });

  it('renders nothing without report and log', () => {
    const { container } = render(<TestReportView report={null} pipelineOutput={null} />);
    expect(container.innerHTML).toBe('');
  });
});
