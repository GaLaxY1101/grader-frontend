import { CoursesPageBody } from '@/components/courses/CoursesPageBody';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import { getServerSession } from 'next-auth';

function getSubtitle(roles: string[]): string {
  if (roles.includes(Role.ADMIN)) return 'All archived courses';
  if (roles.includes(Role.TEACHER)) return 'Courses you have archived';
  return 'Your past courses';
}

function getEmptyDescription(roles: string[]): string {
  if (roles.includes(Role.TEACHER)) return "You haven't archived any courses yet";
  return 'You have no past courses yet';
}

interface ArchivePageProps {
  searchParams: {
    query?: string;
    groupId?: string;
    page?: string;
  };
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function parseGroupId(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];

  return (
    <CoursesPageBody
      isActive={false}
      title="Archive"
      subtitle={getSubtitle(roles)}
      emptyDescription={getEmptyDescription(roles)}
      canCreate={false}
      query={searchParams.query ?? ''}
      groupId={parseGroupId(searchParams.groupId)}
      page={parsePage(searchParams.page)}
    />
  );
}
