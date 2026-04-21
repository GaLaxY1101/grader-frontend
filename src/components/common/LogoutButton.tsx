'use client';

import { Button } from '@mui/material';

export const LogoutButton = () => {
  return (
    <Button
      variant="outlined"
      color="inherit"
      onClick={() => {
        window.location.href = '/api/auth/logout';
      }}
    >
      Logout
    </Button>
  );
};
