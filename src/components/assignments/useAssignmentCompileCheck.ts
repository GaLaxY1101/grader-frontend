import { apiClient } from '@/lib/api/client';
import { toast } from 'react-toastify';
import type { AssignmentFormValues } from './assignmentFormSchema';

export type CompileCheckResult =
  | { ok: true }
  | { ok: false; kind: 'compile_error'; output: string }
  | { ok: false; kind: 'request_error' };

/**
 * Runs the compile validation endpoint when code check is enabled. Toasts on
 * network failure. Returns a structured result so the caller can decide whether
 * to surface the compile-error dialog.
 */
export async function runCompileCheck(data: AssignmentFormValues): Promise<CompileCheckResult> {
  if (!data.enableCodeCheck || !data.functionSignature) return { ok: true };

  const { data: result, error } = await apiClient.POST('/api/compile/validate', {
    body: {
      solutionCode: data.functionSignature,
      testFileContent:
        data.testMode === 'UNIT_TEST' ? data.testFileContent || undefined : undefined,
    },
  });

  if (error || !result) {
    toast.error('Failed to validate compilation');
    return { ok: false, kind: 'request_error' };
  }
  if (!result.success) {
    return { ok: false, kind: 'compile_error', output: result.output ?? 'Unknown error' };
  }
  return { ok: true };
}
