import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  CheckCircle as KnownIcon,
  Warning as NeedsPracticeIcon,
  Flip as FlipIcon,
  Home as HomeIcon,
  Refresh as RestartIcon
} from '@mui/icons-material';

/**
 * Flashcard Controls Component
 * Provides navigation and action controls for flashcards
 */
const FlashcardControls = ({
  currentIndex,
  totalCards,
  isFlipped,
  onFlip,
  onPrevious,
  onNext,
  onMarkKnown,
  onMarkNeedsPractice,
  onRestart,
  onExit,
  currentWord,
  isWordKnown,
  isWordStruggled
}) => {
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <Box sx={{ mt: 3 }}>
      {/* Progress Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Card {currentIndex + 1} of {totalCards}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Word Status */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        {isWordKnown(currentWord?.word) && (
          <Chip
            label="Mastered"
            color="success"
            icon={<KnownIcon />}
            variant="filled"
          />
        )}
        {isWordStruggled(currentWord?.word) && (
          <Chip 
            label="Struggling" 
            color="warning" 
            icon={<NeedsPracticeIcon />}
            variant="filled"
          />
        )}
      </Box>

      {/* Main Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {/* Previous Button */}
        <IconButton
          onClick={onPrevious}
          disabled={currentIndex === 0}
          size="large"
          sx={{
            backgroundColor: 'action.hover',
            '&:hover': { backgroundColor: 'action.selected' }
          }}
        >
          <PrevIcon />
        </IconButton>

        {/* Flip Button */}
        <Button
          variant="outlined"
          startIcon={<FlipIcon />}
          onClick={onFlip}
          sx={{ minWidth: 120 }}
        >
          {isFlipped ? 'Show Word' : 'Show Definition'}
        </Button>

        {/* Next Button */}
        <IconButton
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          size="large"
          sx={{
            backgroundColor: 'action.hover',
            '&:hover': { backgroundColor: 'action.selected' }
          }}
        >
          <NextIcon />
        </IconButton>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant={isWordKnown(currentWord?.word) ? "contained" : "outlined"}
          color="success"
          startIcon={<KnownIcon />}
          onClick={() => onMarkKnown(currentWord)}
          sx={{ minWidth: 140 }}
        >
          {isWordKnown(currentWord?.word) ? 'Mastered ✓' : 'Mark as Mastered'}
        </Button>

        <Button
          variant={isWordStruggled(currentWord?.word) ? "contained" : "outlined"}
          color="warning"
          startIcon={<NeedsPracticeIcon />}
          onClick={() => onMarkNeedsPractice(currentWord)}
          sx={{ minWidth: 160 }}
        >
          {isWordStruggled(currentWord?.word) ? 'Struggling ⚠' : 'Needs Practice'}
        </Button>
      </Box>

      {/* Session Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="text"
          startIcon={<RestartIcon />}
          onClick={onRestart}
          color="primary"
        >
          Restart Deck
        </Button>

        <Button
          variant="text"
          startIcon={<HomeIcon />}
          onClick={onExit}
          color="secondary"
        >
          Exit to Menu
        </Button>
      </Box>

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Keyboard shortcuts: ← Previous | → Next | Space Flip | K Mastered | P Practice
        </Typography>
      </Box>
    </Box>
  );
};

export default FlashcardControls;
