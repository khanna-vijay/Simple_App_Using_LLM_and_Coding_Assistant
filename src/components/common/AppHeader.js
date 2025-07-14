import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

/**
 * Reusable App Header Component with Logo and App Name
 * Used across all pages for consistent branding
 */
const AppHeader = ({
  showOnMobile = true,
  sx = {},
  logoSize = 28,
  textVariant = 'body2'
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 1000,
        display: { xs: showOnMobile ? 'flex' : 'none', md: 'flex' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: 1.5,
        padding: 0.75,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        ...sx
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Logo */}
        <Box
          sx={{
            width: logoSize,
            height: logoSize,
            borderRadius: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            backgroundColor: 'white',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src="/favicon.jpg?v=1"
            alt="English Leap Logo"
            onError={(e) => {
              console.log('Logo failed to load, trying fallback');
              e.target.src = '/favicon.ico';
            }}
            sx={{
              width: logoSize + 4,
              height: logoSize + 4,
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'contrast(1.3) saturate(1.2) brightness(1.1)',
            }}
          />
        </Box>

        {/* App Name - More subtle */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography
            variant={textVariant}
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1,
              fontSize: '0.875rem'
            }}
          >
            English Leap
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.65rem',
              fontWeight: 400,
              lineHeight: 1
            }}
          >
            Vocabulary Mastery
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default AppHeader;
