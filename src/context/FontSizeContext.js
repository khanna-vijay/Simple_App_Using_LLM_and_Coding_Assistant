import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Font Size Context
 * Manages global font size settings across the application
 */
const FontSizeContext = createContext();

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const FontSizeProvider = ({ children }) => {
  // Initialize font size from localStorage or default to 1
  const [fontSize, setFontSize] = useState(() => {
    try {
      const savedFontSize = localStorage.getItem('englishLeap_fontSize');
      return savedFontSize ? parseFloat(savedFontSize) : 1;
    } catch (error) {
      console.error('Error reading font size from localStorage:', error);
      return 1;
    }
  });

  // Save font size to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('englishLeap_fontSize', fontSize.toString());
    } catch (error) {
      console.error('Error saving font size to localStorage:', error);
    }
  }, [fontSize]);

  // Font size control functions
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 0.1, 2)); // Max 2x
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 0.1, 0.5)); // Min 0.5x
  };

  const resetFontSize = () => {
    setFontSize(1);
  };

  const setCustomFontSize = (size) => {
    const clampedSize = Math.max(0.5, Math.min(2, size));
    setFontSize(clampedSize);
  };

  const value = {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setCustomFontSize,
    // Helper properties
    canIncrease: fontSize < 2,
    canDecrease: fontSize > 0.5,
    percentage: Math.round(fontSize * 100)
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};

export default FontSizeContext;
