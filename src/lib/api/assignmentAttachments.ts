import { env } from '@/utils/env';
import { getSession } from 'next-auth/react';
import { apiClient } from './client';
import type { components } from './types/index';

type AttachmentSummary = components['schemas']['AttachmentSummary'];
type UploadResponse = components['schemas']['UploadResponse'];

/**
 * Uploads one or more teacher attachments to an assignment.
 * openapi-fetch does not model multipart cleanly, so we hand-craft the request.
 */
export const uploadAssignmentAttachments = async (
  assignmentId: number,
  files: File[],
): Promise<UploadResponse> => {
  const session = await getSession();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/assignments/${assignmentId}/attachments`,
    {
      method: 'POST',
      body: form,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Attachment upload failed: ${response.status}`);
  }
  return (await response.json()) as UploadResponse;
};

export const listAssignmentAttachments = async (
  assignmentId: number,
): Promise<AttachmentSummary[]> => {
  const { data, error } = await apiClient.GET('/api/assignments/{id}/attachments', {
    params: { path: { id: assignmentId } },
  });
  if (error != null) {
    throw new Error('Failed to list assignment attachments');
  }
  return data ?? [];
};

export const deleteAssignmentAttachment = async (
  assignmentId: number,
  attachmentId: number,
): Promise<void> => {
  const { error } = await apiClient.DELETE('/api/assignments/{id}/attachments/{attachmentId}', {
    params: { path: { id: assignmentId, attachmentId } },
  });
  if (error != null) {
    throw new Error('Failed to delete attachment');
  }
};

/**
 * Fetches a short-lived pre-signed MinIO URL for the attachment. Caller typically
 * opens the returned URL in a new tab (`window.open`) so the browser handles the download.
 */
export const getAssignmentAttachmentDownloadUrl = async (
  assignmentId: number,
  attachmentId: number,
): Promise<string> => {
  const { data, error } = await apiClient.GET(
    '/api/assignments/{id}/attachments/{attachmentId}/download',
    {
      params: { path: { id: assignmentId, attachmentId } },
    },
  );
  if (error != null || data?.url == null) {
    throw new Error('Failed to get download URL');
  }
  return data.url;
};
