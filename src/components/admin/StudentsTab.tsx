'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  CircularProgress,
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
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type GroupResponse = components['schemas']['GroupResponse'];
type GroupStudentResponse = components['schemas']['GroupStudentResponse'];

interface StudentsTabProps {
  groups: GroupResponse[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const StudentsTab = ({ groups }: StudentsTabProps) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [students, setStudents] = useState<GroupStudentResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, selectedGroup]);

  const fetchStudents = useCallback(async () => {
    if (selectedGroup?.id == null) return;
    setLoading(true);
    try {
      const { data, error } = await apiClient.GET('/api/groups/{id}/students', {
        params: {
          path: { id: selectedGroup.id },
          query: { query: debouncedQuery || undefined, page, size },
        },
      });
      if (error) {
        toast.error('Failed to load students');
        return;
      }
      setStudents(data?.content ?? []);
      setTotalElements(data?.totalElements ?? 0);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, debouncedQuery, page, size]);

  useEffect(() => {
    if (selectedGroup?.id != null) void fetchStudents();
    else {
      setStudents([]);
      setTotalElements(0);
    }
  }, [fetchStudents, selectedGroup]);

  const handleGroupChange = (_: unknown, group: GroupResponse | null) => {
    setSelectedGroup(group);
    setQuery('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Autocomplete<GroupResponse>
          options={groups}
          getOptionLabel={(g) => g.code ?? ''}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedGroup}
          onChange={handleGroupChange}
          sx={{ width: 220 }}
          renderInput={(params) => <TextField {...params} label="Group" size="small" />}
        />
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={selectedGroup == null}
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

      {selectedGroup == null ? (
        <EmptyState
          title="Select a group"
          description="Choose a group above to view its students."
          icon={<GroupIcon />}
        />
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : students.length === 0 ? (
        <EmptyState
          title={debouncedQuery ? 'No matches' : 'No students'}
          description={
            debouncedQuery
              ? 'No students match your search in this group.'
              : 'This group has no enrolled students yet.'
          }
        />
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Enrolled At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow key={s.studentId ?? i} hover>
                    <TableCell>{s.firstName ?? '—'}</TableCell>
                    <TableCell>{s.lastName ?? '—'}</TableCell>
                    <TableCell>{s.email ?? '—'}</TableCell>
                    <TableCell>
                      {s.enrolledAt != null ? new Date(s.enrolledAt).toLocaleDateString() : '—'}
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
    </Box>
  );
};
