'use client';

import { type Role } from '@/utils/roles';
import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    roles: session?.roles ?? [],
    accessToken: session?.access_token,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    hasRole: (role: Role) => session?.roles?.includes(role) ?? false,
  };
};
