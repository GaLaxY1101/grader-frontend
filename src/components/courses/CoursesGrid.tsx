import type { components } from '@/lib/api/types/index';
import Grid from '@mui/material/Grid';
import { CourseCard } from './CourseCard';

type CourseResponse = components['schemas']['CourseResponse'];

interface CoursesGridProps {
  courses: CourseResponse[];
}

export const CoursesGrid = ({ courses }: CoursesGridProps) => {
  return (
    <Grid container spacing={3}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <CourseCard course={course} />
        </Grid>
      ))}
    </Grid>
  );
};
