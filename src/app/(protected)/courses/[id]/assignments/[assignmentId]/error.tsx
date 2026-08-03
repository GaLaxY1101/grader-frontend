'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function AssignmentDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="error">{error.message || 'Failed to load assignment.'}</Alert>
      <Box>
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
      </Box>
    </Box>
  );
}
