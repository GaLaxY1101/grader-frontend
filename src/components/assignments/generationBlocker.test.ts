import { describe, expect, it, vi } from 'vitest';

// The panel module imports the API client, which validates env vars on import.
vi.mock('@/lib/api/testGeneration', () => ({
  startTestGeneration: vi.fn(),
  getTestGenerationJob: vi.fn(),
}));
vi.mock('@monaco-editor/react', () => ({ default: () => null }));

const { generationBlocker, isUntouchedTestFile } = await import('./TestGenerationPanel');

describe('isUntouchedTestFile', () => {
  const template = 'from solution import *\n\n\ndef test_example():\n    assert True\n';

  it('treats empty content and the starter template as untouched, ignoring CRLF', () => {
    expect(isUntouchedTestFile('  ', 'PYTHON')).toBe(true);
    expect(isUntouchedTestFile(template, 'PYTHON')).toBe(true);
    expect(isUntouchedTestFile(template.replace(/\n/g, '\r\n'), 'PYTHON')).toBe(true);
  });

  it('treats edited content as touched', () => {
    expect(isUntouchedTestFile(template + '\ndef test_more():\n    pass\n', 'PYTHON')).toBe(false);
  });
});

describe('generationBlocker', () => {
  const ready = {
    language: 'PYTHON',
    description: 'Return the n-th Fibonacci number.',
    referenceSolution: 'def fib(n): ...',
  };

  it('allows generation when language, description and reference solution are set', () => {
    expect(generationBlocker(ready)).toBeNull();
  });

  it.each([
    [{ ...ready, language: undefined }, 'Select a language first'],
    [{ ...ready, description: '   ' }, 'Add a task description first'],
    [{ ...ready, referenceSolution: '' }, 'Enter a reference solution first'],
  ])('explains what is missing (%#)', (values, message) => {
    expect(generationBlocker(values)).toBe(message);
  });
});
