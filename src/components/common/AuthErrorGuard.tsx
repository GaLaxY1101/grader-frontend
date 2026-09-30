'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const AuthErrorGuard = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      const callbackUrl = window.location.pathname + window.location.search;
      void signIn('keycloak', { callbackUrl });
    }
  }, [session?.error]);

  return null;
};
