import React, { createContext, useContext, useState, useEffect } from 'react';
import databaseService from '../services/DatabaseService';

/**
 * User Context - Manages user authentication and session
 */
const UserContext = createContext();

/**
 * Custom hook to use the User Context
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * User Provider Component
 */
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Initialize and check for existing session
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      
      // Initialize database
      await databaseService.init();
      
      // Load all users
      const allUsers = await databaseService.getAllUsers();
      setUsers(allUsers);
      
      // Check for existing session
      const savedUserId = sessionStorage.getItem('englishLeap_currentUserId');
      if (savedUserId) {
        const user = await databaseService.getUserById(parseInt(savedUserId));
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // Update last login
          await databaseService.updateUser(user.id, {
            lastLoginAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new user
   */
  const createUser = async (username, avatar = null) => {
    try {
      const user = await databaseService.createUser(username, avatar);
      setUsers(prev => [...prev, user]);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  /**
   * Login with existing user
   */
  const loginUser = async (userId) => {
    try {
      const user = await databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Clear any existing localStorage data to prevent cross-user contamination
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('englishLeap_') && !key.includes('selectedVoice') && !key.includes('audioEnabled')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Update last login
      const updatedUser = await databaseService.updateUser(userId, {
        lastLoginAt: new Date().toISOString()
      });

      setCurrentUser(updatedUser);
      setIsAuthenticated(true);

      // Save session
      sessionStorage.setItem('englishLeap_currentUserId', userId.toString());

      return updatedUser;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logoutUser = () => {
    // Clear user-specific localStorage data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('englishLeap_') && !key.includes('selectedVoice') && !key.includes('audioEnabled')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('englishLeap_currentUserId');
  };

  /**
   * Delete user and all associated data
   */
  const deleteUser = async (userId) => {
    try {
      await databaseService.deleteUser(userId);

      // Remove from users list
      setUsers(prev => prev.filter(user => user.id !== userId));

      // If deleting current user, logout
      if (currentUser && currentUser.id === userId) {
        logoutUser();
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  /**
   * Reset all application data
   */
  const resetAllData = async () => {
    try {
      await databaseService.resetAllApplicationData();

      // Reset state
      setCurrentUser(null);
      setIsAuthenticated(false);
      setUsers([]);

      // Force page reload to ensure clean state
      window.location.reload();

      return true;
    } catch (error) {
      console.error('Error resetting all data:', error);
      throw error;
    }
  };

  /**
   * Update current user
   */
  const updateCurrentUser = async (updates) => {
    if (!currentUser) return;

    try {
      const updatedUser = await databaseService.updateUser(currentUser.id, updates);
      setCurrentUser(updatedUser);
      
      // Update users list
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  /**
   * Save word progress for current user
   */
  const saveWordProgress = async (wordId, status, difficulty = null) => {
    if (!currentUser) return;

    try {
      const progress = await databaseService.saveWordProgress(
        currentUser.id, 
        wordId, 
        status, 
        difficulty
      );
      
      // Update user stats
      const userProgress = await databaseService.getUserProgress(currentUser.id);
      const knownWords = userProgress.filter(p => p.status === 'known').length;
      
      await updateCurrentUser({
        totalWordsLearned: knownWords
      });
      
      return progress;
    } catch (error) {
      console.error('Error saving word progress:', error);
      throw error;
    }
  };

  /**
   * Get user progress
   */
  const getUserProgress = async () => {
    if (!currentUser) return [];

    try {
      return await databaseService.getUserProgress(currentUser.id);
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  };

  /**
   * Save quiz result for current user
   */
  const saveQuizResult = async (quizData) => {
    if (!currentUser) return;

    try {
      const result = await databaseService.saveQuizResult(currentUser.id, quizData);

      // Update user stats
      const quizHistory = await databaseService.getUserQuizHistory(currentUser.id);
      const totalQuizzes = quizHistory.length;
      const averageScore = quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes;

      // Calculate experience points (quizzes worth more points)
      const userProgress = await databaseService.getUserProgress(currentUser.id);
      const knownWords = userProgress.filter(p => p.status === 'known').length;
      const experiencePoints = knownWords * 10 + totalQuizzes * 25;

      // Determine level based on experience
      let level = 'Beginner';
      if (experiencePoints >= 1000) level = 'Expert';
      else if (experiencePoints >= 500) level = 'Advanced';
      else if (experiencePoints >= 200) level = 'Intermediate';

      await updateCurrentUser({
        totalQuizzesTaken: totalQuizzes,
        averageScore: Math.round(averageScore),
        experience: experiencePoints,
        level: level
      });

      return result;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  };

  /**
   * Get user quiz history
   */
  const getQuizHistory = async (limit = 50) => {
    if (!currentUser) return [];

    try {
      return await databaseService.getUserQuizHistory(currentUser.id, limit);
    } catch (error) {
      console.error('Error getting quiz history:', error);
      return [];
    }
  };

  /**
   * Save user setting
   */
  const saveSetting = async (key, value) => {
    if (!currentUser) return;

    try {
      return await databaseService.saveSetting(currentUser.id, key, value);
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  };

  /**
   * Get user settings
   */
  const getSettings = async () => {
    if (!currentUser) return {};

    try {
      return await databaseService.getUserSettings(currentUser.id);
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  };

  /**
   * Update user goal
   */
  const updateUserGoal = async (goal) => {
    if (!currentUser) return;

    try {
      await updateCurrentUser({ goal: parseInt(goal) });
    } catch (error) {
      console.error('Error updating user goal:', error);
      throw error;
    }
  };

  /**
   * Get user statistics
   */
  const getUserStatistics = async () => {
    if (!currentUser) return null;

    try {
      const progress = await getUserProgress();
      const quizHistory = await getQuizHistory();

      const knownWords = progress.filter(p => p.status === 'known');
      const struggledWords = progress.filter(p => p.status === 'struggling');

      return {
        totalWordsLearned: knownWords.length,
        totalStruggledWords: struggledWords.length,
        totalQuizzes: quizHistory.length,
        averageScore: currentUser.averageScore || 0,
        currentStreak: currentUser.currentStreak || 0,
        longestStreak: currentUser.longestStreak || 0,
        level: currentUser.level || 'Beginner',
        experience: currentUser.experience || 0,
        goal: currentUser.goal || 50,
        recentQuizzes: quizHistory.slice(0, 5),
        knownWordIds: knownWords.map(w => w.wordId),
        struggledWordIds: struggledWords.map(w => w.wordId)
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return null;
    }
  };

  const value = {
    // State
    currentUser,
    isAuthenticated,
    isLoading,
    users,

    // Authentication
    createUser,
    loginUser,
    logoutUser,
    deleteUser,
    resetAllData,
    updateCurrentUser,

    // Progress Management
    saveWordProgress,
    getUserProgress,
    saveQuizResult,
    getQuizHistory,
    getUserStatistics,
    updateUserGoal,

    // Settings
    saveSetting,
    getSettings,

    // Utilities
    refreshUsers: initializeUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
