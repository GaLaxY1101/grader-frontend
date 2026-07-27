'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type StudentResponse = components['schemas']['StudentResponse'];
type GroupResponse = components['schemas']['GroupResponse'];
type EnrolledStudentResponse = components['schemas']['EnrolledStudentResponse'];

const UNGROUPED_LABEL = 'Ungrouped';

interface ManageStudentsDialogProps {
  courseId: number;
  enrolledStudents: EnrolledStudentResponse[];
  open: boolean;
  onClose: () => void;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

interface GroupBucket {
  key: string;
  label: string;
  groupId: number | null;
  isUngrouped: boolean;
  students: EnrolledStudentResponse[];
}

function bucketByGroup(students: EnrolledStudentResponse[]): GroupBucket[] {
  const buckets = new Map<string, GroupBucket>();
  for (const s of students) {
    const key = s.groupCode ?? '__ungrouped__';
    const label = s.groupCode ?? UNGROUPED_LABEL;
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        label,
        groupId: s.groupId ?? null,
        isUngrouped: s.groupCode == null,
        students: [],
      });
    }
    buckets.get(key)!.students.push(s);
  }
  const sorted = Array.from(buckets.values()).sort((a, b) => {
    if (a.isUngrouped) return 1;
    if (b.isUngrouped) return -1;
    return a.label.localeCompare(b.label);
  });
  for (const b of sorted) {
    b.students.sort((a, b) =>
      `${a.lastName ?? ''} ${a.firstName ?? ''}`.localeCompare(
        `${b.lastName ?? ''} ${b.firstName ?? ''}`,
      ),
    );
  }
  return sorted;
}

export const ManageStudentsDialog = ({
  courseId,
  enrolledStudents,
  open,
  onClose,
}: ManageStudentsDialogProps) => {
  const router = useRouter();
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingGroup, setEnrollingGroup] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removingGroupId, setRemovingGroupId] = useState<number | null>(null);
  const [confirmBucket, setConfirmBucket] = useState<GroupBucket | null>(null);
  const [currentEnrolled, setCurrentEnrolled] =
    useState<EnrolledStudentResponse[]>(enrolledStudents);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentEnrolled(enrolledStudents);
  }, [enrolledStudents]);

  useEffect(() => {
    if (!open) return;
    setLoadingStudents(true);
    setLoadingGroups(true);
    apiClient.GET('/api/v1/students').then(({ data, error }) => {
      if (error) toast.error('Failed to load students');
      else setAllStudents(data ?? []);
      setLoadingStudents(false);
    });
    apiClient.GET('/api/groups').then(({ data, error }) => {
      if (error) toast.error('Failed to load groups');
      else setAllGroups(data ?? []);
      setLoadingGroups(false);
    });
  }, [open]);

  const enrolledIds = useMemo(
    () => new Set(currentEnrolled.map((s) => s.studentId)),
    [currentEnrolled],
  );
  const availableStudents = useMemo(
    () => allStudents.filter((s) => s.id != null && !enrolledIds.has(s.id)),
    [allStudents, enrolledIds],
  );
  const buckets = useMemo(() => bucketByGroup(currentEnrolled), [currentEnrolled]);

  const toggleBucket = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (selectedStudent?.id == null) return;
    setEnrolling(true);
    const { data, error } = await apiClient.POST('/api/courses/{id}/students/{studentId}', {
      params: { path: { id: courseId, studentId: selectedStudent.id } },
    });
    if (error) {
      toast.error('Failed to enroll student');
    } else if (data != null) {
      const fullName =
        `${selectedStudent.firstName ?? ''} ${selectedStudent.lastName ?? ''}`.trim();
      toast.success(`${fullName || 'Student'} enrolled`);
      setCurrentEnrolled((prev) => [...prev, data]);
      setSelectedStudent(null);
      router.refresh();
    }
    setEnrolling(false);
  };

  const handleEnrollGroup = async () => {
    if (selectedGroup?.id == null) return;
    setEnrollingGroup(true);
    const { data, error } = await apiClient.POST('/api/courses/{id}/groups/{groupId}', {
      params: { path: { id: courseId, groupId: selectedGroup.id } },
    });
    if (error) {
      toast.error('Failed to enroll group');
    } else {
      const added = data ?? [];
      if (added.length === 0) {
        toast.info(`No new students to enroll from ${selectedGroup.code ?? 'group'}`);
      } else {
        toast.success(
          `${added.length} student${added.length === 1 ? '' : 's'} from ${selectedGroup.code ?? 'group'} enrolled`,
        );
        setCurrentEnrolled((prev) => [...prev, ...added]);
        router.refresh();
      }
      setSelectedGroup(null);
    }
    setEnrollingGroup(false);
  };

  const handleUnenrollGroup = async () => {
    const bucket = confirmBucket;
    if (bucket?.groupId == null) return;
    setRemovingGroupId(bucket.groupId);
    const { data, error } = await apiClient.DELETE('/api/courses/{id}/groups/{groupId}', {
      params: { path: { id: courseId, groupId: bucket.groupId } },
    });
    if (error) {
      toast.error('Failed to remove group');
    } else {
      const removedIds = new Set(data ?? []);
      if (removedIds.size === 0) {
        toast.info(`No active students to remove from ${bucket.label}`);
      } else {
        toast.success(
          `${removedIds.size} student${removedIds.size === 1 ? '' : 's'} of ${bucket.label} removed`,
        );
        setCurrentEnrolled((prev) =>
          prev.filter((s) => s.studentId == null || !removedIds.has(s.studentId)),
        );
        router.refresh();
      }
    }
    setRemovingGroupId(null);
    setConfirmBucket(null);
  };

  const handleUnenroll = async (studentId: number) => {
    setRemovingId(studentId);
    const { error } = await apiClient.DELETE('/api/courses/{id}/students/{studentId}', {
      params: { path: { id: courseId, studentId } },
    });
    if (error) {
      toast.error('Failed to remove student');
    } else {
      toast.success('Student removed');
      setCurrentEnrolled((prev) => prev.filter((s) => s.studentId !== studentId));
      router.refresh();
    }
    setRemovingId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Students</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Add student
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={availableStudents}
                loading={loadingStudents}
                value={selectedStudent}
                onChange={(_, v) => setSelectedStudent(v)}
                getOptionLabel={(o) =>
                  `${o.firstName ?? ''} ${o.lastName ?? ''} (${o.email ?? ''})`.trim()
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select student"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <LoadingButton
                variant="contained"
                size="small"
                loading={enrolling}
                disabled={selectedStudent == null}
                onClick={handleEnroll}
                startIcon={<PersonAddIcon />}
                sx={{ mt: 0.25, whiteSpace: 'nowrap' }}
              >
                Add
              </LoadingButton>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Add whole group
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                options={allGroups}
                loading={loadingGroups}
                value={selectedGroup}
                onChange={(_, v) => setSelectedGroup(v)}
                getOptionLabel={(o) => o.code ?? ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select group"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingGroups && <CircularProgress color="inherit" size={16} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <LoadingButton
                variant="contained"
                size="small"
                color="secondary"
                loading={enrollingGroup}
                disabled={selectedGroup == null}
                onClick={handleEnrollGroup}
                startIcon={<GroupAddIcon />}
                sx={{ mt: 0.25, whiteSpace: 'nowrap' }}
              >
                Add group
              </LoadingButton>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75 }}
            >
              Enrolls every active member; students already enrolled are skipped.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Enrolled ({currentEnrolled.length})
        </Typography>

        {currentEnrolled.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No students enrolled yet.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {buckets.map((bucket) => {
              const isCollapsed = collapsed.has(bucket.key);
              return (
                <Box
                  key={bucket.key}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Box
                    onClick={() => toggleBucket(bucket.key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      bgcolor: 'action.hover',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      borderBottomLeftRadius: isCollapsed ? 4 : 0,
                      borderBottomRightRadius: isCollapsed ? 4 : 0,
                      userSelect: 'none',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    {isCollapsed ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ExpandLessIcon fontSize="small" />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontStyle: bucket.isUngrouped ? 'italic' : 'normal',
                        color: bucket.isUngrouped ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {bucket.label}
                    </Typography>
                    <Chip label={bucket.students.length} size="small" sx={{ ml: 'auto' }} />
                    {!bucket.isUngrouped && bucket.groupId != null && (
                      <Tooltip title="Remove all from course">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={removingGroupId === bucket.groupId}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmBucket(bucket);
                            }}
                            sx={{ ml: 0.5 }}
                          >
                            {removingGroupId === bucket.groupId ? (
                              <CircularProgress size={14} />
                            ) : (
                              <GroupRemoveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                  <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {bucket.students.map((student, idx) => (
                        <ListItem
                          key={student.studentId}
                          disableGutters
                          secondaryAction={
                            <Tooltip title="Remove from course">
                              <span>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  color="error"
                                  disabled={removingId === student.studentId}
                                  onClick={() =>
                                    student.studentId != null && handleUnenroll(student.studentId)
                                  }
                                >
                                  {removingId === student.studentId ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <PersonRemoveIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          }
                          sx={{
                            py: 1,
                            pl: 1.5,
                            pr: 5,
                            borderTop: idx === 0 ? 'none' : '1px solid',
                            borderColor: 'divider',
                            '& > .MuiListItemSecondaryAction-root': { right: 8 },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                                width: 34,
                                height: 34,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(student.firstName, student.lastName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || '—'
                            }
                            secondary={student.email}
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                            secondaryTypographyProps={{ fontSize: '0.8125rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <Dialog
        open={confirmBucket != null}
        onClose={() => removingGroupId == null && setConfirmBucket(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove group from course?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Unenroll all {confirmBucket?.students.length} student
            {confirmBucket?.students.length === 1 ? '' : 's'} of{' '}
            <strong>{confirmBucket?.label}</strong> from this course? This can be undone by adding
            them (or the whole group) again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmBucket(null)} disabled={removingGroupId != null}>
            Cancel
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            loading={removingGroupId != null}
            onClick={handleUnenrollGroup}
          >
            Remove
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
