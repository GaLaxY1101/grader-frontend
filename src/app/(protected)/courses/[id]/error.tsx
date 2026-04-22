'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface CourseDetailErrorProps {
  error: Error;
  reset: () => void;
}

export default function CourseDetailError({ error, reset }: CourseDetailErrorProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h6" color="error">
        Failed to load course
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {error.message}
      </Typography>
      <Button onClick={reset} variant="outlined" sx={{ mt: 3 }}>
        Try again
      </Button>
    </Box>
  );
}
