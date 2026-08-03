import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { CourseTabs } from '@/components/courses/CourseTabs';
import { EditCourseButton } from '@/components/courses/EditCourseButton';
import { ManageStudentsButton } from '@/components/courses/ManageStudentsButton';
import { getCourseById, getCourseStudents } from '@/lib/api/courses';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { type ReactNode } from 'react';

interface CourseTabsLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function CourseTabsLayout({ children, params }: CourseTabsLayoutProps) {
  const courseId = Number(params.id);
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const canManage = roles.includes(Role.TEACHER) || roles.includes(Role.ADMIN);

  let course: Awaited<ReturnType<typeof getCourseById>>;
  let students: Awaited<ReturnType<typeof getCourseStudents>>;

  try {
    [course, students] = await Promise.all([getCourseById(courseId), getCourseStudents(courseId)]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  const studentList = students ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent
          sx={{
            py: 1.5,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:last-child': { pb: 1.5 },
          }}
        >
          <Button
            component={Link}
            href="/courses"
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="inherit"
            size="small"
          >
            Back to courses
          </Button>
          {canManage && (
            <Stack direction="row" spacing={1}>
              <ManageStudentsButton courseId={courseId} enrolledStudents={studentList} />
              {course != null && <EditCourseButton course={course} />}
            </Stack>
          )}
        </CardContent>
        <Divider />

        {course != null && <CourseInfoCard course={course} />}
      </Card>

      <CourseTabs courseId={courseId} />

      {children}
    </Box>
  );
}
