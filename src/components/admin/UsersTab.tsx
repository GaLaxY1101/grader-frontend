'use client';

import { EmptyState } from '@/components/common/EmptyState';
import type { components } from '@/lib/api/types/index';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
import { CreateUserDialog } from './CreateUserDialog';
import { DeleteUserConfirmDialog } from './DeleteUserConfirmDialog';
import { EditUserDialog } from './EditUserDialog';

type UserResponse = components['schemas']['UserResponse'];

const ROLE_CHIP_COLOR: Record<string, 'primary' | 'warning' | 'default'> = {
  ADMIN: 'primary',
  TEACHER: 'warning',
  STUDENT: 'default',
};

interface UsersTabProps {
  users: UserResponse[];
}

export const UsersTab = ({ users }: UsersTabProps) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Users</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Box>

      {users.length === 0 ? (
        <EmptyState title="No users" description="No users have been added yet." />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id ?? `user-${index}`} hover>
                  <TableCell>{user.email ?? '—'}</TableCell>
                  <TableCell>{user.firstName ?? '—'}</TableCell>
                  <TableCell>{user.lastName ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role ?? '—'}
                      color={ROLE_CHIP_COLOR[user.role ?? ''] ?? 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditUser(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteUser(user)}
                        disabled={!user.isActive}
                      >
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

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserDialog user={editUser} open={editUser != null} onClose={() => setEditUser(null)} />
      <DeleteUserConfirmDialog
        user={deleteUser}
        open={deleteUser != null}
        onClose={() => setDeleteUser(null)}
      />
    </Box>
  );
};
