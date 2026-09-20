'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CreateUserDialog } from './CreateUserDialog';
import { DeleteUserConfirmDialog } from './DeleteUserConfirmDialog';
import { EditUserDialog } from './EditUserDialog';

type UserResponse = components['schemas']['UserResponse'];

const ROLE_CHIP_COLOR: Record<string, 'primary' | 'warning' | 'default'> = {
  ADMIN: 'primary',
  TEACHER: 'warning',
  STUDENT: 'default',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const UsersTab = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.GET('/api/v1/users', {
        params: { query: { query: debouncedQuery || undefined, page, size } },
      });
      if (error) {
        toast.error('Failed to load users');
        return;
      }
      setUsers(data?.content ?? []);
      setTotalElements(data?.totalElements ?? 0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, size]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Users</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Add User
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by email or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 320 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <EmptyState
          title={debouncedQuery ? 'No matches' : 'No users'}
          description={
            debouncedQuery ? 'No users match your search.' : 'No users have been added yet.'
          }
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
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
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={size}
            onRowsPerPageChange={(e) => {
              setSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          />
        </Paper>
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
