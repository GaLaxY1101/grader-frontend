'use client';

import { EditCourseDialog } from '@/components/courses/EditCourseDialog';
import type { components } from '@/lib/api/types/index';
import Button from '@mui/material/Button';
import { useState } from 'react';

type CourseDetailResponse = components['schemas']['CourseDetailResponse'];

interface EditCourseButtonProps {
  course: CourseDetailResponse;
}

export const EditCourseButton = ({ course }: EditCourseButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit Course
      </Button>
      <EditCourseDialog course={course} open={open} onClose={() => setOpen(false)} />
    </>
  );
};
