import { LogoutButton } from '@/components/common/LogoutButton';
import { auth } from '@/lib/server/auth';
import { Box, Typography } from '@mui/material';
import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
  const session = await getServerSession(auth);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Welcome, {session?.user?.name}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Roles: {session?.roles?.join(', ') || 'none'}
      </Typography>
      <Box sx={{ mt: 3 }}>
        <LogoutButton />
      </Box>
    </Box>
  );
}
