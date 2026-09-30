import 'server-only';

import { createServerClient } from '@/lib/api/serverClient';
import type { components } from './types/index';

type AttachmentSummary = components['schemas']['AttachmentSummary'];

/**
 * Server-side attachment list. Uses the authenticated NextAuth session on the
 * server so it works inside Server Components and route handlers where the
 * browser client cannot attach a JWT.
 */
export const listAssignmentAttachmentsServer = async (
  assignmentId: number,
): Promise<AttachmentSummary[]> => {
  const client = await createServerClient();
  const { data, error } = await client.GET('/api/assignments/{id}/attachments', {
    params: { path: { id: assignmentId } },
  });
  if (error != null) {
    throw new Error('Failed to list assignment attachments');
  }
  return data ?? [];
};
