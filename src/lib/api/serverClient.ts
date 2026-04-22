import 'server-only';

import { auth } from '@/lib/server/auth';
import { env } from '@/utils/env';
import { getServerSession } from 'next-auth';
import createClient from 'openapi-fetch';
import type { paths } from './types/index';

export const createServerClient = async () => {
  const session = await getServerSession(auth);

  const client = createClient<paths>({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });

  return client;
};
