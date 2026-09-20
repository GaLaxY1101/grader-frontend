import { env } from '@/utils/env';
import { getSession } from 'next-auth/react';
import { apiClient } from './client';
import type { components } from './types/index';

type StudentColumnMapping = components['schemas']['StudentColumnMapping'];
type ParsedStudentsResponse = components['schemas']['ParsedStudentsResponse'];
type BulkCommitRequest = components['schemas']['BulkCommitRequest'];
type BulkCommitWithGroupRequest = components['schemas']['BulkCommitWithGroupRequest'];
type BulkImportResult = components['schemas']['BulkImportResult'];

interface RowError {
  rowNumber: number;
  field: string | null;
  message: string;
}

export interface BulkImportProblem {
  status: number;
  title: string;
  detail: string;
  errors?: RowError[];
  missingColumn?: string;
  detectedHeaders?: string[];
}

const isBulkImportProblem = (value: unknown): value is BulkImportProblem => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === 'number' && typeof v.title === 'string';
};

/**
 * openapi-fetch does not model multipart uploads cleanly, so we hand-craft this
 * request while still reusing the auth flow (session lookup) and the generated
 * response type.
 */
export const parseStudentsFile = async (
  file: File,
  mapping: StudentColumnMapping,
): Promise<ParsedStudentsResponse> => {
  const session = await getSession();
  const form = new FormData();
  form.append('meta', new Blob([JSON.stringify(mapping)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/groups/bulk-import/parse`, {
    method: 'POST',
    body: form,
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (isBulkImportProblem(body)) throw body;
    throw new Error(`Parse request failed: ${response.status}`);
  }
  return (await response.json()) as ParsedStudentsResponse;
};

export const commitBulkImportWithNewGroup = async (
  request: BulkCommitWithGroupRequest,
): Promise<BulkImportResult> => {
  const { data, error } = await apiClient.POST('/api/groups/bulk-import', {
    body: request,
  });
  if (error != null) {
    if (isBulkImportProblem(error as unknown)) throw error as unknown as BulkImportProblem;
    throw new Error('Commit failed');
  }
  if (data == null) {
    throw new Error('Commit succeeded but response body was empty');
  }
  return data;
};

export const commitBulkImportIntoGroup = async (
  groupId: number,
  request: BulkCommitRequest,
): Promise<BulkImportResult> => {
  const { data, error } = await apiClient.POST('/api/groups/{id}/students/bulk-import', {
    params: { path: { id: groupId } },
    body: request,
  });
  if (error != null) {
    if (isBulkImportProblem(error as unknown)) throw error as unknown as BulkImportProblem;
    throw new Error('Commit into group failed');
  }
  if (data == null) {
    throw new Error('Commit succeeded but response body was empty');
  }
  return data;
};
