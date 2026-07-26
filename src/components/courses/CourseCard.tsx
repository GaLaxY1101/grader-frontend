import type { components } from '@/lib/api/types/index';
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

// Deterministic accent color per course id
const accentPalette = [
  { from: '#2563EB', to: '#3B82F6' }, // blue
  { from: '#7C3AED', to: '#8B5CF6' }, // violet
  { from: '#0891B2', to: '#06B6D4' }, // cyan
  { from: '#059669', to: '#10B981' }, // emerald
  { from: '#D97706', to: '#F59E0B' }, // amber
  { from: '#DC2626', to: '#EF4444' }, // red
];

const DEFAULT_ACCENT = accentPalette[0] as { from: string; to: string };

function getAccent(id: number | undefined): { from: string; to: string } {
  const index = (id ?? 0) % accentPalette.length;
  return accentPalette[index] ?? DEFAULT_ACCENT;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const semesterLabel = course.semester === 1 ? 'Semester 1' : 'Semester 2';
  const yearLabel =
    course.academicYear != null ? `${course.academicYear}/${course.academicYear + 1}` : '—';
  const accent = getAccent(course.id);

  return (
    <Box
      component={Link}
      href={`/courses/${course.id}`}
      sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0px 12px 24px -4px rgba(15,23,42,0.12)',
            transform: 'translateY(-3px)',
          },
        }}
      >
        {/* Colored top accent bar */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${accent.from} 0%, ${accent.to} 100%)`,
            flexShrink: 0,
          }}
        />

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            height: '100%',
            p: 2.5,
            '&:last-child': { pb: 2.5 },
          }}
        >
          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              label={semesterLabel}
              size="small"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: '#F1F5F9',
                color: '#475569',
                borderRadius: '5px',
              }}
            />
            <Chip
              label={course.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '5px',
                backgroundColor: course.isActive ? '#DCFCE7' : '#F1F5F9',
                color: course.isActive ? '#15803D' : '#64748B',
              }}
            />
          </Box>

          {/* Course name */}
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              color: 'text.primary',
              fontSize: '1rem',
            }}
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
                lineHeight: 1.55,
              }}
            >
              {course.description}
            </Typography>
          )}

          {/* Meta footer */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <SchoolIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
                {yearLabel} · {semesterLabel}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
