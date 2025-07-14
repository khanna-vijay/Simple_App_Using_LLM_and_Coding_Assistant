import React from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProgressContext } from '../context/UserProgressContext';

/**
 * Test component to verify dictionary and user progress functionality
 */
const TestComponent = () => {
  const { words, loading, error, totalWords } = useDictionary();
  const { knownWords, struggledWords, markAsKnown, addStruggledWord, getStatistics } = useUserProgressContext();

  if (loading) {
    return <div>Loading dictionary...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const stats = getStatistics();
  const sampleWords = words.slice(0, 5); // First 5 words for testing

  const handleMarkKnown = (word) => {
    markAsKnown(word.word);
  };

  const handleMarkStruggled = (word) => {
    addStruggledWord(word.word);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>English Leap - Dictionary Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Dictionary Status</h2>
        <p>Total words loaded: {totalWords}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>User Progress Statistics</h2>
        <p>Mastered words: {stats.totalKnownWords}</p>
        <p>Struggled words: {stats.totalStruggledWords}</p>
        <p>Total quizzes taken: {stats.totalQuizzes}</p>
        <p>Average score: {stats.averageScore}%</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Sample Words (First 5)</h2>
        {sampleWords.map((word, index) => (
          <div key={index} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '10px 0',
            borderRadius: '5px'
          }}>
            <h3>{word.word} ({word.letter}) - {word.complexity}</h3>
            <p><strong>Pronunciation:</strong> {word.phonetic_respelling}</p>
            {word.meanings && word.meanings[0] && word.meanings[0].definitions && (
              <p><strong>Definition:</strong> {word.meanings[0].definitions[0].definition}</p>
            )}
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => handleMarkKnown(word)}
                style={{ 
                  marginRight: '10px', 
                  padding: '5px 10px',
                  backgroundColor: knownWords.includes(word.word) ? '#4CAF50' : '#f0f0f0',
                  color: knownWords.includes(word.word) ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                {knownWords.includes(word.word) ? 'Mastered ✓' : 'Mark as Mastered'}
              </button>
              <button 
                onClick={() => handleMarkStruggled(word)}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: struggledWords.includes(word.word) ? '#f44336' : '#f0f0f0',
                  color: struggledWords.includes(word.word) ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                {struggledWords.includes(word.word) ? 'Struggled ✗' : 'Mark as Struggled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2>Mastered Words List</h2>
        <p>{knownWords.length > 0 ? knownWords.join(', ') : 'No mastered words yet'}</p>
        
        <h2>Struggled Words List</h2>
        <p>{struggledWords.length > 0 ? struggledWords.join(', ') : 'No struggled words yet'}</p>
      </div>
    </div>
  );
};

export default TestComponent;
