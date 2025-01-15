// /app/(protected)/layout.js
'use client';
import { useSession } from 'next-auth/react';
import { Box, Container, Typography, Button, AppBar, Toolbar, Avatar, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { signOut } from 'next-auth/react';

export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar 
          position="static" 
          sx={{ 
            pl: '65px',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ROA Investment
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                alt={session.user.name || ''} 
                src={session.user.image || ''}
              />
              <Typography variant="body1">
                {session.user.email}
              </Typography>
              <Button 
                color="inherit"
                onClick={() => signOut()}
                startIcon={<LogoutIcon />}
              >
                Cerrar sesión
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}