'use client';

import { CreateCourseDialog } from '@/components/courses/CreateCourseDialog';
import Button from '@mui/material/Button';
import { useState } from 'react';

export const CreateCourseButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create Course
      </Button>
      <CreateCourseDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
