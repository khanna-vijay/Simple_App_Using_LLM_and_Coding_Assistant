import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Fade
} from '@mui/material';
import {
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon
} from '@mui/icons-material';
import { generateQuizChoices } from '../../services/DictionaryService';
import AudioButton from '../ui/AudioButton';
import { AUDIO_TYPES } from '../../services/AudioService';

/**
 * Question Component
 * Displays a single quiz question with multiple choice answers
 */
const Question = ({
  word,
  allWords,
  questionNumber,
  totalQuestions,
  onAnswer,
  timeLimit = 30 // seconds
}) => {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate choices when word changes
  useEffect(() => {
    if (word && allWords) {
      try {
        const quizChoices = generateQuizChoices(allWords, word, 4);
        setChoices(quizChoices);
      } catch (error) {
        console.error('Error generating quiz choices:', error);
        // Fallback: create a simple choice structure
        setChoices([{
          text: word.meanings?.[0]?.definitions?.[0]?.definition || 'No definition available',
          isCorrect: true,
          word: word.word
        }]);
      }
    }
  }, [word, allWords]);

  // Timer countdown
  useEffect(() => {
    if (isAnswered || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit with no answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, showFeedback]);

  // Reset state when word changes
  useEffect(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setTimeLeft(timeLimit);
    setIsAnswered(false);
  }, [word, timeLimit]);

  const handleTimeUp = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setShowFeedback(true);
      setTimeout(() => {
        onAnswer(null, false); // No answer selected, incorrect
      }, 2000);
    }
  };

  const handleChoiceSelect = (choice, index) => {
    if (isAnswered) return;

    setSelectedChoice(index);
    setIsAnswered(true);
    setShowFeedback(true);

    // Show feedback for 2 seconds, then move to next question
    setTimeout(() => {
      onAnswer(choice, choice.isCorrect);
    }, 2000);
  };

  const getChoiceColor = (choice, index) => {
    if (!showFeedback) {
      return selectedChoice === index ? 'primary' : 'inherit';
    }

    if (choice.isCorrect) {
      return 'success';
    } else if (selectedChoice === index) {
      return 'error';
    }
    return 'inherit';
  };

  const getChoiceVariant = (choice, index) => {
    if (!showFeedback) {
      return selectedChoice === index ? 'contained' : 'outlined';
    }

    if (choice.isCorrect) {
      return 'contained';
    } else if (selectedChoice === index) {
      return 'contained';
    }
    return 'outlined';
  };

  const progress = ((totalQuestions - questionNumber + 1) / totalQuestions) * 100;
  const timeProgress = (timeLeft / timeLimit) * 100;

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Progress and Timer */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {questionNumber} of {totalQuestions}
            </Typography>
            <Typography variant="body2" color={timeLeft <= 5 ? 'error' : 'text.secondary'}>
              {timeLeft}s remaining
            </Typography>
          </Box>
          
          {/* Question Progress */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 6, borderRadius: 3, mb: 1 }}
          />
          
          {/* Timer Progress */}
          <LinearProgress 
            variant="determinate" 
            value={timeProgress} 
            color={timeLeft <= 5 ? 'error' : 'primary'}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        {/* Question */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom color="primary.main">
            {word.word}
          </Typography>
          
          {/* Pronunciation */}
          {word.phonetic_respelling && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mr: 1 }}>
                /{word.phonetic_respelling}/
              </Typography>
              <AudioButton
                word={word.word}
                type={AUDIO_TYPES.PRONUNCIATION}
                variant="button"
                size="small"
                showLabel={true}
              />
            </Box>
          )}

          {/* Metadata */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
            <Chip label={word.letter} variant="outlined" size="small" />
            {word.complexity && (
              <Chip 
                label={word.complexity} 
                color={word.complexity === 'Advanced' ? 'error' : 'warning'}
                variant="outlined"
                size="small"
              />
            )}
            {word.meanings && word.meanings[0] && (
              <Chip 
                label={word.meanings[0].part_of_speech} 
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            What does this word mean?
          </Typography>
        </Box>

        {/* Answer Choices */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {choices.map((choice, index) => (
            <Fade in={true} timeout={300 + index * 100} key={index}>
              <Button
                variant={getChoiceVariant(choice, index)}
                color={getChoiceColor(choice, index)}
                onClick={() => handleChoiceSelect(choice, index)}
                disabled={isAnswered}
                sx={{
                  p: 2,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: '1rem',
                  lineHeight: 1.4,
                  minHeight: 60,
                  position: 'relative'
                }}
                startIcon={
                  showFeedback && choice.isCorrect ? <CorrectIcon /> :
                  showFeedback && selectedChoice === index && !choice.isCorrect ? <IncorrectIcon /> :
                  null
                }
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body1">
                    {String.fromCharCode(65 + index)}. {choice.text}
                  </Typography>
                </Box>
              </Button>
            </Fade>
          ))}
        </Box>

        {/* Feedback */}
        {showFeedback && (
          <Fade in={showFeedback} timeout={500}>
            <Paper 
              sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: selectedChoice !== null && choices[selectedChoice]?.isCorrect 
                  ? '#e8f5e8' 
                  : '#ffebee',
                textAlign: 'center'
              }}
            >
              {selectedChoice === null ? (
                <Typography variant="h6" color="error">
                  Time's up! ⏰
                </Typography>
              ) : choices[selectedChoice]?.isCorrect ? (
                <Typography variant="h6" color="success.main">
                  Correct! ✅
                </Typography>
              ) : (
                <Box>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    Incorrect ❌
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The correct answer was: {choices.find(c => c.isCorrect)?.text}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
};

export default Question;
