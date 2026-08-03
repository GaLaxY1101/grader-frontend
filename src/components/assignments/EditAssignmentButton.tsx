'use client';

import { EditAssignmentDialog } from '@/components/assignments/EditAssignmentDialog';
import type { components } from '@/lib/api/types/index';
import Button from '@mui/material/Button';
import { useState } from 'react';

type AssignmentResponse = components['schemas']['AssignmentResponse'];

interface EditAssignmentButtonProps {
  assignment: AssignmentResponse;
}

export const EditAssignmentButton = ({ assignment }: EditAssignmentButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Edit Assignment
      </Button>
      <EditAssignmentDialog assignment={assignment} open={open} onClose={() => setOpen(false)} />
    </>
  );
};
