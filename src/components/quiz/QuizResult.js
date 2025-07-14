import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RetryIcon,
  Home as HomeIcon,
  TrendingUp as StatsIcon,
  Visibility as ViewIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Quiz Result Component
 * Displays quiz results and performance statistics
 */
const QuizResult = ({
  score,
  totalQuestions,
  incorrectWords,
  correctWords,
  quizType,
  duration,
  onRetakeQuiz,
  onNewQuiz
}) => {
  const navigate = useNavigate();
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: 'success', emoji: '🏆' };
    if (percentage >= 80) return { level: 'Great', color: 'success', emoji: '🎉' };
    if (percentage >= 70) return { level: 'Good', color: 'primary', emoji: '👍' };
    if (percentage >= 60) return { level: 'Fair', color: 'warning', emoji: '📚' };
    return { level: 'Needs Improvement', color: 'error', emoji: '💪' };
  };

  const performance = getPerformanceLevel();
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWordClick = (word) => {
    navigate(`/training/${encodeURIComponent(word)}`);
  };

  const getGradeColor = () => {
    if (percentage >= 90) return '#4caf50';
    if (percentage >= 80) return '#8bc34a';
    if (percentage >= 70) return '#ff9800';
    if (percentage >= 60) return '#ff5722';
    return '#f44336';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Main Result Card */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Performance Badge */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={percentage}
                size={120}
                thickness={6}
                sx={{
                  color: getGradeColor(),
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" component="div" color={getGradeColor()}>
                  {percentage}%
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h4" gutterBottom>
              {performance.emoji} {performance.level}!
            </Typography>
            
            <Typography variant="h6" color="text.secondary">
              You scored {score} out of {totalQuestions} questions correctly
            </Typography>
          </Box>

          {/* Quiz Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">
                  {score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correct
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="error.main">
                  {totalQuestions - score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Incorrect
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary.main">
                  {formatDuration(duration)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="info.main">
                  {quizType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quiz Type
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<RetryIcon />}
              onClick={onRetakeQuiz}
              size="large"
            >
              Retake Quiz
            </Button>
            <Button
              variant="outlined"
              startIcon={<StatsIcon />}
              onClick={onNewQuiz}
              size="large"
            >
              New Quiz
            </Button>
            <Button
              variant="text"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              size="large"
            >
              Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Incorrect Words Review */}
      {incorrectWords && incorrectWords.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error.main">
              Words to Review ({incorrectWords.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              These words have been added to your "Struggled Words" list for future practice.
            </Typography>
            
            <List>
              {incorrectWords.map((word, index) => (
                <React.Fragment key={word}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleWordClick(word)}>
                      <ListItemText
                        primary={word}
                        secondary="Click to view detailed definition"
                      />
                      <ViewIcon color="action" />
                    </ListItemButton>
                  </ListItem>
                  {index < incorrectWords.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Correct Words (if any) */}
      {correctWords && correctWords.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Words You Knew ({correctWords.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Great job on these words! Keep up the excellent work.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {correctWords.map((word) => (
                <Chip
                  key={word}
                  label={word}
                  color="success"
                  variant="outlined"
                  onClick={() => handleWordClick(word)}
                  clickable
                  icon={<SchoolIcon />}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card sx={{ mt: 3, backgroundColor: '#f8f9fa' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <TrophyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Keep Learning!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {percentage >= 80 
              ? "Excellent work! You're mastering your vocabulary. Try a more challenging quiz next!"
              : percentage >= 60
              ? "Good progress! Review the missed words and try again to improve your score."
              : "Don't give up! Every quiz helps you learn. Focus on the struggled words and keep practicing."
            }
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizResult;
