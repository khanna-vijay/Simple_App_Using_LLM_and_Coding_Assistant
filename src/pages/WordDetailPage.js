import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBackIos as ArrowBackIosIcon
} from '@mui/icons-material';
import AudioButton from '../components/ui/AudioButton';
import { AUDIO_TYPES } from '../services/AudioService';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';
import { useFontSize } from '../context/FontSizeContext';

/**
 * Word Detail Page Component
 * Displays comprehensive information about a single word
 */
const WordDetailPage = () => {
  const { word: wordParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getWordByName, words } = useDictionary();
  const {
    isWordKnown,
    isWordStruggled,
    markAsKnown,
    markAsNeedsPractice,
    removeKnownWord,
    removeStruggledWord
  } = useUserProgressContext();
  const { fontSize } = useFontSize();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageRef = useRef(null);

  // Navigation state from WordTrainingPage
  const wordList = location.state?.wordList || [];
  const currentIndex = location.state?.currentIndex || 0;

  // Define handler functions first
  const handleKnownToggle = () => {
    if (!word) return;
    if (isWordKnown(word.word)) {
      removeKnownWord(word.word);
    } else {
      markAsKnown(word.word);
    }
  };

  const handleStruggledToggle = () => {
    if (!word) return;
    if (isWordStruggled(word.word)) {
      removeStruggledWord(word.word);
    } else {
      markAsNeedsPractice(word.word);
    }
  };

  // Navigation functions
  const navigateToWord = (index) => {
    if (wordList.length === 0 || index < 0 || index >= wordList.length) return;

    const targetWord = wordList[index];
    navigate(`/training/${encodeURIComponent(targetWord.word)}`, {
      state: {
        wordList,
        currentIndex: index,
        searchQuery: location.state?.searchQuery,
        selectedLetter: location.state?.selectedLetter,
        selectedComplexity: location.state?.selectedComplexity
      },
      replace: true
    });
  };

  const goToNextWord = () => {
    if (currentIndex < wordList.length - 1) {
      navigateToWord(currentIndex + 1);
    }
  };

  const goToPreviousWord = () => {
    if (currentIndex > 0) {
      navigateToWord(currentIndex - 1);
    }
  };

  useEffect(() => {
    const loadWord = async () => {
      try {
        setLoading(true);
        setError(null);

        const decodedWordParam = decodeURIComponent(wordParam);
        console.log(`Loading word: "${decodedWordParam}"`);

        // First try database lookup
        let wordData = await getWordByName(decodedWordParam);

        // If not found in database, try in-memory words (fallback)
        if (!wordData && words && words.length > 0) {
          console.log('Database lookup failed, trying in-memory words...');
          wordData = words.find(word =>
            word.word && word.word.toLowerCase() === decodedWordParam.toLowerCase()
          );

          if (wordData) {
            console.log('Found word in in-memory array:', wordData);
          }
        }

        setWord(wordData);

        if (!wordData) {
          console.log(`Word "${decodedWordParam}" not found in database or memory`);
        }

      } catch (err) {
        console.error('Error loading word:', err);
        setError('Failed to load word data');
      } finally {
        setLoading(false);
      }
    };

    if (wordParam) {
      loadWord();
    }
  }, [wordParam, getWordByName, words]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Prevent keyboard shortcuts when user is typing in input fields
      if (event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.isContentEditable) {
        return;
      }

      // Prevent shortcuts if any modal or dialog is open
      if (document.querySelector('[role="dialog"]') ||
          document.querySelector('.MuiModal-root') ||
          document.querySelector('.MuiPopover-root')) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          event.stopPropagation();
          handleKnownToggle();
          break;
        case 'p':
          event.preventDefault();
          event.stopPropagation();
          handleStruggledToggle();
          break;
        case 'arrowright':
        case 'j':
        case 'n':
          if (wordList.length > 0 && currentIndex < wordList.length - 1) {
            event.preventDefault();
            event.stopPropagation();
            goToNextWord();
          }
          break;
        case 'arrowleft':
        case 'h':
        case 'v':
          if (wordList.length > 0 && currentIndex > 0) {
            event.preventDefault();
            event.stopPropagation();
            goToPreviousWord();
          }
          break;
        case 'b':
        case 'escape':
          event.preventDefault();
          event.stopPropagation();
          navigate('/training');
          break;
        default:
          break;
      }
    };

    // Add event listener with capture to ensure it works
    document.addEventListener('keydown', handleKeyPress, true);
    return () => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [handleKnownToggle, handleStruggledToggle, navigate, goToNextWord, goToPreviousWord, wordList, currentIndex]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (pageRef.current && !loading) {
      // Focus the page container to ensure keyboard events are captured
      pageRef.current.focus();
    }
  }, [loading, word]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading word details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom color="error">
          Error Loading Word
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/training')}
        >
          Back to Word Training
        </Button>
      </Box>
    );
  }

  if (!word) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Word Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The word "{wordParam}" was not found in our dictionary.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/training')}
        >
          Back to Word Training
        </Button>
      </Box>
    );
  }

  const known = isWordKnown(word.word);
  const struggled = isWordStruggled(word.word);

  return (
    <Box
      ref={pageRef}
      tabIndex={-1}
      sx={{
        fontSize: `${fontSize}rem`,
        outline: 'none',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Sticky Header - Navigation and Word Info */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
        mb: 2
      }}>
        {/* Navigation Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/training')}
          >
            Back to Word Training
          </Button>

          {wordList.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIosIcon />}
                onClick={goToPreviousWord}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                {currentIndex + 1} of {wordList.length}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={goToNextWord}
                disabled={currentIndex === wordList.length - 1}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>

        {/* Word Header - Compact for sticky header */}
        <Box sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'primary.light',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Left side - Word, Pronunciation, and Audio */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {word.word}
              </Typography>
              {word.phonetic_respelling && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.95rem'
                  }}
                >
                  /{word.phonetic_respelling}/
                </Typography>
              )}

              {/* Audio Buttons - compact */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                  borderRadius: 1.5,
                  boxShadow: '0 1px 4px rgba(76, 175, 80, 0.15)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <AudioButton
                    word={word.word}
                    type={AUDIO_TYPES.PRONUNCIATION}
                    variant="button"
                    size="small"
                    showLabel={true}
                    sx={{
                      fontSize: '0.75rem',
                      color: '#2e7d32',
                      minWidth: 'auto',
                      px: 1
                    }}
                  />
                </Box>
                <Box sx={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)',
                  borderRadius: 1.5,
                  boxShadow: '0 1px 4px rgba(33, 150, 243, 0.15)',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <AudioButton
                    word={word.word}
                    type={AUDIO_TYPES.EXAMPLE}
                    variant="button"
                    size="small"
                    showLabel={true}
                    sx={{
                      fontSize: '0.75rem',
                      color: '#1976d2',
                      minWidth: 'auto',
                      px: 1
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Right side - Compact action buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {word.complexity && (
                <Chip
                  label={word.complexity}
                  color={word.complexity === 'Advanced' ? 'error' : 'warning'}
                  variant="outlined"
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              <Button
                variant={known ? "contained" : "outlined"}
                color="success"
                startIcon={known ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={handleKnownToggle}
                size="small"
                title="Press 'K' to toggle"
                sx={{ fontSize: '0.75rem' }}
              >
                {known ? 'Mastered' : 'Master'} (K)
              </Button>
              <Button
                variant={struggled ? "contained" : "outlined"}
                color="warning"
                startIcon={<WarningIcon />}
                onClick={handleStruggledToggle}
                size="small"
                title="Press 'P' to toggle"
                sx={{ fontSize: '0.75rem' }}
              >
                {struggled ? 'Practice' : 'Practice'} (P)
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        pr: 1 // Add some padding for scrollbar
      }}>

      {/* Word Meanings */}
      {word.meanings && word.meanings.map((meaning, meaningIndex) => (
        <Card key={meaningIndex} sx={{
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.light',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1.5
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {meaning.part_of_speech}
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>

            {meaning.definitions && meaning.definitions.map((definition, defIndex) => (
              <Box key={defIndex} sx={{
                mb: 2,
                p: 3,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                {meaning.definitions.length > 1 && (
                  <Typography variant="subtitle1" gutterBottom sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: '1rem'
                  }}>
                    Definition {defIndex + 1}
                  </Typography>
                )}

                <Typography variant="body1" sx={{
                  mb: 2,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'text.primary'
                }}>
                  {definition.definition}
                </Typography>

                {/* Example */}
                {definition.example && (
                  <Box sx={{
                    mt: 1.5,
                    mb: 1.5,
                    px: 2,
                    py: 1.5,
                    backgroundColor: 'info.50',
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderLeftColor: 'info.main'
                  }}>
                    <Typography variant="body2" sx={{
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      fontSize: '0.95rem'
                    }}>
                      <strong style={{ color: '#0288d1' }}>Example:</strong> "{definition.example}"
                    </Typography>
                  </Box>
                )}

                {/* Synonyms, Antonyms, and Verb Forms - Combined */}
                {(definition.synonyms?.length > 0 || definition.antonyms?.length > 0 || meaning.verb_forms) && (
                  <Box sx={{
                    mt: 2,
                    p: 2.5,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {/* Synonyms */}
                      {definition.synonyms && definition.synonyms.length > 0 && (
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'info.main',
                            fontSize: '0.9rem'
                          }}>
                            Synonyms
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {definition.synonyms.slice(0, 4).map((synonym, index) => (
                              <Chip
                                key={index}
                                label={synonym}
                                size="small"
                                variant="outlined"
                                color="info"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.8rem',
                                  height: 24
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Antonyms */}
                      {definition.antonyms && definition.antonyms.length > 0 && (
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: '#5d4037',
                            fontSize: '0.9rem'
                          }}>
                            Antonyms
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {definition.antonyms.slice(0, 4).map((antonym, index) => (
                              <Chip
                                key={index}
                                label={antonym}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.8rem',
                                  height: 24,
                                  color: '#5d4037',
                                  borderColor: '#5d4037',
                                  '&:hover': {
                                    backgroundColor: 'rgba(93, 64, 55, 0.04)',
                                    borderColor: '#4e342e'
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Verb Forms */}
                      {meaning.verb_forms && (
                        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: '#ad1457',
                            fontSize: '0.9rem'
                          }}>
                            Verb Forms
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Object.entries(meaning.verb_forms).map(([form, value]) => (
                              <Box
                                key={form}
                                sx={{
                                  display: 'inline-flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  backgroundColor: 'transparent',
                                  borderRadius: 1.5,
                                  px: 1.5,
                                  py: 0.5,
                                  border: '1px solid',
                                  borderColor: '#ad1457',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  minWidth: 60,
                                  '&:hover': {
                                    backgroundColor: 'rgba(173, 20, 87, 0.04)',
                                    borderColor: '#880e4f'
                                  }
                                }}
                              >
                                <Typography variant="caption" sx={{
                                  fontSize: '0.7rem',
                                  color: '#ad1457',
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                  lineHeight: 1
                                }}>
                                  {form.replace('_', ' ')}
                                </Typography>
                                <Typography variant="caption" sx={{
                                  fontWeight: 600,
                                  color: '#ad1457',
                                  fontSize: '0.75rem',
                                  lineHeight: 1
                                }}>
                                  {value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {defIndex < meaning.definitions.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}


          </CardContent>
        </Card>
      ))}

      {/* Word Origin */}
      {word.word_origin && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ pb: 2 }}>
            <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 1 }}>
              Word Origin
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {word.word_origin}
            </Typography>

            {/* Word Roots */}
            {word.word_roots && word.word_roots.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'inline', fontWeight: 600, mr: 1 }}>
                  Word Roots:
                </Typography>
                <Box sx={{ display: 'inline' }}>
                  {word.word_roots.map((root, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'inline' }}>
                      <strong>{root.root}:</strong> {root.meaning}
                      {index < word.word_roots.length - 1 && '; '}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Box sx={{
        mt: 3,
        p: 2.5,
        backgroundColor: 'info.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'info.light',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="subtitle2" sx={{
          fontWeight: 600,
          mb: 1,
          color: 'info.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          ⌨️ Keyboard Shortcuts
          {wordList.length > 0 && (
            <Chip
              label={`${currentIndex + 1} of ${wordList.length}`}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="K" size="small" variant="outlined" sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }} />
            <Typography variant="caption">Toggle Mastered</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="P" size="small" variant="outlined" sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }} />
            <Typography variant="caption">Toggle Practice</Typography>
          </Box>
          {wordList.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip label="←/H" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem' }} />
                <Typography variant="caption">Previous Word</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip label="→/J" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem' }} />
                <Typography variant="caption">Next Word</Typography>
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label="B/Esc" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem' }} />
            <Typography variant="caption">Back to Training</Typography>
          </Box>
        </Box>
      </Box>
      </Box> {/* Close scrollable content area */}
    </Box>
  );
};

export default WordDetailPage;
