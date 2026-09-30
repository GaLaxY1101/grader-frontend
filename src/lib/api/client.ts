import { env } from '@/utils/env';
import { getSession, signIn } from 'next-auth/react';
import createClient from 'openapi-fetch';
import type { paths } from './types/index';

// ─── Create base client ───────────────────────────────────

const baseClient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});

let redirectingToLogin = false;

const redirectToKeycloak = () => {
  if (redirectingToLogin || typeof window === 'undefined') return;
  redirectingToLogin = true;
  const callbackUrl = window.location.pathname + window.location.search;
  void signIn('keycloak', { callbackUrl });
};

// ─── Add JWT auth middleware ──────────────────────────────

baseClient.use({
  async onRequest({ request }) {
    const session = await getSession();

    if (session?.error === 'RefreshAccessTokenError') {
      redirectToKeycloak();
      return request;
    }

    if (session?.access_token) {
      request.headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    return request;
  },

  async onResponse({ response }) {
    if (response.status === 401) {
      redirectToKeycloak();
    }
    return response;
  },
});

export const apiClient = baseClient;
