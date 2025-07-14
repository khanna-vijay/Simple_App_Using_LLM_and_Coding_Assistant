import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

/**
 * Loading Spinner Component
 * Provides consistent loading states throughout the application
 */
const LoadingSpinner = ({
  message = "Loading...",
  variant = "circular",
  size = "medium",
  showIcon = true,
  fullHeight = false,
  progress = null
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  const containerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4,
    textAlign: 'center',
    ...(fullHeight && { minHeight: '60vh' })
  };

  if (variant === 'linear') {
    return (
      <Box sx={containerSx}>
        {showIcon && (
          <SchoolIcon 
            sx={{ 
              fontSize: getSize(), 
              color: 'primary.main', 
              mb: 2,
              animation: 'pulse 2s infinite'
            }} 
          />
        )}
        <Typography variant="h6" gutterBottom color="primary.main">
          {message}
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress
            variant={progress !== null ? "determinate" : "indeterminate"}
            value={progress || 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
          {progress !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <CardContent sx={containerSx}>
          {showIcon && (
            <SchoolIcon 
              sx={{ 
                fontSize: getSize(), 
                color: 'primary.main', 
                mb: 2,
                animation: 'pulse 2s infinite'
              }} 
            />
          )}
          <CircularProgress
            size={getSize()}
            variant={progress !== null ? "determinate" : "indeterminate"}
            value={progress || 0}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="primary.main">
            {message}
          </Typography>
          {progress !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}%
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={containerSx}>
      {showIcon && (
        <SchoolIcon 
          sx={{ 
            fontSize: getSize(), 
            color: 'primary.main', 
            mb: 2,
            animation: 'pulse 2s infinite'
          }} 
        />
      )}
      <CircularProgress
        size={getSize()}
        variant={progress !== null ? "determinate" : "indeterminate"}
        value={progress || 0}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" color="primary.main">
        {message}
      </Typography>
      {progress !== null && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
