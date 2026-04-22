'use client';

import { apiClient } from '@/lib/api/client';
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

interface DeleteAssignmentButtonProps {
  assignmentId: number;
  assignmentTitle: string;
  courseId: number;
}

export const DeleteAssignmentButton = ({
  assignmentId,
  assignmentTitle,
  courseId,
}: DeleteAssignmentButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await apiClient.DELETE('/api/assignments/{id}', {
        params: { path: { id: assignmentId } },
      });

      if (error) {
        toast.error('Failed to delete assignment');
        return;
      }

      toast.success('Assignment deleted');
      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch {
      toast.error('Failed to delete assignment');
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
        Delete
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete assignment?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{assignmentTitle}</strong> will be deactivated and hidden from students. This
            cannot be undone from the UI.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={deleting}
            onClick={handleDelete}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
