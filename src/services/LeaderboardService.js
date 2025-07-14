/**
 * Leaderboard Service for English Leap
 * Handles leaderboard calculations and rankings
 */

import databaseService from './DatabaseService';

class LeaderboardService {
  /**
   * Calculate user statistics for leaderboard
   */
  async calculateUserStats(userId) {
    try {
      const user = await databaseService.getUserById(userId);
      const progress = await databaseService.getUserProgress(userId);
      const quizHistory = await databaseService.getUserQuizHistory(userId);
      
      if (!user) return null;

      // Calculate words mastered
      const wordsMastered = progress.filter(p => p.status === 'known').length;
      
      // Calculate total quizzes taken
      const totalQuizzes = quizHistory.length;
      
      // Calculate average score
      const averageScore = totalQuizzes > 0 
        ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes)
        : 0;
      
      // Calculate days active (simplified - based on unique dates of activity)
      const activityDates = new Set();
      
      // Add quiz dates
      quizHistory.forEach(quiz => {
        const date = new Date(quiz.date).toDateString();
        activityDates.add(date);
      });
      
      // Add progress update dates
      progress.forEach(p => {
        const date = new Date(p.updatedAt).toDateString();
        activityDates.add(date);
      });
      
      const daysActive = activityDates.size;
      
      // Calculate current streak (simplified)
      const currentStreak = this.calculateStreak(quizHistory);
      
      // Calculate total study time (estimated based on quizzes and progress)
      const totalStudyTime = totalQuizzes * 5 + progress.length * 2; // minutes
      
      // Calculate experience points
      const experiencePoints = wordsMastered * 10 + totalQuizzes * 25 + daysActive * 5;
      
      return {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        level: user.level || 'Beginner',
        wordsMastered,
        totalQuizzes,
        averageScore,
        daysActive,
        currentStreak,
        totalStudyTime,
        experiencePoints,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return null;
    }
  }

  /**
   * Calculate streak based on quiz history
   */
  calculateStreak(quizHistory) {
    if (quizHistory.length === 0) return 0;
    
    // Sort quizzes by date (most recent first)
    const sortedQuizzes = quizHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get unique dates
    const uniqueDates = [...new Set(sortedQuizzes.map(quiz => 
      new Date(quiz.date).toDateString()
    ))];
    
    if (uniqueDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if user was active today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }
    
    // Calculate consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i-1]);
      const previousDate = new Date(uniqueDates[i]);
      const dayDifference = Math.floor((currentDate - previousDate) / (24 * 60 * 60 * 1000));
      
      if (dayDifference === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Get leaderboard for words mastered
   */
  async getWordsMasteredLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null)
        .sort((a, b) => b.wordsMastered - a.wordsMastered)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting words mastered leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for most active days
   */
  async getDaysActiveLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null)
        .sort((a, b) => b.daysActive - a.daysActive)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting days active leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for most quizzes taken
   */
  async getQuizzesTakenLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null)
        .sort((a, b) => b.totalQuizzes - a.totalQuizzes)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting quizzes taken leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for highest average scores
   */
  async getAverageScoreLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null && stats.totalQuizzes > 0)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting average score leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for current streaks
   */
  async getCurrentStreakLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null)
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting current streak leaderboard:', error);
      return [];
    }
  }

  /**
   * Get overall leaderboard based on experience points
   */
  async getOverallLeaderboard(limit = 10) {
    try {
      const users = await databaseService.getAllUsers();
      const userStats = await Promise.all(
        users.map(user => this.calculateUserStats(user.id))
      );
      
      return userStats
        .filter(stats => stats !== null)
        .sort((a, b) => b.experiencePoints - a.experiencePoints)
        .slice(0, limit)
        .map((stats, index) => ({
          ...stats,
          rank: index + 1
        }));
    } catch (error) {
      console.error('Error getting overall leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's rank in specific category
   */
  async getUserRank(userId, category = 'overall') {
    try {
      let leaderboard = [];
      
      switch (category) {
        case 'words':
          leaderboard = await this.getWordsMasteredLeaderboard(1000);
          break;
        case 'days':
          leaderboard = await this.getDaysActiveLeaderboard(1000);
          break;
        case 'quizzes':
          leaderboard = await this.getQuizzesTakenLeaderboard(1000);
          break;
        case 'score':
          leaderboard = await this.getAverageScoreLeaderboard(1000);
          break;
        case 'streak':
          leaderboard = await getCurrentStreakLeaderboard(1000);
          break;
        default:
          leaderboard = await this.getOverallLeaderboard(1000);
      }
      
      const userEntry = leaderboard.find(entry => entry.userId === userId);
      return userEntry ? userEntry.rank : null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Get comprehensive leaderboard data
   */
  async getAllLeaderboards(limit = 10) {
    try {
      const [
        overall,
        wordsMastered,
        daysActive,
        quizzesTaken,
        averageScore,
        currentStreak
      ] = await Promise.all([
        this.getOverallLeaderboard(limit),
        this.getWordsMasteredLeaderboard(limit),
        this.getDaysActiveLeaderboard(limit),
        this.getQuizzesTakenLeaderboard(limit),
        this.getAverageScoreLeaderboard(limit),
        this.getCurrentStreakLeaderboard(limit)
      ]);

      return {
        overall,
        wordsMastered,
        daysActive,
        quizzesTaken,
        averageScore,
        currentStreak
      };
    } catch (error) {
      console.error('Error getting all leaderboards:', error);
      return {
        overall: [],
        wordsMastered: [],
        daysActive: [],
        quizzesTaken: [],
        averageScore: [],
        currentStreak: []
      };
    }
  }
}

// Create singleton instance
const leaderboardService = new LeaderboardService();

export default leaderboardService;
