import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Slider,
  TextField,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Numbers as NumbersIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as KnownIcon,
  Warning as PracticeIcon,
  FiberNew as NewIcon
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';
import { useUserProgressContext } from '../../context/UserProgressContext';
import { getWordsByLetter, getWordsByComplexity } from '../../services/DictionaryService';
import FilterTemplate from '../common/FilterTemplate';

/**
 * Quiz Options Component
 * Allows users to configure quiz settings
 */
const QuizOptions = ({ onStartQuiz }) => {
  const { words, getAvailableLetters, getAvailableComplexities } = useDictionary();
  const { struggledWords, knownWords } = useUserProgressContext();

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);
  const [selectedProgressFilters, setSelectedProgressFilters] = useState([]);
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Handle number of questions change with validation
  const handleQuestionCountChange = (newValue) => {
    const validValue = Math.max(1, Math.min(maxQuestions, newValue));
    setNumberOfQuestions(validValue);
  };

  const getQuizWords = () => {
    let quizWords = [...words];

    // Apply letter filters
    if (selectedLetters.length > 0) {
      quizWords = quizWords.filter(word =>
        selectedLetters.includes(word.letter || word.word[0].toUpperCase())
      );
    }

    // Apply complexity filters
    if (selectedComplexities.length > 0) {
      quizWords = quizWords.filter(word =>
        selectedComplexities.includes(word.complexity || word.difficulty)
      );
    }

    // Apply part of speech filters
    if (selectedPartsOfSpeech.length > 0) {
      quizWords = quizWords.filter(word => {
        if (word.meanings && word.meanings.length > 0) {
          return word.meanings.some(meaning =>
            selectedPartsOfSpeech.includes(meaning.part_of_speech)
          );
        }
        if (word.partOfSpeech) {
          return selectedPartsOfSpeech.includes(word.partOfSpeech);
        }
        return false;
      });
    }

    // Apply progress filters
    if (selectedProgressFilters.length > 0) {
      quizWords = quizWords.filter(word => {
        const isKnown = knownWords.includes(word.word);
        const isStruggled = struggledWords.includes(word.word);

        return selectedProgressFilters.some(filter => {
          switch (filter) {
            case 'known':
              return isKnown;
            case 'practice':
              return isStruggled;
            case 'new':
              return !isKnown && !isStruggled;
            default:
              return false;
          }
        });
      });
    }

    // Shuffle and limit to requested number of questions
    const shuffled = shuffleArray([...quizWords]);
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length));
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper functions for available options
  const getAvailablePartsOfSpeech = () => {
    const partsOfSpeech = new Set();
    words.forEach(word => {
      if (word.meanings && word.meanings.length > 0) {
        word.meanings.forEach(meaning => {
          if (meaning.part_of_speech) {
            partsOfSpeech.add(meaning.part_of_speech);
          }
        });
      }
      if (word.partOfSpeech) {
        partsOfSpeech.add(word.partOfSpeech);
      }
    });
    return Array.from(partsOfSpeech).sort();
  };

  // Filter toggle handlers
  const handleLetterToggle = (event, newLetters) => {
    setSelectedLetters(newLetters || []);
  };

  const handleComplexityToggle = (event, newComplexities) => {
    setSelectedComplexities(newComplexities || []);
  };

  const handleProgressToggle = (event, newProgressFilters) => {
    setSelectedProgressFilters(newProgressFilters || []);
  };

  const handlePartsOfSpeechToggle = (event, newPartsOfSpeech) => {
    setSelectedPartsOfSpeech(newPartsOfSpeech || []);
  };

  const handleStartQuiz = () => {
    const quizWords = getQuizWords();
    if (quizWords.length === 0) {
      alert('No words available for the selected criteria. Please choose different options.');
      return;
    }

    const quizConfig = {
      words: quizWords,
      numberOfQuestions: Math.min(numberOfQuestions, quizWords.length),
      quizType: getQuizTypeLabel(),
      selectedLetters,
      selectedComplexities,
      selectedPartsOfSpeech,
      selectedProgressFilters
    };

    onStartQuiz(quizConfig);
  };

  const getQuizTypeLabel = () => {
    const filters = [];
    if (selectedLetters.length > 0) filters.push(`Letters: ${selectedLetters.join(', ')}`);
    if (selectedComplexities.length > 0) filters.push(`Difficulty: ${selectedComplexities.join(', ')}`);
    if (selectedPartsOfSpeech.length > 0) filters.push(`Types: ${selectedPartsOfSpeech.join(', ')}`);
    if (selectedProgressFilters.length > 0) filters.push(`Status: ${selectedProgressFilters.join(', ')}`);

    return filters.length > 0 ? `Filtered Quiz (${filters.join(' | ')})` : 'General Quiz';
  };

  const availableWords = getQuizWords();
  const maxQuestions = 10; // Always allow up to 10 questions
  const actualMaxQuestions = Math.min(availableWords.length, maxQuestions); // Actual limit based on available words
  const canStart = availableWords.length > 0;

  const availableLetters = getAvailableLetters();
  const availableComplexities = getAvailableComplexities();
  const availablePartsOfSpeech = getAvailablePartsOfSpeech();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Configure Your Quiz
        </Typography>

        {/* Filter Controls */}
        <FilterTemplate
          selectedProgressFilters={selectedProgressFilters}
          selectedLetters={selectedLetters}
          selectedComplexities={selectedComplexities}
          selectedPartsOfSpeech={selectedPartsOfSpeech}
          onProgressToggle={handleProgressToggle}
          onLetterToggle={handleLetterToggle}
          onComplexityToggle={handleComplexityToggle}
          onPartsOfSpeechToggle={handlePartsOfSpeechToggle}
          availableLetters={availableLetters}
          availableComplexities={availableComplexities}
          availablePartsOfSpeech={availablePartsOfSpeech}
          title="🔍 Filter Options"
        />

        {/* Selected Filters Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Selected Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedLetters.length > 0 && (
              <Chip
                label={`Letters: ${selectedLetters.join(', ')}`}
                color="secondary"
                variant="filled"
                size="small"
              />
            )}
            {selectedComplexities.length > 0 && (
              <Chip
                label={`Difficulty: ${selectedComplexities.join(', ')}`}
                color="warning"
                variant="filled"
                size="small"
              />
            )}
            {selectedProgressFilters.length > 0 && (
              <Chip
                label={`Status: ${selectedProgressFilters.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}`}
                color="primary"
                variant="filled"
                size="small"
              />
            )}
            {selectedPartsOfSpeech.length > 0 && (
              <Chip
                label={`Types: ${selectedPartsOfSpeech.join(', ')}`}
                color="info"
                variant="filled"
                size="small"
              />
            )}
            {selectedLetters.length === 0 && selectedComplexities.length === 0 &&
             selectedProgressFilters.length === 0 && selectedPartsOfSpeech.length === 0 && (
              <Chip
                label="All Words"
                color="default"
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          {!canStart && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              No words match your selected filters. Try adjusting your selection.
            </Typography>
          )}
        </Box>

        {/* Number of Questions - Compact */}
        <Paper sx={{ p: 2.5, border: '1px solid #e2e8f0' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <NumbersIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quiz Length: {numberOfQuestions} Question{numberOfQuestions !== 1 ? 's' : ''}
              </Typography>
            </Stack>

            {/* Estimated Time - Moved to top right */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ~{Math.max(1, Math.ceil(Math.min(numberOfQuestions, actualMaxQuestions) * 0.5))} min
              </Typography>
              <Chip
                label={numberOfQuestions <= 3 ? 'Quick' : numberOfQuestions <= 6 ? 'Standard' : 'Comprehensive'}
                size="small"
                color={numberOfQuestions <= 3 ? 'success' : numberOfQuestions <= 6 ? 'primary' : 'warning'}
              />
            </Box>
          </Stack>
          <Box sx={{ px: 1 }}>
            <Slider
              value={numberOfQuestions}
              onChange={(event, newValue) => {
                if (typeof newValue === 'number') {
                  handleQuestionCountChange(newValue);
                }
              }}
              min={1}
              max={maxQuestions}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 3, label: '3' },
                { value: 5, label: '5' },
                { value: 7, label: '7' },
                { value: 10, label: '10' },
              ]}
              valueLabelDisplay="auto"
              disabled={actualMaxQuestions === 0}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 20,
                  height: 20,
                  backgroundColor: 'primary.main',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'primary.main',
                },
                '& .MuiSlider-rail': {
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e2e8f0',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#94a3b8',
                  height: 8,
                  width: 2,
                },
                '& .MuiSlider-markActive': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          </Box>

          {/* Warning when not enough words */}
          {numberOfQuestions > actualMaxQuestions && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
              <Typography variant="body2" color="warning.dark">
                ⚠️ Only {actualMaxQuestions} words available for your selection.
                The quiz will use all available words ({actualMaxQuestions} questions).
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Quiz Summary - Simplified */}
        <Paper sx={{ mt: 3, p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📋 Quiz Summary
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {Math.min(numberOfQuestions, actualMaxQuestions)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
                  {availableWords.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'info.main' }}>
                  ~{Math.max(1, Math.ceil(numberOfQuestions * 0.5))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minutes
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                  {getQuizTypeLabel()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Start Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={handleStartQuiz}
            disabled={!canStart}
            sx={{
              minWidth: 250,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: canStart
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : undefined,
              '&:hover': canStart && {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              '&:active': canStart && {
                transform: 'translateY(0px)',
              },
            }}
          >
            Start {Math.min(numberOfQuestions, actualMaxQuestions)} Question Quiz
          </Button>

          {!canStart && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                ⚠️ No words available for the selected criteria
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try selecting different quiz options or add more words to your vocabulary
              </Typography>
            </Box>
          )}

          {canStart && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              🎯 Ready to test your knowledge? Good luck!
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizOptions;
