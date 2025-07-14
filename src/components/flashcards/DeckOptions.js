import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as KnownIcon,
  Warning as PracticeIcon,
  School as AdvancedIcon
} from '@mui/icons-material';
import { useDictionary } from '../../context/DictionaryContext';
import { useUserProgressContext } from '../../context/UserProgressContext';
import FilterTemplate from '../common/FilterTemplate';
import { getWordsByLetter, getWordsByComplexity } from '../../services/DictionaryService';

/**
 * Deck Options Component
 * Allows users to configure flashcard deck settings
 */
const DeckOptions = ({ onStartDeck }) => {
  const { words, getAvailableLetters, getAvailableComplexities, getAvailablePartsOfSpeech } = useDictionary();
  const { struggledWords, knownWords } = useUserProgressContext();

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);
  const [selectedProgressFilters, setSelectedProgressFilters] = useState([]);
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState([]);

  const getDeckWords = () => {
    let deckWords = [...words];

    // Apply letter filters
    if (selectedLetters.length > 0) {
      deckWords = deckWords.filter(word =>
        selectedLetters.includes(word.letter || word.word[0].toUpperCase())
      );
    }

    // Apply complexity filters
    if (selectedComplexities.length > 0) {
      deckWords = deckWords.filter(word =>
        selectedComplexities.includes(word.complexity || word.difficulty)
      );
    }

    // Apply part of speech filters
    if (selectedPartsOfSpeech.length > 0) {
      deckWords = deckWords.filter(word => {
        // Check meanings array for part_of_speech
        if (word.meanings && word.meanings.length > 0) {
          return word.meanings.some(meaning =>
            selectedPartsOfSpeech.includes(meaning.part_of_speech)
          );
        }
        // Check direct partOfSpeech field
        if (word.partOfSpeech) {
          return selectedPartsOfSpeech.includes(word.partOfSpeech);
        }
        return false;
      });
    }

    // Apply progress filters
    if (selectedProgressFilters.length > 0) {
      deckWords = deckWords.filter(word => {
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

    // Shuffle the deck for variety
    return shuffleArray([...deckWords]);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

  const handleStartDeck = () => {
    const deckWords = getDeckWords();
    if (deckWords.length === 0) {
      alert('No words available for the selected criteria. Please choose different options.');
      return;
    }
    onStartDeck(deckWords);
  };

  const deckWords = getDeckWords();
  const canStart = deckWords.length > 0;

  const availableLetters = getAvailableLetters();
  const availableComplexities = getAvailableComplexities();
  const availablePartsOfSpeech = getAvailablePartsOfSpeech();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🎴 Choose Your Flashcard Deck
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Mix and match filters to create your perfect study deck
        </Typography>

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
          showTitle={false}
        />

        {/* Deck Preview */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            📋 Deck Preview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`${deckWords.length} words`}
              color={canStart ? 'primary' : 'default'}
              size="medium"
              sx={{ fontWeight: 600 }}
              variant="outlined"
            />

            {/* Active Filter Chips */}
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
                color="info"
                variant="filled"
                size="small"
              />
            )}
            {selectedPartsOfSpeech.length > 0 && (
              <Chip
                label={`Part of Speech: ${selectedPartsOfSpeech.join(', ')}`}
                color="success"
                variant="filled"
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

        {/* Start Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={handleStartDeck}
            disabled={!canStart}
            sx={{
              minWidth: 200,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            Start Flashcards ({deckWords.length} words)
          </Button>
          {!canStart && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              No words available for the selected criteria
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeckOptions;
