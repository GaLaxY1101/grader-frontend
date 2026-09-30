'use client';

import { ReturnSubmissionDialog } from '@/components/submissions/ReturnSubmissionDialog';
import { SubmissionGradeInput } from '@/components/submissions/SubmissionGradeInput';
import {
  SubmissionStatusBadge,
  type SubmissionStatus,
} from '@/components/submissions/SubmissionStatusBadge';
import { returnSubmission } from '@/lib/api/submissionAttachments';
import { SubmissionFileState } from '@/utils/assignmentType';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface Submission {
  id: number;
  studentEmail: string;
  status: SubmissionStatus;
  score: number | null;
  bestScore: number | null;
  grade: number | null;
  attemptCount: number;
  updatedAt: string;
  fileState?: SubmissionFileState | null;
  attachmentCount?: number;
}

interface SubmissionListProps {
  submissions: Submission[];
  maxScore: number | null;
  canGrade: boolean;
}

const fileStateColor = (
  state: SubmissionFileState | null | undefined,
): 'default' | 'info' | 'warning' | 'success' => {
  switch (state) {
    case SubmissionFileState.SUBMITTED:
      return 'info';
    case SubmissionFileState.RETURNED:
      return 'warning';
    case SubmissionFileState.GRADED:
      return 'success';
    default:
      return 'default';
  }
};

export const SubmissionList = ({ submissions, maxScore, canGrade }: SubmissionListProps) => {
  const [returnTarget, setReturnTarget] = useState<number | null>(null);

  const handleReturn = async (comment: string | undefined) => {
    if (returnTarget == null) return;
    try {
      await returnSubmission(returnTarget, comment);
      toast.success('Submission returned');
    } catch {
      toast.error('Return failed');
    }
  };

  if (submissions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No submissions yet.
      </Typography>
    );
  }

  return (
    <Box>
      {submissions.map((sub, index) => (
        <Box key={sub.id}>
          <Box
            sx={{
              py: 1.5,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Box
              component={Link}
              href={`/submissions/${sub.id}`}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flex: 1,
                minWidth: 0,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 13 }}>
                {sub.studentEmail[0]?.toUpperCase() ?? '?'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {sub.studentEmail}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {sub.attemptCount} attempt{sub.attemptCount === 1 ? '' : 's'} ·{' '}
                  {new Date(sub.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              {sub.fileState != null && (
                <Chip
                  label={sub.fileState}
                  size="small"
                  color={fileStateColor(sub.fileState)}
                  variant="filled"
                />
              )}
              {(sub.attachmentCount ?? 0) > 0 && (
                <Chip
                  label={`${sub.attachmentCount} file${sub.attachmentCount === 1 ? '' : 's'}`}
                  size="small"
                  variant="outlined"
                />
              )}
              <SubmissionStatusBadge status={sub.status} />
              {sub.bestScore != null && (
                <Chip label={`Best: ${sub.bestScore}`} size="small" variant="outlined" />
              )}
              {canGrade && sub.fileState === SubmissionFileState.SUBMITTED && (
                <Button size="small" variant="outlined" onClick={() => setReturnTarget(sub.id)}>
                  Return
                </Button>
              )}
              {canGrade && (
                <SubmissionGradeInput
                  submissionId={sub.id}
                  initialGrade={sub.grade}
                  maxScore={maxScore}
                />
              )}
            </Box>
          </Box>
          {index < submissions.length - 1 && <Divider />}
        </Box>
      ))}
      <ReturnSubmissionDialog
        open={returnTarget != null}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
      />
    </Box>
  );
};
