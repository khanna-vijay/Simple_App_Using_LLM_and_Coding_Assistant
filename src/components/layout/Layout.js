import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import NavigationBar from './NavigationBar';

/**
 * Main Layout Component
 * Provides the overall structure for the application
 */
const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)' // Subtract AppBar height
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
