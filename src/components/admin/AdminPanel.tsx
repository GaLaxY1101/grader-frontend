'use client';

import { PageHeader } from '@/components/common/PageHeader';
import type { components } from '@/lib/api/types/index';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { GroupsTab } from './GroupsTab';
import { UsersTab } from './UsersTab';

type UserResponse = components['schemas']['UserResponse'];
type GroupResponse = components['schemas']['GroupResponse'];

interface AdminPanelProps {
  users: UserResponse[];
  groups: GroupResponse[];
}

export const AdminPanel = ({ users, groups }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <PageHeader title="Admin" subtitle="Manage users and groups" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v: number) => setActiveTab(v)}>
          <Tab label="Users" />
          <Tab label="Groups" />
        </Tabs>
      </Box>
      {activeTab === 0 && <UsersTab users={users} />}
      {activeTab === 1 && <GroupsTab groups={groups} />}
    </Box>
  );
};
