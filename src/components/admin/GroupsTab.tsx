'use client';

import { EmptyState } from '@/components/common/EmptyState';
import type { components } from '@/lib/api/types/index';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { CreateGroupDialog } from './CreateGroupDialog';
import { DeleteGroupConfirmDialog } from './DeleteGroupConfirmDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { ManageGroupStudentsDialog } from './ManageGroupStudentsDialog';

type GroupResponse = components['schemas']['GroupResponse'];

interface GroupsTabProps {
  groups: GroupResponse[];
}

export const GroupsTab = ({ groups }: GroupsTabProps) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupResponse | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<GroupResponse | null>(null);
  const [manageGroup, setManageGroup] = useState<GroupResponse | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Groups</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add Group
        </Button>
      </Box>

      {groups.length === 0 ? (
        <EmptyState title="No groups" description="No groups have been created yet." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Faculty</TableCell>
                <TableCell>Speciality</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group, index) => (
                <TableRow key={group.id ?? `group-${index}`} hover>
                  <TableCell>{group.code ?? '—'}</TableCell>
                  <TableCell>{group.faculty ?? '—'}</TableCell>
                  <TableCell>{group.speciality ?? '—'}</TableCell>
                  <TableCell>{group.yearOfCreation ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={group.isActive ? 'Active' : 'Inactive'}
                      color={group.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Manage Students">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setManageGroup(group)}
                      >
                        <PeopleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditGroup(group)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteGroup(group)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditGroupDialog
        group={editGroup}
        open={editGroup != null}
        onClose={() => setEditGroup(null)}
      />
      <DeleteGroupConfirmDialog
        group={deleteGroup}
        open={deleteGroup != null}
        onClose={() => setDeleteGroup(null)}
      />
      <ManageGroupStudentsDialog
        group={manageGroup}
        open={manageGroup != null}
        onClose={() => setManageGroup(null)}
      />
    </Box>
  );
};
