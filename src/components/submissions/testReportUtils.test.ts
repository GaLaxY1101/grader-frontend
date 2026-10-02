import { describe, expect, it } from 'vitest';
import { diffSegments, firstErrorLine, groupTests, visibleWhitespace } from './testReportUtils';

describe('diffSegments', () => {
  it('marks only the differing middle part', () => {
    const diff = diffSegments('[1, 2, 4]', '[1, 2, 3]');
    expect(diff.expected).toEqual([
      { text: '[1, 2, ', changed: false },
      { text: '4', changed: true },
      { text: ']', changed: false },
    ]);
    expect(diff.actual).toEqual([
      { text: '[1, 2, ', changed: false },
      { text: '3', changed: true },
      { text: ']', changed: false },
    ]);
  });

  it('handles insertions and identical values', () => {
    expect(diffSegments('"ab"', '"aXb"').actual).toEqual([
      { text: '"a', changed: false },
      { text: 'X', changed: true },
      { text: 'b"', changed: false },
    ]);
    expect(diffSegments('"ab"', '"aXb"').expected).toEqual([
      { text: '"a', changed: false },
      { text: 'b"', changed: false },
    ]);
    expect(diffSegments('5', '5')).toEqual({
      expected: [{ text: '5', changed: false }],
      actual: [{ text: '5', changed: false }],
    });
  });

  it('does not let prefix and suffix overlap', () => {
    const diff = diffSegments('aa', 'aaa');
    expect(diff.expected.map((s) => s.text).join('')).toBe('aa');
    expect(diff.actual.map((s) => s.text).join('')).toBe('aaa');
    expect(diff.actual.some((s) => s.changed)).toBe(true);
  });

  it('handles empty values', () => {
    expect(diffSegments('', 'x')).toEqual({ expected: [], actual: [{ text: 'x', changed: true }] });
  });
});

describe('visibleWhitespace', () => {
  it('shows spaces only inside string and char literals', () => {
    expect(visibleWhitespace('"a b "')).toBe('"a·b·"');
    expect(visibleWhitespace("' '")).toBe("'·'");
    expect(visibleWhitespace('[1, 2]')).toBe('[1, 2]');
  });
});

describe('groupTests', () => {
  it('puts failures first, then not-run tests, and passed tests separately', () => {
    const { problems, passed } = groupTests([
      { name: 'a', status: 'PASSED' },
      { name: 'b', status: 'NOT_RUN' },
      { name: 'c', status: 'FAILED' },
      { name: 'd', status: 'CRASHED' },
      { name: 'e', status: 'PASSED' },
    ]);
    expect(problems.map((t) => t.name)).toEqual(['c', 'd', 'b']);
    expect(passed.map((t) => t.name)).toEqual(['a', 'e']);
  });
});

describe('firstErrorLine', () => {
  it('finds the first compiler error line', () => {
    const lines = [
      'In file included from test.cpp:2:',
      "solution.cpp:3:5: error: expected ';' before '}' token",
      'solution.cpp:9:1: error: another',
    ];
    expect(firstErrorLine(lines)).toBe(1);
    expect(firstErrorLine(['SyntaxError: invalid syntax'])).toBe(0);
    expect(firstErrorLine(['all good'])).toBe(-1);
  });
});
