import type { components } from '@/lib/api/types/index';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
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
      sx={{
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 700,
        color: 'text.secondary',
        fontSize: '0.6875rem',
      }}
    >
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5, color: 'text.primary' }}>
      {value}
    </Typography>
  </Box>
);

export const CourseInfoCard = ({ course }: CourseInfoCardProps) => {
  const yearLabel =
    course.academicYear != null ? `${course.academicYear}/${course.academicYear + 1}` : '—';
  const semesterLabel =
    course.semester === 1 ? 'Semester 1' : course.semester === 2 ? 'Semester 2' : '—';
  return (
    <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
      {/* Course name + status */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          {course.name ?? '—'}
        </Typography>
        <Chip
          label={course.isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            mt: 0.5,
            flexShrink: 0,
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: '6px',
            backgroundColor: course.isActive ? '#DCFCE7' : '#F1F5F9',
            color: course.isActive ? '#15803D' : '#64748B',
          }}
        />
      </Box>

      {/* Description */}
      {course.description != null && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6, fontSize: '0.9375rem' }}
        >
          {course.description}
        </Typography>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Info grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoItem label="Academic Year" value={yearLabel} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoItem label="Semester" value={semesterLabel} />
        </Grid>
      </Grid>

      {/* Teachers */}
      {course.teachers != null && course.teachers.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.6875rem',
              }}
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
                      avatar={
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                            color: '#fff !important',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                      }
                      label={name}
                      size="small"
                      sx={{
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: '#F8FAFC',
                        fontWeight: 500,
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        </>
      )}
    </CardContent>
  );
};
