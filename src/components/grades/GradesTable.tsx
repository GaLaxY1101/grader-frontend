'use client';

import type { components } from '@/lib/api/types/index';
import { env } from '@/utils/env';
import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

type CourseGradesResponse = components['schemas']['CourseGradesResponse'];

interface GradesTableProps {
  courseId: number;
  gradebook: CourseGradesResponse;
}

export const GradesTable = ({ courseId, gradebook }: GradesTableProps) => {
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState<null | 'csv' | 'xlsx'>(null);

  const assignments = gradebook.assignments ?? [];
  const students = gradebook.students ?? [];

  const download = async (format: 'csv' | 'xlsx') => {
    if (!session?.access_token) {
      toast.error('You must be signed in to export grades');
      return;
    }
    setDownloading(format);
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/grades/export?format=${format}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades-course-${courseId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export grades');
    } finally {
      setDownloading(null);
    }
  };

  if (assignments.length === 0) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="info">This course has no assignments yet — nothing to grade.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Grades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length} student{students.length !== 1 ? 's' : ''} · {assignments.length}{' '}
              assignment{assignments.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={downloading === 'csv' ? <CircularProgress size={14} /> : <DownloadIcon />}
              onClick={() => download('csv')}
              disabled={downloading !== null}
            >
              CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={downloading === 'xlsx' ? <CircularProgress size={14} /> : <DownloadIcon />}
              onClick={() => download('xlsx')}
              disabled={downloading !== null}
            >
              Excel
            </Button>
          </Stack>
        </Box>

        {students.length === 0 ? (
          <Alert severity="info">No students enrolled yet.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  {assignments.map((a) => (
                    <TableCell key={a.id} align="center" sx={{ fontWeight: 600 }}>
                      {a.title}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ display: 'block', color: 'text.secondary', fontWeight: 400 }}
                      >
                        /{a.maxScore}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((row) => {
                  const total = row.total ?? 0;
                  const maxTotal = row.maxTotal ?? 0;
                  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
                  const gradesById = new Map(
                    (row.grades ?? []).map((c) => [c.assignmentId, c] as const),
                  );
                  return (
                    <TableRow key={row.studentId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {[row.firstName, row.lastName].filter(Boolean).join(' ') ||
                            row.email ||
                            'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.email}
                        </Typography>
                      </TableCell>
                      {assignments.map((a) => {
                        const cell = gradesById.get(a.id);
                        if (cell?.grade != null) {
                          return (
                            <TableCell key={a.id} align="center">
                              {cell.grade}
                            </TableCell>
                          );
                        }
                        if (cell?.status != null) {
                          return (
                            <TableCell key={a.id} align="center">
                              <Chip
                                label={cell.status}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6875rem' }}
                              />
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={a.id} align="center" sx={{ color: 'text.disabled' }}>
                            —
                          </TableCell>
                        );
                      })}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {total} / {maxTotal}{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 400 }}
                        >
                          ({pct}%)
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
