import type { components } from '@/lib/api/types/index';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

type CourseResponse = components['schemas']['CourseResponse'];

interface CourseCardProps {
  course: CourseResponse;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const semesterLabel = course.semester === 1 ? 'Semester 1' : 'Semester 2';
  const yearLabel =
    course.academicYear != null ? `${course.academicYear}/${course.academicYear + 1}` : '—';

  return (
    <Box
      component={Link}
      href={`/courses/${course.id}`}
      sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          borderRadius: 2,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            height: '100%',
            p: 0,
            '&:last-child': { pb: 0 },
          }}
        >
          {/* Semester + active badges */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={semesterLabel} size="small" variant="outlined" />
            <Chip
              label={course.isActive ? 'Active' : 'Inactive'}
              size="small"
              color={course.isActive ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Course name */}
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}
          >
            {course.name ?? '—'}
          </Typography>

          {/* Description */}
          {course.description != null && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {course.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {/* Academic year + semester */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SchoolIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {yearLabel} · {semesterLabel}
              </Typography>
            </Box>

            {/* Date range */}
            {(course.startDate != null || course.endDate != null) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {course.startDate ?? '?'} → {course.endDate ?? '?'}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
