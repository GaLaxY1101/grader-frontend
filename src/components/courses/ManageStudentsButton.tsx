'use client';

import { ManageStudentsDialog } from '@/components/courses/ManageStudentsDialog';
import type { components } from '@/lib/api/types/index';
import Button from '@mui/material/Button';
import { useState } from 'react';

type EnrolledStudentResponse = components['schemas']['EnrolledStudentResponse'];

interface ManageStudentsButtonProps {
  courseId: number;
  enrolledStudents: EnrolledStudentResponse[];
}

export const ManageStudentsButton = ({ courseId, enrolledStudents }: ManageStudentsButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        + Add Student
      </Button>
      <ManageStudentsDialog
        courseId={courseId}
        enrolledStudents={enrolledStudents}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
