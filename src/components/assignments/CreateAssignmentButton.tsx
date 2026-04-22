'use client';

import { CreateAssignmentDialog } from '@/components/assignments/CreateAssignmentDialog';
import Button from '@mui/material/Button';
import { useState } from 'react';

interface CreateAssignmentButtonProps {
  courseId: number;
}

export const CreateAssignmentButton = ({ courseId }: CreateAssignmentButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        + Add
      </Button>
      <CreateAssignmentDialog courseId={courseId} open={open} onClose={() => setOpen(false)} />
    </>
  );
};
