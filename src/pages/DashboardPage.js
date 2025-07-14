import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Paper,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as StreakIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
  PlayArrow as PlayIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkIcon,
  Leaderboard as LeaderboardIcon
} from '@mui/icons-material';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';
import { useUser } from '../context/UserContext';
import { useFontSize } from '../context/FontSizeContext';
import { useNavigate } from 'react-router-dom';
import leaderboardService from '../services/LeaderboardService';
import GoalSettingDialog from '../components/dashboard/GoalSettingDialog';


/**
 * Dashboard Page Component
 * Displays user progress statistics and overview
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { words, loading, totalWords } = useDictionary();
  const { getStatistics, struggledWords, knownWords } = useUserProgressContext();
  const { getUserStatistics, updateUserGoal, currentUser } = useUser();
  const { fontSize } = useFontSize();
  const [topLearners, setTopLearners] = React.useState([]);
  const [userStats, setUserStats] = React.useState(null);
  const [goalDialogOpen, setGoalDialogOpen] = React.useState(false);

  // Calculate today's goal progress
  const dailyGoal = 5; // Default daily goal of 5 words
  const todayKey = new Date().toDateString();
  const [todayProgress, setTodayProgress] = React.useState({ wordsLearned: 0, date: todayKey, words: [] });

  // Load user statistics and top learners
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load user statistics
        const stats = await getUserStatistics();
        setUserStats(stats);

        // Load top learners for leaderboard widget
        const overallLeaderboard = await leaderboardService.getOverallLeaderboard(5);
        setTopLearners(overallLeaderboard);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    if (!loading && currentUser) {
      loadData();
    }
  }, [loading, currentUser, getUserStatistics, knownWords.length, struggledWords.length]); // Added dependencies to refresh when progress changes

  // Load and update today's progress
  React.useEffect(() => {
    const loadTodayProgress = () => {
      const todayData = localStorage.getItem(`englishLeap_dailyProgress_${todayKey}`);
      if (todayData) {
        try {
          const progressData = JSON.parse(todayData);
          setTodayProgress(progressData);
        } catch (e) {
          console.error('Error parsing daily progress:', e);
          setTodayProgress({ wordsLearned: 0, date: todayKey, words: [] });
        }
      } else {
        setTodayProgress({ wordsLearned: 0, date: todayKey, words: [] });
      }
    };

    loadTodayProgress();

    // Set up an interval to check for updates every second
    const interval = setInterval(loadTodayProgress, 1000);

    return () => clearInterval(interval);
  }, [todayKey, knownWords.length]); // Re-run when known words change

  const handleGoalSave = async (newGoal) => {
    try {
      await updateUserGoal(newGoal);
      // Reload user statistics to reflect the new goal
      const updatedStats = await getUserStatistics();
      setUserStats(updatedStats);
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const stats = userStats || getStatistics();
  const progressPercentage = totalWords > 0 ? (stats.totalWordsLearned / totalWords) * 100 : 0;

  // Calculate learning streak (simplified - days with activity)
  const calculateLearningStreak = () => {
    const totalQuizzes = stats.totalQuizzes || 0;
    const totalKnownWords = stats.totalKnownWords || stats.totalWordsLearned || 0;

    // Ensure we have valid numbers
    if (isNaN(totalQuizzes) || isNaN(totalKnownWords)) {
      return 0;
    }

    // Simple streak calculation: 2 days per quiz + 1 day per 10 words mastered, max 30 days
    const streakFromQuizzes = totalQuizzes * 2;
    const streakFromWords = Math.floor(totalKnownWords / 10);
    const calculatedStreak = streakFromQuizzes + streakFromWords;

    return Math.min(Math.max(calculatedStreak, 0), 30);
  };

  const learningStreak = calculateLearningStreak();

  // Get performance level
  const getPerformanceLevel = () => {
    if (stats.averageScore >= 90) return { level: 'Expert', color: '#10b981', icon: TrophyIcon };
    if (stats.averageScore >= 80) return { level: 'Advanced', color: '#3b82f6', icon: StarIcon };
    if (stats.averageScore >= 70) return { level: 'Intermediate', color: '#f59e0b', icon: TrendingUpIcon };
    if (stats.averageScore >= 60) return { level: 'Beginner', color: '#ec4899', icon: SchoolIcon };
    return { level: 'Getting Started', color: '#6b7280', icon: BookmarkIcon };
  };

  const performance = getPerformanceLevel();

  const modernStatCards = [
    {
      title: 'Words Mastered',
      value: stats.totalWordsLearned || stats.totalKnownWords || 0,
      subtitle: `${stats.goal || 50} Goal, ${totalWords} Total Words in Dictionary`,
      icon: SchoolIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: `${Math.round(((stats.totalWordsLearned || stats.totalKnownWords || 0) / (stats.goal || 50)) * 100)}% of goal`,
      action: () => navigate('/training'),
      secondaryAction: () => setGoalDialogOpen(true),
      secondaryActionLabel: 'Edit Goal'
    },
    {
      title: 'Need Practice',
      value: stats.totalStruggledWords || 0,
      subtitle: 'words to review',
      icon: WarningIcon,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      trend: '-5%',
      action: () => navigate('/flashcards')
    },
    {
      title: 'Quizzes Taken',
      value: stats.totalQuizzes || 0,
      subtitle: 'total attempts',
      icon: QuizIcon,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      trend: '+8%',
      action: () => navigate('/quiz')
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore || 0}%`,
      subtitle: 'quiz performance',
      icon: TrendingUpIcon,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      trend: '+15%',
      action: () => navigate('/quiz')
    },
    {
      title: "Today's Goal",
      value: `${todayProgress.wordsLearned}/${dailyGoal}`,
      subtitle: 'new words to learn today',
      icon: TrophyIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      trend: `${Math.round((todayProgress.wordsLearned / dailyGoal) * 100)}% complete`,
      action: () => navigate('/training')
    }
  ];

  return (
    <Box sx={{ pb: 4, fontSize: `${fontSize}rem` }}>
      {/* Goal Setting Dialog */}
      <GoalSettingDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        currentGoal={stats.goal || 50}
        onSave={handleGoalSave}
      />

      {/* Modern Header with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              {/* Prominent Logo on Left */}
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
                    console.log('Dashboard logo failed to load');
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
                  Welcome back! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Continue your vocabulary mastery journey
                </Typography>
              </Box>
            </Stack>

            {/* User Avatar on Right */}
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Stack>

          {/* Performance Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<performance.icon />}
              label={`${performance.level} Level`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              icon={<StreakIcon />}
              label={learningStreak > 0 ? `${learningStreak} Day Streak` : 'Start Your Streak!'}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            {stats.averageScore > 0 && (
              <Chip
                icon={<TrophyIcon />}
                label={`${stats.averageScore}% Avg Score`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
            )}
          </Box>
        </Box>
      </Box>



      {/* Modern Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {modernStatCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
              onClick={card.action}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <card.icon sx={{ fontSize: 24, color: card.color }} />
                  </Box>
                  <Chip
                    label={card.trend}
                    size="small"
                    sx={{
                      bgcolor: card.trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: card.trend.startsWith('+') ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Stack>

                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: card.color }}>
                  {card.value}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {card.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>

                {card.secondaryAction && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        card.secondaryAction();
                      }}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {card.secondaryActionLabel}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>



      {/* Recent Activity and Top Learners Side by Side */}
      {(stats.recentQuizzes.length > 0 || topLearners.length > 0) && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Recent Activity */}
          {stats.recentQuizzes.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Recent Activity
                    </Typography>
                    <Button
                      variant="text"
                      endIcon={<ViewIcon />}
                      onClick={() => navigate('/quiz')}
                      size="small"
                    >
                      View All
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {stats.recentQuizzes.slice(0, 3).map((quiz, index) => (
                      <Paper
                        key={quiz.id || index}
                        sx={{
                          p: 3,
                          border: '1px solid #f1f5f9',
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#f8fafc',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {quiz.quizType || 'General'} Quiz
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(quiz.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip
                              label={`${quiz.percentage}%`}
                              color={quiz.percentage >= 80 ? 'success' : quiz.percentage >= 60 ? 'warning' : 'error'}
                              sx={{ fontWeight: 600 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {quiz.score}/{quiz.totalQuestions} correct
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Top Learners */}
          {topLearners.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      🏆 Top Learners
                    </Typography>
                    <Button
                      variant="text"
                      endIcon={<LeaderboardIcon />}
                      onClick={() => navigate('/leaderboard')}
                      size="small"
                    >
                      View Full
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {topLearners.slice(0, 3).map((learner, index) => (
                      <Paper
                        key={learner.userId}
                        sx={{
                          p: 2,
                          border: '1px solid #f1f5f9',
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#f8fafc',
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              minWidth: 40,
                              textAlign: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 800,
                              color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'
                            }}
                          >
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </Box>

                          <Avatar sx={{ width: 40, height: 40 }}>
                            {learner.avatar || '👤'}
                          </Avatar>

                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {learner.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {learner.level} • {learner.experiencePoints} XP
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={2} sx={{ textAlign: 'center' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {learner.wordsMastered}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Words
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {learner.totalQuizzes}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Quizzes
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}



      {/* Welcome Message for New Users */}
      {(stats.totalWordsLearned || stats.totalKnownWords || 0) === 0 && stats.totalQuizzes === 0 && (
        <Card
          sx={{
            mt: 4,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                Welcome to English Leap! 🚀
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Your vocabulary mastery journey starts here
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2 }}>
                  <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Explore Words
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse our comprehensive dictionary
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2 }}>
                  <QuizIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Take Quizzes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Test your knowledge and track progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2 }}>
                  <TrophyIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Master Vocabulary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build your word knowledge systematically
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              startIcon={<PlayIcon />}
              onClick={() => navigate('/training')}
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                }
              }}
            >
              Start Learning
            </Button>
          </CardContent>
        </Card>
      )}


    </Box>
  );
};

export default DashboardPage;
