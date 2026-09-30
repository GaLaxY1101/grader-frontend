import { env } from '@/utils/env';
import { getSession } from 'next-auth/react';
import { apiClient } from './client';
import type { components } from './types/index';

type AttachmentSummary = components['schemas']['AttachmentSummary'];
type UploadResponse = components['schemas']['UploadResponse'];

export const uploadTemplateAssignmentAttachments = async (
  templateAssignmentId: number,
  files: File[],
): Promise<UploadResponse> => {
  const session = await getSession();
  const form = new FormData();
  files.forEach((f) => form.append('files', f));

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/template-assignments/${templateAssignmentId}/attachments`,
    {
      method: 'POST',
      body: form,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Template attachment upload failed: ${response.status}`);
  }
  return (await response.json()) as UploadResponse;
};

export const listTemplateAssignmentAttachments = async (
  templateAssignmentId: number,
): Promise<AttachmentSummary[]> => {
  const { data, error } = await apiClient.GET('/api/template-assignments/{id}/attachments', {
    params: { path: { id: templateAssignmentId } },
  });
  if (error != null) {
    throw new Error('Failed to list template attachments');
  }
  return data ?? [];
};

export const deleteTemplateAssignmentAttachment = async (
  templateAssignmentId: number,
  attachmentId: number,
): Promise<void> => {
  const { error } = await apiClient.DELETE(
    '/api/template-assignments/{id}/attachments/{attachmentId}',
    { params: { path: { id: templateAssignmentId, attachmentId } } },
  );
  if (error != null) {
    throw new Error('Failed to delete template attachment');
  }
};

export const getTemplateAssignmentAttachmentDownloadUrl = async (
  templateAssignmentId: number,
  attachmentId: number,
): Promise<string> => {
  const { data, error } = await apiClient.GET(
    '/api/template-assignments/{id}/attachments/{attachmentId}/download',
    { params: { path: { id: templateAssignmentId, attachmentId } } },
  );
  if (error != null || data?.url == null) {
    throw new Error('Failed to get download URL');
  }
  return data.url;
};
