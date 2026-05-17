import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 3,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}
        >
          {title}
        </Typography>
        {subtitle != null && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action != null && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};
