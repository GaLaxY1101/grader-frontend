'use client';

import { EmptyState } from '@/components/common/EmptyState';
import type { components } from '@/lib/api/types/index';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
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
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CreateGroupDialog } from './CreateGroupDialog';
import { DeleteGroupConfirmDialog } from './DeleteGroupConfirmDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { ManageGroupStudentsDialog } from './ManageGroupStudentsDialog';

type GroupResponse = components['schemas']['GroupResponse'];

interface GroupsTabProps {
  groups: GroupResponse[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const GroupsTab = ({ groups }: GroupsTabProps) => {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupResponse | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<GroupResponse | null>(null);
  const [manageGroup, setManageGroup] = useState<GroupResponse | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) =>
      [g.code, g.faculty, g.speciality]
        .filter((v): v is string => typeof v === 'string')
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [groups, query]);

  const paginated = useMemo(
    () => filtered.slice(page * size, page * size + size),
    [filtered, page, size],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Groups</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => router.push('/admin/bulk-import')}
          >
            Bulk Import
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add Group
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by code, faculty or speciality…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 380 }}
        />
      </Box>

      {filtered.length === 0 ? (
        <EmptyState
          title={query.trim() ? 'No matches' : 'No groups'}
          description={
            query.trim() ? 'No groups match your search.' : 'No groups have been created yet.'
          }
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
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
                {paginated.map((group, index) => (
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
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteGroup(group)}
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
            count={filtered.length}
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
