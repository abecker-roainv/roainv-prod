// /app/(protected)/page.js
'use client';
import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido {session?.user?.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Sistema de gestión ROA Investment
      </Typography>
    </Box>
  );
}