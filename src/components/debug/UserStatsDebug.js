import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import { useUserProgressContext } from '../../context/UserProgressContext';
import leaderboardService from '../../services/LeaderboardService';

/**
 * Debug component to show user stats and test leaderboard functionality
 */
const UserStatsDebug = () => {
  const { currentUser, getUserProgress, getQuizHistory, getUserStatistics, saveWordProgress } = useUser();
  const { knownWords, struggledWords, quizHistory, getStatistics, addQuizResult } = useUserProgressContext();
  const [dbProgress, setDbProgress] = useState([]);
  const [dbQuizHistory, setDbQuizHistory] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [leaderboardStats, setLeaderboardStats] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      // Load from database
      const progress = await getUserProgress();
      const quizzes = await getQuizHistory();
      const stats = await getUserStatistics();
      const lbStats = await leaderboardService.calculateUserStats(currentUser.id);

      setDbProgress(progress);
      setDbQuizHistory(quizzes);
      setUserStats(stats);
      setLeaderboardStats(lbStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const addTestData = async () => {
    if (!currentUser) return;

    try {
      // Add some test words
      const testWords = ['test', 'example', 'sample'];
      for (const word of testWords) {
        await saveWordProgress?.(word, 'known');
      }

      // Add a test quiz result
      const testQuiz = {
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        quizType: 'test',
        duration: 120
      };
      
      // Use the context method to add quiz result
      await addQuizResult(testQuiz);

      // Reload data
      await loadUserData();
    } catch (error) {
      console.error('Error adding test data:', error);
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent>
          <Typography>No user logged in</Typography>
        </CardContent>
      </Card>
    );
  }

  const contextStats = getStatistics();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔍 User Stats Debug - {currentUser.username}
        </Typography>

        <Stack spacing={2}>
          {/* Current User Info */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current User:
            </Typography>
            <Chip label={`ID: ${currentUser.id}`} size="small" />
            <Chip label={`Username: ${currentUser.username}`} size="small" sx={{ ml: 1 }} />
            <Chip label={`Level: ${currentUser.level || 'Beginner'}`} size="small" sx={{ ml: 1 }} />
          </Box>

          <Divider />

          {/* Context Stats */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Context Stats (localStorage):
            </Typography>
            <Typography variant="body2">
              Mastered Words: {knownWords.length} |
              Struggled Words: {struggledWords.length} | 
              Quizzes: {quizHistory.length} | 
              Avg Score: {contextStats.averageScore}%
            </Typography>
          </Box>

          <Divider />

          {/* Database Stats */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Database Stats:
            </Typography>
            <Typography variant="body2">
              DB Progress Records: {dbProgress.length} | 
              DB Quiz History: {dbQuizHistory.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Known in DB: {dbProgress.filter(p => p.status === 'known').length} | 
              Struggling in DB: {dbProgress.filter(p => p.status === 'struggling').length}
            </Typography>
          </Box>

          <Divider />

          {/* User Statistics */}
          {userStats && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                User Statistics (from UserContext):
              </Typography>
              <Typography variant="body2">
                Words Learned: {userStats.totalWordsLearned} | 
                Struggled: {userStats.totalStruggledWords} | 
                Quizzes: {userStats.totalQuizzes} | 
                Avg Score: {userStats.averageScore}%
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Leaderboard Stats */}
          {leaderboardStats && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Leaderboard Stats:
              </Typography>
              <Typography variant="body2">
                Words Mastered: {leaderboardStats.wordsMastered} | 
                Total Quizzes: {leaderboardStats.totalQuizzes} | 
                Days Active: {leaderboardStats.daysActive} | 
                Experience: {leaderboardStats.experiencePoints} XP
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={loadUserData}>
              Refresh Data
            </Button>
            <Button variant="contained" size="small" onClick={addTestData}>
              Add Test Data
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserStatsDebug;
