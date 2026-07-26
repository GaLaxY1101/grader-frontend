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
  TableRow,
  TextField,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type GroupResponse = components['schemas']['GroupResponse'];
type GroupStudentResponse = components['schemas']['GroupStudentResponse'];

interface StudentsTabProps {
  groups: GroupResponse[];
}

export const StudentsTab = ({ groups }: StudentsTabProps) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [students, setStudents] = useState<GroupStudentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState('');

  const fetchStudents = useCallback(async (groupId: number) => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.GET('/api/groups/{id}/students', {
        params: { path: { id: groupId } },
      });
      if (error) {
        toast.error('Failed to load students');
        return;
      }
      setStudents(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGroupChange = (_: unknown, group: GroupResponse | null) => {
    setSelectedGroup(group);
    setNameFilter('');
    setStudents([]);
    if (group?.id != null) void fetchStudents(group.id);
  };

  const filteredStudents = useMemo(() => {
    const q = nameFilter.toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase().includes(q),
    );
  }, [students, nameFilter]);

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
          placeholder="Search by name…"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          disabled={selectedGroup == null}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 260 }}
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
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title={nameFilter ? 'No matches' : 'No students'}
          description={
            nameFilter
              ? 'No students match your search in this group.'
              : 'This group has no enrolled students yet.'
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
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
              {filteredStudents.map((s, i) => (
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
      )}
    </Box>
  );
};
