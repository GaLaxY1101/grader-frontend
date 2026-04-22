import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description != null && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
      {action != null && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
};
