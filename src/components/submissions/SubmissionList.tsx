'use client';

import {
  SubmissionStatusBadge,
  type SubmissionStatus,
} from '@/components/submissions/SubmissionStatusBadge';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface Submission {
  id: number;
  studentEmail: string;
  status: SubmissionStatus;
  score: number | null;
  bestScore: number | null;
  attemptCount: number;
  updatedAt: string;
}

interface SubmissionListProps {
  submissions: Submission[];
}

export const SubmissionList = ({ submissions }: SubmissionListProps) => {
  if (submissions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No submissions yet.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {submissions.map((sub, index) => (
        <Box key={sub.id}>
          <ListItem
            disableGutters
            sx={{ py: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}
            component={Link}
            href={`/submissions/${sub.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 13 }}>
                {sub.studentEmail[0]?.toUpperCase() ?? '?'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={sub.studentEmail}
              secondary={`${sub.attemptCount} attempt${sub.attemptCount === 1 ? '' : 's'} · ${new Date(sub.updatedAt).toLocaleString()}`}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              <SubmissionStatusBadge status={sub.status} />
              {sub.bestScore != null && (
                <Chip label={`Best: ${sub.bestScore} pts`} size="small" variant="outlined" />
              )}
            </Box>
          </ListItem>
          {index < submissions.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
};
