/**
 * Dictionary Database Service for English Leap
 * Handles dictionary data storage and retrieval using IndexedDB
 */

const DB_NAME = 'EnglishLeapDictionaryDB';
const DB_VERSION = 2;

// Object stores for dictionary data
const DICTIONARY_STORES = {
  WORDS: 'words',
  WORD_SEARCH: 'wordSearch',
  CATEGORIES: 'categories',
  METADATA: 'metadata'
};

class DictionaryDatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the dictionary database
   */
  async init() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Dictionary database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Dictionary database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        console.log('Dictionary database upgrade needed');

        // Create words store with optimized indexes
        if (!this.db.objectStoreNames.contains(DICTIONARY_STORES.WORDS)) {
          const wordsStore = this.db.createObjectStore(DICTIONARY_STORES.WORDS, {
            keyPath: 'id',
            autoIncrement: true
          });
          
          // Create indexes for fast retrieval
          wordsStore.createIndex('word', 'word', { unique: true });
          wordsStore.createIndex('wordLowercase', 'wordLowercase', { unique: true });
          wordsStore.createIndex('difficulty', 'difficulty', { unique: false });
          wordsStore.createIndex('category', 'category', { unique: false });
          wordsStore.createIndex('partOfSpeech', 'partOfSpeech', { unique: false });
          wordsStore.createIndex('wordLength', 'wordLength', { unique: false });
          wordsStore.createIndex('frequency', 'frequency', { unique: false });
        }

        // Create word search store for full-text search optimization
        if (!this.db.objectStoreNames.contains(DICTIONARY_STORES.WORD_SEARCH)) {
          const searchStore = this.db.createObjectStore(DICTIONARY_STORES.WORD_SEARCH, {
            keyPath: 'id',
            autoIncrement: true
          });
          
          searchStore.createIndex('searchTerm', 'searchTerm', { unique: false });
          searchStore.createIndex('wordId', 'wordId', { unique: false });
        }

        // Create categories store
        if (!this.db.objectStoreNames.contains(DICTIONARY_STORES.CATEGORIES)) {
          const categoriesStore = this.db.createObjectStore(DICTIONARY_STORES.CATEGORIES, {
            keyPath: 'name'
          });
          
          categoriesStore.createIndex('wordCount', 'wordCount', { unique: false });
        }

        // Create metadata store
        if (!this.db.objectStoreNames.contains(DICTIONARY_STORES.METADATA)) {
          const metadataStore = this.db.createObjectStore(DICTIONARY_STORES.METADATA, {
            keyPath: 'key'
          });
        }
      };
    });
  }

  /**
   * Clear all dictionary data and force reload
   */
  async clearDictionaryData() {
    try {
      await this.init();

      // Clear all stores
      const transaction = this.db.transaction([
        DICTIONARY_STORES.WORDS,
        DICTIONARY_STORES.CATEGORIES,
        DICTIONARY_STORES.METADATA
      ], 'readwrite');

      await Promise.all([
        this.clearStore(transaction.objectStore(DICTIONARY_STORES.WORDS)),
        this.clearStore(transaction.objectStore(DICTIONARY_STORES.CATEGORIES)),
        this.clearStore(transaction.objectStore(DICTIONARY_STORES.METADATA))
      ]);

      console.log('Dictionary data cleared successfully');
    } catch (error) {
      console.error('Error clearing dictionary data:', error);
      throw error;
    }
  }

  /**
   * Clear a specific object store
   */
  async clearStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load dictionary data from JSON file and store in database
   */
  async loadDictionaryFromFile(filePath = '/data/dictionary.json', progressCallback = null) {
    try {
      await this.init();

      // Check if data is already loaded
      const metadata = await this.getMetadata('dataLoaded');
      if (metadata && metadata.value) {
        console.log('Dictionary data already loaded');
        return;
      }

      console.log('Loading dictionary data from file...');

      // Try to fetch the dictionary file
      let dictionaryData;
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('Received HTML instead of JSON - file not found');
        }

        const rawDictionaryData = JSON.parse(text);

        // Transform nested structure to flat array (similar to DictionaryService.js)
        dictionaryData = this.transformNestedDictionaryData(rawDictionaryData);
      } catch (fetchError) {
        console.warn('Failed to load from file, using fallback data:', fetchError.message);

        // Use fallback sample data
        dictionaryData = this.getFallbackDictionaryData();
      }

      await this.storeDictionaryData(dictionaryData, progressCallback);

      // Mark data as loaded
      await this.setMetadata('dataLoaded', true);
      await this.setMetadata('loadedAt', new Date().toISOString());
      await this.setMetadata('totalWords', dictionaryData.length);
      await this.setMetadata('dataSource', dictionaryData.length > 100 ? 'file' : 'fallback');
      await this.setMetadata('dbVersion', DB_VERSION);

      console.log(`Dictionary data loaded successfully: ${dictionaryData.length} words`);
    } catch (error) {
      console.error('Error loading dictionary from file:', error);
      throw error;
    }
  }

  /**
   * Transform nested dictionary structure to flat array
   * @param {Object} nestedData - Nested dictionary data with letters as keys
   * @returns {Array} Flattened array of word objects
   */
  transformNestedDictionaryData(nestedData) {
    const flattenedWords = [];

    // Iterate through each letter
    Object.keys(nestedData).forEach(letter => {
      const letterData = nestedData[letter];

      // Skip if no words property or if it's metadata
      if (!letterData.words) return;

      // Iterate through words in this letter
      Object.keys(letterData.words).forEach(wordName => {
        const wordData = letterData.words[wordName];

        // Create flattened word object
        const flattenedWord = {
          word: wordName,
          letter: letter,
          ...wordData
        };

        flattenedWords.push(flattenedWord);
      });
    });

    console.log(`Transformed ${flattenedWords.length} words from nested structure`);
    return flattenedWords;
  }

  /**
   * Get fallback dictionary data when JSON file is not available
   */
  getFallbackDictionaryData() {
    return [
      {
        word: "hello",
        definition: "A greeting used when meeting someone or answering the phone",
        partOfSpeech: "interjection",
        difficulty: "beginner",
        category: "greetings",
        examples: ["Hello, how are you?", "She said hello to her neighbor"],
        synonyms: ["hi", "greetings", "salutations"]
      },
      {
        word: "beautiful",
        definition: "Pleasing the senses or mind aesthetically",
        partOfSpeech: "adjective",
        difficulty: "intermediate",
        category: "descriptive",
        examples: ["The sunset was beautiful", "She has a beautiful voice"],
        synonyms: ["lovely", "gorgeous", "stunning", "attractive"]
      },
      {
        word: "knowledge",
        definition: "Facts, information, and skills acquired through experience or education",
        partOfSpeech: "noun",
        difficulty: "intermediate",
        category: "education",
        examples: ["Knowledge is power", "He has extensive knowledge of history"],
        synonyms: ["information", "understanding", "wisdom", "learning"]
      },
      {
        word: "adventure",
        definition: "An unusual and exciting or daring experience",
        partOfSpeech: "noun",
        difficulty: "intermediate",
        category: "experience",
        examples: ["Their trip was a great adventure", "He loves adventure stories"],
        synonyms: ["journey", "expedition", "quest", "exploration"]
      },
      {
        word: "magnificent",
        definition: "Extremely beautiful, elaborate, or impressive",
        partOfSpeech: "adjective",
        difficulty: "advanced",
        category: "descriptive",
        examples: ["The palace was magnificent", "A magnificent performance"],
        synonyms: ["splendid", "grand", "superb", "majestic"]
      },
      {
        word: "perseverance",
        definition: "Persistence in doing something despite difficulty or delay in achieving success",
        partOfSpeech: "noun",
        difficulty: "advanced",
        category: "character",
        examples: ["Success requires perseverance", "Her perseverance paid off"],
        synonyms: ["persistence", "determination", "tenacity", "resolve"]
      },
      {
        word: "serendipity",
        definition: "The occurrence and development of events by chance in a happy or beneficial way",
        partOfSpeech: "noun",
        difficulty: "expert",
        category: "abstract",
        examples: ["Meeting her was pure serendipity", "Life is full of serendipity"],
        synonyms: ["chance", "fortune", "luck", "coincidence"]
      },
      {
        word: "ephemeral",
        definition: "Lasting for a very short time",
        partOfSpeech: "adjective",
        difficulty: "expert",
        category: "time",
        examples: ["The beauty of cherry blossoms is ephemeral", "Fame can be ephemeral"],
        synonyms: ["temporary", "fleeting", "transient", "momentary"]
      },
      {
        word: "ubiquitous",
        definition: "Present, appearing, or found everywhere",
        partOfSpeech: "adjective",
        difficulty: "expert",
        category: "descriptive",
        examples: ["Smartphones are ubiquitous today", "The ubiquitous presence of technology"],
        synonyms: ["omnipresent", "pervasive", "universal", "widespread"]
      },
      {
        word: "mellifluous",
        definition: "Sweet or musical; pleasant to hear",
        partOfSpeech: "adjective",
        difficulty: "expert",
        category: "sound",
        examples: ["Her mellifluous voice captivated the audience", "The mellifluous tones of the violin"],
        synonyms: ["melodious", "harmonious", "sweet-sounding", "musical"]
      }
    ];
  }

  /**
   * Store dictionary data in optimized format
   */
  async storeDictionaryData(words, progressCallback = null) {
    await this.init();

    console.log(`Storing ${words.length} words in database...`);

    // Process in batches to avoid blocking the UI
    const batchSize = 100;
    const categories = new Map();

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      await this.processBatch(batch, categories);

      // Update progress
      const progress = Math.round(((i + batch.length) / words.length) * 100);
      console.log(`Processing dictionary: ${progress}% complete`);

      // Call progress callback if provided
      if (progressCallback) {
        progressCallback(progress, `Processing dictionary: ${progress}% complete`);
      }
    }

    // Store categories
    await this.storeCategories(categories);

    console.log('Dictionary data stored successfully');
  }

  /**
   * Process a batch of words
   */
  async processBatch(batch, categories) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([
        DICTIONARY_STORES.WORDS,
        DICTIONARY_STORES.WORD_SEARCH
      ], 'readwrite');

      const wordsStore = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const searchStore = transaction.objectStore(DICTIONARY_STORES.WORD_SEARCH);

      let completed = 0;
      const total = batch.length;

      batch.forEach(wordData => {
        // Enhance word data with computed fields
        const enhancedWord = {
          ...wordData,
          wordLowercase: wordData.word ? wordData.word.toLowerCase() : '',
          wordLength: wordData.word ? wordData.word.length : 0,
          searchableText: this.createSearchableText(wordData),
          createdAt: new Date().toISOString()
        };

        // Store the word
        const wordRequest = wordsStore.add(enhancedWord);

        wordRequest.onsuccess = () => {
          const wordId = wordRequest.result;

          // Create search entries for fast text search
          const searchTerms = this.generateSearchTerms(wordData);
          let searchCompleted = 0;

          if (searchTerms.length === 0) {
            completed++;
            if (completed === total) resolve();
            return;
          }

          searchTerms.forEach(term => {
            const searchRequest = searchStore.add({
              searchTerm: term.toLowerCase(),
              wordId: wordId,
              type: 'word'
            });

            searchRequest.onsuccess = () => {
              searchCompleted++;
              if (searchCompleted === searchTerms.length) {
                completed++;
                if (completed === total) resolve();
              }
            };
          });
        };

        wordRequest.onerror = () => {
          console.error('Error storing word:', wordData.word);
          completed++;
          if (completed === total) resolve();
        };

        // Track categories
        if (wordData.category) {
          const category = wordData.category;
          if (categories.has(category)) {
            categories.set(category, categories.get(category) + 1);
          } else {
            categories.set(category, 1);
          }
        }
      });

      transaction.onerror = () => {
        console.error('Transaction error in batch processing');
        reject(transaction.error);
      };
    });
  }

  /**
   * Store categories
   */
  async storeCategories(categories) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.CATEGORIES], 'readwrite');
      const categoriesStore = transaction.objectStore(DICTIONARY_STORES.CATEGORIES);

      let completed = 0;
      const total = categories.size;

      if (total === 0) {
        resolve();
        return;
      }

      categories.forEach((count, name) => {
        const request = categoriesStore.add({
          name: name,
          wordCount: count,
          createdAt: new Date().toISOString()
        });

        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };

        request.onerror = () => {
          console.error('Error storing category:', name);
          completed++;
          if (completed === total) resolve();
        };
      });

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * Create searchable text from word data
   */
  createSearchableText(wordData) {
    const searchParts = [
      wordData.word,
      wordData.definition,
      wordData.partOfSpeech,
      wordData.category,
      ...(wordData.synonyms || []),
      ...(wordData.examples || [])
    ].filter(Boolean);

    return searchParts.join(' ').toLowerCase();
  }

  /**
   * Generate search terms for a word
   */
  generateSearchTerms(wordData) {
    const terms = new Set();
    
    // Add the word itself
    terms.add(wordData.word);
    
    // Add word prefixes (for autocomplete)
    for (let i = 1; i <= wordData.word.length; i++) {
      terms.add(wordData.word.substring(0, i));
    }
    
    // Add definition words
    if (wordData.definition) {
      const definitionWords = wordData.definition.toLowerCase().split(/\s+/);
      definitionWords.forEach(word => {
        if (word.length > 2) {
          terms.add(word.replace(/[^\w]/g, ''));
        }
      });
    }
    
    // Add synonyms
    if (wordData.synonyms) {
      wordData.synonyms.forEach(synonym => terms.add(synonym));
    }
    
    return Array.from(terms).filter(term => term.length > 0);
  }

  /**
   * Get all words with pagination
   */
  async getAllWords(offset = 0, limit = 100) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allWords = request.result;
        const paginatedWords = allWords.slice(offset, offset + limit);
        resolve({
          words: paginatedWords,
          total: allWords.length,
          offset: offset,
          limit: limit,
          hasMore: offset + limit < allWords.length
        });
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get word by exact match (case-insensitive)
   */
  async getWordByName(wordName) {
    await this.init();

    console.log(`Looking up word: "${wordName}"`);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.WORDS);

      // Try multiple approaches to find the word
      const searchKey = wordName.toLowerCase();
      console.log(`Searching for lowercase key: "${searchKey}"`);

      // First try the wordLowercase index
      try {
        const index = store.index('wordLowercase');
        const request = index.get(searchKey);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            console.log(`Word found via wordLowercase index:`, result);
            resolve(result);
            return;
          }

          // If not found via index, try scanning all words
          console.log(`Word not found via index, scanning all words...`);
          const allWordsRequest = store.getAll();

          allWordsRequest.onsuccess = () => {
            const allWords = allWordsRequest.result;
            const foundWord = allWords.find(word =>
              word.word && word.word.toLowerCase() === searchKey
            );

            console.log(`Word lookup result for "${wordName}":`, foundWord || null);
            resolve(foundWord || null);
          };

          allWordsRequest.onerror = () => {
            console.error(`Error scanning all words for "${wordName}":`, allWordsRequest.error);
            resolve(null);
          };
        };

        request.onerror = () => {
          console.error(`Error with wordLowercase index for "${wordName}":`, request.error);
          resolve(null);
        };
      } catch (indexError) {
        console.error(`wordLowercase index not available, falling back to scan:`, indexError);

        // Fallback to scanning all words
        const allWordsRequest = store.getAll();

        allWordsRequest.onsuccess = () => {
          const allWords = allWordsRequest.result;
          const foundWord = allWords.find(word =>
            word.word && word.word.toLowerCase() === searchKey
          );

          console.log(`Word lookup result (fallback) for "${wordName}":`, foundWord || null);
          resolve(foundWord || null);
        };

        allWordsRequest.onerror = () => {
          console.error(`Error in fallback scan for "${wordName}":`, allWordsRequest.error);
          reject(allWordsRequest.error);
        };
      }
    });
  }

  /**
   * Search words by term
   */
  async searchWords(searchTerm, limit = 50) {
    await this.init();
    
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS, DICTIONARY_STORES.WORD_SEARCH], 'readonly');
      const wordsStore = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const searchStore = transaction.objectStore(DICTIONARY_STORES.WORD_SEARCH);
      
      // First, find matching search terms
      const searchIndex = searchStore.index('searchTerm');
      const searchRequest = searchIndex.getAll(IDBKeyRange.bound(normalizedTerm, normalizedTerm + '\uffff'));
      
      searchRequest.onsuccess = () => {
        const searchResults = searchRequest.result;
        const wordIds = [...new Set(searchResults.map(result => result.wordId))];
        
        // Get the actual words
        const words = [];
        let completed = 0;
        
        if (wordIds.length === 0) {
          resolve([]);
          return;
        }
        
        wordIds.slice(0, limit).forEach(wordId => {
          const wordRequest = wordsStore.get(wordId);
          wordRequest.onsuccess = () => {
            if (wordRequest.result) {
              words.push(wordRequest.result);
            }
            completed++;
            
            if (completed === Math.min(wordIds.length, limit)) {
              // Sort by relevance (exact matches first, then by word length)
              words.sort((a, b) => {
                const aExact = a.word.toLowerCase().startsWith(normalizedTerm) ? 0 : 1;
                const bExact = b.word.toLowerCase().startsWith(normalizedTerm) ? 0 : 1;
                
                if (aExact !== bExact) return aExact - bExact;
                return a.word.length - b.word.length;
              });
              
              resolve(words);
            }
          };
        });
      };

      searchRequest.onerror = () => {
        reject(searchRequest.error);
      };
    });
  }

  /**
   * Get words by difficulty
   */
  async getWordsByDifficulty(difficulty, limit = 100) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const index = store.index('difficulty');
      const request = index.getAll(difficulty);

      request.onsuccess = () => {
        const words = request.result.slice(0, limit);
        resolve(words);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get words by category
   */
  async getWordsByCategory(category, limit = 100) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => {
        const words = request.result.slice(0, limit);
        resolve(words);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all categories
   */
  async getAllCategories() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.CATEGORIES], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.CATEGORIES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get metadata
   */
  async getMetadata(key) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.METADATA], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.METADATA);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Set metadata
   */
  async setMetadata(key, value) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(DICTIONARY_STORES.METADATA);
      const request = store.put({
        key: key,
        value: value,
        updatedAt: new Date().toISOString()
      });

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Debug: Get sample words from database
   */
  async getSampleWords(limit = 10) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DICTIONARY_STORES.WORDS], 'readonly');
      const store = transaction.objectStore(DICTIONARY_STORES.WORDS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allWords = request.result;
        const sampleWords = allWords.slice(0, limit).map(word => ({
          word: word.word,
          wordLowercase: word.wordLowercase,
          letter: word.letter
        }));
        console.log('Sample words in database:', sampleWords);
        resolve(sampleWords);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get database statistics
   */
  async getStatistics() {
    await this.init();

    const [totalWords, categories, loadedAtMeta, dataSourceMeta] = await Promise.all([
      this.getAllWords(0, 1),
      this.getAllCategories(),
      this.getMetadata('loadedAt'),
      this.getMetadata('dataSource')
    ]);

    return {
      totalWords: totalWords.total,
      totalCategories: categories.length,
      loadedAt: loadedAtMeta?.value,
      dataSource: dataSourceMeta?.value || 'unknown',
      isLoaded: totalWords.total > 0
    };
  }

  /**
   * Clear all dictionary data
   */
  async clearAllData() {
    await this.init();
    
    const stores = Object.values(DICTIONARY_STORES);
    
    return Promise.all(stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }
}

// Create singleton instance
const dictionaryDatabaseService = new DictionaryDatabaseService();

export default dictionaryDatabaseService;
