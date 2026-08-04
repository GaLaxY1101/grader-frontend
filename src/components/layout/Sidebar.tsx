'use client';

import { navigationConfig } from '@/components/layout/navigation';
import { type Role } from '@/utils/roles';
import ArchiveIcon from '@mui/icons-material/Archive';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SchoolIcon from '@mui/icons-material/School';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const SIDEBAR_WIDTH = 256;

const iconMap: Record<string, React.ElementType> = {
  School: SchoolIcon,
  Archive: ArchiveIcon,
  ManageAccounts: ManageAccountsIcon,
  ContentCopy: ContentCopyIcon,
};

function getInitials(email: string): string {
  const parts = email.split('@')[0]?.split('.') ?? [];
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

interface SidebarProps {
  role: Role;
  userEmail: string;
  open: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ role, userEmail, open, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const navItems = navigationConfig[role];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #1E3A5F 0%, #0F2040 100%)',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          transform: open ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.25s ease',
          visibility: open ? 'visible' : 'hidden',
        },
      }}
    >
      {/* Logo / App name */}
      <Box
        sx={{
          px: 2,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.5)',
            flexShrink: 0,
          }}
        >
          <SchoolIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: '#F1F5F9',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            University
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
              color: 'rgba(241,245,249,0.5)',
              lineHeight: 1,
            }}
          >
            Grader
          </Typography>
        </Box>

        {/* Collapse button */}
        <Tooltip title="Collapse sidebar" placement="right">
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              color: 'rgba(241,245,249,0.5)',
              borderRadius: '8px',
              p: 0.5,
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#F1F5F9',
              },
            }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav links */}
      <List sx={{ flexGrow: 1, pt: 2, px: 1.5 }}>
        <Typography
          sx={{
            px: 1.5,
            pb: 1,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(241,245,249,0.35)',
          }}
        >
          Navigation
        </Typography>

        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <ListItemButton
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={isActive}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                px: 1.5,
                py: 1,
                position: 'relative',
                transition: 'all 0.15s ease',
                '&::before': isActive
                  ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: '60%',
                      borderRadius: '0 2px 2px 0',
                      backgroundColor: '#60A5FA',
                    }
                  : {},
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {Icon != null && (
                  <Icon
                    fontSize="small"
                    sx={{
                      color: isActive ? '#60A5FA' : 'rgba(241,245,249,0.5)',
                      transition: 'color 0.15s ease',
                    }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#F1F5F9' : 'rgba(241,245,249,0.65)',
                  sx: { transition: 'color 0.15s ease' },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* User footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Tooltip title={userEmail} placement="top">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              flexShrink: 0,
              cursor: 'default',
            }}
          >
            {getInitials(userEmail)}
          </Avatar>
        </Tooltip>
        <Typography
          variant="caption"
          noWrap
          sx={{ color: 'rgba(241,245,249,0.5)', display: 'block', flex: 1, minWidth: 0 }}
        >
          {userEmail}
        </Typography>
      </Box>
    </Drawer>
  );
};
