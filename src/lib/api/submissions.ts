import { createServerClient } from '@/lib/api';

export const getSubmissionById = async (id: number) => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/submissions/{id}', {
    params: { path: { id } },
  });
  if (error) throw new Error('Failed to fetch submission');
  return data as {
    id: number;
    assignmentId: number;
    studentId: number;
    studentEmail: string;
    status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR';
    score: number | null;
    codeContent: string | null;
    gitlabPipelineId: number | null;
    pipelineOutput: string | null;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
  };
};

export const getMyLatestSubmission = async (assignmentId: number) => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET(
    '/api/assignments/{assignmentId}/submissions/my',
    { params: { path: { assignmentId } } },
  );
  if (error) return null;
  return data as Awaited<ReturnType<typeof getSubmissionById>> | null;
};

export const listSubmissionsByAssignment = async (assignmentId: number) => {
  const client = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any).GET('/api/assignments/{assignmentId}/submissions', {
    params: { path: { assignmentId } },
  });
  if (error) throw new Error('Failed to fetch submissions');
  return (data ?? []) as Awaited<ReturnType<typeof getSubmissionById>>[];
};
