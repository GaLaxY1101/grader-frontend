import { env } from '@/utils/env';
import { getSession } from 'next-auth/react';
import createClient from 'openapi-fetch';
import type { paths } from './types/index';

// ─── Create base client ───────────────────────────────────

const baseClient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});

// ─── Add JWT auth middleware ──────────────────────────────

baseClient.use({
  async onRequest({ request }) {
    const session = await getSession();

    if (session?.access_token) {
      request.headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    return request;
  },
});

export const apiClient = baseClient;
