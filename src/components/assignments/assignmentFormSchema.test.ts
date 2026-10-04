import { describe, expect, it } from 'vitest';
import {
  assignmentFormSchema,
  buildProgrammingTaskPayload,
  emptyFormDefaults,
  toFormDefaults,
  type AssignmentFormValues,
} from './assignmentFormSchema';

const codeCheckValues = (overrides: Partial<AssignmentFormValues> = {}): AssignmentFormValues => ({
  ...emptyFormDefaults,
  title: 'Fibonacci',
  codeCheckEnabled: true,
  language: 'PYTHON',
  functionSignature: 'def fib(n):\n    pass\n',
  testFileContent: 'from solution import *\n',
  ...overrides,
});

describe('assignmentFormSchema – reference solution', () => {
  it('is optional', () => {
    expect(
      assignmentFormSchema.safeParse(codeCheckValues({ referenceSolution: undefined })).success,
    ).toBe(true);
  });

  it('is sent in the programming task payload', () => {
    const payload = buildProgrammingTaskPayload(
      codeCheckValues({ referenceSolution: 'def fib(n):\n    return n\n' }),
    );

    expect(payload?.referenceSolution).toBe('def fib(n):\n    return n\n');
  });

  it('is omitted from the payload when empty', () => {
    const payload = buildProgrammingTaskPayload(codeCheckValues({ referenceSolution: '' }));

    expect(payload).toBeDefined();
    expect(payload?.referenceSolution).toBeUndefined();
  });

  it('is not sent when code check is disabled', () => {
    const payload = buildProgrammingTaskPayload(
      codeCheckValues({ codeCheckEnabled: false, referenceSolution: 'x' }),
    );

    expect(payload).toBeUndefined();
  });

  it('is loaded into edit form defaults, and null becomes an empty string', () => {
    const withSolution = toFormDefaults({
      title: 'Fib',
      codeCheckEnabled: true,
      programmingTask: { language: 'PYTHON', referenceSolution: 'def fib(n): ...' },
    });
    const hiddenForStudent = toFormDefaults({
      title: 'Fib',
      programmingTask: { language: 'PYTHON', referenceSolution: null },
    });

    expect(withSolution.referenceSolution).toBe('def fib(n): ...');
    expect(hiddenForStudent.referenceSolution).toBe('');
    expect(emptyFormDefaults.referenceSolution).toBe('');
  });
});
