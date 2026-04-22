import { MainLayout } from '@/components/layout/MainLayout';
import { auth } from '@/lib/server/auth';
import { Role, type Role as RoleType } from '@/utils/roles';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const APP_ROLES = new Set<string>([Role.STUDENT, Role.TEACHER, Role.ADMIN]);

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(auth);

  if (!session) {
    redirect('/signin');
  }

  const primaryRole: RoleType =
    (session.roles?.find((r) => APP_ROLES.has(r)) as RoleType | undefined) ?? Role.STUDENT;
  const userName = session.user?.name ?? 'Unknown';
  const userEmail = session.user?.email ?? '';

  return (
    <MainLayout role={primaryRole} userName={userName} userEmail={userEmail}>
      {children}
    </MainLayout>
  );
}
