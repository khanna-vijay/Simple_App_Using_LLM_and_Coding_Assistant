import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDictionary } from '../services/DictionaryService';
import dictionaryDatabaseService from '../services/DictionaryDatabaseService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * Dictionary Context - Provides dictionary data to the entire application
 */
const DictionaryContext = createContext();

/**
 * Custom hook to use the Dictionary Context
 * @returns {Object} Dictionary context value
 */
export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};

/**
 * Dictionary Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const DictionaryProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const initializeDictionary = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setLoadingMessage('Initializing dictionary database...');

        console.log('Initializing dictionary database...');

        // Check if dictionary data is already loaded
        setLoadingProgress(5);
        const metadata = await dictionaryDatabaseService.getMetadata('dataLoaded');
        const dataSource = await dictionaryDatabaseService.getMetadata('dataSource');

        if (metadata && metadata.value) {
          console.log('Dictionary data already loaded from:', dataSource?.value || 'unknown');
          setLoadingMessage('Dictionary data found in database');
          setLoadingProgress(50);
        } else {
          console.log('No dictionary data found - manual import required');
          setLoadingMessage('No dictionary data found - use Admin Panel to import');
          setLoadingProgress(20);
        }

        // Get all words from database for Flash Cards
        setLoadingMessage('Loading words...');
        setLoadingProgress(95);
        const wordsData = await dictionaryDatabaseService.getAllWords(0, 10000); // Load all words
        setWords(wordsData.words);

        // Load categories
        setLoadingMessage('Loading categories...');
        setLoadingProgress(97);
        const categoriesData = await dictionaryDatabaseService.getAllCategories();
        setCategories(categoriesData);

        // Get database statistics
        setLoadingMessage('Getting statistics...');
        setLoadingProgress(99);
        const stats = await dictionaryDatabaseService.getStatistics();
        setDbStats(stats);

        setLoadingMessage('Dictionary ready!');
        setLoadingProgress(100);
        console.log('Dictionary database initialized successfully');
        console.log(`Total words in database: ${stats.totalWords}`);

        // Debug: Show sample words
        await dictionaryDatabaseService.getSampleWords(10);

      } catch (err) {
        console.error('Failed to initialize dictionary database:', err);
        setError(err.message || 'Failed to initialize dictionary database');
        setLoadingMessage('Error loading dictionary');
      } finally {
        setLoading(false);
        setLoadingProgress(0);
      }
    };

    initializeDictionary();
  }, []);

  // Search function
  const searchWords = async (searchTerm, limit = 50) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return [];
    }

    try {
      setIsSearching(true);
      const results = await dictionaryDatabaseService.searchWords(searchTerm, limit);
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Search error:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Load more words function
  const loadMoreWords = async (offset = words.length, limit = 100) => {
    try {
      const wordsData = await dictionaryDatabaseService.getAllWords(offset, limit);
      if (wordsData.words.length > 0) {
        setWords(prev => [...prev, ...wordsData.words]);
      }
      return wordsData;
    } catch (err) {
      console.error('Error loading more words:', err);
      return { words: [], hasMore: false };
    }
  };

  // Get word by name from database
  const getWordByName = async (wordName) => {
    try {
      return await dictionaryDatabaseService.getWordByName(wordName);
    } catch (err) {
      console.error('Error getting word:', err);
      return null;
    }
  };

  // Get words by difficulty
  const getWordsByDifficulty = async (difficulty, limit = 100) => {
    try {
      return await dictionaryDatabaseService.getWordsByDifficulty(difficulty, limit);
    } catch (err) {
      console.error('Error getting words by difficulty:', err);
      return [];
    }
  };

  // Get words by category
  const getWordsByCategory = async (category, limit = 100) => {
    try {
      return await dictionaryDatabaseService.getWordsByCategory(category, limit);
    } catch (err) {
      console.error('Error getting words by category:', err);
      return [];
    }
  };

  const value = {
    // State
    words,
    loading,
    error,
    searchResults,
    isSearching,
    categories,
    dbStats,
    loadingProgress,
    loadingMessage,

    // Database functions
    searchWords,
    loadMoreWords,
    getWordByName,
    getWordsByDifficulty,
    getWordsByCategory,

    // Utility methods
    totalWords: dbStats?.totalWords || words.length,
    getAvailableLetters: () => {
      const letters = new Set(words.map(word => word.letter || word.word[0].toUpperCase()));
      return Array.from(letters).sort();
    },
    getAvailableComplexities: () => {
      const complexities = new Set(words.map(word => word.complexity || word.difficulty).filter(Boolean));
      return Array.from(complexities).sort();
    },
    getAvailablePartsOfSpeech: () => {
      const partsOfSpeech = new Set();
      words.forEach(word => {
        if (word.meanings && word.meanings.length > 0) {
          word.meanings.forEach(meaning => {
            if (meaning.part_of_speech) {
              partsOfSpeech.add(meaning.part_of_speech);
            }
          });
        }
        // Also check for direct partOfSpeech field
        if (word.partOfSpeech) {
          partsOfSpeech.add(word.partOfSpeech);
        }
      });
      return Array.from(partsOfSpeech).sort();
    },

    // Database service access
    databaseService: dictionaryDatabaseService
  };

  // Show loading screen while dictionary is loading
  if (loading) {
    return (
      <DictionaryContext.Provider value={value}>
        <LoadingSpinner
          message={loadingMessage || "Initializing Dictionary Database..."}
          variant="card"
          size="large"
          fullHeight={true}
          progress={loadingProgress}
        />
      </DictionaryContext.Provider>
    );
  }

  // Show error screen if dictionary failed to load
  if (error) {
    return (
      <DictionaryContext.Provider value={value}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h2 style={{ color: '#d32f2f' }}>Failed to Initialize Dictionary Database</h2>
            <p style={{ color: '#666' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </DictionaryContext.Provider>
    );
  }

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
};
