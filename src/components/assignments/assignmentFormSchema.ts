import { z } from 'zod';

export const assignmentFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    maxScore: z.number().min(1, 'Min 1').max(1000, 'Max 1000'),
    deadline: z.string().optional(),
    enableCodeCheck: z.boolean(),
    language: z.enum(['C', 'CPP']).optional(),
    ciConfigTemplate: z.string().optional(),
    functionSignature: z.string().optional(),
    testFileContent: z.string().optional(),
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
    if (data.language !== 'CPP') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Unit test mode requires C++',
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
    if (!data.testFileContent?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Test file content is required',
        path: ['testFileContent'],
      });
    }
  });

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export type ProgrammingTaskPayload = {
  language: 'C' | 'CPP';
  testMode: 'UNIT_TEST';
  ciConfigTemplate?: string;
  functionSignature?: string;
  testFileContent?: string;
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
 * undefined if code check is disabled.
 */
export function buildProgrammingTaskPayload(
  data: AssignmentFormValues,
): ProgrammingTaskPayload | undefined {
  if (!data.enableCodeCheck) return undefined;
  return {
    language: data.language as 'C' | 'CPP',
    testMode: 'UNIT_TEST',
    ciConfigTemplate: data.ciConfigTemplate || undefined,
    functionSignature: data.functionSignature || undefined,
    testFileContent: data.testFileContent || undefined,
  };
}

interface ExistingProgrammingTask {
  language?: 'C' | 'CPP' | null;
  ciConfigTemplate?: string | null;
  functionSignature?: string | null;
  testFileContent?: string | null;
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
    ciConfigTemplate: task?.ciConfigTemplate ?? '',
    functionSignature: task?.functionSignature ?? '',
    testFileContent: task?.testFileContent ?? '',
  };
}

export const emptyFormDefaults: AssignmentFormValues = {
  title: '',
  description: '',
  maxScore: 100,
  deadline: '',
  enableCodeCheck: false,
  ciConfigTemplate: '',
  functionSignature: '',
  testFileContent: '',
};
