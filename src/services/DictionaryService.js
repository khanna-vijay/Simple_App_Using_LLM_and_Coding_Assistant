/**
 * Dictionary Service - Handles loading and processing of the English dictionary data
 */

/**
 * Loads the dictionary JSON file and transforms nested structure to flat array
 * @returns {Promise<Array>} Flattened array of word objects
 */
export const loadDictionary = async () => {
  try {
    // Import the JSON file
    const dictionaryData = await import('../assets/99_02_comprehensive_english_dict.json');
    
    // Transform nested structure to flat array
    const flattenedWords = [];
    
    // Iterate through each letter
    Object.keys(dictionaryData.default).forEach(letter => {
      const letterData = dictionaryData.default[letter];
      
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
    
    console.log(`Loaded ${flattenedWords.length} words from dictionary`);
    return flattenedWords;
    
  } catch (error) {
    console.error('Error loading dictionary:', error);
    throw new Error('Failed to load dictionary data');
  }
};

/**
 * Filters words by starting letter
 * @param {Array} words - Array of word objects
 * @param {string} letter - Letter to filter by
 * @returns {Array} Filtered array of words
 */
export const getWordsByLetter = (words, letter) => {
  if (!words || !letter) return [];
  return words.filter(word => word.letter.toLowerCase() === letter.toLowerCase());
};

/**
 * Filters words by complexity level
 * @param {Array} words - Array of word objects
 * @param {string} complexity - Complexity level ("Advanced", "Intermediate")
 * @returns {Array} Filtered array of words
 */
export const getWordsByComplexity = (words, complexity) => {
  if (!words || !complexity) return [];
  return words.filter(word => word.complexity === complexity);
};

/**
 * Returns all words (for searching)
 * @param {Array} words - Array of word objects
 * @returns {Array} Complete array of words
 */
export const getAllWords = (words) => {
  return words || [];
};

/**
 * Performs case-insensitive search across word names and definitions
 * @param {Array} words - Array of word objects
 * @param {string} query - Search query
 * @returns {Array} Filtered array of matching words
 */
export const searchWords = (words, query) => {
  if (!words || !query || query.trim() === '') return words;
  
  const searchTerm = query.toLowerCase().trim();
  
  return words.filter(word => {
    // Search in word name
    if (word.word.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in definitions
    if (word.meanings && Array.isArray(word.meanings)) {
      for (const meaning of word.meanings) {
        if (meaning.definitions && Array.isArray(meaning.definitions)) {
          for (const definition of meaning.definitions) {
            if (definition.definition && 
                definition.definition.toLowerCase().includes(searchTerm)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  });
};

/**
 * Generates multiple choice options for quizzes
 * @param {Array} words - Array of word objects
 * @param {Object} correctWord - The correct word object
 * @param {number} count - Number of choices to generate (default: 4)
 * @returns {Array} Array of choice objects with correct and incorrect options
 */
export const generateQuizChoices = (words, correctWord, count = 4) => {
  if (!words || !correctWord || words.length < count) {
    throw new Error('Insufficient words to generate quiz choices');
  }
  
  const choices = [];
  
  // Add the correct answer
  const correctDefinition = getFirstDefinition(correctWord);
  choices.push({
    text: correctDefinition,
    isCorrect: true,
    word: correctWord.word
  });
  
  // Generate incorrect choices
  const availableWords = words.filter(word => word.word !== correctWord.word);
  const shuffledWords = shuffleArray([...availableWords]);
  
  for (let i = 0; i < count - 1 && i < shuffledWords.length; i++) {
    const incorrectWord = shuffledWords[i];
    const incorrectDefinition = getFirstDefinition(incorrectWord);
    
    choices.push({
      text: incorrectDefinition,
      isCorrect: false,
      word: incorrectWord.word
    });
  }
  
  // Shuffle the choices so correct answer isn't always first
  return shuffleArray(choices);
};

/**
 * Helper function to get the first definition of a word
 * @param {Object} word - Word object
 * @returns {string} First definition found
 */
const getFirstDefinition = (word) => {
  if (word.meanings && Array.isArray(word.meanings) && word.meanings.length > 0) {
    const firstMeaning = word.meanings[0];
    if (firstMeaning.definitions && Array.isArray(firstMeaning.definitions) && 
        firstMeaning.definitions.length > 0) {
      return firstMeaning.definitions[0].definition || 'No definition available';
    }
  }
  return 'No definition available';
};

/**
 * Helper function to shuffle an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
