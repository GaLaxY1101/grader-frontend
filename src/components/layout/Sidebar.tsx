'use client';

import { navigationConfig } from '@/components/layout/navigation';
import { type Role } from '@/utils/roles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const SIDEBAR_WIDTH = 240;

const iconMap: Record<string, React.ElementType> = {
  Dashboard: DashboardIcon,
  School: SchoolIcon,
  ManageAccounts: ManageAccountsIcon,
};

interface SidebarProps {
  role: Role;
  userEmail: string;
}

export const Sidebar = ({ role, userEmail }: SidebarProps) => {
  const pathname = usePathname();
  const navItems = navigationConfig[role];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* App name */}
      <Box sx={{ px: 2, display: 'flex', alignItems: 'center', height: 64 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          University Grader
        </Typography>
      </Box>

      <Divider />

      {/* Nav links */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <ListItemButton
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={isActive}
              sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {Icon != null && <Icon fontSize="small" color={isActive ? 'primary' : 'inherit'} />}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* User email footer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {userEmail}
        </Typography>
      </Box>
    </Drawer>
  );
};
