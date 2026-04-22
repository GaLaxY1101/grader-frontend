'use client';

import { type Role } from '@/utils/roles';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';

const roleBadgeColor = {
  STUDENT: 'primary',
  TEACHER: 'success',
  ADMIN: 'error',
} as const satisfies Record<Role, 'primary' | 'success' | 'error'>;

// Derive a human-readable title from the current pathname.
// /dashboard          → Dashboard
// /courses            → Courses
// /courses/42         → Course Detail
// /courses/42/assignments/7 → Assignment Detail
// /admin              → Admin
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return 'Dashboard';

  // Walk from the end, skip numeric dynamic segments
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg !== undefined && !/^\d+$/.test(seg)) {
      // Pretty-print: "assignments" → "Assignment Detail" if followed by an id
      const hasIdAfter = i < segments.length - 1 && /^\d+$/.test(segments[i + 1] ?? '');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      return hasIdAfter ? `${label} Detail` : label;
    }
  }

  return 'Dashboard';
}

interface TopbarProps {
  userName: string;
  role: Role;
}

export const Topbar = ({ userName, role }: TopbarProps) => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', height: 64, justifyContent: 'center' }}
    >
      <Toolbar>
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {userName}
          </Typography>

          <Chip
            label={role}
            color={roleBadgeColor[role]}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em' }}
          />

          <Button variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
