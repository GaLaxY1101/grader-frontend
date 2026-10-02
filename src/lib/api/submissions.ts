import { createServerClient } from '@/lib/api';
import type { components } from '@/lib/api/types';

/** Structured per-test results of an attempt, filtered by the task's feedback level. */
export type TestReport = components['schemas']['TestReportResponse'];
export type TestCaseResult = components['schemas']['TestCaseResponse'];

export interface SubmissionResponse {
  id: number;
  assignmentId: number;
  assignmentType: 'CODE' | 'FILE' | 'CODE_FILE';
  studentId: number;
  studentEmail: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';
  score: number | null;
  bestScore: number | null;
  grade: number | null;
  attemptCount: number;
  latestAttemptId: number | null;
  fileState: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'GRADED' | null;
  returnComment: string | null;
  submittedAt: string | null;
  returnedAt: string | null;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptResponse {
  id: number;
  submissionId: number;
  attemptNumber: number;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';
  score: number | null;
  codeContent: string | null;
  gitlabPipelineId: number | null;
  pipelineOutput: string | null;
  testReport?: TestReport | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const getSubmissionById = async (id: number): Promise<SubmissionResponse> => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/submissions/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch submission');
  return data as SubmissionResponse;
};

export const getMySubmission = async (assignmentId: number): Promise<SubmissionResponse | null> => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET(
    '/api/assignments/{assignmentId}/submissions/my',
    { params: { path: { assignmentId } } },
  );
  if (error) return null;
  return data as SubmissionResponse | null;
};

export const listSubmissionsByAssignment = async (
  assignmentId: number,
): Promise<SubmissionResponse[]> => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/assignments/{assignmentId}/submissions', {
    params: { path: { assignmentId } },
  });
  if (error) throw new Error('Failed to fetch submissions');
  return (data ?? []) as SubmissionResponse[];
};

export const listMyCourseSubmissions = async (courseId: number): Promise<SubmissionResponse[]> => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/courses/{courseId}/submissions/my', {
    params: { path: { courseId } },
  });
  if (error) return [];
  return (data ?? []) as SubmissionResponse[];
};

export const listAttempts = async (submissionId: number): Promise<AttemptResponse[]> => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/submissions/{submissionId}/attempts', {
    params: { path: { submissionId } },
  });
  if (error) throw new Error('Failed to fetch attempts');
  return (data ?? []) as AttemptResponse[];
};
