import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  SearchOff as NoResultsIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Style as FlashcardIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';

/**
 * Empty State Component
 * Provides consistent empty states with appropriate messaging and actions
 */
const EmptyState = ({
  type = 'general',
  title,
  message,
  actionText,
  onAction,
  icon: CustomIcon,
  variant = 'default'
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: NoResultsIcon,
          title: 'No Results Found',
          message: 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionText: 'Clear Filters'
        };
      case 'struggled-words':
        return {
          icon: ProgressIcon,
          title: 'No Struggled Words Yet',
          message: 'Great job! You haven\'t marked any words as struggling. Take a quiz to identify areas for improvement.',
          actionText: 'Take a Quiz'
        };
      case 'quiz-history':
        return {
          icon: QuizIcon,
          title: 'No Quiz History',
          message: 'You haven\'t taken any quizzes yet. Start your learning journey by taking your first quiz!',
          actionText: 'Start Quiz'
        };
      case 'known-words':
        return {
          icon: SchoolIcon,
          title: 'No Mastered Words Yet',
          message: 'Start learning by exploring words and marking the ones you have mastered.',
          actionText: 'Explore Words'
        };
      case 'flashcards':
        return {
          icon: FlashcardIcon,
          title: 'No Flashcards Available',
          message: 'No words match your current selection criteria. Try choosing different options.',
          actionText: 'Change Selection'
        };
      default:
        return {
          icon: SchoolIcon,
          title: 'Nothing Here Yet',
          message: 'Start your learning journey and content will appear here.',
          actionText: 'Get Started'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const IconComponent = CustomIcon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayActionText = actionText || defaultContent.actionText;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        minHeight: variant === 'fullHeight' ? '50vh' : 'auto'
      }}
    >
      <IconComponent
        sx={{
          fontSize: 80,
          color: 'text.secondary',
          mb: 2,
          opacity: 0.6
        }}
      />
      
      <Typography variant="h5" gutterBottom color="text.primary">
        {displayTitle}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={{ maxWidth: 400, lineHeight: 1.6 }}
      >
        {displayMessage}
      </Typography>
      
      {onAction && displayActionText && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {displayActionText}
        </Button>
      )}
    </Box>
  );

  if (variant === 'card') {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

export default EmptyState;
