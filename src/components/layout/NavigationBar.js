import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Style as FlashcardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  EmojiEvents as TrophyIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import VoiceSelector from '../ui/VoiceSelector';
import ProfileManager from '../profile/ProfileManager';
import AdminPanel from '../admin/AdminPanel';
import { useUser } from '../../context/UserContext';
import { useFontSize } from '../../context/FontSizeContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Navigation Bar Component
 * Provides main navigation for the English Leap application
 */
const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, logoutUser } = useUser();
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize, canIncrease, canDecrease, percentage } = useFontSize();
  const [showProfileManager, setShowProfileManager] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <DashboardIcon />
    },
    {
      label: 'Word Training',
      path: '/training',
      icon: <SchoolIcon />
    },
    {
      label: 'Flashcards',
      path: '/flashcards',
      icon: <FlashcardIcon />
    },
    {
      label: 'Quiz',
      path: '/quiz',
      icon: <QuizIcon />
    },
    {
      label: 'Leaderboard',
      path: '/leaderboard',
      icon: <TrophyIcon />
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* App Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 4,
            p: 1,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
            }
          }}
          onClick={() => handleNavigation('/')}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              overflow: 'hidden',
              borderRadius: 1,
              mr: 1.5,
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
                width: 36,
                height: 36,
                objectFit: 'cover',
                objectPosition: 'center',
                // Crop white space and enhance boldness without overlapping
                filter: 'contrast(1.3) saturate(1.2) brightness(1.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  filter: 'contrast(1.4) saturate(1.3) brightness(1.15)',
                }
              }}
            />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            English Leap
          </Typography>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={!isMobile ? item.icon : null}
              onClick={() => handleNavigation(item.path)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: isActivePath(item.path) ? '#1e293b' : '#64748b',
                backgroundColor: isActivePath(item.path)
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  color: '#1e293b',
                },
                borderRadius: 2,
                px: isMobile ? 1 : 3,
                py: 1,
                mx: 0.5,
              }}
            >
              {isMobile ? item.icon : item.label}
            </Button>
          ))}
        </Box>

        {/* Right side - User Info and Settings */}
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Font Size Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
            <Tooltip title="Decrease font size">
              <IconButton
                size="small"
                onClick={decreaseFontSize}
                disabled={!canDecrease}
                sx={{ p: 0.5 }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
              {percentage}%
            </Typography>
            <Tooltip title="Increase font size">
              <IconButton
                size="small"
                onClick={increaseFontSize}
                disabled={!canIncrease}
                sx={{ p: 0.5 }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset font size">
              <IconButton
                size="small"
                onClick={resetFontSize}
                sx={{ p: 0.5 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <VoiceSelector variant="compact" showSettings={false} />

          {/* Admin Panel */}
          <AdminPanel />

          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Profile Settings">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                    }
                  }}
                  onClick={() => setShowProfileManager(true)}
                >
                  <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                    {currentUser.avatar || '👤'}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {currentUser.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentUser.level || 'Beginner'}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton
                  onClick={logoutUser}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>

    {/* Profile Manager Dialog */}
    <ProfileManager
      open={showProfileManager}
      onClose={() => setShowProfileManager(false)}
    />
  </>
  );
};

export default NavigationBar;
