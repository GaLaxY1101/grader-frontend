'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type GroupResponse = components['schemas']['GroupResponse'];
type GroupStudentResponse = components['schemas']['GroupStudentResponse'];
type StudentResponse = components['schemas']['StudentResponse'];

interface ManageGroupStudentsDialogProps {
  group: GroupResponse | null;
  open: boolean;
  onClose: () => void;
}

export const ManageGroupStudentsDialog = ({
  group,
  open,
  onClose,
}: ManageGroupStudentsDialogProps) => {
  const [members, setMembers] = useState<GroupStudentResponse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [memberFilter, setMemberFilter] = useState('');
  const [addFilter, setAddFilter] = useState('');
  const [removing, setRemoving] = useState<number | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [addPage, setAddPage] = useState(0);
  const [addRowsPerPage, setAddRowsPerPage] = useState(10);

  const fetchMembers = useCallback(async () => {
    if (group?.id == null) return;
    setLoadingMembers(true);
    try {
      const { data, error } = await apiClient.GET('/api/groups/{id}/students', {
        params: { path: { id: group.id } },
      });
      if (error) {
        toast.error('Failed to load group members');
        return;
      }
      setMembers(data ?? []);
    } finally {
      setLoadingMembers(false);
    }
  }, [group?.id]);

  const fetchAllStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const { data, error } = await apiClient.GET('/api/v1/students');
      if (error) {
        toast.error('Failed to load students');
        return;
      }
      setAllStudents(data ?? []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (open && group != null) {
      setMemberFilter('');
      setAddFilter('');
      setAddPage(0);
      void fetchMembers();
      void fetchAllStudents();
    }
  }, [open, group, fetchMembers, fetchAllStudents]);

  useEffect(() => {
    setAddPage(0);
  }, [addFilter]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.studentId)), [members]);

  const filteredMembers = useMemo(() => {
    const q = memberFilter.toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.firstName ?? ''} ${m.lastName ?? ''}`.toLowerCase().includes(q),
    );
  }, [members, memberFilter]);

  const availableStudents = useMemo(() => {
    const q = addFilter.toLowerCase();
    return allStudents.filter(
      (s) =>
        s.groupId == null &&
        !memberIds.has(s.id) &&
        (q === '' || `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase().includes(q)),
    );
  }, [allStudents, memberIds, addFilter]);

  const pagedAvailableStudents = useMemo(
    () => availableStudents.slice(addPage * addRowsPerPage, (addPage + 1) * addRowsPerPage),
    [availableStudents, addPage, addRowsPerPage],
  );

  const handleRemove = async (studentId: number) => {
    if (group?.id == null) return;
    setRemoving(studentId);
    try {
      const { error } = await apiClient.DELETE('/api/groups/{id}/students/{studentId}', {
        params: { path: { id: group.id, studentId } },
      });
      if (error) {
        toast.error('Failed to remove student');
        return;
      }
      setMembers((prev) => prev.filter((m) => m.studentId !== studentId));
      setAllStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, groupId: undefined, groupCode: undefined } : s,
        ),
      );
      toast.success('Student removed');
    } finally {
      setRemoving(null);
    }
  };

  const handleAdd = async (studentId: number) => {
    if (group?.id == null) return;
    setAdding(studentId);
    try {
      const { data, error } = await apiClient.POST('/api/groups/{id}/students/{studentId}', {
        params: { path: { id: group.id, studentId } },
      });
      if (error) {
        toast.error('Failed to add student');
        return;
      }
      if (data != null) setMembers((prev) => [...prev, data]);
      setAllStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, groupId: group.id, groupCode: group.code } : s,
        ),
      );
      toast.success('Student added');
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Manage Students — {group?.code}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Members <Chip label={members.length} size="small" sx={{ ml: 0.5 }} />
            </Typography>
            <TextField
              size="small"
              placeholder="Filter by name…"
              fullWidth
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredMembers.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: 'center' }}
              >
                {memberFilter ? 'No matching students' : 'No students in this group'}
              </Typography>
            ) : (
              <List dense disablePadding sx={{ maxHeight: 340, overflow: 'auto' }}>
                {filteredMembers.map((member) => (
                  <ListItem
                    key={member.studentId}
                    disableGutters
                    secondaryAction={
                      <Tooltip title="Remove from group">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={removing === member.studentId}
                            onClick={() =>
                              member.studentId != null && void handleRemove(member.studentId)
                            }
                          >
                            {removing === member.studentId ? (
                              <CircularProgress size={14} />
                            ) : (
                              <PersonRemoveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={`${member.firstName ?? ''} ${member.lastName ?? ''}`}
                      secondary={member.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Add Student <Chip label={availableStudents.length} size="small" sx={{ ml: 0.5 }} />
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Only students without an active group are shown.
            </Typography>
            <TextField
              size="small"
              placeholder="Search by name…"
              fullWidth
              value={addFilter}
              onChange={(e) => setAddFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            {loadingStudents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : availableStudents.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: 'center' }}
              >
                {addFilter
                  ? 'No unassigned students match your search'
                  : 'No unassigned students available'}
              </Typography>
            ) : (
              <>
                <List dense disablePadding>
                  {pagedAvailableStudents.map((student) => (
                    <ListItem
                      key={student.id}
                      disableGutters
                      secondaryAction={
                        <Tooltip title="Add to group">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={adding === student.id}
                              onClick={() => student.id != null && void handleAdd(student.id)}
                            >
                              {adding === student.id ? (
                                <CircularProgress size={14} />
                              ) : (
                                <PersonAddIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      }
                    >
                      <ListItemText
                        primary={`${student.firstName ?? ''} ${student.lastName ?? ''}`}
                        secondary={student.email}
                      />
                    </ListItem>
                  ))}
                </List>
                <TablePagination
                  component="div"
                  count={availableStudents.length}
                  page={addPage}
                  onPageChange={(_, next) => setAddPage(next)}
                  rowsPerPage={addRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setAddRowsPerPage(parseInt(e.target.value, 10));
                    setAddPage(0);
                  }}
                  rowsPerPageOptions={[10, 25, 50]}
                />
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
