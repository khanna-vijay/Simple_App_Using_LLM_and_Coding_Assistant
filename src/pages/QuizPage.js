import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';
import { useFontSize } from '../context/FontSizeContext';
import QuizOptions from '../components/quiz/QuizOptions';
import Question from '../components/quiz/Question';
import QuizResult from '../components/quiz/QuizResult';

/**
 * Quiz Page Component
 * Main quiz interface with multiple choice questions
 */
const QuizPage = () => {
  const { words, loading } = useDictionary();
  const { addQuizResult, addStruggledWord } = useUserProgressContext();
  const { fontSize } = useFontSize();

  const [quizState, setQuizState] = useState('setup'); // 'setup', 'active', 'completed'
  const [quizConfig, setQuizConfig] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const handleStartQuiz = (config) => {
    setQuizConfig(config);
    setQuizState('active');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(Date.now());
  };

  const handleAnswer = (selectedChoice, isCorrect) => {
    const answer = {
      word: quizConfig.words[currentQuestionIndex].word,
      selectedChoice,
      isCorrect,
      timeSpent: Date.now() - startTime
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Add incorrect words to struggled words
    if (!isCorrect) {
      addStruggledWord(answer.word);
    }

    // Move to next question or finish quiz
    if (currentQuestionIndex < quizConfig.words.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (finalAnswers) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000); // in seconds

    const correctAnswers = finalAnswers.filter(a => a.isCorrect);
    const incorrectAnswers = finalAnswers.filter(a => !a.isCorrect);

    const quizResult = {
      score: correctAnswers.length,
      totalQuestions: finalAnswers.length,
      percentage: Math.round((correctAnswers.length / finalAnswers.length) * 100),
      incorrectWords: incorrectAnswers.map(a => a.word),
      correctWords: correctAnswers.map(a => a.word),
      quizType: quizConfig.quizType,
      duration,
      date: new Date().toISOString(),
      answers: finalAnswers
    };

    // Save quiz result
    addQuizResult(quizResult);

    setQuizState('completed');
  };

  const handleRetakeQuiz = () => {
    setQuizState('active');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(Date.now());
  };

  const handleNewQuiz = () => {
    setQuizState('setup');
    setQuizConfig(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(null);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Quiz...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const getQuizResult = () => {
    if (answers.length === 0) return null;

    const correctAnswers = answers.filter(a => a.isCorrect);
    const incorrectAnswers = answers.filter(a => !a.isCorrect);
    const duration = Math.round((Date.now() - startTime) / 1000);

    return {
      score: correctAnswers.length,
      totalQuestions: answers.length,
      incorrectWords: incorrectAnswers.map(a => a.word),
      correctWords: correctAnswers.map(a => a.word),
      quizType: quizConfig?.quizType || 'General',
      duration
    };
  };

  return (
    <Box sx={{ fontSize: `${fontSize}rem` }}>
      {quizState === 'setup' && (
        <QuizOptions onStartQuiz={handleStartQuiz} />
      )}

      {quizState === 'active' && quizConfig && (
        <Question
          word={quizConfig.words[currentQuestionIndex]}
          allWords={words}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quizConfig.words.length}
          onAnswer={handleAnswer}
          timeLimit={30}
        />
      )}

      {quizState === 'completed' && (
        <QuizResult
          {...getQuizResult()}
          onRetakeQuiz={handleRetakeQuiz}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </Box>
  );
};

export default QuizPage;
