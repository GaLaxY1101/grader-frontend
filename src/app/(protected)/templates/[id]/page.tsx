import { TemplateDetailBody } from '@/components/templates/TemplateDetailBody';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

interface TemplateDetailPageProps {
  params: { id: string };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  if (!roles.includes(Role.TEACHER) && !roles.includes(Role.ADMIN)) redirect('/courses');

  const templateId = Number(params.id);
  if (!Number.isFinite(templateId) || templateId <= 0) redirect('/templates');

  return <TemplateDetailBody templateId={templateId} isAdmin={roles.includes(Role.ADMIN)} />;
}
