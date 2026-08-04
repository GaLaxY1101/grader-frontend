import { z } from 'zod';

export const testCaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  testType: z.enum(['IO', 'EXCEPTION']),
  input: z.string().optional(),
  expectedOutput: z.string().optional(),
});

export const assignmentFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    maxScore: z.number().min(1, 'Min 1').max(1000, 'Max 1000'),
    deadline: z.string().optional(),
    enableCodeCheck: z.boolean(),
    language: z.enum(['C', 'CPP']).optional(),
    testMode: z.enum(['IO', 'UNIT_TEST']).optional(),
    ciConfigTemplate: z.string().optional(),
    functionSignature: z.string().optional(),
    testFileContent: z.string().optional(),
    testCases: z.array(testCaseSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.enableCodeCheck) return;
    if (!data.language) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Language is required',
        path: ['language'],
      });
    }
    if (!data.functionSignature?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Function signature is required',
        path: ['functionSignature'],
      });
    }
    if (data.testMode === 'UNIT_TEST') {
      if (data.language !== 'CPP') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Unit test mode requires C++',
          path: ['language'],
        });
      }
      if (!data.testFileContent?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Test file content is required for unit test mode',
          path: ['testFileContent'],
        });
      }
    }
  });

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export type ProgrammingTaskPayload = {
  language: 'C' | 'CPP';
  testMode: 'IO' | 'UNIT_TEST';
  ciConfigTemplate?: string;
  functionSignature?: string;
  testFileContent?: string;
  testCases?: Array<{
    name: string;
    testType: 'IO' | 'EXCEPTION';
    input?: string;
    expectedOutput?: string;
  }>;
};

/**
 * Converts an ISO datetime string to the YYYY-MM-DDTHH:mm format required by
 * datetime-local inputs. Returns empty string for a nullish input.
 */
export function toDatetimeLocal(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Builds the programmingTask sub-payload from validated form values, or
 * undefined if code check is disabled. Handles the IO vs UNIT_TEST branch.
 */
export function buildProgrammingTaskPayload(
  data: AssignmentFormValues,
): ProgrammingTaskPayload | undefined {
  if (!data.enableCodeCheck) return undefined;
  return {
    language: data.language as 'C' | 'CPP',
    testMode: (data.testMode as 'IO' | 'UNIT_TEST') ?? 'IO',
    ciConfigTemplate: data.ciConfigTemplate || undefined,
    functionSignature: data.functionSignature || undefined,
    testFileContent: data.testMode === 'UNIT_TEST' ? data.testFileContent || undefined : undefined,
    testCases:
      data.testMode !== 'UNIT_TEST'
        ? data.testCases?.map((tc) => ({
            name: tc.name,
            testType: tc.testType as 'IO' | 'EXCEPTION',
            input: tc.input || undefined,
            expectedOutput: tc.testType === 'IO' ? tc.expectedOutput || undefined : undefined,
          }))
        : undefined,
  };
}

interface ExistingProgrammingTask {
  language?: 'C' | 'CPP' | null;
  testMode?: 'IO' | 'UNIT_TEST' | null;
  ciConfigTemplate?: string | null;
  functionSignature?: string | null;
  testFileContent?: string | null;
  testCases?: Array<{
    name?: string | null;
    testType?: string | null;
    input?: string | null;
    expectedOutput?: string | null;
  }> | null;
}

interface ExistingAssignmentValues {
  title?: string | null;
  description?: string | null;
  maxScore?: number | null;
  deadline?: string | null;
  programmingTask?: ExistingProgrammingTask | null;
}

/**
 * Builds RHF defaultValues for an edit form given an existing assignment
 * (course or template). Missing/null fields fall back to sensible blanks.
 */
export function toFormDefaults(existing: ExistingAssignmentValues): AssignmentFormValues {
  const task = existing.programmingTask;
  return {
    title: existing.title ?? '',
    description: existing.description ?? '',
    maxScore: existing.maxScore ?? 100,
    deadline: toDatetimeLocal(existing.deadline ?? undefined),
    enableCodeCheck: task != null,
    language: task?.language ?? undefined,
    testMode: task?.testMode ?? 'IO',
    ciConfigTemplate: task?.ciConfigTemplate ?? '',
    functionSignature: task?.functionSignature ?? '',
    testFileContent: task?.testFileContent ?? '',
    testCases:
      task?.testCases?.map((tc) => ({
        name: tc.name ?? '',
        testType: (tc.testType as 'IO' | 'EXCEPTION') ?? 'IO',
        input: tc.input ?? '',
        expectedOutput: tc.expectedOutput ?? '',
      })) ?? [],
  };
}

export const emptyFormDefaults: AssignmentFormValues = {
  title: '',
  description: '',
  maxScore: 100,
  deadline: '',
  enableCodeCheck: false,
  testMode: 'IO',
  ciConfigTemplate: '',
  functionSignature: '',
  testFileContent: '',
  testCases: [],
};
