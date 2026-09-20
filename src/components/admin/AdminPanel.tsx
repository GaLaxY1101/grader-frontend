'use client';

import { PageHeader } from '@/components/common/PageHeader';
import type { components } from '@/lib/api/types/index';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { GroupsTab } from './GroupsTab';
import { StudentsTab } from './StudentsTab';
import { UsersTab } from './UsersTab';

type GroupResponse = components['schemas']['GroupResponse'];

interface AdminPanelProps {
  groups: GroupResponse[];
}

export const AdminPanel = ({ groups }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <PageHeader title="Admin" subtitle="Manage users, groups and students" />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v: number) => setActiveTab(v)}>
          <Tab label="Users" />
          <Tab label="Groups" />
          <Tab label="Students" />
        </Tabs>
      </Box>
      {activeTab === 0 && <UsersTab />}
      {activeTab === 1 && <GroupsTab groups={groups} />}
      {activeTab === 2 && <StudentsTab groups={groups} />}
    </Box>
  );
};
