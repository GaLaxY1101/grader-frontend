import { auth } from '@/lib/server/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(auth);

  if (!session) {
    redirect('/signin');
  }

  return <>{children}</>;
}
