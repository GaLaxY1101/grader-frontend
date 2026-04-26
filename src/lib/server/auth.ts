import { env } from '@/utils/env';
import { jwtDecode } from 'jwt-decode';
import type { AuthOptions, TokenSet } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// ─── Types ────────────────────────────────────────────────

interface DecodedToken {
  realm_access?: { roles: string[] };
  exp?: number;
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    access_token: string;
    id_token: string;
    roles: string[];
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_at: number;
    app_roles: string[];
    error?: string;
  }
}

// ─── Token refresh ────────────────────────────────────────

const getKeycloakTokenUrl = () =>
  `${env.KEYCLOAK_BASE_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const response = await fetch(getKeycloakTokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.KEYCLOAK_CLIENT_ID,
      client_secret: env.KEYCLOAK_CLIENT_SECRET,
      refresh_token: token.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const refreshed: TokenSet = await response.json();

  return {
    ...token,
    access_token: refreshed.access_token ?? token.access_token,
    id_token: refreshed.id_token ?? token.id_token,
    refresh_token: refreshed.refresh_token ?? token.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(refreshed.expires_in ?? 60),
  };
}

// ─── NextAuth config ──────────────────────────────────────

export const auth: AuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      wellKnown: `${env.KEYCLOAK_BASE_URL}/realms/${env.KEYCLOAK_REALM}/.well-known/openid-configuration`,
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      authorization: { params: { scope: 'openid email profile' } },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],

  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in — store tokens
      if (account) {
        const decoded = jwtDecode<DecodedToken>(account.access_token ?? '');
        return {
          ...token,
          access_token: account.access_token ?? '',
          id_token: account.id_token ?? '',
          refresh_token: account.refresh_token ?? '',
          expires_at: account.expires_at ?? 0,
          app_roles: Array.isArray(decoded.realm_access?.roles) ? decoded.realm_access.roles : [],
        };
      }

      // Token still valid (30s safety margin)
      const now = Math.floor(Date.now() / 1000);
      if (token.expires_at && now < token.expires_at - 30) {
        return token;
      }

      // Token expired — attempt silent refresh
      try {
        return await refreshAccessToken(token);
      } catch {
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },

    async session({ session, token }) {
      // Expose only what client components need
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.error = token.error;
      session.roles = token.app_roles;
      return session;
    },
  },

  pages: {
    signIn: '/signin',
  },
};
