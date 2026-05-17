'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type StudentResponse = components['schemas']['StudentResponse'];
type EnrolledStudentResponse = components['schemas']['EnrolledStudentResponse'];

interface ManageStudentsDialogProps {
  courseId: number;
  enrolledStudents: EnrolledStudentResponse[];
  open: boolean;
  onClose: () => void;
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

export const ManageStudentsDialog = ({
  courseId,
  enrolledStudents,
  open,
  onClose,
}: ManageStudentsDialogProps) => {
  const router = useRouter();
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [currentEnrolled, setCurrentEnrolled] =
    useState<EnrolledStudentResponse[]>(enrolledStudents);

  useEffect(() => {
    setCurrentEnrolled(enrolledStudents);
  }, [enrolledStudents]);

  useEffect(() => {
    if (!open) return;
    setLoadingStudents(true);
    apiClient.GET('/api/v1/students').then(({ data, error }) => {
      if (error) {
        toast.error('Failed to load students');
      } else {
        setAllStudents(data ?? []);
      }
      setLoadingStudents(false);
    });
  }, [open]);

  const enrolledIds = new Set(currentEnrolled.map((s) => s.studentId));
  const availableStudents = allStudents.filter((s) => s.id != null && !enrolledIds.has(s.id));

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
        <Box sx={{ mb: 3 }}>
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

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Enrolled ({currentEnrolled.length})
        </Typography>

        {currentEnrolled.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No students enrolled yet.
          </Typography>
        ) : (
          <List disablePadding>
            {currentEnrolled.map((student, idx) => (
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
                  borderBottom: idx < currentEnrolled.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  pr: 5,
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
                  primary={`${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || '—'}
                  secondary={student.email}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.8125rem' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
