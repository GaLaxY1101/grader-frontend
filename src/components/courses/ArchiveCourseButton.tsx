'use client';

import { apiClient } from '@/lib/api/client';
import ArchiveIcon from '@mui/icons-material/Archive';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ArchiveCourseButtonProps {
  courseId: number;
  courseName: string;
}

export const ArchiveCourseButton = ({ courseId, courseName }: ArchiveCourseButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const { error } = await apiClient.DELETE('/api/courses/{id}', {
        params: { path: { id: courseId } },
      });
      if (error) {
        toast.error('Failed to archive course');
        return;
      }
      toast.success('Course archived');
      setOpen(false);
      router.push('/courses');
      router.refresh();
    } catch {
      toast.error('Failed to archive course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<ArchiveIcon />}
        onClick={() => setOpen(true)}
      >
        Archive
      </Button>
      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Archive course?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &ldquo;{courseName}&rdquo; will move to the Archive tab. Students will no longer see it
            among active courses. You can restore it any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            loading={submitting}
          >
            Archive
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
