'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type UserResponse = components['schemas']['UserResponse'];

interface DeleteUserConfirmDialogProps {
  user: UserResponse | null;
  open: boolean;
  onClose: () => void;
}

export const DeleteUserConfirmDialog = ({ user, open, onClose }: DeleteUserConfirmDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (user?.id == null) return;

    setSubmitting(true);
    try {
      const { error } = await apiClient.DELETE('/api/v1/users/{id}', {
        params: { path: { id: user.id } },
      });

      if (error) {
        toast.error('Failed to deactivate user');
        return;
      }

      toast.success('User deactivated');
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Deactivate user?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>{fullName}</strong>
          {user?.email && fullName !== user.email ? ` (${user.email})` : ''} will be deactivated and
          will no longer be able to log in.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton
          color="error"
          variant="contained"
          loading={submitting}
          onClick={handleDelete}
        >
          Deactivate
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
