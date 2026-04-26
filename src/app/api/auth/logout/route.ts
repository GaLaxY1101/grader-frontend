import { env } from '@/utils/env';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/logout
 *
 * Performs a back-channel logout against Keycloak (POST with refresh_token),
 * clears the local NextAuth session cookie, then redirects to /signin.
 *
 * Back-channel logout avoids the "Invalid parameter: id_token_hint" error that
 * Keycloak 26 throws when the id_token is expired or front-channel logout is
 * attempted with a stale token.
 */
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: env.NEXTAUTH_SECRET,
  });

  // Revoke the Keycloak session server-side using the refresh_token.
  // This is the recommended back-channel logout approach for Keycloak 26+.
  if (token?.refresh_token) {
    await fetch(
      `${env.KEYCLOAK_BASE_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.KEYCLOAK_CLIENT_ID,
          client_secret: env.KEYCLOAK_CLIENT_SECRET,
          refresh_token: token.refresh_token,
        }),
      },
    ).catch((err: unknown) => {
      // Don't block logout if Keycloak is temporarily unavailable.
      console.warn('Keycloak back-channel logout failed:', err);
    });
  }

  // Clear NextAuth session cookies (both secure and non-secure variants).
  const cookieStore = cookies();
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.session-token');

  // Redirect directly to sign-in — no Keycloak front-channel redirect needed.
  return NextResponse.redirect(new URL('/signin', request.url));
}
