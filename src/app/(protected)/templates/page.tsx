import { TemplatesPageBody } from '@/components/templates/TemplatesPageBody';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

interface TemplatesPageProps {
  searchParams: {
    query?: string;
    page?: string;
  };
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const isTeacherOrAdmin = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);
  if (!isTeacherOrAdmin) redirect('/courses');

  return (
    <TemplatesPageBody
      query={searchParams.query ?? ''}
      page={parsePage(searchParams.page)}
      isAdmin={roles.includes(Role.ADMIN)}
    />
  );
}
