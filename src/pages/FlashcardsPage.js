import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';
import { useFontSize } from '../context/FontSizeContext';
import DeckOptions from '../components/flashcards/DeckOptions';
import Flashcard from '../components/flashcards/Flashcard';
import FlashcardControls from '../components/flashcards/FlashcardControls';

/**
 * Flashcards Page Component
 * Main flashcard learning interface
 */
const FlashcardsPage = () => {
  const { loading } = useDictionary();
  const { markAsKnown, markAsNeedsPractice, isWordKnown, isWordStruggled } = useUserProgressContext();
  const { fontSize } = useFontSize();

  const [currentDeck, setCurrentDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event) => {
    if (!currentDeck) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleNext();
        break;
      case ' ':
        event.preventDefault();
        handleFlip();
        break;
      case 'k':
      case 'K':
        event.preventDefault();
        handleMarkKnown();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        handleMarkNeedsPractice();
        break;
      default:
        break;
    }
  }, [currentDeck, currentIndex, isFlipped]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleStartDeck = (deckWords) => {
    setCurrentDeck(deckWords);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkKnown = () => {
    if (currentDeck && currentDeck[currentIndex]) {
      markAsKnown(currentDeck[currentIndex].word);
    }
  };

  const handleMarkNeedsPractice = () => {
    if (currentDeck && currentDeck[currentIndex]) {
      markAsNeedsPractice(currentDeck[currentIndex].word);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleExit = () => {
    setCurrentDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Flashcards...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ fontSize: `${fontSize}rem` }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Flashcards
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Practice vocabulary with interactive flashcards
      </Typography>

      {!currentDeck ? (
        // Show deck selection
        <DeckOptions onStartDeck={handleStartDeck} />
      ) : (
        // Show flashcard interface
        <Box>
          <Flashcard
            word={currentDeck[currentIndex]}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />

          <FlashcardControls
            currentIndex={currentIndex}
            totalCards={currentDeck.length}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onMarkKnown={handleMarkKnown}
            onMarkNeedsPractice={handleMarkNeedsPractice}
            onRestart={handleRestart}
            onExit={handleExit}
            currentWord={currentDeck[currentIndex]}
            isWordKnown={isWordKnown}
            isWordStruggled={isWordStruggled}
          />
        </Box>
      )}
    </Box>
  );
};

export default FlashcardsPage;
