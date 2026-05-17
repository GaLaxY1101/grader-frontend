import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {icon != null && (
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            '& svg': { fontSize: 36, color: '#94A3B8' },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography variant="h6" fontWeight={600} color="text.primary">
        {title}
      </Typography>

      {description != null && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}

      {action != null && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
};
