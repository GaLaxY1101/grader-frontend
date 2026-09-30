'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export interface ReturnSubmissionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string | undefined) => Promise<void> | void;
}

export const ReturnSubmissionDialog = ({
  open,
  onClose,
  onConfirm,
}: ReturnSubmissionDialogProps) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setComment('');
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(comment.trim() || undefined);
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Return submission for redo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            The student can then edit their files and turn the submission in again. Any tentative
            grade is preserved.
          </Typography>
          <TextField
            label="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            inputProps={{ maxLength: 2000 }}
            helperText={`${comment.length} / 2000`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Returning…' : 'Return'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
