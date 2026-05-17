'use client';

import { type Role } from '@/utils/roles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { usePathname } from 'next/navigation';

const roleBadgeColor = {
  STUDENT: 'primary',
  TEACHER: 'success',
  ADMIN: 'error',
} as const satisfies Record<Role, 'primary' | 'success' | 'error'>;

const roleLabel: Record<Role, string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  ADMIN: 'Admin',
};

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return 'Dashboard';

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg !== undefined && !/^\d+$/.test(seg)) {
      const hasIdAfter = i < segments.length - 1 && /^\d+$/.test(segments[i + 1] ?? '');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      return hasIdAfter ? `${label} Detail` : label;
    }
  }

  return 'Dashboard';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface TopbarProps {
  userName: string;
  role: Role;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Topbar = ({ userName, role, sidebarOpen, onToggleSidebar }: TopbarProps) => {
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
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: 64,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Show burger in topbar only when sidebar is hidden */}
        <Fade in={!sidebarOpen}>
          <IconButton
            onClick={onToggleSidebar}
            size="small"
            sx={{
              color: 'text.secondary',
              borderRadius: '8px',
              p: 0.75,
              '&:hover': { backgroundColor: 'action.hover' },
              // keep space reserved so layout doesn't shift
              visibility: sidebarOpen ? 'hidden' : 'visible',
            }}
            aria-label="Open sidebar"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Fade>

        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ flexGrow: 1, color: 'text.primary', letterSpacing: '-0.01em' }}
        >
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Role badge */}
          <Chip
            label={roleLabel[role]}
            color={roleBadgeColor[role]}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.01em' }}
          />

          {/* Divider */}
          <Box
            sx={{
              width: '1px',
              height: 24,
              backgroundColor: 'divider',
              mx: 0.5,
            }}
          />

          {/* User name */}
          <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
            {userName}
          </Typography>

          {/* User avatar */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            }}
          >
            {getInitials(userName)}
          </Avatar>

          {/* Logout */}
          <Tooltip title="Sign out">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'text.secondary',
                borderRadius: '8px',
                p: 0.75,
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.main',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
