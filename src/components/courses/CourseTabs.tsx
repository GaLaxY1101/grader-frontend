'use client';

import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/utils/roles';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface CourseTabsProps {
  courseId: number;
}

export const CourseTabs = ({ courseId }: CourseTabsProps) => {
  const pathname = usePathname();
  const { hasRole } = useAuth();
  const canGrade = hasRole(Role.TEACHER) || hasRole(Role.ADMIN);

  const assignmentsHref = `/courses/${courseId}`;
  const gradesHref = `/courses/${courseId}/grades`;

  const active = pathname === gradesHref ? gradesHref : assignmentsHref;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
      <Tabs value={active} aria-label="Course sections">
        <Tab
          label="Assignments"
          value={assignmentsHref}
          component={NextLink}
          href={assignmentsHref}
        />
        {canGrade && (
          <Tab label="Grades" value={gradesHref} component={NextLink} href={gradesHref} />
        )}
      </Tabs>
    </Box>
  );
};
