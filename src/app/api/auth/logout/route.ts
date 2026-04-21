import { auth } from '@/lib/server/auth';
import { env } from '@/utils/env';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  const session = await getServerSession(auth);
  const idToken = session?.id_token;

  // Clear Next.js session cookies
  const cookieStore = cookies();
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.session-token');

  // Redirect to Keycloak end-session endpoint
  const params = new URLSearchParams({
    client_id: env.KEYCLOAK_CLIENT_ID,
    post_logout_redirect_uri: `${env.NEXTAUTH_URL}/signin`,
    ...(idToken ? { id_token_hint: idToken } : {}),
  });

  redirect(
    `${env.KEYCLOAK_BASE_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect/logout?${params}`,
  );
}
