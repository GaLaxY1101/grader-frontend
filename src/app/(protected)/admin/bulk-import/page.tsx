import { BulkImportPage } from '@/components/admin/BulkImportPage';
import { getGroups } from '@/lib/api/groups';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function BulkImportRoute() {
  const session = await getServerSession(auth);

  if (!session?.roles.includes(Role.ADMIN) && !session?.roles.includes(Role.TEACHER)) {
    redirect('/courses');
  }

  let groups: Awaited<ReturnType<typeof getGroups>>;
  try {
    groups = await getGroups();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  return <BulkImportPage groups={groups ?? []} />;
}
