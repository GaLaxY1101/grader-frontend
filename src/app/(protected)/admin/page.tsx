import { AdminPanel } from '@/components/admin/AdminPanel';
import { getGroups } from '@/lib/api/groups';
import { getUsers } from '@/lib/api/users';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(auth);

  if (!session?.roles.includes(Role.ADMIN)) {
    redirect('/dashboard');
  }

  let users: Awaited<ReturnType<typeof getUsers>>;
  let groups: Awaited<ReturnType<typeof getGroups>>;

  try {
    [users, groups] = await Promise.all([getUsers(), getGroups()]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  return <AdminPanel users={users ?? []} groups={groups ?? []} />;
}
