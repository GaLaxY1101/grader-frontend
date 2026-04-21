'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h3" color="primary" fontWeight={700}>
          University Grader
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in with your university account
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => signIn('keycloak', { callbackUrl: '/dashboard' })}
          sx={{ px: 6, py: 1.5 }}
        >
          Sign in with Keycloak
        </Button>
      </Box>
    </Container>
  );
}
