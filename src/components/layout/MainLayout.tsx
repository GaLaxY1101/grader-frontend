'use client';

import { Sidebar, SIDEBAR_WIDTH } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { type Role } from '@/utils/roles';
import Box from '@mui/material/Box';
import React, { createContext, useContext, useMemo, useState } from 'react';

interface SidebarState {
  open: boolean;
  width: number;
}

const SidebarContext = createContext<SidebarState>({ open: true, width: SIDEBAR_WIDTH });

export const useSidebarState = (): SidebarState => useContext(SidebarContext);

interface MainLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  role: Role;
}

export const MainLayout = ({ children, userName, userEmail, role }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarState = useMemo<SidebarState>(
    () => ({ open: sidebarOpen, width: SIDEBAR_WIDTH }),
    [sidebarOpen],
  );

  return (
    <SidebarContext.Provider value={sidebarState}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Left: fixed sidebar */}
        <Sidebar
          role={role}
          userEmail={userEmail}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Right: topbar + scrollable content */}
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Topbar
            userName={userName}
            role={role}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />

          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              bgcolor: 'background.paper',
              overflowY: 'auto',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </SidebarContext.Provider>
  );
};
