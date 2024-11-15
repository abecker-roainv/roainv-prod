// /app/auth/error/page.js
'use client';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { signIn } from 'next-auth/react';

const ALLOWED_DOMAINS = [
  'roainvestment.com',
  'renta-capital.cl',
  'kapture.cl'
];

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <Container component="main" maxWidth="sm">
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
          <Typography component="h1" variant="h5" color="error" gutterBottom>
            Error de Autenticación
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2, mb: 1 }}>
            {error === 'AccessDenied' && (
              <>
                No tienes acceso a esta aplicación. 
                Por favor, asegúrate de usar un correo corporativo autorizado.
              </>
            )}
            {error !== 'AccessDenied' && (
              <>
                Ha ocurrido un error durante la autenticación.
                Código de error: {error}
              </>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            Dominios autorizados:
            <Box component="ul" sx={{ mt: 1, mb: 2 }}>
              {ALLOWED_DOMAINS.map((domain) => (
                <li key={domain}>@{domain}</li>
              ))}
            </Box>
          </Typography>
          <Button
            variant="contained"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            sx={{ mt: 2 }}
          >
            Intentar nuevamente
          </Button>
          <Typography variant="caption" sx={{ mt: 2 }}>
            Si el problema persiste, contacta al administrador del sistema
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}