import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Fade,
  IconButton,
  Stack
} from '@mui/material';
import {
  Flip as FlipIcon
} from '@mui/icons-material';
import AudioButton from '../ui/AudioButton';
import { AUDIO_TYPES } from '../../services/AudioService';

/**
 * Flashcard Component
 * Displays a flippable card with word information
 */
const Flashcard = ({ word, isFlipped, onFlip }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      onFlip();
      setIsAnimating(false);
    }, 150);
  };

  const getFirstDefinition = () => {
    if (word.meanings && word.meanings.length > 0) {
      const firstMeaning = word.meanings[0];
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        return firstMeaning.definitions[0];
      }
    }
    return null;
  };

  const firstDefinition = getFirstDefinition();

  return (
    <Box sx={{ perspective: '1000px', width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Card
        sx={{
          minHeight: 400,
          cursor: 'pointer',
          transition: 'transform 0.3s ease-in-out',
          transform: isAnimating ? 'rotateY(90deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          '&:hover': {
            boxShadow: 6,
          }
        }}
        onClick={handleFlip}
      >
        <CardContent sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          p: 4,
          position: 'relative'
        }}>
          {/* Flip Icon */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              opacity: 0.6,
              '&:hover': { opacity: 1 }
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleFlip();
            }}
          >
            <FlipIcon />
          </IconButton>

          <Fade in={!isAnimating} timeout={300}>
            <Box sx={{ width: '100%' }}>
              {!isFlipped ? (
                // Front of card - Show word
                <Box>
                  <Typography 
                    variant="h2" 
                    component="div" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 3
                    }}
                  >
                    {word.word}
                  </Typography>

                  {/* Pronunciation */}
                  {word.phonetic_respelling && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mr: 1 }}>
                        /{word.phonetic_respelling}/
                      </Typography>
                      <AudioButton
                        word={word.word}
                        type={AUDIO_TYPES.PRONUNCIATION}
                        variant="icon"
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  )}

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip label={word.letter} variant="outlined" />
                    {word.complexity && (
                      <Chip 
                        label={word.complexity} 
                        color={word.complexity === 'Advanced' ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    )}
                    {word.meanings && word.meanings[0] && (
                      <Chip 
                        label={word.meanings[0].part_of_speech} 
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                    Click to see definition
                  </Typography>
                </Box>
              ) : (
                // Back of card - Show definition and details
                <Box>
                  <Typography variant="h4" gutterBottom color="primary.main">
                    {word.word}
                  </Typography>

                  {/* Part of Speech */}
                  {word.meanings && word.meanings[0] && (
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      {word.meanings[0].part_of_speech}
                    </Typography>
                  )}

                  {/* Definition */}
                  {firstDefinition && (
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {firstDefinition.definition}
                    </Typography>
                  )}

                  {/* Example */}
                  {firstDefinition && firstDefinition.example && (
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontStyle="italic">
                            <strong>Example:</strong> "{firstDefinition.example}"
                          </Typography>
                        </Box>
                        <AudioButton
                          word={word.word}
                          type={AUDIO_TYPES.EXAMPLE}
                          variant="compact"
                          size="small"
                          color="primary"
                        />
                      </Stack>
                    </Paper>
                  )}

                  {/* Synonyms */}
                  {firstDefinition && firstDefinition.synonyms && firstDefinition.synonyms.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Synonyms:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                        {firstDefinition.synonyms.slice(0, 4).map((synonym, index) => (
                          <Chip 
                            key={index} 
                            label={synonym} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Word Origin (if available and short) */}
                  {word.word_origin && word.word_origin.length < 150 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      <strong>Origin:</strong> {word.word_origin}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                    Click to see word again
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Flashcard;
