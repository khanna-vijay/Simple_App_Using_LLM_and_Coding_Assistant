import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CheckCircle as KnownIcon,
  Warning as PracticeIcon,
  FiberNew as NewIcon
} from '@mui/icons-material';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';
import { useFontSize } from '../context/FontSizeContext';
import { getWordsByLetter, getWordsByComplexity } from '../services/DictionaryService';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../utils/performance';
import EmptyState from '../components/ui/EmptyState';
import FilterTemplate from '../components/common/FilterTemplate';

/**
 * Word Training Page Component
 * Provides searchable list of all words with filtering options
 */
const WordTrainingPage = () => {
  const navigate = useNavigate();
  const { loading, searchWords, databaseService } = useDictionary();
  const { isWordKnown, isWordStruggled, knownWords, struggledWords } = useUserProgressContext();
  const { fontSize } = useFontSize();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);
  const [selectedProgressFilters, setSelectedProgressFilters] = useState([]);
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState([]);
  const [dbSearchResults, setDbSearchResults] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);

  // Load all words from database
  useEffect(() => {
    const loadAllWords = async () => {
      try {
        setWordsLoading(true);
        console.log('Loading all words from database...');

        // Get all words from database (no limit)
        const wordsData = await databaseService.getAllWords(0, 10000); // Large limit to get all
        console.log(`Loaded ${wordsData.words.length} words from database`);

        setAllWords(wordsData.words);
      } catch (error) {
        console.error('Error loading all words:', error);
        setAllWords([]);
      } finally {
        setWordsLoading(false);
      }
    };

    if (!loading && databaseService) {
      loadAllWords();
    }
  }, [loading, databaseService]);



  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      setDebouncedSearchQuery(query);
      if (query.trim()) {
        try {
          const results = await searchWords(query, 100);
          setDbSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setDbSearchResults([]);
        }
      } else {
        setDbSearchResults([]);
      }
    }, 300),
    [searchWords]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Filter words based on search and filters
  const filteredWords = useMemo(() => {
    // If there's a search query, use database search results
    if (debouncedSearchQuery.trim()) {
      let result = dbSearchResults;

      // Apply letter filters to search results
      if (selectedLetters.length > 0) {
        result = result.filter(word =>
          selectedLetters.includes(word.letter || word.word[0].toUpperCase())
        );
      }

      // Apply complexity filters to search results
      if (selectedComplexities.length > 0) {
        result = result.filter(word =>
          selectedComplexities.includes(word.complexity || word.difficulty)
        );
      }

      // Apply part of speech filters
      if (selectedPartsOfSpeech.length > 0) {
        result = result.filter(word => {
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
        result = result.filter(word => {
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

      return result;
    }

    // No search query, use loaded words with filters
    let result = allWords;

    // Apply letter filters
    if (selectedLetters.length > 0) {
      result = result.filter(word =>
        selectedLetters.includes(word.letter || word.word[0].toUpperCase())
      );
    }

    // Apply complexity filters
    if (selectedComplexities.length > 0) {
      result = result.filter(word =>
        selectedComplexities.includes(word.complexity || word.difficulty)
      );
    }

    // Apply part of speech filters
    if (selectedPartsOfSpeech.length > 0) {
      result = result.filter(word => {
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
      result = result.filter(word => {
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

    return result;
  }, [allWords, dbSearchResults, debouncedSearchQuery, selectedLetters, selectedComplexities, selectedPartsOfSpeech, selectedProgressFilters, knownWords, struggledWords]);

  // Handle word click navigation
  const handleWordClick = useCallback((word) => {
    const wordIndex = filteredWords.findIndex(w => w.word === word.word);
    navigate(`/training/${encodeURIComponent(word.word)}`, {
      state: {
        wordList: filteredWords,
        currentIndex: wordIndex,
        searchQuery: debouncedSearchQuery,
        selectedLetters,
        selectedComplexities,
        selectedPartsOfSpeech,
        selectedProgressFilters
      }
    });
  }, [navigate, filteredWords, debouncedSearchQuery, selectedLetters, selectedComplexities, selectedPartsOfSpeech, selectedProgressFilters]);

  // Reset selected index when filtered words change
  useEffect(() => {
    setSelectedWordIndex(0);
  }, [filteredWords]);

  // Keyboard navigation for word selection
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Prevent keyboard shortcuts when user is typing
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Safely access filteredWords - it should be defined by now due to dependency order
      if (!filteredWords || filteredWords.length === 0) return;

      switch (event.key.toLowerCase()) {
        case 'arrowright':
        case 'j':
          event.preventDefault();
          setSelectedWordIndex(prev => Math.min(prev + 1, filteredWords.length - 1));
          break;
        case 'arrowleft':
        case 'h':
          event.preventDefault();
          setSelectedWordIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'arrowdown':
        case 'k':
          event.preventDefault();
          setSelectedWordIndex(prev => Math.min(prev + 6, filteredWords.length - 1)); // Move down a row (assuming 6 cards per row)
          break;
        case 'arrowup':
        case 'i':
          event.preventDefault();
          setSelectedWordIndex(prev => Math.max(prev - 6, 0)); // Move up a row
          break;
        case 'enter':
        case ' ':
          event.preventDefault();
          if (filteredWords[selectedWordIndex]) {
            handleWordClick(filteredWords[selectedWordIndex]);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredWords, selectedWordIndex, handleWordClick]);

  // Get available letters from all words
  const getAvailableLetters = () => {
    const letters = new Set(allWords.map(word => word.letter || word.word[0].toUpperCase()));
    return Array.from(letters).sort();
  };

  // Get available complexities from all words
  const getAvailableComplexities = () => {
    const complexities = new Set(allWords.map(word => word.complexity || word.difficulty).filter(Boolean));
    return Array.from(complexities).sort();
  };

  // Get available parts of speech from all words
  const getAvailablePartsOfSpeech = () => {
    const partsOfSpeech = new Set();
    allWords.forEach(word => {
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

  const getWordStatus = (word) => {
    if (isWordKnown(word.word)) return 'known';
    if (isWordStruggled(word.word)) return 'struggled';
    return 'neutral';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'known': return 'success';
      case 'struggled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'known': return 'Mastered';
      case 'struggled': return 'Struggling';
      default: return null;
    }
  };

  if (loading || wordsLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Loading Word Training...
        </Typography>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {wordsLoading ? 'Loading all words from database...' : 'Initializing...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ fontSize: `${fontSize}rem` }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🎯 Word Training
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Browse, search, and explore our comprehensive vocabulary collection of {allWords.length} words
          </Typography>
        </Box>


      </Box>

      {/* Search Controls */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search words or definitions..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

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
        availableLetters={getAvailableLetters()}
        availableComplexities={getAvailableComplexities()}
        availablePartsOfSpeech={getAvailablePartsOfSpeech()}
        title="🔍 Filter Options"
      />

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredWords.length} words
        {searchQuery && ` for "${searchQuery}"`}
        {selectedLetters.length > 0 && ` • Letters: ${selectedLetters.join(', ')}`}
        {selectedComplexities.length > 0 && ` • Levels: ${selectedComplexities.join(', ')}`}
        {selectedPartsOfSpeech.length > 0 && ` • Types: ${selectedPartsOfSpeech.join(', ')}`}
        {selectedProgressFilters.length > 0 && ` • Status: ${selectedProgressFilters.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}`}
      </Typography>

      {/* Word List */}
      <Grid container spacing={2}>
        {filteredWords.map((word, index) => {
          const status = getWordStatus(word);
          const statusLabel = getStatusLabel(status);
          const firstDefinition = word.meanings?.[0]?.definitions?.[0]?.definition || 'No definition available';

          const isSelected = index === selectedWordIndex;

          return (
            <Grid item xs={12} sm={6} md={4} key={`${word.word}-${index}`}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  boxShadow: isSelected ? 4 : 1,
                  border: isSelected ? '2px solid' : '1px solid transparent',
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  fontSize: `${fontSize}rem`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleWordClick(word)}
                  sx={{ height: '100%', alignItems: 'flex-start' }}
                >
                  <CardContent>
                    {/* Word Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontSize: `${fontSize * 1.2}rem` }}>
                        {word.word}
                      </Typography>
                      {statusLabel && (
                        <Chip
                          label={statusLabel}
                          size="small"
                          color={getStatusColor(status)}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Pronunciation */}
                    {word.phonetic_respelling && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: `${fontSize * 0.9}rem` }}>
                        /{word.phonetic_respelling}/
                      </Typography>
                    )}

                    {/* Definition Preview */}
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {firstDefinition.length > 100 
                        ? `${firstDefinition.substring(0, 100)}...` 
                        : firstDefinition}
                    </Typography>

                    {/* Metadata */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={word.letter} size="small" variant="outlined" />
                      {word.complexity && (
                        <Chip 
                          label={word.complexity} 
                          size="small" 
                          variant="outlined"
                          color={word.complexity === 'Advanced' ? 'error' : 'warning'}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* No Results Message */}
      {filteredWords.length === 0 && (
        <EmptyState
          type="search"
          onAction={() => {
            setSearchQuery('');
            setDebouncedSearchQuery('');
            setSelectedLetters([]);
            setSelectedComplexities([]);
            setSelectedPartsOfSpeech([]);
            setSelectedProgressFilters([]);
          }}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          ⌨️ Keyboard Shortcuts:
          <strong> ←/H</strong> - Previous |
          <strong> →/J</strong> - Next |
          <strong> ↑/I</strong> - Up Row |
          <strong> ↓/K</strong> - Down Row |
          <strong> Enter/Space</strong> - Open Word |
          <strong> +/-</strong> - Font Size |
          <strong> 0</strong> - Reset Font
        </Typography>
      </Box>
    </Box>
  );
};

export default WordTrainingPage;
