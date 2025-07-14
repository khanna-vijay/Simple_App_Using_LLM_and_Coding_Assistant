import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import UserLogin from './UserLogin';

/**
 * Authentication Guard Component
 * Protects the application and shows login when needed
 */
const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading, currentUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLogin(true);
    } else if (isAuthenticated) {
      // Automatically close login dialog when user becomes authenticated
      setShowLogin(false);
    }
  }, [isLoading, isAuthenticated]);

  const handleLoginClose = () => {
    // Allow closing login dialog (it will reopen automatically if needed)
    setShowLogin(false);
  };

  // Show loading while initializing
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            English Leap
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Initializing your learning environment...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show login dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            },
          }}
        >
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              zIndex: 1,
              maxWidth: 400,
              mx: 2
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
              English Leap
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Master Your Vocabulary Journey
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please select or create your profile to continue
            </Typography>
          </Paper>
        </Box>
        
        <UserLogin 
          open={showLogin} 
          onClose={handleLoginClose}
        />
      </>
    );
  }

  // Show main application if authenticated
  return (
    <>
      {children}
      <UserLogin 
        open={showLogin} 
        onClose={handleLoginClose}
      />
    </>
  );
};

export default AuthGuard;
