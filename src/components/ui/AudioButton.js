import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import { AUDIO_TYPES } from '../../services/AudioService';

/**
 * Audio Button Component
 * Provides audio playback controls for words
 */
const AudioButton = ({
  word,
  type = AUDIO_TYPES.PRONUNCIATION,
  variant = 'icon', // 'icon', 'button', 'compact'
  size = 'medium',
  showLabel = false,
  disabled = false,
  color = 'primary',
  sx = {}
}) => {
  const {
    playAudio,
    stopAudio,
    isPlaying,
    audioEnabled,
    isCurrentlyPlaying,
    checkAudioAvailable
  } = useAudio();

  const [audioAvailable, setAudioAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if audio is available for this word
  useEffect(() => {
    const checkAudio = async () => {
      if (!word) return;
      
      setLoading(true);
      try {
        const available = await checkAudioAvailable(word, type);
        setAudioAvailable(available);
      } catch (error) {
        console.error('Error checking audio availability:', error);
        setAudioAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkAudio();
  }, [word, type, checkAudioAvailable]);

  const isCurrentPlaying = isCurrentlyPlaying(word, type);

  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent event bubbling

    if (isCurrentPlaying) {
      stopAudio();
    } else {
      console.log('Attempting to play audio for:', word, type); // Debug log
      const result = await playAudio(word, type);
      if (!result.success) {
        console.error('Failed to play audio:', result.error);
        console.error('Word:', word, 'Type:', type); // Additional debug info
      } else {
        console.log('Audio played successfully for:', word, type);
      }
    }
  };

  const getTooltipText = () => {
    if (!audioEnabled) return 'Audio disabled';
    if (!audioAvailable) return 'Audio not available';
    if (isCurrentPlaying) return `Stop ${type === AUDIO_TYPES.PRONUNCIATION ? 'pronunciation' : 'example'}`;
    return `Play ${type === AUDIO_TYPES.PRONUNCIATION ? 'pronunciation' : 'example'}`;
  };

  const getIcon = () => {
    if (loading) return <CircularProgress size={16} />;
    if (!audioEnabled) return <VolumeOffIcon />;
    if (!audioAvailable) return <VolumeOffIcon sx={{ opacity: 0.3 }} />;
    if (isCurrentPlaying) return <StopIcon />;
    return <VolumeUpIcon />;
  };

  const getLabel = () => {
    if (type === AUDIO_TYPES.PRONUNCIATION) return 'Word Pronunciation';
    if (type === AUDIO_TYPES.EXAMPLE) return 'Meaning and Example';
    return 'Audio';
  };

  const isDisabled = disabled || loading || !audioEnabled || !audioAvailable;

  if (variant === 'button') {
    return (
      <Button
        variant="outlined"
        size={size}
        startIcon={getIcon()}
        onClick={handleClick}
        disabled={isDisabled}
        color={color}
        sx={{
          textTransform: 'none',
          ...sx
        }}
      >
        {showLabel && getLabel()}
        {isCurrentPlaying && 'Stop'}
        {!isCurrentPlaying && !showLabel && 'Play'}
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: isDisabled ? 'default' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          '&:hover': !isDisabled && {
            '& .audio-icon': {
              color: `${color}.main`,
            }
          },
          ...sx
        }}
        onClick={!isDisabled ? handleClick : undefined}
      >
        <Box className="audio-icon" sx={{ display: 'flex', alignItems: 'center' }}>
          {getIcon()}
        </Box>
        {showLabel && (
          <Typography variant="caption" color="text.secondary">
            {getLabel()}
          </Typography>
        )}
      </Box>
    );
  }

  // Default icon variant
  return (
    <Tooltip title={getTooltipText()}>
      <span>
        <IconButton
          onClick={handleClick}
          disabled={isDisabled}
          size={size}
          color={color}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': !isDisabled && {
              transform: 'scale(1.1)',
            },
            ...sx
          }}
        >
          {getIcon()}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default AudioButton;
