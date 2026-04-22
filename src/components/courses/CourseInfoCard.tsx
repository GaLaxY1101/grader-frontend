import type { components } from '@/lib/api/types/index';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type CourseDetailResponse = components['schemas']['CourseDetailResponse'];

interface CourseInfoCardProps {
  course: CourseDetailResponse;
}

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.25 }}>
      {value}
    </Typography>
  </Box>
);

export const CourseInfoCard = ({ course }: CourseInfoCardProps) => {
  const yearLabel =
    course.academicYear != null ? `${course.academicYear}/${course.academicYear + 1}` : '—';
  const semesterLabel =
    course.semester === 1 ? 'Semester 1' : course.semester === 2 ? 'Semester 2' : '—';
  const dateRange =
    course.startDate != null || course.endDate != null
      ? `${course.startDate ?? '?'} → ${course.endDate ?? '?'}`
      : '—';

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Course name + status */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {course.name ?? '—'}
          </Typography>
          <Chip
            label={course.isActive ? 'Active' : 'Inactive'}
            color={course.isActive ? 'success' : 'default'}
            size="small"
            sx={{ mt: 0.5, flexShrink: 0 }}
          />
        </Box>

        {/* Description */}
        {course.description != null && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
            {course.description}
          </Typography>
        )}

        <Divider sx={{ mb: 2.5 }} />

        {/* Info grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem label="Academic Year" value={yearLabel} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem label="Semester" value={semesterLabel} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem label="Dates" value={dateRange} />
          </Grid>
        </Grid>

        {/* Teachers */}
        {course.teachers != null && course.teachers.length > 0 && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}
              >
                Teachers
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {course.teachers.map((teacher) => {
                  const name =
                    `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() ||
                    (teacher.email ?? '?');
                  const initials =
                    `${teacher.firstName?.[0] ?? ''}${teacher.lastName?.[0] ?? ''}`.toUpperCase() ||
                    '?';
                  return (
                    <Tooltip key={teacher.teacherId} title={teacher.email ?? ''} placement="top">
                      <Chip
                        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{initials}</Avatar>}
                        label={name}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
