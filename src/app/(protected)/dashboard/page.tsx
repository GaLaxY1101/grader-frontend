import { getCourses } from '@/lib/api/courses';
import { auth } from '@/lib/server/auth';
import { Role } from '@/utils/roles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  return (
    <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': { color, fontSize: 24 },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(auth);
  const roles = session?.roles ?? [];
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  const isTeacher = roles.includes(Role.TEACHER);
  const isAdmin = roles.includes(Role.ADMIN);

  let courseCount = 0;
  try {
    const courses = await getCourses();
    courseCount = courses?.length ?? 0;
  } catch {
    // non-critical, show 0
  }

  const primaryRole = isAdmin ? 'Admin' : isTeacher ? 'Teacher' : 'Student';

  return (
    <Box sx={{ p: 4 }}>
      {/* Welcome banner */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            right: 60,
            width: 160,
            height: 160,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label={primaryRole}
            size="small"
            sx={{
              mb: 1.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: '6px',
            }}
          />
          <Typography variant="h3" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
            Welcome back, {firstName}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>
            {isAdmin
              ? 'You have full administrative access to the platform.'
              : isTeacher
                ? 'Manage your courses, assignments, and student submissions.'
                : 'Track your enrolled courses and submit your assignments.'}
          </Typography>
        </Box>
      </Box>

      {/* Stats grid */}
      <Typography
        variant="overline"
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'text.secondary',
          mb: 2,
          display: 'block',
        }}
      >
        Overview
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={isTeacher || isAdmin ? 'Total Courses' : 'Enrolled Courses'}
            value={courseCount}
            icon={<SchoolIcon />}
            color="#2563EB"
            bg="#EFF6FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Assignments"
            value="—"
            icon={<AssignmentIcon />}
            color="#7C3AED"
            bg="#F5F3FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Submissions"
            value="—"
            icon={<TrendingUpIcon />}
            color="#059669"
            bg="#F0FDF4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Passed" value="—" icon={<VerifiedIcon />} color="#D97706" bg="#FFFBEB" />
        </Grid>
      </Grid>
    </Box>
  );
}
