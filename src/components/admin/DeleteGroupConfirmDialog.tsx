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

type GroupResponse = components['schemas']['GroupResponse'];

interface DeleteGroupConfirmDialogProps {
  group: GroupResponse | null;
  open: boolean;
  onClose: () => void;
}

export const DeleteGroupConfirmDialog = ({
  group,
  open,
  onClose,
}: DeleteGroupConfirmDialogProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (group?.id == null) return;

    setSubmitting(true);
    try {
      const { error } = await apiClient.DELETE('/api/groups/{id}', {
        params: { path: { id: group.id } },
      });

      if (error) {
        toast.error('Failed to delete group');
        return;
      }

      toast.success('Group deleted');
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete group?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Group <strong>{group?.name ?? ''}</strong>
          {group?.code ? ` (${group.code})` : ''} will be deleted. This action cannot be undone.
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
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
