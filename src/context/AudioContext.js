import React, { createContext, useContext, useState, useEffect } from 'react';
import audioService, { AVAILABLE_VOICES, AUDIO_TYPES } from '../services/AudioService';

/**
 * Audio Context - Provides audio functionality throughout the application
 */
const AudioContext = createContext();

/**
 * Custom hook to use the Audio Context
 */
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

/**
 * Audio Provider Component
 */
export const AudioProvider = ({ children }) => {
  const [selectedVoice, setSelectedVoice] = useState(audioService.getCurrentVoice());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentType, setCurrentType] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Update audio service when voice changes
  useEffect(() => {
    audioService.setVoice(selectedVoice);
  }, [selectedVoice]);

  // Check playing status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const playing = audioService.getIsPlaying();
      if (playing !== isPlaying) {
        setIsPlaying(playing);
        if (!playing) {
          setCurrentWord(null);
          setCurrentType(null);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  /**
   * Play audio for a word
   */
  const playAudio = async (word, type = AUDIO_TYPES.PRONUNCIATION) => {
    if (!audioEnabled) return { success: false, error: 'Audio disabled' };

    try {
      setCurrentWord(word);
      setCurrentType(type);
      setIsPlaying(true);

      const result = await audioService.playAudio(word, type);
      
      if (!result.success) {
        setIsPlaying(false);
        setCurrentWord(null);
        setCurrentType(null);
      }

      return result;
    } catch (error) {
      setIsPlaying(false);
      setCurrentWord(null);
      setCurrentType(null);
      return { success: false, error: error.message };
    }
  };

  /**
   * Stop currently playing audio
   */
  const stopAudio = () => {
    audioService.stopAudio();
    setIsPlaying(false);
    setCurrentWord(null);
    setCurrentType(null);
  };

  /**
   * Change voice selection
   */
  const changeVoice = (voiceId) => {
    setSelectedVoice(voiceId);
    // Stop current audio when changing voice
    if (isPlaying) {
      stopAudio();
    }
  };

  /**
   * Toggle audio enabled/disabled
   */
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem('englishLeap_audioEnabled', newState.toString());
    
    if (!newState && isPlaying) {
      stopAudio();
    }
  };

  /**
   * Check if audio is available for a word
   */
  const checkAudioAvailable = async (word, type = AUDIO_TYPES.PRONUNCIATION) => {
    return await audioService.checkAudioExists(word, type);
  };

  /**
   * Get available audio types for a word
   */
  const getAvailableAudioTypes = async (word) => {
    return await audioService.getAvailableAudioTypes(word);
  };

  /**
   * Get voice information
   */
  const getVoiceInfo = (voiceId) => {
    return audioService.getVoiceInfo(voiceId);
  };

  // Initialize audio enabled state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('englishLeap_audioEnabled');
    if (stored !== null) {
      setAudioEnabled(stored === 'true');
    }
  }, []);

  const value = {
    // State
    selectedVoice,
    isPlaying,
    currentWord,
    currentType,
    audioEnabled,
    availableVoices: AVAILABLE_VOICES,
    audioTypes: AUDIO_TYPES,

    // Functions
    playAudio,
    stopAudio,
    changeVoice,
    toggleAudio,
    checkAudioAvailable,
    getAvailableAudioTypes,
    getVoiceInfo,

    // Utilities
    isCurrentlyPlaying: (word, type) => 
      isPlaying && currentWord === word && currentType === type,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
