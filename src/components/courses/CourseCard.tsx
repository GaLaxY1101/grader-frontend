import type { components } from '@/lib/api/types/index';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';

type CourseResponse = components['schemas']['CourseResponse'];

interface CourseCardProps {
  course: CourseResponse;
  onClick: (id: number) => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const handleClick = () => {
    if (course.id != null) onClick(course.id);
  };

  const semesterLabel = course.semester === 1 ? '1st semester' : '2nd semester';

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, alignItems: 'flex-start' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
          {/* Status chip */}
          <Box>
            <Chip
              label={course.isActive ? 'Active' : 'Inactive'}
              size="small"
              color={course.isActive ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {/* Course name */}
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {course.name ?? '—'}
          </Typography>

          {/* Description */}
          {course.description && (
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
                {course.academicYear ?? '—'} / {semesterLabel}
              </Typography>
            </Box>

            {/* Date range */}
            {(course.startDate ?? course.endDate) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {course.startDate ?? '?'} – {course.endDate ?? '?'}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
