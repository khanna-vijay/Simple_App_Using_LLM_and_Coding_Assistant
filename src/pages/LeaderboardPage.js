import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Tab,
  Tabs,
  Paper,
  Stack,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as StreakIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useFontSize } from '../context/FontSizeContext';
import leaderboardService from '../services/LeaderboardService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Leaderboard Page Component
 * Shows rankings and achievements across different categories
 */
const LeaderboardPage = () => {
  const { currentUser } = useUser();
  const { fontSize } = useFontSize();
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { 
      label: 'Overall', 
      key: 'overall', 
      icon: TrophyIcon, 
      color: '#ffd700',
      description: 'Experience Points'
    },
    { 
      label: 'Words Mastered', 
      key: 'wordsMastered', 
      icon: SchoolIcon, 
      color: '#10b981',
      description: 'Total Words Learned'
    },
    { 
      label: 'Days Active', 
      key: 'daysActive', 
      icon: CalendarIcon, 
      color: '#3b82f6',
      description: 'Learning Days'
    },
    { 
      label: 'Quizzes Taken', 
      key: 'quizzesTaken', 
      icon: QuizIcon, 
      color: '#8b5cf6',
      description: 'Total Quizzes'
    },
    { 
      label: 'Average Score', 
      key: 'averageScore', 
      icon: TrendingUpIcon, 
      color: '#f59e0b',
      description: 'Quiz Performance'
    },
    { 
      label: 'Current Streak', 
      key: 'currentStreak', 
      icon: StreakIcon, 
      color: '#ef4444',
      description: 'Consecutive Days'
    }
  ];

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      const data = await leaderboardService.getAllLeaderboards(10);
      setLeaderboards(data);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadLeaderboards();
    } catch (error) {
      console.error('Error refreshing leaderboards:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentLeaderboard = () => {
    const currentTab = tabs[selectedTab];
    return leaderboards[currentTab.key] || [];
  };

  const getValueForCategory = (user, category) => {
    switch (category) {
      case 'overall':
        return `${user.experiencePoints} XP`;
      case 'wordsMastered':
        return `${user.wordsMastered} words`;
      case 'daysActive':
        return `${user.daysActive} days`;
      case 'quizzesTaken':
        return `${user.totalQuizzes} quizzes`;
      case 'averageScore':
        return `${user.averageScore}%`;
      case 'currentStreak':
        return `${user.currentStreak} days`;
      default:
        return '';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#ffd700';
      case 2:
        return '#c0c0c0';
      case 3:
        return '#cd7f32';
      default:
        return '#64748b';
    }
  };

  const isCurrentUser = (userId) => {
    return currentUser && currentUser.id === userId;
  };

  if (loading) {
    return <LoadingSpinner message="Loading leaderboards..." />;
  }

  const currentLeaderboard = getCurrentLeaderboard();
  const currentTab = tabs[selectedTab];

  return (
    <Box sx={{ pb: 4, fontSize: `${fontSize}rem` }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={3}>
              {/* Prominent Logo */}
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 3,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  border: '4px solid rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    boxShadow: '0 10px 24px rgba(0,0,0,0.5)',
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Box
                  component="img"
                  src="/favicon.jpg?v=1"
                  alt="English Leap"
                  onError={(e) => {
                    console.log('Leaderboard logo failed to load');
                    e.target.src = '/favicon.ico';
                  }}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    objectPosition: 'center',
                    // Crop white space and enhance boldness
                    filter: 'contrast(1.3) saturate(1.2) brightness(1.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      filter: 'contrast(1.4) saturate(1.3) brightness(1.15)',
                    }
                  }}
                />
              </Box>
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                  🏆 Leaderboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  See how you rank against other learners
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Refresh Rankings">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontWeight: 600,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.key}
              label={
                <Stack alignItems="center" spacing={1}>
                  <tab.icon sx={{ color: tab.color }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {tab.label}
                  </Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Current Tab Info */}
      <Card sx={{ mb: 3, bgcolor: '#f8fafc' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: currentTab.color, width: 48, height: 48 }}>
              <currentTab.icon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentTab.label} Rankings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTab.description} • Top performers this month
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {currentLeaderboard.length > 0 ? (
          <Stack spacing={2}>
            {currentLeaderboard.map((user, index) => (
              <Card
                key={user.userId}
                sx={{
                  transition: 'all 0.3s ease',
                  border: isCurrentUser(user.userId) ? 2 : 1,
                  borderColor: isCurrentUser(user.userId) ? 'primary.main' : 'divider',
                  bgcolor: isCurrentUser(user.userId) ? 'primary.50' : 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    {/* Rank */}
                    <Box
                      sx={{
                        minWidth: 50,
                        textAlign: 'center',
                        color: getRankColor(user.rank),
                        fontWeight: 800,
                        fontSize: user.rank <= 3 ? '1.8rem' : '1.4rem',
                      }}
                    >
                      {getRankIcon(user.rank)}
                    </Box>

                    {/* User Info */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                      <Avatar sx={{ width: 45, height: 45, fontSize: '1.3rem' }}>
                        {user.avatar || '👤'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            {user.username}
                          </Typography>
                          {isCurrentUser(user.userId) && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {user.level} • Joined {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Primary Stat */}
                    <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: currentTab.color }}>
                        {getValueForCategory(user, currentTab.key)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentTab.description}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Additional Stats for All Users */}
                  <Divider sx={{ my: 1.5 }} />
                  <Stack
                    direction="row"
                    spacing={4}
                    sx={{
                      justifyContent: 'space-around',
                      px: 2
                    }}
                  >
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography
                        variant={user.rank <= 3 ? "h6" : "body1"}
                        sx={{ fontWeight: 700, color: 'success.main', fontSize: user.rank <= 3 ? '1.1rem' : '1rem' }}
                      >
                        {user.wordsMastered}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Words
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography
                        variant={user.rank <= 3 ? "h6" : "body1"}
                        sx={{ fontWeight: 700, color: 'info.main', fontSize: user.rank <= 3 ? '1.1rem' : '1rem' }}
                      >
                        {user.totalQuizzes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Quizzes
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography
                        variant={user.rank <= 3 ? "h6" : "body1"}
                        sx={{ fontWeight: 700, color: 'warning.main', fontSize: user.rank <= 3 ? '1.1rem' : '1rem' }}
                      >
                        {user.averageScore}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Avg Score
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography
                        variant={user.rank <= 3 ? "h6" : "body1"}
                        sx={{ fontWeight: 700, color: 'error.main', fontSize: user.rank <= 3 ? '1.1rem' : '1rem' }}
                      >
                        {user.currentStreak}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Streak
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No rankings available yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start learning to appear on the leaderboard!
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default LeaderboardPage;
