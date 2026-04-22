import { MainLayout } from '@/components/layout/MainLayout';
import { auth } from '@/lib/server/auth';
import { type Role } from '@/utils/roles';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(auth);

  if (!session) {
    redirect('/signin');
  }

  const rawRole = session.roles?.[0];
  console.log('[ProtectedLayout] session.roles =', session.roles);
  const primaryRole = (rawRole ?? 'STUDENT') as Role;
  const userName = session.user?.name ?? 'Unknown';
  const userEmail = session.user?.email ?? '';

  return (
    <MainLayout role={primaryRole} userName={userName} userEmail={userEmail}>
      {children}
    </MainLayout>
  );
}
