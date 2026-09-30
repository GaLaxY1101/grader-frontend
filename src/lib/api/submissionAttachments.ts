import { env } from '@/utils/env';
import { getSession } from 'next-auth/react';
import { apiClient } from './client';
import type { components } from './types/index';

type AttachmentSummary = components['schemas']['AttachmentSummary'];
type SubmissionUploadResult = components['schemas']['SubmissionUploadResult'];
type SubmissionResponse = components['schemas']['SubmissionResponse'];

/**
 * Student uploads one or more files against an assignment. Backend auto-creates
 * the Submission on first call and transitions it into DRAFT.
 */
export const uploadSubmissionAttachments = async (
  assignmentId: number,
  files: File[],
): Promise<SubmissionUploadResult> => {
  const session = await getSession();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/assignments/${assignmentId}/submissions/attachments`,
    {
      method: 'POST',
      body: form,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Submission upload failed: ${response.status}`);
  }
  return (await response.json()) as SubmissionUploadResult;
};

export const listSubmissionAttachments = async (
  submissionId: number,
): Promise<AttachmentSummary[]> => {
  const { data, error } = await apiClient.GET('/api/submissions/{id}/attachments', {
    params: { path: { id: submissionId } },
  });
  if (error != null) {
    throw new Error('Failed to list submission attachments');
  }
  return data ?? [];
};

export const deleteSubmissionAttachment = async (
  submissionId: number,
  attachmentId: number,
): Promise<void> => {
  const { error } = await apiClient.DELETE('/api/submissions/{id}/attachments/{attachmentId}', {
    params: { path: { id: submissionId, attachmentId } },
  });
  if (error != null) {
    throw new Error('Failed to delete attachment');
  }
};

export const getSubmissionAttachmentDownloadUrl = async (
  submissionId: number,
  attachmentId: number,
): Promise<string> => {
  const { data, error } = await apiClient.GET(
    '/api/submissions/{id}/attachments/{attachmentId}/download',
    {
      params: { path: { id: submissionId, attachmentId } },
    },
  );
  if (error != null || data?.url == null) {
    throw new Error('Failed to get download URL');
  }
  return data.url;
};

export const turnInSubmission = async (submissionId: number): Promise<SubmissionResponse> => {
  const { data, error } = await apiClient.POST('/api/submissions/{id}/turn-in', {
    params: { path: { id: submissionId } },
  });
  if (error != null || data == null) {
    throw new Error('Failed to turn in submission');
  }
  return data;
};

export const returnSubmission = async (
  submissionId: number,
  comment: string | undefined,
): Promise<SubmissionResponse> => {
  const { data, error } = await apiClient.POST('/api/submissions/{id}/return', {
    params: { path: { id: submissionId } },
    body: { comment },
  });
  if (error != null || data == null) {
    throw new Error('Failed to return submission');
  }
  return data;
};
