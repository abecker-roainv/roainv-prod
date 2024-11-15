// /app/auth/signin/page.js
'use client';
import { signIn, useSession } from 'next-auth/react';
import { Box, Container, Typography, Button, Paper, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            marginTop: 8,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            ROA Investment
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
            Accede con tu cuenta corporativa
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            Iniciar sesión con Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}