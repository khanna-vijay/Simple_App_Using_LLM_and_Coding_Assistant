import { useCallback, useEffect, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { useUser } from '../context/UserContext';

/**
 * Custom hook for managing user progress data
 * @returns {Object} User progress state and functions
 */
const useUserProgress = () => {
  const { currentUser, saveWordProgress, saveQuizResult, getUserProgress, getQuizHistory } = useUser();

  // Create user-specific localStorage keys
  const userPrefix = currentUser ? `englishLeap_user_${currentUser.id}_` : 'englishLeap_';

  // State management using localStorage (fallback) and database
  const [knownWords, setKnownWords] = useLocalStorage(`${userPrefix}knownWords`, []);
  const [struggledWords, setStruggledWords] = useLocalStorage(`${userPrefix}struggledWords`, []);
  const [quizHistory, setQuizHistory] = useLocalStorage(`${userPrefix}quizHistory`, []);

  // Sync with database when user is available
  useEffect(() => {
    const syncWithDatabase = async () => {
      if (!currentUser) {
        // Clear data when no user is logged in
        setKnownWords([]);
        setStruggledWords([]);
        setQuizHistory([]);
        return;
      }

      try {
        // Load progress from database
        const dbProgress = await getUserProgress();
        const dbQuizHistory = await getQuizHistory();

        // Extract known and struggled words from database
        const dbKnownWords = dbProgress.filter(p => p.status === 'known').map(p => p.wordId);
        const dbStruggledWords = dbProgress.filter(p => p.status === 'struggling').map(p => p.wordId);

        // Use database data as the source of truth
        setKnownWords(dbKnownWords);
        setStruggledWords(dbStruggledWords);
        setQuizHistory(dbQuizHistory);

      } catch (error) {
        console.error('Error syncing with database:', error);
      }
    };

    syncWithDatabase();
  }, [currentUser, getUserProgress, getQuizHistory, setKnownWords, setStruggledWords, setQuizHistory]);

  // Function to add a word to struggled words
  const addStruggledWord = useCallback(async (word) => {
    if (!word) return;

    const wordName = typeof word === 'string' ? word : word.word;

    setStruggledWords(prev => {
      // Avoid duplicates
      if (prev.includes(wordName)) {
        return prev;
      }
      return [...prev, wordName];
    });

    // Save to database if user is logged in
    if (currentUser && saveWordProgress) {
      try {
        await saveWordProgress(wordName, 'struggling');
      } catch (error) {
        console.error('Error saving word progress to database:', error);
      }
    }
  }, [setStruggledWords, currentUser, saveWordProgress]);

  // Function to remove a word from struggled words
  const removeStruggledWord = useCallback((word) => {
    if (!word) return;
    
    const wordName = typeof word === 'string' ? word : word.word;
    
    setStruggledWords(prev => prev.filter(w => w !== wordName));
  }, [setStruggledWords]);

  // Function to mark a word as known
  const markAsKnown = useCallback(async (word) => {
    if (!word) return;

    const wordName = typeof word === 'string' ? word : word.word;

    setKnownWords(prev => {
      // Avoid duplicates
      if (prev.includes(wordName)) {
        return prev;
      }

      // Update today's progress when a new word is marked as known
      const todayKey = new Date().toDateString();
      const todayProgressKey = `englishLeap_dailyProgress_${todayKey}`;

      try {
        const currentProgress = localStorage.getItem(todayProgressKey);
        let progressData = { wordsLearned: 0, date: todayKey, words: [] };

        if (currentProgress) {
          progressData = JSON.parse(currentProgress);
        }

        // Add word to today's progress if not already there
        if (!progressData.words.includes(wordName)) {
          progressData.words.push(wordName);
          progressData.wordsLearned = progressData.words.length;
          localStorage.setItem(todayProgressKey, JSON.stringify(progressData));
        }
      } catch (error) {
        console.error('Error updating daily progress:', error);
      }

      return [...prev, wordName];
    });

    // Remove from struggled words if it exists there
    removeStruggledWord(wordName);

    // Save to database if user is logged in
    if (currentUser && saveWordProgress) {
      try {
        await saveWordProgress(wordName, 'known');
      } catch (error) {
        console.error('Error saving word progress to database:', error);
      }
    }
  }, [setKnownWords, removeStruggledWord, currentUser, saveWordProgress]);

  // Function to remove a word from known words
  const removeKnownWord = useCallback((word) => {
    if (!word) return;

    const wordName = typeof word === 'string' ? word : word.word;

    // Update today's progress when a word is removed from known
    const todayKey = new Date().toDateString();
    const todayProgressKey = `englishLeap_dailyProgress_${todayKey}`;

    try {
      const currentProgress = localStorage.getItem(todayProgressKey);
      if (currentProgress) {
        const progressData = JSON.parse(currentProgress);

        // Remove word from today's progress if it exists
        if (progressData.words && progressData.words.includes(wordName)) {
          progressData.words = progressData.words.filter(w => w !== wordName);
          progressData.wordsLearned = progressData.words.length;
          localStorage.setItem(todayProgressKey, JSON.stringify(progressData));
        }
      }
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }

    setKnownWords(prev => prev.filter(w => w !== wordName));
  }, [setKnownWords]);

  // Function to mark a word as needs practice
  const markAsNeedsPractice = useCallback((word) => {
    if (!word) return;
    
    const wordName = typeof word === 'string' ? word : word.word;
    
    // Remove from known words
    removeKnownWord(wordName);
    
    // Add to struggled words
    addStruggledWord(wordName);
  }, [removeKnownWord, addStruggledWord]);

  // Function to add quiz result
  const addQuizResult = useCallback(async (quizResult) => {
    if (!quizResult) return;

    const result = {
      id: Date.now(), // Simple ID generation
      date: new Date().toISOString(),
      score: quizResult.score || 0,
      totalQuestions: quizResult.totalQuestions || 0,
      percentage: quizResult.percentage || 0,
      incorrectWords: quizResult.incorrectWords || [],
      quizType: quizResult.quizType || 'general',
      duration: quizResult.duration || 0, // in seconds
      ...quizResult
    };

    setQuizHistory(prev => [result, ...prev]); // Add to beginning for recent first

    // Save to database if user is logged in
    if (currentUser && saveQuizResult) {
      try {
        await saveQuizResult(result);
      } catch (error) {
        console.error('Error saving quiz result to database:', error);
      }
    }

    // Add incorrect words to struggled words
    if (result.incorrectWords && result.incorrectWords.length > 0) {
      for (const word of result.incorrectWords) {
        await addStruggledWord(word);
      }
    }
  }, [setQuizHistory, addStruggledWord, currentUser, saveQuizResult]);

  // Function to clear all progress (for testing or reset)
  const clearAllProgress = useCallback(() => {
    setKnownWords([]);
    setStruggledWords([]);
    setQuizHistory([]);
  }, [setKnownWords, setStruggledWords, setQuizHistory]);

  // Function to get statistics
  const getStatistics = useCallback(() => {
    const totalQuizzes = quizHistory.length;
    const totalCorrectAnswers = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;
    
    const recentQuizzes = quizHistory.slice(0, 5); // Last 5 quizzes
    const recentAverageScore = recentQuizzes.length > 0 
      ? recentQuizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / recentQuizzes.length 
      : 0;

    return {
      totalKnownWords: knownWords.length,
      totalStruggledWords: struggledWords.length,
      totalQuizzes,
      totalCorrectAnswers,
      totalQuestions,
      averageScore: Math.round(averageScore * 100) / 100,
      recentAverageScore: Math.round(recentAverageScore * 100) / 100,
      recentQuizzes
    };
  }, [knownWords.length, struggledWords.length, quizHistory]);

  // Function to check if a word is known
  const isWordKnown = useCallback((word) => {
    const wordName = typeof word === 'string' ? word : word.word;
    return knownWords.includes(wordName);
  }, [knownWords]);

  // Function to check if a word is struggled
  const isWordStruggled = useCallback((word) => {
    const wordName = typeof word === 'string' ? word : word.word;
    return struggledWords.includes(wordName);
  }, [struggledWords]);

  return {
    // State
    knownWords,
    struggledWords,
    quizHistory,
    
    // Functions
    addStruggledWord,
    removeStruggledWord,
    markAsKnown,
    removeKnownWord,
    markAsNeedsPractice,
    addQuizResult,
    clearAllProgress,
    
    // Utility functions
    getStatistics,
    isWordKnown,
    isWordStruggled
  };
};

export default useUserProgress;
